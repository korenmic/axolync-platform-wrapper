package com.axolync.android.bridge

import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.axolync.android.activities.SplashActivity
import com.axolync.android.services.AudioCaptureService
import com.axolync.android.services.PermissionManager

/**
 * NativeBridge provides minimal bidirectional communication between native Android and web application.
 * Exposed to JavaScript as window.AndroidBridge.
 */
class NativeBridge(
    private val webView: WebView,
    private val audioCaptureService: AudioCaptureService,
    private val permissionManager: PermissionManager
) {

    companion object {
        private const val TAG = "NativeBridge"
    }

    @JavascriptInterface
    fun startAudioCapture(): String {
        // TODO: Start audio capture
        return """{"success": false, "error": "Not implemented"}"""
    }

    @JavascriptInterface
    fun stopAudioCapture(): String {
        // TODO: Stop audio capture
        return """{"success": true}"""
    }

    @JavascriptInterface
    fun checkMicrophonePermission(): String {
        // TODO: Check permission
        return """{"status": "denied"}"""
    }

    @JavascriptInterface
    fun requestMicrophonePermission() {
        // TODO: Request permission
    }

    @JavascriptInterface
    fun openAppSettings() {
        // TODO: Open settings
    }

    @JavascriptInterface
    fun getNetworkStatus(): String {
        // TODO: Get network status
        return """{"online": true}"""
    }

    /**
     * Called by web application when initialization is complete.
     * Signals SplashActivity to transition to MainActivity.
     */
    @JavascriptInterface
    fun appReady() {
        Log.d(TAG, "Web app signaled ready state")
        SplashActivity.signalReady()
    }

    @JavascriptInterface
    fun logError(message: String) {
        Log.e(TAG, "Web app error: $message")
    }

    fun deliverAudioChunk(float32Pcm: FloatArray) {
        // TODO: Deliver audio chunk to JavaScript
    }

    fun notifyLifecycleEvent(event: String) {
        // TODO: Notify web app of lifecycle event
    }

    fun notifyPermissionResult(status: String) {
        // TODO: Notify web app of permission result
    }
}
