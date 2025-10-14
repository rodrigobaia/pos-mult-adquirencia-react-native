package br.com.pdvflow.stone

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import stone.utils.Stone
import stone.providers.TransactionProvider
import stone.database.transaction.TransactionObject
import stone.application.enums.TypeOfTransactionEnum
import stone.application.enums.InstalmentTransactionEnum
import stone.application.interfaces.StoneActionCallback
import stone.application.enums.Action

/**
 * Native Module Stone Payment
 * 
 * Integração com Stone SDK nativo (baseado no projeto demo oficial)
 */
class StoneBridge(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), StoneActionCallback {
    
    companion object {
        const val MODULE_NAME = "StoneBridge"
    }
    
    override fun getName(): String = MODULE_NAME
    
    @ReactMethod
    fun requestPayment(amount: String, type: String, orderIdArg: String?, installments: Int?, capture: Boolean?, promise: Promise) {
        try {
            // Verificar se há pinpads conectados
            if (Stone.getPinpadListSize() <= 0) {
                promise.reject("NO_PINPAD", "Nenhum pinpad conectado")
                return
            }
            
            // Verificar se há sessão ativa
            if (Stone.sessionApplication == null || Stone.sessionApplication.userModelList == null || Stone.sessionApplication.userModelList.isEmpty()) {
                promise.reject("NO_SESSION", "Nenhuma sessão Stone ativa")
                return
            }
            
            // Criar TransactionObject (como no projeto demo)
            val transactionObject = TransactionObject().apply {
                this.amount = amount
                this.typeOfTransaction = when (type.lowercase()) {
                    "credit" -> TypeOfTransactionEnum.CREDIT
                    "debit" -> TypeOfTransactionEnum.DEBIT
                    "pix" -> TypeOfTransactionEnum.PIX
                    else -> TypeOfTransactionEnum.CREDIT
                }
                this.instalmentTransaction = InstalmentTransactionEnum.getAt((installments ?: 1) - 1)
                this.setCapture(capture ?: true)
                this.initiatorTransactionKey = orderIdArg
            }
            
            // Criar TransactionProvider (como no projeto demo)
            val transactionProvider = TransactionProvider(
                reactContext,
                transactionObject,
                Stone.getUserModel(0), // Primeiro usuário
                Stone.getPinpadFromListAt(0) // Primeiro pinpad
            )
            
            // Configurar callback
            transactionProvider.connectionCallback = this
            
            // Executar em thread separada (como no projeto demo)
            Thread {
                try {
                    transactionProvider.execute()
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("PAYMENT_EXECUTION_ERROR", e.message, e)
                }
            }.start()
            
        } catch (e: Exception) {
            promise.reject("PAYMENT_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun getPinpadListSize(promise: Promise) {
        try {
            val size = Stone.getPinpadListSize()
            promise.resolve(size)
        } catch (e: Exception) {
            promise.reject("PINPAD_CHECK_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun hasActiveSession(promise: Promise) {
        try {
            val hasSession = Stone.sessionApplication != null && 
                           Stone.sessionApplication.userModelList != null && 
                           !Stone.sessionApplication.userModelList.isEmpty()
            promise.resolve(hasSession)
        } catch (e: Exception) {
            promise.reject("SESSION_CHECK_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun isStoneInstalled(promise: Promise) {
        try {
            val hasPinpads = Stone.getPinpadListSize() > 0
            val hasSession = Stone.sessionApplication != null
            promise.resolve(hasPinpads && hasSession)
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
    
    // Implementação dos callbacks do StoneActionCallback
    override fun onSuccess() {
        android.util.Log.d("StoneBridge", "✅ Payment successful")
        // Emitir evento para React Native
        val params = Arguments.createMap().apply {
            putBoolean("success", true)
            putString("message", "Pagamento realizado com sucesso")
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("paymentReceived", params)
    }
    
    override fun onError() {
        android.util.Log.e("StoneBridge", "❌ Payment error")
        // Emitir evento de erro para React Native
        val params = Arguments.createMap().apply {
            putBoolean("success", false)
            putString("message", "Erro no pagamento")
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("paymentReceived", params)
    }
    
    override fun onStatusChanged(action: Action) {
        android.util.Log.d("StoneBridge", "🔄 Payment status changed: ${action.name}")
        // Emitir evento de status para React Native
        val params = Arguments.createMap().apply {
            putString("status", action.name)
            putString("message", "Status: ${action.name}")
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("paymentStatusChanged", params)
    }
}