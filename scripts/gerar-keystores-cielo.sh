#!/bin/bash

# ============================================================================
# Script para Gerar Keystores Cielo LIO
# ============================================================================
# 
# Este script gera os keystores necessários para assinar APKs da Cielo LIO
# para os fabricantes Ingenico e Positivo
#
# Uso: ./gerar-keystores-cielo.sh
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

# Navegar para o diretório do app
cd "$(dirname "$0")/../pdv-piloto-app"

print_info "Gerando keystores para Cielo LIO..."

# Função para gerar keystore
generate_keystore() {
    local manufacturer=$1
    local keystore_path="android/manufacturers/cielo/$manufacturer"
    local keystore_file="$keystore_path/${manufacturer}-keystore.jks"
    local properties_file="$keystore_path/${manufacturer}-keystore.properties"
    
    print_info "Gerando keystore para Cielo $manufacturer..."
    
    # Verificar se keystore já existe
    if [ -f "$keystore_file" ]; then
        print_warning "Keystore já existe: $keystore_file"
        read -p "Deseja sobrescrever? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Pulando $manufacturer..."
            return
        fi
    fi
    
    # Criar diretório se não existir
    mkdir -p "$keystore_path"
    
    # Gerar keystore
    keytool -genkeypair \
        -v \
        -keystore "$keystore_file" \
        -alias "cielo-${manufacturer}-key" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "cielo_${manufacturer}_store_2025" \
        -keypass "cielo_${manufacturer}_key_2025" \
        -dname "CN=Cielo LIO $manufacturer, OU=PDV Piloto, O=Nebula Sistemas, L=São Paulo, ST=SP, C=BR"
    
    if [ $? -eq 0 ]; then
        print_success "Keystore gerado: $keystore_file"
        
        # Verificar se properties file já existe
        if [ -f "$properties_file" ]; then
            print_info "Arquivo properties já existe: $properties_file"
        else
            print_warning "Arquivo properties não encontrado. Verifique se está correto."
        fi
    else
        print_error "Falha ao gerar keystore para $manufacturer"
        return 1
    fi
}

# Gerar keystores para cada fabricante Cielo
generate_keystore "ingenico"
generate_keystore "positivo"

print_success "Keystores Cielo LIO gerados com sucesso!"
print_info "Localização: android/manufacturers/cielo/"
print_info ""
print_info "Fabricantes configurados:"
print_info "  - Ingenico: L300 (LIO V3), DX8000"
print_info "  - Positivo: L400"
print_info ""
print_warning "IMPORTANTE: Mantenha os keystores seguros!"
print_warning "NÃO commite os arquivos .jks em repositórios públicos!"
print_info ""
print_info "Para usar os keystores:"
print_info "  ./scripts/build-by-acquirer.sh cielo ingenico release"
print_info "  ./scripts/build-by-acquirer.sh cielo positivo release"
