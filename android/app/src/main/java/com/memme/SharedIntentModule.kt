package com.memme

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SharedIntentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SharedIntentModule"

    @ReactMethod
    fun getSharedURL(promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("memme_share", 0)
        val url = prefs.getString("sharedURL", null)
        android.util.Log.d("MEMME", "🔥 getSharedURL: $url")
        promise.resolve(url)
    }

    @ReactMethod
    fun clearSharedURL(promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("memme_share", 0)
        prefs.edit().remove("sharedURL").apply()
        android.util.Log.d("MEMME", "🔥 clearSharedURL called")
        promise.resolve(null)
    }
}
