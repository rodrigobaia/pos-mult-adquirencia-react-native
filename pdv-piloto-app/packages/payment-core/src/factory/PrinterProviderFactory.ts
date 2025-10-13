import { IPrinterProvider } from '../interfaces/IPrinterProvider';
import { AcquirerType } from './PaymentProviderFactory';

/**
 * Factory para criação de Printer Providers
 * 
 * Centraliza a criação de providers de impressão por adquirente
 */
export class PrinterProviderFactory {
  private static providers: Map<AcquirerType, IPrinterProvider> = new Map();
  
  /**
   * Retorna o printer provider da adquirente ativa
   */
  static getActive(): IPrinterProvider {
    // Usa a mesma adquirente ativa do PaymentProviderFactory
    const { PaymentProviderFactory } = require('./PaymentProviderFactory');
    const activeAcquirer = PaymentProviderFactory.getActiveAcquirer();
    return this.getProvider(activeAcquirer);
  }
  
  /**
   * Retorna o printer provider de uma adquirente específica
   */
  static getProvider(acquirer: AcquirerType): IPrinterProvider {
    // Verificar cache
    if (this.providers.has(acquirer)) {
      return this.providers.get(acquirer)!;
    }
    
    // Criar novo provider
    const provider = this.createProvider(acquirer);
    
    // Armazenar em cache
    this.providers.set(acquirer, provider);
    
    return provider;
  }
  
  /**
   * Limpa o cache de providers
   */
  static clearCache(): void {
    this.providers.clear();
  }
  
  /**
   * Cria uma nova instância de printer provider
   */
  private static createProvider(acquirer: AcquirerType): IPrinterProvider {
    switch (acquirer) {
      case AcquirerType.STONE:
        const { StonePrinterProvider } = require('../../../stone-sdk/typescript/StonePrinterProvider');
        return new StonePrinterProvider();
        
      case AcquirerType.CIELO:
        const { CieloPrinterProvider } = require('../../../cielo-sdk/typescript/CieloPrinterProvider');
        return new CieloPrinterProvider();
        
      case AcquirerType.PAGSEGURO:
        throw new Error('PagSeguro printer provider not implemented yet');
        
      case AcquirerType.GETNET:
        throw new Error('GetNet printer provider not implemented yet');
        
      case AcquirerType.REDE:
        throw new Error('Rede printer provider not implemented yet');
        
      default:
        throw new Error(`Unsupported acquirer: ${acquirer}`);
    }
  }
}
