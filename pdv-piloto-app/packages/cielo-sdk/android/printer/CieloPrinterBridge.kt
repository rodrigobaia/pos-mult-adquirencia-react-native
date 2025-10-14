package br.com.nebulasistemas.pdvpilotoapp.cielo.printer

import android.content.Intent
import android.net.Uri
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*

/**
 * Bridge para impressão via Cielo LIO Deep Link
 */
class CieloPrinterBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "CieloPrinterBridge"
    }

    override fun getName(): String {
        return "CieloPrinterBridge"
    }

    /**
     * Imprime texto via Deep Link Cielo
     */
    @ReactMethod
    fun printText(text: String, promise: Promise) {
        try {
            Log.d(TAG, "Solicitando impressão de texto via Cielo")
            
            // Construir payload JSON para impressão
            val payload = buildPrintPayload(text)
            
            // Construir URI do Deep Link
            val uri = buildPrintUri(payload)
            
            // Abrir Deep Link
            openDeepLink(uri)
            
            promise.resolve("Impressão solicitada via Cielo Deep Link")
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao solicitar impressão Cielo", e)
            promise.reject("CIELO_PRINT_ERROR", "Erro ao solicitar impressão: ${e.message}")
        }
    }

    /**
     * Constrói o payload JSON para impressão
     */
    private fun buildPrintPayload(text: String): String {
        return """
        {
            "operation": "PRINT_TEXT",
            "styles": [{}],
            "value": ["$text"]
        }
        """.trimIndent()
    }

    /**
     * Constrói a URI do Deep Link para impressão
     */
    private fun buildPrintUri(payload: String): String {
        val base64Payload = Base64.encodeToString(
            payload.toByteArray(),
            Base64.NO_WRAP
        )
        
        return "lio://print?request=$base64Payload&urlCallback=order://response"
    }

    /**
     * Abre o Deep Link
     */
    private fun openDeepLink(uri: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uri))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            
            Log.d(TAG, "Deep Link de impressão aberto: $uri")
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao abrir Deep Link de impressão", e)
            throw e
        }
    }
}

