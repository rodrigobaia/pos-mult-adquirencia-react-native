import { NativeModules } from 'react-native';
import { CieloDeviceInfo, CieloCredentials } from './types/CieloTypes';

const { CieloBridge } = NativeModules;

/**
 * Gerenciador de dispositivo Cielo LIO
 * Fornece informações sobre o dispositivo e funcionalidades
 */
export class CieloDeviceManager {
  private readonly credentials: CieloCredentials;

  constructor(credentials?: CieloCredentials) {
    this.credentials = credentials || {
      clientID: 'hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN',
      accessToken: '3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4'
    };
  }

  /**
   * Verifica se o dispositivo é compatível com Cielo LIO
   */
  async isCompatible(): Promise<boolean> {
    try {
      // Verificar se o app Cielo LIO está instalado
      const { Linking } = require('react-native');
      const testUri = 'cielolio://payment';
      return await Linking.canOpenURL(testUri);
    } catch {
      return false;
    }
  }

  /**
   * Obtém informações do dispositivo
   */
  async getDeviceInfo(): Promise<CieloDeviceInfo | null> {
    try {
      // Simular informações do dispositivo
      // Em implementação real, isso viria do SDK da Cielo
      return {
        model: 'Cielo LIO V3',
        serialNumber: 'CIELO_LIO_001',
        batteryLevel: 85,
        merchantCode: '123456789',
        enabledProducts: ['CREDIT', 'DEBIT', 'PIX']
      };
    } catch (error) {
      console.error('CieloDeviceManager: Erro ao obter informações do dispositivo', error);
      return null;
    }
  }

  /**
   * Obtém produtos habilitados para pagamento
   */
  async getEnabledProducts(): Promise<string[]> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      return deviceInfo?.enabledProducts || [];
    } catch (error) {
      console.error('CieloDeviceManager: Erro ao obter produtos habilitados', error);
      return [];
    }
  }

  /**
   * Verifica se um tipo de pagamento está habilitado
   */
  async isPaymentTypeEnabled(paymentType: string): Promise<boolean> {
    try {
      const enabledProducts = await this.getEnabledProducts();
      return enabledProducts.includes(paymentType.toUpperCase());
    } catch (error) {
      console.error('CieloDeviceManager: Erro ao verificar tipo de pagamento', error);
      return false;
    }
  }

  /**
   * Obtém nível de bateria do dispositivo
   */
  async getBatteryLevel(): Promise<number> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      return deviceInfo?.batteryLevel || 0;
    } catch (error) {
      console.error('CieloDeviceManager: Erro ao obter nível de bateria', error);
      return 0;
    }
  }

  /**
   * Obtém código do merchant
   */
  async getMerchantCode(): Promise<string | null> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      return deviceInfo?.merchantCode || null;
    } catch (error) {
      console.error('CieloDeviceManager: Erro ao obter código do merchant', error);
      return null;
    }
  }
}
