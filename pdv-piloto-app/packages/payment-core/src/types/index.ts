/**
 * TIPOS CENTRALIZADOS - PAYMENT CORE
 * 
 * Este arquivo centraliza todos os tipos TypeScript utilizados
 * pelos providers de pagamento e impressão
 */

// === TIPOS DE ADQUIRENTE ===
export enum AcquirerType {
  STONE = 'stone',
  CIELO = 'cielo',
  PAGSEGURO = 'pagseguro',
  GETNET = 'getnet',
  REDE = 'rede',
}

// === TIPOS DE PAGAMENTO ===
export enum PaymentType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PIX = 'pix',
  CASH = 'cash',
}

// === STATUS DE TRANSAÇÃO ===
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

// === TIPOS DE IMPRESSÃO ===
export enum PrintFont {
  NORMAL = 'normal',
  BOLD = 'bold',
  LARGE = 'large',
  SMALL = 'small',
}

export enum PrintAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

// === INTERFACES DE PAGAMENTO ===
export interface PaymentRequest {
  /** Valor em REAIS (não centavos) */
  amount: number;
  
  /** Tipo de pagamento */
  type: PaymentType;
  
  /** Número de parcelas (crédito) */
  installments?: number;
  
  /** Captura automática (default: true) */
  capture?: boolean;
  
  /** ID do pedido (opcional) */
  orderId?: string;
  
  /** ID do cliente (opcional) */
  customerId?: string;
  
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  /** Sucesso ou falha */
  success: boolean;
  
  /** ID da transação (nosso sistema) */
  transactionId: string;
  
  /** ID da transação na adquirente */
  acquirerTransactionId: string;
  
  /** Valor processado */
  amount: number;
  
  /** Tipo de pagamento usado */
  type: PaymentType;
  
  /** Status da transação */
  status: TransactionStatus;
  
  /** Data/hora da transação */
  timestamp: Date;
  
  /** Código de erro (se houver) */
  errorCode?: string;
  
  /** Mensagem de erro (se houver) */
  errorMessage?: string;
  
  /** Dados adicionais da adquirente */
  acquirerData?: Record<string, any>;
}

export interface PaymentResult {
  /** Sucesso ou falha */
  success: boolean;
  
  /** ID da transação */
  transactionId: string;
  
  /** Valor */
  amount: number;
  
  /** Timestamp */
  timestamp: Date;
  
  /** Dados extras */
  extras?: Record<string, any>;
}

export interface DeepLinkConfig {
  /** Scheme do Deep Link (ex: "stone_payment_scheme") */
  scheme: string;
  
  /** Host do Deep Link (ex: "pay") */
  host: string;
  
  /** Parâmetros obrigatórios */
  requiredParams: string[];
  
  /** Parâmetros opcionais */
  optionalParams?: string[];
}

// === INTERFACES DE IMPRESSÃO ===
export interface PrintItem {
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface Receipt {
  /** Cabeçalho (nome estabelecimento, etc) */
  header: string[];
  
  /** Itens do pedido */
  items: PrintItem[];
  
  /** Subtotal */
  subtotal: number;
  
  /** Desconto */
  discount?: number;
  
  /** Taxa de entrega */
  deliveryFee?: number;
  
  /** Total */
  total: number;
  
  /** Forma de pagamento */
  paymentMethod: string;
  
  /** ID da transação */
  transactionId?: string;
  
  /** Nome do cliente */
  customerName?: string;
  
  /** Telefone do cliente */
  customerPhone?: string;
  
  /** Endereço */
  address?: string;
  
  /** Data/hora */
  timestamp: Date;
  
  /** Informações adicionais */
  footer?: string[];
}

export interface PrinterStatus {
  /** Impressora disponível */
  available: boolean;
  
  /** Papel baixo */
  paperLow: boolean;
  
  /** Erro (se houver) */
  error?: string;
}

// === CLASSES DE ERRO ===
export class PaymentError extends Error {
  code: string;
  acquirerCode?: string;
  
  constructor(message: string, code: string, acquirerCode?: string) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.acquirerCode = acquirerCode;
  }
}

export class PrinterError extends Error {
  code: string;
  printerCode?: string;
  
  constructor(message: string, code: string, printerCode?: string) {
    super(message);
    this.name = 'PrinterError';
    this.code = code;
    this.printerCode = printerCode;
  }
}

// === INTERFACES DE INFORMAÇÃO ===
export interface ProviderInfo {
  /** ID único da adquirente */
  id: string;
  
  /** Nome da adquirente */
  name: string;
  
  /** Versão do SDK */
  version: string;
  
  /** Tipos de pagamento suportados */
  supportedPaymentTypes: string[];
  
  /** Suporta parcelamento */
  supportsInstallments: boolean;
  
  /** Número máximo de parcelas */
  maxInstallments?: number;
}

export interface PrinterInfo {
  /** ID único do provider */
  id: string;
  
  /** Nome do provider */
  name: string;
  
  /** Modelo da impressora */
  printerModel?: string;
  
  /** Largura de impressão (caracteres) */
  printWidth: number;
}

// === TIPOS DE CONFIGURAÇÃO ===
export interface AcquirerConfig {
  /** Tipo da adquirente */
  type: AcquirerType;
  
  /** Nome da adquirente */
  name: string;
  
  /** Fabricante do dispositivo */
  manufacturer: string;
  
  /** Configuração de Deep Link */
  deepLinkConfig: DeepLinkConfig;
  
  /** Credenciais específicas */
  credentials?: Record<string, any>;
}

// === TIPOS DE CALLBACK ===
export type PaymentCallback = (result: PaymentResult) => void;
export type PaymentErrorCallback = (error: PaymentError) => void;
export type PrinterStatusCallback = (status: PrinterStatus) => void;
export type PrinterErrorCallback = (error: string) => void;

// === TIPOS DE FACTORY ===
export interface ProviderFactoryConfig {
  /** Adquirente ativa */
  activeAcquirer: AcquirerType;
  
  /** Configurações por adquirente */
  acquirerConfigs: Map<AcquirerType, AcquirerConfig>;
  
  /** Fallback para adquirente padrão */
  defaultAcquirer: AcquirerType;
}
