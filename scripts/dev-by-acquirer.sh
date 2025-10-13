#!/bin/bash

# ============================================================================
# Script para Desenvolvimento por Adquirente
# ============================================================================
# 
# Este script permite executar o app em modo desenvolvimento para uma adquirente específica
# Útil quando você tem um dispositivo conectado de uma adquirente específica
#
# Uso: ./dev-by-acquirer.sh <adquirente> <fabricante>
# Exemplo: ./dev-by-acquirer.sh stone positivo
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
    echo "Uso: $0 <adquirente> <fabricante>"
    echo ""
    echo "Parâmetros:"
    echo "  adquirente: stone | cielo"
    echo "  fabricante: gertec | ingenico | positivo | sunmi | tectoy | getnet | rede | pagseguro"
    echo ""
    echo "Exemplos:"
    echo "  $0 stone positivo"
    echo "  $0 cielo getnet"
    echo ""
    echo "Este script irá:"
    echo "  1. Compilar o app para a adquirente especificada"
    echo "  2. Instalar no dispositivo conectado"
    echo "  3. Iniciar o Metro bundler"
}

# Verificar parâmetros
if [ $# -ne 2 ]; then
    print_error "Número incorreto de parâmetros!"
    show_help
    exit 1
fi

ACQUIRER=$1
MANUFACTURER=$2

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

# Navegar para o diretório do app
cd "$(dirname "$0")/../pdv-piloto-app"

print_info "Iniciando desenvolvimento para $ACQUIRER-$MANUFACTURER"

# Verificar se dispositivo está conectado
if ! adb devices | grep -q "device$"; then
    print_error "Nenhum dispositivo conectado!"
    print_info "Conecte um dispositivo e execute: adb devices"
    exit 1
fi

# Compilar e instalar
print_info "Compilando e instalando app..."
if ./gradlew "install${ACQUIRER^}${MANUFACTURER^}Debug"; then
    print_success "App instalado com sucesso!"
else
    print_error "Falha ao instalar app!"
    exit 1
fi

# Configurar reverse proxy para Metro
print_info "Configurando reverse proxy para Metro..."
adb reverse tcp:8081 tcp:8081

# Iniciar Metro bundler
print_info "Iniciando Metro bundler..."
print_info "Pressione Ctrl+C para parar"
print_info "App configurado para: $ACQUIRER-$MANUFACTURER"

# Iniciar Metro
npx react-native start
