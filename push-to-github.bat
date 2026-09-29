@echo off
setlocal
echo =====================================================================
echo CareConnect EHR - Push to GitHub Utility
echo =====================================================================
echo.

cd /d "%~dp0"

echo Current Git Status:
git status -s
echo.

set /p REPO_URL="Enter your GitHub Repository HTTPS URL (e.g. https://github.com/faizan0264/careconnect-ehr.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborting.
    pause
    exit /b 1
)

echo.
echo Removing any existing origin remote...
git remote remove origin 2>nul

echo Adding remote origin %REPO_URL%...
git remote add origin %REPO_URL%

echo Renaming branch to main...
git branch -M main

echo Pushing code to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo [SUCCESS] CareConnect EHR successfully pushed to GitHub!
    echo.
    echo Next Steps for 1-Click Deployment:
    echo 1. Frontend: Connect to Vercel (https://vercel.com), select root 'careconnect-react'
    echo 2. Backend: Connect to Render (https://render.com), select root 'careconnect-backend'
    echo =====================================================================
) else (
    echo.
    echo [ERROR] Push failed. Please verify your repository URL and GitHub credentials.
)

pause
