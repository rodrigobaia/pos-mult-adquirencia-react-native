@echo off
REM ############################################################################
REM Script de Build DEBUG - PDV Piloto (Windows)
REM 
REM Gera APKs debug para Stone com nomenclatura padronizada
REM Uso: build-debug.bat [fabricante|all]
REM
REM Exemplos:
REM   build-debug.bat positivo    - Build apenas Positivo
REM   build-debug.bat all         - Build todos os fabricantes
REM ############################################################################

setlocal enabledelayedexpansion

REM Configurações
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set ANDROID_DIR=%PROJECT_ROOT%\pdv-piloto-app\android
set APP_DIR=%ANDROID_DIR%\app
set BUILD_DIR=%APP_DIR%\build\outputs\apk
set OUTPUT_DIR=%PROJECT_ROOT%\apks\debug

set ACQUIRER=stone
set VERSION_CODE=1
set VERSION_NAME=1.0.0

REM Fabricantes
set MANUFACTURERS=gertec ingenico positivo sunmi tectoy

REM ============================================================================
REM Main
REM ============================================================================

call :print_header

set MANUFACTURER=%1
if "%MANUFACTURER%"=="" set MANUFACTURER=all

echo.
echo [INFO] Limpando builds anteriores...
cd "%ANDROID_DIR%"
call gradlew clean >nul 2>&1

echo [INFO] Preparando diretório de output...
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo.

if "%MANUFACTURER%"=="all" (
    call :build_all
) else (
    call :build_specific %MANUFACTURER%
)

call :list_apks

echo.
echo [SUCCESS] Build concluído!

echo.
echo [INFO] Copiando APKs para pasta centralizada...
call "%SCRIPT_DIR%copy-apks.bat"

echo.

goto :end

REM ============================================================================
REM Funções
REM ============================================================================

:print_header
echo ================================================================
echo   PDV Piloto - Build DEBUG
echo   Adquirente: %ACQUIRER%
echo   Versão: v%VERSION_CODE% - %VERSION_NAME%
echo ================================================================
goto :eof

:build_manufacturer
set mf=%1
set variant=%mf%Debug
set variant=!variant:~0,1!!variant:~1!

echo [INFO] Building %variant%...

cd "%ANDROID_DIR%"
call gradlew assemble%variant% --quiet

if errorlevel 1 (
    echo [ERROR] Falha no build %mf%
    exit /b 1
) else (
    echo [SUCCESS] Build %mf% concluído
)

REM Copiar e renomear APK
set ORIGINAL_APK=%BUILD_DIR%\%mf%\debug\app-%mf%-debug.apk
set NEW_NAME=pdv-piloto-%ACQUIRER%-v%VERSION_CODE%-%VERSION_NAME%-%mf%-debug.apk
set DESTINATION=%OUTPUT_DIR%\!NEW_NAME!

if exist "!ORIGINAL_APK!" (
    copy "!ORIGINAL_APK!" "!DESTINATION!" >nul
    echo [SUCCESS] APK copiado: !NEW_NAME!
) else (
    echo [ERROR] APK não encontrado: !ORIGINAL_APK!
    exit /b 1
)

goto :eof

:build_all
echo [INFO] Building TODOS os fabricantes...
echo.

for %%m in (%MANUFACTURERS%) do (
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo   Fabricante: %%m
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    call :build_manufacturer %%m
    echo.
)
goto :eof

:build_specific
call :build_manufacturer %1
goto :eof

:list_apks
echo.
echo ═══════════════════════════════════════════════════════════
echo   APKs Gerados
echo ═══════════════════════════════════════════════════════════
echo.

if exist "%OUTPUT_DIR%\*.apk" (
    for %%f in ("%OUTPUT_DIR%\*.apk") do (
        echo   ▸ %%~nxf
    )
) else (
    echo   [WARNING] Nenhum APK encontrado
)

echo.
echo Localização: %OUTPUT_DIR%
echo.
goto :eof

:end
endlocal

