#!/usr/bin/env bash
# NOIR - one-time setup for a fresh machine (macOS / Linux)
set -e
cd "$(dirname "$0")"

echo ""
echo "=============================================="
echo "  NOIR Fashion Store - One-time setup"
echo "=============================================="
echo ""

# ---- Backend ----
if [ -x "env/bin/python" ]; then
    echo "[1/4] Virtual environment already exists - skipping create."
else
    echo "[1/4] Creating Python virtual environment \"env\"..."
    python3 -m venv env
fi

echo "[2/4] Installing backend requirements..."
env/bin/python -m pip install -r requirements.txt

echo "[3/4] Installing frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "      node_modules already present - skipping npm install."
else
    (cd frontend && npm install)
fi

echo "[4/4] Applying database migrations..."
env/bin/python manage.py migrate

echo ""
echo "=============================================="
echo "  Setup complete!"
echo ""
echo "  To run, open TWO terminals:"
echo "    Terminal 1:  env/bin/python manage.py runserver"
echo "    Terminal 2:  cd frontend && npm run dev"
echo ""
echo "  Then open  http://localhost:5173"
echo "=============================================="
