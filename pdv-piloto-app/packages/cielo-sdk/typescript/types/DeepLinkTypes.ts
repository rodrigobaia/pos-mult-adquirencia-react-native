/**
 * Tipos para Deep Link da Cielo LIO
 */

export interface CieloDeepLinkRequest {
  action: 'PAYMENT' | 'CANCEL' | 'PRINT';
  payload: string; // Base64 encoded JSON
}

export interface CieloDeepLinkResponse {
  success: boolean;
  data?: any;
  error?: string;
  transactionId?: string;
  cieloCode?: string;
}

export interface CieloDeepLinkConfig {
  scheme: string;
  host: string;
  packageName: string;
}
