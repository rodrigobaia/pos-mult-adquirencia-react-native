#!/bin/bash

################################################################################
# Script de Build STANDALONE (DEBUG) - PDV Piloto Stone
# 
# Gera APKs debug para Stone com nomenclatura padronizada
# Uso: ./build-stone-standalone.sh [fabricante|all]
#
# Exemplos:
#   ./build-stone-standalone.sh positivo    # Build apenas Positivo
#   ./build-stone-standalone.sh all         # Build todos os fabricantes
################################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/pdv-piloto-app/android"
APP_DIR="$ANDROID_DIR/app"
BUILD_DIR="$APP_DIR/build/outputs/apk"
OUTPUT_DIR="$PROJECT_ROOT/apks/debug"

# Informações do app (lidas do build.gradle)
ACQUIRER="stone"
VERSION_CODE=$(grep "versionCode" "$APP_DIR/build.gradle" | grep -v "//" | head -1 | awk '{print $2}')
VERSION_NAME=$(grep "versionName" "$APP_DIR/build.gradle" | grep -v "//" | head -1 | awk '{print $2}' | tr -d '"')

# Fabricantes disponíveis
MANUFACTURERS=("gertec" "ingenico" "positivo" "sunmi" "tectoy")

################################################################################
# Funções
################################################################################

print_header() {
    echo -e "${BLUE}"
    echo "════════════════════════════════════════════════════════════════"
    echo "  PDV Piloto - Build STANDALONE (DEBUG) Stone"
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

# Limpa build anterior
clean_build() {
    print_info "Limpando builds anteriores..."
    cd "$ANDROID_DIR"
    ./gradlew clean > /dev/null 2>&1 || true
    print_success "Build limpo"
}

# Cria diretório de output
prepare_output_dir() {
    print_info "Preparando diretório de output..."
    mkdir -p "$OUTPUT_DIR"
    print_success "Diretório pronto: $OUTPUT_DIR"
}

# Build de um fabricante específico
build_manufacturer() {
    local manufacturer=$1
    local variant="${manufacturer^}Debug"  # Primeira letra maiúscula
    
    print_info "Building ${manufacturer}Debug..."
    
    cd "$ANDROID_DIR"
    
    # Executar build
    if ./gradlew "assemble${variant}" --quiet; then
        print_success "Build ${manufacturer} concluído"
        return 0
    else
        print_error "Falha no build ${manufacturer}"
        return 1
    fi
}

# Copia e renomeia APK
copy_and_rename_apk() {
    local manufacturer=$1
    
    # APK original do Gradle
    local original_apk="$BUILD_DIR/${manufacturer}/debug/app-${manufacturer}-debug.apk"
    
    # Nome padronizado: pdv-piloto-[adquirente]-v[versionCode]-[versionName]-[fabricante]-debug.apk
    local new_name="pdv-piloto-${ACQUIRER}-v${VERSION_CODE}-${VERSION_NAME}-${manufacturer}-debug.apk"
    local destination="$OUTPUT_DIR/$new_name"
    
    if [ -f "$original_apk" ]; then
        cp "$original_apk" "$destination"
        
        # Informações do APK
        local size=$(du -h "$destination" | cut -f1)
        
        print_success "APK copiado: $new_name ($size)"
        return 0
    else
        print_error "APK não encontrado: $original_apk"
        return 1
    fi
}

# Build todos os fabricantes
build_all() {
    print_info "Building TODOS os fabricantes..."
    echo ""
    
    local success_count=0
    local fail_count=0
    
    for manufacturer in "${MANUFACTURERS[@]}"; do
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}  Fabricante: ${manufacturer^^}${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if build_manufacturer "$manufacturer"; then
            if copy_and_rename_apk "$manufacturer"; then
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
    local manufacturer=$1
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Fabricante: ${manufacturer^^}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if build_manufacturer "$manufacturer"; then
        copy_and_rename_apk "$manufacturer"
    else
        exit 1
    fi
}

# Lista APKs gerados
list_apks() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  APKs Standalone Gerados${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -d "$OUTPUT_DIR" ] && [ "$(ls -A $OUTPUT_DIR 2>/dev/null)" ]; then
        cd "$OUTPUT_DIR"
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
    echo -e "${BLUE}Localização: $OUTPUT_DIR${NC}"
    echo ""
}

################################################################################
# Main
################################################################################

main() {
    local manufacturer="${1:-all}"
    
    print_header
    
    # Validar fabricante
    if [ "$manufacturer" != "all" ]; then
        if [[ ! " ${MANUFACTURERS[@]} " =~ " ${manufacturer} " ]]; then
            print_error "Fabricante inválido: $manufacturer"
            echo ""
            echo "Fabricantes disponíveis:"
            for m in "${MANUFACTURERS[@]}"; do
                echo "  - $m"
            done
            echo "  - all (todos)"
            exit 1
        fi
    fi
    
    # Preparar ambiente
    clean_build
    prepare_output_dir
    
    echo ""
    
    # Build
    if [ "$manufacturer" = "all" ]; then
        build_all
    else
        build_specific "$manufacturer"
    fi
    
    # Listar APKs
    list_apks
    
    print_success "Build standalone concluído com sucesso!"
    
    # Copiar APKs para pasta centralizada
    echo ""
    print_info "Copiando APKs para pasta centralizada..."
    "$SCRIPT_DIR/copy-apks.sh"
    
    echo ""
}

# Executar
main "$@"
