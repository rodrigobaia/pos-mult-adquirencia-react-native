/**
 * Tipos de pagamento suportados
 */
export enum PaymentType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PIX = 'pix',
  CASH = 'cash',
}

/**
 * Status de uma transação
 */
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

/**
 * Requisição de pagamento
 */
export interface PaymentRequest {
  /** Valor em REAIS (não centavos) */
  amount: number;
  
  /** Tipo de pagamento */
  type: PaymentType;
  
  /** Número de parcelas (crédito) */
  installments?: number;
  
  /** ID do pedido (opcional) */
  orderId?: string;
  
  /** ID do cliente (opcional) */
  customerId?: string;
  
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}

/**
 * Resposta de pagamento
 */
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

/**
 * Resultado de pagamento (do callback/deep link)
 */
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

/**
 * Erro de pagamento
 */
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
