@echo off
title Haiku Cosmos - Local Server
cd /d "C:\Users\Legio\Documents\GitHub\Haiku-Cosmos"

echo.
echo Haiku Cosmos local server
echo Folder: %CD%
echo URL gry:
echo   http://localhost:8123/index.codex.html
echo.
echo Preview Frame Kit:
echo   http://localhost:8123/assets/visual/preview/modular_frame_kit_v01_preview.html
echo.
echo Frame Composer Sandbox:
echo   http://localhost:8123/assets/visual/preview/frame_composer_sandbox.html
echo.
echo Zamknij okno albo nacisnij CTRL+C, aby zatrzymac serwer.
echo.

python -m http.server 8123

pause