#!/bin/bash

################################################################################
# Script para Organizar APKs - PDV Piloto
# 
# Este script NÃO é mais necessário pois os builds já salvam direto em apks/
# Mantido para compatibilidade e organização de APKs antigos
#
# Uso: ./copy-apks.sh
################################################################################

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APKS_DIR="$PROJECT_ROOT/apks"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PDV Piloto - Estrutura de APKs${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Criar estrutura se não existir
mkdir -p "$APKS_DIR/debug"
mkdir -p "$APKS_DIR/release"

echo -e "${GREEN}✓ Estrutura de diretórios pronta${NC}"
echo ""

# Listar APKs
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  APKs Disponíveis${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if [ -d "$APKS_DIR/debug" ]; then
    echo -e "${BLUE}DEBUG:${NC}"
    DEBUG_FOUND=0
    shopt -s nullglob
    for apk in "$APKS_DIR/debug"/*.apk; do
        if [ -f "$apk" ]; then
            filename=$(basename "$apk")
            size=$(du -h "$apk" | cut -f1)
            echo -e "  ${GREEN}▸${NC} $filename ${BLUE}($size)${NC}"
            DEBUG_FOUND=1
        fi
    done
    shopt -u nullglob
    
    if [ $DEBUG_FOUND -eq 0 ]; then
        echo "  (nenhum)"
    fi
fi

echo ""

if [ -d "$APKS_DIR/release" ]; then
    echo -e "${BLUE}RELEASE:${NC}"
    RELEASE_FOUND=0
    shopt -s nullglob
    for apk in "$APKS_DIR/release"/*.apk; do
        if [ -f "$apk" ]; then
            filename=$(basename "$apk")
            size=$(du -h "$apk" | cut -f1)
            echo -e "  ${GREEN}▸${NC} $filename ${BLUE}($size)${NC}"
            RELEASE_FOUND=1
        fi
    done
    shopt -u nullglob
    
    if [ $RELEASE_FOUND -eq 0 ]; then
        echo "  (nenhum)"
    fi
fi

echo ""
echo -e "${BLUE}📂 Debug: $APKS_DIR/debug${NC}"
echo -e "${BLUE}📂 Release: $APKS_DIR/release${NC}"
echo ""
