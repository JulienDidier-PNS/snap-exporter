from fastapi import FastAPI, UploadFile, File
from pathlib import Path
import shutil
import asyncio
import sys
import logging

from service import run_import

app = FastAPI()

BASE_DIR = Path.home() / "SnapchatImporter"
UPLOADS = BASE_DIR / "uploads"
OUTPUT = BASE_DIR / "downloads"

UPLOADS.mkdir(parents=True, exist_ok=True)
OUTPUT.mkdir(parents=True, exist_ok=True)

@app.post("/run")
async def run(
    file: UploadFile = File(...),
    concurrent: int = 40,
    add_exif: bool = True,
    skip_existing: bool = True,
):
    json_path = UPLOADS / file.filename

    with open(json_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    await run_import(
        json_path=json_path,
        output_dir=OUTPUT,
        concurrent=concurrent,
        add_exif=add_exif,
        skip_existing=skip_existing,
    )

    return {"status": "done"}

# --- ENTRY POINT ---
if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.DEBUG)
    print("Starting FastAPI server...", flush=True)

    uvicorn.run(
        app,  # nom du fichier et objet FastAPI
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=False  # ne pas activer le rechargement automatique dans un binaire
    )
