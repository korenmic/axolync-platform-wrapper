package com.axolync.android.bridge

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.axolync.android.R
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import kotlin.math.absoluteValue

private const val NOTIFICATION_PERMISSION_ALIAS = "notifications"
private const val DETECTED_CHANNEL_ID = "axolync_live_song_detected"
private const val LYRICS_READY_CHANNEL_ID = "axolync_live_song_lyrics_ready"

@CapacitorPlugin(
    name = "AxolyncLiveSongNotification",
    permissions = [
        Permission(
            strings = [Manifest.permission.POST_NOTIFICATIONS],
            alias = NOTIFICATION_PERMISSION_ALIAS
        )
    ]
)
class AxolyncLiveSongNotificationPlugin : Plugin() {

    override fun load() {
        ensureNotificationChannels()
    }

    @PluginMethod
    fun getLiveSongNotificationCapabilities(call: PluginCall) {
        call.resolve(capabilities())
    }

    @PluginMethod
    fun requestNotificationPermission(call: PluginCall) {
        if (hasNotificationPermission()) {
            call.resolve(permissionResult("granted"))
            return
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            call.resolve(permissionResult("granted"))
            return
        }
        requestPermissionForAlias(
            NOTIFICATION_PERMISSION_ALIAS,
            call,
            "notificationPermissionCallback"
        )
    }

    @PermissionCallback
    private fun notificationPermissionCallback(call: PluginCall) {
        call.resolve(
            permissionResult(
                if (hasNotificationPermission()) "granted" else "denied",
                if (hasNotificationPermission()) null else "android notification permission denied"
            )
        )
    }

    @PluginMethod
    fun showLiveSongNotification(call: PluginCall) {
        if (!hasNotificationPermission()) {
            call.resolve(result("denied", "android notification permission denied"))
            return
        }
        val id = call.getString("id").orEmpty().trim()
        if (id.isEmpty()) {
            call.resolve(result("failed", "missing notification id"))
            return
        }
        ensureNotificationChannels()
        val title = call.getString("title").orEmpty().trim().ifEmpty { "Detected song" }
        val body = call.getString("body").orEmpty().trim()
        val buzz = call.getBoolean("buzz", false) == true
        val silent = call.getBoolean("silent", true) != false
        val channelId = if (buzz) LYRICS_READY_CHANNEL_ID else DETECTED_CHANNEL_ID
        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(false)
            .setOngoing(false)
            .setOnlyAlertOnce(false)
            .setPriority(if (buzz) NotificationCompat.PRIORITY_DEFAULT else NotificationCompat.PRIORITY_LOW)
            .setDefaults(0)

        if (buzz) {
            builder.setVibrate(longArrayOf(0L, 160L, 80L, 160L))
        } else {
            builder.setSilent(silent)
            builder.setVibrate(longArrayOf(0L))
        }

        NotificationManagerCompat.from(context).notify(notificationId(id), builder.build())
        call.resolve(result("success"))
    }

    @PluginMethod
    fun clearLiveSongNotification(call: PluginCall) {
        val id = call.getString("id").orEmpty().trim()
        if (id.isEmpty()) {
            call.resolve(result("failed", "missing notification id"))
            return
        }
        NotificationManagerCompat.from(context).cancel(notificationId(id))
        call.resolve(result("success"))
    }

    private fun hasNotificationPermission(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return true
        }
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun ensureNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(
            NotificationChannel(
                DETECTED_CHANNEL_ID,
                "Axolync song detected",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Quiet notifications when Axolync detects a song."
                setSound(null, null)
                enableVibration(false)
            }
        )
        notificationManager.createNotificationChannel(
            NotificationChannel(
                LYRICS_READY_CHANNEL_ID,
                "Axolync lyrics ready",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Buzz-only notifications when synchronized lyrics are ready."
                setSound(null, null)
                enableVibration(true)
                vibrationPattern = longArrayOf(0L, 160L, 80L, 160L)
            }
        )
    }

    private fun notificationId(id: String): Int =
        id.hashCode().takeIf { it != Int.MIN_VALUE }?.absoluteValue ?: 1

    private fun capabilities(): JSObject = JSObject().apply {
        put("supportsPermissionRequest", Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
        put("supportsSilent", true)
        put("supportsBuzz", true)
        put("supportsReplace", true)
        put("supportsClear", true)
    }

    private fun permissionResult(state: String, reason: String? = null): JSObject = JSObject().apply {
        put("state", state)
        if (reason != null) {
            put("reason", reason)
        }
    }

    private fun result(status: String, reason: String? = null): JSObject = JSObject().apply {
        put("status", status)
        if (reason != null) {
            put("reason", reason)
        }
    }
}
