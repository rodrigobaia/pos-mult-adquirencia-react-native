# Funcionalidades de Impressão - Cielo LIO

Esta documentação contém todas as informações sobre funcionalidades de impressão na Cielo LIO.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tipos de Impressão](#tipos-de-impressão)
- [Atributos de Formatação](#atributos-de-formatação)
- [Exemplos de Uso](#exemplos-de-uso)
- [Otimizações](#otimizações)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

A Cielo LIO permite que aplicações utilizem o método de impressão por imagem para imprimir dados importantes ou necessários para o negócio do cliente.

### Vantagens

- ✅ **Impressão de Texto**: Suporte a formatação avançada
- ✅ **Impressão de Imagens**: Suporte a imagens em escala de cinza
- ✅ **Múltiplos Estilos**: Diferentes estilos de formatação
- ✅ **Alinhamento**: Esquerda, centro e direita
- ✅ **Fontes**: Múltiplas fontes disponíveis

## 🖨️ Tipos de Impressão

### 1. Impressão de Texto

**Operação**: `PRINT_TEXT`

**Descrição**: Imprime texto com formatação personalizada.

**Estrutura**:
```kotlin
class PrintRequest(
    val operation: String = "PRINT_TEXT",
    val value: Array<String>,       // Texto a imprimir
    val styles: List<Map<String, Int>> // Estilos de formatação
)
```

**Exemplo**:
```kotlin
val styles = listOf(
    mapOf(
        PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER,
        PrinterAttributes.KEY_TYPEFACE to 0,
        PrinterAttributes.KEY_TEXT_SIZE to 16
    )
)

val text = """
    LOJA EXEMPLO LTDA
    CNPJ: 12.345.678/0001-90
    Rua Exemplo, 123
    Cidade - Estado
    
    ================================
    
    CUPOM FISCAL
    
    Produto: Produto de Teste
    Quantidade: 1
    Valor Unitário: R$ 10,00
    Valor Total: R$ 10,00
    
    ================================
    
    TOTAL: R$ 10,00
    
    ================================
    
    Data: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}
    Operador: Usuário
    
    Obrigado pela preferência!
    
    
""".trimIndent()

val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
```

### 2. Impressão de Imagem

**Operação**: `PRINT_IMAGE`

**Descrição**: Imprime imagem em escala de cinza.

**Estrutura**:
```kotlin
class PrintRequest(
    val operation: String = "PRINT_IMAGE",
    val value: Array<String>,       // Caminho da imagem
    val styles: List<Map<String, Int>> // Estilos de formatação
)
```

**Exemplo**:
```kotlin
val styles = listOf(
    mapOf(
        PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER
    )
)

val imagePath = "/storage/emulated/0/saved_images/logo.jpg"
val request = PrintRequest("PRINT_IMAGE", arrayOf(imagePath), styles)
```

## 🎨 Atributos de Formatação

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

| Chave | Descrição | Tipo | Valores |
|-------|-----------|------|---------|
| `PrinterAttributes.KEY_ALIGN` | Alinhamento | Int | `VAL_ALIGN_LEFT`, `VAL_ALIGN_CENTER`, `VAL_ALIGN_RIGHT` |
| `PrinterAttributes.KEY_TEXTSIZE` | Tamanho do texto | Int | Valores inteiros |
| `PrinterAttributes.KEY_TYPEFACE` | Fonte | Int | 0 a 8 |
| `PrinterAttributes.KEY_MARGINLEFT` | Margem esquerda | Int | Valores inteiros |
| `PrinterAttributes.KEY_MARGINRIGHT` | Margem direita | Int | Valores inteiros |
| `PrinterAttributes.KEY_MARGINTOP` | Margem superior | Int | Valores inteiros |
| `PrinterAttributes.KEY_MARGINBOTTOM` | Margem inferior | Int | Valores inteiros |
| `PrinterAttributes.KEY_LINESPACE` | Espaçamento entre linhas | Int | Valores inteiros |
| `PrinterAttributes.KEY_WEIGHT` | Peso da coluna | Int | Valores inteiros |

## 💻 Exemplos de Uso

### 1. Impressão Simples

```kotlin
private fun printSimpleText() {
    val style = HashMap<String, Int>()
    val styles = ArrayList<Map<String, Int>>()
    styles.add(style)
    
    val text = "Texto simples para impressão"
    val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
    
    executePrint(request)
}
```

### 2. Impressão Formatada

```kotlin
private fun printFormattedText() {
    val styles = ArrayList<Map<String, Int>>()
    
    // Estilo para título
    val titleStyle = HashMap<String, Int>().apply {
        put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_CENTER)
        put(PrinterAttributes.KEY_TYPEFACE, 1)
        put(PrinterAttributes.KEY_TEXT_SIZE, 24)
    }
    styles.add(titleStyle)
    
    // Estilo para conteúdo
    val contentStyle = HashMap<String, Int>().apply {
        put(PrinterAttributes.KEY_ALIGN, PrinterAttributes.VAL_ALIGN_LEFT)
        put(PrinterAttributes.KEY_TYPEFACE, 0)
        put(PrinterAttributes.KEY_TEXT_SIZE, 16)
    }
    styles.add(contentStyle)
    
    val text = """
        TÍTULO PRINCIPAL
        
        Este é o conteúdo do texto
        com formatação personalizada.
        
    """.trimIndent()
    
    val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
    executePrint(request)
}
```

### 3. Impressão de Cupom Fiscal

```kotlin
private fun printFiscalReceipt(order: Order) {
    val styles = listOf(
        // Cabeçalho
        mapOf(
            PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER,
            PrinterAttributes.KEY_TYPEFACE to 1,
            PrinterAttributes.KEY_TEXT_SIZE to 20
        ),
        // Conteúdo
        mapOf(
            PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_LEFT,
            PrinterAttributes.KEY_TYPEFACE to 0,
            PrinterAttributes.KEY_TEXT_SIZE to 14
        ),
        // Total
        mapOf(
            PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_RIGHT,
            PrinterAttributes.KEY_TYPEFACE to 1,
            PrinterAttributes.KEY_TEXT_SIZE to 16
        )
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
        appendLine("Pedido: ${order.id}")
        appendLine("Data: ${SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())}")
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
        appendLine("Obrigado pela preferência!")
        appendLine()
        appendLine()
    }
    
    val request = PrintRequest("PRINT_TEXT", arrayOf(receipt), styles)
    executePrint(request)
}
```

### 4. Impressão de Imagem

```kotlin
private fun printImage() {
    try {
        // Carregar imagem dos recursos
        val bitmap = BitmapFactory.decodeResource(resources, R.drawable.logo)
        
        // Otimizar imagem para impressão
        val optimizedBitmap = optimizeImageForPrint(bitmap)
        
        // Converter para escala de cinza
        val grayscaleBitmap = convertToGrayscale(optimizedBitmap)
        
        // Salvar imagem temporariamente
        val imagePath = saveImageToFile(grayscaleBitmap)
        
        val styles = listOf(
            mapOf(
                PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_CENTER
            )
        )
        
        val request = PrintRequest("PRINT_IMAGE", arrayOf(imagePath), styles)
        executePrint(request)
        
    } catch (e: Exception) {
        Log.e("PrintingActivity", "Erro ao imprimir imagem: ${e.message}")
        showError("Erro ao imprimir imagem: ${e.message}")
    }
}
```

### 5. Impressão de Múltiplas Colunas

```kotlin
private fun printMultiColumn() {
    val styles = listOf(
        // Coluna 1
        mapOf(
            PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_LEFT,
            PrinterAttributes.KEY_WEIGHT to 50
        ),
        // Coluna 2
        mapOf(
            PrinterAttributes.KEY_ALIGN to PrinterAttributes.VAL_ALIGN_RIGHT,
            PrinterAttributes.KEY_WEIGHT to 50
        )
    )
    
    val text = """
        Produto                    R$ 10,00
        Quantidade                 1
        Subtotal                   R$ 10,00
        
    """.trimIndent()
    
    val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
    executePrint(request)
}
```

## 🔧 Otimizações

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

### 3. Salvar Imagem Temporariamente

```kotlin
private fun saveImageToFile(bitmap: Bitmap): String {
    val filename = "print_image_${System.currentTimeMillis()}.jpg"
    val file = File(getExternalFilesDir(Environment.DIRECTORY_PICTURES), filename)
    
    val outputStream = FileOutputStream(file)
    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
    outputStream.flush()
    outputStream.close()
    
    return file.absolutePath
}
```

### 4. Performance de Impressão

```kotlin
// Para otimizar a performance ao usar o Printer Manager para imprimir textos 
// com múltiplas linhas, é aconselhável evitar a invocação do método de 
// impressão para cada linha individualmente.

// Em vez disso, recomenda-se a formatação do texto completo, incluindo 
// todas as linhas, e a realização de uma única chamada a operação PRINT_TEXT.

// Isso reduz o número de chamadas ao método de impressão, melhorando a 
// eficiência do processo.

val text = """
    TEXTO PARA IMPRIMIR NA PRIMEIRA LINHA
    TEXTO PARA IMPRIMIR NA SEGUNDA LINHA
    TEXTO PARA IMPRIMIR NA TERCEIRA LINHA
    
""".trimIndent()

val request = PrintRequest("PRINT_TEXT", arrayOf(text), styles)
```

## 🎨 Estilos Pré-definidos

### 1. Classe de Estilos

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

### 2. Uso dos Estilos

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

4. **Performance lenta**
   - Use uma única chamada para textos com múltiplas linhas
   - Otimize as imagens antes da impressão
   - Evite chamadas múltiplas desnecessárias

### Logs para Debug

```bash
adb logcat | grep -i print
adb logcat | grep -i cielo
adb logcat | grep -i lio
```

### Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `1` | Impressão cancelada pelo usuário |
| `2` | Erro na impressora |
| `3` | Sem papel na impressora |
| `4` | Impressora não disponível |

## 📚 Próximos Passos

- [Exemplo de Pagamento](./examples/payment-example.md)
- [Exemplo de Cancelamento](./examples/cancellation-example.md)
- [Exemplo de Impressão](./examples/printing-example.md)
- [Exemplo Completo](./examples/complete-example.md)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
