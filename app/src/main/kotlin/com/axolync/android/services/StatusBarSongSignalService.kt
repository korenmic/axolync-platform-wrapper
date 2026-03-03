package com.axolync.android.services

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import com.axolync.android.bridge.StatusBarSongSignalStore
import com.axolync.android.bridge.parseStatusBarSongSignal

/**
 * Notification listener used by SongSense status-bar adapter path.
 * Captures latest song-like status-bar signal (title/artist) for JS bridge retrieval.
 */
class StatusBarSongSignalService : NotificationListenerService() {
    companion object {
        private const val TAG = "StatusBarSongSignalSvc"
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        try {
            val extras = sbn.notification.extras ?: return
            val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()
            val sourcePackage = sbn.packageName ?: "unknown"

            val signal = parseStatusBarSongSignal(
                titleRaw = title,
                textRaw = text,
                subTextRaw = subText,
                sourcePackage = sourcePackage,
                capturedAtMs = sbn.postTime
            ) ?: return

            StatusBarSongSignalStore.update(signal)
            Log.d(TAG, "Captured status-bar song signal from $sourcePackage")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to parse notification payload", e)
        }
    }
}
