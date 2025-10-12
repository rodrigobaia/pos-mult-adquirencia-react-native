@echo off
REM ############################################################################
REM Script de Build RELEASE - PDV Piloto (Windows)
REM 
REM Gera APKs release ASSINADOS para Stone com nomenclatura padronizada
REM Requer keystores configurados em android/manufacturers/stone/[fabricante]/
REM
REM Uso: build-stone-release.bat [fabricante|all]
REM
REM Exemplos:
REM   build-stone-release.bat positivo    - Build Stone Positivo
REM   build-stone-release.bat all         - Build Stone todos fabricantes
REM ############################################################################

setlocal enabledelayedexpansion

REM Configurações
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set ANDROID_DIR=%PROJECT_ROOT%\pdv-piloto-app\android
set APP_DIR=%ANDROID_DIR%\app
set BUILD_DIR=%APP_DIR%\build\outputs\apk
set MANUFACTURERS_DIR=%ANDROID_DIR%\manufacturers

set ACQUIRER=stone
set VERSION_CODE=1
set VERSION_NAME=1.0.0
set OUTPUT_DIR=%PROJECT_ROOT%\builds\release\%ACQUIRER%

REM Fabricantes Stone
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
echo [SUCCESS] Build release concluído!
echo.

goto :end

REM ============================================================================
REM Funções
REM ============================================================================

:print_header
echo ================================================================
echo   PDV Piloto - Build RELEASE (Assinado)
echo   Adquirente: STONE
echo   Versão: v%VERSION_CODE% - %VERSION_NAME%
echo ================================================================
goto :eof

:check_keystore
set mf=%1
set KEYSTORE_DIR=%MANUFACTURERS_DIR%\stone\%mf%
set KEYSTORE_FILE=%KEYSTORE_DIR%\%mf%-release.keystore
set KEYSTORE_PROPS=%KEYSTORE_DIR%\%mf%-keystore.properties

if not exist "%KEYSTORE_FILE%" (
    echo [ERROR] Keystore não encontrado: %KEYSTORE_FILE%
    echo.
    echo Crie o keystore com:
    echo keytool -genkey -v -keystore "%KEYSTORE_FILE%" ^
    echo   -alias %mf%_key ^
    echo   -keyalg RSA -keysize 2048 -validity 10000
    echo.
    exit /b 1
)

if not exist "%KEYSTORE_PROPS%" (
    echo [ERROR] Arquivo de propriedades não encontrado: %KEYSTORE_PROPS%
    echo.
    echo Crie o arquivo com:
    echo storeFile=%mf%-release.keystore
    echo storePassword=YOUR_STORE_PASSWORD
    echo keyAlias=%mf%_key
    echo keyPassword=YOUR_KEY_PASSWORD
    echo.
    exit /b 1
)

goto :eof

:build_manufacturer_release
set mf=%1
set variant=%mf%Release

echo [INFO] Verificando keystore para %mf%...
call :check_keystore %mf%
if errorlevel 1 exit /b 1

echo [SUCCESS] Keystore encontrado
echo [INFO] Building %variant%...

cd "%ANDROID_DIR%"
call gradlew assemble%variant% --quiet

if errorlevel 1 (
    echo [ERROR] Falha no build release %mf%
    exit /b 1
) else (
    echo [SUCCESS] Build %mf% release concluído
)

REM Copiar e renomear APK
set ORIGINAL_APK=%BUILD_DIR%\%mf%\release\app-%mf%-release.apk
set NEW_NAME=pdv-piloto-%ACQUIRER%-v%VERSION_CODE%-%VERSION_NAME%-%mf%.apk
set DESTINATION=%OUTPUT_DIR%\!NEW_NAME!

if exist "!ORIGINAL_APK!" (
    copy "!ORIGINAL_APK!" "!DESTINATION!" >nul
    echo [SUCCESS] APK assinado: !NEW_NAME!
) else (
    echo [ERROR] APK não encontrado: !ORIGINAL_APK!
    exit /b 1
)

goto :eof

:build_all
echo [INFO] Building TODOS os fabricantes Stone...
echo.

for %%m in (%MANUFACTURERS%) do (
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo   Fabricante: %%m
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    call :build_manufacturer_release %%m
    echo.
)
goto :eof

:build_specific
call :build_manufacturer_release %1
goto :eof

:list_apks
echo.
echo ═══════════════════════════════════════════════════════════
echo   APKs Release Assinados
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
echo Pronto para produção!
echo.
goto :eof

:end
endlocal

