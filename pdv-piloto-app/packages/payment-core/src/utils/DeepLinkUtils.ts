import { DeepLinkConfig, PaymentDeepLinkParams, DeepLinkResponse } from '../models/DeepLinkTypes';

/**
 * Utilitários para manipulação de Deep Links
 */
export class DeepLinkUtils {
  
  /**
   * Constrói URL de Deep Link para pagamento
   */
  static buildPaymentUrl(
    config: DeepLinkConfig, 
    params: PaymentDeepLinkParams
  ): string {
    const { scheme, host, baseUrl } = config;
    
    // Construir URL base
    let url = baseUrl || `${scheme}://${host}`;
    
    // Adicionar parâmetros obrigatórios
    const queryParams = new URLSearchParams();
    
    // Parâmetros obrigatórios
    queryParams.append('amount', params.amount);
    queryParams.append('type', params.type);
    
    // Parâmetros opcionais
    if (params.orderId) {
      queryParams.append('orderId', params.orderId);
    }
    if (params.installments) {
      queryParams.append('installments', params.installments.toString());
    }
    if (params.capture !== undefined) {
      queryParams.append('capture', params.capture.toString());
    }
    
    // Parâmetros extras
    if (params.extras) {
      Object.entries(params.extras).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }
    
    // Adicionar query string
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }
  
  /**
   * Extrai parâmetros de uma URL de resposta
   */
  static parseResponseUrl(url: string): DeepLinkResponse {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      
      // Extrair todos os parâmetros usando regex (mais compatível)
      const queryString = url.split('?')[1]; // Extrair parte após '?'
      if (queryString) {
        const pairs = queryString.split('&');
        for (const pair of pairs) {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        }
      }
      
      // Determinar sucesso baseado nos parâmetros
      const success = this.determineSuccess(params);
      
      return {
        url,
        params,
        success,
        errorCode: params.errorCode || params.code,
        errorMessage: params.errorMessage || params.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao parsear URL de resposta: ${errorMessage}`);
    }
  }
  
  /**
   * Determina se a operação foi bem-sucedida baseado nos parâmetros
   */
  private static determineSuccess(params: Record<string, string>): boolean {
    // Verificar parâmetros de sucesso comuns
    const successParam = params.success || params.status || params.authorized || params.approved;
    const codeParam = params.errorCode || params.code || params.resultCode;
    
    // Normalizar valores de sucesso
    const normalizedSuccess = (successParam || '').toString().toUpperCase();
    const successByFlag = 
      normalizedSuccess === 'TRUE' ||
      normalizedSuccess === '1' ||
      normalizedSuccess === 'SUCCESS' ||
      normalizedSuccess === 'APPROVED' ||
      normalizedSuccess === 'AUTHORIZED';
    
    // Verificar por código de sucesso
    const successByCode = codeParam === '0' || codeParam === 'OK' || codeParam === null;
    
    return successByFlag || successByCode;
  }
  
  /**
   * Valida se uma URL é um Deep Link válido
   */
  static isValidDeepLink(url: string, config: DeepLinkConfig): boolean {
    try {
      // Verificar se a URL começa com o scheme correto
      return url.startsWith(`${config.scheme}://${config.host}`);
    } catch {
      return false;
    }
  }
  
  /**
   * Extrai parâmetro específico de uma URL
   */
  static getParam(key: string, url: string): string | null {
    try {
      // Usar regex para extrair parâmetro (mais compatível)
      const match = url.match(`[?&]${key}=([^&]+)`);
      if (!match) return null;
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    } catch {
      return null;
    }
  }
  
  /**
   * Constrói URL de cancelamento
   */
  static buildCancelUrl(config: DeepLinkConfig, transactionId: string): string {
    const { scheme, host, baseUrl } = config;
    const url = baseUrl || `${scheme}://${host}`;
    return `${url}?action=cancel&transactionId=${transactionId}`;
  }
  
  /**
   * Constrói URL de teste
   */
  static buildTestUrl(config: DeepLinkConfig): string {
    const { scheme, host, baseUrl } = config;
    const url = baseUrl || `${scheme}://${host}`;
    return `${url}?action=test`;
  }
}
