package br.com.nebulasistemas.pdvpilotoapp.cielo.printer

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import android.content.Intent
import android.net.Uri
import android.util.Log

/**
 * Bridge para impressão via Cielo LIO
 */
class CieloPrinterBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "CieloPrinterBridge"
        private const val CIELO_SCHEME = "cielolio"
    }

    override fun getName(): String {
        return "CieloPrinterBridge"
    }

    /**
     * Imprime texto via Deep Link da Cielo
     */
    @ReactMethod
    fun printText(printData: ReadableMap, promise: Promise) {
        try {
            Log.d(TAG, "Imprimindo texto via Cielo: $printData")

            val text = printData.getString("text") ?: ""
            val fontSize = printData.getInt("fontSize")
            val alignment = printData.getString("alignment") ?: "LEFT"
            val bold = printData.getBoolean("bold")

            val payload = buildPrintPayload("PRINT_TEXT", text, fontSize, alignment, bold)
            val deepLinkUri = buildDeepLinkUri("PRINT", payload)
            
            Log.d(TAG, "Deep Link URI: $deepLinkUri")

            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            currentActivity?.startActivity(intent)
            
            promise.resolve(true)
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao imprimir texto via Cielo", e)
            promise.reject("CIELO_PRINT_ERROR", e.message, e)
        }
    }

    /**
     * Imprime imagem via Deep Link da Cielo
     */
    @ReactMethod
    fun printImage(imagePath: String, promise: Promise) {
        try {
            Log.d(TAG, "Imprimindo imagem via Cielo: $imagePath")

            val payload = buildImagePayload(imagePath)
            val deepLinkUri = buildDeepLinkUri("PRINT", payload)
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            currentActivity?.startActivity(intent)
            
            promise.resolve(true)
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao imprimir imagem via Cielo", e)
            promise.reject("CIELO_PRINT_IMAGE_ERROR", e.message, e)
        }
    }

    /**
     * Verifica se impressão Cielo está disponível
     */
    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            val testUri = "$CIELO_SCHEME://print"
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(testUri))
            
            val packageManager = reactApplicationContext.packageManager
            val activities = packageManager.queryIntentActivities(intent, 0)
            
            val isAvailable = activities.isNotEmpty()
            Log.d(TAG, "Cielo LIO impressão disponível: $isAvailable")
            
            promise.resolve(isAvailable)
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao verificar disponibilidade impressão Cielo", e)
            promise.resolve(false)
        }
    }

    /**
     * Constrói payload para impressão de texto
     */
    private fun buildPrintPayload(
        operation: String,
        text: String,
        fontSize: Int,
        alignment: String,
        bold: Boolean
    ): String {
        val payload = mapOf(
            "operation" to operation,
            "value" to text,
            "styles" to mapOf(
                "fontSize" to fontSize,
                "alignment" to alignment,
                "bold" to bold
            )
        )
        
        return android.util.Base64.encodeToString(
            payload.toString().toByteArray(),
            android.util.Base64.NO_WRAP
        )
    }

    /**
     * Constrói payload para impressão de imagem
     */
    private fun buildImagePayload(imagePath: String): String {
        val payload = mapOf(
            "operation" to "PRINT_IMAGE",
            "value" to imagePath
        )
        
        return android.util.Base64.encodeToString(
            payload.toString().toByteArray(),
            android.util.Base64.NO_WRAP
        )
    }

    /**
     * Constrói URI do Deep Link
     */
    private fun buildDeepLinkUri(action: String, payload: String): String {
        return "$CIELO_SCHEME://print?action=$action&payload=$payload"
    }
}
