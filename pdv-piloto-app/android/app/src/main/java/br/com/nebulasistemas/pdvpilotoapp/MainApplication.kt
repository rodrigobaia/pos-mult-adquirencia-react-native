package br.com.nebulasistemas.pdvpilotoapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

// Import Stone package
import br.com.pdvflow.stone.StonePackage

// Import BuildConfig package (temporariamente comentado)
// import br.com.nebulasistemas.pdvpilotoapp.paymentcore.BuildConfigPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // SEMPRE adicionar BuildConfigPackage para expor configurações (temporariamente comentado)
              // add(BuildConfigPackage())
              
              // Adicionar apenas a adquirente habilitada em tempo de compilação
              if (BuildConfig.ENABLE_STONE) {
                add(StonePackage())
              }
              
              // Para Cielo, por enquanto não adicionamos pacotes específicos
              // pois ainda não estão implementados completamente
              // if (BuildConfig.ENABLE_CIELO) {
              //   add(CieloPackage())
              //   add(CieloPrinterPackage())
              // }
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    
    // NOTA: StoneStart.init() causa crash no Positivo L400 devido a componentes de segurança
    // Para usar impressão, será necessário:
    // 1. Usar outro método de impressão (ex: Intent para app Stone Printer)
    // 2. Ou usar apenas em modo release com certificado correto
    android.util.Log.d("MainApplication", "PDV Piloto inicializado")
  }
}