package br.com.pdvflow.stone

import android.content.Intent
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

/**
 * Bridge para comunicação com Stone Printer via Deep Link
 * 
 * Implementa impressão usando o Deep Link da Stone conforme documentação:
 * https://sdkandroid.stone.com.br/reference/impressao-deeplink
 */
class StonePrinterBridge(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val MODULE_NAME = "StonePrinterBridge"
        private const val TAG = "StonePrinter"
    }
    
    override fun getName(): String = MODULE_NAME
    
    /**
     * Imprime texto simples via Deep Link
     */
    @ReactMethod
    fun printText(text: String, promise: Promise) {
        try {
            Log.d(TAG, "Iniciando impressão de texto via Deep Link: $text")
            
            // Criar conteúdo JSON para impressão
            val printContent = createPrintContent(text)
            Log.d(TAG, "Conteúdo JSON para impressão: $printContent")
            
            // Abrir impressora via Deep Link
            val success = openPrinterApp(printContent)
            
            if (success) {
                Log.d(TAG, "Deep Link para impressão enviado com sucesso")
                promise.resolve("Deep Link para impressão enviado com sucesso")
            } else {
                Log.e(TAG, "Falha ao enviar Deep Link para impressão")
                promise.reject("PRINT_ERROR", "Falha ao enviar Deep Link para impressão")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro na impressão", e)
            promise.reject("PRINT_ERROR", "Erro na impressão: ${e.message}")
        }
    }

    /**
     * Imprime recibo completo via Deep Link
     */
    @ReactMethod
    fun printReceipt(receipt: ReadableMap, promise: Promise) {
        try {
            Log.d(TAG, "Iniciando impressão de recibo via Deep Link")
            
            // Criar conteúdo JSON para impressão do recibo
            val printContent = createReceiptPrintContent(receipt)
            Log.d(TAG, "Conteúdo JSON do recibo: $printContent")
            
            // Abrir impressora via Deep Link
            val success = openPrinterApp(printContent)
            
            if (success) {
                Log.d(TAG, "Deep Link para impressão do recibo enviado com sucesso")
                promise.resolve("Deep Link para impressão do recibo enviado com sucesso")
            } else {
                Log.e(TAG, "Falha ao enviar Deep Link para impressão do recibo")
                promise.reject("PRINT_ERROR", "Falha ao enviar Deep Link para impressão do recibo")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro na impressão do recibo", e)
            promise.reject("PRINT_ERROR", "Erro na impressão do recibo: ${e.message}")
        }
    }

    /**
     * Teste de impressão via Deep Link
     */
    @ReactMethod
    fun testPrint(promise: Promise) {
        try {
            Log.d(TAG, "Iniciando teste de impressão via Deep Link")
            
            val testContent = createTestPrintContent()
            Log.d(TAG, "Conteúdo JSON do teste: $testContent")
            
            // Abrir impressora via Deep Link
            val success = openPrinterApp(testContent)
            
            if (success) {
                Log.d(TAG, "Deep Link para teste de impressão enviado com sucesso")
                promise.resolve("Deep Link para teste de impressão enviado com sucesso")
            } else {
                Log.e(TAG, "Falha ao enviar Deep Link para teste de impressão")
                promise.reject("PRINT_ERROR", "Falha ao enviar Deep Link para teste de impressão")
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro no teste de impressão", e)
            promise.reject("PRINT_ERROR", "Erro no teste de impressão: ${e.message}")
        }
    }

    /**
     * Cria conteúdo JSON para impressão de texto simples
     */
    private fun createPrintContent(text: String): String {
        val jsonArray = JSONArray()
        
        // Dividir texto em linhas e criar objetos line para cada uma
        text.split("\n").forEach { line ->
            if (line.isNotBlank()) {
                val lineObj = JSONObject().apply {
                    put("type", "line")
                    put("content", line.trim())
                }
                jsonArray.put(lineObj)
            }
        }
        
        return jsonArray.toString()
    }

    /**
     * Cria conteúdo JSON para impressão de recibo
     */
    private fun createReceiptPrintContent(receipt: ReadableMap): String {
        val jsonArray = JSONArray()
        val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale("pt", "BR"))
        val currentDate = dateFormat.format(Date())
        
        // Header
        receipt.getArray("header")?.toArrayList()?.forEach { headerLine ->
            val headerObj = JSONObject().apply {
                put("type", "text")
                put("content", headerLine.toString())
                put("align", "center")
                put("size", "big")
            }
            jsonArray.put(headerObj)
        }
        
        // Separador
        val separatorObj = JSONObject().apply {
            put("type", "line")
            put("content", "================================")
        }
        jsonArray.put(separatorObj)
        
        // "NÃO É DOCUMENTO FISCAL"
        val fiscalObj = JSONObject().apply {
            put("type", "text")
            put("content", "NÃO É DOCUMENTO FISCAL")
            put("align", "center")
            put("size", "medium")
        }
        jsonArray.put(fiscalObj)
        
        // Separador
        jsonArray.put(separatorObj)
        
        // Items
        receipt.getArray("items")?.toArrayList()?.forEach { item ->
            val itemMap = item as? HashMap<*, *>
            itemMap?.let {
                val name = it["name"].toString()
                val qty = it["quantity"].toString()
                val price = String.format("%.2f", it["price"] as? Double ?: 0.0)
                
                val itemObj = JSONObject().apply {
                    put("type", "line")
                    put("content", "$qty x $name")
                }
                jsonArray.put(itemObj)
                
                val priceObj = JSONObject().apply {
                    put("type", "line")
                    put("content", "   R$ $price")
                }
                jsonArray.put(priceObj)
            }
        }
        
        // Linha separadora
        val lineObj = JSONObject().apply {
            put("type", "line")
            put("content", "--------------------------------")
        }
        jsonArray.put(lineObj)
        
        // Subtotal
        val subtotal = receipt.getDouble("subtotal")
        val subtotalObj = JSONObject().apply {
            put("type", "line")
            put("content", String.format("SUBTOTAL:          R$ %.2f", subtotal))
        }
        jsonArray.put(subtotalObj)
        
        // Total
        val total = receipt.getDouble("total")
        val totalObj = JSONObject().apply {
            put("type", "text")
            put("content", String.format("TOTAL:             R$ %.2f", total))
            put("align", "center")
            put("size", "big")
        }
        jsonArray.put(totalObj)
        
        jsonArray.put(lineObj)
        
        // Forma de pagamento
        val paymentMethod = receipt.getString("paymentMethod") ?: "Não informado"
        val paymentObj = JSONObject().apply {
            put("type", "line")
            put("content", "FORMA: $paymentMethod")
        }
        jsonArray.put(paymentObj)
        
        // Data/Hora
        val dateObj = JSONObject().apply {
            put("type", "line")
            put("content", "DATA: $currentDate")
        }
        jsonArray.put(dateObj)
        
        // Footer
        receipt.getArray("footer")?.toArrayList()?.forEach { footerLine ->
            val footerObj = JSONObject().apply {
                put("type", "line")
                put("content", footerLine.toString())
            }
            jsonArray.put(footerObj)
        }
        
        // Website
        val websiteObj = JSONObject().apply {
            put("type", "line")
            put("content", "www.nebulasistemas.com.br")
        }
        jsonArray.put(websiteObj)
        
        return jsonArray.toString()
    }

    /**
     * Cria conteúdo JSON para teste de impressão
     */
    private fun createTestPrintContent(): String {
        val jsonArray = JSONArray()
        val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale("pt", "BR"))
        val currentDate = dateFormat.format(Date())
        
        // Título centralizado grande
        val titleObj = JSONObject().apply {
            put("type", "text")
            put("content", "PDV PILOTO")
            put("align", "center")
            put("size", "big")
        }
        jsonArray.put(titleObj)
        
        // Linha separadora
        val separatorObj = JSONObject().apply {
            put("type", "line")
            put("content", "================================")
        }
        jsonArray.put(separatorObj)
        
        // Texto de teste
        val testTextObj = JSONObject().apply {
            put("type", "text")
            put("content", "TESTE DE IMPRESSORA")
            put("align", "center")
            put("size", "medium")
        }
        jsonArray.put(testTextObj)
        
        // Data
        val dateObj = JSONObject().apply {
            put("type", "line")
            put("content", "Data: $currentDate")
        }
        jsonArray.put(dateObj)
        
        // Status
        val statusObj = JSONObject().apply {
            put("type", "text")
            put("content", "Status: OK")
            put("align", "center")
            put("size", "medium")
        }
        jsonArray.put(statusObj)
        
        // Linha separadora
        jsonArray.put(separatorObj)
        
        // Website
        val websiteObj = JSONObject().apply {
            put("type", "line")
            put("content", "www.nebulasistemas.com.br")
        }
        jsonArray.put(websiteObj)
        
        return jsonArray.toString()
    }

    /**
     * Abre o app da impressora via Deep Link
     */
    private fun openPrinterApp(printContent: String): Boolean {
        return try {
            val currentActivity = reactApplicationContext.currentActivity
            if (currentActivity == null) {
                Log.e(TAG, "Activity atual é null")
                return false
            }

            // Criar URI para Deep Link da impressora conforme documentação Stone
            val uriBuilder = Uri.Builder().apply {
                authority("print")
                scheme("printer-app")
                appendQueryParameter("SHOW_FEEDBACK_SCREEN", "true")
                appendQueryParameter("SCHEME_RETURN", "pdvpiloto_print_return")
                appendQueryParameter("PRINTABLE_CONTENT", printContent)
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                data = uriBuilder.build()
            }

            Log.d(TAG, "URI do Deep Link: ${intent.data}")
            Log.d(TAG, "Conteúdo JSON: $printContent")

            currentActivity.startActivity(intent)
            Log.d(TAG, "Deep Link para impressora enviado com sucesso")
            true

        } catch (e: Exception) {
            Log.e(TAG, "Erro ao enviar Deep Link para impressora", e)
            false
        }
    }

    /**
     * Status da impressora (sempre disponível para Deep Link)
     */
    @ReactMethod
    fun getPrinterStatus(promise: Promise) {
        try {
            val status = Arguments.createMap().apply {
                putBoolean("available", true)
                putBoolean("paperLow", false)
                putString("method", "deeplink")
            }
            promise.resolve(status)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }
}