from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
import json

from pydantic import BaseModel

from pathlib import Path
import shutil
import asyncio
import logging

from service import run_import, get_progress as service_get_progress, pause_event, get_error_list

from typing import List
from datetime import datetime

app = FastAPI()
current_run_task: asyncio.Task | None = None

def task_done_callback(task: asyncio.Task):
    global current_run_task
    current_run_task = None

#PAGINATION FOR DOWNLOADED ITEMS
class DownloadedItemDTO(BaseModel):
    filename: str
    date: datetime
    media_type: str
class DownloadedItemsPage(BaseModel):
    items: List[DownloadedItemDTO]
    total: int
    offset: int
    limit: int


# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    app.state.downloaded_items = []
    app.state.downloaded_items_lock = asyncio.Lock()
    app.state.failed_items = {}  # {filename: reason}
    app.state.failed_items_lock = asyncio.Lock()


# --- Setup folders ---
def setup_directories(output_path: str | None = None):
    # Base folder
    base_path = Path(output_path).expanduser().resolve() if output_path else Path.home()
    
    # Root folder
    root_dir = base_path / "SnapchatExporter"
    root_dir.mkdir(parents=True, exist_ok=True)

    # Subfolders
    uploads = root_dir / "uploads"
    downloads = root_dir / "downloads"
    uploads.mkdir(parents=True, exist_ok=True)
    downloads.mkdir(parents=True, exist_ok=True)

    return uploads, downloads, root_dir

@app.get("/progress/stream")
async def progress_stream(request: Request):
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break

                progress = service_get_progress()
                payload = json.dumps(progress)
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.5)

        except asyncio.CancelledError:
            raise
        except Exception as e:
            print("SSE error:", e)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@app.get("/file/error/stream")
async def error_stream(request: Request):
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break

                async with app.state.failed_items_lock:
                    errorDict = dict(app.state.failed_items)
                payload = json.dumps(errorDict)
                yield f"data: {payload}\n\n"
                await asyncio.sleep(5.0)

        except asyncio.CancelledError:
            raise
        except Exception as e:
            print("SSE error:", e)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@app.get("/health")
async def health():
    return {"status": "ok"}


# --- Endpoints ---
@app.post("/run")
async def run(
    file: UploadFile = File(...),
    output_path: str | None = Form(None),
    concurrent: int = 10,
    add_exif: bool = True,
    skip_existing: bool = True,
    merge_overlay: bool = Form(True),
):
    print("Received /run request")

    print("RUN : Checking for existing tasks...")
    global current_run_task
    if current_run_task and not current_run_task.done():
        raise HTTPException(409, "A download is already running")

    print("RUN : Setting up directories...")
    #Folders creation
    uploads, downloads, root_dir = setup_directories(output_path)
    
    # Save uploaded JSON file
    json_path = uploads / file.filename
    with open(json_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    #output directory
    output_dir = downloads

    # Custom output directory validation
    if output_path:
        output_dir = Path(output_path).expanduser().resolve() / "SnapchatExporter" / "downloads"
        BASE_ALLOWED_DIR = Path.home()
        if not output_dir.is_relative_to(BASE_ALLOWED_DIR):
            raise HTTPException(status_code=400, detail="Invalid output directory")
        output_dir.mkdir(parents=True, exist_ok=True)

    pause_event.set()  # start possible if paused

    print("RUN : Starting download task...")
    print(f"RUN : Merge Overlay: {merge_overlay}")

    # Start the download as an asynchronous task
    current_run_task = asyncio.create_task(
        run_import(
            json_path=json_path,
            output_dir=output_dir,
            concurrent=concurrent,
            add_exif=add_exif,
            skip_existing=skip_existing,
            merge_overlay=merge_overlay,
            state=app.state,
        )
    )
    current_run_task.add_done_callback(task_done_callback)

    return {
        "status": "running",
        "output_dir": str(output_dir)
    }

@app.post("/pause")
def pause():
    pause_event.clear()
    progress = service_get_progress()
    progress["status"] = "paused"
    return {"status": "paused"}

@app.post("/resume")
def resume():
    pause_event.set()
    progress = service_get_progress()
    progress["status"] = "running"
    return {"status": "running"}

@app.get("/downloads", response_model=DownloadedItemsPage)
async def get_downloaded_items(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=500),
):
    async with app.state.downloaded_items_lock:
        total = len(app.state.downloaded_items)
        items = app.state.downloaded_items[offset : offset + limit]

    return {
        "items": items,
        "total": total,
        "offset": offset,
        "limit": limit,
    }

@app.post("/restart")
async def restart(output_path: str | None = Form(None)):
    global current_run_task

    #cancel current task
    if current_run_task and not current_run_task.done():
        current_run_task.cancel()
        try:
            await current_run_task
        except asyncio.CancelledError:
            print("Run task cancelled successfully")
        finally:
            current_run_task = None
    else:
        current_run_task = None

    #stop any ongoing download
    pause_event.clear()

    #reset progress
    progress = service_get_progress()
    progress.update({
        "status": "idle",
        "downloaded": 0,
        "total": 0,
        "eta": None,
    })

    # recalculate the exact same paths as in /run
    uploads, downloads, root_dir = setup_directories(output_path)
    
    # If a custom output_path was used, the downloads folder is different
    actual_downloads_dir = downloads
    if output_path:
        actual_downloads_dir = Path(output_path).expanduser().resolve() / "SnapchatExporter" / "downloads"

    # Hard delete and recreate
    for target_dir in [uploads, actual_downloads_dir]:
        if target_dir.exists():
            print(f"Deleting directory content: {target_dir}")
            try:
                shutil.rmtree(target_dir)
                target_dir.mkdir(parents=True, exist_ok=True)
            except Exception as e:
                print(f"Error during deletion of {target_dir}: {e}")

#clear downloaded and failed items
    async with app.state.downloaded_items_lock:
        app.state.downloaded_items.clear()

    async with app.state.failed_items_lock:
        app.state.failed_items.clear()

    return {"status": "idle"}





# --- ENTRY POINT ---
if __name__ == "__main__":
    import uvicorn
    import argparse
    import multiprocessing

    multiprocessing.freeze_support()

    parser = argparse.ArgumentParser(description="SnapExporter Backend")
    parser.add_argument("--port", type=int, default=8000, help="Port to run the server on")
    args = parser.parse_args()

    logging.basicConfig(level=logging.WARNING)
    print(f"Starting FastAPI server on port {args.port}...", flush=True)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=args.port,
        log_level="warning",
        reload=False
    )