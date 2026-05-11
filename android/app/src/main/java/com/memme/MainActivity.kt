package com.memme

import android.content.Intent
import android.os.Bundle
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MEMME"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    WindowCompat.setDecorFitsSystemWindows(window, true)
    handleShareIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleShareIntent(intent)
  }

  private fun handleShareIntent(intent: Intent?) {
    android.util.Log.d("MEMME", "🔥 handleShareIntent called: ${intent?.action}")

    if (intent?.action == Intent.ACTION_SEND) {
      // text/plain 형식
      if (intent.type == "text/plain") {
        val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
        android.util.Log.d("MEMME", "🔥 Shared text (text/plain): $sharedText")

        if (!sharedText.isNullOrBlank()) {
          val prefs = getSharedPreferences("memme_share", MODE_PRIVATE)
          prefs.edit().putString("sharedURL", sharedText).apply()
          android.util.Log.d("MEMME", "🔥 Saved to SharedPreferences: $sharedText")
        }
      }
      // text/* 형식 (더 넓은 범위)
      else if (intent.type?.startsWith("text/") == true) {
        val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
        android.util.Log.d("MEMME", "🔥 Shared text (text/*): $sharedText")

        if (!sharedText.isNullOrBlank()) {
          val prefs = getSharedPreferences("memme_share", MODE_PRIVATE)
          prefs.edit().putString("sharedURL", sharedText).apply()
          android.util.Log.d("MEMME", "🔥 Saved to SharedPreferences: $sharedText")
        }
      }
    }
  }
}