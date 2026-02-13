@echo off
chcp 65001 >nul
echo ========================================
echo Flickers Calculator - Quick Build
echo ========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Download from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
call npm install

echo.
echo Building application...
call npm run build

echo.
echo ========================================
echo Done! Check the dist/ folder
echo ========================================
pause
