# 🔌 Como Adicionar Nova Adquirente

**[← Voltar ao README Principal](../README.md)** | **[📚 Visão Geral do Projeto](./visao-geral-projeto.md)** | **[🟢 Integração Stone](./integracao-stone.md)**

> Guia passo a passo para integrar Cielo, PagSeguro, GetNet, Rede ou qualquer outra adquirente

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura Obrigatória](#estrutura-obrigatória)
3. [Passo 1: Criar Package SDK](#passo-1-criar-package-sdk)
4. [Passo 2: Implementar Interfaces](#passo-2-implementar-interfaces)
5. [Passo 3: Criar Bridges Nativos](#passo-3-criar-bridges-nativos)
6. [Passo 4: Configurar Android](#passo-4-configurar-android)
7. [Passo 5: Registrar no Factory](#passo-5-registrar-no-factory)
8. [Passo 6: Testes](#passo-6-testes)
9. [Exemplo Completo: Cielo](#exemplo-completo-cielo)
10. [Checklist Final](#checklist-final)

---

## 🎯 Visão Geral

### O que você vai criar

Para adicionar uma nova adquirente (ex: Cielo), você precisa:

```
1. Criar package SDK       → packages/cielo-sdk/
2. Implementar interfaces  → CieloPaymentProvider.ts
3. Criar bridges Kotlin    → CieloBridge.kt
4. Configurar Android      → build.gradle, AndroidManifest
5. Registrar no Factory    → PaymentProviderFactory.ts
6. Testar integração       → Testes e2e
```

### Tempo Estimado

| Tarefa | Tempo | Complexidade |
|--------|-------|--------------|
| Criar estrutura | 1h | Baixa |
| Implementar TypeScript | 4-6h | Média |
| Implementar Kotlin | 4-8h | Alta |
| Configurar Android | 2h | Média |
| Testes | 4h | Média |
| **TOTAL** | **2-3 dias** | - |

---

## 📦 Estrutura Obrigatória

### Template Completo

```
packages/
└── [nome-adquirente]-sdk/           ← Ex: cielo-sdk, pagseguro-sdk
    ├── README.md                     ← Documentação específica
    ├── package.json                  ← Metadados do package
    │
    ├── typescript/                   ← Camada JavaScript
    │   ├── index.ts                  ← Exports públicos
    │   ├── [Nome]PaymentProvider.ts  ← Implementa IPaymentProvider
    │   ├── [Nome]PrinterProvider.ts  ← Implementa IPrinterProvider (opcional)
    │   └── [Nome]DeviceManager.ts    ← Gerenciamento de devices (opcional)
    │
    └── android/                      ← Camada Nativa
        ├── payment/
        │   ├── [Nome]Bridge.kt       ← React Native Bridge
        │   └── [Nome]Package.kt      ← React Native Package
        │
        └── printer/                  ← Opcional
            ├── [Nome]PrinterBridge.kt
            └── [Nome]PrinterPackage.kt
```

### Exemplo: Cielo

```
packages/
└── cielo-sdk/
    ├── README.md
    ├── package.json
    │
    ├── typescript/
    │   ├── index.ts
    │   ├── CieloPaymentProvider.ts
    │   ├── CieloPrinterProvider.ts
    │   └── CieloDeviceManager.ts
    │
    └── android/
        ├── payment/
        │   ├── CieloBridge.kt
        │   └── CieloPackage.kt
        └── printer/
            ├── CieloPrinterBridge.kt
            └── CieloPrinterPackage.kt
```

---

## 🚀 Passo 1: Criar Package SDK

### 1.1 Criar Estrutura de Diretórios

```bash
cd pdv-piloto-app/packages

# Criar estrutura
mkdir -p cielo-sdk/typescript
mkdir -p cielo-sdk/android/payment
mkdir -p cielo-sdk/android/printer
```

### 1.2 Criar package.json

**Arquivo:** `packages/cielo-sdk/package.json`

```json
{
  "name": "cielo-sdk",
  "version": "1.0.0",
  "description": "Cielo Payment SDK para PDV Piloto",
  "main": "typescript/index.ts",
  "private": true,
  "scripts": {
    "lint": "eslint typescript/**/*.ts",
    "test": "jest"
  },
  "dependencies": {
    "payment-core": "*"
  },
  "peerDependencies": {
    "react": ">=19.0.0",
    "react-native": ">=0.81.0"
  }
}
```

### 1.3 Criar README.md

**Arquivo:** `packages/cielo-sdk/README.md`

```markdown
# Cielo SDK

Integração Cielo para PDV Piloto.

## Instalação

Já incluído no MonoRepo. Sem instalação necessária.

## Uso

\`\`\`typescript
import { PaymentProviderFactory, AcquirerType } from 'payment-core';

// Definir Cielo como adquirente ativa
PaymentProviderFactory.setActive(AcquirerType.CIELO);

// Obter provider
const provider = PaymentProviderFactory.getActive();

// Realizar pagamento
await provider.requestPayment({
  amount: 100.00,
  type: PaymentType.CREDIT,
  installments: 1
});
\`\`\`

## Documentação

Ver [docs/adquirentes/cielo.md](../../docs/adquirentes/cielo.md)
```

---

## 💻 Passo 2: Implementar Interfaces

### 2.1 Provider de Pagamento

**Arquivo:** `packages/cielo-sdk/typescript/CieloPaymentProvider.ts`

```typescript
import { NativeModules, DeviceEventEmitter } from 'react-native';
import type {
  IPaymentProvider,
  ProviderInfo,
  PaymentRequest,
  PaymentResponse,
  PaymentResult,
} from '../../payment-core/src';

const { CieloBridge } = NativeModules;

/**
 * Provider de pagamento Cielo
 * 
 * Implementa IPaymentProvider para integração com Cielo LIO
 */
export class CieloPaymentProvider implements IPaymentProvider {
  
  /**
   * Solicita pagamento via Cielo
   */
  async requestPayment(request: PaymentRequest): Promise<void> {
    try {
      // Validar dados
      if (request.amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      
      // Chamar bridge nativo
      await CieloBridge.requestPayment(
        request.amount,
        request.type,
        request.installments || 1
      );
      
    } catch (error) {
      throw new Error(
        `Cielo payment error: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }
  
  /**
   * Cancela transação Cielo
   */
  async cancelTransaction(transactionId: string): Promise<PaymentResponse> {
    try {
      const result = await CieloBridge.cancelTransaction(transactionId);
      
      return {
        success: result.success,
        message: result.message,
        transactionId,
      };
      
    } catch (error) {
      throw new Error(`Cancel error: ${error.message}`);
    }
  }
  
  /**
   * Verifica se Cielo LIO está disponível
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await CieloBridge.isCieloAppInstalled();
    } catch {
      return false;
    }
  }
  
  /**
   * Registra callback para resultado de pagamento
   */
  onPaymentReceived(
    callback: (result: PaymentResult) => void
  ): () => void {
    
    const subscription = DeviceEventEmitter.addListener(
      'cieloPaymentReceived',
      (uriString: string) => {
        const result = this.parsePaymentResult(uriString);
        callback(result);
      }
    );
    
    return () => subscription.remove();
  }
  
  /**
   * Parse resultado do Deep Link Cielo
   */
  private parsePaymentResult(uriString: string): PaymentResult {
    try {
      const url = new URL(uriString);
      const params = url.searchParams;
      
      // Adaptar parâmetros Cielo para formato padrão
      const success = params.get('status') === 'APPROVED';
      const transactionId = params.get('paymentId') || '';
      const amount = parseInt(params.get('value') || '0') / 100;
      
      return {
        success,
        transactionId,
        amount,
        timestamp: new Date(),
        extras: {
          cardBrand: params.get('brand'),
          authorizationCode: params.get('authCode'),
          paymentType: params.get('productName'),
        },
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        amount: 0,
        timestamp: new Date(),
        extras: {
          error: 'Failed to parse Cielo result',
        },
      };
    }
  }
  
  /**
   * Informações do provider
   */
  getInfo(): ProviderInfo {
    return {
      id: 'cielo',
      name: 'Cielo',
      version: '1.0.0',
      supportedPaymentTypes: ['CREDIT', 'DEBIT'],
      supportsInstallments: true,
      maxInstallments: 12,
    };
  }
}
```

### 2.2 Provider de Impressão (Opcional)

**Arquivo:** `packages/cielo-sdk/typescript/CieloPrinterProvider.ts`

```typescript
import { NativeModules } from 'react-native';
import type {
  IPrinterProvider,
  PrinterInfo,
  Receipt,
  PrinterStatus,
} from '../../payment-core/src';

const { CieloPrinterBridge } = NativeModules;

/**
 * Provider de impressão Cielo
 */
export class CieloPrinterProvider implements IPrinterProvider {
  
  async printReceipt(receipt: Receipt): Promise<void> {
    try {
      await CieloPrinterBridge.printReceipt({
        header: receipt.header,
        items: receipt.items,
        total: receipt.total,
        paymentMethod: receipt.paymentMethod,
        footer: receipt.footer || [],
      });
    } catch (error) {
      throw new Error(`Print error: ${error.message}`);
    }
  }
  
  async printText(lines: string[]): Promise<void> {
    await CieloPrinterBridge.printText(lines);
  }
  
  async testPrint(): Promise<boolean> {
    try {
      await CieloPrinterBridge.testPrint();
      return true;
    } catch {
      return false;
    }
  }
  
  async getPrinterStatus(): Promise<PrinterStatus> {
    const status = await CieloPrinterBridge.getPrinterStatus();
    return {
      available: status.available,
      paperLow: status.paperLow,
      error: status.error,
    };
  }
  
  getInfo(): PrinterInfo {
    return {
      id: 'cielo-printer',
      name: 'Cielo Printer',
      printerModel: 'Cielo LIO Printer',
      printWidth: 48,
    };
  }
}
```

### 2.3 Index (Exports)

**Arquivo:** `packages/cielo-sdk/typescript/index.ts`

```typescript
export { CieloPaymentProvider } from './CieloPaymentProvider';
export { CieloPrinterProvider } from './CieloPrinterProvider';
```

---

## 🔧 Passo 3: Criar Bridges Nativos

### 3.1 Bridge de Pagamento

**Arquivo:** `packages/cielo-sdk/android/payment/CieloBridge.kt`

```kotlin
package br.com.pdvflow.cielo

import android.content.Intent
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import java.util.*

/**
 * Bridge para comunicação com Cielo LIO
 * 
 * Utiliza Intent/Deep Link para integração
 */
class CieloBridge(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val MODULE_NAME = "CieloBridge"
        private const val TAG = "CieloBridge"
        
        // Package do app Cielo LIO
        private const val CIELO_PACKAGE = "br.com.cielo.lio"
        
        // Deep Link scheme de retorno
        private const val RETURN_SCHEME = "pdvpiloto_cielo_return"
    }
    
    override fun getName(): String = MODULE_NAME
    
    /**
     * Inicia pagamento via Cielo LIO
     */
    @ReactMethod
    fun requestPayment(
        amount: Double,
        type: String,
        installments: Int,
        promise: Promise
    ) {
        try {
            val currentActivity = reactApplicationContext.currentActivity
            if (currentActivity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null")
                return
            }
            
            // Converter para centavos
            val amountInCents = (amount * 100).toLong()
            
            // Criar Intent para Cielo LIO
            val intent = Intent().apply {
                setPackage(CIELO_PACKAGE)
                action = "br.com.cielo.lio.PAYMENT"
                
                // Parâmetros Cielo
                putExtra("amount", amountInCents)
                putExtra("paymentType", mapPaymentType(type))
                putExtra("installments", installments)
                putExtra("returnScheme", RETURN_SCHEME)
                
                // Transaction ID único
                putExtra("transactionId", UUID.randomUUID().toString())
                
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            
            // Verificar se Cielo está instalado
            val packageManager = currentActivity.packageManager
            if (intent.resolveActivity(packageManager) != null) {
                currentActivity.startActivity(intent)
                promise.resolve("Payment request sent to Cielo")
            } else {
                promise.reject("CIELO_NOT_INSTALLED", "Cielo LIO app not found")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting payment", e)
            promise.reject("PAYMENT_ERROR", e.message, e)
        }
    }
    
    /**
     * Cancela transação
     */
    @ReactMethod
    fun cancelTransaction(transactionId: String, promise: Promise) {
        try {
            val currentActivity = reactApplicationContext.currentActivity
            if (currentActivity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null")
                return
            }
            
            val intent = Intent().apply {
                setPackage(CIELO_PACKAGE)
                action = "br.com.cielo.lio.CANCEL"
                putExtra("transactionId", transactionId)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            
            currentActivity.startActivity(intent)
            
            val result = Arguments.createMap().apply {
                putBoolean("success", true)
                putString("message", "Cancel request sent")
            }
            
            promise.resolve(result)
            
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message, e)
        }
    }
    
    /**
     * Verifica se Cielo LIO está instalado
     */
    @ReactMethod
    fun isCieloAppInstalled(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val intent = Intent().apply {
                setPackage(CIELO_PACKAGE)
            }
            
            val activities = packageManager.queryIntentActivities(intent, 0)
            val isInstalled = activities.isNotEmpty()
            
            promise.resolve(isInstalled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
    
    /**
     * Mapeia tipo de pagamento para formato Cielo
     */
    private fun mapPaymentType(type: String): String {
        return when (type.uppercase()) {
            "CREDIT" -> "CREDITO"
            "DEBIT" -> "DEBITO"
            else -> "CREDITO"
        }
    }
}
```

### 3.2 Package React Native

**Arquivo:** `packages/cielo-sdk/android/payment/CieloPackage.kt`

```kotlin
package br.com.pdvflow.cielo

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * React Native Package para Cielo SDK
 */
class CieloPackage : ReactPackage {
    
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(
            CieloBridge(reactContext),
            // CieloPrinterBridge(reactContext) // Se tiver impressão
        )
    }
    
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

---

## ⚙️ Passo 4: Configurar Android

### 4.1 Registrar Package no MainApplication

**Arquivo:** `android/app/src/main/java/.../MainApplication.kt`

```kotlin
import br.com.pdvflow.cielo.CieloPackage  // ← Adicionar import

class MainApplication : Application(), ReactApplication {
    
    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(StonePackage())
                    add(CieloPackage())  // ← Adicionar aqui
                }
            // ...
        }
}
```

### 4.2 Adicionar Deep Link no AndroidManifest

**Arquivo:** `android/app/src/main/AndroidManifest.xml`

```xml
<activity android:name=".MainActivity">
    <!-- ... intent-filters existentes ... -->
    
    <!-- Deep Link para retorno Cielo -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="pdvpiloto_cielo_return" />
    </intent-filter>
</activity>
```

### 4.3 Handler no MainActivity

**Arquivo:** `android/app/src/main/java/.../MainActivity.kt`

```kotlin
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)

    try {
        val uri = intent.data
        
        if (uri != null) {
            val scheme = uri.scheme
            
            when (scheme) {
                "stone_payment_scheme" -> {
                    emitEvent("paymentReceived", uri.toString())
                }
                "pdvpiloto_cielo_return" -> {  // ← Adicionar
                    Log.d("MainActivity", "Cielo callback received")
                    emitEvent("cieloPaymentReceived", uri.toString())
                }
                // ... outros schemes ...
            }
        }
    } catch (e: Exception) {
        Log.e("MainActivity", "Error handling intent", e)
    }
}
```

### 4.4 Adicionar Dependências (se necessário)

**Arquivo:** `android/app/build.gradle`

```gradle
dependencies {
    // ... dependências existentes ...
    
    // Cielo SDK (se houver SDK oficial)
    // implementation "br.com.cielo:cielo-sdk:x.y.z"
}
```

### 4.5 Configurar Source Sets

**Arquivo:** `android/app/build.gradle`

```gradle
android {
    // ...
    
    sourceSets {
        main {
            java {
                srcDirs += [
                    '../../packages/stone-sdk/android/payment',
                    '../../packages/stone-sdk/android/printer',
                    '../../packages/cielo-sdk/android/payment',  // ← Adicionar
                    '../../packages/cielo-sdk/android/printer'   // ← Adicionar
                ]
            }
        }
    }
}
```

---

## 🏭 Passo 5: Registrar no Factory

### 5.1 Adicionar ao Enum

**Arquivo:** `packages/payment-core/src/factory/PaymentProviderFactory.ts`

```typescript
export enum AcquirerType {
  STONE = 'stone',
  CIELO = 'cielo',        // ← Adicionar
  PAGSEGURO = 'pagseguro',
  GETNET = 'getnet',
  REDE = 'rede',
}
```

### 5.2 Implementar createProvider

**Arquivo:** `packages/payment-core/src/factory/PaymentProviderFactory.ts`

```typescript
private static createProvider(acquirer: AcquirerType): IPaymentProvider {
  switch (acquirer) {
    case AcquirerType.STONE:
      const { StonePaymentProvider } = require('../../../stone-sdk/typescript/StonePaymentProvider');
      return new StonePaymentProvider();
      
    case AcquirerType.CIELO:  // ← Adicionar
      const { CieloPaymentProvider } = require('../../../cielo-sdk/typescript/CieloPaymentProvider');
      return new CieloPaymentProvider();
      
    case AcquirerType.PAGSEGURO:
      throw new Error('PagSeguro provider not implemented yet');
      
    // ... outros cases ...
      
    default:
      throw new Error(`Unsupported acquirer: ${acquirer}`);
  }
}
```

### 5.3 Fazer o mesmo para PrinterProviderFactory

**Arquivo:** `packages/payment-core/src/factory/PrinterProviderFactory.ts`

```typescript
private static createProvider(acquirer: AcquirerType): IPrinterProvider {
  switch (acquirer) {
    case AcquirerType.STONE:
      const { StonePrinterProvider } = require('../../../stone-sdk/typescript/StonePrinterProvider');
      return new StonePrinterProvider();
      
    case AcquirerType.CIELO:  // ← Adicionar
      const { CieloPrinterProvider } = require('../../../cielo-sdk/typescript/CieloPrinterProvider');
      return new CieloPrinterProvider();
      
    // ... outros cases ...
  }
}
```

---

## ✅ Passo 6: Testes

### 6.1 Teste de Disponibilidade

```typescript
// Em PaymentScreen.tsx ou arquivo de teste
const testCieloAvailability = async () => {
  PaymentProviderFactory.setActive(AcquirerType.CIELO);
  const provider = PaymentProviderFactory.getActive();
  
  const isAvailable = await provider.isAvailable();
  console.log('Cielo disponível:', isAvailable);
};
```

### 6.2 Teste de Pagamento

```typescript
const testCieloPayment = async () => {
  try {
    PaymentProviderFactory.setActive(AcquirerType.CIELO);
    const provider = PaymentProviderFactory.getActive();
    
    // Registrar callback
    provider.onPaymentReceived((result) => {
      console.log('Resultado Cielo:', result);
      Alert.alert(
        result.success ? 'Sucesso!' : 'Falhou',
        `Transação: ${result.transactionId}`
      );
    });
    
    // Iniciar pagamento
    await provider.requestPayment({
      amount: 10.00,
      type: PaymentType.CREDIT,
      installments: 1,
    });
    
  } catch (error) {
    console.error('Erro:', error);
    Alert.alert('Erro', error.message);
  }
};
```

### 6.3 Teste de Impressão

```typescript
const testCieloPrint = async () => {
  PrinterProviderFactory.setActive(AcquirerType.CIELO);
  const printer = PrinterProviderFactory.getActive();
  
  await printer.printReceipt({
    header: ['PDV PILOTO', 'Teste Cielo'],
    items: [{ name: 'Produto Teste', quantity: 1, price: 10.00 }],
    subtotal: 10.00,
    total: 10.00,
    paymentMethod: 'Cielo - Crédito',
    timestamp: new Date(),
    footer: ['Obrigado!'],
  });
};
```

---

## 🎯 Exemplo Completo: Cielo

### Estrutura Final

```
packages/cielo-sdk/
├── README.md
├── package.json
│
├── typescript/
│   ├── index.ts
│   ├── CieloPaymentProvider.ts      (220 linhas)
│   └── CieloPrinterProvider.ts      (80 linhas)
│
└── android/
    └── payment/
        ├── CieloBridge.kt           (180 linhas)
        └── CieloPackage.kt          (20 linhas)
```

### Contagem de Código

| Componente | Linhas | Complexidade |
|------------|--------|--------------|
| TypeScript Providers | ~300 | Média |
| Kotlin Bridges | ~200 | Alta |
| Configuração | ~50 | Baixa |
| **TOTAL** | **~550** | - |

### Tempo de Desenvolvimento

- **Experiente**: 2 dias
- **Intermediário**: 3-4 dias
- **Iniciante**: 5-7 dias

---

## ✅ Checklist Final

### Antes de Commitar

- [ ] **Estrutura criada**
  - [ ] Package em `packages/[nome]-sdk/`
  - [ ] Subpastas `typescript/` e `android/`
  - [ ] README.md e package.json

- [ ] **TypeScript implementado**
  - [ ] PaymentProvider implementa IPaymentProvider
  - [ ] PrinterProvider implementa IPrinterProvider
  - [ ] index.ts exporta providers
  - [ ] Sem erros de lint

- [ ] **Kotlin implementado**
  - [ ] Bridge implementado
  - [ ] Package implementado
  - [ ] Source sets configurados
  - [ ] Compila sem erros

- [ ] **Android configurado**
  - [ ] Package registrado no MainApplication
  - [ ] Deep Links no AndroidManifest
  - [ ] Handler em MainActivity
  - [ ] Dependências adicionadas (se necessário)

- [ ] **Factory atualizado**
  - [ ] Enum AcquirerType atualizado
  - [ ] createProvider implementado
  - [ ] PrinterProviderFactory atualizado

- [ ] **Documentação**
  - [ ] README do package completo
  - [ ] Comentários em código
  - [ ] Exemplos de uso

- [ ] **Testes realizados**
  - [ ] isAvailable() funciona
  - [ ] requestPayment() abre app correto
  - [ ] Deep Link retorna corretamente
  - [ ] Callback processa resultado
  - [ ] Impressão funciona (se aplicável)

### Antes de Deploy

- [ ] Testado em dispositivo real
- [ ] Testado todos os tipos de pagamento
- [ ] Testado cancelamento (se aplicável)
- [ ] Testado erro (app não instalado)
- [ ] Logs limpos e informativos
- [ ] Performance OK (sem memory leaks)

---

## 📚 Referências Adicionais

### Documentações Oficiais

- **Stone**: https://sdkandroid.stone.com.br/
- **Cielo**: https://developercielo.github.io/manual/cielo-lio
- **PagSeguro**: https://dev.pagseguro.uol.com.br/
- **GetNet**: https://developers.getnet.com.br/
- **Rede**: https://www.userede.com.br/desenvolvedores

### Exemplos no Repositório

- Stone SDK: `packages/stone-sdk/` (referência completa)
- Interfaces: `packages/payment-core/src/interfaces/`
- Factory Pattern: `packages/payment-core/src/factory/`

---

## 🆘 Suporte

Dúvidas ou problemas:

1. **Consulte**: Documentação Stone como referência
2. **Compare**: Seu código com `packages/stone-sdk/`
3. **Debug**: Use `adb logcat` para ver logs nativos
4. **Pergunte**: Equipe Nebula Sistemas

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0  
**Autor:** Equipe Nebula Sistemas

---

## 🔗 Navegação

- **[← README Principal](../README.md)** - Voltar ao início
- **[📚 Visão Geral](./visao-geral-projeto.md)** - Proposta do projeto
- **[🏗️ Arquitetura MonoRepo](./arquitetura-monorepo.md)** - Estrutura MonoRepo
- **[🟢 Integração Stone](./integracao-stone.md)** - Referência de implementação

---

**Desenvolvido com ❤️ pela equipe Nebula Sistemas**

