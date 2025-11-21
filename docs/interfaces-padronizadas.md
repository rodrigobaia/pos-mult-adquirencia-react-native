# 📋 Interfaces Padronizadas - Fase 2

## 🎯 **Objetivo**
Documentar as interfaces padronizadas criadas na Fase 2 para garantir consistência entre todos os providers de adquirente.

---

## 🔧 **IPaymentProvider**

### **Visão Geral**
Interface principal que TODOS os providers de pagamento devem implementar. Garante consistência entre Stone, Cielo, PagSeguro, etc.

### **Métodos Obrigatórios**

#### **🔍 Identificação**
```typescript
getAcquirerType(): AcquirerType
getAcquirerName(): string
getManufacturer(): string
```

#### **✅ Disponibilidade**
```typescript
isAvailable(): Promise<boolean>
getSupportedPaymentTypes(): PaymentType[]
```

#### **💳 Pagamento**
```typescript
requestPayment(request: PaymentRequest): Promise<void>
cancelPayment(): Promise<void>
finalizePayment(confirm: boolean): Promise<void>
```

#### **⚙️ Configuração**
```typescript
getDeepLinkConfig(): DeepLinkConfig
setCredentials(credentials: any): void
```

#### **📡 Eventos**
```typescript
onPaymentResponse(callback: (result: PaymentResult) => void): void
onPaymentError(callback: (error: PaymentError) => void): void
removeAllCallbacks(): void
```

### **Métodos de Compatibilidade (Legados)**
```typescript
// @deprecated - Use onPaymentResponse() em vez disso
onPaymentReceived(callback: (result: PaymentResult) => void): () => void

// @deprecated - Use getAcquirerName() em vez disso
getInfo(): ProviderInfo
```

---

## 🖨️ **IPrinterProvider**

### **Visão Geral**
Interface principal que TODOS os providers de impressão devem implementar.

### **Métodos Obrigatórios**

#### **🔍 Identificação**
```typescript
getAcquirerType(): AcquirerType
getAcquirerName(): string
getManufacturer(): string
```

#### **✅ Disponibilidade**
```typescript
isAvailable(): Promise<boolean>
getPrinterStatus(): Promise<PrinterStatus>
```

#### **🖨️ Impressão**
```typescript
printReceipt(receipt: Receipt): Promise<void>
printText(lines: string[]): Promise<void>
printItems(items: PrintItem[]): Promise<void>
printHeader(header: string[]): Promise<void>
printFooter(footer: string[]): Promise<void>
```

#### **🔧 Teste e Manutenção**
```typescript
testPrint(): Promise<boolean>
cutPaper(): Promise<void>
openDrawer(): Promise<void>
```

#### **⚙️ Configuração**
```typescript
setPrintWidth(width: number): void
setFont(font: PrintFont): void
setAlignment(alignment: PrintAlignment): void
```

#### **📡 Eventos**
```typescript
onStatusChange(callback: (status: PrinterStatus) => void): void
onPrintError(callback: (error: string) => void): void
removeAllCallbacks(): void
```

---

## 📊 **Tipos TypeScript**

### **Enums Principais**
```typescript
enum AcquirerType {
  STONE = 'stone',
  CIELO = 'cielo',
  PAGSEGURO = 'pagseguro',
  GETNET = 'getnet',
  REDE = 'rede',
}

enum PaymentType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PIX = 'pix',
  CASH = 'cash',
}

enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}
```

### **Interfaces de Dados**
```typescript
interface PaymentRequest {
  amount: number;           // Valor em REAIS
  type: PaymentType;
  installments?: number;
  capture?: boolean;        // Default: true
  orderId?: string;
  customerId?: string;
  metadata?: Record<string, any>;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  timestamp: Date;
  extras?: Record<string, any>;
}

interface DeepLinkConfig {
  scheme: string;           // Ex: "stone_payment_scheme"
  host: string;             // Ex: "pay"
  requiredParams: string[];
  optionalParams?: string[];
}
```

### **Classes de Erro**
```typescript
class PaymentError extends Error {
  code: string;
  acquirerCode?: string;
}

class PrinterError extends Error {
  code: string;
  printerCode?: string;
}
```

---

## 🏗️ **Estrutura de Arquivos**

```
packages/payment-core/src/
├── types/
│   └── index.ts              # Tipos centralizados
├── interfaces/
│   ├── IPaymentProvider.ts   # Interface de pagamento
│   └── IPrinterProvider.ts   # Interface de impressão
├── models/
│   ├── PaymentTypes.ts       # Tipos de pagamento (legado)
│   └── PrintTypes.ts         # Tipos de impressão (legado)
├── factory/
│   ├── PaymentProviderFactory.ts
│   └── PrinterProviderFactory.ts
└── index.ts                  # Exports centralizados
```

---

## ✅ **Critérios de Implementação**

### **Para Stone Provider:**
- [x] Implementar todos os métodos obrigatórios
- [x] Manter compatibilidade com métodos legados
- [x] Usar SDK nativo (não Deep Link)
- [x] Implementar callbacks corretamente

### **Para Cielo Provider:**
- [ ] Implementar todos os métodos obrigatórios
- [ ] Usar Deep Link para pagamento
- [ ] Implementar callbacks corretamente
- [ ] Manter compatibilidade com métodos legados

### **Para Futuras Adquirentes:**
- [ ] Seguir exatamente a interface padronizada
- [ ] Implementar todos os métodos obrigatórios
- [ ] Manter compatibilidade com métodos legados
- [ ] Documentar implementação específica

---

## 🔄 **Migração de Código Existente**

### **Antes (Legado):**
```typescript
// Código específico da Stone
const stoneProvider = new StonePaymentProvider();
stoneProvider.requestPayment(request);
stoneProvider.onPaymentReceived(callback);
```

### **Depois (Padronizado):**
```typescript
// Código agnóstico de adquirente
const provider = PaymentProviderFactory.getActive();
provider.requestPayment(request);
provider.onPaymentResponse(callback);
```

---

## 📝 **Notas Importantes**

1. **Compatibilidade**: Métodos legados são mantidos com `@deprecated`
2. **Tipos Centralizados**: Todos os tipos estão em `types/index.ts`
3. **Exports**: Interface principal exporta tudo via `index.ts`
4. **Documentação**: Cada método deve ter JSDoc completo
5. **Testes**: Cada provider deve ter testes unitários

---

## 🎯 **Próximos Passos**

1. **Implementar CieloPaymentProvider** seguindo a interface
2. **Atualizar StonePaymentProvider** para usar interface completa
3. **Criar testes unitários** para cada provider
4. **Documentar exemplos** de uso para cada adquirente
5. **Validar separação** entre adquirentes

---

**✅ Fase 2: Interfaces - CONCLUÍDA**
