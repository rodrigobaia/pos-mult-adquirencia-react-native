/**
 * Tipos específicos da Cielo LIO
 */

export interface CieloCredentials {
  clientID: string;
  accessToken: string;
}

export interface CieloOrderRequest {
  accessToken: string;
  clientID: string;
  value: number;
  paymentCode: string;
  installments?: number;
  email?: string;
  merchantCode?: string;
  reference?: string;
  items?: CieloOrderItem[];
  subAcquirer?: string;
}

export interface CieloOrderItem {
  name: string;
  quantity: number;
  unitValue: number;
  sku?: string;
}

export interface CieloCancelRequest {
  id: string;
  clientID: string;
  accessToken: string;
  cieloCode?: string;
}

export interface CieloPrintRequest {
  operation: 'PRINT_TEXT' | 'PRINT_IMAGE';
  value: string;
  styles?: CieloPrintStyles;
}

export interface CieloPrintStyles {
  fontSize?: number;
  alignment?: 'LEFT' | 'CENTER' | 'RIGHT';
  bold?: boolean;
}

export interface CieloPaymentResponse {
  success: boolean;
  transactionId?: string;
  cieloCode?: string;
  error?: string;
  rawResponse?: any;
}

export interface CieloDeviceInfo {
  model: string;
  serialNumber: string;
  batteryLevel: number;
  merchantCode: string;
  enabledProducts: string[];
}
