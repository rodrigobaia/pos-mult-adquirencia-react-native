# 📋 PLANO DE REESTRUTURAÇÃO - ARQUITETURA MULTI-ADQUIRENTE

## 🎯 **OBJETIVO PRINCIPAL**

Criar uma arquitetura onde o código da aplicação (`src/`) **NUNCA** saiba qual adquirente está rodando. A seleção deve ser **100% transparente** e baseada apenas em configuração de build.

### **Problema Atual:**
- O app ainda mistura chamadas Stone e Cielo
- `PaymentProviderFactory` tenta detectar por package name (instável)
- `BuildConfigBridge` não está funcionando corretamente
- Implementações Cielo estão incompletas

### **Solução Proposta:**
- Interface única para todas as adquirentes
- Factory pattern com detecção por BuildConfig
- Implementações específicas isoladas por SDK
- Build time selection (não runtime)

---

## 🏗️ **ESTRUTURA PROPOSTA**

### **1. CAMADA DE ABSTRAÇÃO (Core)**
```
packages/
├── payment-core/                    # 🎯 NÚCLEO - Interface comum
│   ├── src/
│   │   ├── interfaces/              # Contratos que TODOS devem implementar
│   │   │   ├── IPaymentProvider.ts  # Interface principal de pagamento
│   │   │   ├── IPrinterProvider.ts  # Interface principal de impressão
│   │   │   └── IAcquirerConfig.ts   # Interface de configuração
│   │   ├── models/                  # Tipos e estruturas comuns
│   │   │   ├── PaymentTypes.ts      # Tipos de pagamento
│   │   │   ├── PaymentResult.ts     # Resultado de pagamento
│   │   │   ├── AcquirerTypes.ts     # Tipos de adquirentes
│   │   │   └── DeepLinkTypes.ts     # Tipos de Deep Link
│   │   ├── factory/                 # Factory pattern
│   │   │   ├── PaymentProviderFactory.ts  # Factory de providers
│   │   │   └── PrinterProviderFactory.ts  # Factory de impressoras
│   │   ├── utils/                   # Utilitários comuns
│   │   │   ├── DeepLinkUtils.ts     # Utilitários de Deep Link
│   │   │   └── ValidationUtils.ts   # Validações comuns
│   │   └── index.ts                 # Exportações principais
│   └── android/                     # Bridge nativo comum
│       ├── BuildConfigBridge.kt     # Bridge para BuildConfig
│       ├── BuildConfigPackage.kt    # Package do bridge
│       └── build.gradle             # Configuração do módulo
```

### **2. IMPLEMENTAÇÕES ESPECÍFICAS (SDKs)**
```
packages/
├── stone-sdk/                       # 🟦 STONE - Implementação específica
│   ├── typescript/
│   │   ├── StonePaymentProvider.ts  # Implementa IPaymentProvider
│   │   ├── StonePrinterProvider.ts  # Implementa IPrinterProvider
│   │   ├── StoneConfig.ts           # Configurações Stone
│   │   └── index.ts                 # Exportações Stone
│   └── android/
│       ├── payment/
│       │   ├── StoneBridge.kt       # Bridge nativo Stone
│       │   └── StonePackage.kt      # Registro React Native
│       ├── printer/
│       │   ├── StonePrinterBridge.kt
│       │   └── StonePrinterPackage.kt
│       └── build.gradle             # Configuração do módulo
│
├── cielo-sdk/                       # 🟨 CIELO - Implementação específica
│   ├── typescript/
│   │   ├── CieloPaymentProvider.ts  # Implementa IPaymentProvider
│   │   ├── CieloPrinterProvider.ts  # Implementa IPrinterProvider
│   │   ├── CieloConfig.ts           # Configurações Cielo
│   │   └── index.ts                 # Exportações Cielo
│   └── android/
│       ├── payment/
│       │   ├── CieloBridge.kt       # Bridge nativo Cielo
│       │   └── CieloPackage.kt      # Registro React Native
│       ├── printer/
│       │   ├── CieloPrinterBridge.kt
│       │   └── CieloPrinterPackage.kt
│       └── build.gradle             # Configuração do módulo
│
└── [futuro-adquirente]-sdk/         # 🟩 OUTROS - Mesma estrutura
```

### **3. APLICAÇÃO (src/) - SEM CONHECIMENTO DE ADQUIRENTE**
```
src/
├── screens/
│   ├── PaymentScreen.tsx            # 🎯 USA APENAS payment-core
│   └── AboutScreen.tsx
├── components/
│   ├── PaymentButton.tsx            # 🎯 USA APENAS payment-core
│   ├── PaymentResultModal.tsx       # 🎯 USA APENAS payment-core
│   └── PrinterButton.tsx            # 🎯 USA APENAS payment-core
├── services/
│   ├── PaymentService.ts            # 🎯 USA APENAS payment-core
│   └── PrinterService.ts            # 🎯 USA APENAS payment-core
└── types/
    └── AppTypes.ts                  # Tipos específicos da aplicação
```

---

## 🔄 **FLUXO DE FUNCIONAMENTO**

### **Build Time (Compilação):**
1. **Gradle** define `BuildConfig.ENABLE_STONE=true/false`
2. **Gradle** define `BuildConfig.ENABLE_CIELO=true/false`
3. **MainApplication.kt** carrega apenas o SDK habilitado
4. **Bundle** inclui apenas o código do adquirente selecionado
5. **APK** é gerado com apenas uma adquirente

### **Runtime (Execução):**
1. **BuildConfigBridge** expõe flags para React Native
2. **PaymentProviderFactory** lê BuildConfig e detecta adquirente ativa
3. **Factory** retorna instância do provider correto (lazy loading)
4. **App** usa interface comum (`IPaymentProvider`)
5. **Provider** implementa lógica específica do adquirente

---

## 📝 **INTERFACES E CONTRATOS**

### **IPaymentProvider.ts:**
```typescript
interface IPaymentProvider {
  // Identificação
  getAcquirerType(): AcquirerType;
  getAcquirerName(): string;
  
  // Disponibilidade
  isAvailable(): Promise<boolean>;
  
  // Pagamento
  requestPayment(request: PaymentRequest): Promise<void>;
  cancelPayment(): Promise<void>;
  
  // Configuração
  getDeepLinkConfig(): DeepLinkConfig;
  getSupportedPaymentTypes(): PaymentType[];
  
  // Eventos
  onPaymentResponse(callback: (result: PaymentResult) => void): void;
  onPaymentError(callback: (error: PaymentError) => void): void;
}
```

### **IPrinterProvider.ts:**
```typescript
interface IPrinterProvider {
  // Identificação
  getAcquirerType(): AcquirerType;
  getAcquirerName(): string;
  
  // Disponibilidade
  isAvailable(): Promise<boolean>;
  
  // Impressão
  printText(text: string): Promise<void>;
  printReceipt(receipt: ReceiptData): Promise<void>;
  printImage(imageData: string): Promise<void>;
  
  // Configuração
  getSupportedFormats(): PrintFormat[];
  getMaxLineLength(): number;
}
```

### **IAcquirerConfig.ts:**
```typescript
interface IAcquirerConfig {
  // Identificação
  acquirerType: AcquirerType;
  acquirerName: string;
  manufacturer: string;
  
  // Configurações
  deepLinkScheme: string;
  deepLinkHost: string;
  requiredApps: string[];
  
  // Credenciais (opcional)
  credentials?: {
    clientId?: string;
    accessToken?: string;
    apiKey?: string;
  };
}
```

---

## 🔧 **PONTOS QUE PRECISAM SER ALTERADOS/IMPLEMENTADOS**

### **❌ PROBLEMAS ATUAIS:**

1. **BuildConfigBridge** não está sendo carregado no MainApplication.kt
2. **PaymentProviderFactory** usa detecção por package name (instável)
3. **CieloPaymentProvider** não está implementado completamente
4. **Interfaces** não estão bem definidas e padronizadas
5. **MainApplication.kt** não carrega pacotes condicionalmente
6. **Estrutura de pastas** não segue o padrão proposto

### **✅ SOLUÇÕES NECESSÁRIAS:**

#### **1. Corrigir BuildConfigBridge:**
- ✅ Criar `BuildConfigBridge.kt` funcional
- ✅ Criar `BuildConfigPackage.kt` 
- ❌ Registrar no `MainApplication.kt`
- ❌ Testar exposição das flags

#### **2. Implementar CieloPaymentProvider:**
- ❌ Criar implementação completa de `IPaymentProvider`
- ❌ Implementar Deep Link para Cielo LIO
- ❌ Implementar parsing de respostas Cielo
- ❌ Implementar tratamento de erros

#### **3. Refatorar PaymentProviderFactory:**
- ❌ Usar BuildConfig em vez de package name
- ❌ Implementar lazy loading correto
- ❌ Adicionar fallback para Stone
- ❌ Implementar cache de providers

#### **4. Corrigir MainApplication.kt:**
- ❌ Carregar pacotes condicionalmente baseado em BuildConfig
- ❌ Remover dependências desnecessárias
- ❌ Adicionar logs de debug

#### **5. Padronizar Interfaces:**
- ❌ Definir contratos claros e rigorosos
- ❌ Implementar validação de implementação
- ❌ Adicionar tipos TypeScript completos
- ❌ Criar documentação das interfaces

#### **6. Reestruturar Pastas:**
- ❌ Mover arquivos para estrutura proposta
- ❌ Atualizar imports e referências
- ❌ Criar index.ts para exportações
- ❌ Atualizar build.gradle files

---

## 🎯 **CRONOGRAMA DE IMPLEMENTAÇÃO**

### **Fase 1: Fundação (1-2 dias)**
1. ✅ Corrigir BuildConfigBridge
2. ✅ Corrigir MainApplication.kt
3. ❌ Testar BuildConfig funcionando
4. ❌ Refatorar PaymentProviderFactory

### **Fase 2: Interfaces (1 dia)**
1. ❌ Padronizar IPaymentProvider
2. ❌ Padronizar IPrinterProvider
3. ❌ Criar tipos TypeScript completos
4. ❌ Documentar interfaces

### **Fase 3: Implementação Cielo (2-3 dias)**
1. ❌ Implementar CieloPaymentProvider completo
2. ❌ Implementar CieloPrinterProvider
3. ❌ Testar Deep Links Cielo
4. ❌ Validar respostas Cielo

### **Fase 4: Testes e Validação (1 dia)**
1. ❌ Testar separação completa
2. ❌ Validar builds Stone vs Cielo
3. ❌ Testar funcionalidades
4. ❌ Documentar resultados

---

## 🧪 **CRITÉRIOS DE SUCESSO**

### **Build Time:**
- [ ] APK Stone contém apenas código Stone
- [ ] APK Cielo contém apenas código Cielo
- [ ] BuildConfig flags funcionam corretamente
- [ ] Tamanho dos APKs é similar

### **Runtime:**
- [ ] App Stone chama apenas recursos Stone
- [ ] App Cielo chama apenas recursos Cielo
- [ ] PaymentProviderFactory detecta corretamente
- [ ] Interfaces funcionam transparentemente

### **Código:**
- [ ] src/ não conhece adquirentes específicas
- [ ] Interfaces são rigorosas e bem definidas
- [ ] Factory pattern funciona corretamente
- [ ] Lazy loading funciona

---

## 📚 **DOCUMENTAÇÃO ADICIONAL**

- [ ] Guia de implementação de nova adquirente
- [ ] Documentação das interfaces
- [ ] Exemplos de uso
- [ ] Troubleshooting guide

---

**Status:** 📝 **PLANO DOCUMENTADO** - Pronto para implementação
**Próximo Passo:** Iniciar Fase 1 - Fundação
