package com.axolync.android.services

import android.os.Bundle
import android.webkit.WebView

/**
 * LifecycleCoordinator manages Android lifecycle events and coordinates with web application state.
 */
class LifecycleCoordinator(
    private val webView: WebView,
    private val audioCaptureService: AudioCaptureService
) {

    fun onAppPause() {
        // TODO: Suspend audio capture, notify web app
    }

    fun onAppResume() {
        // TODO: Restore audio capture if previously active
    }

    fun onAppBackground() {
        // TODO: Persist web app state
    }

    fun onAppForeground() {
        // TODO: Restore web app state
    }

    fun onLowMemory() {
        // TODO: Notify web app to release resources
    }

    fun saveState(): Bundle {
        // TODO: Save state to bundle
        return Bundle()
    }

    fun restoreState(bundle: Bundle) {
        // TODO: Restore state from bundle
    }
}
