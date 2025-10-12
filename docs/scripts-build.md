# 🔧 Scripts de Build - Guia Completo

**[← Voltar ao README Principal](../README.md)** | **[📚 Visão Geral do Projeto](./visao-geral-projeto.md)**

> Documentação completa sobre os scripts de build automatizados do PDV Piloto

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Scripts Disponíveis](#scripts-disponíveis)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Build Standalone (Debug)](#build-standalone-debug)
5. [Build Release (Assinado)](#build-release-assinado)
6. [Script de Cópia](#script-de-cópia)
7. [Fluxo Completo](#fluxo-completo)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O PDV Piloto possui **scripts automatizados** para facilitar o build e distribuição de APKs. Os scripts seguem nomenclatura padronizada e organizam os APKs de forma consistente.

### Por que Scripts?

**Sem scripts:**
```bash
# Build manual (complexo e propenso a erros)
cd android
./gradlew assembleGertecDebug
cp app/build/outputs/apk/gertec/debug/app-gertec-debug.apk ../../apks/pdv-piloto-stone-v1-1.0.0-gertec-debug.apk

./gradlew assembleIngenicoDebug
cp app/build/outputs/apk/ingenico/debug/app-ingenico-debug.apk ../../apks/pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk

# ... repetir para cada fabricante ...
```

**Com scripts:**
```bash
# Simples e automatizado
./scripts/build-stone-standalone.sh all

# Pronto! Todos os APKs gerados e copiados ✓
```

---

## 📦 Scripts Disponíveis

### Lista Completa

| Script | Plataforma | Função | Uso |
|--------|-----------|--------|-----|
| `build-stone-standalone.sh` | Linux/Mac | Build debug todos fabricantes Stone | `./build-stone-standalone.sh all` |
| `build-stone-standalone.bat` | Windows | Build debug todos fabricantes Stone | `build-stone-standalone.bat all` |
| `build-stone-release.sh` | Linux/Mac | Build release assinado Stone | `./build-stone-release.sh all` |
| `build-stone-release.bat` | Windows | Build release assinado Stone | `build-stone-release.bat all` |
| `copy-apks.sh` | Linux/Mac | Copia APKs para pasta centralizada | `./copy-apks.sh` |
| `copy-apks.bat` | Windows | Copia APKs para pasta centralizada | `copy-apks.bat` |

### Nomenclatura

Os scripts seguem o padrão:
```
build-[adquirente]-[tipo].sh
```

**Exemplos:**
- `build-stone-standalone.sh` → Build standalone/debug Stone
- `build-stone-release.sh` → Build release Stone
- `build-cielo-standalone.sh` → Build standalone/debug Cielo (futuro)
- `build-cielo-release.sh` → Build release Cielo (futuro)

---

## 📁 Estrutura de Diretórios

### Onde os APKs São Salvos

```
pos-mult-adquirencia-react-native/
│
└── apks/                                    ← ⭐ PASTA PRINCIPAL (ÚNICA)
    │
    ├── debug/                               ← APKs DEBUG
    │   ├── pdv-piloto-stone-v1-1.0.0-gertec-debug.apk
    │   ├── pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk
    │   ├── pdv-piloto-stone-v1-1.0.0-positivo-debug.apk
    │   ├── pdv-piloto-stone-v1-1.0.0-sunmi-debug.apk
    │   ├── pdv-piloto-stone-v1-1.0.0-tectoy-debug.apk
    │   └── pdv-piloto-cielo-v1-1.0.0-*.apk  (futuro)
    │
    └── release/                             ← APKs RELEASE (assinados)
        ├── pdv-piloto-stone-v1-1.0.0-gertec.apk
        ├── pdv-piloto-stone-v1-1.0.0-ingenico.apk
        ├── pdv-piloto-stone-v1-1.0.0-positivo.apk
        ├── pdv-piloto-stone-v1-1.0.0-sunmi.apk
        ├── pdv-piloto-stone-v1-1.0.0-tectoy.apk
        └── pdv-piloto-cielo-v1-1.0.0-*.apk  (futuro)
```

### Organização Simplificada

| Pasta | Propósito | Quando Usar |
|-------|-----------|-------------|
| **`apks/debug/`** | APKs debug para testes | ⭐ Distribuir para QA, testar em dispositivos |
| **`apks/release/`** | APKs assinados para produção | ⭐ Deploy em produção, Google Play |

---

## 🐛 Build Standalone (Debug)

### O que é Standalone?

**Standalone = APK independente** que pode ser instalado diretamente no dispositivo sem necessidade de:
- ❌ Assinatura com keystore
- ❌ Certificados de produção
- ❌ Configurações complexas

✅ Ideal para: **Desenvolvimento e testes**

### Uso

#### Linux/Mac

```bash
# Build um fabricante específico
./scripts/build-stone-standalone.sh positivo

# Build todos os fabricantes
./scripts/build-stone-standalone.sh all
```

#### Windows

```bash
# Build um fabricante específico
scripts\build-stone-standalone.bat positivo

# Build todos os fabricantes
scripts\build-stone-standalone.bat all
```

### O que o Script Faz

1. **Limpa builds anteriores**
   ```bash
   cd pdv-piloto-app/android
   ./gradlew clean
   ```

2. **Cria diretório de output**
   ```bash
   mkdir -p apks/debug
   ```

3. **Build APKs**
   ```bash
   ./gradlew assembleGertecDebug
   ./gradlew assembleIngenicoDebug
   ./gradlew assemblePositivoDebug
   ./gradlew assembleSunmiDebug
   ./gradlew assembleTectoyDebug
   ```

4. **Renomeia e salva**
   ```bash
   # De:
   app/build/outputs/apk/positivo/debug/app-positivo-debug.apk
   
   # Para:
   apks/debug/pdv-piloto-stone-v1-1.0.0-positivo-debug.apk
   ```

5. **Lista APKs gerados**
   ```bash
   ls -lh apks/debug/
   # Mostra todos os APKs com tamanhos
   ```

### Output Esperado

```
════════════════════════════════════════════════════════════════
  PDV Piloto - Build STANDALONE (DEBUG) Stone
  Versão: v1 - 1.0.0
════════════════════════════════════════════════════════════════

ℹ Limpando builds anteriores...
✓ Build limpo
ℹ Preparando diretório de output...
✓ Diretório pronto: /path/apks/debug

ℹ Building TODOS os fabricantes...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fabricante: GERTEC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ Building gertecDebug...
✓ Build gertec concluído
✓ APK copiado: pdv-piloto-stone-v1-1.0.0-gertec-debug.apk (110M)

[... repetir para cada fabricante ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Sucessos: 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════════════════════════════
  APKs Standalone Gerados
═══════════════════════════════════════════════════════════════

  ▸ pdv-piloto-stone-v1-1.0.0-gertec-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-positivo-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-sunmi-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-tectoy-debug.apk (110M)

Localização: /path/apks/debug

✓ Build standalone concluído com sucesso!
```

---

## 🔐 Build Release (Assinado)

### O que é Release?

**Release = APK assinado** com certificado para distribuição em produção. Requer:
- ✅ Keystore criado para cada fabricante
- ✅ Senhas configuradas
- ✅ Arquivo `*-keystore.properties`

✅ Ideal para: **Produção, Google Play, distribuição oficial**

### Pré-requisitos

#### 1. Criar Keystore

Para cada fabricante, você precisa criar um keystore:

```bash
# Exemplo: Positivo
keytool -genkey -v \
  -keystore android/manufacturers/stone/positivo/positivo-release.keystore \
  -alias positivo_key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Preencha as informações solicitadas
# Nome: Nebula Sistemas
# Organização: Nebula Sistemas Ltda
# Cidade: São Paulo
# Estado: SP
# País: BR
```

#### 2. Criar Arquivo de Propriedades

**Arquivo:** `android/manufacturers/stone/positivo/positivo-keystore.properties`

```properties
storeFile=positivo-release.keystore
storePassword=SUA_SENHA_STORE_AQUI
keyAlias=positivo_key
keyPassword=SUA_SENHA_KEY_AQUI
```

⚠️ **IMPORTANTE:** Este arquivo está no `.gitignore` e NÃO deve ser versionado!

### Uso

#### Linux/Mac

```bash
# Build um fabricante específico
./scripts/build-stone-release.sh positivo

# Build todos os fabricantes
./scripts/build-stone-release.sh all
```

#### Windows

```bash
# Build um fabricante específico
scripts\build-stone-release.bat positivo

# Build todos os fabricantes
scripts\build-stone-release.bat all
```

### O que o Script Faz

1. **Verifica keystores**
   - Checa se `*-release.keystore` existe
   - Checa se `*-keystore.properties` existe
   - Se não existir, mostra instruções de como criar

2. **Build APKs assinados**
   ```bash
   ./gradlew assemblePositivoRelease
   ```

3. **Renomeia e organiza**
   ```bash
   # De:
   app/build/outputs/apk/positivo/release/app-positivo-release.apk
   
   # Para:
   builds/release/stone/pdv-piloto-stone-v1-1.0.0-positivo.apk
   ```

4. **Verifica assinatura**
   ```bash
   apksigner verify pdv-piloto-stone-v1-1.0.0-positivo.apk
   ```

5. **Copia para pasta centralizada**
   ```bash
   ./scripts/copy-apks.sh
   # Copia de builds/release/stone/* para apks/
   ```

### Output Esperado

```
════════════════════════════════════════════════════════════════
  PDV Piloto - Build RELEASE (Assinado)
  Adquirente: STONE
  Versão: v1 - 1.0.0
════════════════════════════════════════════════════════════════

ℹ Limpando builds anteriores...
✓ Build limpo
ℹ Preparando diretório de output...

ℹ Building TODOS os fabricantes stone...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fabricante: POSITIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ Verificando keystore para positivo...
✓ Keystore encontrado
ℹ Building positivoRelease...
✓ Build positivo release concluído
✓ APK assinado: pdv-piloto-stone-v1-1.0.0-positivo.apk (45M)
ℹ Verificando assinatura...
✓ Assinatura válida ✓

[... cada fabricante ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Sucessos: 5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════════════════════════════
  APKs Release Assinados
═══════════════════════════════════════════════════════════════

  ▸ pdv-piloto-stone-v1-1.0.0-gertec.apk (45M)
  ▸ pdv-piloto-stone-v1-1.0.0-ingenico.apk (45M)
  ▸ pdv-piloto-stone-v1-1.0.0-positivo.apk (45M)
  ▸ pdv-piloto-stone-v1-1.0.0-sunmi.apk (45M)
  ▸ pdv-piloto-stone-v1-1.0.0-tectoy.apk (45M)

Localização: /path/builds/release/stone
Pronto para produção! ✓

✓ Build release concluído!

ℹ Copiando APKs para pasta centralizada...
[... output do copy-apks.sh ...]
```

---

## 📋 Script de Cópia

### copy-apks.sh / copy-apks.bat

Este script **centraliza todos os APKs** de `builds/` para `apks/`.

### Comportamento

- ✅ **Copia** APKs de `builds/debug/` e `builds/release/*/`
- ✅ **Substitui** se APK já existir (não duplica)
- ✅ **Mantém** outros APKs existentes (não exclui)
- ✅ **Organiza** por tipo (debug/release)

### Uso Manual

```bash
# Linux/Mac
./scripts/copy-apks.sh

# Windows
scripts\copy-apks.bat
```

### Quando É Chamado

O script é chamado **automaticamente** no final de:
- `build-stone-standalone.sh/bat`
- `build-stone-release.sh/bat`

**Você NÃO precisa chamá-lo manualmente** na maioria dos casos.

### Output

```
════════════════════════════════════════════════════════════════
  PDV Piloto - Copiar APKs para Pasta Centralizada
════════════════════════════════════════════════════════════════

ℹ Copiando APKs debug...
✓ Copiado: pdv-piloto-stone-v1-1.0.0-gertec-debug.apk
✓ Copiado: pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk
✓ Copiado: pdv-piloto-stone-v1-1.0.0-positivo-debug.apk
✓ Copiado: pdv-piloto-stone-v1-1.0.0-sunmi-debug.apk
✓ Copiado: pdv-piloto-stone-v1-1.0.0-tectoy-debug.apk

ℹ Copiando APKs release...
✓ Copiado: pdv-piloto-stone-v1-1.0.0-positivo.apk

✓ 6 APK(s) copiado(s) com sucesso!

═══════════════════════════════════════════════════════════════
  APKs Disponíveis (Pasta Centralizada)
═══════════════════════════════════════════════════════════════

DEBUG:
  ▸ pdv-piloto-stone-v1-1.0.0-gertec-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-positivo-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-sunmi-debug.apk (110M)
  ▸ pdv-piloto-stone-v1-1.0.0-tectoy-debug.apk (110M)

RELEASE:
  ▸ pdv-piloto-stone-v1-1.0.0-positivo.apk (45M)

📂 Localização: /path/apks
```

---

## 🔄 Fluxo Completo

### Cenário 1: Build Debug para Testes

```bash
# 1. Executar build standalone
./scripts/build-stone-standalone.sh all

# 2. APKs são gerados diretamente em:
#    apks/debug/pdv-piloto-stone-v1-1.0.0-*.apk

# 3. Distribuir para QA
#    Enviar arquivos da pasta apks/debug/
```

### Cenário 2: Build Release para Produção

```bash
# 1. Criar keystores (primeira vez)
keytool -genkey -v -keystore android/manufacturers/stone/positivo/positivo-release.keystore ...

# 2. Configurar propriedades
# Editar: android/manufacturers/stone/positivo/positivo-keystore.properties

# 3. Executar build release
./scripts/build-stone-release.sh all

# 4. APKs assinados gerados diretamente em:
#    apks/release/pdv-piloto-stone-v1-1.0.0-*.apk

# 5. Deploy
#    Upload para Google Play ou distribuição direta
```

### Cenário 3: Build Misto (Debug + Release)

```bash
# 1. Build debug de todos
./scripts/build-stone-standalone.sh all

# 2. Build release apenas Positivo (produção)
./scripts/build-stone-release.sh positivo

# 3. Resultado:
#    apks/debug/   - 5 APKs debug (todos fabricantes)
#    apks/release/ - 1 APK release (positivo)
```

---

## 🐛 Troubleshooting

### Erro: "Keystore não encontrado"

**Problema:**
```
✗ Keystore não encontrado: /path/positivo-release.keystore

Crie o keystore com:
keytool -genkey -v -keystore /path/positivo-release.keystore ...
```

**Solução:**
1. Criar keystore conforme instruções do script
2. Criar arquivo `*-keystore.properties`
3. Executar build novamente

### Erro: "Gradle not found"

**Problema:**
```
./gradlew: command not found
```

**Solução:**
```bash
# Verificar se está no diretório correto
pwd
# Deve estar na raiz do projeto

# Ou use caminho absoluto
cd /e/09-git-hub-rodrigobaia/pos-mult-adquirencia-react-native
./scripts/build-stone-standalone.sh all
```

### Erro: "Permission denied"

**Problema:**
```
bash: ./scripts/build-stone-standalone.sh: Permission denied
```

**Solução:**
```bash
chmod +x scripts/*.sh
./scripts/build-stone-standalone.sh all
```

### Warning: "Multiple substitutions"

**Problema:**
```
Multiple substitutions specified in non-positional format...
```

**Solução:**
- ✅ Apenas warning do Stone SDK (não afeta build)
- ✅ APKs são gerados normalmente
- ℹ️ Pode ignorar (bug do Stone SDK)

### APK muito grande (110MB)

**Explicação:**
- Debug APKs incluem símbolos de debug
- Incluem todos os ABIs (arm64, armv7, x86, x86_64)
- Incluem todos os SDKs Stone (5 fabricantes)

**Release APKs são menores:**
- ~40-50MB (minificado)
- Apenas arquitetura necessária
- ProGuard ativado

---

## 📚 Boas Práticas

### 1. Sempre Use Scripts

```bash
✅ RECOMENDADO:
./scripts/build-stone-standalone.sh all

❌ EVITAR (manual):
cd android
./gradlew assembleGertecDebug
cp app/build/outputs/apk/gertec/debug/app-gertec-debug.apk ...
```

### 2. Distribua da Pasta apks/

```bash
✅ RECOMENDADO:
# Enviar para QA
scp apks/pdv-piloto-stone-v1-1.0.0-positivo-debug.apk qa@server:/downloads/

❌ EVITAR:
# Enviar do build Gradle
scp android/app/build/outputs/apk/positivo/debug/app-positivo-debug.apk ...
```

### 3. Versione Keystores no Cofre

```bash
# Keystores são SENSÍVEIS - guardar em local seguro
# Opções:
- 1Password / LastPass
- Vault corporativo
- Azure Key Vault
- AWS Secrets Manager

# NÃO versionar no Git!
```

### 4. Automatize no CI/CD

```yaml
# Exemplo: GitHub Actions
- name: Build All Manufacturers
  run: ./scripts/build-stone-standalone.sh all

- name: Upload APKs
  uses: actions/upload-artifact@v3
  with:
    name: apks
    path: apks/*.apk
```

---

## 🎯 Resumo

### Comandos Essenciais

| Ação | Comando |
|------|---------|
| **Build debug todos** | `./scripts/build-stone-standalone.sh all` |
| **Build debug específico** | `./scripts/build-stone-standalone.sh positivo` |
| **Build release todos** | `./scripts/build-stone-release.sh all` |
| **Build release específico** | `./scripts/build-stone-release.sh positivo` |
| **Copiar APKs** | `./scripts/copy-apks.sh` (automático) |

### Localização dos APKs

- **Debug**: `apks/debug/` ⭐
- **Release**: `apks/release/` ⭐
- **Gradle output**: `pdv-piloto-app/android/app/build/outputs/apk/` (temporário)

---

## 🔗 Navegação

- **[← README Principal](../README.md)** - Voltar ao início
- **[📚 Visão Geral](./visao-geral-projeto.md)** - Proposta do projeto
- **[🟢 Integração Stone](./integracao-stone.md)** - Implementação Stone
- **[🔌 Adicionar Adquirente](./adicionar-adquirente.md)** - Expandir sistema

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0  

---

**Desenvolvido com ❤️ pela equipe Nebula Sistemas**

