import { Receipt, PrinterStatus } from '../models/PrintTypes';

/**
 * Interface de Printer Provider
 * 
 * Todas as adquirentes devem implementar esta interface para impressão
 */
export interface IPrinterProvider {
  /**
   * Imprime um comprovante
   * 
   * @param receipt - Dados do comprovante
   * @returns Promise que resolve quando a impressão for concluída
   */
  printReceipt(receipt: Receipt): Promise<void>;
  
  /**
   * Imprime texto customizado
   * 
   * @param lines - Array de linhas a imprimir
   * @returns Promise que resolve quando a impressão for concluída
   */
  printText(lines: string[]): Promise<void>;
  
  /**
   * Teste de impressora
   * 
   * @returns Promise<boolean> - true se impressora está OK
   */
  testPrint(): Promise<boolean>;
  
  /**
   * Verifica status da impressora
   * 
   * @returns Promise<PrinterStatus> - Status atual da impressora
   */
  getPrinterStatus(): Promise<PrinterStatus>;
  
  /**
   * Retorna informações sobre o provider
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
