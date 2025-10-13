# Integração via Deep Link - Cielo LIO

A integração via Deep Link é a forma **recomendada** pela Cielo para integrar com a plataforma LIO. Esta abordagem oferece maior flexibilidade, independência de atualizações e compatibilidade com a nova geração Cielo Smart.

## 🎯 Vantagens da Integração via Deep Link

1. **Independência de Atualizações**: Não é necessário aguardar atualizações do SDK
2. **Menor Tamanho do Aplicativo**: Evita adicionar bibliotecas externas
3. **Facilidade de Implementação**: Integrações via deeplink são mais simples
4. **Flexibilidade**: Permite maior personalização da integração
5. **Compatibilidade**: Reduz problemas com diferentes versões de SDKs
6. **Manutenção Simplificada**: Facilita a manutenção do código
7. **Desempenho**: Pode melhorar o desempenho do aplicativo
8. **Segurança**: Reduz a superfície de ataque

## ⚙️ Configuração Inicial

### 1. AndroidManifest.xml

Configure as Activities para receber as respostas da Cielo LIO:

```xml
<!-- Activity para receber respostas de pagamento -->
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

<!-- Meta-data obrigatório para Cielo Smart -->
<meta-data
    android:name="cs_integration_type"
    android:value="uri" />
```

### 2. Configuração de Strings

Defina os esquemas e hosts no `strings.xml`:

```xml
<string name="intent_scheme">order</string>
<string name="intent_host">response</string>
```

## 💳 Integração de Pagamentos

### 1. Estrutura da Requisição

Crie um JSON com os dados do pagamento:

```json
{
  "accessToken": "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
  "clientID": "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
  "reference": "Referência do pedido",
  "merchantCode": "Em caso de MULTI-EC",
  "email": "emaildocliente@email.com",
  "installments": 0,
  "items": [
    {
      "name": "Produto",
      "quantity": 1,
      "sku": "10",
      "unitOfMeasure": "unidade",
      "unitPrice": 1000
    }
  ],
  "paymentCode": "DEBITO_AVISTA",
  "value": "1000"
}
```

### 2. Campos da Requisição

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `accessToken` | String | ✅ | Token de acesso da Cielo |
| `clientID` | String | ✅ | ID do cliente da Cielo |
| `reference` | String | ❌ | Referência do pedido |
| `merchantCode` | String | ❌ | Código do estabelecimento (MULTI-EC) |
| `email` | String | ❌ | Email para envio do comprovante |
| `installments` | Number | ❌ | Número de parcelas |
| `items` | Array | ✅ | Lista de itens do pedido |
| `paymentCode` | String | ❌ | Código do tipo de pagamento |
| `value` | String | ✅ | Valor total em centavos |

### 3. Estrutura dos Itens

```json
{
  "name": "Nome do produto",
  "quantity": 1,
  "sku": "Código do produto",
  "unitOfMeasure": "unidade",
  "unitPrice": 1000
}
```

### 4. Códigos de Pagamento Disponíveis

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
| `VOUCHER_ALIMENTACAO` | Voucher alimentação |
| `VOUCHER_REFEICAO` | Voucher refeição |
| `VOUCHER_CULTURA` | Voucher cultura |
| `VOUCHER_PEDAGIO` | Voucher pedágio |
| `VOUCHER_BENEFICIOS` | Voucher benefícios |
| `VOUCHER_AUTO` | Voucher automotivo |
| `VOUCHER_CONSULTA_SALDO` | Consulta saldo voucher |
| `VOUCHER_VALE_PEDAGIO` | Vale pedágio |
| `CREDIARIO_VENDA` | Crediário venda |
| `CREDIARIO_SIMULACAO` | Crediário simulação |
| `CARTAO_LOJA_AVISTA` | Cartão da loja à vista |
| `CARTAO_LOJA_PARCELADO_LOJA` | Cartão da loja parcelado |
| `CARTAO_LOJA_PARCELADO` | Cartão da loja parcelado |
| `CARTAO_LOJA_PARCELADO_BANCO` | Cartão da loja parcelado banco |
| `FROTAS` | Frotas |

### 5. Implementação do Pagamento

```kotlin
private fun makePayment() {
    // 1. Criar estrutura de dados
    val item = Item(
        sku = "12345",
        name = "Produto de Teste",
        unitPrice = 1000L, // R$ 10,00 em centavos
        quantity = 1,
        unitOfMeasure = "unidade"
    )
    
    val request = OrderRequest(
        clientID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
        accessToken = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
        value = 1000L,
        paymentCode = "DEBITO_AVISTA",
        installments = 0,
        email = "cliente@email.com",
        merchantCode = null,
        reference = "PEDIDO_${System.currentTimeMillis()}",
        items = mutableListOf(item)
    )
    
    // 2. Converter para JSON e Base64
    val json = Gson().toJson(request)
    val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
    
    // 3. Criar URI de pagamento
    val checkoutUri = "lio://payment?request=$base64&urlCallback=order://response"
    
    // 4. Executar intent
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(checkoutUri))
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    startActivity(intent)
}
```

## 📄 Processamento de Respostas

### 1. Activity de Resposta

```kotlin
class ResponseActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
                
                // Processar resposta
                processPaymentResponse(json)
            }
        }
    }
}
```

### 2. Estrutura de Resposta de Sucesso

```json
{
  "createdAt": "Jun 8, 2018 1:51:58 PM",
  "id": "ba583f85-9252-48b5-8fed-12719ff058b9",
  "items": [
    {
      "id": "898e7f40-fa21-42d0-94d4-b4e95c4fd615",
      "name": "Produto",
      "quantity": 1,
      "sku": "1234",
      "unitOfMeasure": "unidade",
      "unitPrice": 1000
    }
  ],
  "notes": "",
  "number": "",
  "paidAmount": 1000,
  "payments": [
    {
      "accessKey": "XXXXXXXXXXXXXXX",
      "amount": 1000,
      "applicationName": "com.ads.lio.uriappclient",
      "authCode": "140126",
      "brand": "Visa",
      "cieloCode": "799871",
      "description": "",
      "discountedAmount": 0,
      "externalId": "6d5f6f86-7870-4aed-b79f-0a26d6c61743",
      "id": "bb9c6305-95e5-4024-8152-503d064c0224",
      "installments": 0,
      "mask": "424242-4242",
      "merchantCode": "0000000000000003",
      "paymentFields": {
        "statusCode": "1",
        "brand": "VISA",
        "mask": "424242-4242",
        "authCode": "140126",
        "cieloCode": "799871"
      },
      "primaryCode": "4",
      "requestDate": "1528476655000",
      "secondaryCode": "204",
      "terminal": "69000007"
    }
  ],
  "pendingAmount": 0,
  "price": 1000,
  "reference": "Order",
  "status": "ENTERED",
  "type": "PAYMENT",
  "updatedAt": "Jun 8, 2018 1:51:58 PM"
}
```

### 3. Estrutura de Resposta de Erro

```json
{
  "code": 1,
  "reason": "CANCELADO PELO USUÁRIO"
}
```

### 4. Códigos de Status

| Status Code | Descrição |
|-------------|-----------|
| `0` | PIX (apenas pagamentos PIX) |
| `1` | Transação autorizada |
| `2` | Transação cancelada |

## 🔄 Cancelamento de Pagamentos

### 1. Estrutura da Requisição de Cancelamento

```json
{
  "id": "id da ordem",
  "clientID": "seu client ID",
  "accessToken": "seu access token",
  "cieloCode": "123",
  "authCode": "123",
  "value": 1000
}
```

### 2. Implementação do Cancelamento

```kotlin
private fun cancelPayment(orderId: String, cieloCode: String, authCode: String, value: Long) {
    val cancelRequest = CancelRequest(
        id = orderId,
        clientID = "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
        accessToken = "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
        cieloCode = cieloCode,
        authCode = authCode,
        value = value
    )
    
    val json = Gson().toJson(cancelRequest)
    val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
    val cancelUri = "lio://payment-reversal?request=$base64&urlCallback=order://response"
    
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(cancelUri))
    startActivity(intent)
}
```

**⚠️ Importante**: Hoje não é possível realizar cancelamentos de pagamentos PIX via integração.

## 🖨️ Funcionalidades de Impressão

### 1. Impressão de Texto

```json
{
  "operation": "PRINT_TEXT",
  "styles": [{}],
  "value": ["TEXTO PARA IMPRIMIR NA PRIMEIRA LINHA\nTEXTO PARA IMPRIMIR NA SEGUNDA LINHA\nTEXTO PARA IMPRIMIR NA TERCEIRA LINHA\n\n"]
}
```

### 2. Impressão de Imagem

```json
{
  "operation": "PRINT_IMAGE",
  "styles": [{}],
  "value": ["/storage/emulated/0/saved_images/Image-5005.jpg"]
}
```

### 3. Implementação da Impressão

```kotlin
private fun printText() {
    val style = HashMap<String, Int>()
    val styles = ArrayList<Map<String, Int>>()
    styles.add(style)
    
    val value = arrayOf("Formatação do texto completo\n incluindo todas as linhas\n reduz o número de chamadas \n e melhora a performance \n\n\n")
    val request = PrintRequest("PRINT_TEXT", value, styles)
    
    val json = Gson().toJson(request)
    val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
    val printUri = "lio://print?request=$base64&urlCallback=order://response"
    
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(printUri))
    startActivity(intent)
}

private fun printImage() {
    val bitmap = BitmapFactory.decodeResource(resources, R.drawable.logo)
    val uri = saveImage(this, bitmap)
    
    val styles = ArrayList<Map<String, Int>>()
    styles.add(HashMap())
    
    val request = PrintRequest("PRINT_IMAGE", arrayOf(uri), styles)
    val json = Gson().toJson(request)
    val base64 = Base64.encodeToString(json.toByteArray(), Base64.DEFAULT)
    val printUri = "lio://print?request=$base64&urlCallback=order://response"
    
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(printUri))
    startActivity(intent)
}
```

## 🔧 Utilitários

### 1. Função para Base64

```kotlin
fun getBase64(input: String): String {
    return Base64.encodeToString(input.toByteArray(), Base64.DEFAULT)
}
```

### 2. Função para Salvar Imagem

```kotlin
fun saveImage(context: Context, bitmap: Bitmap): String {
    val filename = "Image-${System.currentTimeMillis()}.jpg"
    val file = File(context.getExternalFilesDir(Environment.DIRECTORY_PICTURES), filename)
    
    val outputStream = FileOutputStream(file)
    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
    outputStream.flush()
    outputStream.close()
    
    return file.absolutePath
}
```

### 3. Função para Processar Resposta

```kotlin
fun processPaymentResponse(json: String) {
    try {
        val gson = Gson()
        val response = gson.fromJson(json, PaymentResponse::class.java)
        
        when {
            response.id != null -> {
                // Pagamento realizado com sucesso
                handlePaymentSuccess(response)
            }
            response.code != null -> {
                // Erro no pagamento
                handlePaymentError(response.code, response.reason)
            }
        }
    } catch (e: Exception) {
        Log.e("PaymentResponse", "Erro ao processar resposta: ${e.message}")
    }
}
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **App não retorna após pagamento**
   - Verifique se o `urlCallback` está configurado corretamente
   - Confirme se a Activity de resposta está registrada no AndroidManifest.xml

2. **Erro de credenciais**
   - Verifique se o Client ID e Access Token estão corretos
   - Confirme se as credenciais estão ativas no Portal da Cielo

3. **Pagamento não é processado**
   - Verifique se o JSON está em formato correto
   - Confirme se o valor está em centavos (ex: R$ 10,00 = 1000)

4. **Impressão não funciona**
   - Verifique se o caminho da imagem está correto
   - Confirme se as permissões de armazenamento estão concedidas

### Logs e Debug

Para debug, verifique os logs do sistema:
```bash
adb logcat | grep -i cielo
adb logcat | grep -i lio
adb logcat | grep -i payment
```

## 📚 Próximos Passos

- [Integração Local (SDK)](./sdk-integration.md)
- [Referência da API](./api-reference.md)
- [Exemplos de Código](./examples/)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
