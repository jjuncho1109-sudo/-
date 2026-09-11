@echo off
title Safe Spots Server Launcher
echo ==============================================
echo   Safe Spots Server is Starting...
echo ==============================================

cd /d "C:\Users\YG_home\.gemini\antigravity-ide\scratch\safe_spots"

:: 1. Check if Server.exe is running
tasklist /fi "imagename eq Server.exe" | findstr /i "Server.exe" >nul
if %ERRORLEVEL% neq 0 (
    echo [*] Starting Local Server...
    start /b "" "C:\Users\YG_home\.gemini\antigravity-ide\scratch\safe_spots\Server.exe"
) else (
    echo [*] Server is already running.
)

:: 2. Check if cloudflared is running
tasklist /fi "imagename eq cloudflared.exe" | findstr /i "cloudflared.exe" >nul
if %ERRORLEVEL% neq 0 (
    echo [*] Starting External Tunnel...
    start /b "" "C:\Users\YG_home\.gemini\antigravity-ide\scratch\safe_spots\cloudflared.exe" tunnel --url http://localhost:5000 --http-host-header "localhost:5000"
) else (
    echo [*] External Tunnel is already running.
)

:: 3. Open Browser
timeout /t 1 >nul
echo [*] Opening Web Browser...
start "" "http://localhost:5000/"

echo.
echo ==============================================
echo   Server is running! You can close this window.
echo ==============================================
timeout /t 3 >nul
exit