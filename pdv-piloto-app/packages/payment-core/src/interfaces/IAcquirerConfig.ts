import { AcquirerType, DeepLinkConfig } from '../models/AcquirerTypes';

/**
 * Interface de configuração de adquirente
 * 
 * Define como cada adquirente deve ser configurada
 */
export interface IAcquirerConfig {
  /**
   * Tipo da adquirente
   */
  type: AcquirerType;
  
  /**
   * Nome da adquirente
   */
  name: string;
  
  /**
   * Fabricante do dispositivo
   */
  manufacturer: string;
  
  /**
   * Configuração de Deep Link
   */
  deepLinkConfig: DeepLinkConfig;
  
  /**
   * Credenciais específicas da adquirente
   */
  credentials?: Record<string, any>;
  
  /**
   * Configurações específicas do SDK
   */
  sdkConfig?: Record<string, any>;
  
  /**
   * Versão do SDK
   */
  sdkVersion?: string;
  
  /**
   * Se a adquirente está habilitada
   */
  enabled: boolean;
}
