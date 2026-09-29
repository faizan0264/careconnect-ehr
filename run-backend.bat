@echo off
title CareConnect EHR - Spring Boot REST API
color 0A
echo ====================================================================
echo   CARECONNECT EHR: PATIENT-PROVIDER PLATFORM - BACKEND REST API
echo ====================================================================
echo.
echo Checking environment...
set "LOCAL_MVN=%~dp0maven\apache-maven-3.9.6\bin"
if exist "%LOCAL_MVN%\mvn.cmd" (
    set "PATH=%LOCAL_MVN%;%PATH%"
    echo [OK] Using portable Apache Maven 3.9.6
) else (
    echo [INFO] Using system Maven
)

cd /d "%~dp0careconnect-backend"
echo [INFO] Starting Spring Boot 3.3.4 Application on port 8080...
echo [INFO] Swagger UI will be available at: http://localhost:8080/swagger-ui.html
echo [INFO] H2 Database Console at:         http://localhost:8080/h2-console
echo.
call mvn spring-boot:run
if errorlevel 1 (
    echo.
    echo [ERROR] Spring Boot backend failed to start.
    echo Please ensure Java JDK 17+ or 21+ is installed.
)
pause
