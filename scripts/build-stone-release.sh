#!/bin/bash

################################################################################
# Script de Build RELEASE - PDV Piloto
# 
# Gera APKs release ASSINADOS para produção com nomenclatura padronizada
# Requer keystores configurados em android/manufacturers/[adquirente]/[fabricante]/
#
# Uso: ./build-release.sh [adquirente] [fabricante|all]
#
# Exemplos:
#   ./build-release.sh stone positivo    # Build Stone Positivo
#   ./build-release.sh stone all         # Build Stone todos fabricantes
#   ./build-release.sh cielo ingenico    # Build Cielo Ingenico (futuro)
################################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/pdv-piloto-app/android"
APP_DIR="$ANDROID_DIR/app"
BUILD_DIR="$APP_DIR/build/outputs/apk"
MANUFACTURERS_DIR="$ANDROID_DIR/manufacturers"

# Informações do app (lidas do build.gradle)
VERSION_CODE=$(grep "versionCode" "$APP_DIR/build.gradle" | grep -v "//" | head -1 | awk '{print $2}')
VERSION_NAME=$(grep "versionName" "$APP_DIR/build.gradle" | grep -v "//" | head -1 | awk '{print $2}' | tr -d '"')

# Fabricantes disponíveis por adquirente
declare -A ACQUIRER_MANUFACTURERS
ACQUIRER_MANUFACTURERS[stone]="gertec ingenico positivo sunmi tectoy"
ACQUIRER_MANUFACTURERS[cielo]="getnet verifone"  # Futuro
ACQUIRER_MANUFACTURERS[pagseguro]="moderninha"   # Futuro

################################################################################
# Funções
################################################################################

print_header() {
    local acquirer=$1
    echo -e "${MAGENTA}"
    echo "════════════════════════════════════════════════════════════════"
    echo "  PDV Piloto - Build RELEASE (Assinado)"
    echo "  Adquirente: ${acquirer^^}"
    echo "  Versão: v$VERSION_CODE - $VERSION_NAME"
    echo "════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

# Verifica se keystore existe
check_keystore() {
    local acquirer=$1
    local manufacturer=$2
    
    local keystore_dir="$MANUFACTURERS_DIR/$acquirer/$manufacturer"
    local keystore_file="$keystore_dir/${manufacturer}-release.keystore"
    local keystore_props="$keystore_dir/${manufacturer}-keystore.properties"
    
    if [ ! -f "$keystore_file" ]; then
        print_error "Keystore não encontrado: $keystore_file"
        echo ""
        echo "  Crie o keystore com:"
        echo "  keytool -genkey -v -keystore $keystore_file \\"
        echo "    -alias ${manufacturer}_key \\"
        echo "    -keyalg RSA -keysize 2048 -validity 10000"
        echo ""
        return 1
    fi
    
    if [ ! -f "$keystore_props" ]; then
        print_error "Arquivo de propriedades não encontrado: $keystore_props"
        echo ""
        echo "  Crie o arquivo com:"
        echo "  storeFile=${manufacturer}-release.keystore"
        echo "  storePassword=YOUR_STORE_PASSWORD"
        echo "  keyAlias=${manufacturer}_key"
        echo "  keyPassword=YOUR_KEY_PASSWORD"
        echo ""
        return 1
    fi
    
    return 0
}

# Limpa build anterior
clean_build() {
    print_info "Limpando builds anteriores..."
    cd "$ANDROID_DIR"
    ./gradlew clean > /dev/null 2>&1 || true
    print_success "Build limpo"
}

# Cria diretório de output
prepare_output_dir() {
    local acquirer=$1
    local output_dir="$PROJECT_ROOT/apks/release"
    
    print_info "Preparando diretório de output..."
    mkdir -p "$output_dir"
    
    echo "$output_dir"
}

# Build de um fabricante específico (RELEASE)
build_manufacturer_release() {
    local acquirer=$1
    local manufacturer=$2
    local variant="${manufacturer^}Release"  # Primeira letra maiúscula
    
    print_info "Verificando keystore para ${manufacturer}..."
    
    if ! check_keystore "$acquirer" "$manufacturer"; then
        return 1
    fi
    
    print_success "Keystore encontrado"
    print_info "Building ${manufacturer}Release..."
    
    cd "$ANDROID_DIR"
    
    # Executar build release
    if ./gradlew "assemble${variant}" --quiet; then
        print_success "Build ${manufacturer} release concluído"
        return 0
    else
        print_error "Falha no build release ${manufacturer}"
        return 1
    fi
}

# Copia e renomeia APK release
copy_and_rename_apk_release() {
    local acquirer=$1
    local manufacturer=$2
    local output_dir=$3
    
    # APK original do Gradle
    local original_apk="$BUILD_DIR/${manufacturer}/release/app-${manufacturer}-release.apk"
    
    # Nome padronizado: pdv-piloto-[adquirente]-v[versionCode]-[versionName]-[fabricante].apk
    local new_name="pdv-piloto-${acquirer}-v${VERSION_CODE}-${VERSION_NAME}-${manufacturer}.apk"
    local destination="$output_dir/$new_name"
    
    if [ -f "$original_apk" ]; then
        cp "$original_apk" "$destination"
        
        # Informações do APK
        local size=$(du -h "$destination" | cut -f1)
        
        print_success "APK assinado: $new_name ($size)"
        
        # Verificar assinatura
        if command -v apksigner &> /dev/null; then
            print_info "Verificando assinatura..."
            if apksigner verify "$destination" > /dev/null 2>&1; then
                print_success "Assinatura válida ✓"
            else
                print_warning "Falha na verificação de assinatura"
            fi
        fi
        
        return 0
    else
        print_error "APK não encontrado: $original_apk"
        return 1
    fi
}

# Build todos os fabricantes
build_all() {
    local acquirer=$1
    local output_dir=$2
    local manufacturers=${ACQUIRER_MANUFACTURERS[$acquirer]}
    
    print_info "Building TODOS os fabricantes $acquirer..."
    echo ""
    
    local success_count=0
    local fail_count=0
    
    for manufacturer in $manufacturers; do
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Fabricante: ${manufacturer^^}${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if build_manufacturer_release "$acquirer" "$manufacturer"; then
            if copy_and_rename_apk_release "$acquirer" "$manufacturer" "$output_dir"; then
                ((success_count++))
            else
                ((fail_count++))
            fi
        else
            ((fail_count++))
        fi
        
        echo ""
    done
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Sucessos: $success_count${NC}"
    if [ $fail_count -gt 0 ]; then
        echo -e "${RED}✗ Falhas: $fail_count${NC}"
    fi
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Build fabricante específico
build_specific() {
    local acquirer=$1
    local manufacturer=$2
    local output_dir=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Fabricante: ${manufacturer^^}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if build_manufacturer_release "$acquirer" "$manufacturer"; then
        copy_and_rename_apk_release "$acquirer" "$manufacturer" "$output_dir"
    else
        exit 1
    fi
}

# Lista APKs gerados
list_apks() {
    local output_dir=$1
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  APKs Release Assinados${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -d "$output_dir" ] && [ "$(ls -A $output_dir 2>/dev/null)" ]; then
        cd "$output_dir"
        for apk in *.apk; do
            if [ -f "$apk" ]; then
                local size=$(du -h "$apk" | cut -f1)
                echo -e "  ${GREEN}▸${NC} $apk ${BLUE}($size)${NC}"
            fi
        done
    else
        print_warning "Nenhum APK encontrado"
    fi
    
    echo ""
    echo -e "${BLUE}Localização: $output_dir${NC}"
    echo -e "${MAGENTA}Pronto para produção! ✓${NC}"
    echo ""
}

# Mostra instruções de keystore
show_keystore_help() {
    local acquirer=$1
    local manufacturers=${ACQUIRER_MANUFACTURERS[$acquirer]}
    
    echo ""
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  KEYSTORES NÃO CONFIGURADOS${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Para builds release, você precisa criar keystores para cada fabricante:"
    echo ""
    
    for manufacturer in $manufacturers; do
        local keystore_dir="$MANUFACTURERS_DIR/$acquirer/$manufacturer"
        local keystore_file="$keystore_dir/${manufacturer}-release.keystore"
        
        echo -e "${BLUE}━━━ ${manufacturer^^} ━━━${NC}"
        echo ""
        echo "1. Gerar keystore:"
        echo ""
        echo "   keytool -genkey -v -keystore $keystore_file \\"
        echo "     -alias ${manufacturer}_key \\"
        echo "     -keyalg RSA -keysize 2048 -validity 10000"
        echo ""
        echo "2. Criar arquivo de propriedades:"
        echo "   $keystore_dir/${manufacturer}-keystore.properties"
        echo ""
        echo "   Conteúdo:"
        echo "   storeFile=${manufacturer}-release.keystore"
        echo "   storePassword=YOUR_STORE_PASSWORD"
        echo "   keyAlias=${manufacturer}_key"
        echo "   keyPassword=YOUR_KEY_PASSWORD"
        echo ""
    done
    
    echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

################################################################################
# Main
################################################################################

main() {
    local acquirer="${1:-}"
    local manufacturer="${2:-all}"
    
    # Validar parâmetros
    if [ -z "$acquirer" ]; then
        print_error "Adquirente não especificada"
        echo ""
        echo "Uso: $0 [adquirente] [fabricante|all]"
        echo ""
        echo "Adquirentes disponíveis:"
        for acq in "${!ACQUIRER_MANUFACTURERS[@]}"; do
            echo "  - $acq"
        done
        echo ""
        exit 1
    fi
    
    # Verificar se adquirente existe
    if [ -z "${ACQUIRER_MANUFACTURERS[$acquirer]}" ]; then
        print_error "Adquirente inválida: $acquirer"
        echo ""
        echo "Adquirentes disponíveis:"
        for acq in "${!ACQUIRER_MANUFACTURERS[@]}"; do
            echo "  - $acq"
        done
        exit 1
    fi
    
    local manufacturers=${ACQUIRER_MANUFACTURERS[$acquirer]}
    
    # Validar fabricante
    if [ "$manufacturer" != "all" ]; then
        if [[ ! " $manufacturers " =~ " $manufacturer " ]]; then
            print_error "Fabricante inválido para $acquirer: $manufacturer"
            echo ""
            echo "Fabricantes disponíveis para $acquirer:"
            for m in $manufacturers; do
                echo "  - $m"
            done
            echo "  - all (todos)"
            exit 1
        fi
    fi
    
    print_header "$acquirer"
    
    # Preparar ambiente
    clean_build
    local output_dir=$(prepare_output_dir "$acquirer")
    
    echo ""
    
    # Build
    if [ "$manufacturer" = "all" ]; then
        build_all "$acquirer" "$output_dir"
    else
        build_specific "$acquirer" "$manufacturer" "$output_dir"
    fi
    
    # Listar APKs
    list_apks "$output_dir"
    
    print_success "Build release concluído!"
    
    # Copiar APKs para pasta centralizada
    echo ""
    print_info "Copiando APKs para pasta centralizada..."
    "$SCRIPT_DIR/copy-apks.sh"
    
    echo ""
}

# Trap para mostrar ajuda de keystore em caso de erro
trap 'if [ $? -ne 0 ]; then show_keystore_help "${1:-stone}"; fi' EXIT

# Executar
main "$@"

