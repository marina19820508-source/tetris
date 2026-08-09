@echo off
setlocal
cd /d "%~dp0"
set "NODE_DIR=C:\Users\marin\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"

if not exist "node_modules" call "%NODE_DIR%\npm.cmd" install
start "London Yesterday Quest - server" /min "%NODE_DIR%\npm.cmd" run dev -- --host 127.0.0.1 --port 4173
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:4173/"
endlocal
