@echo off
echo =============================================
echo   HeritageGuard AI - Quick Start
echo =============================================

echo.
echo [1/3] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend install failed
    pause
    exit /b 1
)

cd ..
echo.
echo [3/3] Setup complete!
echo.
echo To start the application:
echo   Terminal 1: cd backend ^& npm run dev
echo   Terminal 2: cd frontend ^& npm run dev
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
