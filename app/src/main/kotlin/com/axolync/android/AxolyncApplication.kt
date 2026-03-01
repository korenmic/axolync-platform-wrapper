package com.axolync.android

import android.app.Application
import android.util.Log
import com.axolync.android.server.ServerManager

/**
 * Application class for Axolync Android wrapper.
 * Initializes ServerManager with ASYNC startup to avoid blocking onCreate().
 * 
 * Server lifetime equals process lifetime.
 * No explicit stop needed (no reliance on onTerminate).
 * 
 * Requirements: 11.10
 */
class AxolyncApplication : Application() {
    
    companion object {
        private const val TAG = "AxolyncApplication"
    }
    
    override fun onCreate() {
        super.onCreate()
        
        Log.i(TAG, "Application starting")
        
        // Initialize ServerManager (singleton)
        val serverManager = ServerManager.getInstance(this)
        
        // Start server ASYNCHRONOUSLY (does not block onCreate)
        serverManager.startServerAsync()
        
        Log.i(TAG, "Server start initiated asynchronously")
    }
    
    // DO NOT implement onTerminate() for server cleanup
    // Server lifetime equals process lifetime
}
