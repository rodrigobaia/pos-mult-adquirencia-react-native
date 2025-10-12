# Configuração de Fabricantes Stone

> Estrutura para configurar diferentes fabricantes de dispositivos POS Stone

**[⬅ Voltar para o README principal](../../../../README.md)**

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Fabricantes Suportados](#-fabricantes-suportados)
3. [Estrutura de Arquivos](#-estrutura-de-arquivos)
4. [Configuração por Fabricante](#️-configuração-por-fabricante)
5. [Build e Deploy](#-build-e-deploy)
6. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

Este diretório contém as configurações específicas de build para cada fabricante de dispositivos POS que utilizam Stone como adquirente.

> ⚠️ **Importante**: Esta pasta está localizada em `PilotoApp/android/manufacturers/stone/` e é versionada no Git. Isso garante que todos os desenvolvedores tenham as configurações necessárias ao clonar o projeto.

### Organização por Adquirente

As configurações de fabricantes estão organizadas por **adquirente** para facilitar a manutenção:

```
android/manufacturers/
├── stone/      ← Fabricantes que usam Stone
├── cielo/      ← Fabricantes que usam Cielo (futuro)
└── pagseguro/  ← Fabricantes que usam PagSeguro (futuro)
```

Isso permite separar claramente as configurações de build de cada adquirente, independente do código dos SDKs (que ficam em `packages/`).

### Como Funciona

1. **Product Flavors**: Cada fabricante tem seu próprio flavor no Gradle
2. **Keystores Específicos**: Cada fabricante possui seu próprio keystore para assinatura
3. **SDKs Específicos**: Dependências específicas por fabricante quando necessário
4. **Build Automatizado**: Scripts para gerar APKs para cada fabricante

---

## 🏭 Fabricantes Suportados

| Fabricante | Terminal Principal | SDK Específico | Status |
|------------|-------------------|----------------|---------|
| **Gertec** | GPOS700, GPOS720 | `stone-sdk-posandroid-gertec` | ✅ Suportado |
| **Ingenico** | Move 2500/3500/5000, Desk 3500 | `stone-sdk-posandroid-ingenico` | ✅ Suportado |
| **Positivo** | L400, L500, Smart POS | `stone-sdk-posandroid-positivo` | ✅ Suportado |
| **Sunmi** | P2 Pro, V2 Pro, L2 Series | `stone-sdk-posandroid-sunmi` | ✅ Suportado |
| **Tectoy** | Tectoy POS | `stone-sdk-posandroid-tectoy` | ✅ Suportado |

---

## 📁 Estrutura de Arquivos

```
android/manufacturers/
└── stone/
    ├── README.md
    ├── gertec/
    │   ├── gertec-keystore.properties
    │   └── gertec-signing-config.gradle
    ├── ingenico/
    │   ├── ingenico-keystore.properties
    │   └── ingenico-signing-config.gradle
    ├── positivo/
    │   ├── positivo-keystore.properties
    │   └── positivo-signing-config.gradle
    ├── sunmi/
    │   ├── sunmi-keystore.properties
    │   └── sunmi-signing-config.gradle
    └── tectoy/
        ├── tectoy-keystore.properties
        └── tectoy-signing-config.gradle
```

### Separação de Responsabilidades

- **`android/manufacturers/`**: Configurações de build, keystores, signing configs
- **`packages/stone-sdk/`**: Código TypeScript e Kotlin do SDK Stone
- **`packages/payment-core/`**: Interfaces genéricas de pagamento

---

## ⚙️ Configuração por Fabricante

### 1. Gertec

**Arquivo**: `gertec/gertec-keystore.properties`

```properties
# Gertec Keystore Configuration
storeFile=../gertec-release.keystore
storePassword=your_gertec_store_password
keyAlias=gertec_key
keyPassword=your_gertec_key_password
```

**Arquivo**: `gertec/gertec-signing-config.gradle`

```gradle
android {
    signingConfigs {
        gertec {
            def keystoreProperties = new Properties()
            def keystorePropertiesFile = rootProject.file('android/manufacturers/stone/gertec/gertec-keystore.properties')
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
                storePassword keystoreProperties['storePassword']
            }
        }
    }
}
```

### 2. Ingenico

**Arquivo**: `ingenico/ingenico-keystore.properties`

```properties
# Ingenico Keystore Configuration
storeFile=../ingenico-release.keystore
storePassword=your_ingenico_store_password
keyAlias=ingenico_key
keyPassword=your_ingenico_key_password
```

### 3. Positivo

**Arquivo**: `positivo/positivo-keystore.properties`

```properties
# Positivo Keystore Configuration
storeFile=../positivo-release.keystore
storePassword=your_positivo_store_password
keyAlias=positivo_key
keyPassword=your_positivo_key_password
```

### 4. Sunmi

**Arquivo**: `sunmi/sunmi-keystore.properties`

```properties
# Sunmi Keystore Configuration
storeFile=../sunmi-release.keystore
storePassword=your_sunmi_store_password
keyAlias=sunmi_key
keyPassword=your_sunmi_key_password
```

### 5. Tectoy

**Arquivo**: `tectoy/tectoy-keystore.properties`

```properties
# Tectoy Keystore Configuration
storeFile=../tectoy-release.keystore
storePassword=your_tectoy_store_password
keyAlias=tectoy_key
keyPassword=your_tectoy_key_password
```

---

## 🚀 Build e Deploy

### Build Individual por Fabricante

```bash
# Build debug para Gertec
./gradlew assembleGertecDebug

# Build release para Ingenico
./gradlew assembleIngenicoRelease

# Build release para Positivo
./gradlew assemblePositivoRelease
```

### Build Todos os Fabricantes

```bash
# Build debug para todos
./gradlew assembleDebug

# Build release para todos
./gradlew assembleRelease
```

### Scripts Automatizados

```bash
# Usar scripts do diretório scripts/build/
./scripts/build/build-all-manufacturers.sh
```

---

## 🔧 Troubleshooting

### Problema: Keystore não encontrado

**Erro**: `Keystore file not found`

**Solução**:
1. Verificar se o arquivo `.keystore` existe no diretório correto
2. Verificar permissões do arquivo
3. Verificar caminho no `keystore.properties`

### Problema: SDK específico não encontrado

**Erro**: `Could not resolve dependency for stone-sdk-posandroid-gertec`

**Solução**:
1. Verificar token PackageCloud
2. Verificar repositório Maven configurado
3. Verificar versão do SDK

### Problema: Build flavor não encontrado

**Erro**: `Product flavor 'gertec' not found`

**Solução**:
1. Verificar configuração no `build.gradle`
2. Sincronizar projeto no Android Studio
3. Limpar cache do Gradle: `./gradlew clean`

---

## 📚 Referências

- [Documentação Stone SDK](../../../docs/adquirentes/stone.md)
- [Guia de Build](../../../docs/desenvolvimento/guia-scripts-build.md)
- [Análise Stone Project](../../../docs/desenvolvimento/analise-stone-existing-project.md)
