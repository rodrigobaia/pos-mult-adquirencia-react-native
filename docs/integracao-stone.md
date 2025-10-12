# 🟢 Integração Stone SDK - Guia Completo

**[← Voltar ao README Principal](../README.md)** | **[📚 Visão Geral do Projeto](./visao-geral-projeto.md)** | **[🏗️ Arquitetura MonoRepo](./arquitetura-monorepo.md)**

> Documentação técnica detalhada da integração do Stone SDK no PDV Piloto

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura da Integração](#arquitetura-da-integração)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Dependências e SDKs](#dependências-e-sdks)
5. [Estrutura de Código](#estrutura-de-código)
6. [Deep Links](#deep-links)
7. [Módulo de Pagamento](#módulo-de-pagamento)
8. [Módulo de Impressão](#módulo-de-impressão)
9. [Product Flavors](#product-flavors)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### O que é a Integração Stone?

A integração Stone no PDV Piloto utiliza a **abordagem via Deep Links** conforme documentação oficial da Stone. Diferentemente de uma integração SDK direta (que requer certificados e causa crashes em alguns dispositivos), usamos:

- **Deep Links para Pagamento**: Comunicação com app Stone Payment
- **Deep Links para Impressão**: Comunicação com app Stone Printer
- **Bridges Kotlin**: Camada nativa que gerencia os Deep Links
- **Providers TypeScript**: Camada JavaScript que abstrai a complexidade

### Por que Deep Links?

**Vantagens:**
- ✅ Não requer certificados complexos
- ✅ Funciona em todos os dispositivos Positivo, Gertec, Ingenico, Sunmi, Tectoy
- ✅ Não causa crashes de segurança
- ✅ Integração mais simples e confiável
- ✅ Mantém apps Stone atualizados automaticamente

**Desvantagens:**
- ⚠️ Requer apps Stone instalados
- ⚠️ Fluxo assíncrono (usuário sai do app)

---

## 🏗️ Arquitetura da Integração

```
┌─────────────────────────────────────────────────────────┐
│                 React Native Layer                       │
│  PaymentScreen.tsx → StonePaymentProvider.ts            │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ NativeModules
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Kotlin Bridge Layer                         │
│  StoneBridge.kt + StonePrinterBridge.kt                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Intent / Deep Link
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Stone Native Apps                           │
│  Stone Payment + Stone Printer                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Deep Link Callback
                         ▼
┌─────────────────────────────────────────────────────────┐
│              MainActivity.kt                             │
│  onNewIntent() → DeviceEventEmitter                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Event
                         ▼
┌─────────────────────────────────────────────────────────┐
│         StonePaymentProvider.onPaymentReceived()        │
│         Processa resultado e exibe modal                │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuração do Ambiente

### 1. Pré-requisitos

```bash
✓ Node.js >= 20.x
✓ npm >= 10.x
✓ Android Studio Hedgehog | 2023.1.1+
✓ JDK 17
✓ Gradle 8.14.3
✓ Token Stone PackageCloud
```

### 2. Token Stone PackageCloud

#### 2.1 Obter Token

1. Acesse: https://packagecloud.io/stone/pos-android
2. Faça login (ou crie conta)
3. Vá em: Account Settings → API Tokens
4. Gere um token de leitura (read token)

#### 2.2 Configurar Token

**Arquivo:** `android/local.properties`

```properties
# Stone PackageCloud Token - OBRIGATÓRIO
packageCloudReadToken=ac2ee4190d2c63af9e7b025f041f4b684e6c66b0dcb4a0f2

# Token interno (opcional - apenas se tiver acesso)
#packageCloudReadTokenInternal=SEU_TOKEN_INTERNO
```

⚠️ **IMPORTANTE:** 
- Este arquivo está no `.gitignore` (NÃO versionar)
- Use `local.properties.example` como referência
- Cada desenvolvedor precisa criar seu `local.properties`

### 3. Repositórios Maven

**Arquivo:** `android/build.gradle`

```gradle
allprojects {
    repositories {
        // Repositórios Google e Maven Central
        google()
        mavenCentral()
        
        // Repositório Stone (público)
        maven {
            url "https://packagecloud.io/stone/pos-android/maven2"
            credentials {
                username = "token"
                password = packageCloudReadToken ?: ""
            }
        }
        
        // Repositório Stone (interno - opcional)
        maven {
            url "https://packagecloud.io/stone/pos-android-internal/maven2"
            credentials {
                username = "token"
                password = packageCloudReadTokenInternal ?: ""
            }
        }
        
        // Sonatype Snapshots (para versões beta)
        maven {
            url "https://oss.sonatype.org/content/repositories/snapshots/"
        }
    }
}
```

---

## 📦 Dependências e SDKs

### 1. Versões Utilizadas

**Arquivo:** `android/build.gradle` (root)

```gradle
ext {
    // Versão centralizada do Stone SDK
    stone_sdk_version = "4.13.0"
    
    compileSdkVersion = 34
    targetSdkVersion = 34
    minSdkVersion = 24
}
```

### 2. Dependências no App

**Arquivo:** `android/app/build.gradle`

```gradle
dependencies {
    // Stone SDK Core
    implementation "br.com.stone:stone-sdk:${rootProject.ext.stone_sdk_version}"
    
    // Stone SDK POS Android (base)
    implementation "br.com.stone:stone-sdk-posandroid:${rootProject.ext.stone_sdk_version}"
    
    // SDKs específicos por fabricante
    implementation "br.com.stone:stone-sdk-posandroid-positivo:${rootProject.ext.stone_sdk_version}"
    implementation "br.com.stone:stone-sdk-posandroid-ingenico:${rootProject.ext.stone_sdk_version}"
    implementation "br.com.stone:stone-sdk-posandroid-sunmi:${rootProject.ext.stone_sdk_version}"
    implementation "br.com.stone:stone-sdk-posandroid-gertec:${rootProject.ext.stone_sdk_version}"
    implementation "br.com.stone:stone-sdk-posandroid-tectoy:${rootProject.ext.stone_sdk_version}"
    
    // Debug mode (apenas em debug)
    debugImplementation "br.com.stone.sdk.android:debugmode:4.0.3"
    debugImplementation "com.github.tony19:logback-android:2.0.0"
}
```

### 3. Por que Múltiplos SDKs?

Cada fabricante tem particularidades de hardware:

| SDK | Fabricante | Dispositivos |
|-----|-----------|--------------|
| `stone-sdk-posandroid-positivo` | Positivo | L400, L500, Smart POS |
| `stone-sdk-posandroid-ingenico` | Ingenico | Move 2500/3500/5000, Desk 3500 |
| `stone-sdk-posandroid-sunmi` | Sunmi | P2 Pro, V2 Pro, L2 Series |
| `stone-sdk-posandroid-gertec` | Gertec | GPOS700, GPOS720 |
| `stone-sdk-posandroid-tectoy` | Tectoy | Tectoy POS |

**Estratégia:** Incluímos todos os SDKs para facilitar desenvolvimento e testes. Em produção, pode-se otimizar incluindo apenas o SDK do fabricante alvo.

---

## 📁 Estrutura de Código

### 1. Organização de Packages

```
packages/
└── stone-sdk/
    ├── typescript/                      # Camada JavaScript
    │   ├── index.ts                     # Exports públicos
    │   ├── StonePaymentProvider.ts      # Provider de pagamento
    │   ├── StonePrinterProvider.ts      # Provider de impressão
    │   └── StoneDeviceManager.ts        # Gerenciador de dispositivos
    │
    └── android/                         # Camada Nativa
        ├── payment/
        │   ├── StoneBridge.kt           # Bridge pagamento
        │   └── StonePackage.kt          # React Native Package
        │
        └── printer/
            ├── StonePrinterBridge.kt    # Bridge impressão
            └── StonePrinterPackage.kt   # React Native Package
```

### 2. Integração com payment-core

```
packages/
└── payment-core/
    ├── interfaces/
    │   ├── IPaymentProvider.ts          # Interface que Stone implementa
    │   └── IPrinterProvider.ts          # Interface de impressão
    │
    └── factory/
        ├── PaymentProviderFactory.ts    # Factory que cria StonePaymentProvider
        └── PrinterProviderFactory.ts    # Factory que cria StonePrinterProvider
```

---

## 🔗 Deep Links

### 1. Configuração no AndroidManifest

**Arquivo:** `android/app/src/main/AndroidManifest.xml`

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    android:exported="true">
    
    <!-- Intent principal -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    
    <!-- Deep Link para PAGAMENTO Stone -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data 
            android:host="pay-response" 
            android:scheme="stone_payment_scheme" />
    </intent-filter>
    
    <!-- Deep Link para IMPRESSÃO Stone -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="pdvpiloto_print_return" />
    </intent-filter>
</activity>
```

### 2. Schemes Utilizados

#### Pagamento
```
stone_payment_scheme://pay-response?<params>
```

**Parâmetros retornados:**
- `success=true/false`
- `transactionId=ABC123`
- `amount=10000` (em centavos)
- `cardBrand=VISA`
- `errorCode=XYZ` (se erro)

#### Impressão
```
pdvpiloto_print_return://?result=<STATUS>
```

**Status possíveis:**
- `SUCCESS` - Impressão bem-sucedida
- `PRINTER_OUT_OF_PAPER` - Sem papel
- `PRINTER_INIT_ERROR` - Erro ao inicializar
- `PRINTER_LOW_ENERGY` - Bateria baixa
- `PRINTER_BUSY` - Impressora ocupada
- `PRINTER_OVERHEATING` - Superaquecimento

### 3. Handler de Deep Links

**Arquivo:** `android/app/src/main/java/br/com/nebulasistemas/pdvpilotoapp/MainActivity.kt`

```kotlin
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)

    try {
        val uri = intent.data
        
        if (uri != null) {
            val scheme = uri.scheme
            
            when (scheme) {
                // Callback de pagamento
                "stone_payment_scheme" -> {
                    Log.d("MainActivity", "Payment callback received")
                    emitEvent("paymentReceived", uri.toString())
                }
                
                // Callback de impressão
                "pdvpiloto_print_return" -> {
                    Log.d("MainActivity", "Print callback received")
                    emitEvent("printReceived", uri.toString())
                }
                
                else -> {
                    Log.w("MainActivity", "Unknown scheme: $scheme")
                }
            }
        }
    } catch (e: Exception) {
        Log.e("MainActivity", "Error handling deep link", e)
    }
}

// Emite evento para JavaScript com retry
private fun emitEvent(eventName: String, data: String) {
    Handler(Looper.getMainLooper()).postDelayed({
        try {
            val reactContext = reactInstanceManager?.currentReactContext
            reactContext?.getJSModule(RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, data)
        } catch (e: Exception) {
            Log.e("MainActivity", "Error emitting event", e)
        }
    }, 50)
}
```

---

## 💳 Módulo de Pagamento

### 1. Bridge Kotlin - StoneBridge.kt

**Arquivo:** `packages/stone-sdk/android/payment/StoneBridge.kt`

```kotlin
class StoneBridge(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val MODULE_NAME = "StoneBridge"
        private const val TAG = "StoneBridge"
    }
    
    override fun getName(): String = MODULE_NAME
    
    /**
     * Inicia pagamento via Deep Link Stone
     */
    @ReactMethod
    fun requestPayment(
        amount: Double,
        type: String,
        installments: Int,
        promise: Promise
    ) {
        try {
            // Converter amount para centavos
            val amountInCents = (amount * 100).toInt()
            
            // Construir Deep Link
            val uri = Uri.Builder().apply {
                scheme("payment-app")
                authority("pay")
                appendQueryParameter("acquirerId", "stone")
                appendQueryParameter("providerId", "stone")
                appendQueryParameter("paymentType", mapPaymentType(type))
                appendQueryParameter("amount", amountInCents.toString())
                appendQueryParameter("installmentCount", installments.toString())
                appendQueryParameter("capture", "true")
                appendQueryParameter("showReceiptView", "false")
                appendQueryParameter("appTransactionId", UUID.randomUUID().toString())
                appendQueryParameter("returnScheme", "stone_payment_scheme")
            }.build()
            
            // Criar Intent
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            
            // Abrir app Stone
            reactApplicationContext.startActivity(intent)
            
            promise.resolve("Payment request sent")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting payment", e)
            promise.reject("PAYMENT_ERROR", e.message, e)
        }
    }
    
    /**
     * Mapeia tipo de pagamento para formato Stone
     */
    private fun mapPaymentType(type: String): String {
        return when (type.uppercase()) {
            "CREDIT" -> "CREDIT"
            "DEBIT" -> "DEBIT"
            "PIX" -> "PIX"
            else -> "CREDIT"
        }
    }
    
    /**
     * Verifica se app Stone está instalado
     */
    @ReactMethod
    fun isStoneAppInstalled(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("payment-app://pay")
            }
            
            val activities = packageManager.queryIntentActivities(intent, 0)
            val isInstalled = activities.isNotEmpty()
            
            promise.resolve(isInstalled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
```

### 2. Provider TypeScript - StonePaymentProvider.ts

**Arquivo:** `packages/stone-sdk/typescript/StonePaymentProvider.ts`

```typescript
import { NativeModules, DeviceEventEmitter } from 'react-native';
import type {
  IPaymentProvider,
  PaymentRequest,
  PaymentResult,
} from '../../payment-core/src';

const { StoneBridge } = NativeModules;

export class StonePaymentProvider implements IPaymentProvider {
  
  /**
   * Solicita pagamento via Stone
   */
  async requestPayment(request: PaymentRequest): Promise<void> {
    try {
      await StoneBridge.requestPayment(
        request.amount,
        request.type,
        request.installments || 1
      );
    } catch (error) {
      throw new Error(
        `Stone payment error: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }
  
  /**
   * Verifica se Stone está disponível
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await StoneBridge.isStoneAppInstalled();
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
      'paymentReceived',
      (uriString: string) => {
        const result = this.parsePaymentResult(uriString);
        callback(result);
      }
    );
    
    return () => subscription.remove();
  }
  
  /**
   * Parse do resultado do Deep Link
   */
  private parsePaymentResult(uriString: string): PaymentResult {
    try {
      const url = new URL(uriString);
      const params = url.searchParams;
      
      const success = params.get('success') === 'true';
      const transactionId = params.get('transactionId') || '';
      const amount = parseInt(params.get('amount') || '0') / 100;
      const cardBrand = params.get('cardBrand');
      const errorCode = params.get('errorCode');
      
      return {
        success,
        transactionId,
        amount,
        timestamp: new Date(),
        extras: {
          cardBrand,
          errorCode,
          paymentType: params.get('paymentType'),
        },
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        amount: 0,
        timestamp: new Date(),
        extras: {
          error: 'Failed to parse payment result',
        },
      };
    }
  }
  
  /**
   * Retorna informações do provider
   */
  getInfo() {
    return {
      id: 'stone',
      name: 'Stone',
      version: '4.13.0',
      supportedPaymentTypes: ['CREDIT', 'DEBIT', 'PIX'],
      supportsInstallments: true,
      maxInstallments: 12,
    };
  }
  
  /**
   * Cancela transação (não implementado via Deep Link)
   */
  async cancelTransaction(transactionId: string): Promise<any> {
    throw new Error('Cancel transaction not supported via Deep Link');
  }
}
```

### 3. Uso na Aplicação

**Arquivo:** `src/screens/PaymentScreen.tsx`

```typescript
const processPayment = async (amount: number, type: PaymentType) => {
  try {
    // Obter provider Stone
    const paymentProvider = PaymentProviderFactory.getActive();
    
    // Verificar disponibilidade
    const available = await paymentProvider.isAvailable();
    if (!available) {
      Alert.alert('Erro', 'App Stone não instalado');
      return;
    }
    
    setProcessing(true);
    
    // Iniciar pagamento (abre app Stone)
    await paymentProvider.requestPayment({
      amount,
      type,
      installments: 1,
    });
    
    // Aguarda callback via Deep Link
    // (processado por onPaymentReceived)
    
  } catch (error) {
    setProcessing(false);
    Alert.alert('Erro', error.message);
  }
};

// Registrar listener para resultado
useEffect(() => {
  const paymentProvider = PaymentProviderFactory.getActive();
  
  const unsubscribe = paymentProvider.onPaymentReceived(async (result) => {
    console.log('Payment result:', result);
    
    setProcessing(false);
    setPaymentResult(result);
    setShowResultModal(true);
    
    // Imprimir cupom se aprovado
    if (result.success) {
      await printPaymentReceipt(result);
    }
  });
  
  return unsubscribe;
}, []);
```

---

## 🖨️ Módulo de Impressão

### 1. Bridge Kotlin - StonePrinterBridge.kt

**Arquivo:** `packages/stone-sdk/android/printer/StonePrinterBridge.kt`

```kotlin
class StonePrinterBridge(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val MODULE_NAME = "StonePrinterBridge"
        private const val TAG = "StonePrinter"
    }
    
    override fun getName(): String = MODULE_NAME
    
    /**
     * Imprime recibo via Deep Link
     */
    @ReactMethod
    fun printReceipt(receipt: ReadableMap, promise: Promise) {
        try {
            // Criar conteúdo JSON para impressão
            val printContent = createReceiptPrintContent(receipt)
            
            // Abrir impressora via Deep Link
            val success = openPrinterApp(printContent)
            
            if (success) {
                promise.resolve("Print sent successfully")
            } else {
                promise.reject("PRINT_ERROR", "Failed to send print")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Print error", e)
            promise.reject("PRINT_ERROR", e.message, e)
        }
    }
    
    /**
     * Cria conteúdo JSON do recibo conforme spec Stone
     */
    private fun createReceiptPrintContent(receipt: ReadableMap): String {
        val jsonArray = JSONArray()
        val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale("pt", "BR"))
        
        // Header
        receipt.getArray("header")?.toArrayList()?.forEach { line ->
            jsonArray.put(JSONObject().apply {
                put("type", "text")
                put("content", line.toString())
                put("align", "center")
                put("size", "big")
            })
        }
        
        // Separador
        jsonArray.put(JSONObject().apply {
            put("type", "line")
            put("content", "================================")
        })
        
        // Items
        receipt.getArray("items")?.toArrayList()?.forEach { item ->
            val itemMap = item as? HashMap<*, *>
            itemMap?.let {
                val name = it["name"].toString()
                val qty = it["quantity"].toString()
                val price = String.format("%.2f", it["price"] as? Double ?: 0.0)
                
                jsonArray.put(JSONObject().apply {
                    put("type", "line")
                    put("content", "$qty x $name")
                })
                jsonArray.put(JSONObject().apply {
                    put("type", "line")
                    put("content", "   R$ $price")
                })
            }
        }
        
        // Total
        val total = receipt.getDouble("total")
        jsonArray.put(JSONObject().apply {
            put("type", "text")
            put("content", String.format("TOTAL: R$ %.2f", total))
            put("align", "center")
            put("size", "big")
        })
        
        // Footer
        receipt.getArray("footer")?.toArrayList()?.forEach { line ->
            jsonArray.put(JSONObject().apply {
                put("type", "line")
                put("content", line.toString())
            })
        }
        
        return jsonArray.toString()
    }
    
    /**
     * Abre app Stone Printer via Deep Link
     */
    private fun openPrinterApp(printContent: String): Boolean {
        return try {
            val currentActivity = reactApplicationContext.currentActivity
                ?: return false

            // Criar URI conforme documentação Stone
            val uri = Uri.Builder().apply {
                scheme("printer-app")
                authority("print")
                appendQueryParameter("SHOW_FEEDBACK_SCREEN", "true")
                appendQueryParameter("SCHEME_RETURN", "pdvpiloto_print_return")
                appendQueryParameter("PRINTABLE_CONTENT", printContent)
            }.build()

            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uri
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            currentActivity.startActivity(intent)
            true

        } catch (e: Exception) {
            Log.e(TAG, "Error opening printer", e)
            false
        }
    }
    
    /**
     * Status da impressora (sempre disponível para Deep Link)
     */
    @ReactMethod
    fun getPrinterStatus(promise: Promise) {
        val status = Arguments.createMap().apply {
            putBoolean("available", true)
            putBoolean("paperLow", false)
            putString("method", "deeplink")
        }
        promise.resolve(status)
    }
}
```

### 2. Provider TypeScript - StonePrinterProvider.ts

```typescript
import { NativeModules, DeviceEventEmitter } from 'react-native';
import type { IPrinterProvider, Receipt } from '../../payment-core/src';

const { StonePrinterBridge } = NativeModules;

export class StonePrinterProvider implements IPrinterProvider {
  
  private printResultCallback?: (result: string) => void;
  
  /**
   * Imprime recibo
   */
  async printReceipt(receipt: Receipt): Promise<void> {
    this.setupPrintResultListener();
    
    await StonePrinterBridge.printReceipt({
      header: receipt.header,
      items: receipt.items,
      subtotal: receipt.subtotal,
      total: receipt.total,
      paymentMethod: receipt.paymentMethod,
      footer: receipt.footer || [],
    });
  }
  
  /**
   * Configura listener para resultado
   */
  private setupPrintResultListener(): void {
    DeviceEventEmitter.removeAllListeners('printReceived');
    
    DeviceEventEmitter.addListener('printReceived', (uri: string) => {
      this.handlePrintResult(uri);
    });
  }
  
  /**
   * Processa resultado da impressão
   */
  private handlePrintResult(uri: string): void {
    try {
      const url = new URL(uri);
      const result = url.searchParams.get('result') || 'UNKNOWN';
      
      console.log('Print result:', result);
      
      if (this.printResultCallback) {
        this.printResultCallback(result);
      }
    } catch (error) {
      console.error('Error handling print result:', error);
    }
  }
  
  /**
   * Define callback para resultado
   */
  setPrintResultCallback(callback: (result: string) => void): void {
    this.printResultCallback = callback;
  }
  
  async getPrinterStatus() {
    const status = await StonePrinterBridge.getPrinterStatus();
    return {
      available: status.available,
      paperLow: status.paperLow,
    };
  }
  
  getInfo() {
    return {
      id: 'stone-printer',
      name: 'Stone Printer',
      printerModel: 'Stone Thermal Printer',
      printWidth: 48,
    };
  }
}
```

---

## 🏭 Product Flavors

### Configuração Multi-Fabricante

**Arquivo:** `android/app/build.gradle`

```gradle
android {
    // ...
    
    flavorDimensions "manufacturer"
    
    productFlavors {
        gertec {
            dimension "manufacturer"
            applicationIdSuffix ".gertec"
            versionNameSuffix "-gertec"
            buildConfigField "String", "STONE_MANUFACTURER", '"gertec"'
        }
        
        ingenico {
            dimension "manufacturer"
            applicationIdSuffix ".ingenico"
            versionNameSuffix "-ingenico"
            buildConfigField "String", "STONE_MANUFACTURER", '"ingenico"'
        }
        
        positivo {
            dimension "manufacturer"
            applicationIdSuffix ".positivo"
            versionNameSuffix "-positivo"
            buildConfigField "String", "STONE_MANUFACTURER", '"positivo"'
        }
        
        sunmi {
            dimension "manufacturer"
            applicationIdSuffix ".sunmi"
            versionNameSuffix "-sunmi"
            buildConfigField "String", "STONE_MANUFACTURER", '"sunmi"'
        }
        
        tectoy {
            dimension "manufacturer"
            applicationIdSuffix ".tectoy"
            versionNameSuffix "-tectoy"
            buildConfigField "String", "STONE_MANUFACTURER", '"tectoy"'
        }
    }
}
```

### Build de APKs

```bash
# Todos os fabricantes em debug
./gradlew assembleDebug

# Fabricante específico
./gradlew assemblePositivoDebug
./gradlew assembleGertecRelease

# Instalar no dispositivo
./gradlew installPositivoDebug
```

---

## 🐛 Troubleshooting

### 1. Erro: "Could not resolve br.com.stone:stone-sdk"

**Causa:** Token PackageCloud inválido ou ausente

**Solução:**
```bash
# 1. Verificar se local.properties existe
ls android/local.properties

# 2. Verificar token
cat android/local.properties | grep packageCloudReadToken

# 3. Se não existir, criar baseado no example
cp android/local.properties.example android/local.properties

# 4. Editar e adicionar token válido
```

### 2. Erro: "App Stone não instalado"

**Causa:** Apps Stone Payment/Printer não estão no dispositivo

**Solução:**
```bash
# Verificar apps instalados
adb shell pm list packages | grep stone

# Instalar Stone Payment (se disponível)
adb install stone-payment.apk

# Instalar Stone Printer (se disponível)
adb install stone-printer.apk
```

### 3. Deep Link não retorna

**Causa:** Callback não está sendo capturado

**Debug:**
```bash
# Ver logs do MainActivity
adb logcat | grep MainActivity

# Ver logs do Stone
adb logcat | grep Stone

# Verificar se Deep Link está registrado
adb shell dumpsys package br.com.nebulasistemas.pdvpilotoapp.positivo
```

**Verificações:**
- ✓ `launchMode="singleTask"` no AndroidManifest
- ✓ intent-filter correto para `stone_payment_scheme`
- ✓ `onNewIntent()` implementado
- ✓ DeviceEventEmitter registrado

### 4. Build fails: "Duplicate class"

**Causa:** Conflito de dependências

**Solução:**
```gradle
// No app/build.gradle, adicionar:
packagingOptions {
    exclude 'META-INF/api_release.kotlin_module'
    exclude 'META-INF/client_release.kotlin_module'
}
```

### 5. Crash: SecurityException no Positivo L400

**Causa:** Tentativa de usar StoneStart.init() diretamente

**Solução:** Usar APENAS Deep Links (já implementado). NÃO chamar:
```kotlin
// ❌ NÃO FAZER ISSO:
StoneStart.init(this)

// ✅ USAR APENAS:
// Deep Links via Intent
```

### 6. Impressão não funciona

**Checklist:**
```
✓ App Stone Printer instalado?
✓ Deep Link scheme correto (pdvpiloto_print_return)?
✓ JSON do printable_content válido?
✓ Impressora ligada e com papel?
✓ Callback handler registrado?
```

**Debug JSON:**
```kotlin
// Adicionar no StonePrinterBridge.kt
Log.d(TAG, "Print JSON: $printContent")

// Verificar se está no formato correto:
// [{"type":"text","content":"PDV PILOTO","align":"center"}]
```

---

## 📚 Referências Oficiais

- [Stone SDK Android Documentation](https://sdkandroid.stone.com.br/)
- [Stone Deep Link Payment](https://sdkandroid.stone.com.br/reference/intents-de-pagamento)
- [Stone Deep Link Printer](https://sdkandroid.stone.com.br/reference/impressao-deeplink)
- [Stone PackageCloud Repository](https://packagecloud.io/stone/pos-android)
- [Stone GitHub Examples](https://github.com/stone-payments)

---

## ✅ Checklist de Integração

Use este checklist ao configurar um novo ambiente:

### Ambiente
- [ ] JDK 17 instalado
- [ ] Android Studio atualizado
- [ ] Gradle 8.14.3+
- [ ] Token Stone PackageCloud obtido

### Configuração
- [ ] `local.properties` criado
- [ ] Token adicionado em `packageCloudReadToken`
- [ ] Repositórios Maven configurados
- [ ] Dependências Stone adicionadas

### Código
- [ ] Bridges Kotlin implementados
- [ ] Providers TypeScript criados
- [ ] Deep Links configurados no Manifest
- [ ] MainActivity com onNewIntent()
- [ ] Product flavors configurados

### Testes
- [ ] Apps Stone instalados no dispositivo
- [ ] Pagamento crédito funciona
- [ ] Pagamento débito funciona
- [ ] Impressão de cupom funciona
- [ ] Deep Link callback retorna

---

**Última atualização:** Outubro 2025  
**Versão do documento:** 1.0  
**Stone SDK:** 4.13.0

---

## 🔗 Navegação

- **[← README Principal](../README.md)** - Voltar ao início
- **[📚 Visão Geral](./visao-geral-projeto.md)** - Proposta do projeto
- **[🏗️ Arquitetura MonoRepo](./arquitetura-monorepo.md)** - Estrutura MonoRepo
- **[🔌 Adicionar Adquirente](./adicionar-adquirente.md)** - Expandir sistema

---

**Desenvolvido com ❤️ pela equipe Nebula Sistemas**

