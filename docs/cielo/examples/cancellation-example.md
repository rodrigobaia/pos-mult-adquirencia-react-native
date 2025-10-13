# Exemplo de Cancelamento - Cielo LIO

Este exemplo demonstra como implementar cancelamento de pagamentos usando a integração via Deep Link com a Cielo LIO.

## 🎯 Objetivo

Cancelar um pagamento previamente realizado.

## ⚠️ Importante

- **PIX**: Não é possível cancelar pagamentos PIX via integração
- **Cancelamento Total**: Apenas cancelamento total é suportado via integração
- **Cancelamento Parcial**: Deve ser feito diretamente na interface da LIO

## 📋 Pré-requisitos

- Pagamento previamente realizado
- Credenciais da Cielo (Client ID e Access Token)
- Activity de resposta configurada no AndroidManifest.xml
- Dados do pagamento original (ID, NSU, Código de Autorização)

## 💻 Implementação

### 1. Estrutura de Dados

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

### 2. Activity de Cancelamento

```kotlin
class CancellationActivity : AppCompatActivity() {
    
    private val CLIENT_ID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN"
    private val ACCESS_TOKEN = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4"
    
    // Dados do pagamento original (obtidos do pagamento anterior)
    private var originalOrderId: String? = null
    private var originalCieloCode: String? = null
    private var originalAuthCode: String? = null
    private var originalAmount: Long? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cancellation)
        
        // Obter dados do pagamento original
        loadPaymentData()
        
        val cancelButton = findViewById<Button>(R.id.cancelButton)
        cancelButton.setOnClickListener {
            cancelPayment()
        }
    }
    
    private fun loadPaymentData() {
        // Em um app real, estes dados viriam do banco de dados
        // ou de uma transação anterior
        originalOrderId = "ba583f85-9252-48b5-8fed-12719ff058b9"
        originalCieloCode = "799871"
        originalAuthCode = "140126"
        originalAmount = 1000L // R$ 10,00 em centavos
        
        updateUI()
    }
    
    private fun updateUI() {
        val orderIdText = findViewById<TextView>(R.id.orderIdText)
        val cieloCodeText = findViewById<TextView>(R.id.cieloCodeText)
        val authCodeText = findViewById<TextView>(R.id.authCodeText)
        val amountText = findViewById<TextView>(R.id.amountText)
        
        orderIdText.text = "ID do Pedido: $originalOrderId"
        cieloCodeText.text = "NSU: $originalCieloCode"
        authCodeText.text = "Código de Autorização: $originalAuthCode"
        amountText.text = "Valor: R$ ${originalAmount?.div(100.0)}"
    }
    
    private fun cancelPayment() {
        if (originalOrderId == null || originalCieloCode == null || 
            originalAuthCode == null || originalAmount == null) {
            showError("Dados do pagamento não encontrados")
            return
        }
        
        // 1. Criar requisição de cancelamento
        val request = CancelRequest(
            id = originalOrderId!!,
            clientID = CLIENT_ID,
            accessToken = ACCESS_TOKEN,
            cieloCode = originalCieloCode!!,
            authCode = originalAuthCode!!,
            value = originalAmount!!
        )
        
        // 2. Converter para JSON
        val json = Gson().toJson(request)
        
        // 3. Codificar em Base64
        val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
        
        // 4. Criar URI de cancelamento
        val cancelUri = "lio://payment-reversal?request=$base64&urlCallback=order://response"
        
        // 5. Executar intent
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(cancelUri))
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        startActivity(intent)
    }
    
    private fun showError(message: String) {
        AlertDialog.Builder(this)
            .setTitle("Erro")
            .setMessage(message)
            .setPositiveButton("OK", null)
            .show()
    }
}
```

### 3. Activity de Resposta (Reutilizada)

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
                
                processCancellationResponse(json)
            }
        }
    }
    
    private fun processCancellationResponse(json: String) {
        try {
            val gson = Gson()
            
            // Verificar se é sucesso ou erro
            if (json.contains("\"id\"")) {
                // Resposta de sucesso
                val response = gson.fromJson(json, CancellationSuccessResponse::class.java)
                handleCancellationSuccess(response)
            } else {
                // Resposta de erro
                val response = gson.fromJson(json, CancellationErrorResponse::class.java)
                handleCancellationError(response)
            }
        } catch (e: Exception) {
            Log.e("CancellationResponse", "Erro ao processar resposta: ${e.message}")
            showError("Erro ao processar resposta do cancelamento")
        }
    }
    
    private fun handleCancellationSuccess(response: CancellationSuccessResponse) {
        runOnUiThread {
            val message = """
                Cancelamento realizado com sucesso!
                
                ID: ${response.id}
                Status: ${response.status}
                Valor Cancelado: R$ ${response.paidAmount / 100.0}
                
                Cancelamento:
                - Código de Autorização: ${response.payments.lastOrNull()?.authCode}
                - NSU: ${response.payments.lastOrNull()?.cieloCode}
                - Status Code: ${response.payments.lastOrNull()?.paymentFields?.get("statusCode")}
            """.trimIndent()
            
            showSuccess(message)
        }
    }
    
    private fun handleCancellationError(response: CancellationErrorResponse) {
        runOnUiThread {
            val message = when (response.code) {
                1 -> "Cancelamento cancelado pelo usuário"
                2 -> "Parâmetros inválidos: ${response.reason}"
                3 -> "Pagamento não encontrado"
                4 -> "Cancelamento não permitido"
                else -> "Erro no cancelamento: ${response.reason}"
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
data class CancellationSuccessResponse(
    val id: String,
    val status: String,
    val paidAmount: Long,
    val payments: List<CancellationPayment>
)

data class CancellationPayment(
    val authCode: String,
    val cieloCode: String,
    val amount: Long,
    val paymentFields: Map<String, String>
)

data class CancellationErrorResponse(
    val code: Int,
    val reason: String
)
```

### 5. Layout da Activity de Cancelamento

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
        android:text="Cancelamento de Pagamento"
        android:textSize="24sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="32dp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Dados do Pagamento Original:"
        android:textSize="18sp"
        android:textStyle="bold"
        android:layout_marginBottom="16dp" />

    <TextView
        android:id="@+id/orderIdText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="ID do Pedido: -"
        android:textSize="14sp"
        android:layout_marginBottom="8dp" />

    <TextView
        android:id="@+id/cieloCodeText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="NSU: -"
        android:textSize="14sp"
        android:layout_marginBottom="8dp" />

    <TextView
        android:id="@+id/authCodeText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Código de Autorização: -"
        android:textSize="14sp"
        android:layout_marginBottom="8dp" />

    <TextView
        android:id="@+id/amountText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Valor: -"
        android:textSize="14sp"
        android:layout_marginBottom="32dp" />

    <Button
        android:id="@+id/cancelButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Cancelar Pagamento"
        android:textSize="18sp"
        android:padding="16dp"
        android:backgroundTint="@android:color/holo_red_dark" />

</LinearLayout>
```

## 🧪 Testando o Exemplo

### 1. Configuração

1. Substitua `SEU_CLIENT_ID` e `SEU_ACCESS_TOKEN` pelas suas credenciais
2. Configure os dados do pagamento original
3. Compile e instale o app

### 2. Execução

1. Abra o app
2. Verifique os dados do pagamento original
3. Clique no botão "Cancelar Pagamento"
4. O app da Cielo LIO será aberto
5. Confirme o cancelamento no terminal
6. O app retornará com o resultado

### 3. Resultados Esperados

**Sucesso:**
- Dialog com informações do cancelamento
- Status do cancelamento
- Valor cancelado
- Códigos de autorização

**Erro:**
- Dialog com mensagem de erro
- Código do erro
- Motivo do erro

## 🔧 Integração com Lista de Pagamentos

### 1. Activity de Lista de Pagamentos

```kotlin
class PaymentListActivity : AppCompatActivity() {
    
    private lateinit var paymentAdapter: PaymentAdapter
    private val payments = mutableListOf<PaymentData>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment_list)
        
        setupRecyclerView()
        loadPayments()
    }
    
    private fun setupRecyclerView() {
        val recyclerView = findViewById<RecyclerView>(R.id.recyclerView)
        paymentAdapter = PaymentAdapter(payments) { payment ->
            openCancellationActivity(payment)
        }
        recyclerView.adapter = paymentAdapter
        recyclerView.layoutManager = LinearLayoutManager(this)
    }
    
    private fun loadPayments() {
        // Carregar pagamentos do banco de dados
        // Em um app real, estes dados viriam de uma API ou banco local
        payments.addAll(getPaymentsFromDatabase())
        paymentAdapter.notifyDataSetChanged()
    }
    
    private fun openCancellationActivity(payment: PaymentData) {
        val intent = Intent(this, CancellationActivity::class.java).apply {
            putExtra("orderId", payment.orderId)
            putExtra("cieloCode", payment.cieloCode)
            putExtra("authCode", payment.authCode)
            putExtra("amount", payment.amount)
        }
        startActivity(intent)
    }
}
```

### 2. Adapter para Lista

```kotlin
class PaymentAdapter(
    private val payments: List<PaymentData>,
    private val onItemClick: (PaymentData) -> Unit
) : RecyclerView.Adapter<PaymentAdapter.ViewHolder>() {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_payment, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val payment = payments[position]
        holder.bind(payment)
    }
    
    override fun getItemCount() = payments.size
    
    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        fun bind(payment: PaymentData) {
            itemView.findViewById<TextView>(R.id.orderIdText).text = payment.orderId
            itemView.findViewById<TextView>(R.id.amountText).text = "R$ ${payment.amount / 100.0}"
            itemView.findViewById<TextView>(R.id.dateText).text = payment.date
            itemView.findViewById<TextView>(R.id.statusText).text = payment.status
            
            itemView.setOnClickListener {
                onItemClick(payment)
            }
        }
    }
}
```

### 3. Estrutura de Dados do Pagamento

```kotlin
data class PaymentData(
    val orderId: String,
    val cieloCode: String,
    val authCode: String,
    val amount: Long,
    val date: String,
    val status: String,
    val brand: String? = null,
    val mask: String? = null
)
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Cancelamento não permitido**
   - Verifique se o pagamento não é PIX
   - Confirme se o pagamento não foi cancelado anteriormente
   - Verifique se o tempo limite para cancelamento não expirou

2. **Dados do pagamento não encontrados**
   - Verifique se o ID da ordem está correto
   - Confirme se o NSU e código de autorização estão corretos
   - Verifique se o valor corresponde ao pagamento original

3. **Erro de credenciais**
   - Verifique se Client ID e Access Token estão corretos
   - Confirme se as credenciais têm permissão para cancelamento

### Logs para Debug

```bash
adb logcat | grep -i cielo
adb logcat | grep -i cancellation
adb logcat | grep -i reversal
```

## 📚 Próximos Passos

- [Exemplo de Pagamento](./payment-example.md)
- [Exemplo de Impressão](./printing-example.md)
- [Exemplo Completo](./complete-example.md)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
