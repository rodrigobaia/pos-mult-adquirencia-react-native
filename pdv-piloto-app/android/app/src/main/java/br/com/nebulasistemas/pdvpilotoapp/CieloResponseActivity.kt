package br.com.nebulasistemas.pdvpilotoapp

import android.content.Intent
import android.os.Bundle
import android.util.Base64
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import br.com.nebulasistemas.pdvpilotoapp.MainApplication

/**
 * Activity para receber respostas da Cielo LIO via Deep Link
 */
class CieloResponseActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "CieloResponseActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        Log.d(TAG, "CieloResponseActivity criada")
        
        // Processar intent
        handleIntent(intent)
        
        // Finalizar activity
        finish()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        
        Log.d(TAG, "Nova intent recebida")
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        try {
            Log.d(TAG, "Processando intent: ${intent.action}")
            Log.d(TAG, "Intent data: ${intent.data}")
            
            if (Intent.ACTION_VIEW == intent.action) {
                val uri = intent.data
                if (uri != null) {
                    val response = uri.getQueryParameter("response")
                    val responseCode = uri.getQueryParameter("responsecode")
                    
                    Log.d(TAG, "Response: $response")
                    Log.d(TAG, "Response Code: $responseCode")
                    
                    if (response != null) {
                        // Decodificar Base64
                        val decodedData = Base64.decode(response, Base64.DEFAULT)
                        val jsonResponse = String(decodedData)
                        
                        Log.d(TAG, "JSON Response: $jsonResponse")
                        
                        // Emitir evento para React Native
                        emitCieloResponse(jsonResponse, responseCode)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao processar intent da Cielo", e)
        }
    }

    private fun emitCieloResponse(jsonResponse: String, responseCode: String?) {
        try {
            val params = Arguments.createMap().apply {
                putString("response", jsonResponse)
                putString("responseCode", responseCode)
                putString("source", "cielo")
            }
            
            // Emitir evento para React Native
            val reactContext = (application as MainApplication).reactNativeHost.reactInstanceManager.currentReactContext
            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("CieloPaymentResponse", params)
                
            Log.d(TAG, "Evento CieloPaymentResponse emitido")
            
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao emitir evento da Cielo", e)
        }
    }
}
