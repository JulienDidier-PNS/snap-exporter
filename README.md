# 📸 Snap Exporter

[Français](#-français) | [English](#-english)

---

## 🇫🇷 Français

**Snap Exporter** est une application de bureau conçue pour simplifier l'exportation et la sauvegarde de vos souvenirs Snapchat Memories.  
Dites adieu aux fichiers `.zip` complexes et aux erreurs de téléchargement officielles : récupérez vos médias via une interface intuitive tout en préservant l'intégralité des métadonnées.

### 📝 Résumé
Snap Exporter est né d'un constat simple : la méthode officielle pour récupérer les données Snapchat est souvent fastidieuse et manque d'ergonomie. Basé sur le projet [AndrewMitchell25/Snapchat-All-Memories-Downloader](https://github.com/AndrewMitchell25/Snapchat-All-Memories-Downloader), cette version ajoute une interface moderne (Electron + Next.js) et un tutoriel pas à pas pour guider les utilisateurs.

L'objectif est de recréer votre bibliothèque de souvenirs exactement comme elle apparaît dans votre application, organisée et complète.

### ✨ Fonctionnalités
- 🚀 **Interface Intuitive** : Une application moderne construite avec React (Next.js) et Tailwind CSS.
- 📖 **Tutoriel Intégré** : Un guide complet pour obtenir vos fichiers de données Snapchat sans stress.
- 📍 **Préservation des Métadonnées** : Télécharge vos souvenirs en préservant la géolocalisation (EXIF) et les horodatages.
- 📁 **Organisation Automatique** : Structure vos fichiers pour refléter fidèlement l'album de votre application.
- 🛠️ **Backend Robuste** : Propulsé par un moteur Python pour gérer les flux de téléchargement haute performance et la fusion des médias.

### 🏗️ Architecture Technique
Le projet repose sur une architecture hybride combinant le meilleur des technologies Web et Python :
- **Frontend** : [Next.js](https://nextjs.org/) (App Router) + [Tailwind CSS](https://tailwindcss.com/), intégré via [Electron](https://www.electronjs.org/).
- **Backend** : [FastAPI](https://fastapi.tiangolo.com/) (Python) gérant la logique métier lourde (téléchargements asynchrones, traitement d'image/vidéo).
- **Communication** : IPC (Inter-Process Communication) entre Electron et le Backend Python packagé.
- **Traitement Média** : [FFmpeg](https://ffmpeg.org/) pour la manipulation des vidéos et l'ajout de métadonnées complexes.

### 🛠️ Compilation & Développement

#### Prérequis
- [Node.js](https://nodejs.org/) (v20+)
- [Python 3.10+](https://www.python.org/)
- [FFmpeg](https://ffmpeg.org/) (Inclus dans les binaires pour le packaging, mais nécessaire en local pour le dev)

#### Installation & Développement
1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/JulienDidier-PNS/snap-exporter.git
   cd snap-exporter
   ```
2. **Configuration du Backend (Python)** :
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```
3. **Configuration du Frontend (Electron/Next.js)** :
   ```bash
   cd front
   npm install
   ```

#### Lancement en mode Développement
1. **Démarrer le Backend** :
   ```bash
   cd backend
   python server.py
   ```
2. **Démarrer Electron/Next.js** (dans un autre terminal) :
   ```bash
   cd front
   npm run dev
   ```

### 📦 Construction de l'Exécutable (Build)
Le processus de build package le backend Python en un binaire autonome qui est ensuite inclus dans l'application Electron.

#### Sur macOS
Utilisez le script automatisé :
```bash
./all_compile_macos.sh
```

#### Sur Windows
Utilisez le script PowerShell :
```powershell
.\all_compile_windows.ps1
```

L'exécutable final se trouvera dans le dossier `dist-electron/`.

### 🛡️ Traitement des Données & Métadonnées
Snap Exporter ne se contente pas de télécharger les fichiers :
- **Images** : Ajout des tags EXIF (Date, Coordonnées GPS) via `piexif`.
- **Vidéos** : Utilisation de FFmpeg pour injecter les métadonnées de création.
- **Overlays** : Fusion automatique des "overlays" (stickers, filtres) sur les images originales pour un rendu identique à l'application.
- **Asynchronisme** : Gestion de téléchargements concurrents avec sémaphores pour optimiser la vitesse sans être banni par les serveurs de contenu.

### ⚠️ Limitations
- Snapchat ne permet pas aux développeurs tiers de demander directement le fichier de données (DMD). Vous devez le demander manuellement via l'interface Snapchat (expliqué dans le tutoriel de l'app).
- La vitesse de téléchargement peut être limitée par votre connexion et les quotas des serveurs AWS de Snapchat.

## 📄 License
Ce projet est sous la license MIT - voir le fichier fichier LICENSE pour plus de détails.

## ⚖️ Legal
Ce logiciel est fourni « tel quel », sans garantie d'aucune sorte.

---

## 🇺🇸 English

**Snap Exporter** is a desktop application designed to simplify the export and backup of your Snapchat Memories.  
Say goodbye to complex `.zip` files and official download errors: recover your media through an intuitive interface while preserving all metadata.

### 📝 Summary
Snap Exporter was born from a simple observation: the official method for retrieving Snapchat data is often tedious and lacks ergonomics. Based on the [AndrewMitchell25/Snapchat-All-Memories-Downloader](https://github.com/AndrewMitchell25/Snapchat-All-Memories-Downloader) project, this version adds a modern interface (Electron + Next.js) and a step-by-step tutorial to guide users.

The goal is to recreate your memories library exactly as it appears in your app, organized and complete.

### ✨ Features
- 🚀 **Intuitive Interface**: A modern application built with React (Next.js) and Tailwind CSS.
- 📖 **Integrated Tutorial**: A comprehensive guide to getting your Snapchat data files without the stress.
- 📍 **Metadata Preservation**: Downloads your memories while preserving geolocation (EXIF) and timestamps.
- 📁 **Automatic Organization**: Structures your files to faithfully reflect your app's album.
- 🛠️ **Robust Backend**: Powered by a Python engine to handle high-performance download streams and media merging.

### 🏗️ Technical Architecture
The project is built on a hybrid architecture combining the best of Web and Python technologies:
- **Frontend**: [Next.js](https://nextjs.org/) (App Router) + [Tailwind CSS](https://tailwindcss.com/), integrated via [Electron](https://www.electronjs.org/).
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python) handling heavy business logic (async downloads, image/video processing).
- **Communication**: IPC (Inter-Process Communication) between Electron and the packaged Python Backend.
- **Media Processing**: [FFmpeg](https://ffmpeg.org/) for video manipulation and adding complex metadata.

### 🛠️ Compilation & Development

#### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Python 3.10+](https://www.python.org/)
- [FFmpeg](https://ffmpeg.org/) (Included in binaries for packaging, but required locally for dev)

#### Installation & Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/JulienDidier-PNS/snap-exporter.git
   cd snap-exporter
   ```
2. **Backend Configuration (Python)**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```
3. **Frontend Configuration (Electron/Next.js)**:
   ```bash
   cd front
   npm install
   ```

#### Running in Development Mode
1. **Start the Backend**:
   ```bash
   cd backend
   python server.py
   ```
2. **Start Electron/Next.js** (in another terminal):
   ```bash
   cd front
   npm run dev
   ```

### 📦 Building the Executable (Build)
The build process packages the Python backend into a standalone binary which is then included in the Electron application.

#### On macOS
Use the automated script:
```bash
./all_compile_macos.sh
```

#### On Windows
Use the PowerShell script:
```powershell
.\all_compile_windows.ps1
```

The final executable will be located in the `dist-electron/` folder.

### 🛡️ Data & Metadata Processing
Snap Exporter does more than just download files:
- **Images**: Adds EXIF tags (Date, GPS Coordinates) via `piexif`.
- **Videos**: Uses FFmpeg to inject creation metadata.
- **Overlays**: Automatically merges "overlays" (stickers, filters) onto original images for a result identical to the app.
- **Asynchronicity**: Manages concurrent downloads with semaphores to optimize speed without being banned by content servers.

### ⚠️ Limitations
- Snapchat does not allow third-party developers to directly request the Data Download File (DMD). You must request it manually via the Snapchat interface (explained in the app's tutorial).
- Download speed may be limited by your connection and Snapchat's AWS server quotas.

## 📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

## ⚖️ Legal
This software is provided "as is", without warranty of any kind.
