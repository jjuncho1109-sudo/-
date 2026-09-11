@echo off
title GitHub Auto Push - Safe Spots
echo ==============================================
echo   Safe Spots GitHub Auto Save
echo ==============================================
echo.

cd /d "C:\Users\YG_home\.gemini\antigravity-ide\scratch\safe_spots"

echo [1/3] Adding changes...
git add .

echo [2/3] Committing changes...
git commit -m "Auto Save: %date% %time%"

echo [3/3] Uploading to GitHub...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==============================================
    echo   [SUCCESS] Uploaded to GitHub successfully!
    echo ==============================================
) else (
    echo.
    echo ==============================================
    echo   [FAILED] Error occurred. Please check login.
    echo ==============================================
)

echo.
pause