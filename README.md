# 🚀 PDV Piloto - Sistema Multi-Adquirência

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Stone SDK](https://img.shields.io/badge/Stone%20SDK-4.13.0-green.svg)](https://sdkandroid.stone.com.br/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> Sistema de PDV (Ponto de Venda) modular e escalável que suporta múltiplas adquirentes de pagamento através de uma arquitetura unificada.

---

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [📦 Status de Implementação](#-status-de-implementação)
- [🚀 Quick Start](#-quick-start)
- [📱 Build e Deploy](#-build-e-deploy)
- [📂 Estrutura de APKs Gerados](#-estrutura-de-apks-gerados)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [📚 Documentação](#-documentação)
- [🤝 Contribuindo](#-contribuindo)

---

## 🎯 Sobre o Projeto

O **PDV Piloto** é uma solução profissional para integração de pagamentos em dispositivos POS Android. O projeto utiliza uma arquitetura MonoRepo que abstrai as complexidades de diferentes SDKs de pagamento (Stone, Cielo, PagSeguro, etc.) através de interfaces unificadas.

### 🌟 Principais Características

- ✅ **Multi-Adquirência**: Suporte para múltiplas adquirentes sob uma única interface
- ✅ **Multi-Fabricante**: Um único código para 5+ fabricantes diferentes (Gertec, Ingenico, Positivo, Sunmi, Tectoy)
- ✅ **Arquitetura Modular**: SDKs isolados em packages independentes (MonoRepo)
- ✅ **Type-Safe**: 100% TypeScript com tipagem forte
- ✅ **Deep Links**: Comunicação nativa com apps de pagamento
- ✅ **Impressão Térmica**: Suporte completo para impressão de cupons

---

## 🛠️ Stack Tecnológica

### Frontend
- **React Native**: 0.81.4
- **React**: 19.1.0
- **TypeScript**: 5.8.3

### Backend/Native
- **Kotlin**: Bridge Android
- **Stone SDK**: 4.13.0
- **Gradle**: 8.14.3
- **Java**: 17

### Arquitetura
- **MonoRepo**: Packages modulares
- **Product Flavors**: Build variants por fabricante
- **Deep Links**: Comunicação entre apps
- **Factory Pattern**: Troca dinâmica de adquirentes

---

## 📦 Status de Implementação

### Adquirentes

| Adquirente | Status | Pagamento | Impressão | Cancelamento |
|------------|--------|-----------|-----------|--------------|
| **Stone** | ✅ Implementado | ✅ | ✅ | ⏳ |
| **Cielo** | 🚧 Planejado | ⏳ | ⏳ | ⏳ |
| **PagSeguro** | 🚧 Planejado | ⏳ | ⏳ | ⏳ |
| **GetNet** | 🚧 Planejado | ⏳ | ⏳ | ⏳ |
| **Rede** | 🚧 Planejado | ⏳ | ⏳ | ⏳ |

### Fabricantes Stone

| Fabricante | Dispositivos | Build Debug | Build Release |
|------------|--------------|-------------|---------------|
| **Gertec** | GPOS700, GPOS720 | ✅ | ✅ |
| **Ingenico** | Move 2500/3500/5000, Desk 3500 | ✅ | ✅ |
| **Positivo** | L400, L500, Smart POS | ✅ | ✅ |
| **Sunmi** | P2 Pro, V2 Pro, L2 Series | ✅ | ✅ |
| **Tectoy** | Tectoy POS | ✅ | ✅ |

---

## 🚀 Quick Start

### Pré-requisitos

```bash
Node.js >= 20.x
npm >= 10.x
Android Studio Hedgehog | 2023.1.1+
JDK 17
Gradle 8.14.3
Token Stone PackageCloud
```

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/pos-mult-adquirencia-react-native.git
cd pos-mult-adquirencia-react-native/pdv-piloto-app

# 2. Instale as dependências
npm install

# 3. Configure o token Stone
cp android/local.properties.example android/local.properties
# Edite local.properties e adicione seu token PackageCloud

# 4. Inicie o Metro bundler
npm start
```

### Executar no Dispositivo

```bash
# Método 1: Via Gradle (recomendado)
cd android
./gradlew assemblePositivoDebug
./gradlew installPositivoDebug

# Método 2: Via React Native CLI
npx react-native run-android --variant=positivoDebug
```

---

## 📱 Build e Deploy

### Scripts Automatizados

O projeto possui scripts para build automatizado com nomenclatura padronizada por adquirente:

#### 🐧 Linux/Mac

```bash
# Build STANDALONE (debug) - um fabricante específico
./scripts/build-stone-standalone.sh positivo

# Build STANDALONE (debug) - todos os fabricantes
./scripts/build-stone-standalone.sh all

# Build RELEASE (assinado) - um fabricante específico (requer keystores)
./scripts/build-stone-release.sh positivo

# Build RELEASE (assinado) - todos os fabricantes
./scripts/build-stone-release.sh all
```

#### 🪟 Windows

```bash
# Build STANDALONE (debug) - um fabricante específico
scripts\build-stone-standalone.bat positivo

# Build STANDALONE (debug) - todos os fabricantes
scripts\build-stone-standalone.bat all

# Build RELEASE (assinado) - um fabricante específico (requer keystores)
scripts\build-stone-release.bat positivo

# Build RELEASE (assinado) - todos os fabricantes
scripts\build-stone-release.bat all
```

**Nota:** Os scripts são específicos por adquirente. Quando Cielo for implementado, haverá `build-cielo-standalone.sh` e `build-cielo-release.sh`.

### Build Manual por Fabricante

```bash
cd pdv-piloto-app/android

# Debug
./gradlew assembleGertecDebug
./gradlew assembleIngenicoDebug
./gradlew assemblePositivoDebug
./gradlew assembleSunmiDebug
./gradlew assembleTectoyDebug

# Release (requer keystores configurados)
./gradlew assembleGertecRelease
./gradlew assembleIngenicoRelease
./gradlew assemblePositivoRelease
./gradlew assembleSunmiRelease
./gradlew assembleTectoyRelease

# Todos os builds
./gradlew assembleDebug        # Todos em debug
./gradlew assembleRelease      # Todos em release
```

---

## 📂 Estrutura de APKs Gerados

### Nomenclatura Padronizada

Os APKs gerados seguem o padrão:

```
Debug:
pdv-piloto-[adquirente]-v[versionCode]-[versionName]-[fabricante]-debug.apk

Release:
pdv-piloto-[adquirente]-v[versionCode]-[versionName]-[fabricante].apk
```

### Localização dos APKs

```
pos-mult-adquirencia-react-native/
│
├── apks/                                     ← ⭐ APKs ORGANIZADOS (não versionado)
│   │
│   ├── debug/                                ← APKs DEBUG
│   │   ├── pdv-piloto-stone-v1-1.0.0-gertec-debug.apk
│   │   ├── pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk
│   │   ├── pdv-piloto-stone-v1-1.0.0-positivo-debug.apk
│   │   ├── pdv-piloto-stone-v1-1.0.0-sunmi-debug.apk
│   │   ├── pdv-piloto-stone-v1-1.0.0-tectoy-debug.apk
│   │   └── pdv-piloto-cielo-v1-1.0.0-getnet-debug.apk  (futuro)
│   │
│   └── release/                              ← APKs RELEASE (assinados)
│       ├── pdv-piloto-stone-v1-1.0.0-gertec.apk
│       ├── pdv-piloto-stone-v1-1.0.0-ingenico.apk
│       ├── pdv-piloto-stone-v1-1.0.0-positivo.apk
│       ├── pdv-piloto-stone-v1-1.0.0-sunmi.apk
│       ├── pdv-piloto-stone-v1-1.0.0-tectoy.apk
│       └── pdv-piloto-cielo-v1-1.0.0-getnet.apk       (futuro)
│
└── pdv-piloto-app/android/app/build/outputs/apk/  ← APKs do Gradle (build manual)
    ├── gertec/
    │   ├── debug/
    │   │   └── app-gertec-debug.apk
    │   └── release/
    │       └── app-gertec-release.apk
    ├── ingenico/
    │   ├── debug/
    │   │   └── app-ingenico-debug.apk
    │   └── release/
    │       └── app-ingenico-release.apk
    ├── positivo/
    │   ├── debug/
    │   │   └── app-positivo-debug.apk
    │   └── release/
    │       └── app-positivo-release.apk
    ├── sunmi/
    │   ├── debug/
    │   │   └── app-sunmi-debug.apk
    │   └── release/
    │       └── app-sunmi-release.apk
    └── tectoy/
        ├── debug/
        │   └── app-tectoy-debug.apk
        └── release/
            └── app-tectoy-release.apk
```

### 📊 Diferenças entre as Pastas

| Característica | `apks/` ⭐ PRINCIPAL | Build Gradle (`android/app/build/`) |
|----------------|---------------------|-----------------------------------|
| **Propósito** | Centralizar APKs para distribuição | Output Gradle padrão |
| **Nomenclatura** | Padronizada com versão | Padrão Android (`app-*.apk`) |
| **Organização** | debug/ e release/ separados | Por fabricante/tipo |
| **Localização** | Raiz do projeto | Dentro de android/app/build |
| **Versionamento** | ✅ Nome com versão | ❌ Nome genérico |
| **Deploy** | ✅ **RECOMENDADO** | ⚠️ Requer renomeação |
| **Uso** | 🎯 **Distribuição** | Desenvolvimento |

### 🎯 Qual Usar?

- **`apks/debug/`** → ⭐ Use para **distribuir APKs debug** (testes, QA)
- **`apks/release/`** → ⭐ Use para **distribuir APKs produção** (assinados)
- **`android/app/build/`** → 🔧 Output automático do Gradle (desenvolvimento local)

### Exemplo Real

Após executar `./scripts/build-stone-standalone.sh all`, você terá:

```bash
apks/debug/
├── pdv-piloto-stone-v1-1.0.0-gertec-debug.apk    (110 MB)
├── pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk  (110 MB)
├── pdv-piloto-stone-v1-1.0.0-positivo-debug.apk  (110 MB)
├── pdv-piloto-stone-v1-1.0.0-sunmi-debug.apk     (110 MB)
└── pdv-piloto-stone-v1-1.0.0-tectoy-debug.apk    (110 MB)
```

Após executar `./scripts/build-stone-release.sh all` (com keystores):

```bash
apks/release/
├── pdv-piloto-stone-v1-1.0.0-gertec.apk          (45 MB)
├── pdv-piloto-stone-v1-1.0.0-ingenico.apk        (45 MB)
├── pdv-piloto-stone-v1-1.0.0-positivo.apk        (45 MB)
├── pdv-piloto-stone-v1-1.0.0-sunmi.apk           (45 MB)
└── pdv-piloto-stone-v1-1.0.0-tectoy.apk          (45 MB)
```

**Para distribuir**: Envie o APK específico do fabricante do dispositivo da pasta `apks/debug/` ou `apks/release/`.

---

## 🏗️ Estrutura do Projeto

```
pos-mult-adquirencia-react-native/
│
├── README.md                          ← Este arquivo
├── .gitignore
│
├── docs/                              ← 📚 Documentação completa
│   ├── README.md                      ← Visão geral e proposta
│   ├── arquitetura-monorepo.md        ← O que é MonoRepo
│   ├── integracao-stone.md            ← Integração Stone detalhada
│   └── adicionar-adquirente.md        ← Como adicionar Cielo, etc
│
├── scripts/                           ← 🔧 Scripts de build
│   ├── build-stone-standalone.sh      ← Build standalone/debug Stone (Linux/Mac)
│   ├── build-stone-standalone.bat     ← Build standalone/debug Stone (Windows)
│   ├── build-stone-release.sh         ← Build release Stone (Linux/Mac)
│   └── build-stone-release.bat        ← Build release Stone (Windows)
│
├── apks/                              ← 📦 APKs organizados (não versionado)
│   ├── debug/                         ← APKs debug
│   │   ├── pdv-piloto-stone-v1-1.0.0-gertec-debug.apk
│   │   ├── pdv-piloto-stone-v1-1.0.0-ingenico-debug.apk
│   │   ├── pdv-piloto-stone-v1-1.0.0-positivo-debug.apk
│   │   ├── pdv-piloto-stone-v1-1.0.0-sunmi-debug.apk
│   │   └── pdv-piloto-stone-v1-1.0.0-tectoy-debug.apk
│   │
│   └── release/                       ← APKs release (assinados)
│       ├── pdv-piloto-stone-v1-1.0.0-gertec.apk
│       ├── pdv-piloto-stone-v1-1.0.0-ingenico.apk
│       ├── pdv-piloto-cielo-v1-1.0.0-getnet.apk     (futuro)
│       └── ...
│
├── images/                            ← 🎨 Assets e ícones
│   └── AppIcons/
│       └── android/
│
└── pdv-piloto-app/                    ← 📱 Aplicação React Native
    │
    ├── package.json
    ├── App.tsx
    ├── index.js
    │
    ├── src/                           ← Código React Native
    │   ├── screens/
    │   │   └── PaymentScreen.tsx
    │   └── components/
    │       ├── PaymentButton.tsx
    │       ├── PaymentResultModal.tsx
    │       └── ValueInput.tsx
    │
    ├── packages/                      ← 📦 MonoRepo packages
    │   │
    │   ├── payment-core/              ← Core - Interfaces
    │   │   └── src/
    │   │       ├── interfaces/
    │   │       │   ├── IPaymentProvider.ts
    │   │       │   └── IPrinterProvider.ts
    │   │       ├── factory/
    │   │       │   ├── PaymentProviderFactory.ts
    │   │       │   └── PrinterProviderFactory.ts
    │   │       └── models/
    │   │
    │   ├── stone-sdk/                 ← SDK Stone (implementado)
    │   │   ├── typescript/
    │   │   │   ├── StonePaymentProvider.ts
    │   │   │   └── StonePrinterProvider.ts
    │   │   └── android/
    │   │       ├── payment/
    │   │       │   ├── StoneBridge.kt
    │   │       │   └── StonePackage.kt
    │   │       └── printer/
    │   │           ├── StonePrinterBridge.kt
    │   │           └── StonePrinterPackage.kt
    │   │
    │   ├── cielo-sdk/                 ← SDK Cielo (futuro)
    │   ├── pagseguro-sdk/             ← SDK PagSeguro (futuro)
    │   ├── shared-ui/                 ← Componentes compartilhados
    │   └── shared-utils/              ← Utilitários
    │
    └── android/                       ← 🤖 Configuração Android
        ├── app/
        │   ├── build.gradle           ← Product flavors, versões
        │   └── src/main/
        │       ├── AndroidManifest.xml
        │       └── java/br/com/nebulasistemas/pdvpilotoapp/
        │           ├── MainActivity.kt
        │           └── MainApplication.kt
        │
        ├── build.gradle               ← Repositórios, versões SDK
        ├── settings.gradle
        ├── local.properties           ← Tokens (não versionado)
        └── manufacturers/             ← Configurações por fabricante
            └── stone/
                ├── gertec/
                ├── ingenico/
                ├── positivo/
                ├── sunmi/
                └── tectoy/
```

---

## 📚 Documentação

### 📖 Documentação Completa

Acesse a documentação detalhada em [`docs/`](./docs/):

| Documento | Descrição | Leitura |
|-----------|-----------|---------|
| [**📘 Visão Geral do Projeto**](./docs/visao-geral-projeto.md) | Proposta, problemas que resolve e casos de uso | 15 min |
| [**🏗️ Arquitetura MonoRepo**](./docs/arquitetura-monorepo.md) | O que é MonoRepo, vantagens e referências | 20 min |
| [**🟢 Integração Stone**](./docs/integracao-stone.md) | Guia técnico completo da integração Stone | 30 min |
| [**🔌 Adicionar Adquirente**](./docs/adicionar-adquirente.md) | Passo a passo para adicionar Cielo, PagSeguro, etc | 25 min |
| [**🔧 Scripts de Build**](./docs/scripts-build.md) | Guia completo dos scripts de build e distribuição | 15 min |

### 🎯 Quick Links - Começar Agora

**Novo no projeto?** Leia nesta ordem:
1. 📘 [Visão Geral do Projeto](./docs/visao-geral-projeto.md) - Entenda o propósito
2. 🏗️ [Arquitetura MonoRepo](./docs/arquitetura-monorepo.md) - Entenda a estrutura
3. 🟢 [Integração Stone](./docs/integracao-stone.md) - Veja como funciona
4. 🔌 [Adicionar Adquirente](./docs/adicionar-adquirente.md) - Aprenda a expandir

**Gerar APKs?**
- 🔧 [Scripts de Build](./docs/scripts-build.md) - Gerar APKs debug e release
- 📱 Distribuir da pasta `apks/`

**Desenvolver features?**
- 💻 [Visão Geral](./docs/visao-geral-projeto.md) - Casos de uso e arquitetura
- 🔧 [Integração Stone](./docs/integracao-stone.md) - Referência técnica

**Adicionar nova adquirente?**
- 📦 [Adicionar Adquirente](./docs/adicionar-adquirente.md) - Guia completo
- 🏗️ [Arquitetura MonoRepo](./docs/arquitetura-monorepo.md) - Estrutura de packages

### 📚 Referências Externas

#### MonoRepo
- [Monorepo Tools](https://monorepo.tools/) - Comparação de ferramentas
- [Why Google Stores Billions of Lines in Single Repository](https://research.google/pubs/pub45424/)
- [NX Documentation](https://nx.dev/concepts/more-concepts/why-monorepos)

#### Stone
- [Stone SDK Documentation](https://sdkandroid.stone.com.br/)
- [Stone Deep Link Payment](https://sdkandroid.stone.com.br/reference/intents-de-pagamento)
- [Stone Deep Link Printer](https://sdkandroid.stone.com.br/reference/impressao-deeplink)

---

## 🤝 Contribuindo

Este é um projeto proprietário da Nebula Sistemas. Para contribuir:

1. **Reporte bugs** via issues
2. **Sugira melhorias** na arquitetura
3. **Documente** novos casos de uso
4. **Teste** em diferentes dispositivos

### Adicionando Nova Adquirente

Veja o guia completo: [docs/adicionar-adquirente.md](./docs/adicionar-adquirente.md)

---

## 📄 Licença

Proprietary - © 2025 Nebula Sistemas. Todos os direitos reservados.

---

## 📞 Suporte

Para suporte técnico:

- 📧 Email: suporte@nebulasistemas.com.br
- 🌐 Website: www.nebulasistemas.com.br
- 📱 WhatsApp: (11) 9XXXX-XXXX

---

## 🏆 Créditos

### Equipe de Desenvolvimento

- **Arquitetura**: Rodrigo Baia
- **Desenvolvimento**: Equipe Nebula Sistemas
- **QA**: Equipe de Qualidade

### Tecnologias Utilizadas

Este projeto foi construído com:
- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Stone SDK](https://sdkandroid.stone.com.br/)
- [Gradle](https://gradle.org/)
- [Kotlin](https://kotlinlang.org/)

---

**Desenvolvido com ❤️ pela equipe Nebula Sistemas**

---

## 📊 Status do Projeto

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![License](https://img.shields.io/badge/license-Proprietary-red)

**Última atualização:** Outubro 2025
