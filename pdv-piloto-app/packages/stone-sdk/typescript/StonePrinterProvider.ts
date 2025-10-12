import { NativeModules, DeviceEventEmitter, AppState } from 'react-native';
import type {
  IPrinterProvider,
  Receipt,
  PrinterStatus,
  PrinterInfo,
} from '../../payment-core/src';

const { StonePrinterBridge } = NativeModules;

/**
 * Provider de impressão Stone via Deep Link
 */
export class StonePrinterProvider implements IPrinterProvider {
  
  private printResultCallback?: (result: string) => void;
  private printTimeout?: NodeJS.Timeout;
  private appStateSubscription?: any;
  
  async printReceipt(receipt: Receipt): Promise<void> {
    try {
      const receiptData = {
        header: receipt.header,
        items: receipt.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: receipt.subtotal,
        discount: receipt.discount || 0,
        deliveryFee: receipt.deliveryFee || 0,
        total: receipt.total,
        paymentMethod: receipt.paymentMethod,
        transactionId: receipt.transactionId,
        customerName: receipt.customerName,
        customerPhone: receipt.customerPhone,
        address: receipt.address,
        footer: receipt.footer || [],
      };
      
      // Configurar callback para capturar resultado da impressão
      this.setupPrintResultListener();
      
      await StonePrinterBridge.printReceipt(receiptData);
    } catch (error) {
      throw new Error(
        `Falha ao imprimir: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  async printText(lines: string[]): Promise<void> {
    try {
      // StonePrinterBridge espera uma string, não array
      const text = lines.join('\n');
      
      // Configurar callback para capturar resultado da impressão
      this.setupPrintResultListener();
      
      await StonePrinterBridge.printText(text);
    } catch (error) {
      throw new Error(
        `Falha ao imprimir texto: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  async testPrint(): Promise<boolean> {
    try {
      // Configurar callback para capturar resultado da impressão
      this.setupPrintResultListener();
      
      await StonePrinterBridge.testPrint();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async getPrinterStatus(): Promise<PrinterStatus> {
    try {
      const status = await StonePrinterBridge.getPrinterStatus();
      return {
        available: status.available === true,
        paperLow: status.paperLow === true,
        error: status.error,
      };
    } catch (error) {
      return {
        available: false,
        paperLow: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  getInfo(): PrinterInfo {
    return {
      id: 'stone-printer',
      name: 'Stone Printer',
      printerModel: 'Stone Thermal Printer',
      printWidth: 48,
    };
  }

  /**
   * Configura listener para capturar resultado da impressão
   */
  private setupPrintResultListener(): void {
    // Remover listener anterior se existir
    DeviceEventEmitter.removeAllListeners('printReceived');
    
    // Adicionar novo listener para Deep Link callback
    DeviceEventEmitter.addListener('printReceived', (uri: string) => {
      console.log('Print result received via Deep Link:', uri);
      this.handlePrintResult(uri);
    });

    // Configurar fallback para quando app volta do background
    this.setupAppStateListener();
  }

  /**
   * Configura listener para detectar quando app volta do background
   * Fallback para quando Stone não envia callback
   */
  private setupAppStateListener(): void {
    // Remover listener anterior
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    // Configurar timeout para fallback
    this.printTimeout = setTimeout(() => {
      console.log('Print timeout - assuming success');
      this.handlePrintResult('pdvpiloto_print_return://?result=SUCCESS');
    }, 10000); // 10 segundos timeout

    // Listener para mudança de estado do app
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('AppState changed to:', nextAppState);
      
      if (nextAppState === 'active') {
        // App voltou para foreground - pode ser retorno da impressão
        console.log('App returned to foreground - checking if print completed');
        
        // Aguardar 1 segundo para dar tempo do Deep Link chegar
        setTimeout(() => {
          if (this.printTimeout) {
            console.log('No Deep Link received after 1s, assuming print success');
            this.handlePrintResult('pdvpiloto_print_return://?result=SUCCESS');
          }
        }, 1000);
      }
    });
  }

  /**
   * Processa resultado da impressão
   */
  private handlePrintResult(uri: string): void {
    try {
      // Limpar timeout e listener
      if (this.printTimeout) {
        clearTimeout(this.printTimeout);
        this.printTimeout = undefined;
      }
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = undefined;
      }

      const url = new URL(uri);
      const result = url.searchParams.get('result') || 'UNKNOWN';
      
      console.log('Print result:', result);
      
      // Mapear resultados conforme documentação Stone
      switch (result) {
        case 'SUCCESS':
          console.log('Impressão realizada com sucesso');
          break;
        case 'PRINTER_OUT_OF_PAPER':
          console.error('Impressora sem papel ou tampa aberta');
          break;
        case 'PRINTER_INIT_ERROR':
          console.error('Erro ao inicializar impressora');
          break;
        case 'PRINTER_LOW_ENERGY':
          console.error('Máquina com baixa energia');
          break;
        case 'PRINTER_BUSY':
          console.error('Impressora ocupada');
          break;
        case 'PRINTER_UNSUPPORTED_FORMAT':
          console.error('Formato não suportado');
          break;
        case 'PRINTER_INVALID_DATA':
          console.error('Dados inválidos - buffer excedido');
          break;
        case 'PRINTER_OVERHEATING':
          console.error('Impressora superaquecida');
          break;
        case 'PRINTER_PAPER_JAM':
          console.error('Papel preso na impressora');
          break;
        case 'PRINTER_PRINT_ERROR':
          console.error('Erro genérico da impressora');
          break;
        default:
          console.warn('Resultado desconhecido:', result);
      }
      
      // Chamar callback se configurado
      if (this.printResultCallback) {
        this.printResultCallback(result);
      }
      
    } catch (error) {
      console.error('Erro ao processar resultado da impressão:', error);
    }
  }

  /**
   * Define callback para resultado da impressão
   */
  setPrintResultCallback(callback: (result: string) => void): void {
    this.printResultCallback = callback;
  }

  /**
   * Remove callback de resultado da impressão
   */
  removePrintResultCallback(): void {
    this.printResultCallback = undefined;
    DeviceEventEmitter.removeAllListeners('printReceived');
    
    // Limpar timeout e listener
    if (this.printTimeout) {
      clearTimeout(this.printTimeout);
      this.printTimeout = undefined;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = undefined;
    }
  }
}