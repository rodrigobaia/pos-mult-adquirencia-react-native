import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';
import {
  IPaymentProvider,
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
  PaymentType,
  TransactionStatus,
  PaymentError,
  ProviderInfo,
} from '../../payment-core/src';

const { StoneBridge } = NativeModules;

/**
 * Provider de pagamento Stone
 * 
 * Implementa a interface IPaymentProvider para integração com Stone via Deep Link
 */
export class StonePaymentProvider implements IPaymentProvider {
  
  /**
   * Inicia uma requisição de pagamento
   */
  async requestPayment(request: PaymentRequest): Promise<void> {
    // Validar request
    this.validateRequest(request);
    
    // Verificar se Stone está disponível
    const available = await this.isAvailable();
    if (!available) {
      throw new PaymentError(
        'Stone app não está instalado neste dispositivo',
        'STONE_NOT_AVAILABLE'
      );
    }
    
    // Converter REAIS para CENTAVOS e formatar como string sem ponto decimal
    // Exemplo: 50.00 → "5000"
    const amountFormatted = request.amount.toFixed(2).replace('.', '');
    
    // Mapear PaymentType para string Stone
    const stonePaymentType = this.mapPaymentTypeToString(request.type);
    
    // Chamar native module
    await StoneBridge.requestPayment(amountFormatted, stonePaymentType);
  }
  
  /**
   * Cancela uma transação (Stone não suporta via Deep Link)
   */
  async cancelTransaction(transactionId: string): Promise<PaymentResponse> {
    throw new PaymentError(
      'Cancelamento via Deep Link não é suportado pela Stone',
      'CANCEL_NOT_SUPPORTED'
    );
  }
  
  /**
   * Verifica se Stone está disponível
   */
  async isAvailable(): Promise<boolean> {
    try {
      const installed = await StoneBridge.isStoneInstalled();
      return installed === true;
    } catch {
      return false;
    }
  }
  
  /**
   * Registra listener para resultado de pagamento
   */
  onPaymentReceived(
    callback: (result: PaymentResult) => void
  ): () => void {
    const listener: EmitterSubscription = DeviceEventEmitter.addListener(
      'paymentReceived',
      (event: string) => {
        try {
          const result = this.parseStoneResponse(event);
          callback(result);
        } catch (error) {
          console.error('Error parsing Stone payment result:', error);
          
          // Enviar resultado de erro
          callback({
            success: false,
            transactionId: '',
            amount: 0,
            timestamp: new Date(),
            extras: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      }
    );
    
    // Retornar função para remover listener
    return () => {
      listener.remove();
    };
  }
  
  /**
   * Retorna informações do provider
   */
  getInfo(): ProviderInfo {
    return {
      id: 'stone',
      name: 'Stone Pagamentos',
      version: '4.8.7',
      supportedPaymentTypes: ['credit', 'debit'],
      supportsInstallments: true,
      maxInstallments: 12,
    };
  }
  
  /**
   * Valida a requisição de pagamento
   */
  private validateRequest(request: PaymentRequest): void {
    if (request.amount <= 0) {
      throw new PaymentError(
        'Valor deve ser maior que zero',
        'INVALID_AMOUNT'
      );
    }
    
    if (request.type === PaymentType.PIX) {
      throw new PaymentError(
        'PIX não é suportado via Deep Link Stone',
        'PIX_NOT_SUPPORTED'
      );
    }
    
    if (request.installments && request.installments > 12) {
      throw new PaymentError(
        'Número máximo de parcelas é 12',
        'INVALID_INSTALLMENTS'
      );
    }
  }
  
  /**
   * Mapeia PaymentType para string Stone
   */
  private mapPaymentTypeToString(type: PaymentType): string {
    const mapping: Record<PaymentType, string> = {
      [PaymentType.CREDIT]: 'credit',
      [PaymentType.DEBIT]: 'debit',
      [PaymentType.PIX]: 'pix',
      [PaymentType.CASH]: 'credit', // Fallback
    };
    
    return mapping[type] || 'credit';
  }
  
  /**
   * Extrai parâmetro da URL
   */
  private getParam(key: string, url: string): string | null {
    const match = url.match('[?&]' + key + '=([^&]+)');
    return match ? match[1] : null;
  }
  
  /**
   * Parse da resposta Stone para formato genérico
   */
  private parseStoneResponse(event: string): PaymentResult {
    // event é a URL completa: stone_payment_scheme://pay-response?success=true&itk=123&amount=5000...
    
    const success = this.getParam('success', event) === 'true' || this.getParam('code', event) === '0';
    const transactionId = this.getParam('itk', event) || '';
    const amountStr = this.getParam('amount', event) || '0';
    const amountCents = parseInt(amountStr, 10);
    const amount = amountCents / 100; // Converter centavos → reais
    
    return {
      success,
      transactionId,
      amount,
      timestamp: new Date(),
      extras: {
        orderId: this.getParam('order_id', event), // ✅ Order ID que foi enviado
        cardBrand: this.getParam('brand', event), // Bandeira do cartão
        cardholderName: this.getParam('cardholder_name', event), // Nome no cartão
        authorizationCode: this.getParam('authorization_code', event), // Código autorização
        authorizationDateTime: this.getParam('authorization_date_time', event), // Data/hora
        atk: this.getParam('atk', event), // Authorizer Transaction Key
        pan: this.getParam('pan', event), // PAN mascarado
        paymentType: this.getParam('type', event), // Tipo (Débito/Crédito)
        entryMode: this.getParam('entry_mode', event), // Modo de entrada
        installmentCount: this.getParam('installment_count', event), // Parcelas
        errorCode: this.getParam('code', event), // Código de erro/sucesso
        errorMessage: this.getParam('message', event), // Mensagem de erro
        acquirer: 'stone',
      },
    };
  }
}
