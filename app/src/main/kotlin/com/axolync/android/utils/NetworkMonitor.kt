package com.axolync.android.utils

import android.content.Context

/**
 * NetworkMonitor detects and reports network availability.
 */
class NetworkMonitor(private val context: Context) {

    enum class ConnectionType {
        WIFI, CELLULAR, NONE
    }

    fun isOnline(): Boolean {
        // TODO: Check network connectivity
        return false
    }

    fun getConnectionType(): ConnectionType {
        // TODO: Get connection type
        return ConnectionType.NONE
    }

    fun registerCallback(callback: (Boolean) -> Unit) {
        // TODO: Register network callback
    }

    fun unregisterCallback() {
        // TODO: Unregister callback
    }
}
