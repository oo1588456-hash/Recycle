@echo off
setlocal EnableExtensions
title ReCycle launcher

REM Root folder = this script's directory (works when double-clicked)
set "REPO=%~dp0"
if "%REPO:~-1%"=="\" set "REPO=%REPO:~0,-1%"

echo.
echo  ReCycle - starting Django API + Next.js web
echo  -------------------------------------------
echo   API:    http://127.0.0.1:8005  ^(Django^)
echo   Web:    http://localhost:3000  ^(Next.js in frontend_web^)
echo.
echo  Close each titled window to stop that server.
echo.

REM Flutter mobile client lives in frontend\ — see README ^(not started by this script^).
REM --- Python: prefer "python", else Windows "py -3" ---
set "PY=python"
where python >nul 2>&1
if errorlevel 1 (
  py -3 --version >nul 2>&1
  if errorlevel 1 (
    echo [ERROR] Python not found. Install Python or ensure "py -3" works.
    pause
    exit /b 1
  )
  set "PY=py -3"
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found on PATH. Install Node LTS for the Next.js app.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found on PATH.
  pause
  exit /b 1
)

if not exist "%REPO%\backend\manage.py" (
  echo [ERROR] Missing "%REPO%\backend\manage.py"
  pause
  exit /b 1
)
if not exist "%REPO%\frontend_web\package.json" (
  echo [ERROR] Missing "%REPO%\frontend_web\package.json"
  pause
  exit /b 1
)

REM Stop prior dev servers on this stack's ports ^(best-effort restart^)
echo  Stopping any existing listeners on ports 8005 and 3000...
call :kill_listen_port 8005
call :kill_listen_port 3000

start "ReCycle Django :8005" /D "%REPO%\backend" cmd /k %PY% manage.py runserver 8005

timeout /t 3 /nobreak >nul

start "ReCycle Next.js :3000" /D "%REPO%\frontend_web" cmd /k npm run dev

echo  Launched two new windows. This window can be closed.
echo.
pause
goto :EOF

:kill_listen_port
REM Picks PID from netstat ^(column 5 on typical English Windows LISTENING rows^).
for /f "tokens=5" %%P in ('netstat -ano ^| findstr LISTENING ^| findstr /C:":%~1"') do (
  if not "%%P"=="" if not "%%P"=="0" taskkill /F /PID %%P >nul 2>&1
)
exit /b
