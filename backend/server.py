from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder

from pathlib import Path
import shutil
import asyncio
import logging

from service import run_import, get_progress as service_get_progress, pause_event

app = FastAPI()

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

# --- Endpoints ---
@app.post("/run")
async def run(
    file: UploadFile = File(...),
    output_path: str | None = Form(None),
    concurrent: int = 40,
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

@app.get("/downloads")
async def get_downloaded_items():
    async with app.state.downloaded_items_lock:
        return list(downloaded_items)
        return jsonable_encoder(app.state.downloaded_items)



# --- ENTRY POINT ---
if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.DEBUG)
    print("Starting FastAPI server...", flush=True)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=False
    )