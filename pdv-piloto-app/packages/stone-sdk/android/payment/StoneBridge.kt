package br.com.pdvflow.stone

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*

/**
 * Native Module Stone Payment
 * 
 * Integração com Stone via Deep Link
 */
class StoneBridge(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val MODULE_NAME = "StoneBridge"
    }
    
    override fun getName(): String = MODULE_NAME
    
    @ReactMethod
    fun requestPayment(amount: String, type: String, orderIdArg: String?, promise: Promise) {
        try {
            val activity = reactContext.currentActivity
            
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null")
                return
            }
            
            // Construir URI usando UriBuilder (padrão Stone - conforme documentação oficial)
            val uriBuilder = Uri.Builder()
            uriBuilder.authority("pay")
            uriBuilder.scheme("payment-app")
            uriBuilder.appendQueryParameter("return_scheme", "stone_payment_scheme")
            uriBuilder.appendQueryParameter("amount", amount)
            uriBuilder.appendQueryParameter("transaction_type", type.uppercase())
            uriBuilder.appendQueryParameter("editable_amount", "0")
            
            // Para CRÉDITO: forçar à vista com installment_type=NONE
            // Para DÉBITO: NÃO enviar installment_type (Stone rejeita se enviar)
            if (type.uppercase() == "CREDIT") {
                uriBuilder.appendQueryParameter("installment_type", "NONE")
            }
            
            val orderId = orderIdArg?.takeIf { it.isNotBlank() } ?: System.currentTimeMillis().toString()
            uriBuilder.appendQueryParameter("order_id", orderId)
            
            // Criar Intent com ACTION_VIEW
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = uriBuilder.build()
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            
            val resolvedActivity = intent.resolveActivity(activity.packageManager)
            
            if (resolvedActivity == null) {
                promise.reject("STONE_NOT_INSTALLED", "Stone payment app is not installed")
                return
            }
            
            activity.startActivity(intent)
            promise.resolve(null)
            
        } catch (e: Exception) {
            promise.reject("PAYMENT_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun isStoneInstalled(promise: Promise) {
        try {
            val activity = reactContext.currentActivity
            if (activity == null) {
                promise.resolve(false)
                return
            }
            
            try {
                // Verificar se app de pagamento Stone está instalado
                activity.packageManager.getPackageInfo("br.com.stone.posandroid.acquirerapp", 0)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun getInfo(promise: Promise) {
        try {
            val info = Arguments.createMap().apply {
                putString("id", "stone")
                putString("name", "Stone Pagamentos")
                putString("version", "4.8.7")
            }
            promise.resolve(info)
        } catch (e: Exception) {
            promise.reject("INFO_ERROR", e.message, e)
        }
    }
    
    /**
     * Busca evento de pagamento pendente salvo no SharedPreferences
     * Chamado pelo JavaScript quando estiver pronto
     */
    @ReactMethod
    fun getPendingPaymentEvent(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("PDVPilotoEvents", Context.MODE_PRIVATE)
            val eventName = prefs.getString("pending_event_name", null)
            val eventData = prefs.getString("pending_event_data", null)
            
            if (eventName != null && eventData != null && eventName == "paymentReceived") {
                android.util.Log.d("StoneBridge", "📥 Found pending payment event: $eventData")
                
                // Retornar evento e limpar
                prefs.edit().remove("pending_event_name").remove("pending_event_data").apply()
                
                val result = Arguments.createMap().apply {
                    putBoolean("hasPendingEvent", true)
                    putString("eventData", eventData)
                }
                promise.resolve(result)
            } else {
                val result = Arguments.createMap().apply {
                    putBoolean("hasPendingEvent", false)
                }
                promise.resolve(result)
            }
        } catch (e: Exception) {
            promise.reject("GET_PENDING_ERROR", e.message, e)
        }
    }
}