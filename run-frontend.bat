@echo off
title CareConnect EHR - React 19 / Vite Frontend
color 0B
echo ====================================================================
echo   CARECONNECT EHR: PATIENT-PROVIDER PLATFORM - FRONTEND WEB APP
echo ====================================================================
echo.
cd /d "%~dp0careconnect-react"

if not exist "node_modules\" (
    echo [INFO] First time run detected. Installing npm dependencies...
    call npm install
)

echo [INFO] Starting Vite development server on port 5173...
echo [INFO] Application will open at: http://localhost:5173
echo.
call npm run dev
if errorlevel 1 (
    echo.
    echo [ERROR] Frontend failed to start.
    echo Please ensure Node.js and npm are installed.
)
pause
