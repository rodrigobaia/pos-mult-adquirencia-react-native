import { NativeModules, Linking } from 'react-native';
import { IPaymentProvider, PaymentRequest, PaymentResult, ProviderInfo } from '../../payment-core/src/interfaces/IPaymentProvider';
import { PaymentType } from '../../payment-core/src/models/PaymentTypes';
import { CieloOrderRequest, CieloPaymentResponse, CieloCredentials } from './types/CieloTypes';
import { CieloDeepLinkRequest, CieloDeepLinkResponse } from './types/DeepLinkTypes';

const { CieloBridge } = NativeModules;

/**
 * Provider de pagamento para Cielo LIO
 * Implementa integração via Deep Link
 */
export class CieloPaymentProvider implements IPaymentProvider {
  private readonly credentials: CieloCredentials;
  private readonly deepLinkConfig = {
    scheme: 'lio',
    host: 'payment',
    packageName: 'com.cielo.lio'
  };

  constructor(credentials?: CieloCredentials) {
    this.credentials = credentials || {
      clientID: 'hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN',
      accessToken: '3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4'
    };
  }

  async requestPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      console.log('CieloPaymentProvider: Iniciando pagamento', request);

      // Converter PaymentType para paymentCode da Cielo
      const paymentCode = this.getPaymentCode(request.type);
      
      // Criar requisição para Cielo
      const cieloRequest: CieloOrderRequest = {
        accessToken: this.credentials.accessToken,
        clientID: this.credentials.clientID,
        value: request.amount,
        paymentCode,
        installments: request.installments || 1,
        reference: `PDV_${Date.now()}`,
        items: [{
          name: 'Pagamento PDV Piloto',
          quantity: 1,
          unitValue: request.amount
        }]
      };

      // Criar Deep Link request
      const deepLinkRequest: CieloDeepLinkRequest = {
        action: 'PAYMENT',
        payload: this.encodePayload(cieloRequest)
      };

      // Construir URI do Deep Link seguindo padrão da Cielo
      const base64Payload = this.encodePayload(cieloRequest);
      const deepLinkUri = `${this.deepLinkConfig.scheme}://${this.deepLinkConfig.host}?request=${base64Payload}&urlCallback=order://response`;
      
      console.log('CieloPaymentProvider: Deep Link URI', deepLinkUri);

      // Abrir Deep Link
      const canOpen = await Linking.canOpenURL(deepLinkUri);
      if (!canOpen) {
        throw new Error('Cielo LIO não está instalado ou não pode ser aberto');
      }

      await Linking.openURL(deepLinkUri);

      // Aguardar resposta (será capturada pelo MainActivity)
      return new Promise((resolve) => {
        // Timeout de 5 minutos
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            error: 'Timeout: Pagamento não foi concluído em 5 minutos',
            extras: {
              provider: 'cielo',
              timeout: true
            }
          });
        }, 5 * 60 * 1000);

        // Listener para resposta da Cielo
        const handleCieloResponse = (event: any) => {
          try {
            const data = JSON.parse(event);
            if (data.source === 'cielo') {
              clearTimeout(timeout);
              resolve(this.parseCieloResponse(data));
            }
          } catch (error) {
            console.error('CieloPaymentProvider: Erro ao processar resposta', error);
          }
        };

        // Registrar listener temporário
        const { DeviceEventEmitter } = require('react-native');
        const subscription = DeviceEventEmitter.addListener('CieloPaymentResponse', handleCieloResponse);
        
        // Limpar listener após timeout
        setTimeout(() => {
          subscription.remove();
        }, 5 * 60 * 1000);
      });

    } catch (error) {
      console.error('CieloPaymentProvider: Erro no pagamento', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        extras: {
          provider: 'cielo',
          error: error
        }
      };
    }
  }

  async cancelPayment(transactionId: string): Promise<PaymentResult> {
    try {
      console.log('CieloPaymentProvider: Cancelando pagamento', transactionId);

      const cancelRequest = {
        id: transactionId,
        clientID: this.credentials.clientID,
        accessToken: this.credentials.accessToken
      };

      const deepLinkRequest: CieloDeepLinkRequest = {
        action: 'CANCEL',
        payload: this.encodePayload(cancelRequest)
      };

      const deepLinkUri = this.buildDeepLinkUri(deepLinkRequest);
      await Linking.openURL(deepLinkUri);

      // Simular cancelamento bem-sucedido
      return {
        success: true,
        transactionId,
        extras: {
          provider: 'cielo',
          action: 'cancel',
          rawRequest: cancelRequest
        }
      };

    } catch (error) {
      console.error('CieloPaymentProvider: Erro no cancelamento', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no cancelamento',
        extras: {
          provider: 'cielo',
          error: error
        }
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const testUri = `${this.deepLinkConfig.scheme}://${this.deepLinkConfig.host}`;
      return await Linking.canOpenURL(testUri);
    } catch {
      return false;
    }
  }

  getInfo(): ProviderInfo {
    return {
      name: 'Cielo LIO',
      version: '1.0.0',
      acquirer: 'cielo',
      features: ['payment', 'cancel', 'print'],
      supportedTypes: ['credit', 'debit', 'pix']
    };
  }

  private getPaymentCode(type: PaymentType): string {
    switch (type) {
      case PaymentType.CREDIT:
        return 'CREDIT';
      case PaymentType.DEBIT:
        return 'DEBIT';
      case PaymentType.PIX:
        return 'PIX';
      default:
        return 'CREDIT';
    }
  }

  private encodePayload(payload: any): string {
    return btoa(JSON.stringify(payload));
  }

  private buildDeepLinkUri(request: CieloDeepLinkRequest): string {
    return `${this.deepLinkConfig.scheme}://${this.deepLinkConfig.host}?action=${request.action}&payload=${request.payload}`;
  }

  private parseCieloResponse(data: any): PaymentResult {
    try {
      const response = JSON.parse(data.response);
      
      // Verificar se é sucesso ou erro
      if (data.responseCode === '0' && response.status === 'ENTERED') {
        // Pagamento aprovado
        const payment = response.payments?.[0];
        return {
          success: true,
          transactionId: response.id,
          amount: response.paidAmount / 100, // Converter de centavos para reais
          extras: {
            provider: 'cielo',
            cieloCode: payment?.cieloCode,
            authCode: payment?.authCode,
            brand: payment?.brand,
            rawResponse: response
          }
        };
      } else {
        // Pagamento recusado ou erro
        return {
          success: false,
          error: response.reason || 'Pagamento recusado',
          extras: {
            provider: 'cielo',
            responseCode: data.responseCode,
            rawResponse: response
          }
        };
      }
    } catch (error) {
      console.error('CieloPaymentProvider: Erro ao parsear resposta', error);
      return {
        success: false,
        error: 'Erro ao processar resposta da Cielo',
        extras: {
          provider: 'cielo',
          parseError: error,
          rawData: data
        }
      };
    }
  }
}
