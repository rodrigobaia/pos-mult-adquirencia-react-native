package br.com.nebulasistemas.pdvpilotoapp.cielo

import android.content.Intent
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Bridge para integração com Cielo LIO via Deep Link
 */
class CieloBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "CieloBridge"
    }

    override fun getName(): String {
        return "CieloBridge"
    }

    /**
     * Solicita pagamento via Deep Link Cielo
     */
    @ReactMethod
    fun requestPayment(
        amount: Double,
        paymentType: String,
        installments: Int,
        email: String?,
        promise: Promise
    ) {
        try {
            Log.d(TAG, "Solicitando pagamento Cielo: R$ $amount")
            
            // Construir payload JSON
            val payload = buildPaymentPayload(amount, paymentType, installments, email)
            
            // Construir URI do Deep Link
            val uri = buildPaymentUri(payload)
            
            // Abrir Deep Link
            openDeepLink(uri)
            
            promise.resolve("Pagamento solicitado via Cielo Deep Link")
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao solicitar pagamento Cielo", e)
            promise.reject("CIELO_ERROR", "Erro ao solicitar pagamento: ${e.message}")
        }
    }

    /**
     * Constrói o payload JSON para o pagamento
     */
    private fun buildPaymentPayload(
        amount: Double,
        paymentType: String,
        installments: Int,
        email: String?
    ): String {
        val amountInCents = (amount * 100).toInt()
        
        return """
        {
            "accessToken": "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
            "clientID": "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
            "email": "${email ?: "cliente@exemplo.com"}",
            "installments": $installments,
            "items": [
                {
                    "name": "Pagamento PDV Piloto",
                    "quantity": 1,
                    "sku": "PDV001",
                    "unitOfMeasure": "unidade",
                    "unitPrice": $amountInCents
                }
            ],
            "paymentCode": "$paymentType",
            "value": "$amountInCents"
        }
        """.trimIndent()
    }

    /**
     * Constrói a URI do Deep Link
     */
    private fun buildPaymentUri(payload: String): String {
        val base64Payload = android.util.Base64.encodeToString(
            payload.toByteArray(),
            android.util.Base64.NO_WRAP
        )
        
        return "lio://payment?request=$base64Payload&urlCallback=order://response"
    }

    /**
     * Abre o Deep Link
     */
    private fun openDeepLink(uri: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(uri))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            
            Log.d(TAG, "Deep Link aberto: $uri")
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao abrir Deep Link", e)
            throw e
        }
    }
}