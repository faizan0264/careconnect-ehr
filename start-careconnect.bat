@echo off
title CareConnect EHR - Master Launcher
color 0F
echo ====================================================================
echo   CARECONNECT EHR: PATIENT-PROVIDER PLATFORM
echo   Master Launcher (Frontend + Backend Connected)
echo ====================================================================
echo.
echo Launching services...
echo [1/2] Starting Spring Boot REST API Backend (Port 8080)...
start "CareConnect Backend (Port 8080)" cmd /k "%~dp0run-backend.bat"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend (Port 5173)...
start "CareConnect Frontend (Port 5173)" cmd /k "%~dp0run-frontend.bat"

echo.
echo ====================================================================
echo Both servers have been launched in separate command windows!
echo.
echo  * Frontend Web Application: http://localhost:5173
echo  * Backend REST API Swagger: http://localhost:8080/swagger-ui.html
echo  * H2 Database Web Console:  http://localhost:8080/h2-console
echo.
echo Keep the backend and frontend command windows open while testing.
echo Press any key to close this launcher window (servers will keep running).
echo ====================================================================
pause >nul
