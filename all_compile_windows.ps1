# Copyright (c) 2026 Julien Didier
# Licensed under the MIT License
# ================================
# Build script Windows complet
# ================================

# 1️⃣ Active Node via nvm portable
nvm use 25.8.2

# 2️⃣ Ajoute Node et npm au PATH pour que PowerShell les trouve
$env:PATH="$env:NVM_SYMLINK;$env:NVM_SYMLINK\node_modules\npm\bin;$env:PATH"

# Vérifie Node et npm
Write-Host "Node version:" (node -v)
Write-Host "NPM version:" (npm -v)

# 3️⃣ Backend : PyInstaller
Write-Host "`n=== Building backend ==="
cd backend

# Supprime les anciens builds pour éviter les erreurs de permissions
if (Test-Path "build") { Remove-Item -Recurse -Force build }
if (Test-Path "dist") { Remove-Item -Recurse -Force dist }

# Build backend
pip install -r requirements.txt
pyinstaller snap-exporter-backend.spec --noconfirm

cd ..

# 4️⃣ Frontend : npm
Write-Host "`n=== Building frontend ==="
cd front

# Installe les dépendances
npm install

# Build frontend
npm run build

cd ..

# 5️⃣ Build global (si nécessaire, selon ton package.json)
Write-Host "`n=== Final project build ==="
npm run build:win

Write-Host "`n=== Build terminé ! ==="