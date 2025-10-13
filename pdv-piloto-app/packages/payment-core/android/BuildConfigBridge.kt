package br.com.nebulasistemas.pdvpilotoapp.paymentcore

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import br.com.nebulasistemas.pdvpilotoapp.BuildConfig

/**
 * Bridge para expor configurações de build para React Native
 * Permite que o código JS saiba qual adquirente está habilitada
 */
class BuildConfigBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BuildConfig"
    }

    /**
     * Retorna se Stone está habilitada
     */
    @ReactMethod
    fun getEnableStone(promise: Promise) {
        promise.resolve(BuildConfig.ENABLE_STONE)
    }

    /**
     * Retorna se Cielo está habilitada
     */
    @ReactMethod
    fun getEnableCielo(promise: Promise) {
        promise.resolve(BuildConfig.ENABLE_CIELO)
    }

    /**
     * Retorna o nome da adquirente
     */
    @ReactMethod
    fun getAcquirerName(promise: Promise) {
        promise.resolve(BuildConfig.ACQUIRER_NAME)
    }

    /**
     * Retorna o tipo da adquirente
     */
    @ReactMethod
    fun getAcquirerType(promise: Promise) {
        promise.resolve(BuildConfig.ACQUIRER_TYPE)
    }

    /**
     * Retorna o nome do fabricante
     */
    @ReactMethod
    fun getManufacturerName(promise: Promise) {
        promise.resolve(BuildConfig.MANUFACTURER_NAME)
    }

    /**
     * Retorna o tipo do fabricante
     */
    @ReactMethod
    fun getManufacturerType(promise: Promise) {
        promise.resolve(BuildConfig.MANUFACTURER_TYPE)
    }
}
