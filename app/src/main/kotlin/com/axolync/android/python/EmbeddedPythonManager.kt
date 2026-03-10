package com.axolync.android.python

import android.content.Context
import android.util.Log
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform

class EmbeddedPythonManager internal constructor(
    private val appContext: Context,
    private val launcher: PythonRuntimeLauncher = ChaquopyPythonRuntimeLauncher
) {

    interface PythonRuntimeLauncher {
        fun isStarted(): Boolean
        fun start(context: Context)
        fun getInstance(): Any
    }

    private object ChaquopyPythonRuntimeLauncher : PythonRuntimeLauncher {
        override fun isStarted(): Boolean = Python.isStarted()

        override fun start(context: Context) {
            Python.start(AndroidPlatform(context))
        }

        override fun getInstance(): Any = Python.getInstance()
    }

    @Volatile
    private var status = EmbeddedPythonRuntimeStatus()

    @Volatile
    private var pythonRuntime: Any? = null

    fun startIfNeeded(): EmbeddedPythonRuntimeStatus = synchronized(this) {
        if (status.startupSucceeded && pythonRuntime != null) {
            status = status.copy(reusedExistingRuntime = true)
            Log.i(TAG, "Embedded Python runtime already ready; reusing existing runtime")
            return status
        }

        if (status.startupAttempted && !status.startupSucceeded) {
            Log.w(
                TAG,
                "Embedded Python runtime previously failed at ${status.startupFailureStage}: ${status.startupFailureMessage}"
            )
            return status
        }

        val reusedExistingRuntime = launcher.isStarted()
        try {
            if (!reusedExistingRuntime) {
                Log.i(TAG, "Starting embedded Python runtime")
                launcher.start(appContext)
            } else {
                Log.i(TAG, "Embedded Python runtime already started by host process; acquiring instance")
            }
        } catch (error: Exception) {
            status = EmbeddedPythonRuntimeStatus(
                startupAttempted = true,
                startupSucceeded = false,
                startupFailureStage = "start",
                startupFailureMessage = error.message ?: error.javaClass.simpleName,
                reusedExistingRuntime = reusedExistingRuntime
            )
            Log.e(TAG, "Embedded Python runtime failed to start", error)
            return status
        }

        return try {
            pythonRuntime = launcher.getInstance()
            status = EmbeddedPythonRuntimeStatus(
                startupAttempted = true,
                startupSucceeded = true,
                startupFailureStage = null,
                startupFailureMessage = null,
                reusedExistingRuntime = reusedExistingRuntime
            )
            Log.i(TAG, "Embedded Python runtime is ready")
            status
        } catch (error: Exception) {
            status = EmbeddedPythonRuntimeStatus(
                startupAttempted = true,
                startupSucceeded = false,
                startupFailureStage = "get-instance",
                startupFailureMessage = error.message ?: error.javaClass.simpleName,
                reusedExistingRuntime = reusedExistingRuntime
            )
            Log.e(TAG, "Embedded Python runtime failed after start during instance acquisition", error)
            status
        }
    }

    fun getStatus(): EmbeddedPythonRuntimeStatus = status

    fun isReady(): Boolean = status.startupSucceeded && pythonRuntime != null

    fun getPython(): Python? = pythonRuntime as? Python

    companion object {
        private const val TAG = "EmbeddedPythonManager"

        @Volatile
        private var instance: EmbeddedPythonManager? = null

        fun getInstance(context: Context): EmbeddedPythonManager {
            return instance ?: synchronized(this) {
                instance ?: EmbeddedPythonManager(context.applicationContext).also { instance = it }
            }
        }
    }
}
