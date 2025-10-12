@echo off
REM ############################################################################
REM Script para Organizar APKs - PDV Piloto (Windows)
REM 
REM Este script NÃO é mais necessário pois os builds já salvam direto em apks\
REM Mantido para compatibilidade e organização de APKs antigos
REM
REM Uso: copy-apks.bat
REM ############################################################################

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set APKS_DIR=%PROJECT_ROOT%\apks

echo.
echo ================================================================
echo   PDV Piloto - Estrutura de APKs
echo ================================================================
echo.

REM Criar estrutura se não existir
if not exist "%APKS_DIR%\debug" mkdir "%APKS_DIR%\debug"
if not exist "%APKS_DIR%\release" mkdir "%APKS_DIR%\release"

echo [SUCCESS] Estrutura de diretórios pronta
echo.

REM Listar APKs
echo ═══════════════════════════════════════════════════════════
echo   APKs Disponíveis
echo ═══════════════════════════════════════════════════════════
echo.

echo DEBUG:
if exist "%APKS_DIR%\debug\*.apk" (
    for %%f in ("%APKS_DIR%\debug\*.apk") do (
        echo   ▸ %%~nxf
    )
) else (
    echo   (nenhum)
)

echo.

echo RELEASE:
if exist "%APKS_DIR%\release\*.apk" (
    for %%f in ("%APKS_DIR%\release\*.apk") do (
        echo   ▸ %%~nxf
    )
) else (
    echo   (nenhum)
)

echo.
echo Localização Debug: %APKS_DIR%\debug
echo Localização Release: %APKS_DIR%\release
echo.

endlocal
