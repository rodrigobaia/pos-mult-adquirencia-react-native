import { PaymentRequest, PaymentType } from '../models/PaymentTypes';
import { PaymentResponse, PaymentResult, PaymentError } from '../models/PaymentResult';
import { AcquirerType, DeepLinkConfig } from '../models/AcquirerTypes';

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

  // === COMPATIBILIDADE (MÉTODOS LEGADOS) ===
  /**
   * @deprecated Use onPaymentResponse() em vez disso
   */
  onPaymentReceived(callback: (result: PaymentResult) => void): () => void;
  
  /**
   * @deprecated Use getAcquirerName() em vez disso
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
