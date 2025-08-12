@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Configuration
set "PORT=5173"
set "APP_DIR=%~dp0..\apps\web"

echo Restarting web dev server on http://localhost:%PORT%/

REM Kill vite dev server (commonly "node" process holding the port)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  echo Killing process on port %PORT% (PID %%a)...
  taskkill /PID %%a /F >nul 2>&1
)

REM Start server again
call "%~dp0web-dev-start.bat"

endlocal
exit /b 0


