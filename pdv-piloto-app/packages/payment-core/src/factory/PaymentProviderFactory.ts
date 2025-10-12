import { IPaymentProvider } from '../interfaces/IPaymentProvider';

/**
 * Tipos de adquirentes suportadas
 */
export enum AcquirerType {
  STONE = 'stone',
  CIELO = 'cielo',
  PAGSEGURO = 'pagseguro',
  GETNET = 'getnet',
  REDE = 'rede',
}

/**
 * Factory para criação de Payment Providers
 * 
 * Centraliza a criação de providers de pagamento por adquirente
 */
export class PaymentProviderFactory {
  private static activeAcquirer: AcquirerType = AcquirerType.STONE;
  private static providers: Map<AcquirerType, IPaymentProvider> = new Map();
  
  /**
   * Define qual adquirente está ativa
   */
  static setActive(acquirer: AcquirerType): void {
    this.activeAcquirer = acquirer;
  }
  
  /**
   * Retorna a adquirente ativa atual
   */
  static getActiveAcquirer(): AcquirerType {
    return this.activeAcquirer;
  }
  
  /**
   * Retorna o provider da adquirente ativa
   */
  static getActive(): IPaymentProvider {
    return this.getProvider(this.activeAcquirer);
  }
  
  /**
   * Retorna o provider de uma adquirente específica
   */
  static getProvider(acquirer: AcquirerType): IPaymentProvider {
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
   * Lista todas as adquirentes disponíveis no dispositivo
   */
  static async getAvailableAcquirers(): Promise<AcquirerType[]> {
    const available: AcquirerType[] = [];
    
    for (const acquirer of Object.values(AcquirerType)) {
      try {
        const provider = this.getProvider(acquirer as AcquirerType);
        const isAvailable = await provider.isAvailable();
        
        if (isAvailable) {
          available.push(acquirer as AcquirerType);
        }
      } catch (error) {
        console.log(`Acquirer ${acquirer} not available:`, error);
      }
    }
    
    return available;
  }
  
  /**
   * Limpa o cache de providers (útil para testes)
   */
  static clearCache(): void {
    this.providers.clear();
  }
  
  /**
   * Cria uma nova instância de provider
   */
  private static createProvider(acquirer: AcquirerType): IPaymentProvider {
    switch (acquirer) {
      case AcquirerType.STONE:
        // Lazy load do módulo Stone
        const { StonePaymentProvider } = require('../../../stone-sdk/typescript/StonePaymentProvider');
        return new StonePaymentProvider();
        
      case AcquirerType.CIELO:
        // TODO: Implementar quando Cielo estiver pronto
        throw new Error('Cielo provider not implemented yet');
        
      case AcquirerType.PAGSEGURO:
        // TODO: Implementar quando PagSeguro estiver pronto
        throw new Error('PagSeguro provider not implemented yet');
        
      case AcquirerType.GETNET:
        throw new Error('GetNet provider not implemented yet');
        
      case AcquirerType.REDE:
        throw new Error('Rede provider not implemented yet');
        
      default:
        throw new Error(`Unsupported acquirer: ${acquirer}`);
    }
  }
}

/**
 * Singleton para configuração da adquirente ativa
 */
export class AcquirerConfig {
  private static readonly STORAGE_KEY = '@pdvflow:acquirer';
  
  /**
   * Carrega a adquirente configurada (do AsyncStorage ou variável de ambiente)
   */
  static async load(): Promise<AcquirerType> {
    // TODO: Implementar leitura do AsyncStorage
    // Por enquanto, retorna Stone como padrão
    return AcquirerType.STONE;
  }
  
  /**
   * Salva a adquirente configurada
   */
  static async save(acquirer: AcquirerType): Promise<void> {
    // TODO: Implementar escrita no AsyncStorage
    PaymentProviderFactory.setActive(acquirer);
  }
}
