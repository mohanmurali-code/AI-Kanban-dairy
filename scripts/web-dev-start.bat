@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Configuration
set "PORT=5173"
set "APP_DIR=%~dp0..\apps\web"

echo Starting web dev server on http://localhost:%PORT%/

REM Change to app directory
pushd "%APP_DIR%" >nul 2>&1
if errorlevel 1 (
  echo Failed to change directory to %APP_DIR%
  exit /b 1
)

REM Kill any process currently listening on the port (to avoid new ports)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  echo Killing process on port %PORT% (PID %%a)...
  taskkill /PID %%a /F >nul 2>&1
)

REM Start Vite with strict port in a new window and keep it open
start "Vite Dev Server" cmd /k "npm.cmd run dev -- --strictPort"

REM Give the server a moment to boot, then open browser
timeout /t 2 >nul
start "" http://localhost:%PORT%/

popd >nul 2>&1
endlocal
exit /b 0


