/**
 * Tipos básicos de pagamento
 */

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
  
  /** Captura automática (default: true) */
  capture?: boolean;
  
  /** ID do pedido (opcional) */
  orderId?: string;
  
  /** ID do cliente (opcional) */
  customerId?: string;
  
  /** Metadados adicionais */
  metadata?: Record<string, any>;
}
