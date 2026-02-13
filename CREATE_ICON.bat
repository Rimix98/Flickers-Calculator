@echo off
echo ========================================
echo   Creating ICO icon for EXE file
echo ========================================
echo.

echo Installing required packages...
call npm install sharp png-to-ico

echo.
echo Creating icon...
node create-icon.js

echo.
echo Done! File app.ico created.
pause
