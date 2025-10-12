import {
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
} from '../models/PaymentTypes';

/**
 * Interface de Payment Provider
 * 
 * Todas as adquirentes (Stone, Cielo, PagSeguro, etc) devem implementar esta interface
 */
export interface IPaymentProvider {
  /**
   * Inicia uma requisição de pagamento
   * 
   * @param request - Dados do pagamento
   * @returns Promise que resolve quando o pagamento é iniciado (não necessariamente concluído)
   */
  requestPayment(request: PaymentRequest): Promise<void>;
  
  /**
   * Cancela uma transação
   * 
   * @param transactionId - ID da transação a cancelar
   * @returns Promise que resolve quando o cancelamento for concluído
   */
  cancelTransaction(transactionId: string): Promise<PaymentResponse>;
  
  /**
   * Verifica se o provider está disponível no dispositivo
   * 
   * @returns Promise<boolean> - true se disponível
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Registra callback para quando o pagamento for concluído
   * 
   * @param callback - Função a ser chamada quando pagamento retornar
   * @returns Função para remover o listener
   */
  onPaymentReceived(
    callback: (result: PaymentResult) => void
  ): () => void;
  
  /**
   * Retorna informações sobre o provider
   */
  getInfo(): ProviderInfo;
}

/**
 * Informações do provider
 */
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
