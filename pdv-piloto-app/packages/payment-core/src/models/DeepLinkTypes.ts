import { PaymentType } from './PaymentTypes';

/**
 * Tipos relacionados a Deep Links
 */

/**
 * Configuração de Deep Link
 */
export interface DeepLinkConfig {
  /** Scheme do Deep Link (ex: "stone_payment_scheme") */
  scheme: string;
  
  /** Host do Deep Link (ex: "pay") */
  host: string;
  
  /** Parâmetros obrigatórios */
  requiredParams: string[];
  
  /** Parâmetros opcionais */
  optionalParams?: string[];
  
  /** URL base para Deep Links */
  baseUrl?: string;
  
  /** Timeout para Deep Links (ms) */
  timeout?: number;
}

/**
 * Parâmetros de Deep Link para pagamento
 */
export interface PaymentDeepLinkParams {
  /** Valor em centavos */
  amount: string;
  
  /** Tipo de pagamento */
  type: PaymentType;
  
  /** ID do pedido */
  orderId?: string;
  
  /** Número de parcelas */
  installments?: number;
  
  /** Captura automática */
  capture?: boolean;
  
  /** Parâmetros adicionais */
  extras?: Record<string, any>;
}

/**
 * Resposta de Deep Link
 */
export interface DeepLinkResponse {
  /** URL completa da resposta */
  url: string;
  
  /** Parâmetros extraídos da URL */
  params: Record<string, string>;
  
  /** Se a operação foi bem-sucedida */
  success: boolean;
  
  /** Código de erro (se houver) */
  errorCode?: string;
  
  /** Mensagem de erro (se houver) */
  errorMessage?: string;
}

/**
 * Callback de Deep Link
 */
export type DeepLinkCallback = (response: DeepLinkResponse) => void;

/**
 * Erro de Deep Link
 */
export class DeepLinkError extends Error {
  code: string;
  url?: string;
  
  constructor(message: string, code: string, url?: string) {
    super(message);
    this.name = 'DeepLinkError';
    this.code = code;
    this.url = url;
  }
}
