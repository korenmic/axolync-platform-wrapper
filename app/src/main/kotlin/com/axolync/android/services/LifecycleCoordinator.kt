package com.axolync.android.services

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import com.axolync.android.bridge.NativeBridge

/**
 * LifecycleCoordinator manages Android lifecycle events and coordinates with web application state.
 * 
 * Requirements: 2.4, 10.1, 10.2, 10.3, 10.4, 10.5
 */
class LifecycleCoordinator(
    private val context: Context,
    private val webView: WebView,
    private val audioCaptureService: AudioCaptureService,
    private val nativeBridge: NativeBridge
) {

    companion object {
        private const val TAG = "LifecycleCoordinator"
        private const val PREFS_NAME = "axolync_lifecycle"
        private const val KEY_WEB_APP_STATE = "web_app_state"
        private const val KEY_AUDIO_WAS_ACTIVE = "audio_was_active"
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private var audioWasActiveBeforePause = false

    /**
     * Handle app pause event.
     * Suspends audio capture and notifies web app.
     * Requirements: 10.1
     */
    fun onAppPause() {
        Log.d(TAG, "App paused")
        
        // Check if audio capture is currently active
        audioWasActiveBeforePause = audioCaptureService.isCapturing()
        
        // Suspend audio capture if active
        if (audioWasActiveBeforePause) {
            audioCaptureService.stopCapture()
            Log.d(TAG, "Audio capture suspended")
        }
        
        // Notify web app of pause event
        nativeBridge.notifyLifecycleEvent("pause")
    }

    /**
     * Handle app resume event.
     * Restores audio capture if it was previously active.
     * Requirements: 10.2
     */
    fun onAppResume() {
        Log.d(TAG, "App resumed")
        
        // Restore audio capture if it was active before pause
        if (audioWasActiveBeforePause) {
            // Set callback for audio chunks
            audioCaptureService.setAudioCallback { audioData ->
                nativeBridge.deliverAudioChunk(audioData)
            }
            
            // Start capture
            audioCaptureService.startCapture()
            Log.d(TAG, "Audio capture restored")
        }
        
        // Notify web app of resume event
        nativeBridge.notifyLifecycleEvent("resume")
        
        // Reset flag
        audioWasActiveBeforePause = false
    }

    /**
     * Handle app going to background.
     * Persists web app state to SharedPreferences.
     * Requirements: 10.3, 10.4
     */
    fun onAppBackground() {
        Log.d(TAG, "App moved to background")
        
        // Extract web app state via JavaScript
        webView.evaluateJavascript(
            "(function() { return window.AxolyncNative && window.AxolyncNative.getState ? JSON.stringify(window.AxolyncNative.getState()) : '{}'; })();"
        ) { stateJson ->
            if (stateJson != null && stateJson != "null") {
                // Remove quotes from JavaScript string result
                val cleanedState = stateJson.trim('"').replace("\\\"", "\"")
                
                // Save to SharedPreferences
                prefs.edit().apply {
                    putString(KEY_WEB_APP_STATE, cleanedState)
                    putBoolean(KEY_AUDIO_WAS_ACTIVE, audioCaptureService.isCapturing())
                    apply()
                }
                
                Log.d(TAG, "Web app state persisted")
            }
        }
        
        // Notify web app
        nativeBridge.notifyLifecycleEvent("background")
    }

    /**
     * Handle app coming to foreground.
     * Restores web app state from SharedPreferences.
     * Requirements: 10.3, 10.4
     */
    fun onAppForeground() {
        Log.d(TAG, "App moved to foreground")
        
        // Restore web app state from SharedPreferences
        val savedState = prefs.getString(KEY_WEB_APP_STATE, null)
        if (savedState != null) {
            // Inject state back into web app
            val javascript = """
                if (window.AxolyncNative && window.AxolyncNative.setState) {
                    window.AxolyncNative.setState($savedState);
                }
            """.trimIndent()
            
            webView.evaluateJavascript(javascript, null)
            Log.d(TAG, "Web app state restored")
        }
        
        // Notify web app
        nativeBridge.notifyLifecycleEvent("foreground")
    }

    /**
     * Handle low memory warning.
     * Notifies web app to release resources.
     * Requirements: 10.5
     */
    fun onLowMemory() {
        Log.w(TAG, "Low memory warning received")
        
        // Notify web app to release resources
        nativeBridge.notifyLifecycleEvent("lowMemory")
    }

    /**
     * Save current state to Bundle for activity recreation.
     * Requirements: 10.3
     */
    fun saveState(): Bundle {
        val bundle = Bundle()
        bundle.putBoolean(KEY_AUDIO_WAS_ACTIVE, audioCaptureService.isCapturing())
        
        // Save web app state
        val savedState = prefs.getString(KEY_WEB_APP_STATE, null)
        if (savedState != null) {
            bundle.putString(KEY_WEB_APP_STATE, savedState)
        }
        
        return bundle
    }

    /**
     * Restore state from Bundle after activity recreation.
     * Requirements: 10.4
     */
    fun restoreState(bundle: Bundle) {
        // Restore audio capture state
        val audioWasActive = bundle.getBoolean(KEY_AUDIO_WAS_ACTIVE, false)
        if (audioWasActive) {
            audioWasActiveBeforePause = true
        }
        
        // Restore web app state
        val savedState = bundle.getString(KEY_WEB_APP_STATE)
        if (savedState != null) {
            prefs.edit().putString(KEY_WEB_APP_STATE, savedState).apply()
        }
    }
}
