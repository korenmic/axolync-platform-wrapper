package com.axolync.android.services

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * PermissionManager handles Android runtime permissions for microphone access.
 * 
 * Validates: Requirements 3.1, 3.2
 */
class PermissionManager(private val activity: Activity) {

    enum class PermissionStatus {
        GRANTED, DENIED, DENIED_PERMANENTLY
    }

    companion object {
        const val MICROPHONE_PERMISSION_REQUEST_CODE = 1001
        private const val MICROPHONE_PERMISSION = Manifest.permission.RECORD_AUDIO
    }

    /**
     * Check the current status of microphone permission.
     * 
     * @return PermissionStatus indicating whether permission is granted, denied, or permanently denied
     */
    fun checkMicrophonePermission(): PermissionStatus {
        val permissionGranted = ContextCompat.checkSelfPermission(
            activity,
            MICROPHONE_PERMISSION
        ) == PackageManager.PERMISSION_GRANTED

        return when {
            permissionGranted -> PermissionStatus.GRANTED
            !ActivityCompat.shouldShowRequestPermissionRationale(activity, MICROPHONE_PERMISSION) 
                && !isFirstTimeAsking() -> PermissionStatus.DENIED_PERMANENTLY
            else -> PermissionStatus.DENIED
        }
    }

    /**
     * Request microphone permission from the user.
     * The result will be delivered to the activity's onRequestPermissionsResult callback.
     */
    fun requestMicrophonePermission() {
        markPermissionAsked()
        ActivityCompat.requestPermissions(
            activity,
            arrayOf(MICROPHONE_PERMISSION),
            MICROPHONE_PERMISSION_REQUEST_CODE
        )
    }

    /**
     * Determine if we should show a rationale explaining why microphone permission is needed.
     * 
     * @return true if the system recommends showing a rationale, false otherwise
     */
    fun shouldShowRationale(): Boolean {
        return ActivityCompat.shouldShowRequestPermissionRationale(
            activity,
            MICROPHONE_PERMISSION
        )
    }

    /**
     * Open the app's settings page where the user can manually grant permissions.
     * This is typically used when permission has been permanently denied.
     */
    fun openAppSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", activity.packageName, null)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        activity.startActivity(intent)
    }

    /**
     * Check if this is the first time asking for the permission.
     * Uses SharedPreferences to track permission request history.
     */
    private fun isFirstTimeAsking(): Boolean {
        val prefs = activity.getSharedPreferences("permissions", Activity.MODE_PRIVATE)
        return !prefs.getBoolean("microphone_asked", false)
    }

    /**
     * Mark that we have asked for the microphone permission.
     * This helps distinguish between first denial and permanent denial.
     */
    private fun markPermissionAsked() {
        val prefs = activity.getSharedPreferences("permissions", Activity.MODE_PRIVATE)
        prefs.edit().putBoolean("microphone_asked", true).apply()
    }

    /**
     * Handle the permission result from the system.
     * Call this from the activity's onRequestPermissionsResult callback.
     * 
     * @param requestCode The request code passed to requestPermissions
     * @param permissions The requested permissions
     * @param grantResults The grant results for the corresponding permissions
     * @return PermissionStatus indicating the result, or null if this wasn't a microphone permission request
     */
    fun handlePermissionResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ): PermissionStatus? {
        if (requestCode != MICROPHONE_PERMISSION_REQUEST_CODE) {
            return null
        }

        val microphoneIndex = permissions.indexOf(MICROPHONE_PERMISSION)
        if (microphoneIndex == -1) {
            return null
        }

        return if (grantResults[microphoneIndex] == PackageManager.PERMISSION_GRANTED) {
            PermissionStatus.GRANTED
        } else {
            checkMicrophonePermission()
        }
    }
}
