import { NativeModules, Linking } from 'react-native';
import { IPrinterProvider, PrintRequest, PrintResult, PrinterInfo } from '../../payment-core/src/interfaces/IPrinterProvider';
import { CieloPrintRequest } from './types/CieloTypes';
import { CieloDeepLinkRequest } from './types/DeepLinkTypes';

const { CieloPrinterBridge } = NativeModules;

/**
 * Provider de impressão para Cielo LIO
 * Implementa integração via Deep Link
 */
export class CieloPrinterProvider implements IPrinterProvider {
  private readonly deepLinkConfig = {
    scheme: 'cielolio',
    host: 'print',
    packageName: 'com.cielo.lio'
  };

  async printText(request: PrintRequest): Promise<PrintResult> {
    try {
      console.log('CieloPrinterProvider: Imprimindo texto', request);

      const cieloRequest: CieloPrintRequest = {
        operation: 'PRINT_TEXT',
        value: request.text,
        styles: {
          fontSize: request.fontSize || 12,
          alignment: request.alignment || 'LEFT',
          bold: request.bold || false
        }
      };

      const deepLinkRequest: CieloDeepLinkRequest = {
        action: 'PRINT',
        payload: this.encodePayload(cieloRequest)
      };

      const deepLinkUri = this.buildDeepLinkUri(deepLinkRequest);
      
      console.log('CieloPrinterProvider: Deep Link URI', deepLinkUri);

      const canOpen = await Linking.canOpenURL(deepLinkUri);
      if (!canOpen) {
        throw new Error('Cielo LIO não está instalado ou não pode ser aberto');
      }

      await Linking.openURL(deepLinkUri);

      // Simular impressão bem-sucedida
      return {
        success: true,
        extras: {
          provider: 'cielo',
          operation: 'print_text',
          rawRequest: cieloRequest
        }
      };

    } catch (error) {
      console.error('CieloPrinterProvider: Erro na impressão', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na impressão',
        extras: {
          provider: 'cielo',
          error: error
        }
      };
    }
  }

  async printImage(imagePath: string): Promise<PrintResult> {
    try {
      console.log('CieloPrinterProvider: Imprimindo imagem', imagePath);

      const cieloRequest: CieloPrintRequest = {
        operation: 'PRINT_IMAGE',
        value: imagePath
      };

      const deepLinkRequest: CieloDeepLinkRequest = {
        action: 'PRINT',
        payload: this.encodePayload(cieloRequest)
      };

      const deepLinkUri = this.buildDeepLinkUri(deepLinkRequest);
      await Linking.openURL(deepLinkUri);

      return {
        success: true,
        extras: {
          provider: 'cielo',
          operation: 'print_image',
          imagePath,
          rawRequest: cieloRequest
        }
      };

    } catch (error) {
      console.error('CieloPrinterProvider: Erro na impressão de imagem', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na impressão de imagem',
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

  getInfo(): PrinterInfo {
    return {
      name: 'Cielo LIO Printer',
      version: '1.0.0',
      acquirer: 'cielo',
      features: ['text', 'image'],
      supportedFormats: ['text/plain', 'image/png', 'image/jpeg']
    };
  }

  private encodePayload(payload: any): string {
    return btoa(JSON.stringify(payload));
  }

  private buildDeepLinkUri(request: CieloDeepLinkRequest): string {
    return `${this.deepLinkConfig.scheme}://${this.deepLinkConfig.host}?action=${request.action}&payload=${request.payload}`;
  }
}
