# Estruturas de Dados - Cielo LIO

Esta documentação contém todas as estruturas de dados utilizadas na integração com a Cielo LIO.

## 📋 Índice

- [Requisições](#requisições)
- [Respostas](#respostas)
- [Estruturas Auxiliares](#estruturas-auxiliares)
- [Exemplos](#exemplos)

## 📤 Requisições

### OrderRequest (Deep Link)

Estrutura para requisição de pagamento via Deep Link.

```kotlin
data class OrderRequest(
    val clientID: String,           // Obrigatório - ID do cliente
    val accessToken: String,        // Obrigatório - Token de acesso
    val value: Long,                // Obrigatório - Valor em centavos
    val paymentCode: String?,       // Opcional - Código do pagamento
    val installments: Int,          // Opcional - Número de parcelas
    val email: String?,             // Opcional - Email para comprovante
    val merchantCode: String?,      // Opcional - Código do estabelecimento
    val reference: String?,         // Opcional - Referência do pedido
    val items: MutableList<Item>,   // Obrigatório - Lista de itens
    val subAcquirer: SubAcquirer?   // Opcional - Dados do sub-adquirente
)
```

### CancelRequest (Deep Link)

Estrutura para requisição de cancelamento via Deep Link.

```kotlin
data class CancelRequest(
    val id: String,                 // Obrigatório - ID da ordem
    val clientID: String,           // Obrigatório - ID do cliente
    val accessToken: String,        // Obrigatório - Token de acesso
    val cieloCode: String,          // Obrigatório - NSU do pagamento
    val authCode: String,           // Obrigatório - Código de autorização
    val value: Long                 // Obrigatório - Valor a cancelar
)
```

### PrintRequest (Deep Link)

Estrutura para requisição de impressão via Deep Link.

```kotlin
class PrintRequest(
    val operation: String,          // Obrigatório - Tipo de operação
    val value: Array<String>,       // Obrigatório - Conteúdo a imprimir
    val styles: List<Map<String, Int>> // Obrigatório - Estilos de formatação
)
```

### CheckoutRequest (SDK)

Estrutura para requisição de pagamento via SDK.

```kotlin
class CheckoutRequest private constructor(
    val orderId: String,            // Obrigatório - ID do pedido
    val amount: Long,               // Obrigatório - Valor em centavos
    val ec: String?,                // Opcional - Código do estabelecimento
    val installments: Int?,         // Opcional - Número de parcelas
    val email: String?,             // Opcional - Email para comprovante
    val paymentCode: PaymentCode?   // Opcional - Código do pagamento
)
```

### CancellationRequest (SDK)

Estrutura para requisição de cancelamento via SDK.

```kotlin
class CancellationRequest private constructor(
    val orderId: String,            // Obrigatório - ID do pedido
    val authCode: String,           // Obrigatório - Código de autorização
    val cieloCode: String,          // Obrigatório - NSU do pagamento
    val value: Long,                // Obrigatório - Valor a cancelar
    val ec: String?                 // Opcional - Código do estabelecimento
)
```

## 📥 Respostas

### PaymentSuccessResponse

Resposta de sucesso para pagamento.

```kotlin
data class PaymentSuccessResponse(
    val id: String,                 // ID da ordem
    val status: String,             // Status da ordem
    val paidAmount: Long,           // Valor pago em centavos
    val pendingAmount: Long,        // Valor pendente em centavos
    val price: Long,                // Valor total em centavos
    val reference: String,          // Referência do pedido
    val createdAt: String,          // Data de criação
    val updatedAt: String,          // Data de atualização
    val items: List<Item>,          // Lista de itens
    val payments: List<Payment>     // Lista de pagamentos
)
```

### PaymentErrorResponse

Resposta de erro para pagamento.

```kotlin
data class PaymentErrorResponse(
    val code: Int,                  // Código do erro
    val reason: String              // Motivo do erro
)
```

### CancellationSuccessResponse

Resposta de sucesso para cancelamento.

```kotlin
data class CancellationSuccessResponse(
    val id: String,                 // ID da ordem
    val status: String,             // Status da ordem
    val paidAmount: Long,           // Valor pago em centavos
    val pendingAmount: Long,        // Valor pendente em centavos
    val price: Long,                // Valor total em centavos
    val reference: String,          // Referência do pedido
    val createdAt: String,          // Data de criação
    val updatedAt: String,          // Data de atualização
    val items: List<Item>,          // Lista de itens
    val payments: List<Payment>     // Lista de pagamentos
)
```

### CancellationErrorResponse

Resposta de erro para cancelamento.

```kotlin
data class CancellationErrorResponse(
    val code: Int,                  // Código do erro
    val reason: String              // Motivo do erro
)
```

### PrintSuccessResponse

Resposta de sucesso para impressão.

```kotlin
data class PrintSuccessResponse(
    val success: Boolean,           // Indica sucesso
    val message: String?            // Mensagem opcional
)
```

### PrintErrorResponse

Resposta de erro para impressão.

```kotlin
data class PrintErrorResponse(
    val code: Int,                  // Código do erro
    val reason: String              // Motivo do erro
)
```

## 🔧 Estruturas Auxiliares

### Item

Estrutura para item do pedido.

```kotlin
data class Item(
    val sku: String,                // Código do produto
    val name: String,               // Nome do produto
    val unitPrice: Long,            // Preço unitário em centavos
    val quantity: Int,              // Quantidade
    val unitOfMeasure: String       // Unidade de medida
)
```

### Payment

Estrutura para pagamento.

```kotlin
data class Payment(
    val id: String,                 // ID do pagamento
    val amount: Long,               // Valor em centavos
    val authCode: String,           // Código de autorização
    val cieloCode: String,          // NSU
    val brand: String,              // Bandeira do cartão
    val mask: String,               // Máscara do cartão
    val installments: Int,          // Número de parcelas
    val paymentFields: Map<String, String> // Campos adicionais
)
```

### SubAcquirer

Estrutura para sub-adquirente.

```kotlin
data class SubAcquirer(
    val softDescriptor: String,     // Descrição suave
    val terminalId: String,         // ID do terminal
    val merchantCode: String,       // Código do estabelecimento
    val city: String,               // Cidade
    val telephone: String,          // Telefone
    val state: String,              // Estado
    val postalCode: String,         // CEP
    val address: String,            // Endereço
    val identifier: String,         // Identificador
    val merchantCategoryCode: String, // Código da categoria
    val countryCode: String,        // Código do país
    val informationType: String,    // Tipo de informação
    val document: String,           // Documento
    val businessName: String        // Nome da empresa
)
```

### Order (SDK)

Estrutura para pedido no SDK.

```kotlin
class Order {
    val id: String                  // ID do pedido
    val reference: String           // Referência
    val status: OrderStatus         // Status da ordem
    val price: Long                 // Valor total em centavos
    val paidAmount: Long            // Valor pago em centavos
    val pendingAmount: Long         // Valor pendente em centavos
    val items: List<Item>           // Lista de itens
    val payments: List<Payment>     // Lista de pagamentos
    val createdAt: String           // Data de criação
    val updatedAt: String           // Data de atualização
    
    fun addItem(sku: String, name: String, unitPrice: Int, quantity: Int, unitOfMeasure: String)
    fun markAsPaid()
}
```

### Settings

Estrutura para configurações do terminal.

```kotlin
class Settings {
    val merchantCode: String        // Código do estabelecimento
    val logicNumber: String         // Número lógico da LIO
}
```

### DeviceModel

Enum para modelo do dispositivo.

```kotlin
enum class DeviceModel {
    LIO_V3,                        // Cielo LIO V3
    LIO_V4,                        // Cielo LIO V4
    SMART                          // Cielo Smart
}
```

## 💻 Exemplos

### 1. Requisição de Pagamento Completa

```kotlin
val item = Item(
    sku = "PROD001",
    name = "Produto de Teste",
    unitPrice = 1000L, // R$ 10,00
    quantity = 1,
    unitOfMeasure = "unidade"
)

val subAcquirer = SubAcquirer(
    softDescriptor = "LOJA EXEMPLO",
    terminalId = "12345678",
    merchantCode = "0000000000000003",
    city = "São Paulo",
    telephone = "11999999999",
    state = "SP",
    postalCode = "01234567",
    address = "Rua Exemplo, 123",
    identifier = "12345678901",
    merchantCategoryCode = "5999",
    countryCode = "BR",
    informationType = "J",
    document = "12345678000199",
    businessName = "Loja Exemplo Ltda"
)

val request = OrderRequest(
    clientID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
    accessToken = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
    value = 1000L,
    paymentCode = "DEBITO_AVISTA",
    installments = 0,
    email = "cliente@email.com",
    merchantCode = "0000000000000003",
    reference = "PEDIDO_${System.currentTimeMillis()}",
    items = mutableListOf(item),
    subAcquirer = subAcquirer
)
```

### 2. Requisição de Cancelamento

```kotlin
val cancelRequest = CancelRequest(
    id = "ba583f85-9252-48b5-8fed-12719ff058b9",
    clientID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
    accessToken = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
    cieloCode = "799871",
    authCode = "140126",
    value = 1000L
)
```

### 3. Requisição de Impressão

```kotlin
val styles = listOf(
    mapOf(
        PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER,
        PrinterAttributes.KEY_TYPEFACE to 0,
        PrinterAttributes.KEY_TEXT_SIZE to 16
    )
)

val printRequest = PrintRequest(
    operation = "PRINT_TEXT",
    value = arrayOf("Texto para imprimir"),
    styles = styles
)
```

### 4. Processamento de Resposta

```kotlin
fun processPaymentResponse(json: String) {
    try {
        val gson = Gson()
        
        if (json.contains("\"id\"")) {
            // Resposta de sucesso
            val response = gson.fromJson(json, PaymentSuccessResponse::class.java)
            handlePaymentSuccess(response)
        } else {
            // Resposta de erro
            val response = gson.fromJson(json, PaymentErrorResponse::class.java)
            handlePaymentError(response)
        }
    } catch (e: Exception) {
        Log.e("PaymentResponse", "Erro ao processar resposta: ${e.message}")
    }
}

private fun handlePaymentSuccess(response: PaymentSuccessResponse) {
    Log.d("Payment", "Pagamento realizado com sucesso")
    Log.d("Payment", "ID: ${response.id}")
    Log.d("Payment", "Status: ${response.status}")
    Log.d("Payment", "Valor Pago: R$ ${response.paidAmount / 100.0}")
    
    response.payments.forEach { payment ->
        Log.d("Payment", "Código de Autorização: ${payment.authCode}")
        Log.d("Payment", "NSU: ${payment.cieloCode}")
        Log.d("Payment", "Bandeira: ${payment.brand}")
        Log.d("Payment", "Máscara: ${payment.mask}")
    }
}

private fun handlePaymentError(response: PaymentErrorResponse) {
    Log.e("Payment", "Erro no pagamento: ${response.reason}")
    
    when (response.code) {
        1 -> Log.e("Payment", "Cancelado pelo usuário")
        2 -> Log.e("Payment", "Parâmetros inválidos")
        3 -> Log.e("Payment", "Erro de comunicação")
        4 -> Log.e("Payment", "Terminal não disponível")
        5 -> Log.e("Payment", "Credenciais inválidas")
    }
}
```

## 🔧 Utilitários

### 1. Conversão de Valores

```kotlin
object ValueConverter {
    
    fun realToCents(real: Double): Long {
        return (real * 100).toLong()
    }
    
    fun centsToReal(cents: Long): Double {
        return cents / 100.0
    }
    
    fun formatCurrency(cents: Long): String {
        return "R$ ${centsToReal(cents).toString().replace(".", ",")}"
    }
}
```

### 2. Validação de Dados

```kotlin
object DataValidator {
    
    fun validateOrderRequest(request: OrderRequest): ValidationResult {
        val errors = mutableListOf<String>()
        
        if (request.clientID.isBlank()) {
            errors.add("Client ID é obrigatório")
        }
        
        if (request.accessToken.isBlank()) {
            errors.add("Access Token é obrigatório")
        }
        
        if (request.value <= 0) {
            errors.add("Valor deve ser maior que zero")
        }
        
        if (request.items.isEmpty()) {
            errors.add("Pelo menos um item é obrigatório")
        }
        
        request.items.forEachIndexed { index, item ->
            if (item.sku.isBlank()) {
                errors.add("SKU do item ${index + 1} é obrigatório")
            }
            
            if (item.name.isBlank()) {
                errors.add("Nome do item ${index + 1} é obrigatório")
            }
            
            if (item.unitPrice <= 0) {
                errors.add("Preço do item ${index + 1} deve ser maior que zero")
            }
            
            if (item.quantity <= 0) {
                errors.add("Quantidade do item ${index + 1} deve ser maior que zero")
            }
        }
        
        return ValidationResult(
            isValid = errors.isEmpty(),
            errors = errors
        )
    }
}

data class ValidationResult(
    val isValid: Boolean,
    val errors: List<String>
)
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de serialização JSON**
   - Verifique se todos os campos obrigatórios estão preenchidos
   - Confirme se os tipos de dados estão corretos

2. **Erro de codificação Base64**
   - Verifique se o JSON está válido antes da codificação
   - Confirme se a codificação está sendo feita corretamente

3. **Erro de parsing de resposta**
   - Verifique se a resposta está em formato JSON válido
   - Confirme se a estrutura da resposta está correta

### Logs para Debug

```bash
adb logcat | grep -i json
adb logcat | grep -i gson
adb logcat | grep -i base64
```

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
