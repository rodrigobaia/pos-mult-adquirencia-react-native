# Arquitetura Mono-Adquirente

## 🎯 **Conceito**

O PDV Piloto utiliza uma **arquitetura mono-adquirente** onde cada APK é compilado para **uma única adquirente**. Isso significa que:

- ✅ **APK Stone**: Funciona apenas em dispositivos Stone
- ✅ **APK Cielo**: Funciona apenas em dispositivos Cielo LIO
- ✅ **Transparência**: O código da aplicação não sabe qual adquirente está rodando
- ✅ **Compilação**: A escolha da adquirente é feita em tempo de build, não em runtime

## 🏗️ **Arquitetura**

```
┌─────────────────────────────────────────────────────────────┐
│                    PDV Piloto App                           │
├─────────────────────────────────────────────────────────────┤
│  Código Fonte (src/) - TRANSPARENTE À ADQUIRENTE           │
│  ├── PaymentScreen.tsx                                     │
│  ├── PaymentProviderFactory.ts                             │
│  └── ...                                                   │
├─────────────────────────────────────────────────────────────┤
│  Build System (Gradle) - DEFINE ADQUIRENTE                 │
│  ├── stone flavor: ENABLE_STONE=true, ENABLE_CIELO=false   │
│  ├── cielo flavor: ENABLE_STONE=false, ENABLE_CIELO=true   │
│  └── BuildConfigBridge.kt                                  │
├─────────────────────────────────────────────────────────────┤
│  APKs Gerados                                               │
│  ├── pdv-piloto-stone-v1-1.0.0-positivo-debug.apk         │
│  ├── pdv-piloto-stone-v1-1.0.0-positivo-release.apk       │
│  ├── pdv-piloto-cielo-v1-1.0.0-getnet-debug.apk           │
│  └── pdv-piloto-cielo-v1-1.0.0-getnet-release.apk         │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Como Funciona**

### 1. **Compilação**
```bash
# APK para Stone
./scripts/build-by-acquirer.sh stone positivo debug

# APK para Cielo
./scripts/build-by-acquirer.sh cielo getnet debug
```

### 2. **Código Transparente**
```typescript
// PaymentScreen.tsx - NÃO SABE qual adquirente está rodando
const paymentProvider = PaymentProviderFactory.getActive();
await paymentProvider.requestPayment({ amount: 50.00, type: PaymentType.CREDIT });
```

### 3. **Factory Inteligente**
```typescript
// PaymentProviderFactory.ts - Descobre a adquirente via BuildConfig
static getActiveAcquirer(): AcquirerType {
  if (NativeModules.BuildConfig?.ENABLE_STONE) {
    return AcquirerType.STONE;
  }
  if (NativeModules.BuildConfig?.ENABLE_CIELO) {
    return AcquirerType.CIELO;
  }
  return AcquirerType.STONE; // Fallback
}
```

## 📱 **Flavors Disponíveis**

### **Stone Adquirente**
- `stone-gertec`: APK para dispositivos Stone Gertec
- `stone-ingenico`: APK para dispositivos Stone Ingenico
- `stone-positivo`: APK para dispositivos Stone Positivo
- `stone-sunmi`: APK para dispositivos Stone Sunmi
- `stone-tectoy`: APK para dispositivos Stone Tectoy

### **Cielo Adquirente**
- `cielo-getnet`: APK para dispositivos Cielo GetNet
- `cielo-rede`: APK para dispositivos Cielo Rede
- `cielo-pagseguro`: APK para dispositivos Cielo PagSeguro

## 🚀 **Scripts de Build**

### **Build por Adquirente**
```bash
# Sintaxe
./scripts/build-by-acquirer.sh <adquirente> <fabricante> <tipo>

# Exemplos
./scripts/build-by-acquirer.sh stone positivo debug
./scripts/build-by-acquirer.sh stone positivo release
./scripts/build-by-acquirer.sh cielo getnet debug
```

### **Desenvolvimento por Adquirente**
```bash
# Sintaxe
./scripts/dev-by-acquirer.sh <adquirente> <fabricante>

# Exemplos
./scripts/dev-by-acquirer.sh stone positivo
./scripts/dev-by-acquirer.sh cielo getnet
```

## 📋 **Vantagens**

### ✅ **Transparência**
- Código da aplicação não precisa saber qual adquirente está rodando
- Mesma interface para todas as adquirentes
- Fácil manutenção e evolução

### ✅ **Isolamento**
- Cada APK contém apenas o código necessário para sua adquirente
- Menor tamanho do APK
- Menor superfície de ataque

### ✅ **Flexibilidade**
- Fácil adição de novas adquirentes
- Builds independentes
- Testes isolados por adquirente

### ✅ **Produção**
- APKs específicos para cada tipo de dispositivo
- Certificação independente por adquirente
- Deploy seletivo

## 🔄 **Fluxo de Desenvolvimento**

### **1. Desenvolvimento**
```bash
# Conectar dispositivo Stone Positivo
adb devices

# Executar em modo desenvolvimento
./scripts/dev-by-acquirer.sh stone positivo
```

### **2. Teste**
```bash
# Gerar APK de teste
./scripts/build-by-acquirer.sh stone positivo debug

# Instalar no dispositivo
adb install build-outputs/pdv-piloto-stone-v1-1.0.0-positivo-debug.apk
```

### **3. Produção**
```bash
# Gerar APK de produção
./scripts/build-by-acquirer.sh stone positivo release

# APK assinado pronto para distribuição
# build-outputs/pdv-piloto-stone-v1-1.0.0-positivo-release.apk
```

## 📁 **Estrutura de Arquivos**

```
pdv-piloto-app/
├── src/                          # Código transparente à adquirente
│   ├── screens/
│   ├── components/
│   └── ...
├── packages/
│   ├── payment-core/             # Core transparente
│   ├── stone-sdk/                # SDK Stone
│   └── cielo-sdk/                # SDK Cielo
├── android/
│   ├── app/build.gradle          # Configuração de flavors
│   └── manufacturers/            # Keystores por fabricante
│       ├── stone/
│       └── cielo/
└── scripts/
    ├── build-by-acquirer.sh      # Build por adquirente
    └── dev-by-acquirer.sh        # Desenvolvimento por adquirente
```

## 🎯 **Resumo**

A arquitetura mono-adquirente garante que:

1. **Código transparente**: A aplicação não sabe qual adquirente está rodando
2. **APKs específicos**: Cada APK é compilado para uma única adquirente
3. **Build flexível**: Scripts facilitam compilação e desenvolvimento
4. **Manutenção simples**: Adicionar nova adquirente não afeta código existente
5. **Produção otimizada**: APKs menores e mais seguros

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: Implementado
