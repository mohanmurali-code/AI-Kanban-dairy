@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Configuration
set "PORT=5173"

echo Stopping web dev server on port %PORT%...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
  echo Killing process on port %PORT% (PID %%a)...
  taskkill /PID %%a /F >nul 2>&1
)

echo Done.
endlocal
exit /b 0


