# Integração Local (SDK) - Cielo LIO

A integração local utiliza o SDK oficial da Cielo LIO para comunicação direta com o sistema de pagamentos. Esta abordagem oferece controle total sobre o fluxo de pagamento e acesso a funcionalidades avançadas.

## ⚠️ Importante

**O SDK foi descontinuado** e a partir de agora serão enviados apenas patches com correções pontuais. A Cielo recomenda a **integração via Deep Link** para novos projetos.

## 🎯 Quando Usar o SDK

Use a integração local quando:
- Precisar de controle total sobre o fluxo de pagamento
- Quiser integrar funcionalidades avançadas
- Estiver migrando de uma versão anterior
- Precisar de integração mais profunda com o sistema

## ⚙️ Configuração Inicial

### 1. Dependências

Adicione as dependências no `build.gradle`:

```gradle
allprojects {
    repositories {
        mavenLocal()  // Necessário para o SDK da Cielo
        jcenter()
        google()
    }
}

dependencies {
    // SDK Principal da Cielo
    implementation 'com.cielo.lio:order-manager:2.7.2'
    
    // Dependências do Datadog (necessárias para o SDK)
    implementation 'com.datadoghq:dd-sdk-android-gradle-plugin:1.14.0'
    implementation 'com.datadoghq:dd-sdk-android-logs:2.16.0'
    implementation 'com.datadoghq:dd-sdk-android-trace:2.16.0'
    implementation 'com.datadoghq:dd-sdk-android-rum:2.16.0'
}
```

### 2. Permissões

Adicione as permissões necessárias no `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
```

### 3. Configuração do SDK

```gradle
android {
    defaultConfig {
        buildConfigField("String", "CREDENTIALS_CLIENT_ID", "\"hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN\"")
        buildConfigField("String", "CREDENTIALS_ACCESS_TOKEN", "\"3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4\"")
    }
}
```

## 🚀 Inicialização do OrderManager

### 1. Criação do OrderManager

```kotlin
class OrderManagerController private constructor(context: Context) {
    
    private val orderManagerConnector: OrderManagerConnector by lazy {
        OrderManagerConnector(context, Dispatchers.Default)
    }
    
    private val _om by lazy {
        OrderManager(
            Credentials(BuildConfig.CREDENTIALS_CLIENT_ID, BuildConfig.CREDENTIALS_ACCESS_TOKEN), 
            context
        )
    }
    
    companion object {
        @Volatile
        private var instance: OrderManagerController? = null
        
        fun getInstance(context: Context): OrderManagerController {
            return instance ?: synchronized(this) {
                instance ?: OrderManagerController(context.applicationContext).also { instance = it }
            }
        }
    }
}
```

### 2. Vinculação do Serviço

```kotlin
class OrderManagerConnector(
    private val context: Context,
    private val defaultDispatcher: CoroutineDispatcher = Dispatchers.Default,
) : ServiceBindListener {
    
    private val serviceBound = MutableStateFlow(false)
    private val orderManager = serviceBound.filter { it }.map { _om }
    private val bindMutex = Mutex()
    
    suspend fun getOrderManager() = withContext(defaultDispatcher) {
        bindMutex.withLock {
            _om.bind(context, this@OrderManagerConnector)
            orderManager.first()
        }
    }
    
    override fun onServiceBound() {
        serviceBound.value = true
    }
    
    override fun onServiceUnbound() {
        serviceBound.value = false
    }
    
    override fun onServiceBoundError(throwable: Throwable) {
        onServiceUnbound()
    }
}
```

## 📦 Gerenciamento de Pedidos

### 1. Criação de Pedido

```kotlin
suspend fun createDraftOrder(orderReference: String): Order? {
    return getOrderManager().createDraftOrder(orderReference)
}
```

### 2. Adição de Itens

```kotlin
fun addItemToOrder(order: Order, sku: String, name: String, unitPrice: Int, quantity: Int, unitOfMeasure: String) {
    order.addItem(sku, name, unitPrice, quantity, unitOfMeasure)
}
```

### 3. Liberação do Pedido

```kotlin
fun placeOrder(order: Order) {
    scope.launch {
        getOrderManager().placeOrder(order)
    }
}
```

### 4. Atualização do Pedido

```kotlin
fun updateOrder(order: Order) {
    scope.launch {
        getOrderManager().updateOrder(order)
    }
}
```

## 💳 Processamento de Pagamentos

### 1. Estrutura do CheckoutRequest

```kotlin
val request = CheckoutRequest.Builder()
    .orderId(order.id)                    // Obrigatório
    .amount(123456789L)                   // Obrigatório
    .ec("999999999999999")                // Opcional (MULTI-EC)
    .installments(3)                      // Opcional
    .email("teste@email.com")             // Opcional
    .paymentCode(PaymentCode.CREDITO_PARCELADO_LOJA) // Opcional
    .build()
```

### 2. Parâmetros do CheckoutRequest

| Atributo | Descrição | Domínio | Obrigatório |
|----------|-----------|---------|-------------|
| `orderId` | ID do pedido a ser pago | `String` | ✅ |
| `amount` | Valor a ser pago (em centavos) | `Long` | ✅ |
| `ec` | Número do estabelecimento (MULTI-EC) | `String` | ❌ |
| `installments` | Número de parcelas | `Int` | ❌ |
| `email` | Email para comprovante | `String` | ❌ |
| `paymentCode` | Código da operação | `PaymentCode` | ❌ |

### 3. PaymentListener

```kotlin
val paymentListener = object : PaymentListener {
    override fun onStart() {
        Log.d("SDKClient", "O pagamento começou.")
    }
    
    override fun onPayment(order: Order) {
        Log.d("SDKClient", "Um pagamento foi realizado.")
        
        // Marcar pedido como pago
        order.markAsPaid()
        orderManager.updateOrder(order)
        
        // Processar dados do pagamento
        val payment = order.payments[0]
        val authCode = payment.authCode
        val cieloCode = payment.cieloCode
        val brand = payment.paymentFields["brand"]
    }
    
    override fun onCancel() {
        Log.d("SDKClient", "A operação foi cancelada.")
    }
    
    override fun onError(paymentError: PaymentError) {
        Log.d("SDKClient", "Houve um erro no pagamento: ${paymentError.message}")
    }
}
```

### 4. Execução do Pagamento

```kotlin
suspend fun checkout(checkoutRequest: CheckoutRequest, paymentListener: PaymentListener) {
    scope.launch {
        getOrderManager().checkoutOrder(checkoutRequest, paymentListener)
    }
}
```

## 🔄 Cancelamento de Pagamentos

### 1. Estrutura do CancellationRequest

```kotlin
val request = CancellationRequest.Builder()
    .orderId(order.id)                                    // Obrigatório
    .authCode(order.payments[0].authCode)                 // Obrigatório
    .cieloCode(order.payments[0].cieloCode)               // Obrigatório
    .value(order.payments[0].amount)                      // Obrigatório
    .ec("0000000000000003")                               // Opcional
    .build()
```

### 2. CancellationListener

```kotlin
val cancellationListener = object : CancellationListener {
    override fun onSuccess(cancelledOrder: Order) {
        Log.d("SDKClient", "O pagamento foi cancelado.")
    }
    
    override fun onCancel() {
        Log.d("SDKClient", "A operação foi cancelada.")
    }
    
    override fun onError(paymentError: PaymentError) {
        Log.d("SDKClient", "Houve um erro no cancelamento: ${paymentError.message}")
    }
}
```

### 3. Execução do Cancelamento

```kotlin
suspend fun cancelOrder(cancellationRequest: CancellationRequest, cancellationListener: CancellationListener) {
    scope.launch {
        getOrderManager().cancelOrder(cancellationRequest, cancellationListener)
    }
}
```

## 📋 Listagem de Pedidos

### 1. Recuperação de Pedidos

```kotlin
suspend fun getOrders(pageSize: Int, page: Int): ResultOrders? {
    return getOrderManager().retrieveOrders(pageSize, page)
}
```

### 2. Busca de Pedido por ID

```kotlin
suspend fun findOrderById(orderId: String): Order? {
    return getOrderManager().findOrderById(orderId)
}
```

### 3. Atualização do Servidor

```kotlin
fun refreshOrdersFromServer() {
    scope.launch {
        getOrderManager().refreshOrdersFromServer()
    }
}
```

## 🖨️ Funcionalidades de Impressão

### 1. Inicialização do PrinterManager

```kotlin
val printerManager = PrinterManager(context)
```

### 2. PrinterListener

```kotlin
val printerListener = object : PrinterListener {
    override fun onPrintSuccess(printedLines: Int) {
        Log.d(TAG, "onPrintSuccess: $printedLines linhas impressas")
    }
    
    override fun onError(throwable: Throwable?) {
        Log.d(TAG, "onError: ${throwable?.message}")
    }
    
    override fun onWithoutPaper() {
        Log.d(TAG, "onWithoutPaper: Sem papel")
    }
}
```

### 3. Impressão de Texto

```kotlin
fun printText(text: String) {
    val styles = listOf(
        mapOf(
            PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER,
            PrinterAttributes.KEY_TYPEFACE to 0,
            PrinterAttributes.KEY_TEXT_SIZE to 20
        )
    )
    
    printerManager.printText(text, styles, printerListener)
}
```

### 4. Impressão de Imagem

```kotlin
fun printImage(bitmap: Bitmap) {
    val styles = listOf(
        mapOf(
            PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER
        )
    )
    
    printerManager.printImage(bitmap, styles, printerListener)
}
```

### 5. Atributos de Impressão

| Atributo | Descrição | Valores |
|----------|-----------|---------|
| `KEY_ALIGN` | Alinhamento | `VAL_ALIGN_LEFT`, `VAL_ALIGN_CENTER`, `VAL_ALIGN_RIGHT` |
| `KEY_TEXTSIZE` | Tamanho do texto | Valores inteiros |
| `KEY_TYPEFACE` | Fonte | 0 a 8 |
| `KEY_MARGINLEFT` | Margem esquerda | Valores inteiros |
| `KEY_MARGINRIGHT` | Margem direita | Valores inteiros |
| `KEY_MARGINTOP` | Margem superior | Valores inteiros |
| `KEY_MARGINBOTTOM` | Margem inferior | Valores inteiros |
| `KEY_LINESPACE` | Espaçamento entre linhas | Valores inteiros |
| `KEY_WEIGHT` | Peso da coluna | Valores inteiros |

## 📊 Informações do Terminal

### 1. Inicialização do InfoManager

```kotlin
val infoManager = InfoManager()
```

### 2. Nível de Bateria

```kotlin
val batteryLevel: Float = infoManager.getBatteryLevel(context)
// Retorna valor de 0 a 1 (0% a 100%)
```

### 3. Modelo do Dispositivo

```kotlin
val deviceModel: DeviceModel = infoManager.getDeviceModel()
// Retorna enum com o modelo da LIO
```

### 4. Configurações do Terminal

```kotlin
val settings: Settings = infoManager.getSettings(context)
val merchantCode = settings.merchantCode
val logicNumber = settings.logicNumber
```

## 🔧 Produtos Habilitados

### 1. Recuperação de Produtos

```kotlin
fun fetchEnabledProducts() {
    scope.launch {
        enabledProducts = getOrderManager().retrieveEnabledProducts()
    }
}
```

### 2. Lista de Produtos

```kotlin
fun getEnabledProducts(): List<PaymentCode> {
    return enabledProducts
}
```

### 3. Produtos Primários

```kotlin
suspend fun getPrimaryProducts(context: Context): List<PrimaryProduct> {
    return getOrderManager().retrievePaymentType(context)
}
```

## 🚨 Tratamento de Pagamento Parcial

### 1. Verificação de Valor Pendente

```kotlin
override fun onPayment(order: Order) {
    if (order.pendingAmount == 0L) {
        // Pagamento completo
        order.markAsPaid()
        orderManager.updateOrder(order)
    } else {
        // Pagamento parcial - tratar conforme necessário
        handlePartialPayment(order)
    }
}
```

### 2. Campos Importantes

| Campo | Descrição |
|-------|-----------|
| `pendingAmount` | Valor pendente de pagamento |
| `paidAmount` | Valor já pago |
| `price` | Valor total do pedido |

## 🔔 Notificação de Cancelamentos

### 1. BroadcastReceiver

```kotlin
class LIOCancelationBroadcastReceiver : BroadcastReceiver() {
    
    private val MY_CLIENT_ID = "Seu client id aqui"
    private val MY_ACCESS_KEY = "Seu access key aqui"
    
    override fun onReceive(context: Context, intent: Intent) {
        val order = intent.getExtras()?.getParcelable<ParcelableOrder>("ORDER")
        val transaction = intent.getExtras()?.getParcelable<ParcelableTransaction>("TRANSACTION")
        
        if (MY_ACCESS_KEY.equals(order?.accessKey, true) && 
            MY_CLIENT_ID.equals(order?.secretAccessKey, true)) {
            // Processar cancelamento
            handleCancellation(order, transaction)
        }
    }
}
```

### 2. AndroidManifest.xml

```xml
<receiver
    android:name=".receiver.LIOCancelationBroadcastReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="cielo.action.NOTIFY_TRANSACTION_CANCEL" />
    </intent-filter>
</receiver>
```

## 🔄 Finalização do OrderManager

### 1. Desvinculação do Serviço

```kotlin
fun unbind() {
    orderManager.unbind()
}
```

### 2. Verificação de Estado

```kotlin
fun isServiceBound(): Boolean {
    return orderManagerConnector.serviceBoundState
}
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **ServiceBoundError**
   - Verifique se as credenciais estão corretas
   - Confirme se o app está rodando em um terminal Cielo LIO

2. **UnsupportedOperationException**
   - Verifique se a funcionalidade está disponível na versão da LIO
   - Consulte a tabela de compatibilidade de versões

3. **NoSuchElementException**
   - Verifique se o método de pagamento está habilitado no terminal
   - Use `retrieveEnabledProducts()` para listar métodos disponíveis

### Logs e Debug

```bash
adb logcat | grep -i cielo
adb logcat | grep -i order
adb logcat | grep -i payment
```

## 📚 Próximos Passos

- [Integração via Deep Link](./deep-link-integration.md) (Recomendada)
- [Referência da API](./api-reference.md)
- [Exemplos de Código](./examples/)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, SDK v2.7.2
