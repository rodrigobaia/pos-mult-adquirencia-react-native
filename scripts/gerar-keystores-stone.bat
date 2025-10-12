@echo off
REM ############################################################################
REM Script para Gerar Keystores Stone - PDV Piloto (Windows)
REM 
REM Gera keystores para todos os fabricantes Stone automaticamente
REM 
REM ATENÇÃO: Este script contém senha hardcoded
REM Use apenas em ambiente SEGURO e DELETE após usar
REM
REM Uso: gerar-keystores-stone.bat
REM ############################################################################

setlocal enabledelayedexpansion

REM Configurações
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set MANUFACTURERS_DIR=%PROJECT_ROOT%\pdv-piloto-app\android\manufacturers\stone

REM Senha para todos os keystores
set KEYSTORE_PASSWORD=g7zt@f$kJg^|J.d^^UGbLo

REM Informações do certificado
set DNAME_CN=Nebula Sistemas
set DNAME_OU=Mobile Development
set DNAME_O=Nebula Sistemas Ltda
set DNAME_L=Betim
set DNAME_ST=MG
set DNAME_C=BR

REM Fabricantes
set MANUFACTURERS=gertec ingenico positivo sunmi tectoy

REM ============================================================================
REM Main
REM ============================================================================

echo.
echo ================================================================
echo   PDV Piloto - Gerar Keystores Stone
echo   Gerando keystores para 5 fabricantes
echo ================================================================
echo.

REM Aviso de segurança
echo [WARNING] ATENÇÃO:
echo   Este script irá gerar keystores para TODOS os fabricantes Stone.
echo   Os keystores serão protegidos por senha.
echo.
echo   Certifique-se de fazer BACKUP após a geração!
echo.
set /p CONFIRM="Continuar? (s/N): "
if /i not "%CONFIRM%"=="s" (
    echo Operação cancelada.
    exit /b 0
)

echo.

REM Verificar keytool
where keytool >nul 2>&1
if errorlevel 1 (
    echo [ERROR] keytool não encontrado!
    echo.
    echo Instale o JDK 17 de: https://adoptium.net/
    echo.
    exit /b 1
)

echo [SUCCESS] keytool encontrado
echo.

REM Gerar keystores
set success_count=0
set fail_count=0

for %%m in (%MANUFACTURERS%) do (
    call :generate_keystore %%m
    if errorlevel 1 (
        set /a fail_count+=1
    ) else (
        set /a success_count+=1
    )
)

REM Resumo
call :show_summary

if !fail_count! equ 0 (
    echo.
    echo [SUCCESS] Todos os keystores gerados com sucesso!
    echo.
) else (
    echo.
    echo [ERROR] Alguns keystores falharam: !fail_count!
    echo.
    exit /b 1
)

goto :end

REM ============================================================================
REM Funções
REM ============================================================================

:generate_keystore
set manufacturer=%1
set manufacturer_dir=%MANUFACTURERS_DIR%\%manufacturer%
set keystore_file=%manufacturer_dir%\%manufacturer%-keystore.jks
set properties_file=%manufacturer_dir%\%manufacturer%-keystore.properties
set key_alias=%manufacturer%_key

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Fabricante: %manufacturer%
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Verificar se já existe
if exist "%keystore_file%" (
    echo [WARNING] Keystore já existe: %manufacturer%-keystore.jks
    set /p OVERWRITE="Sobrescrever? (s/N): "
    if /i not "!OVERWRITE!"=="s" (
        echo [INFO] Pulando %manufacturer%
        exit /b 0
    )
    del "%keystore_file%"
)

echo [INFO] Gerando keystore para %manufacturer%...

REM Montar DNAME
set "DNAME=CN=%DNAME_CN%, OU=%DNAME_OU%, O=%DNAME_O%, L=%DNAME_L%, ST=%DNAME_ST%, C=%DNAME_C%"

REM Gerar keystore
keytool -genkey -v ^
    -keystore "%keystore_file%" ^
    -alias %key_alias% ^
    -keyalg RSA ^
    -keysize 2048 ^
    -validity 10000 ^
    -storepass "%KEYSTORE_PASSWORD%" ^
    -keypass "%KEYSTORE_PASSWORD%" ^
    -dname "%DNAME%" 2>nul

if exist "%keystore_file%" (
    echo [SUCCESS] Keystore criado: %manufacturer%-keystore.jks
    
    REM Criar arquivo de propriedades
    echo [INFO] Criando arquivo de propriedades...
    
    (
        echo # %manufacturer% Keystore Configuration
        echo # Gerado automaticamente em %date% %time%
        echo.
        echo # Arquivo do keystore ^(relativo a este diretório^)
        echo storeFile=%manufacturer%-keystore.jks
        echo.
        echo # Senha do armazenamento de chaves
        echo storePassword=%KEYSTORE_PASSWORD%
        echo.
        echo # Alias da chave
        echo keyAlias=%key_alias%
        echo.
        echo # Senha da chave
        echo keyPassword=%KEYSTORE_PASSWORD%
    ) > "%properties_file%"
    
    echo [SUCCESS] Propriedades criadas: %manufacturer%-keystore.properties
    
    REM Verificar keystore
    echo [INFO] Verificando keystore...
    keytool -list -keystore "%keystore_file%" -storepass "%KEYSTORE_PASSWORD%" >nul 2>&1
    if not errorlevel 1 (
        echo [SUCCESS] Keystore válido
    ) else (
        echo [ERROR] Erro ao verificar keystore
        exit /b 1
    )
    
) else (
    echo [ERROR] Falha ao criar keystore
    exit /b 1
)

exit /b 0

:show_summary
echo.
echo ═══════════════════════════════════════════════════════════
echo   Keystores Gerados
echo ═══════════════════════════════════════════════════════════
echo.

set count=0
for %%m in (%MANUFACTURERS%) do (
    set keystore_file=%MANUFACTURERS_DIR%\%%m\%%m-keystore.jks
    if exist "!keystore_file!" (
        echo   ✓ %%m: %%m-keystore.jks
        set /a count+=1
    ) else (
        echo   ✗ %%m: não gerado
    )
)

echo.
echo Total: !count!/5 keystores gerados
echo.
echo ════════════════════════════════════════════════════════════
echo   Próximos Passos
echo ════════════════════════════════════════════════════════════
echo.
echo 1. FAZER BACKUP dos keystores e propriedades (IMPORTANTE!)
echo    Guardar em: 1Password, Azure Vault, ou cofre seguro
echo.
echo 2. Gerar APKs release:
echo    scripts\build-stone-release.bat all
echo.
echo 3. APKs assinados estarão em:
echo    apks\release\
echo.
echo [WARNING] SEGURANÇA:
echo   - Keystores e .properties NÃO estão no Git (protegidos)
echo   - Faça backup IMEDIATO em local seguro
echo   - Se perder keystores = impossível atualizar apps
echo.
goto :eof

:end
endlocal

