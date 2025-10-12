#!/bin/bash

################################################################################
# Script para Gerar Keystores Stone - PDV Piloto
# 
# Gera keystores para todos os fabricantes Stone automaticamente
# 
# ATENÇÃO: Este script contém senha hardcoded
# Use apenas em ambiente SEGURO e DELETE após usar
#
# Uso: ./gerar-keystores-stone.sh
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
MANUFACTURERS_DIR="$PROJECT_ROOT/pdv-piloto-app/android/manufacturers/stone"

# Senha para todos os keystores (fornecida pelo usuário)
KEYSTORE_PASSWORD="g7zt@f\$kJg|J.d^UGbLo"

# Informações do certificado
DNAME_CN="Nebula Sistemas"
DNAME_OU="Mobile Development"
DNAME_O="Nebula Sistemas Ltda"
DNAME_L="Betim"
DNAME_ST="MG"
DNAME_C="BR"

# Fabricantes
MANUFACTURERS=("gertec" "ingenico" "positivo" "sunmi" "tectoy")

################################################################################
# Funções
################################################################################

print_header() {
    echo -e "${MAGENTA}"
    echo "════════════════════════════════════════════════════════════════"
    echo "  PDV Piloto - Gerar Keystores Stone"
    echo "  Gerando keystores para 5 fabricantes"
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

# Gera keystore para um fabricante
generate_keystore() {
    local manufacturer=$1
    local manufacturer_dir="$MANUFACTURERS_DIR/$manufacturer"
    local keystore_file="$manufacturer_dir/${manufacturer}-keystore.jks"
    local properties_file="$manufacturer_dir/${manufacturer}-keystore.properties"
    local key_alias="${manufacturer}_key"
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Fabricante: ${manufacturer^^}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Verificar se já existe
    if [ -f "$keystore_file" ]; then
        print_warning "Keystore já existe: ${manufacturer}-keystore.jks"
        read -p "Sobrescrever? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Pulando $manufacturer"
            return 0
        fi
        rm -f "$keystore_file"
    fi
    
    print_info "Gerando keystore para $manufacturer..."
    
    # Montar DNAME
    local dname="CN=$DNAME_CN, OU=$DNAME_OU, O=$DNAME_O, L=$DNAME_L, ST=$DNAME_ST, C=$DNAME_C"
    
    # Gerar keystore
    # Usar expect ou processo batch para automatizar input
    keytool -genkey -v \
        -keystore "$keystore_file" \
        -alias "$key_alias" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEYSTORE_PASSWORD" \
        -dname "$dname" \
        2>&1 | grep -v "Warning" || true
    
    if [ -f "$keystore_file" ]; then
        print_success "Keystore criado: ${manufacturer}-keystore.jks"
        
        # Criar arquivo de propriedades
        print_info "Criando arquivo de propriedades..."
        
        cat > "$properties_file" << EOF
# ${manufacturer^} Keystore Configuration
# Gerado automaticamente em $(date '+%d/%m/%Y %H:%M:%S')

# Arquivo do keystore (relativo a este diretório)
storeFile=${manufacturer}-keystore.jks

# Senha do armazenamento de chaves
storePassword=$KEYSTORE_PASSWORD

# Alias da chave
keyAlias=$key_alias

# Senha da chave
keyPassword=$KEYSTORE_PASSWORD
EOF
        
        print_success "Propriedades criadas: ${manufacturer}-keystore.properties"
        
        # Proteger arquivos (apenas owner pode ler)
        chmod 600 "$keystore_file" 2>/dev/null || true
        chmod 600 "$properties_file" 2>/dev/null || true
        
        # Verificar keystore
        print_info "Verificando keystore..."
        if keytool -list -keystore "$keystore_file" -storepass "$KEYSTORE_PASSWORD" > /dev/null 2>&1; then
            print_success "Keystore válido ✓"
            
            # Mostrar SHA256
            local sha256=$(keytool -list -v -keystore "$keystore_file" -storepass "$KEYSTORE_PASSWORD" 2>/dev/null | grep "SHA256:" | head -1 | awk '{print $2}')
            if [ ! -z "$sha256" ]; then
                echo -e "  ${BLUE}SHA256:${NC} $sha256"
            fi
        else
            print_error "Erro ao verificar keystore"
            return 1
        fi
        
    else
        print_error "Falha ao criar keystore"
        return 1
    fi
    
    return 0
}

# Resumo final
show_summary() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Keystores Gerados${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    local count=0
    
    for manufacturer in "${MANUFACTURERS[@]}"; do
        local keystore_file="$MANUFACTURERS_DIR/$manufacturer/${manufacturer}-keystore.jks"
        if [ -f "$keystore_file" ]; then
            local size=$(du -h "$keystore_file" | cut -f1)
            echo -e "  ${GREEN}✓${NC} $manufacturer: ${manufacturer}-keystore.jks ${BLUE}($size)${NC}"
            ((count++))
        else
            echo -e "  ${RED}✗${NC} $manufacturer: não gerado"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Total: $count/5 keystores gerados${NC}"
    echo ""
    
    # Próximos passos
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Próximos Passos${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "1. FAZER BACKUP dos keystores e propriedades (IMPORTANTE!)"
    echo "   Guardar em: 1Password, Azure Vault, ou cofre seguro"
    echo ""
    echo "2. Gerar APKs release:"
    echo "   ./scripts/build-stone-release.sh all"
    echo ""
    echo "3. APKs assinados estarão em:"
    echo "   apks/release/"
    echo ""
    
    # Aviso de segurança
    echo -e "${YELLOW}⚠ SEGURANÇA:${NC}"
    echo "  - Keystores e .properties NÃO estão no Git (protegidos)"
    echo "  - Faça backup IMEDIATO em local seguro"
    echo "  - Se perder keystores = impossível atualizar apps"
    echo ""
}

################################################################################
# Main
################################################################################

main() {
    print_header
    
    # Aviso de segurança
    echo ""
    echo -e "${YELLOW}⚠ ATENÇÃO:${NC}"
    echo "  Este script irá gerar keystores para TODOS os fabricantes Stone."
    echo "  Os keystores serão protegidos por senha."
    echo ""
    echo -e "${YELLOW}  Certifique-se de fazer BACKUP após a geração!${NC}"
    echo ""
    read -p "Continuar? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada."
        exit 0
    fi
    
    # Verificar se keytool está disponível
    if ! command -v keytool &> /dev/null; then
        print_error "keytool não encontrado!"
        echo ""
        echo "Instale o JDK 17:"
        echo "  - Windows: https://adoptium.net/"
        echo "  - Linux: sudo apt install openjdk-17-jdk"
        echo "  - Mac: brew install openjdk@17"
        exit 1
    fi
    
    print_success "keytool encontrado: $(keytool -version 2>&1 | head -1)"
    
    # Gerar keystores
    local success_count=0
    local fail_count=0
    
    for manufacturer in "${MANUFACTURERS[@]}"; do
        if generate_keystore "$manufacturer"; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    done
    
    # Resumo
    show_summary
    
    # Status final
    if [ $fail_count -eq 0 ]; then
        echo -e "${GREEN}✓ Todos os keystores gerados com sucesso!${NC}"
        echo ""
        exit 0
    else
        echo -e "${RED}✗ Alguns keystores falharam ($fail_count)${NC}"
        echo ""
        exit 1
    fi
}

# Executar
main "$@"

