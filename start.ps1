# Real-Time Chat Application Startup Script (PowerShell)
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Real-Time Chat Application Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/4] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if backend dependencies are installed
Write-Host ""
Write-Host "[2/4] Checking backend dependencies..." -ForegroundColor Yellow
if (-Not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
}

# Check if .env file exists
Write-Host ""
Write-Host "[3/4] Checking environment configuration..." -ForegroundColor Yellow
if (-Not (Test-Path "backend\.env")) {
    Write-Host "⚠ Warning: backend\.env file not found!" -ForegroundColor Red
    Write-Host "Please copy backend\.env.example to backend\.env and configure it." -ForegroundColor Yellow
    Write-Host "See backend\SUPABASE_SETUP.md for detailed instructions." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "✓ Environment file found" -ForegroundColor Green
}

# Start the backend server
Write-Host ""
Write-Host "[4/4] Starting servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend server will start on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend will be available at the file path" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start backend in current terminal
Set-Location backend
npm start
