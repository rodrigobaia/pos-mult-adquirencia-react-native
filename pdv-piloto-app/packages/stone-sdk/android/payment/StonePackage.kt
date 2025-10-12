package br.com.pdvflow.stone

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Stone Package
 * 
 * Registra todos os Native Modules Stone (Payment + Printer)
 */
class StonePackage : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(
        StoneBridge(reactContext),
        StonePrinterBridge(reactContext)
    )
    
    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}