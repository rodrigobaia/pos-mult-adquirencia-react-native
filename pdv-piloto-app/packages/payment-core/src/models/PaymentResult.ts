import { PaymentType, TransactionStatus } from './PaymentTypes';

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
 * Resposta de pagamento completa
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
