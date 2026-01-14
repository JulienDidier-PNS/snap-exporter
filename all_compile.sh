cd backend && pyinstaller snap-exporter-backend.spec --noconfirm && cd ..
cd front && npm install && npm run build && cd .. && npm run build