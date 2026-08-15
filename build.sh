#!/usr/bin/env bash
# Build script for Render: install backend deps, build the React frontend
# with a Django-friendly base path, then collect Django static files.
set -e
cd "$(dirname "$0")"

echo "==> Installing backend requirements..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "==> Building frontend..."
cd frontend
npm ci || npm install
VITE_BASE=/static/ npm run build
cd ..

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Build complete."
