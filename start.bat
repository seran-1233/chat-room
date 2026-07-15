@echo off
REM Real-Time Chat Application Startup Script (Windows CMD)
REM This script starts the backend server

echo ========================================
echo   Real-Time Chat Application Starter
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/4] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

node --version
echo OK Node.js detected
echo.

REM Check if backend dependencies are installed
echo [2/4] Checking backend dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo OK Backend dependencies installed
) else (
    echo OK Backend dependencies already installed
)
echo.

REM Check if .env file exists
echo [3/4] Checking environment configuration...
if not exist "backend\.env" (
    echo WARNING: backend\.env file not found!
    echo Please copy backend\.env.example to backend\.env and configure it.
    echo See backend\SUPABASE_SETUP.md for detailed instructions.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo OK Environment file found
)
echo.

REM Start the backend server
echo [4/4] Starting backend server...
echo.
echo Backend server: http://localhost:3000
echo Frontend: Open frontend\index.html in your browser
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd backend
npm start
