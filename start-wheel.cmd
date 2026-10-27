@echo off
rem Double-click to launch Illuminatix Spin the Wheel in your browser.
cd /d "%~dp0"
set "NODE_DIR=%LOCALAPPDATA%\Programs\node-portable\node-v24.22.1-win-x64"
if exist "%NODE_DIR%\node.exe" set "PATH=%NODE_DIR%;%PATH%"
if not exist node_modules call npm install
call npm run dev -- --open http://akruti.localhost/
