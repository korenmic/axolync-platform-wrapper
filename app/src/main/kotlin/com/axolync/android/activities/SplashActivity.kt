package com.axolync.android.activities

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.axolync.android.R

/**
 * SplashActivity displays a splash screen during app initialization.
 * Transitions to MainActivity when the web application signals ready state or timeout is reached.
 * 
 * Requirements:
 * - 2.1: Display splash screen during initialization
 * - 2.2: Maintain splash screen until ready signal or timeout (5 seconds max)
 */
class SplashActivity : AppCompatActivity() {

    private val handler = Handler(Looper.getMainLooper())
    private val splashTimeout = 5000L // 5 seconds max
    private var hasNavigated = false

    companion object {
        @Volatile
        private var readyCallback: (() -> Unit)? = null

        /**
         * Called by MainActivity/NativeBridge when the web app signals ready state.
         * This triggers navigation from splash to main activity.
         */
        fun signalReady() {
            readyCallback?.invoke()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // Start initialization check
        checkInitialization()
    }

    /**
     * Implements initialization check logic with timeout.
     * Waits for ready signal from MainActivity or times out after 5 seconds.
     */
    private fun checkInitialization() {
        // Set up callback for ready signal
        readyCallback = {
            if (!hasNavigated) {
                handler.post {
                    navigateToMain()
                }
            }
        }

        // Set up timeout - navigate to main after 5 seconds regardless
        handler.postDelayed({
            if (!hasNavigated) {
                navigateToMain()
            }
        }, splashTimeout)

        // Start MainActivity immediately (it will load in background)
        // This allows the WebView to initialize while splash is showing
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    /**
     * Navigates to MainActivity and finishes splash activity.
     * Ensures navigation only happens once.
     */
    private fun navigateToMain() {
        if (hasNavigated) return
        hasNavigated = true
        
        // MainActivity is already started, just finish splash
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacksAndMessages(null)
        readyCallback = null
    }
}
