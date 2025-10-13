# Exemplo Completo - Cielo LIO

Este exemplo demonstra uma implementação completa de integração com a Cielo LIO, incluindo pagamentos, cancelamentos e impressão.

## 🎯 Objetivo

Criar um aplicativo completo que demonstra todas as funcionalidades de integração com a Cielo LIO.

## 📋 Funcionalidades

- ✅ Pagamentos (débito, crédito, PIX)
- ✅ Cancelamentos
- ✅ Impressão de textos e imagens
- ✅ Listagem de transações
- ✅ Gerenciamento de pedidos
- ✅ Interface completa

## 🏗️ Estrutura do Projeto

```
app/
├── src/main/
│   ├── java/com/example/cielolio/
│   │   ├── MainActivity.kt
│   │   ├── activities/
│   │   │   ├── PaymentActivity.kt
│   │   │   ├── CancellationActivity.kt
│   │   │   ├── PrintingActivity.kt
│   │   │   ├── TransactionListActivity.kt
│   │   │   └── ResponseActivity.kt
│   │   ├── models/
│   │   │   ├── OrderRequest.kt
│   │   │   ├── CancelRequest.kt
│   │   │   ├── PrintRequest.kt
│   │   │   └── Transaction.kt
│   │   ├── utils/
│   │   │   ├── CieloUtils.kt
│   │   │   └── PrintStyles.kt
│   │   └── database/
│   │       └── TransactionDatabase.kt
│   ├── res/
│   │   ├── layout/
│   │   ├── values/
│   │   └── drawable/
│   └── AndroidManifest.xml
```

## 💻 Implementação

### 1. MainActivity

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        setupButtons()
    }
    
    private fun setupButtons() {
        findViewById<Button>(R.id.paymentButton).setOnClickListener {
            startActivity(Intent(this, PaymentActivity::class.java))
        }
        
        findViewById<Button>(R.id.cancellationButton).setOnClickListener {
            startActivity(Intent(this, CancellationActivity::class.java))
        }
        
        findViewById<Button>(R.id.printingButton).setOnClickListener {
            startActivity(Intent(this, PrintingActivity::class.java))
        }
        
        findViewById<Button>(R.id.transactionsButton).setOnClickListener {
            startActivity(Intent(this, TransactionListActivity::class.java))
        }
    }
}
```

### 2. PaymentActivity

```kotlin
class PaymentActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityPaymentBinding
    private val transactionDatabase = TransactionDatabase(this)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupUI()
    }
    
    private fun setupUI() {
        // Configurar spinner de formas de pagamento
        val paymentMethods = arrayOf(
            "DEBITO_AVISTA",
            "CREDITO_AVISTA",
            "CREDITO_PARCELADO_LOJA",
            "PIX"
        )
        
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, paymentMethods)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.paymentMethodSpinner.adapter = adapter
        
        // Configurar spinner de parcelas
        val installments = (0..12).toList()
        val installmentsAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, installments)
        installmentsAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.installmentsSpinner.adapter = installmentsAdapter
        
        binding.payButton.setOnClickListener {
            processPayment()
        }
    }
    
    private fun processPayment() {
        val amount = binding.amountEditText.text.toString().toDoubleOrNull()
        val email = binding.emailEditText.text.toString()
        val paymentMethod = binding.paymentMethodSpinner.selectedItem.toString()
        val installments = binding.installmentsSpinner.selectedItem as Int
        
        if (amount == null || amount <= 0) {
            showError("Valor inválido")
            return
        }
        
        val amountInCents = (amount * 100).toLong()
        
        // Criar item do pedido
        val item = Item(
            sku = "PROD_${System.currentTimeMillis()}",
            name = "Produto de Teste",
            unitPrice = amountInCents,
            quantity = 1,
            unitOfMeasure = "unidade"
        )
        
        // Criar requisição de pagamento
        val request = OrderRequest(
            clientID = BuildConfig.CREDENTIALS_CLIENT_ID,
            accessToken = BuildConfig.CREDENTIALS_ACCESS_TOKEN,
            value = amountInCents,
            paymentCode = paymentMethod,
            installments = installments,
            email = email.ifEmpty { null },
            merchantCode = null,
            reference = "PEDIDO_${System.currentTimeMillis()}",
            items = mutableListOf(item)
        )
        
        // Salvar transação no banco local
        val transaction = Transaction(
            id = UUID.randomUUID().toString(),
            orderId = request.reference,
            amount = amountInCents,
            paymentMethod = paymentMethod,
            installments = installments,
            email = email,
            status = "PENDING",
            createdAt = System.currentTimeMillis()
        )
        
        transactionDatabase.insertTransaction(transaction)
        
        // Executar pagamento
        CieloUtils.executePayment(this, request)
    }
    
    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}
```

### 3. TransactionListActivity

```kotlin
class TransactionListActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityTransactionListBinding
    private lateinit var transactionAdapter: TransactionAdapter
    private val transactionDatabase = TransactionDatabase(this)
    private val transactions = mutableListOf<Transaction>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTransactionListBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupRecyclerView()
        loadTransactions()
    }
    
    private fun setupRecyclerView() {
        transactionAdapter = TransactionAdapter(transactions) { transaction ->
            openTransactionDetails(transaction)
        }
        
        binding.recyclerView.apply {
            adapter = transactionAdapter
            layoutManager = LinearLayoutManager(this@TransactionListActivity)
        }
    }
    
    private fun loadTransactions() {
        transactions.clear()
        transactions.addAll(transactionDatabase.getAllTransactions())
        transactionAdapter.notifyDataSetChanged()
    }
    
    private fun openTransactionDetails(transaction: Transaction) {
        val intent = Intent(this, TransactionDetailsActivity::class.java).apply {
            putExtra("transaction", transaction)
        }
        startActivity(intent)
    }
    
    override fun onResume() {
        super.onResume()
        loadTransactions()
    }
}
```

### 4. TransactionAdapter

```kotlin
class TransactionAdapter(
    private val transactions: List<Transaction>,
    private val onItemClick: (Transaction) -> Unit
) : RecyclerView.Adapter<TransactionAdapter.ViewHolder>() {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_transaction, parent, false)
        return ViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(transactions[position])
    }
    
    override fun getItemCount() = transactions.size
    
    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        fun bind(transaction: Transaction) {
            itemView.findViewById<TextView>(R.id.orderIdText).text = transaction.orderId
            itemView.findViewById<TextView>(R.id.amountText).text = "R$ ${transaction.amount / 100.0}"
            itemView.findViewById<TextView>(R.id.paymentMethodText).text = transaction.paymentMethod
            itemView.findViewById<TextView>(R.id.statusText).text = transaction.status
            itemView.findViewById<TextView>(R.id.dateText).text = 
                SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                    .format(Date(transaction.createdAt))
            
            // Configurar cor do status
            val statusText = itemView.findViewById<TextView>(R.id.statusText)
            when (transaction.status) {
                "SUCCESS" -> statusText.setTextColor(ContextCompat.getColor(itemView.context, android.R.color.holo_green_dark))
                "CANCELLED" -> statusText.setTextColor(ContextCompat.getColor(itemView.context, android.R.color.holo_red_dark))
                "PENDING" -> statusText.setTextColor(ContextCompat.getColor(itemView.context, android.R.color.holo_orange_dark))
            }
            
            itemView.setOnClickListener {
                onItemClick(transaction)
            }
        }
    }
}
```

### 5. TransactionDetailsActivity

```kotlin
class TransactionDetailsActivity : AppCompatActivity() {
    
    private lateinit var transaction: Transaction
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_transaction_details)
        
        transaction = intent.getSerializableExtra("transaction") as Transaction
        
        setupUI()
    }
    
    private fun setupUI() {
        findViewById<TextView>(R.id.orderIdText).text = transaction.orderId
        findViewById<TextView>(R.id.amountText).text = "R$ ${transaction.amount / 100.0}"
        findViewById<TextView>(R.id.paymentMethodText).text = transaction.paymentMethod
        findViewById<TextView>(R.id.installmentsText).text = transaction.installments.toString()
        findViewById<TextView>(R.id.emailText).text = transaction.email ?: "Não informado"
        findViewById<TextView>(R.id.statusText).text = transaction.status
        findViewById<TextView>(R.id.dateText).text = 
            SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault())
                .format(Date(transaction.createdAt))
        
        // Configurar botões baseado no status
        when (transaction.status) {
            "SUCCESS" -> {
                findViewById<Button>(R.id.cancelButton).isEnabled = true
                findViewById<Button>(R.id.printButton).isEnabled = true
            }
            "CANCELLED" -> {
                findViewById<Button>(R.id.cancelButton).isEnabled = false
                findViewById<Button>(R.id.printButton).isEnabled = true
            }
            "PENDING" -> {
                findViewById<Button>(R.id.cancelButton).isEnabled = false
                findViewById<Button>(R.id.printButton).isEnabled = false
            }
        }
        
        findViewById<Button>(R.id.cancelButton).setOnClickListener {
            cancelTransaction()
        }
        
        findViewById<Button>(R.id.printButton).setOnClickListener {
            printReceipt()
        }
    }
    
    private fun cancelTransaction() {
        if (transaction.paymentMethod == "PIX") {
            showError("Cancelamento de PIX não é suportado via integração")
            return
        }
        
        // Implementar cancelamento
        val cancelRequest = CancelRequest(
            id = transaction.orderId,
            clientID = BuildConfig.CREDENTIALS_CLIENT_ID,
            accessToken = BuildConfig.CREDENTIALS_ACCESS_TOKEN,
            cieloCode = transaction.cieloCode ?: "",
            authCode = transaction.authCode ?: "",
            value = transaction.amount
        )
        
        CieloUtils.executeCancellation(this, cancelRequest)
    }
    
    private fun printReceipt() {
        val receipt = buildReceipt()
        CieloUtils.executePrint(this, receipt)
    }
    
    private fun buildReceipt(): String {
        return """
            LOJA EXEMPLO LTDA
            CNPJ: 12.345.678/0001-90
            Rua Exemplo, 123
            Cidade - Estado
            
            ================================
            
            CUPOM FISCAL
            
            Pedido: ${transaction.orderId}
            Data: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date(transaction.createdAt))}
            
            Produto: Produto de Teste
            Quantidade: 1
            Valor Unitário: R$ ${transaction.amount / 100.0}
            
            ================================
            
            TOTAL: R$ ${transaction.amount / 100.0}
            
            Forma de Pagamento: ${transaction.paymentMethod}
            Parcelas: ${transaction.installments}
            
            ================================
            
            Status: ${transaction.status}
            
            Obrigado pela preferência!
            
            
        """.trimIndent()
    }
    
    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}
```

### 6. CieloUtils

```kotlin
object CieloUtils {
    
    private const val CALLBACK_URL = "order://response"
    
    fun executePayment(context: Context, request: OrderRequest) {
        try {
            val json = Gson().toJson(request)
            val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
            val paymentUri = "lio://payment?request=$base64&urlCallback=$CALLBACK_URL"
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(paymentUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            context.startActivity(intent)
            
        } catch (e: Exception) {
            Log.e("CieloUtils", "Erro ao executar pagamento: ${e.message}")
        }
    }
    
    fun executeCancellation(context: Context, request: CancelRequest) {
        try {
            val json = Gson().toJson(request)
            val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
            val cancelUri = "lio://payment-reversal?request=$base64&urlCallback=$CALLBACK_URL"
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(cancelUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            context.startActivity(intent)
            
        } catch (e: Exception) {
            Log.e("CieloUtils", "Erro ao executar cancelamento: ${e.message}")
        }
    }
    
    fun executePrint(context: Context, text: String) {
        try {
            val styles = listOf(
                mapOf(
                    PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER,
                    PrinterAttributes.KEY_TYPEFACE to 0,
                    PrinterAttributes.KEY_TEXT_SIZE to 16
                )
            )
            
            val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
            val json = Gson().toJson(request)
            val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
            val printUri = "lio://print?request=$base64&urlCallback=$CALLBACK_URL"
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(printUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            context.startActivity(intent)
            
        } catch (e: Exception) {
            Log.e("CieloUtils", "Erro ao executar impressão: ${e.message}")
        }
    }
}
```

### 7. TransactionDatabase

```kotlin
class TransactionDatabase(context: Context) {
    
    private val dbHelper = TransactionDbHelper(context)
    
    fun insertTransaction(transaction: Transaction) {
        val db = dbHelper.writableDatabase
        val values = ContentValues().apply {
            put(TransactionContract.TransactionEntry.COLUMN_ID, transaction.id)
            put(TransactionContract.TransactionEntry.COLUMN_ORDER_ID, transaction.orderId)
            put(TransactionContract.TransactionEntry.COLUMN_AMOUNT, transaction.amount)
            put(TransactionContract.TransactionEntry.COLUMN_PAYMENT_METHOD, transaction.paymentMethod)
            put(TransactionContract.TransactionEntry.COLUMN_INSTALLMENTS, transaction.installments)
            put(TransactionContract.TransactionEntry.COLUMN_EMAIL, transaction.email)
            put(TransactionContract.TransactionEntry.COLUMN_STATUS, transaction.status)
            put(TransactionContract.TransactionEntry.COLUMN_CIELO_CODE, transaction.cieloCode)
            put(TransactionContract.TransactionEntry.COLUMN_AUTH_CODE, transaction.authCode)
            put(TransactionContract.TransactionEntry.COLUMN_CREATED_AT, transaction.createdAt)
        }
        
        db.insert(TransactionContract.TransactionEntry.TABLE_NAME, null, values)
    }
    
    fun updateTransaction(transaction: Transaction) {
        val db = dbHelper.writableDatabase
        val values = ContentValues().apply {
            put(TransactionContract.TransactionEntry.COLUMN_STATUS, transaction.status)
            put(TransactionContract.TransactionEntry.COLUMN_CIELO_CODE, transaction.cieloCode)
            put(TransactionContract.TransactionEntry.COLUMN_AUTH_CODE, transaction.authCode)
        }
        
        val selection = "${TransactionContract.TransactionEntry.COLUMN_ID} = ?"
        val selectionArgs = arrayOf(transaction.id)
        
        db.update(TransactionContract.TransactionEntry.TABLE_NAME, values, selection, selectionArgs)
    }
    
    fun getAllTransactions(): List<Transaction> {
        val db = dbHelper.readableDatabase
        val projection = arrayOf(
            TransactionContract.TransactionEntry.COLUMN_ID,
            TransactionContract.TransactionEntry.COLUMN_ORDER_ID,
            TransactionContract.TransactionEntry.COLUMN_AMOUNT,
            TransactionContract.TransactionEntry.COLUMN_PAYMENT_METHOD,
            TransactionContract.TransactionEntry.COLUMN_INSTALLMENTS,
            TransactionContract.TransactionEntry.COLUMN_EMAIL,
            TransactionContract.TransactionEntry.COLUMN_STATUS,
            TransactionContract.TransactionEntry.COLUMN_CIELO_CODE,
            TransactionContract.TransactionEntry.COLUMN_AUTH_CODE,
            TransactionContract.TransactionEntry.COLUMN_CREATED_AT
        )
        
        val cursor = db.query(
            TransactionContract.TransactionEntry.TABLE_NAME,
            projection,
            null,
            null,
            null,
            null,
            "${TransactionContract.TransactionEntry.COLUMN_CREATED_AT} DESC"
        )
        
        val transactions = mutableListOf<Transaction>()
        while (cursor.moveToNext()) {
            val transaction = Transaction(
                id = cursor.getString(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_ID)),
                orderId = cursor.getString(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_ORDER_ID)),
                amount = cursor.getLong(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_AMOUNT)),
                paymentMethod = cursor.getString(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_PAYMENT_METHOD)),
                installments = cursor.getInt(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_INSTALLMENTS)),
                email = cursor.getString(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_EMAIL)),
                status = cursor.getString(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_STATUS)),
                cieloCode = cursor.getString(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_CIELO_CODE)),
                authCode = cursor.getString(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_AUTH_CODE)),
                createdAt = cursor.getLong(cursor.getColumnIndexOrThrow(TransactionContract.TransactionEntry.COLUMN_CREATED_AT))
            )
            transactions.add(transaction)
        }
        cursor.close()
        
        return transactions
    }
}
```

### 8. AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />

    <application
        android:name=".MyApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <!-- Activity principal -->
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <!-- Activity de resposta -->
        <activity
            android:name=".activities.ResponseActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data
                    android:host="response"
                    android:scheme="order" />
            </intent-filter>
        </activity>
        
        <!-- Outras activities -->
        <activity android:name=".activities.PaymentActivity" />
        <activity android:name=".activities.CancellationActivity" />
        <activity android:name=".activities.PrintingActivity" />
        <activity android:name=".activities.TransactionListActivity" />
        <activity android:name=".activities.TransactionDetailsActivity" />
        
        <!-- Meta-data para Cielo Smart -->
        <meta-data
            android:name="cs_integration_type"
            android:value="uri" />
    </application>

</manifest>
```

## 🧪 Testando o Exemplo

### 1. Configuração

1. Configure as credenciais no `build.gradle`
2. Compile e instale o app
3. Configure o banco de dados local

### 2. Execução

1. **Pagamentos**: Teste diferentes formas de pagamento
2. **Cancelamentos**: Cancele pagamentos realizados
3. **Impressão**: Imprima cupons e recibos
4. **Listagem**: Visualize todas as transações

### 3. Resultados Esperados

- Interface completa e funcional
- Pagamentos processados corretamente
- Cancelamentos funcionando
- Impressão de cupons
- Listagem de transações
- Persistência de dados

## 🚨 Troubleshooting

### Problemas Comuns

1. **Banco de dados não funciona**
   - Verifique se o SQLite está configurado corretamente
   - Confirme se as permissões estão concedidas

2. **Interface não atualiza**
   - Verifique se os adapters estão configurados
   - Confirme se os dados estão sendo carregados

3. **Transações não persistem**
   - Verifique se o banco de dados está sendo chamado
   - Confirme se os dados estão sendo inseridos

## 📚 Próximos Passos

- [Integração via Deep Link](../deep-link-integration.md)
- [Integração Local (SDK)](../sdk-integration.md)
- [Referência da API](../api-reference.md)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
