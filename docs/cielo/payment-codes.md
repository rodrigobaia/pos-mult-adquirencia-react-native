# Códigos de Pagamento - Cielo LIO

Esta documentação contém todos os códigos de pagamento disponíveis para integração com a Cielo LIO.

## 📋 Índice

- [Códigos Principais](#códigos-principais)
- [Códigos de Voucher](#códigos-de-voucher)
- [Códigos de Crediário](#códigos-de-crediário)
- [Códigos de Cartão da Loja](#códigos-de-cartão-da-loja)
- [Outros Códigos](#outros-códigos)
- [Exemplos de Uso](#exemplos-de-uso)

## 💳 Códigos Principais

### Débito

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `DEBITO_AVISTA` | Débito à vista | 0 |
| `DEBITO_PAGTO_FATURA_DEBITO` | Débito pagamento fatura | 0 |

### Crédito

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `CREDITO_AVISTA` | Crédito à vista | 0 |
| `CREDITO_PARCELADO_LOJA` | Crédito parcelado loja | 1-12 |
| `CREDITO_PARCELADO_ADM` | Crédito parcelado administradora | 1-12 |
| `CREDITO_PARCELADO_BNCO` | Crédito parcelado banco | 1-12 |
| `CREDITO_PARCELADO_CLIENTE` | Crédito parcelado cliente | 1-12 |
| `PRE_AUTORIZACAO` | Pré-autorização | 0 |

### PIX

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `PIX` | PIX | 0 |

**⚠️ Importante**: PIX está em piloto e será liberado em dezembro/2023.

## 🎫 Códigos de Voucher

### Alimentação e Refeição

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `VOUCHER_ALIMENTACAO` | Voucher alimentação | 0 |
| `VOUCHER_REFEICAO` | Voucher refeição | 0 |

### Automotivo

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `VOUCHER_AUTOMOTIVO` | Voucher automotivo | 0 |
| `VOUCHER_AUTO` | Voucher automotivo | 0 |

### Cultura e Educação

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `VOUCHER_CULTURA` | Voucher cultura | 0 |

### Pedágio

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `VOUCHER_PEDAGIO` | Voucher pedágio | 0 |
| `VOUCHER_VALE_PEDAGIO` | Vale pedágio | 0 |

### Benefícios

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `VOUCHER_BENEFICIOS` | Voucher benefícios | 0 |

### Consulta de Saldo

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `VOUCHER_CONSULTA_SALDO` | Consulta saldo voucher | 0 |

## 💰 Códigos de Crediário

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `CREDIARIO_VENDA` | Crediário venda | 1-12 |
| `CREDIARIO_SIMULACAO` | Crediário simulação | 0 |

## 🏪 Códigos de Cartão da Loja

### À Vista

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `CARTAO_LOJA_AVISTA` | Cartão da loja à vista | 0 |

### Parcelado

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `CARTAO_LOJA_PARCELADO_LOJA` | Cartão da loja parcelado loja | 1-12 |
| `CARTAO_LOJA_PARCELADO` | Cartão da loja parcelado | 1-12 |
| `CARTAO_LOJA_PARCELADO_BANCO` | Cartão da loja parcelado banco | 1-12 |

### Pagamento de Fatura

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `CARTAO_LOJA_PAGTO_FATURA_CHEQUE` | Cartão da loja pagamento fatura cheque | 0 |
| `CARTAO_LOJA_PAGTO_FATURA_DINHEIRO` | Cartão da loja pagamento fatura dinheiro | 0 |

## 🚛 Outros Códigos

| Código | Descrição | Parcelas |
|--------|-----------|----------|
| `FROTAS` | Frotas | 0 |

## 💻 Exemplos de Uso

### 1. Pagamento à Vista

```kotlin
val request = OrderRequest(
    clientID = "SEU_CLIENT_ID",
    accessToken = "SEU_ACCESS_TOKEN",
    value = 1000L, // R$ 10,00
    paymentCode = "DEBITO_AVISTA",
    installments = 0,
    email = "cliente@email.com",
    merchantCode = null,
    reference = "PEDIDO_001",
    items = mutableListOf(item)
)
```

### 2. Crédito Parcelado

```kotlin
val request = OrderRequest(
    clientID = "SEU_CLIENT_ID",
    accessToken = "SEU_ACCESS_TOKEN",
    value = 3000L, // R$ 30,00
    paymentCode = "CREDITO_PARCELADO_LOJA",
    installments = 3, // 3 parcelas
    email = "cliente@email.com",
    merchantCode = null,
    reference = "PEDIDO_002",
    items = mutableListOf(item)
)
```

### 3. PIX

```kotlin
val request = OrderRequest(
    clientID = "SEU_CLIENT_ID",
    accessToken = "SEU_ACCESS_TOKEN",
    value = 1000L, // R$ 10,00
    paymentCode = "PIX",
    installments = 0,
    email = "cliente@email.com",
    merchantCode = null,
    reference = "PEDIDO_003",
    items = mutableListOf(item)
)
```

### 4. Voucher Alimentação

```kotlin
val request = OrderRequest(
    clientID = "SEU_CLIENT_ID",
    accessToken = "SEU_ACCESS_TOKEN",
    value = 1500L, // R$ 15,00
    paymentCode = "VOUCHER_ALIMENTACAO",
    installments = 0,
    email = null,
    merchantCode = null,
    reference = "PEDIDO_004",
    items = mutableListOf(item)
)
```

### 5. Crediário

```kotlin
val request = OrderRequest(
    clientID = "SEU_CLIENT_ID",
    accessToken = "SEU_ACCESS_TOKEN",
    value = 5000L, // R$ 50,00
    paymentCode = "CREDIARIO_VENDA",
    installments = 5, // 5 parcelas
    email = "cliente@email.com",
    merchantCode = null,
    reference = "PEDIDO_005",
    items = mutableListOf(item)
)
```

## 🔧 Validações

### 1. Verificação de Código Válido

```kotlin
object PaymentCodeValidator {
    
    private val validCodes = setOf(
        "DEBITO_AVISTA",
        "DEBITO_PAGTO_FATURA_DEBITO",
        "CREDITO_AVISTA",
        "CREDITO_PARCELADO_LOJA",
        "CREDITO_PARCELADO_ADM",
        "CREDITO_PARCELADO_BNCO",
        "CREDITO_PARCELADO_CLIENTE",
        "PRE_AUTORIZACAO",
        "PIX",
        "VOUCHER_ALIMENTACAO",
        "VOUCHER_REFEICAO",
        "VOUCHER_AUTOMOTIVO",
        "VOUCHER_CULTURA",
        "VOUCHER_PEDAGIO",
        "VOUCHER_BENEFICIOS",
        "VOUCHER_AUTO",
        "VOUCHER_CONSULTA_SALDO",
        "VOUCHER_VALE_PEDAGIO",
        "CREDIARIO_VENDA",
        "CREDIARIO_SIMULACAO",
        "CARTAO_LOJA_AVISTA",
        "CARTAO_LOJA_PARCELADO_LOJA",
        "CARTAO_LOJA_PARCELADO",
        "CARTAO_LOJA_PARCELADO_BANCO",
        "CARTAO_LOJA_PAGTO_FATURA_CHEQUE",
        "CARTAO_LOJA_PAGTO_FATURA_DINHEIRO",
        "FROTAS"
    )
    
    fun isValid(paymentCode: String): Boolean {
        return validCodes.contains(paymentCode)
    }
    
    fun requiresInstallments(paymentCode: String): Boolean {
        return when (paymentCode) {
            "CREDITO_PARCELADO_LOJA",
            "CREDITO_PARCELADO_ADM",
            "CREDITO_PARCELADO_BNCO",
            "CREDITO_PARCELADO_CLIENTE",
            "CREDIARIO_VENDA",
            "CARTAO_LOJA_PARCELADO_LOJA",
            "CARTAO_LOJA_PARCELADO",
            "CARTAO_LOJA_PARCELADO_BANCO" -> true
            else -> false
        }
    }
    
    fun getMaxInstallments(paymentCode: String): Int {
        return when (paymentCode) {
            "CREDITO_PARCELADO_LOJA",
            "CREDITO_PARCELADO_ADM",
            "CREDITO_PARCELADO_BNCO",
            "CREDITO_PARCELADO_CLIENTE",
            "CREDIARIO_VENDA",
            "CARTAO_LOJA_PARCELADO_LOJA",
            "CARTAO_LOJA_PARCELADO",
            "CARTAO_LOJA_PARCELADO_BANCO" -> 12
            else -> 0
        }
    }
}
```

### 2. Validação de Requisição

```kotlin
fun validatePaymentRequest(request: OrderRequest): ValidationResult {
    val errors = mutableListOf<String>()
    
    // Validar código de pagamento
    if (!PaymentCodeValidator.isValid(request.paymentCode ?: "")) {
        errors.add("Código de pagamento inválido")
    }
    
    // Validar parcelas
    if (request.installments < 0) {
        errors.add("Número de parcelas inválido")
    }
    
    if (request.paymentCode != null && PaymentCodeValidator.requiresInstallments(request.paymentCode)) {
        if (request.installments <= 0) {
            errors.add("Este método de pagamento requer parcelas")
        }
        
        val maxInstallments = PaymentCodeValidator.getMaxInstallments(request.paymentCode)
        if (request.installments > maxInstallments) {
            errors.add("Número máximo de parcelas: $maxInstallments")
        }
    }
    
    // Validar valor
    if (request.value <= 0) {
        errors.add("Valor deve ser maior que zero")
    }
    
    // Validar itens
    if (request.items.isEmpty()) {
        errors.add("Pelo menos um item é obrigatório")
    }
    
    return ValidationResult(
        isValid = errors.isEmpty(),
        errors = errors
    )
}
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Código de pagamento não reconhecido**
   - Verifique se o código está correto
   - Confirme se o método está habilitado no terminal

2. **Parcelas não permitidas**
   - Verifique se o método de pagamento suporta parcelas
   - Confirme se o número de parcelas está dentro do limite

3. **PIX não disponível**
   - Verifique se o PIX está habilitado no terminal
   - Confirme se a versão da LIO suporta PIX

### Logs para Debug

```bash
adb logcat | grep -i payment
adb logcat | grep -i cielo
adb logcat | grep -i lio
```

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Cielo LIO v1.10.2+, Cielo Smart
