package br.com.nebulasistemas.pdvpilotoapp

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "PilotoApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Emite evento para o JavaScript de forma segura com retry
   */
  private fun emitEvent(eventName: String, data: String) {
    Handler(Looper.getMainLooper()).postDelayed({
      try {
        val reactContext = reactInstanceManager?.currentReactContext
        if (reactContext != null) {
          reactContext.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, data)
          Log.d("MainActivity", "$eventName event emitted successfully")
        } else {
          Log.w("MainActivity", "ReactContext is null, retrying in 100ms...")
          // Retry após 100ms se o context não estiver pronto
          Handler(Looper.getMainLooper()).postDelayed({
            try {
              reactInstanceManager?.currentReactContext
                ?.getJSModule(RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, data)
              Log.d("MainActivity", "$eventName event emitted successfully (retry)")
            } catch (e: Exception) {
              Log.e("MainActivity", "Error emitting $eventName (retry): ${e.message}")
            }
          }, 100)
        }
      } catch (e: Exception) {
        Log.e("MainActivity", "Error emitting $eventName: ${e.message}")
      }
    }, 50) // Pequeno delay para garantir que o React está pronto
  }

  /**
   * Handle Deep Link callbacks de pagamento e impressão
   * 
   * Chamado quando o app Stone retorna o resultado do pagamento ou impressão
   */
  @SuppressLint("VisibleForTests")
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent) // Importante para singleTop

    try {
      val uri = intent.data
      
      Log.d("MainActivity", "onNewIntent - Action: ${intent.action}, Data: $uri")
      
      if (uri != null) {
        Log.d("MainActivity", "URI: ${uri.toString()}")
        
        val scheme = uri.scheme
        Log.d("MainActivity", "Scheme: $scheme")
        
        // Determinar o tipo de callback baseado no scheme
        when (scheme) {
          "stone_payment_scheme" -> {
            Log.d("MainActivity", "Payment callback received")
            emitEvent("paymentReceived", uri.toString())
          }
          "pdvpiloto_print_return" -> {
            Log.d("MainActivity", "Print callback received - URI: $uri")
            Log.d("PrintTest", uri.toString())
            Log.d("StonePrinter", "Deep Link callback received: $uri")
            emitEvent("printReceived", uri.toString())
          }
          else -> {
            Log.w("MainActivity", "Unknown scheme: $scheme")
            Log.d("PrintTest", "Unknown scheme callback: $uri")
          }
        }
        
        Log.d("MainActivity", "Event emitted for scheme: $scheme")
      }

    } catch (e: Exception) {
      Log.e("MainActivity", "Error: ${e.message}", e)
    }
  }
}
