# 🏗️ DIAGRAMA DA ARQUITETURA MULTI-ADQUIRENTE

## **VISÃO GERAL DA ARQUITETURA**

```
┌─────────────────────────────────────────────────────────────────┐
│                        APLICAÇÃO (src/)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ PaymentScreen   │  │ PaymentButton   │  │ PaymentService  │ │
│  │                 │  │                 │  │                 │ │
│  │ USA APENAS      │  │ USA APENAS      │  │ USA APENAS      │ │
│  │ payment-core    │  │ payment-core    │  │ payment-core    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE ABSTRAÇÃO                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                payment-core/                               │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │IPayment     │  │IPrinter     │  │Payment      │        │ │
│  │  │Provider     │  │Provider     │  │Provider     │        │ │
│  │  │             │  │             │  │Factory      │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │PaymentTypes │  │DeepLink     │  │BuildConfig  │        │ │
│  │  │             │  │Utils        │  │Bridge       │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                IMPLEMENTAÇÕES ESPECÍFICAS                      │
│                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐    │
│  │   stone-sdk/    │                    │   cielo-sdk/    │    │
│  │                 │                    │                 │    │
│  │ ┌─────────────┐ │                    │ ┌─────────────┐ │    │
│  │ │StonePayment │ │                    │ │CieloPayment │ │    │
│  │ │Provider     │ │                    │ │Provider     │ │    │
│  │ │             │ │                    │ │             │ │    │
│  │ │IMPLEMENTA   │ │                    │ │IMPLEMENTA   │ │    │
│  │ │IPayment     │ │                    │ │IPayment     │ │    │
│  │ │Provider     │ │                    │ │Provider     │ │    │
│  │ └─────────────┘ │                    │ └─────────────┘ │    │
│  │                 │                    │                 │    │
│  │ ┌─────────────┐ │                    │ ┌─────────────┐ │    │
│  │ │StonePrinter │ │                    │ │CieloPrinter │ │    │
│  │ │Provider     │ │                    │ │Provider     │ │    │
│  │ │             │ │                    │ │             │ │    │
│  │ │IMPLEMENTA   │ │                    │ │IMPLEMENTA   │ │    │
│  │ │IPrinter     │ │                    │ │IPrinter     │ │    │
│  │ │Provider     │ │                    │ │Provider     │ │    │
│  │ └─────────────┘ │                    │ └─────────────┘ │    │
│  └─────────────────┘                    └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD TIME SELECTION                        │
│                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐    │
│  │   APK STONE     │                    │   APK CIELO     │    │
│  │                 │                    │                 │    │
│  │ BuildConfig:    │                    │ BuildConfig:    │    │
│  │ ENABLE_STONE=   │                    │ ENABLE_STONE=   │    │
│  │ true            │                    │ false           │    │
│  │ ENABLE_CIELO=   │                    │ ENABLE_CIELO=   │    │
│  │ false           │                    │ true            │    │
│  │                 │                    │                 │    │
│  │ MainApplication │                    │ MainApplication │    │
│  │ carrega apenas  │                    │ carrega apenas  │    │
│  │ StonePackage()  │                    │ CieloPackage()  │    │
│  └─────────────────┘                    └─────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## **FLUXO DE EXECUÇÃO**

### **1. Build Time (Compilação):**
```
Gradle Build
    │
    ├── Stone Build
    │   ├── BuildConfig.ENABLE_STONE = true
    │   ├── BuildConfig.ENABLE_CIELO = false
    │   ├── MainApplication carrega StonePackage()
    │   └── APK contém apenas código Stone
    │
    └── Cielo Build
        ├── BuildConfig.ENABLE_STONE = false
        ├── BuildConfig.ENABLE_CIELO = true
        ├── MainApplication carrega CieloPackage()
        └── APK contém apenas código Cielo
```

### **2. Runtime (Execução):**
```
App Inicia
    │
    ├── BuildConfigBridge expõe flags
    │
    ├── PaymentProviderFactory lê BuildConfig
    │
    ├── Factory detecta adquirente ativa
    │
    ├── Factory retorna provider correto
    │
    └── App usa interface comum (IPaymentProvider)
```

## **SEPARAÇÃO DE RESPONSABILIDADES**

### **Aplicação (src/):**
- ✅ **NÃO** conhece adquirentes específicas
- ✅ Usa apenas interfaces comuns
- ✅ Chama métodos genéricos (requestPayment, printReceipt)
- ✅ Recebe resultados padronizados

### **Payment Core:**
- ✅ Define contratos (interfaces)
- ✅ Implementa factory pattern
- ✅ Fornece tipos comuns
- ✅ Gerencia detecção de adquirente

### **SDKs Específicos:**
- ✅ Implementam interfaces definidas
- ✅ Contêm lógica específica do adquirente
- ✅ Gerenciam Deep Links específicos
- ✅ Processam respostas específicas

### **Build System:**
- ✅ Seleciona adquirente em tempo de compilação
- ✅ Inclui apenas código necessário
- ✅ Configura BuildConfig corretamente
- ✅ Gera APKs distintos

## **VANTAGENS DESTA ARQUITETURA**

### **🔒 Isolamento:**
- Código Stone nunca é executado em build Cielo
- Código Cielo nunca é executado em build Stone
- Impossível misturar chamadas

### **🎯 Transparência:**
- App não precisa saber qual adquirente está rodando
- Interface única para todas as operações
- Resultados padronizados

### **🔧 Manutenibilidade:**
- Fácil adicionar nova adquirente
- Mudanças em uma adquirente não afetam outras
- Código organizado e modular

### **📦 Tamanho:**
- APKs contêm apenas código necessário
- Sem dependências desnecessárias
- Otimização automática

### **🧪 Testabilidade:**
- Cada adquirente pode ser testada isoladamente
- Mocks e stubs fáceis de implementar
- Testes unitários independentes
