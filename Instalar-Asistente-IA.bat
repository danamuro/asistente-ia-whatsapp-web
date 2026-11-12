@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

title Instalador - Asistente IA para WhatsApp Web

echo ============================================================
echo   Asistente IA para WhatsApp(TM) Web - Instalador Rapido
echo ============================================================
echo.

set "SRC_DIR=%~dp0"
if "%SRC_DIR:~-1%"=="\" set "SRC_DIR=%SRC_DIR:~0,-1%"

if not exist "%SRC_DIR%\manifest.json" (
    echo [ERROR] No se encontro "manifest.json" junto a este instalador.
    echo.
    echo Por favor, primero DESCOMPRIME todo el archivo .zip:
    echo   1. Haz clic derecho sobre el .zip descargado.
    echo   2. Elige "Extraer todo..." y extrae la carpeta.
    echo   3. Abre la carpeta extraida y ejecuta "Instalar-Asistente-IA.bat".
    echo.
    pause
    exit /b 1
)

set "DEST_DIR=%LOCALAPPDATA%\Asistente-IA-WhatsApp-Pro"

echo [1/3] Copiando archivos de la extension a una carpeta segura:
echo       "%DEST_DIR%"
echo.

if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"

copy /Y "%SRC_DIR%\manifest.json" "%DEST_DIR%\" >nul
if exist "%SRC_DIR%\background.js" copy /Y "%SRC_DIR%\background.js" "%DEST_DIR%\" >nul
if exist "%SRC_DIR%\audioInterceptor.js" copy /Y "%SRC_DIR%\audioInterceptor.js" "%DEST_DIR%\" >nul
if exist "%SRC_DIR%\parser.js" copy /Y "%SRC_DIR%\parser.js" "%DEST_DIR%\" >nul
if exist "%SRC_DIR%\uiStuff.js" copy /Y "%SRC_DIR%\uiStuff.js" "%DEST_DIR%\" >nul
if exist "%SRC_DIR%\contentScript.js" copy /Y "%SRC_DIR%\contentScript.js" "%DEST_DIR%\" >nul
if exist "%SRC_DIR%\content.css" copy /Y "%SRC_DIR%\content.css" "%DEST_DIR%\" >nul

if exist "%SRC_DIR%\fonts" xcopy "%SRC_DIR%\fonts" "%DEST_DIR%\fonts" /E /I /Y /Q >nul
if exist "%SRC_DIR%\icons" xcopy "%SRC_DIR%\icons" "%DEST_DIR%\icons" /E /I /Y /Q >nul
if exist "%SRC_DIR%\options" xcopy "%SRC_DIR%\options" "%DEST_DIR%\options" /E /I /Y /Q >nul

echo [2/3] Copiando la ruta de la carpeta al portapapeles...
echo|set /p="%DEST_DIR%"|clip
echo       Listo! Ya puedes pegarla con Ctrl + V.
echo.

:: Detectar navegadores compatibles instalados
set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME_EXE if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"

set "EDGE_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined EDGE_EXE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "EDGE_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

set "BRAVE_EXE="
if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE if exist "%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe"
if not defined BRAVE_EXE if exist "%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BRAVE_EXE=%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe"

set "OPERA_EXE="
if exist "%LocalAppData%\Programs\Opera\opera.exe" set "OPERA_EXE=%LocalAppData%\Programs\Opera\opera.exe"
if not defined OPERA_EXE if exist "%LocalAppData%\Programs\Opera GX\opera.exe" set "OPERA_EXE=%LocalAppData%\Programs\Opera GX\opera.exe"

echo [3/3] Elige tu navegador para abrir la pagina de Extensiones:
echo.
if defined CHROME_EXE echo   [1] Google Chrome
if not defined CHROME_EXE echo   [1] Google Chrome (no detectado)
if defined EDGE_EXE echo   [2] Microsoft Edge
if not defined EDGE_EXE echo   [2] Microsoft Edge (no detectado)
if defined BRAVE_EXE echo   [3] Brave
if not defined BRAVE_EXE echo   [3] Brave (no detectado)
if defined OPERA_EXE echo   [4] Opera / Opera GX
if not defined OPERA_EXE echo   [4] Opera / Opera GX (no detectado)
echo   [5] Solo abrir la carpeta instalada
echo.

set /p "CHOICE=Escribe el numero y pulsa Enter (por defecto 1): "
if "%CHOICE%"=="" set "CHOICE=1"

if "%CHOICE%"=="1" if defined CHROME_EXE (
    start "" "%CHROME_EXE%" "chrome://extensions"
    goto :instructions
)
if "%CHOICE%"=="2" if defined EDGE_EXE (
    start "" "%EDGE_EXE%" "edge://extensions"
    goto :instructions
)
if "%CHOICE%"=="3" if defined BRAVE_EXE (
    start "" "%BRAVE_EXE%" "brave://extensions"
    goto :instructions
)
if "%CHOICE%"=="4" if defined OPERA_EXE (
    start "" "%OPERA_EXE%" "opera://extensions"
    goto :instructions
)

explorer "%DEST_DIR%"

:instructions
echo.
echo ============================================================
echo   SIGUIENTES 3 PASOS EN TU NAVEGADOR:
echo ============================================================
echo   1. Activa el "Modo de desarrollador" (arriba a la derecha).
echo   2. Haz clic en "Cargar descomprimida" (arriba a la izquierda).
echo   3. Presiona Ctrl + V en la barra de carpeta (ya esta copiada)
echo      y pulsa "Seleccionar carpeta".
echo.
echo   * Si solo estas ACTUALIZANDO una version anterior, unicamente
echo     pulsa el boton de recargar (flecha circular) en la tarjeta
echo     de la extension.
echo ============================================================
echo.
pause
