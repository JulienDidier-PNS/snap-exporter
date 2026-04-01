cd backend && pip install -r requirements.txt && pyinstaller snap-exporter-backend.spec --noconfirm && cd ..
cd front && npm install && npm run build:mac && cd .. && npm run build