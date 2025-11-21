import { PaymentRequest, PaymentType } from '../models/PaymentTypes';
import { PaymentError } from '../models/PaymentResult';

/**
 * Utilitários de validação
 */
export class ValidationUtils {
  
  /**
   * Valida requisição de pagamento
   */
  static validatePaymentRequest(request: PaymentRequest): void {
    // Validar valor
    if (!request.amount || request.amount <= 0) {
      throw new PaymentError(
        'Valor deve ser maior que zero',
        'INVALID_AMOUNT'
      );
    }
    
    // Validar tipo de pagamento
    if (!Object.values(PaymentType).includes(request.type)) {
      throw new PaymentError(
        `Tipo de pagamento inválido: ${request.type}`,
        'INVALID_PAYMENT_TYPE'
      );
    }
    
    // Validar parcelas para crédito
    if (request.type === PaymentType.CREDIT) {
      if (request.installments && (request.installments < 1 || request.installments > 12)) {
        throw new PaymentError(
          'Número de parcelas deve estar entre 1 e 12',
          'INVALID_INSTALLMENTS'
        );
      }
    }
    
    // Validar parcelas para débito (não deve ter parcelas)
    if (request.type === PaymentType.DEBIT && request.installments && request.installments > 1) {
      throw new PaymentError(
        'Débito não suporta parcelamento',
        'DEBIT_NO_INSTALLMENTS'
      );
    }
    
    // Validar PIX (não deve ter parcelas)
    if (request.type === PaymentType.PIX && request.installments && request.installments > 1) {
      throw new PaymentError(
        'PIX não suporta parcelamento',
        'PIX_NO_INSTALLMENTS'
      );
    }
  }
  
  /**
   * Valida valor monetário
   */
  static validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new PaymentError(
        'Valor deve ser um número válido',
        'INVALID_AMOUNT_TYPE'
      );
    }
    
    if (amount <= 0) {
      throw new PaymentError(
        'Valor deve ser maior que zero',
        'INVALID_AMOUNT_VALUE'
      );
    }
    
    if (amount > 999999.99) {
      throw new PaymentError(
        'Valor muito alto (máximo: R$ 999.999,99)',
        'AMOUNT_TOO_HIGH'
      );
    }
  }
  
  /**
   * Valida ID de transação
   */
  static validateTransactionId(transactionId: string): void {
    if (!transactionId || typeof transactionId !== 'string') {
      throw new PaymentError(
        'ID da transação é obrigatório',
        'INVALID_TRANSACTION_ID'
      );
    }
    
    if (transactionId.length < 3 || transactionId.length > 50) {
      throw new PaymentError(
        'ID da transação deve ter entre 3 e 50 caracteres',
        'INVALID_TRANSACTION_ID_LENGTH'
      );
    }
    
    // Validar caracteres permitidos (alfanumérico, hífen, underscore)
    if (!/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
      throw new PaymentError(
        'ID da transação contém caracteres inválidos',
        'INVALID_TRANSACTION_ID_CHARS'
      );
    }
  }
  
  /**
   * Valida credenciais
   */
  static validateCredentials(credentials: any): void {
    if (!credentials || typeof credentials !== 'object') {
      throw new PaymentError(
        'Credenciais são obrigatórias',
        'INVALID_CREDENTIALS'
      );
    }
    
    // Validar se tem pelo menos uma propriedade
    if (Object.keys(credentials).length === 0) {
      throw new PaymentError(
        'Credenciais não podem estar vazias',
        'EMPTY_CREDENTIALS'
      );
    }
  }
  
  /**
   * Valida configuração de Deep Link
   */
  static validateDeepLinkConfig(config: any): void {
    if (!config || typeof config !== 'object') {
      throw new PaymentError(
        'Configuração de Deep Link é obrigatória',
        'INVALID_DEEPLINK_CONFIG'
      );
    }
    
    if (!config.scheme || typeof config.scheme !== 'string') {
      throw new PaymentError(
        'Scheme do Deep Link é obrigatório',
        'INVALID_DEEPLINK_SCHEME'
      );
    }
    
    if (!config.host || typeof config.host !== 'string') {
      throw new PaymentError(
        'Host do Deep Link é obrigatório',
        'INVALID_DEEPLINK_HOST'
      );
    }
    
    if (!Array.isArray(config.requiredParams)) {
      throw new PaymentError(
        'Parâmetros obrigatórios devem ser um array',
        'INVALID_DEEPLINK_REQUIRED_PARAMS'
      );
    }
  }
  
  /**
   * Sanitiza string para uso seguro
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Remover caracteres perigosos
    return input
      .replace(/[<>\"'&]/g, '') // Remover HTML/XML chars
      .replace(/[\r\n\t]/g, ' ') // Substituir quebras de linha por espaço
      .trim()
      .substring(0, 1000); // Limitar tamanho
  }
  
  /**
   * Valida e formata valor monetário
   */
  static formatAmount(amount: number): string {
    this.validateAmount(amount);
    
    // Converter para centavos e formatar como string
    const cents = Math.round(amount * 100);
    return cents.toString();
  }
  
  /**
   * Valida e formata número de parcelas
   */
  static formatInstallments(installments: number | undefined, paymentType: PaymentType): number {
    if (!installments || installments < 1) {
      return 1; // À vista
    }
    
    if (paymentType === PaymentType.DEBIT || paymentType === PaymentType.PIX) {
      return 1; // Débito e PIX sempre à vista
    }
    
    if (installments > 12) {
      return 12; // Máximo 12 parcelas
    }
    
    return installments;
  }
}
