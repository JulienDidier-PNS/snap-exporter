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
    app.state.failed_items = []  # Exemple initial
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
                payload = json.dumps(service_get_progress())
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

                errorList = get_error_list(app.state)
                payload = json.dumps(errorList)
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


# --- Endpoints ---
@app.post("/run")
async def run(
    file: UploadFile = File(...),
    output_path: str | None = Form(None),
    concurrent: int = 10,
    add_exif: bool = True,
    skip_existing: bool = True,
):
    print("Received /run request")
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

    # Start the download as an asynchronous task
    current_run_task = asyncio.create_task(
        run_import(
            json_path=json_path,
            output_dir=output_dir,
            concurrent=concurrent,
            add_exif=add_exif,
            skip_existing=skip_existing,
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

    #clean downloads folder
    _, downloads, _ = setup_directories(output_path)

    if downloads.exists():
        for f in downloads.iterdir():
            if f.is_file():
                try:
                    f.unlink()
                except Exception as e:
                    print("Delete failed:", e)

    #clear downloaded and failed items
    async with app.state.downloaded_items_lock:
        app.state.downloaded_items.clear()

    async with app.state.failed_items_lock:
        app.state.failed_items.clear()

    return {"status": "idle"}





# --- ENTRY POINT ---
if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.WARNING)
    print("Starting FastAPI server...", flush=True)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="warning",
        reload=False
    )