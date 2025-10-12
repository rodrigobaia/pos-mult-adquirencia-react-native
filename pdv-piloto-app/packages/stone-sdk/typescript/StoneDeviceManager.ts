import { NativeModules } from 'react-native';

const { StoneBridge } = NativeModules;

/**
 * Enum para fabricantes de dispositivos Stone
 */
export enum StoneManufacturer {
  GERTEC = 'gertec',
  INGENICO = 'ingenico',
  POSITIVO = 'positivo',
  SUNMI = 'sunmi',
  TECTOY = 'tectoy',
}

/**
 * Interface para informações do dispositivo
 */
export interface StoneDeviceInfo {
  manufacturer: StoneManufacturer;
  model: string;
  serialNumber: string;
  androidVersion: string;
  stoneSdkVersion: string;
  isSupported: boolean;
}

/**
 * Gerenciador de dispositivos Stone
 * 
 * Esta classe detecta e gerencia diferentes fabricantes de dispositivos POS Stone,
 * aplicando configurações específicas para cada fabricante.
 */
export class StoneDeviceManager {
  private static instance: StoneDeviceManager;
  private currentDevice: StoneDeviceInfo | null = null;

  private constructor() {
    console.log('[StoneDeviceManager] Inicializado');
  }

  /**
   * Singleton instance
   */
  public static getInstance(): StoneDeviceManager {
    if (!StoneDeviceManager.instance) {
      StoneDeviceManager.instance = new StoneDeviceManager();
    }
    return StoneDeviceManager.instance;
  }

  /**
   * Detecta o fabricante do dispositivo atual
   */
  public async detectManufacturer(): Promise<StoneManufacturer> {
    try {
      // Tentar detectar via Build.MANUFACTURER
      const manufacturer = await this.detectFromBuildProperties();
      
      if (manufacturer) {
        console.log(`[StoneDeviceManager] Fabricante detectado via Build: ${manufacturer}`);
        return manufacturer;
      }

      // Fallback: detectar via características do dispositivo
      const fallbackManufacturer = await this.detectFromDeviceCharacteristics();
      console.log(`[StoneDeviceManager] Fabricante detectado via características: ${fallbackManufacturer}`);
      
      return fallbackManufacturer;
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro ao detectar fabricante, usando padrão:', error);
      return StoneManufacturer.POSITIVO; // Fallback padrão
    }
  }

  /**
   * Detecta fabricante via propriedades do Build
   */
  private async detectFromBuildProperties(): Promise<StoneManufacturer | null> {
    try {
      if (!StoneBridge || !StoneBridge.getDeviceInfo) {
        return null;
      }

      const deviceInfo = await StoneBridge.getDeviceInfo();
      const manufacturer = deviceInfo.manufacturer?.toLowerCase();

      switch (manufacturer) {
        case 'gertec':
        case 'gertec brasil':
          return StoneManufacturer.GERTEC;
        
        case 'ingenico':
        case 'ingenico group':
          return StoneManufacturer.INGENICO;
        
        case 'positivo':
        case 'positivo informática':
          return StoneManufacturer.POSITIVO;
        
        case 'sunmi':
          return StoneManufacturer.SUNMI;
        
        case 'tectoy':
          return StoneManufacturer.TECTOY;
        
        default:
          return null;
      }
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro ao obter info do dispositivo:', error);
      return null;
    }
  }

  /**
   * Detecta fabricante via características do dispositivo
   */
  private async detectFromDeviceCharacteristics(): Promise<StoneManufacturer> {
    try {
      // Lista de características conhecidas por fabricante
      const deviceCharacteristics = {
        [StoneManufacturer.GERTEC]: ['gpos', 'gertec'],
        [StoneManufacturer.INGENICO]: ['move', 'desk', 'ingenico'],
        [StoneManufacturer.POSITIVO]: ['l400', 'l500', 'smart pos', 'positivo'],
        [StoneManufacturer.SUNMI]: ['p2', 'v2', 'l2', 'sunmi'],
        [StoneManufacturer.TECTOY]: ['tectoy'],
      };

      // Obter informações do dispositivo
      const deviceModel = await this.getDeviceModel();
      const deviceBrand = await this.getDeviceBrand();

      const searchText = `${deviceModel} ${deviceBrand}`.toLowerCase();

      // Buscar correspondência
      for (const [manufacturer, characteristics] of Object.entries(deviceCharacteristics)) {
        for (const characteristic of characteristics) {
          if (searchText.includes(characteristic)) {
            return manufacturer as StoneManufacturer;
          }
        }
      }

      // Fallback para Positivo se não encontrado
      return StoneManufacturer.POSITIVO;
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro na detecção por características:', error);
      return StoneManufacturer.POSITIVO;
    }
  }

  /**
   * Obtém o modelo do dispositivo
   */
  private async getDeviceModel(): Promise<string> {
    try {
      if (StoneBridge && StoneBridge.getDeviceModel) {
        return await StoneBridge.getDeviceModel();
      }
      return 'unknown';
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro ao obter modelo:', error);
      return 'unknown';
    }
  }

  /**
   * Obtém a marca do dispositivo
   */
  private async getDeviceBrand(): Promise<string> {
    try {
      if (StoneBridge && StoneBridge.getDeviceBrand) {
        return await StoneBridge.getDeviceBrand();
      }
      return 'unknown';
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro ao obter marca:', error);
      return 'unknown';
    }
  }

  /**
   * Obtém informações completas do dispositivo
   */
  public async getDeviceInfo(): Promise<StoneDeviceInfo> {
    if (this.currentDevice) {
      return this.currentDevice;
    }

    const manufacturer = await this.detectManufacturer();
    
    this.currentDevice = {
      manufacturer,
      model: await this.getDeviceModel(),
      serialNumber: await this.getSerialNumber(),
      androidVersion: await this.getAndroidVersion(),
      stoneSdkVersion: await this.getStoneSdkVersion(),
      isSupported: this.isManufacturerSupported(manufacturer),
    };

    console.log('[StoneDeviceManager] Informações do dispositivo:', this.currentDevice);
    return this.currentDevice;
  }

  /**
   * Obtém o número de série do dispositivo
   */
  private async getSerialNumber(): Promise<string> {
    try {
      if (StoneBridge && StoneBridge.getSerialNumber) {
        return await StoneBridge.getSerialNumber();
      }
      return 'unknown';
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro ao obter serial:', error);
      return 'unknown';
    }
  }

  /**
   * Obtém a versão do Android
   */
  private async getAndroidVersion(): Promise<string> {
    try {
      if (StoneBridge && StoneBridge.getAndroidVersion) {
        return await StoneBridge.getAndroidVersion();
      }
      return 'unknown';
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro ao obter versão Android:', error);
      return 'unknown';
    }
  }

  /**
   * Obtém a versão do Stone SDK
   */
  private async getStoneSdkVersion(): Promise<string> {
    try {
      if (StoneBridge && StoneBridge.getStoneSdkVersion) {
        return await StoneBridge.getStoneSdkVersion();
      }
      return 'unknown';
    } catch (error) {
      console.warn('[StoneDeviceManager] Erro ao obter versão Stone SDK:', error);
      return 'unknown';
    }
  }

  /**
   * Verifica se o fabricante é suportado
   */
  private isManufacturerSupported(manufacturer: StoneManufacturer): boolean {
    const supportedManufacturers = Object.values(StoneManufacturer);
    return supportedManufacturers.includes(manufacturer);
  }

  /**
   * Aplica configurações específicas do fabricante
   */
  public async applyManufacturerConfig(): Promise<void> {
    const deviceInfo = await this.getDeviceInfo();
    
    console.log(`[StoneDeviceManager] Aplicando configurações para ${deviceInfo.manufacturer}`);

    switch (deviceInfo.manufacturer) {
      case StoneManufacturer.GERTEC:
        await this.applyGertecConfig();
        break;
      
      case StoneManufacturer.INGENICO:
        await this.applyIngenicoConfig();
        break;
      
      case StoneManufacturer.POSITIVO:
        await this.applyPositivoConfig();
        break;
      
      case StoneManufacturer.SUNMI:
        await this.applySunmiConfig();
        break;
      
      case StoneManufacturer.TECTOY:
        await this.applyTectoyConfig();
        break;
      
      default:
        console.warn(`[StoneDeviceManager] Configuração não encontrada para ${deviceInfo.manufacturer}`);
    }
  }

  /**
   * Configurações específicas para Gertec
   */
  private async applyGertecConfig(): Promise<void> {
    console.log('[StoneDeviceManager] Aplicando configurações Gertec...');
    // TODO: Implementar configurações específicas Gertec
  }

  /**
   * Configurações específicas para Ingenico
   */
  private async applyIngenicoConfig(): Promise<void> {
    console.log('[StoneDeviceManager] Aplicando configurações Ingenico...');
    // TODO: Implementar configurações específicas Ingenico
  }

  /**
   * Configurações específicas para Positivo
   */
  private async applyPositivoConfig(): Promise<void> {
    console.log('[StoneDeviceManager] Aplicando configurações Positivo...');
    // TODO: Implementar configurações específicas Positivo
  }

  /**
   * Configurações específicas para Sunmi
   */
  private async applySunmiConfig(): Promise<void> {
    console.log('[StoneDeviceManager] Aplicando configurações Sunmi...');
    // TODO: Implementar configurações específicas Sunmi
  }

  /**
   * Configurações específicas para Tectoy
   */
  private async applyTectoyConfig(): Promise<void> {
    console.log('[StoneDeviceManager] Aplicando configurações Tectoy...');
    // TODO: Implementar configurações específicas Tectoy
  }

  /**
   * Obtém o fabricante atual
   */
  public getCurrentManufacturer(): StoneManufacturer | null {
    return this.currentDevice?.manufacturer || null;
  }

  /**
   * Verifica se o dispositivo atual é suportado
   */
  public isCurrentDeviceSupported(): boolean {
    return this.currentDevice?.isSupported || false;
  }
}
