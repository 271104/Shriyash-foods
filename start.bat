@echo off
echo ========================================
echo   Shriyash Foods - Starting Application
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file from .env.example
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)

if not exist client\node_modules (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting backend server on port 5000...
echo Starting frontend on port 3000...
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
start "Backend Server" cmd /k "npm run server"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd client && npm start"

echo.
echo ========================================
echo   Servers Started!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
