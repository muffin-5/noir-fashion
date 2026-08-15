@echo off
REM NOIR - one-time setup for a fresh machine (Windows)
setlocal

cd /d "%~dp0"

echo.
echo ==============================================
echo  NOIR Fashion Store - One-time setup
echo ==============================================
echo.

REM ---- Backend ----
if exist env\Scripts\python.exe (
    echo [1/4] Virtual environment already exists - skipping create.
) else (
    echo [1/4] Creating Python virtual environment "env"...
    python -m venv env
    if errorlevel 1 goto :error
)

echo [2/4] Installing backend requirements...
env\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 goto :error

echo [3/4] Installing frontend dependencies...
if exist frontend\node_modules (
    echo       node_modules already present - skipping npm install.
) else (
    pushd frontend
    call npm install
    if errorlevel 1 (
        popd
        goto :error
    )
    popd
)

echo [4/4] Applying database migrations...
env\Scripts\python.exe manage.py migrate
if errorlevel 1 goto :error

echo.
echo ==============================================
echo  Setup complete!
echo.
echo  To run, open TWO terminals:
echo    Terminal 1:  env\Scripts\python.exe manage.py runserver
echo    Terminal 2:  cd frontend  ^&^&  npm run dev
echo.
echo  Then open  http://localhost:5173
echo ==============================================
echo.
goto :eof

:error
echo.
echo [ERROR] Setup failed. Check the message above and re-run.
exit /b 1

endlocal
