@echo off
setlocal
cd /d "%~dp0"

echo Haiku Cosmos - lokalny dev server Vite
echo Repo path: %CD%
echo.
echo Vite zwykle wystartuje pod:
echo   http://localhost:5173/Haiku-Cosmos/
echo Jesli Vite pokaze inny adres, uzyj adresu z konsoli.
echo.

if not exist node_modules\ (
  echo Nie znaleziono node_modules - uruchamiam npm install...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install zakonczyl sie bledem.
    pause
    exit /b 1
  )
)

echo Uruchamiam npm run dev...
call npm.cmd run dev
if errorlevel 1 (
  echo.
  echo npm run dev zakonczyl sie bledem.
  pause
  exit /b 1
)

echo.
echo Dev server zakonczony.
pause
endlocal
