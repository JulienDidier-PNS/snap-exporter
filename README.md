# 📸 Snap Exporter

**Snap Exporter** is a desktop application designed to simplify the export and backup of your Snapchat Memories.  
Say goodbye to complex `.zip` files and official download errors: recover your media through an intuitive interface with all metadata preserved.

---

## 📝 Summary
Snap Exporter was born from a simple observation: the official method for retrieving Snapchat data is often tedious and lacks ergonomics. Building upon the [AndrewMitchell25/Snapchat-All-Memories-Downloader](https://github.com/AndrewMitchell25/Snapchat-All-Memories-Downloader) project, this version adds a modern UI (Built with Electron + Next.js) and a step-by-step tutorial to guide users through the process.

The goal is to recreate your memories library exactly as it appears in your app, organized and complete.

---

## ✨ Features
- 🚀 **Sexy & Intuitive Interface**: A modern application built with React (Next.js) and Tailwind CSS.
- 📖 **Integrated Tutorial**: A comprehensive guide to obtaining your Snapchat data files without the stress.
- 📍 **Metadata Preservation**: Downloads your memories while preserving geolocation and timestamp information.
- 📁 **Automatic Organization**: Structures your files to faithfully reflect your app's album.
- 🛠️ **Robust Backend**: Powered by a Python engine to handle high-performance download streams and media merging.

snapchat don't allow developers to request DMD.
---

## 🛠️ Compilation & Development

If you wish to modify the code or build the application yourself, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/)
- [Python 3.10+](https://www.python.org/)
- [FFmpeg](https://ffmpeg.org/) (Required for video metadata and overlay merging)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JulienDidier-PNS/snap-exporter.git
   cd snap-exporter
   ```

2. **Setup the Backend (Python)**:
   It is recommended to use a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Linux/Mac
   # venv\Scripts\activate   # On Windows
   pip install -r requirements.txt
   ```

3. **Setup the Frontend (Electron/Next.js)**:
   ```bash
   cd front
   npm install
   cd ..
   ```

### Running in Development Mode
To launch the application with Hot Reload (ensure your backend venv is active):

1. **Start the Backend**:
   ```bash
   cd backend
   python server.py
   ```

2. **Start the Frontend** (in another terminal):
   ```bash
   cd front
   npm run dev
   ```

### Building the App
To generate the production executable (currently configured for macOS):