#!/bin/bash

# ============================================================================
# Script para Build por Adquirente - Arquitetura Mono-Adquirente
# ============================================================================
# 
# Este script permite compilar APKs específicos para cada adquirente:
# - stone: APK para dispositivos Stone
# - cielo: APK para dispositivos Cielo LIO
#
# Uso: ./build-by-acquirer.sh <adquirente> <fabricante> <tipo>
# Exemplo: ./build-by-acquirer.sh stone positivo debug
# ============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 <adquirente> <fabricante> <tipo>"
    echo ""
    echo "Parâmetros:"
    echo "  adquirente: stone | cielo"
    echo "  fabricante: gertec | ingenico | positivo | sunmi | tectoy | getnet | rede | pagseguro"
    echo "  tipo: debug | release"
    echo ""
    echo "Exemplos:"
    echo "  $0 stone positivo debug"
    echo "  $0 cielo getnet release"
    echo ""
    echo "Adquirentes disponíveis:"
    echo "  stone: Gertec, Ingenico, Positivo, Sunmi, Tectoy"
    echo "  cielo: GetNet, Rede, PagSeguro (futuro)"
}

# Verificar parâmetros
if [ $# -ne 3 ]; then
    print_error "Número incorreto de parâmetros!"
    show_help
    exit 1
fi

ACQUIRER=$1
MANUFACTURER=$2
BUILD_TYPE=$3

# Validar adquirente
case $ACQUIRER in
    stone|cielo)
        ;;
    *)
        print_error "Adquirente inválida: $ACQUIRER"
        show_help
        exit 1
        ;;
esac

# Validar fabricante
case $ACQUIRER in
    stone)
        case $MANUFACTURER in
            gertec|ingenico|positivo|sunmi|tectoy)
                ;;
            *)
                print_error "Fabricante inválido para Stone: $MANUFACTURER"
                print_info "Fabricantes válidos para Stone: gertec, ingenico, positivo, sunmi, tectoy"
                exit 1
                ;;
        esac
        ;;
    cielo)
        case $MANUFACTURER in
            getnet|rede|pagseguro)
                ;;
            *)
                print_error "Fabricante inválido para Cielo: $MANUFACTURER"
                print_info "Fabricantes válidos para Cielo: getnet, rede, pagseguro"
                exit 1
                ;;
        esac
        ;;
esac

# Validar tipo de build
case $BUILD_TYPE in
    debug|release)
        ;;
    *)
        print_error "Tipo de build inválido: $BUILD_TYPE"
        print_info "Tipos válidos: debug, release"
        exit 1
        ;;
esac

# Navegar para o diretório do app
cd "$(dirname "$0")/../pdv-piloto-app"

print_info "Iniciando build para $ACQUIRER-$MANUFACTURER-$BUILD_TYPE"

# Verificar se keystore existe (apenas para release)
if [ "$BUILD_TYPE" = "release" ]; then
    KEYSTORE_FILE="android/manufacturers/$ACQUIRER/$MANUFACTURER/${MANUFACTURER}-keystore.properties"
    if [ ! -f "$KEYSTORE_FILE" ]; then
        print_error "Keystore não encontrado: $KEYSTORE_FILE"
        print_info "Execute primeiro: ./scripts/gerar-keystores-$ACQUIRER.sh"
        exit 1
    fi
fi

# Executar build
print_info "Executando: ./gradlew assemble${ACQUIRER^}${MANUFACTURER^}${BUILD_TYPE^}"

if ./gradlew "assemble${ACQUIRER^}${MANUFACTURER^}${BUILD_TYPE^}"; then
    print_success "Build concluído com sucesso!"
    
    # Encontrar APK gerado
    APK_PATH=$(find android/app/build/outputs/apk -name "*${ACQUIRER}*${MANUFACTURER}*${BUILD_TYPE}*.apk" | head -1)
    
    if [ -n "$APK_PATH" ]; then
        print_success "APK gerado: $APK_PATH"
        
        # Copiar para diretório de output
        OUTPUT_DIR="build-outputs"
        mkdir -p "$OUTPUT_DIR"
        
        APK_NAME=$(basename "$APK_PATH")
        cp "$APK_PATH" "$OUTPUT_DIR/"
        
        print_success "APK copiado para: $OUTPUT_DIR/$APK_NAME"
    else
        print_warning "APK não encontrado no diretório de output"
    fi
else
    print_error "Build falhou!"
    exit 1
fi
