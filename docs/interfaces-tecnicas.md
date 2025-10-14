# 🔧 INTERFACES TÉCNICAS - ARQUITETURA MULTI-ADQUIRENTE

## 📋 **INTERFACES PRINCIPAIS**

### **IPaymentProvider.ts**
```typescript
import { AcquirerType, PaymentType, PaymentRequest, PaymentResult, PaymentError, DeepLinkConfig } from '../types';

/**
 * Interface principal para providers de pagamento
 * TODOS os SDKs de adquirente devem implementar esta interface
 */
export interface IPaymentProvider {
  // === IDENTIFICAÇÃO ===
  /**
   * Retorna o tipo da adquirente
   */
  getAcquirerType(): AcquirerType;
  
  /**
   * Retorna o nome da adquirente
   */
  getAcquirerName(): string;
  
  /**
   * Retorna o fabricante do dispositivo
   */
  getManufacturer(): string;

  // === DISPONIBILIDADE ===
  /**
   * Verifica se a adquirente está disponível no dispositivo
   * @returns Promise<boolean> - true se disponível, false caso contrário
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Retorna os tipos de pagamento suportados
   * @returns PaymentType[] - Array com tipos suportados
   */
  getSupportedPaymentTypes(): PaymentType[];

  // === PAGAMENTO ===
  /**
   * Solicita um pagamento
   * @param request - Dados do pagamento
   * @returns Promise<void> - Resolve quando pagamento é iniciado
   */
  requestPayment(request: PaymentRequest): Promise<void>;
  
  /**
   * Cancela um pagamento em andamento
   * @returns Promise<void> - Resolve quando cancelamento é processado
   */
  cancelPayment(): Promise<void>;
  
  /**
   * Finaliza um pagamento (confirma ou cancela)
   * @param confirm - true para confirmar, false para cancelar
   * @returns Promise<void>
   */
  finalizePayment(confirm: boolean): Promise<void>;

  // === CONFIGURAÇÃO ===
  /**
   * Retorna configuração de Deep Link
   * @returns DeepLinkConfig - Configuração para Deep Links
   */
  getDeepLinkConfig(): DeepLinkConfig;
  
  /**
   * Configura credenciais da adquirente
   * @param credentials - Credenciais específicas
   */
  setCredentials(credentials: any): void;

  // === EVENTOS ===
  /**
   * Registra callback para resposta de pagamento
   * @param callback - Função chamada quando pagamento é processado
   */
  onPaymentResponse(callback: (result: PaymentResult) => void): void;
  
  /**
   * Registra callback para erro de pagamento
   * @param callback - Função chamada quando ocorre erro
   */
  onPaymentError(callback: (error: PaymentError) => void): void;
  
  /**
   * Remove todos os callbacks registrados
   */
  removeAllCallbacks(): void;
}
```

### **IPrinterProvider.ts**
```typescript
import { AcquirerType, PrintFormat, ReceiptData } from '../types';

/**
 * Interface principal para providers de impressão
 * TODOS os SDKs de adquirente devem implementar esta interface
 */
export interface IPrinterProvider {
  // === IDENTIFICAÇÃO ===
  /**
   * Retorna o tipo da adquirente
   */
  getAcquirerType(): AcquirerType;
  
  /**
   * Retorna o nome da adquirente
   */
  getAcquirerName(): string;

  // === DISPONIBILIDADE ===
  /**
   * Verifica se a impressora está disponível
   * @returns Promise<boolean> - true se disponível, false caso contrário
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Retorna os formatos de impressão suportados
   * @returns PrintFormat[] - Array com formatos suportados
   */
  getSupportedFormats(): PrintFormat[];
  
  /**
   * Retorna o comprimento máximo de linha
   * @returns number - Número de caracteres por linha
   */
  getMaxLineLength(): number;

  // === IMPRESSÃO ===
  /**
   * Imprime texto simples
   * @param text - Texto a ser impresso
   * @returns Promise<void> - Resolve quando impressão é concluída
   */
  printText(text: string): Promise<void>;
  
  /**
   * Imprime recibo estruturado
   * @param receipt - Dados do recibo
   * @returns Promise<void> - Resolve quando impressão é concluída
   */
  printReceipt(receipt: ReceiptData): Promise<void>;
  
  /**
   * Imprime imagem
   * @param imageData - Dados da imagem (base64 ou path)
   * @returns Promise<void> - Resolve quando impressão é concluída
   */
  printImage(imageData: string): Promise<void>;
  
  /**
   * Imprime QR Code
   * @param qrData - Dados do QR Code
   * @param size - Tamanho do QR Code (opcional)
   * @returns Promise<void> - Resolve quando impressão é concluída
   */
  printQRCode(qrData: string, size?: number): Promise<void>;

  // === CONTROLE ===
  /**
   * Corta o papel
   * @returns Promise<void> - Resolve quando corte é concluído
   */
  cutPaper(): Promise<void>;
  
  /**
   * Abre a gaveta de dinheiro
   * @returns Promise<void> - Resolve quando gaveta é aberta
   */
  openCashDrawer(): Promise<void>;
}
```

## 📊 **TIPOS E ESTRUTURAS**

### **AcquirerTypes.ts**
```typescript
/**
 * Tipos de adquirentes suportadas
 */
export enum AcquirerType {
  STONE = 'stone',
  CIELO = 'cielo',
  PAGSEGURO = 'pagseguro',
  GETNET = 'getnet',
  REDE = 'rede',
}

/**
 * Tipos de fabricantes suportados
 */
export enum ManufacturerType {
  GERTEC = 'gertec',
  INGENICO = 'ingenico',
  POSITIVO = 'positivo',
  SUNMI = 'sunmi',
  TECTOY = 'tectoy',
}

/**
 * Tipos de pagamento suportados
 */
export enum PaymentType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PIX = 'pix',
  VOUCHER = 'voucher',
  CASH = 'cash',
}
```

### **PaymentTypes.ts**
```typescript
/**
 * Dados de solicitação de pagamento
 */
export interface PaymentRequest {
  // Identificação
  transactionId: string;
  orderId?: string;
  
  // Valores
  amount: number;
  currency: string;
  
  // Tipo de pagamento
  paymentType: PaymentType;
  
  // Dados adicionais
  description?: string;
  installments?: number;
  capture?: boolean;
  
  // Metadados
  metadata?: Record<string, any>;
}

/**
 * Resultado de pagamento
 */
export interface PaymentResult {
  // Identificação
  transactionId: string;
  orderId?: string;
  
  // Status
  status: PaymentStatus;
  
  // Valores
  amount: number;
  currency: string;
  
  // Dados do cartão (se aplicável)
  cardData?: {
    brand: string;
    lastFourDigits: string;
    holderName?: string;
  };
  
  // Dados do PIX (se aplicável)
  pixData?: {
    qrCode?: string;
    copyPasteCode?: string;
    transactionId?: string;
  };
  
  // Timestamps
  createdAt: Date;
  processedAt?: Date;
  
  // Metadados
  metadata?: Record<string, any>;
}

/**
 * Status de pagamento
 */
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

/**
 * Erro de pagamento
 */
export interface PaymentError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
```

### **DeepLinkTypes.ts**
```typescript
/**
 * Configuração de Deep Link
 */
export interface DeepLinkConfig {
  scheme: string;
  host: string;
  path?: string;
  parameters?: Record<string, string>;
}

/**
 * Dados de Deep Link
 */
export interface DeepLinkData {
  url: string;
  parameters: Record<string, string>;
  timestamp: Date;
}
```

### **ReceiptTypes.ts**
```typescript
/**
 * Dados de recibo
 */
export interface ReceiptData {
  // Cabeçalho
  header?: {
    title: string;
    subtitle?: string;
    logo?: string;
  };
  
  // Dados da transação
  transaction: {
    id: string;
    date: Date;
    amount: number;
    currency: string;
    paymentType: PaymentType;
  };
  
  // Dados do estabelecimento
  merchant: {
    name: string;
    address?: string;
    phone?: string;
    cnpj?: string;
  };
  
  // Dados do cliente
  customer?: {
    name?: string;
    document?: string;
  };
  
  // Rodapé
  footer?: {
    message?: string;
    qrCode?: string;
  };
}
```

## 🏭 **FACTORY PATTERN**

### **PaymentProviderFactory.ts**
```typescript
import { IPaymentProvider } from '../interfaces/IPaymentProvider';
import { AcquirerType } from '../types/AcquirerTypes';
import { NativeModules } from 'react-native';

/**
 * Factory para criação de Payment Providers
 * Centraliza a criação de providers de pagamento por adquirente
 */
export class PaymentProviderFactory {
  private static providers: Map<AcquirerType, IPaymentProvider> = new Map();
  
  /**
   * Retorna a adquirente configurada em tempo de compilação
   * Esta informação vem do BuildConfig via Native Bridge
   */
  static getActiveAcquirer(): AcquirerType {
    try {
      const { BuildConfig } = NativeModules;
      
      if (BuildConfig?.ENABLE_STONE) {
        console.log('✅ PaymentProviderFactory: Stone habilitada via BuildConfig');
        return AcquirerType.STONE;
      }
      
      if (BuildConfig?.ENABLE_CIELO) {
        console.log('✅ PaymentProviderFactory: Cielo habilitada via BuildConfig');
        return AcquirerType.CIELO;
      }
      
    } catch (error) {
      console.warn('PaymentProviderFactory: Erro ao ler BuildConfig:', error);
    }
    
    // Fallback para Stone (padrão)
    console.log('⚠️ PaymentProviderFactory: Usando Stone como padrão');
    return AcquirerType.STONE;
  }
  
  /**
   * Retorna o provider da adquirente ativa (configurada em compilação)
   */
  static getActive(): IPaymentProvider {
    return this.getProvider(this.getActiveAcquirer());
  }
  
  /**
   * Retorna o provider de uma adquirente específica
   */
  static getProvider(acquirer: AcquirerType): IPaymentProvider {
    // Verificar cache
    if (this.providers.has(acquirer)) {
      return this.providers.get(acquirer)!;
    }
    
    // Criar novo provider
    const provider = this.createProvider(acquirer);
    
    // Armazenar em cache
    this.providers.set(acquirer, provider);
    
    return provider;
  }
  
  /**
   * Lista todas as adquirentes disponíveis no dispositivo
   */
  static async getAvailableAcquirers(): Promise<AcquirerType[]> {
    const available: AcquirerType[] = [];
    
    for (const acquirer of Object.values(AcquirerType)) {
      try {
        const provider = this.getProvider(acquirer as AcquirerType);
        const isAvailable = await provider.isAvailable();
        
        if (isAvailable) {
          available.push(acquirer as AcquirerType);
        }
      } catch (error) {
        console.log(`Acquirer ${acquirer} not available:`, error);
      }
    }
    
    return available;
  }
  
  /**
   * Limpa o cache de providers (útil para testes)
   */
  static clearCache(): void {
    this.providers.clear();
  }
  
  /**
   * Cria uma nova instância de provider
   */
  private static createProvider(acquirer: AcquirerType): IPaymentProvider {
    switch (acquirer) {
      case AcquirerType.STONE:
        // Lazy load do módulo Stone
        const { StonePaymentProvider } = require('../../../stone-sdk/typescript/StonePaymentProvider');
        return new StonePaymentProvider();
        
      case AcquirerType.CIELO:
        // Lazy load do módulo Cielo
        const { CieloPaymentProvider } = require('../../../cielo-sdk/typescript/CieloPaymentProvider');
        return new CieloPaymentProvider();
        
      case AcquirerType.PAGSEGURO:
        // TODO: Implementar quando PagSeguro estiver pronto
        throw new Error('PagSeguro provider not implemented yet');
        
      case AcquirerType.GETNET:
        throw new Error('GetNet provider not implemented yet');
        
      case AcquirerType.REDE:
        throw new Error('Rede provider not implemented yet');
        
      default:
        throw new Error(`Unsupported acquirer: ${acquirer}`);
    }
  }
}
```

## 🔧 **IMPLEMENTAÇÃO DE EXEMPLO**

### **StonePaymentProvider.ts**
```typescript
import { IPaymentProvider } from '../../payment-core/src/interfaces/IPaymentProvider';
import { AcquirerType, PaymentType, PaymentRequest, PaymentResult, PaymentError, DeepLinkConfig } from '../../payment-core/src/types';

export class StonePaymentProvider implements IPaymentProvider {
  private callbacks: {
    onPaymentResponse?: (result: PaymentResult) => void;
    onPaymentError?: (error: PaymentError) => void;
  } = {};

  // === IDENTIFICAÇÃO ===
  getAcquirerType(): AcquirerType {
    return AcquirerType.STONE;
  }
  
  getAcquirerName(): string {
    return 'Stone';
  }
  
  getManufacturer(): string {
    return 'Stone';
  }

  // === DISPONIBILIDADE ===
  async isAvailable(): Promise<boolean> {
    try {
      // Verificar se app Stone está instalado
      const { StoneBridge } = require('../android/payment/StoneBridge');
      return await StoneBridge.isAvailable();
    } catch (error) {
      console.error('StonePaymentProvider: Erro ao verificar disponibilidade:', error);
      return false;
    }
  }
  
  getSupportedPaymentTypes(): PaymentType[] {
    return [PaymentType.CREDIT, PaymentType.DEBIT, PaymentType.PIX];
  }

  // === PAGAMENTO ===
  async requestPayment(request: PaymentRequest): Promise<void> {
    try {
      // Construir Deep Link Stone
      const deepLink = this.buildStoneDeepLink(request);
      
      // Abrir Deep Link
      const { Linking } = require('react-native');
      await Linking.openURL(deepLink);
      
    } catch (error) {
      const paymentError: PaymentError = {
        code: 'STONE_REQUEST_ERROR',
        message: 'Erro ao solicitar pagamento Stone',
        details: error,
        timestamp: new Date(),
      };
      
      this.callbacks.onPaymentError?.(paymentError);
    }
  }
  
  async cancelPayment(): Promise<void> {
    // Implementar cancelamento Stone
    console.log('StonePaymentProvider: Cancelando pagamento');
  }
  
  async finalizePayment(confirm: boolean): Promise<void> {
    // Implementar finalização Stone
    console.log('StonePaymentProvider: Finalizando pagamento:', confirm);
  }

  // === CONFIGURAÇÃO ===
  getDeepLinkConfig(): DeepLinkConfig {
    return {
      scheme: 'stone',
      host: 'payment',
      path: '/request',
    };
  }
  
  setCredentials(credentials: any): void {
    // Implementar configuração de credenciais Stone
    console.log('StonePaymentProvider: Configurando credenciais:', credentials);
  }

  // === EVENTOS ===
  onPaymentResponse(callback: (result: PaymentResult) => void): void {
    this.callbacks.onPaymentResponse = callback;
  }
  
  onPaymentError(callback: (error: PaymentError) => void): void {
    this.callbacks.onPaymentError = callback;
  }
  
  removeAllCallbacks(): void {
    this.callbacks = {};
  }

  // === MÉTODOS PRIVADOS ===
  private buildStoneDeepLink(request: PaymentRequest): string {
    const config = this.getDeepLinkConfig();
    const params = new URLSearchParams({
      amount: request.amount.toString(),
      currency: request.currency,
      paymentType: request.paymentType,
      transactionId: request.transactionId,
    });
    
    return `${config.scheme}://${config.host}${config.path}?${params.toString()}`;
  }
}
```

## 📝 **NOTAS DE IMPLEMENTAÇÃO**

### **Regras Obrigatórias:**
1. **TODOS** os providers devem implementar **TODAS** as interfaces
2. **NUNCA** usar imports diretos de outros SDKs no código da aplicação
3. **SEMPRE** usar factory pattern para obter providers
4. **SEMPRE** tratar erros e retornar resultados padronizados

### **Boas Práticas:**
1. Usar lazy loading para módulos específicos
2. Implementar cache de providers
3. Logs detalhados para debug
4. Validação rigorosa de parâmetros
5. Tratamento de erros consistente

### **Testes:**
1. Testar cada provider isoladamente
2. Mockar interfaces para testes unitários
3. Testar factory pattern
4. Validar separação de builds
