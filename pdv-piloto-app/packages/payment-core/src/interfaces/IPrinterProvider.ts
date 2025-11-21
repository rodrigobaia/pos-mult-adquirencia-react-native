import { Receipt, PrinterStatus, PrintItem, PrintFont, PrintAlignment } from '../models/PrintTypes';
import { AcquirerType } from '../models/AcquirerTypes';

/**
 * Interface principal para providers de impressão
 * TODOS os SDKs de adquirente devem implementar esta interface
 */
export interface IPrinterProvider {
  // === IDENTIFICAÇÃO ===
  /**
   * Retorna o tipo da adquirente
   */
  getAcquirerType(): AcquirerType;
  
  /**
   * Retorna o nome da adquirente
   */
  getAcquirerName(): string;
  
  /**
   * Retorna o fabricante do dispositivo
   */
  getManufacturer(): string;

  // === DISPONIBILIDADE ===
  /**
   * Verifica se a impressora está disponível
   * @returns Promise<boolean> - true se disponível
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Verifica status da impressora
   * @returns Promise<PrinterStatus> - Status atual
   */
  getPrinterStatus(): Promise<PrinterStatus>;

  // === IMPRESSÃO ===
  /**
   * Imprime um comprovante de pagamento
   * @param receipt - Dados do comprovante
   * @returns Promise<void> - Resolve quando impressão é iniciada
   */
  printReceipt(receipt: Receipt): Promise<void>;
  
  /**
   * Imprime texto customizado
   * @param lines - Array de linhas a imprimir
   * @returns Promise<void> - Resolve quando impressão é iniciada
   */
  printText(lines: string[]): Promise<void>;
  
  /**
   * Imprime itens de um pedido
   * @param items - Array de itens
   * @returns Promise<void> - Resolve quando impressão é iniciada
   */
  printItems(items: PrintItem[]): Promise<void>;
  
  /**
   * Imprime cabeçalho personalizado
   * @param header - Linhas do cabeçalho
   * @returns Promise<void> - Resolve quando impressão é iniciada
   */
  printHeader(header: string[]): Promise<void>;
  
  /**
   * Imprime rodapé personalizado
   * @param footer - Linhas do rodapé
   * @returns Promise<void> - Resolve quando impressão é iniciada
   */
  printFooter(footer: string[]): Promise<void>;

  // === TESTE E MANUTENÇÃO ===
  /**
   * Teste de impressora
   * @returns Promise<boolean> - true se teste passou
   */
  testPrint(): Promise<boolean>;
  
  /**
   * Corta o papel (se suportado)
   * @returns Promise<void>
   */
  cutPaper(): Promise<void>;
  
  /**
   * Abre a gaveta (se suportado)
   * @returns Promise<void>
   */
  openDrawer(): Promise<void>;

  // === CONFIGURAÇÃO ===
  /**
   * Configura largura de impressão
   * @param width - Largura em caracteres
   */
  setPrintWidth(width: number): void;
  
  /**
   * Configura fonte
   * @param font - Tipo de fonte
   */
  setFont(font: PrintFont): void;
  
  /**
   * Configura alinhamento
   * @param alignment - Alinhamento do texto
   */
  setAlignment(alignment: PrintAlignment): void;

  // === EVENTOS ===
  /**
   * Registra callback para status de impressão
   * @param callback - Função chamada quando status muda
   */
  onStatusChange(callback: (status: PrinterStatus) => void): void;
  
  /**
   * Registra callback para erro de impressão
   * @param callback - Função chamada quando ocorre erro
   */
  onPrintError(callback: (error: string) => void): void;
  
  /**
   * Remove todos os callbacks registrados
   */
  removeAllCallbacks(): void;

  // === COMPATIBILIDADE (MÉTODOS LEGADOS) ===
  /**
   * @deprecated Use getAcquirerName() em vez disso
   */
  getInfo(): PrinterInfo;
}

/**
 * Informações do printer provider
 */
export interface PrinterInfo {
  /** ID único do provider */
  id: string;
  
  /** Nome do provider */
  name: string;
  
  /** Modelo da impressora */
  printerModel?: string;
  
  /** Largura de impressão (caracteres) */
  printWidth: number;
}
