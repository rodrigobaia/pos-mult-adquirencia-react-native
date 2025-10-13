package br.com.nebulasistemas.pdvpilotoapp.cielo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import android.content.Intent
import android.net.Uri
import android.util.Log

/**
 * Bridge para integração com Cielo LIO via Deep Link
 */
class CieloBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "CieloBridge"
        private const val CIELO_PACKAGE = "com.cielo.lio"
        private const val CIELO_SCHEME = "lio"
    }

    override fun getName(): String {
        return "CieloBridge"
    }

    /**
     * Inicia pagamento via Deep Link da Cielo
     */
    @ReactMethod
    fun requestPayment(paymentData: ReadableMap, promise: Promise) {
        try {
            Log.d(TAG, "Iniciando pagamento Cielo: $paymentData")

            val amount = paymentData.getDouble("amount")
            val paymentType = paymentData.getString("type") ?: "CREDIT"
            val installments = paymentData.getInt("installments")
            val reference = paymentData.getString("reference") ?: "PDV_${System.currentTimeMillis()}"

            // Construir payload para Cielo
            val payload = buildPaymentPayload(amount, paymentType, installments, reference)
            
            // Construir URI do Deep Link seguindo padrão da Cielo
            val deepLinkUri = "$CIELO_SCHEME://payment?request=$payload&urlCallback=order://response"
            
            Log.d(TAG, "Deep Link URI: $deepLinkUri")

            // Abrir Deep Link
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            currentActivity?.startActivity(intent)
            
            promise.resolve(true)
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao iniciar pagamento Cielo", e)
            promise.reject("CIELO_PAYMENT_ERROR", e.message, e)
        }
    }

    /**
     * Cancela pagamento via Deep Link da Cielo
     */
    @ReactMethod
    fun cancelPayment(transactionId: String, promise: Promise) {
        try {
            Log.d(TAG, "Cancelando pagamento Cielo: $transactionId")

            val payload = buildCancelPayload(transactionId)
            val deepLinkUri = buildDeepLinkUri("CANCEL", payload)
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUri))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            currentActivity?.startActivity(intent)
            
            promise.resolve(true)
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao cancelar pagamento Cielo", e)
            promise.reject("CIELO_CANCEL_ERROR", e.message, e)
        }
    }

    /**
     * Verifica se Cielo LIO está disponível
     */
    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            val testUri = "$CIELO_SCHEME://payment"
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(testUri))
            
            val packageManager = reactApplicationContext.packageManager
            val activities = packageManager.queryIntentActivities(intent, 0)
            
            val isAvailable = activities.isNotEmpty()
            Log.d(TAG, "Cielo LIO disponível: $isAvailable")
            
            promise.resolve(isAvailable)
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao verificar disponibilidade Cielo", e)
            promise.resolve(false)
        }
    }

    /**
     * Constrói payload para pagamento seguindo formato da Cielo
     */
    private fun buildPaymentPayload(
        amount: Double,
        paymentType: String,
        installments: Int,
        reference: String
    ): String {
        // Converter para centavos (formato da Cielo)
        val amountInCents = (amount * 100).toInt()
        
        val payload = mapOf(
            "accessToken" to "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4",
            "clientID" to "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
            "value" to amountInCents,
            "paymentCode" to paymentType,
            "installments" to installments,
            "reference" to reference,
            "items" to listOf(
                mapOf(
                    "name" to "Pagamento PDV Piloto",
                    "quantity" to 1,
                    "unitPrice" to amountInCents,
                    "sku" to "PDV_PILOTO",
                    "unitOfMeasure" to "unidade"
                )
            )
        )
        
        // Converter para JSON e depois Base64
        val jsonPayload = com.google.gson.Gson().toJson(payload)
        return android.util.Base64.encodeToString(
            jsonPayload.toByteArray(),
            android.util.Base64.NO_WRAP
        )
    }

    /**
     * Constrói payload para cancelamento
     */
    private fun buildCancelPayload(transactionId: String): String {
        val payload = mapOf(
            "id" to transactionId,
            "clientID" to "hs7gR0uI2GbSynitwdGvfcjqAhVGajX9xmEVh4n8CJfQUjkUSN",
            "accessToken" to "3b26iD3oEn3EDrqKjLAkc8UF6aTD9awBMHFTDa99NPbu539fh4"
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
        return "$CIELO_SCHEME://payment?action=$action&payload=$payload"
    }
}
