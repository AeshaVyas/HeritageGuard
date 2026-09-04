#!/bin/bash
echo "============================================="
echo "  HeritageGuard AI - Quick Start"
echo "============================================="

echo ""
echo "[1/3] Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then echo "ERROR: Backend install failed"; exit 1; fi

echo ""
echo "[2/3] Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then echo "ERROR: Frontend install failed"; exit 1; fi

cd ..
echo ""
echo "[3/3] Setup complete!"
echo ""
echo "To start the application:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
