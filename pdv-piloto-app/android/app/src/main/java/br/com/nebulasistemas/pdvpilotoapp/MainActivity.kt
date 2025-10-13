package br.com.nebulasistemas.pdvpilotoapp

import android.annotation.SuppressLint
import android.content.Context
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

  // Fila de eventos pendentes enquanto React não está pronto
  private val pendingEvents = mutableListOf<Pair<String, String>>()
  private val pendingEventsHandler = Handler(Looper.getMainLooper())
  private var cachedReactContext: com.facebook.react.bridge.ReactContext? = null
  
  private val processPendingEventsRunnable = object : Runnable {
    override fun run() {
      if (pendingEvents.isNotEmpty()) {
        processPendingEvents()
        // Continuar tentando a cada segundo se ainda houver eventos
        if (pendingEvents.isNotEmpty()) {
          pendingEventsHandler.postDelayed(this, 1000)
        }
      }
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    
    Log.d("MainActivity", "🟢 onCreate called")
    Log.d("MainActivity", "Intent action: ${intent?.action}")
    Log.d("MainActivity", "Intent data: ${intent?.data}")
    
    // Processar Deep Link se app foi aberto por ele
    handleDeepLinkIntent(intent)
    
    // Iniciar timer periódico para processar eventos pendentes
    pendingEventsHandler.postDelayed(processPendingEventsRunnable, 2000)
  }

  override fun onResume() {
    super.onResume()
    
    Log.d("MainActivity", "🟢 onResume called")
    Log.d("MainActivity", "Current intent data: ${intent?.data}")
    
    // Processar Deep Link do intent atual (pode ter mudado)
    handleDeepLinkIntent(intent)
    
    // Tentar processar eventos pendentes imediatamente ao voltar ao foco
    pendingEventsHandler.post(processPendingEventsRunnable)
    // Failsafe adicional: se a Activity tiver sido retomada a partir do app de impressão
    // e a UI estiver em branco, reemitir o intent atual e trazer Activity ao topo
    try {
      intent?.data?.let { data ->
        if (data.scheme == "pdvpiloto_print_return") {
          val bringToFront = Intent(this@MainActivity, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
            addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
          }
          startActivity(bringToFront)
          Log.d("MainActivity", "🛟 Failsafe bringToFront after print on onResume")
        }
      }
    } catch (e: Exception) {
      Log.e("MainActivity", "Failsafe error: ${e.message}")
    }
  }

  override fun onPause() {
    super.onPause()
    // Remover callbacks quando pausar para não vazar memória
    pendingEventsHandler.removeCallbacks(processPendingEventsRunnable)
  }

  override fun onDestroy() {
    super.onDestroy()
    // Limpar ao destruir
    pendingEventsHandler.removeCallbacks(processPendingEventsRunnable)
    pendingEvents.clear()
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
   * Obtém ReactContext tentando múltiplas abordagens e faz cache
   */
  private fun getReactContext(): com.facebook.react.bridge.ReactContext? {
    // Se já temos cache, usar
    cachedReactContext?.let { return it }
    
    try {
      // Tentar via ReactNativeHost (abordagem clássica)
      val reactNativeHost = (application as? com.facebook.react.ReactApplication)?.reactNativeHost
      val reactInstanceManager = reactNativeHost?.reactInstanceManager
      reactInstanceManager?.currentReactContext?.let {
        cachedReactContext = it
        Log.d("MainActivity", "✅ ReactContext obtained via ReactNativeHost")
        return it
      }
      
      // Tentar via ReactActivityDelegate 
      try {
        val delegateField = this::class.java.superclass?.getDeclaredField("mReactDelegate")
        delegateField?.isAccessible = true
        val delegate = delegateField?.get(this)
        
        val contextField = delegate?.javaClass?.getDeclaredField("mReactContext")
        contextField?.isAccessible = true
        val context = contextField?.get(delegate) as? com.facebook.react.bridge.ReactContext
        
        context?.let {
          cachedReactContext = it
          Log.d("MainActivity", "✅ ReactContext obtained via Delegate")
          return it
        }
      } catch (e: Exception) {
        Log.d("MainActivity", "Could not get context via delegate: ${e.message}")
      }
      
    } catch (e: Exception) {
      Log.d("MainActivity", "Error getting ReactContext: ${e.message}")
    }
    
    return null
  }

  /**
   * Processa eventos pendentes na fila e do SharedPreferences
   */
  private fun processPendingEvents() {
    try {
      val reactContext = getReactContext()
      
      if (reactContext != null) {
        // Primeiro, carregar evento salvo do SharedPreferences
        loadAndProcessSavedEvent()
        
        // Depois, processar eventos da fila em memória
        if (pendingEvents.isNotEmpty()) {
          Log.d("MainActivity", "🚀 Processing ${pendingEvents.size} pending events...")
          val eventsToProcess = pendingEvents.toList()
          pendingEvents.clear()
          
          eventsToProcess.forEach { (eventName, data) ->
            try {
              reactContext.getJSModule(RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, data)
              Log.d("MainActivity", "✅ $eventName emitted from pending queue")
            } catch (e: Exception) {
              Log.e("MainActivity", "❌ Error emitting pending $eventName: ${e.message}")
            }
          }
        }
      } else {
        if (pendingEvents.isNotEmpty()) {
          Log.w("MainActivity", "⏳ ReactContext still null, ${pendingEvents.size} events waiting...")
        }
      }
    } catch (e: Exception) {
      Log.e("MainActivity", "❌ Error processing pending events: ${e.message}")
    }
  }

  /**
   * Salva evento no SharedPreferences para processar depois
   */
  private fun saveEventToPrefs(eventName: String, data: String) {
    try {
      val prefs = getSharedPreferences("PDVPilotoEvents", Context.MODE_PRIVATE)
      prefs.edit().putString("pending_event_name", eventName).apply()
      prefs.edit().putString("pending_event_data", data).apply()
      Log.d("MainActivity", "💾 $eventName saved to SharedPreferences")
    } catch (e: Exception) {
      Log.e("MainActivity", "❌ Error saving to prefs: ${e.message}")
    }
  }

  /**
   * Carrega e processa evento salvo no SharedPreferences
   */
  private fun loadAndProcessSavedEvent() {
    try {
      val prefs = getSharedPreferences("PDVPilotoEvents", Context.MODE_PRIVATE)
      val eventName = prefs.getString("pending_event_name", null)
      val eventData = prefs.getString("pending_event_data", null)
      
      if (eventName != null && eventData != null) {
        Log.d("MainActivity", "📥 Found saved event: $eventName")
        val reactContext = getReactContext()
        
        if (reactContext != null) {
          reactContext.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, eventData)
          Log.d("MainActivity", "✅ $eventName emitted from SharedPreferences")
          
          // Limpar após enviar
          prefs.edit().remove("pending_event_name").remove("pending_event_data").apply()
        } else {
          Log.w("MainActivity", "⏳ ReactContext still null for saved event")
        }
      }
    } catch (e: Exception) {
      Log.e("MainActivity", "❌ Error loading from prefs: ${e.message}")
    }
  }

  /**
   * Emite evento para o JavaScript de forma segura
   * Se React não estiver pronto, salva no SharedPreferences
   */
  private fun emitEvent(eventName: String, data: String) {
    Handler(Looper.getMainLooper()).postDelayed({
      try {
        val reactContext = getReactContext()
        
        if (reactContext != null) {
          reactContext.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, data)
          Log.d("MainActivity", "✅ $eventName emitted successfully")
        } else {
          // React não está pronto, salvar em SharedPreferences
          saveEventToPrefs(eventName, data)
          pendingEvents.add(Pair(eventName, data))
          Log.w("MainActivity", "📋 $eventName saved (${pendingEvents.size} events waiting)")
        }
      } catch (e: Exception) {
        Log.e("MainActivity", "❌ Error emitting $eventName: ${e.message}", e)
        // Em caso de erro, salvar também
        saveEventToPrefs(eventName, data)
        if (!pendingEvents.any { it.first == eventName && it.second == data }) {
          pendingEvents.add(Pair(eventName, data))
        }
      }
    }, 200)
  }

  /**
   * Processa Deep Link do intent
   */
  private fun handleDeepLinkIntent(intent: Intent?) {
    if (intent == null) return
    
    try {
      val uri = intent.data
      
      Log.d("MainActivity", "═══════════════════════════════════════")
      Log.d("MainActivity", "handleDeepLinkIntent - CHECKING INTENT")
      Log.d("MainActivity", "Action: ${intent.action}")
      Log.d("MainActivity", "Data URI: $uri")
      
      if (uri != null) {
        val scheme = uri.scheme
        Log.d("MainActivity", "Scheme: $scheme")
        Log.d("MainActivity", "Host: ${uri.host}")
        Log.d("MainActivity", "Path: ${uri.path}")
        
        // Log ALL query parameters
        uri.queryParameterNames?.forEach { paramName ->
          val paramValue = uri.getQueryParameter(paramName)
          Log.d("MainActivity", "Param: $paramName = $paramValue")
        }
        
        Log.d("MainActivity", "Full URI: ${uri.toString()}")
        Log.d("MainActivity", "═══════════════════════════════════════")
        
        // Determinar o tipo de callback baseado no scheme
        when (scheme) {
          "stone_payment_scheme" -> {
            Log.d("MainActivity", "✅ Payment callback detected")
            emitEvent("paymentReceived", uri.toString())
          }
          "pdvpiloto_print_return" -> {
            Log.d("MainActivity", "✅ Print callback detected")
            Log.d("PrintTest", uri.toString())
            Log.d("StonePrinter", "Deep Link callback received: $uri")
            emitEvent("printReceived", uri.toString())

            try {
              // Trazer nossa activity para frente imediatamente após o retorno da impressão
              val bringToFront = Intent(this@MainActivity, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
              }
              startActivity(bringToFront)
              Log.d("MainActivity", "📱 Brought MainActivity to foreground after print")
            } catch (e: Exception) {
              Log.e("MainActivity", "❌ Error bringing activity to front: ${e.message}")
            }
          }
          else -> {
            Log.w("MainActivity", "❌ Unknown scheme: $scheme")
            Log.d("PrintTest", "Unknown scheme callback: $uri")
          }
        }
        
      } else {
        Log.d("MainActivity", "No Deep Link data in intent")
      }

    } catch (e: Exception) {
      Log.e("MainActivity", "❌ Error processing Deep Link: ${e.message}", e)
    }
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
    
    Log.d("MainActivity", "🔔 onNewIntent called")
    handleDeepLinkIntent(intent)
  }
}
