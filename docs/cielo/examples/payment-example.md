# Exemplo de Pagamento - Cielo LIO

Este exemplo demonstra como implementar pagamentos usando a integração via Deep Link com a Cielo LIO.

## 🎯 Objetivo

Criar um pagamento simples de débito à vista com um produto.

## 📋 Pré-requisitos

- Credenciais da Cielo (Client ID e Access Token)
- Activity de resposta configurada no AndroidManifest.xml
- Permissões necessárias configuradas

## 💻 Implementação

### 1. Estrutura de Dados

```kotlin
data class OrderRequest(
    val clientID: String,
    val accessToken: String,
    val value: Long,
    val paymentCode: String?,
    val installments: Int,
    val email: String?,
    val merchantCode: String?,
    val reference: String?,
    val items: MutableList<Item>,
    val subAcquirer: SubAcquirer? = null
)

data class Item(
    val sku: String,
    val name: String,
    val unitPrice: Long,
    val quantity: Int,
    val unitOfMeasure: String
)
```

### 2. Activity Principal

```kotlin
class PaymentActivity : AppCompatActivity() {
    
    private val CLIENT_ID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN"
    private val ACCESS_TOKEN = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4"
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment)
        
        val payButton = findViewById<Button>(R.id.payButton)
        payButton.setOnClickListener {
            makePayment()
        }
    }
    
    private fun makePayment() {
        // 1. Criar item do pedido
        val item = Item(
            sku = "PROD001",
            name = "Produto de Teste",
            unitPrice = 1000L, // R$ 10,00 em centavos
            quantity = 1,
            unitOfMeasure = "unidade"
        )
        
        // 2. Criar requisição de pagamento
        val request = OrderRequest(
            clientID = CLIENT_ID,
            accessToken = ACCESS_TOKEN,
            value = 1000L, // R$ 10,00 em centavos
            paymentCode = "DEBITO_AVISTA",
            installments = 0,
            email = "cliente@email.com",
            merchantCode = null,
            reference = "PEDIDO_${System.currentTimeMillis()}",
            items = mutableListOf(item)
        )
        
        // 3. Converter para JSON
        val json = Gson().toJson(request)
        
        // 4. Codificar em Base64
        val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
        
        // 5. Criar URI de pagamento
        val checkoutUri = "lio://payment?request=$base64&urlCallback=order://response"
        
        // 6. Executar intent
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(checkoutUri))
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        startActivity(intent)
    }
}
```

### 3. Activity de Resposta

```kotlin
class ResponseActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_response)
        
        handleResponse(intent)
    }
    
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleResponse(intent)
    }
    
    private fun handleResponse(intent: Intent?) {
        if (Intent.ACTION_VIEW == intent?.action) {
            val uri = intent.data
            val response = uri?.getQueryParameter("response")
            
            if (response != null) {
                val data = Base64.decode(response, Base64.DEFAULT)
                val json = String(data)
                
                processPaymentResponse(json)
            }
        }
    }
    
    private fun processPaymentResponse(json: String) {
        try {
            val gson = Gson()
            
            // Verificar se é sucesso ou erro
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
            showError("Erro ao processar resposta do pagamento")
        }
    }
    
    private fun handlePaymentSuccess(response: PaymentSuccessResponse) {
        runOnUiThread {
            val message = """
                Pagamento realizado com sucesso!
                
                ID: ${response.id}
                Status: ${response.status}
                Valor Pago: R$ ${response.paidAmount / 100.0}
                
                Pagamento:
                - Código de Autorização: ${response.payments[0].authCode}
                - NSU: ${response.payments[0].cieloCode}
                - Bandeira: ${response.payments[0].brand}
                - Máscara: ${response.payments[0].mask}
            """.trimIndent()
            
            showSuccess(message)
        }
    }
    
    private fun handlePaymentError(response: PaymentErrorResponse) {
        runOnUiThread {
            val message = when (response.code) {
                1 -> "Pagamento cancelado pelo usuário"
                2 -> "Parâmetros inválidos: ${response.reason}"
                else -> "Erro no pagamento: ${response.reason}"
            }
            
            showError(message)
        }
    }
    
    private fun showSuccess(message: String) {
        AlertDialog.Builder(this)
            .setTitle("Sucesso")
            .setMessage(message)
            .setPositiveButton("OK") { _, _ ->
                finish()
            }
            .show()
    }
    
    private fun showError(message: String) {
        AlertDialog.Builder(this)
            .setTitle("Erro")
            .setMessage(message)
            .setPositiveButton("OK") { _, _ ->
                finish()
            }
            .show()
    }
}
```

### 4. Estruturas de Resposta

```kotlin
data class PaymentSuccessResponse(
    val id: String,
    val status: String,
    val paidAmount: Long,
    val payments: List<Payment>
)

data class Payment(
    val authCode: String,
    val cieloCode: String,
    val brand: String,
    val mask: String,
    val amount: Long
)

data class PaymentErrorResponse(
    val code: Int,
    val reason: String
)
```

### 5. AndroidManifest.xml

```xml
<activity
    android:name=".ResponseActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <data
            android:host="response"
            android:scheme="order" />
    </intent-filter>
</activity>

<!-- Meta-data para Cielo Smart -->
<meta-data
    android:name="cs_integration_type"
    android:value="uri" />
```

### 6. Layout da Activity Principal

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Pagamento Cielo LIO"
        android:textSize="24sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="32dp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Produto: Produto de Teste"
        android:textSize="16sp"
        android:layout_marginBottom="8dp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Valor: R$ 10,00"
        android:textSize="16sp"
        android:layout_marginBottom="8dp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Forma de Pagamento: Débito à Vista"
        android:textSize="16sp"
        android:layout_marginBottom="32dp" />

    <Button
        android:id="@+id/payButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Pagar"
        android:textSize="18sp"
        android:padding="16dp" />

</LinearLayout>
```

### 7. Layout da Activity de Resposta

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:gravity="center">

    <ProgressBar
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="16dp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Processando pagamento..."
        android:textSize="16sp"
        android:gravity="center" />

</LinearLayout>
```

## 🧪 Testando o Exemplo

### 1. Configuração

1. Substitua `SEU_CLIENT_ID` e `SEU_ACCESS_TOKEN` pelas suas credenciais
2. Configure o AndroidManifest.xml conforme mostrado
3. Compile e instale o app

### 2. Execução

1. Abra o app
2. Clique no botão "Pagar"
3. O app da Cielo LIO será aberto
4. Realize o pagamento no terminal
5. O app retornará com o resultado

### 3. Resultados Esperados

**Sucesso:**
- Dialog com informações do pagamento
- Código de autorização
- NSU da transação
- Bandeira do cartão

**Erro:**
- Dialog com mensagem de erro
- Código do erro
- Motivo do erro

## 🔧 Personalizações

### 1. Múltiplos Itens

```kotlin
val items = mutableListOf(
    Item("PROD001", "Produto 1", 1000L, 1, "unidade"),
    Item("PROD002", "Produto 2", 2000L, 2, "unidade")
)

val totalValue = items.sumOf { it.unitPrice * it.quantity }
```

### 2. Diferentes Formas de Pagamento

```kotlin
// Crédito à vista
paymentCode = "CREDITO_AVISTA"

// Crédito parcelado loja
paymentCode = "CREDITO_PARCELADO_LOJA"
installments = 3

// PIX
paymentCode = "PIX"
```

### 3. Email para Comprovante

```kotlin
email = "cliente@email.com"
```

### 4. Referência Personalizada

```kotlin
reference = "PEDIDO_${System.currentTimeMillis()}_${Random.nextInt(1000, 9999)}"
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **App não retorna após pagamento**
   - Verifique se o `urlCallback` está correto
   - Confirme se a ResponseActivity está registrada

2. **Erro de credenciais**
   - Verifique se Client ID e Access Token estão corretos
   - Confirme se as credenciais estão ativas

3. **Pagamento não é processado**
   - Verifique se o JSON está em formato correto
   - Confirme se o valor está em centavos

### Logs para Debug

```bash
adb logcat | grep -i cielo
adb logcat | grep -i payment
adb logcat | grep -i lio
```

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
