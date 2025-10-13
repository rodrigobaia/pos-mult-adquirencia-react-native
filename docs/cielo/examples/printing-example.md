# Exemplo de Impressão - Cielo LIO

Este exemplo demonstra como implementar funcionalidades de impressão usando a integração via Deep Link com a Cielo LIO.

## 🎯 Objetivo

Implementar impressão de texto e imagens no terminal Cielo LIO.

## 📋 Pré-requisitos

- Terminal Cielo LIO com impressora
- Activity de resposta configurada no AndroidManifest.xml
- Permissões de armazenamento para salvar imagens

## 💻 Implementação

### 1. Estrutura de Dados

```kotlin
class PrintRequest(
    val operation: String,          // Tipo de operação
    val value: Array<String>,       // Conteúdo a imprimir
    val styles: List<Map<String, Int>> // Estilos de formatação
)
```

### 2. Activity Principal de Impressão

```kotlin
class PrintingActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_printing)
        
        setupButtons()
    }
    
    private fun setupButtons() {
        findViewById<Button>(R.id.printTextButton).setOnClickListener {
            printSimpleText()
        }
        
        findViewById<Button>(R.id.printFormattedTextButton).setOnClickListener {
            printFormattedText()
        }
        
        findViewById<Button>(R.id.printImageButton).setOnClickListener {
            printImage()
        }
        
        findViewById<Button>(R.id.printReceiptButton).setOnClickListener {
            printReceipt()
        }
    }
    
    private fun printSimpleText() {
        val style = HashMap<String, Int>()
        val styles = ArrayList<Map<String, Int>>()
        styles.add(style)
        
        val text = """
            Cielo LIO - Exemplo de Impressão
            
            Este é um exemplo de impressão de texto simples.
            
            Data: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}
            
            Obrigado pela preferência!
            
            
        """.trimIndent()
        
        val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
        executePrint(request)
    }
    
    private fun printFormattedText() {
        val styles = ArrayList<Map<String, Int>>()
        
        // Estilo para título (centralizado, fonte maior)
        val titleStyle = HashMap<String, Int>().apply {
            put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_CENTER)
            put(PrinterAttributes.KEY_TYPEFACE, 1)
            put(PrinterAttributes.KEY_TEXT_SIZE, 24)
        }
        styles.add(titleStyle)
        
        // Estilo para texto normal (esquerda, fonte padrão)
        val normalStyle = HashMap<String, Int>().apply {
            put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_LEFT)
            put(PrinterAttributes.KEY_TYPEFACE, 0)
            put(PrinterAttributes.KEY_TEXT_SIZE, 16)
        }
        styles.add(normalStyle)
        
        // Estilo para rodapé (centralizado, fonte menor)
        val footerStyle = HashMap<String, Int>().apply {
            put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_CENTER)
            put(PrinterAttributes.KEY_TYPEFACE, 0)
            put(PrinterAttributes.KEY_TEXT_SIZE, 12)
        }
        styles.add(footerStyle)
        
        val text = """
            LOJA EXEMPLO
            
            Produto: Produto de Teste
            Quantidade: 1
            Valor Unitário: R$ 10,00
            Valor Total: R$ 10,00
            
            Forma de Pagamento: Débito
            Data: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}
            
            Obrigado pela preferência!
            
            
        """.trimIndent()
        
        val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
        executePrint(request)
    }
    
    private fun printImage() {
        try {
            // Carregar imagem dos recursos
            val bitmap = BitmapFactory.decodeResource(resources, R.drawable.logo)
            
            // Salvar imagem temporariamente
            val imagePath = saveImageToFile(bitmap)
            
            val styles = ArrayList<Map<String, Int>>()
            val style = HashMap<String, Int>().apply {
                put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_CENTER)
            }
            styles.add(style)
            
            val request = PrintRequest("PRINT_IMAGE", arrayOf(imagePath), styles)
            executePrint(request)
            
        } catch (e: Exception) {
            Log.e("PrintingActivity", "Erro ao imprimir imagem: ${e.message}")
            showError("Erro ao imprimir imagem: ${e.message}")
        }
    }
    
    private fun printReceipt() {
        val styles = ArrayList<Map<String, Int>>()
        
        // Estilo para cabeçalho
        val headerStyle = HashMap<String, Int>().apply {
            put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_CENTER)
            put(PrinterAttributes.KEY_TYPEFACE, 1)
            put(PrinterAttributes.KEY_TEXT_SIZE, 20)
        }
        styles.add(headerStyle)
        
        // Estilo para conteúdo
        val contentStyle = HashMap<String, Int>().apply {
            put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_LEFT)
            put(PrinterAttributes.KEY_TYPEFACE, 0)
            put(PrinterAttributes.KEY_TEXT_SIZE, 14)
        }
        styles.add(contentStyle)
        
        // Estilo para total
        val totalStyle = HashMap<String, Int>().apply {
            put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_RIGHT)
            put(PrinterAttributes.KEY_TYPEFACE, 1)
            put(PrinterAttributes.KEY_TEXT_SIZE, 16)
        }
        styles.add(totalStyle)
        
        val receipt = """
            LOJA EXEMPLO LTDA
            CNPJ: 12.345.678/0001-90
            Rua Exemplo, 123
            Cidade - Estado
            
            ================================
            
            CUPOM FISCAL
            
            Item: Produto de Teste
            Qtd: 1 x R$ 10,00
            Subtotal: R$ 10,00
            
            Item: Outro Produto
            Qtd: 2 x R$ 5,00
            Subtotal: R$ 10,00
            
            ================================
            
            TOTAL: R$ 20,00
            
            ================================
            
            Data: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}
            Operador: Usuário
            
            Obrigado pela preferência!
            
            
        """.trimIndent()
        
        val request = PrintRequest("PRINT_TEXT", arrayOf(receipt), styles)
        executePrint(request)
    }
    
    private fun executePrint(request: PrintRequest) {
        try {
            val json = Gson().toJson(request)
            val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
            val printUri = "lio://print?request=$base64&urlCallback=order://response"
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(printUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
            
        } catch (e: Exception) {
            Log.e("PrintingActivity", "Erro ao executar impressão: ${e.message}")
            showError("Erro ao executar impressão: ${e.message}")
        }
    }
    
    private fun saveImageToFile(bitmap: Bitmap): String {
        val filename = "print_image_${System.currentTimeMillis()}.jpg"
        val file = File(getExternalFilesDir(Environment.DIRECTORY_PICTURES), filename)
        
        val outputStream = FileOutputStream(file)
        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
        outputStream.flush()
        outputStream.close()
        
        return file.absolutePath
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
                
                processPrintResponse(json)
            }
        }
    }
    
    private fun processPrintResponse(json: String) {
        try {
            val gson = Gson()
            
            // Verificar se é sucesso ou erro
            if (json.contains("\"success\"")) {
                val response = gson.fromJson(json, PrintSuccessResponse::class.java)
                handlePrintSuccess(response)
            } else {
                val response = gson.fromJson(json, PrintErrorResponse::class.java)
                handlePrintError(response)
            }
        } catch (e: Exception) {
            Log.e("PrintResponse", "Erro ao processar resposta: ${e.message}")
            showError("Erro ao processar resposta da impressão")
        }
    }
    
    private fun handlePrintSuccess(response: PrintSuccessResponse) {
        runOnUiThread {
            val message = "Impressão realizada com sucesso!"
            showSuccess(message)
        }
    }
    
    private fun handlePrintError(response: PrintErrorResponse) {
        runOnUiThread {
            val message = when (response.code) {
                1 -> "Impressão cancelada pelo usuário"
                2 -> "Erro na impressora: ${response.reason}"
                3 -> "Sem papel na impressora"
                4 -> "Impressora não disponível"
                else -> "Erro na impressão: ${response.reason}"
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
data class PrintSuccessResponse(
    val success: Boolean,
    val message: String? = null
)

data class PrintErrorResponse(
    val code: Int,
    val reason: String
)
```

### 5. Layout da Activity Principal

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
        android:text="Impressão Cielo LIO"
        android:textSize="24sp"
        android:textStyle="bold"
        android:gravity="center"
        android:layout_marginBottom="32dp" />

    <Button
        android:id="@+id/printTextButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Imprimir Texto Simples"
        android:textSize="16sp"
        android:padding="16dp"
        android:layout_marginBottom="16dp" />

    <Button
        android:id="@+id/printFormattedTextButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Imprimir Texto Formatado"
        android:textSize="16sp"
        android:padding="16dp"
        android:layout_marginBottom="16dp" />

    <Button
        android:id="@+id/printImageButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Imprimir Imagem"
        android:textSize="16sp"
        android:padding="16dp"
        android:layout_marginBottom="16dp" />

    <Button
        android:id="@+id/printReceiptButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Imprimir Cupom Fiscal"
        android:textSize="16sp"
        android:padding="16dp" />

</LinearLayout>
```

## 🎨 Estilos de Impressão

### 1. Configuração de Estilos

```kotlin
class PrintStyles {
    
    companion object {
        fun getTitleStyle(): Map<String, Int> {
            return mapOf(
                PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER,
                PrinterAttributes.KEY_TYPEFACE to 1,
                PrinterAttributes.KEY_TEXT_SIZE to 24
            )
        }
        
        fun getNormalStyle(): Map<String, Int> {
            return mapOf(
                PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_LEFT,
                PrinterAttributes.KEY_TYPEFACE to 0,
                PrinterAttributes.KEY_TEXT_SIZE to 16
            )
        }
        
        fun getFooterStyle(): Map<String, Int> {
            return mapOf(
                PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER,
                PrinterAttributes.KEY_TYPEFACE to 0,
                PrinterAttributes.KEY_TEXT_SIZE to 12
            )
        }
        
        fun getBoldStyle(): Map<String, Int> {
            return mapOf(
                PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_LEFT,
                PrinterAttributes.KEY_TYPEFACE to 1,
                PrinterAttributes.KEY_TEXT_SIZE to 16
            )
        }
        
        fun getRightAlignStyle(): Map<String, Int> {
            return mapOf(
                PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_RIGHT,
                PrinterAttributes.KEY_TYPEFACE to 0,
                PrinterAttributes.KEY_TEXT_SIZE to 16
            )
        }
    }
}
```

### 2. Exemplo de Uso dos Estilos

```kotlin
private fun printStyledText() {
    val styles = listOf(
        PrintStyles.getTitleStyle(),
        PrintStyles.getNormalStyle(),
        PrintStyles.getBoldStyle(),
        PrintStyles.getRightAlignStyle(),
        PrintStyles.getFooterStyle()
    )
    
    val text = """
        TÍTULO PRINCIPAL
        
        Este é um texto normal.
        
        Este texto está em negrito.
        
        Este texto está alinhado à direita.
        
        Rodapé centralizado.
        
    """.trimIndent()
    
    val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
    executePrint(request)
}
```

## 🖼️ Impressão de Imagens

### 1. Otimização de Imagem

```kotlin
private fun optimizeImageForPrint(bitmap: Bitmap): Bitmap {
    // Redimensionar imagem para impressão (máximo 384px de largura)
    val maxWidth = 384
    val aspectRatio = bitmap.height.toFloat() / bitmap.width.toFloat()
    val newHeight = (maxWidth * aspectRatio).toInt()
    
    return Bitmap.createScaledBitmap(bitmap, maxWidth, newHeight, true)
}
```

### 2. Conversão para Escala de Cinza

```kotlin
private fun convertToGrayscale(bitmap: Bitmap): Bitmap {
    val width = bitmap.width
    val height = bitmap.height
    val grayscaleBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    
    val canvas = Canvas(grayscaleBitmap)
    val paint = Paint()
    val colorMatrix = ColorMatrix()
    colorMatrix.setSaturation(0f) // Remove saturação (converte para cinza)
    val colorMatrixFilter = ColorMatrixColorFilter(colorMatrix)
    paint.colorFilter = colorMatrixFilter
    canvas.drawBitmap(bitmap, 0f, 0f, paint)
    
    return grayscaleBitmap
}
```

### 3. Impressão de Logo

```kotlin
private fun printLogo() {
    try {
        val originalBitmap = BitmapFactory.decodeResource(resources, R.drawable.logo)
        val optimizedBitmap = optimizeImageForPrint(originalBitmap)
        val grayscaleBitmap = convertToGrayscale(optimizedBitmap)
        
        val imagePath = saveImageToFile(grayscaleBitmap)
        
        val styles = listOf(
            mapOf(PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER)
        )
        
        val request = PrintRequest("PRINT_IMAGE", arrayOf(imagePath), styles)
        executePrint(request)
        
    } catch (e: Exception) {
        Log.e("PrintingActivity", "Erro ao imprimir logo: ${e.message}")
        showError("Erro ao imprimir logo: ${e.message}")
    }
}
```

## 📄 Impressão de Cupom Fiscal

### 1. Template de Cupom

```kotlin
private fun printFiscalReceipt(order: Order) {
    val styles = listOf(
        PrintStyles.getTitleStyle(),      // Cabeçalho
        PrintStyles.getNormalStyle(),     // Conteúdo
        PrintStyles.getBoldStyle(),       // Total
        PrintStyles.getFooterStyle()      // Rodapé
    )
    
    val receipt = buildString {
        appendLine("LOJA EXEMPLO LTDA")
        appendLine("CNPJ: 12.345.678/0001-90")
        appendLine("Rua Exemplo, 123")
        appendLine("Cidade - Estado")
        appendLine()
        appendLine("================================")
        appendLine()
        appendLine("CUPOM FISCAL")
        appendLine()
        
        // Itens
        order.items.forEach { item ->
            appendLine("Item: ${item.name}")
            appendLine("Qtd: ${item.quantity} x R$ ${item.unitPrice / 100.0}")
            appendLine("Subtotal: R$ ${(item.unitPrice * item.quantity) / 100.0}")
            appendLine()
        }
        
        appendLine("================================")
        appendLine()
        appendLine("TOTAL: R$ ${order.price / 100.0}")
        appendLine()
        appendLine("================================")
        appendLine()
        appendLine("Data: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}")
        appendLine("Operador: Usuário")
        appendLine()
        appendLine("Obrigado pela preferência!")
        appendLine()
        appendLine()
    }
    
    val request = PrintRequest("PRINT_TEXT", arrayOf(receipt), styles)
    executePrint(request)
}
```

## 🧪 Testando o Exemplo

### 1. Configuração

1. Configure o AndroidManifest.xml conforme mostrado
2. Adicione uma imagem de logo nos recursos
3. Compile e instale o app

### 2. Execução

1. Abra o app
2. Teste cada tipo de impressão:
   - Texto simples
   - Texto formatado
   - Imagem
   - Cupom fiscal
3. Verifique os resultados na impressora

### 3. Resultados Esperados

**Sucesso:**
- Texto impresso conforme formatação
- Imagem impressa em escala de cinza
- Cupom fiscal formatado

**Erro:**
- Dialog com mensagem de erro
- Código do erro
- Motivo do erro

## 🚨 Troubleshooting

### Problemas Comuns

1. **Impressão não funciona**
   - Verifique se a impressora está ligada
   - Confirme se há papel na impressora
   - Verifique se o terminal suporta impressão

2. **Imagem não imprime**
   - Verifique se o caminho da imagem está correto
   - Confirme se a imagem está em formato suportado
   - Verifique se as permissões de armazenamento estão concedidas

3. **Formatação incorreta**
   - Verifique se os estilos estão configurados corretamente
   - Confirme se os atributos de impressão estão suportados

### Logs para Debug

```bash
adb logcat | grep -i print
adb logcat | grep -i cielo
adb logcat | grep -i lio
```

## 📚 Próximos Passos

- [Exemplo de Pagamento](./payment-example.md)
- [Exemplo de Cancelamento](./cancellation-example.md)
- [Exemplo Completo](./complete-example.md)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
