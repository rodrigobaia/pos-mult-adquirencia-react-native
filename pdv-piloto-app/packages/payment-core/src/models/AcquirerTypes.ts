/**
 * Tipos relacionados a adquirentes
 */

/**
 * Tipos de adquirente suportadas
 */
export enum AcquirerType {
  STONE = 'stone',
  CIELO = 'cielo',
  PAGSEGURO = 'pagseguro',
  GETNET = 'getnet',
  REDE = 'rede',
}

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
 * Informações da adquirente
 */
export interface AcquirerInfo {
  /** ID único da adquirente */
  id: string;
  
  /** Nome da adquirente */
  name: string;
  
  /** Versão do SDK */
  version: string;
  
  /** Fabricante do dispositivo */
  manufacturer: string;
  
  /** Tipos de pagamento suportados */
  supportedPaymentTypes: string[];
  
  /** Suporta parcelamento */
  supportsInstallments: boolean;
  
  /** Número máximo de parcelas */
  maxInstallments?: number;
  
  /** Suporta cancelamento */
  supportsCancellation: boolean;
  
  /** Suporta impressão */
  supportsPrinting: boolean;
}
