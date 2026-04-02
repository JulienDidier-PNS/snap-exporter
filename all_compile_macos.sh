# Copyright (c) 2026 Julien Didier
# Licensed under the MIT License
cd backend && pip install -r requirements.txt && pyinstaller snap-exporter-backend.spec --noconfirm && cd ..
cd front && npm install && npm run build && cd .. && npm run build:mac