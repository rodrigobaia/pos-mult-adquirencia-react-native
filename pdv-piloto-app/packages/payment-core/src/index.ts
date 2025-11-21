/**
 * Payment Core - Interfaces e Modelos Compartilhados
 * 
 * Este package contém as abstrações que todas as adquirentes devem seguir
 * 
 * Estrutura seguindo o plano de reestruturação:
 * - interfaces/     # Contratos que TODOS devem implementar
 * - models/         # Tipos e estruturas comuns
 * - factory/        # Factory pattern
 * - utils/          # Utilitários comuns
 */

// === INTERFACES ===
export * from './interfaces/IPaymentProvider';
export * from './interfaces/IPrinterProvider';
export * from './interfaces/IAcquirerConfig';

// === MODELS ===
export * from './models/PaymentTypes';
export * from './models/PaymentResult';
export * from './models/AcquirerTypes';
export * from './models/DeepLinkTypes';
export * from './models/PrintTypes';

// === FACTORY ===
export * from './factory/PaymentProviderFactory';
export * from './factory/PrinterProviderFactory';

// === UTILS ===
export * from './utils/DeepLinkUtils';
export * from './utils/ValidationUtils';

// === TIPOS CENTRALIZADOS (LEGADO - MANTIDO PARA COMPATIBILIDADE) ===
export * from './types';
