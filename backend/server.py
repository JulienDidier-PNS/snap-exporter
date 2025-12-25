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

from service import run_import, get_progress as service_get_progress, pause_event

from typing import List
from datetime import datetime

app = FastAPI()

#pPAGINATION FOR DOWNLOADED ITEMS
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


# --- Setup dossiers ---
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
        print("🟢 SSE client connected")
        try:
            while True:
                if await request.is_disconnected():
                    print("🔴 SSE client disconnected")
                    break

                progress = service_get_progress()
                if(progress["status"] != "paused" and progress["status"] != "idle"):
                    payload = json.dumps(service_get_progress())
                    yield f"data: {payload}\n\n"
                await asyncio.sleep(0.5)

        except asyncio.CancelledError:
            print("⚠️ SSE cancelled")
            raise
        except Exception as e:
            print("❌ SSE error:", e)

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
    # Création des dossiers
    uploads, downloads, root_dir = setup_directories(output_path)
    
    # Fichier uploadé
    json_path = uploads / file.filename
    with open(json_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Valeur par défaut pour run_import
    output_dir = downloads

    # Sécurité si un chemin spécifique est fourni
    if output_path:
        output_dir = Path(output_path).expanduser().resolve() / "SnapchatExporter" / "downloads"
        BASE_ALLOWED_DIR = Path.home()
        if not output_dir.is_relative_to(BASE_ALLOWED_DIR):
            raise HTTPException(status_code=400, detail="Invalid output directory")
        output_dir.mkdir(parents=True, exist_ok=True)

    pause_event.set()  # lancement possible si pause

    # Lancer le téléchargement en tâche asynchrone
    asyncio.create_task(
        run_import(
            json_path=json_path,
            output_dir=output_dir,
            concurrent=concurrent,
            add_exif=add_exif,
            skip_existing=skip_existing,
            state=app.state,
        )
    )

    return {
        "status": "running",
        "output_dir": str(output_dir)
    }

@app.get("/progress")
def progress():
    return service_get_progress()

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



# --- ENTRY POINT ---
if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.INFO)
    print("Starting FastAPI server...", flush=True)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=False
    )