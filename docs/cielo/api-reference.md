# Referência da API - Cielo LIO

Esta documentação contém a referência completa das APIs disponíveis para integração com a Cielo LIO.

## 📋 Índice

- [Deep Link APIs](#deep-link-apis)
- [SDK APIs](#sdk-apis)
- [Estruturas de Dados](#estruturas-de-dados)
- [Códigos de Pagamento](#códigos-de-pagamento)
- [Códigos de Status](#códigos-de-status)
- [Atributos de Impressão](#atributos-de-impressão)
- [Modelos de Dispositivo](#modelos-de-dispositivo)

## 🔗 Deep Link APIs

### 1. Pagamento

**URI**: `lio://payment`

**Parâmetros**:
- `request`: JSON codificado em Base64
- `urlCallback`: URL de callback para resposta

**Exemplo**:
```
lio://payment?request=eyJhY2Nlc3NUb2tlbiI6...&urlCallback=order://response
```

### 2. Cancelamento

**URI**: `lio://payment-reversal`

**Parâmetros**:
- `request`: JSON codificado em Base64
- `urlCallback`: URL de callback para resposta

**Exemplo**:
```
lio://payment-reversal?request=eyJpZCI6...&urlCallback=order://response
```

### 3. Impressão

**URI**: `lio://print`

**Parâmetros**:
- `request`: JSON codificado em Base64
- `urlCallback`: URL de callback para resposta

**Exemplo**:
```
lio://print?request=eyJvcGVyYXRpb24iOi...&urlCallback=order://response
```

## 🛠️ SDK APIs

### OrderManager

#### Construtor
```kotlin
OrderManager(credentials: Credentials, context: Context)
```

#### Métodos Principais

##### bind()
```kotlin
fun bind(context: Context, serviceBindListener: ServiceBindListener)
```
Vincula o contexto da aplicação ao SDK.

##### unbind()
```kotlin
fun unbind()
```
Desvincula o contexto da aplicação do SDK.

##### createDraftOrder()
```kotlin
fun createDraftOrder(reference: String): Order
```
Cria um pedido em status DRAFT.

##### placeOrder()
```kotlin
fun placeOrder(order: Order)
```
Libera o pedido para pagamento (status ENTERED).

##### updateOrder()
```kotlin
fun updateOrder(order: Order)
```
Atualiza um pedido existente.

##### checkoutOrder()
```kotlin
fun checkoutOrder(request: CheckoutRequest, paymentListener: PaymentListener)
fun checkoutOrder(orderId: String, paymentListener: PaymentListener)
fun checkoutOrder(orderId: String, amount: Long, paymentListener: PaymentListener)
fun checkoutOrder(orderId: String, amount: Long, primaryCode: String, secondaryCode: String, paymentListener: PaymentListener)
fun checkoutOrder(orderId: String, amount: Long, primaryCode: String, secondaryCode: String, installments: Long, paymentListener: PaymentListener)
```
Inicia o processo de pagamento.

##### cancelOrder()
```kotlin
fun cancelOrder(request: CancellationRequest, cancellationListener: CancellationListener)
```
Cancela um pagamento.

##### retrieveOrders()
```kotlin
fun retrieveOrders(pageSize: Int, page: Int): ResultOrders
```
Recupera lista de pedidos paginada.

##### findOrderById()
```kotlin
fun findOrderById(orderId: String): Order
```
Busca um pedido por ID.

##### retrieveEnabledProducts()
```kotlin
fun retrieveEnabledProducts(): List<PaymentCode>
```
Recupera lista de métodos de pagamento habilitados.

##### retrievePaymentType()
```kotlin
fun retrievePaymentType(context: Context): List<PrimaryProduct>
```
Recupera tipos de pagamento disponíveis.

##### refreshOrdersFromServer()
```kotlin
fun refreshOrdersFromServer()
```
Atualiza pedidos do servidor.

### PrinterManager

#### Construtor
```kotlin
PrinterManager(context: Context)
```

#### Métodos

##### printText()
```kotlin
fun printText(text: String, styles: List<Map<String, Int>>, printerListener: PrinterListener)
```
Imprime texto com formatação.

##### printImage()
```kotlin
fun printImage(bitmap: Bitmap, styles: List<Map<String, Int>>, printerListener: PrinterListener)
```
Imprime imagem.

### InfoManager

#### Construtor
```kotlin
InfoManager()
```

#### Métodos

##### getBatteryLevel()
```kotlin
fun getBatteryLevel(context: Context): Float
```
Retorna nível de bateria (0.0 a 1.0).

##### getDeviceModel()
```kotlin
fun getDeviceModel(): DeviceModel
```
Retorna modelo do dispositivo.

##### getSettings()
```kotlin
fun getSettings(context: Context): Settings
```
Retorna configurações do terminal.

## 📊 Estruturas de Dados

### OrderRequest (Deep Link)

```kotlin
data class OrderRequest(
    val clientID: String,           // Obrigatório
    val accessToken: String,        // Obrigatório
    val value: Long,                // Obrigatório
    val paymentCode: String?,       // Opcional
    val installments: Int,          // Opcional
    val email: String?,             // Opcional
    val merchantCode: String?,      // Opcional
    val reference: String?,         // Opcional
    val items: MutableList<Item>,   // Obrigatório
    val subAcquirer: SubAcquirer?   // Opcional
)
```

### Item

```kotlin
data class Item(
    val sku: String,                // Código do produto
    val name: String,               // Nome do produto
    val unitPrice: Long,            // Preço unitário em centavos
    val quantity: Int,              // Quantidade
    val unitOfMeasure: String       // Unidade de medida
)
```

### SubAcquirer

```kotlin
data class SubAcquirer(
    val softDescriptor: String,
    val terminalId: String,
    val merchantCode: String,
    val city: String,
    val telephone: String,
    val state: String,
    val postalCode: String,
    val address: String,
    val identifier: String,
    val merchantCategoryCode: String,
    val countryCode: String,
    val informationType: String,
    val document: String,
    val businessName: String
)
```

### CancelRequest (Deep Link)

```kotlin
data class CancelRequest(
    val id: String,                 // ID da ordem
    val clientID: String,           // Client ID
    val accessToken: String,        // Access Token
    val cieloCode: String,          // NSU do pagamento
    val authCode: String,           // Código de autorização
    val value: Long                 // Valor a cancelar
)
```

### PrintRequest (Deep Link)

```kotlin
class PrintRequest(
    val operation: String,          // Tipo de operação
    val value: Array<String>,       // Conteúdo a imprimir
    val styles: List<Map<String, Int>> // Estilos de formatação
)
```

### CheckoutRequest (SDK)

```kotlin
class CheckoutRequest private constructor(
    val orderId: String,            // Obrigatório
    val amount: Long,               // Obrigatório
    val ec: String?,                // Opcional
    val installments: Int?,         // Opcional
    val email: String?,             // Opcional
    val paymentCode: PaymentCode?   // Opcional
)
```

### CancellationRequest (SDK)

```kotlin
class CancellationRequest private constructor(
    val orderId: String,            // Obrigatório
    val authCode: String,           // Obrigatório
    val cieloCode: String,          // Obrigatório
    val value: Long,                // Obrigatório
    val ec: String?                 // Opcional
)
```

### Order (SDK)

```kotlin
class Order {
    val id: String
    val reference: String
    val status: OrderStatus
    val price: Long
    val paidAmount: Long
    val pendingAmount: Long
    val items: List<Item>
    val payments: List<Payment>
    val createdAt: String
    val updatedAt: String
    
    fun addItem(sku: String, name: String, unitPrice: Int, quantity: Int, unitOfMeasure: String)
    fun markAsPaid()
}
```

### Payment

```kotlin
class Payment {
    val id: String
    val amount: Long
    val authCode: String
    val cieloCode: String
    val brand: String
    val mask: String
    val installments: Int
    val paymentFields: Map<String, String>
}
```

### Settings

```kotlin
class Settings {
    val merchantCode: String        // Código do estabelecimento
    val logicNumber: String         // Número lógico da LIO
}
```

## 💳 Códigos de Pagamento

### Códigos Principais

| Código | Descrição |
|--------|-----------|
| `DEBITO_AVISTA` | Débito à vista |
| `DEBITO_PAGTO_FATURA_DEBITO` | Débito pagamento fatura |
| `CREDITO_AVISTA` | Crédito à vista |
| `CREDITO_PARCELADO_LOJA` | Crédito parcelado loja |
| `CREDITO_PARCELADO_ADM` | Crédito parcelado administradora |
| `CREDITO_PARCELADO_BNCO` | Crédito parcelado banco |
| `CREDITO_PARCELADO_CLIENTE` | Crédito parcelado cliente |
| `PRE_AUTORIZACAO` | Pré-autorização |
| `PIX` | PIX |

### Códigos de Voucher

| Código | Descrição |
|--------|-----------|
| `VOUCHER_ALIMENTACAO` | Voucher alimentação |
| `VOUCHER_REFEICAO` | Voucher refeição |
| `VOUCHER_AUTOMOTIVO` | Voucher automotivo |
| `VOUCHER_CULTURA` | Voucher cultura |
| `VOUCHER_PEDAGIO` | Voucher pedágio |
| `VOUCHER_BENEFICIOS` | Voucher benefícios |
| `VOUCHER_AUTO` | Voucher automotivo |
| `VOUCHER_CONSULTA_SALDO` | Consulta saldo voucher |
| `VOUCHER_VALE_PEDAGIO` | Vale pedágio |

### Códigos de Crediário

| Código | Descrição |
|--------|-----------|
| `CREDIARIO_VENDA` | Crediário venda |
| `CREDIARIO_SIMULACAO` | Crediário simulação |

### Códigos de Cartão da Loja

| Código | Descrição |
|--------|-----------|
| `CARTAO_LOJA_AVISTA` | Cartão da loja à vista |
| `CARTAO_LOJA_PARCELADO_LOJA` | Cartão da loja parcelado |
| `CARTAO_LOJA_PARCELADO` | Cartão da loja parcelado |
| `CARTAO_LOJA_PARCELADO_BANCO` | Cartão da loja parcelado banco |
| `CARTAO_LOJA_PAGTO_FATURA_CHEQUE` | Cartão da loja pagamento fatura cheque |
| `CARTAO_LOJA_PAGTO_FATURA_DINHEIRO` | Cartão da loja pagamento fatura dinheiro |

### Outros Códigos

| Código | Descrição |
|--------|-----------|
| `FROTAS` | Frotas |

## 📊 Códigos de Status

### Status de Transação

| Código | Descrição |
|--------|-----------|
| `0` | PIX (apenas pagamentos PIX) |
| `1` | Transação autorizada |
| `2` | Transação cancelada |

### Status de Pedido

| Status | Descrição |
|--------|-----------|
| `DRAFT` | Rascunho |
| `ENTERED` | Liberado para pagamento |
| `PAID` | Pago |
| `CANCELLED` | Cancelado |

## 🖨️ Atributos de Impressão

### Alinhamento

| Valor | Descrição |
|-------|-----------|
| `PrinterAttributes.VAL_ALIGN_LEFT` | Alinhamento à esquerda |
| `PrinterAttributes.VAL_ALIGN_CENTER` | Alinhamento centralizado |
| `PrinterAttributes.VAL_ALIGN_RIGHT` | Alinhamento à direita |

### Tipos de Fonte

| Valor | Descrição |
|-------|-----------|
| `0` | Fonte padrão |
| `1` | Fonte 1 |
| `2` | Fonte 2 |
| `3` | Fonte 3 |
| `4` | Fonte 4 |
| `5` | Fonte 5 |
| `6` | Fonte 6 |
| `7` | Fonte 7 |
| `8` | Fonte 8 |

### Chaves de Atributos

| Chave | Descrição | Tipo |
|-------|-----------|------|
| `PrinterAttributes.KEY_ALIGN` | Alinhamento | Int |
| `PrinterAttributes.KEY_TEXTSIZE` | Tamanho do texto | Int |
| `PrinterAttributes.KEY_TYPEFACE` | Fonte | Int |
| `PrinterAttributes.KEY_MARGINLEFT` | Margem esquerda | Int |
| `PrinterAttributes.KEY_MARGINRIGHT` | Margem direita | Int |
| `PrinterAttributes.KEY_MARGINTOP` | Margem superior | Int |
| `PrinterAttributes.KEY_MARGINBOTTOM` | Margem inferior | Int |
| `PrinterAttributes.KEY_LINESPACE` | Espaçamento entre linhas | Int |
| `PrinterAttributes.KEY_WEIGHT` | Peso da coluna | Int |

## 📱 Modelos de Dispositivo

### DeviceModel

| Valor | Descrição |
|-------|-----------|
| `DeviceModel.LIO_V3` | Cielo LIO V3 |
| `DeviceModel.LIO_V4` | Cielo LIO V4 |
| `DeviceModel.SMART` | Cielo Smart |

## 🔄 Listeners

### PaymentListener

```kotlin
interface PaymentListener {
    fun onStart()
    fun onPayment(order: Order)
    fun onCancel()
    fun onError(paymentError: PaymentError)
}
```

### CancellationListener

```kotlin
interface CancellationListener {
    fun onSuccess(cancelledOrder: Order)
    fun onCancel()
    fun onError(paymentError: PaymentError)
}
```

### PrinterListener

```kotlin
interface PrinterListener {
    fun onPrintSuccess(printedLines: Int)
    fun onError(throwable: Throwable?)
    fun onWithoutPaper()
}
```

### ServiceBindListener

```kotlin
interface ServiceBindListener {
    fun onServiceBound()
    fun onServiceUnbound()
    fun onServiceBoundError(throwable: Throwable)
}
```

## 🚨 Códigos de Erro

### PaymentError

| Código | Descrição |
|--------|-----------|
| `1` | Cancelado pelo usuário |
| `2` | Parâmetros inválidos |
| `3` | Erro de comunicação |
| `4` | Terminal não disponível |
| `5` | Credenciais inválidas |

## 📚 Versões e Compatibilidade

### Versões do SDK

| Versão | Funcionalidades |
|--------|----------------|
| `1.7.1` | Versão atual estável |
| `2.7.2` | Última versão com suporte |

### Compatibilidade de Versões

| Funcionalidade | Versão Cielo LIO | Versão Cielo Mobile |
|----------------|------------------|---------------------|
| createDraftOrder, placeOrder, updateOrder, checkoutOrder básico | 1.10.2 | 1.9.1 |
| retrievePaymentType, checkoutOrder com códigos | 1.12.0 | 1.10.3 |
| retrieveOrders | 1.13.0 | 1.10.5 |
| checkoutOrder com parcelas | 1.14.0 | 1.12.1 |
| cancelOrder | 1.16.7 | 1.12.10 |

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
