package com.axolync.android.activities

import java.io.File
import org.junit.Assert.assertTrue
import org.junit.Test

class AndroidTouchDiagnosticsExportGuardTest {

    @Test
    fun `android touch delivery diagnostics remain exportable through the native runtime log surface`() {
        val activitySource = File("src/main/kotlin/com/axolync/android/activities/MainActivity.kt").readText()
        val serverSource = File("src/main/kotlin/com/axolync/android/server/LocalHttpServer.kt").readText()

        assertTrue(activitySource.contains("channel=touch-delivery"))
        assertTrue(activitySource.contains("Native touch delivery decision"))
        assertTrue(serverSource.contains("private const val RUNTIME_NATIVE_LOG_PATH = \"/__axolync/runtime-native-log\""))
        assertTrue(serverSource.contains("RuntimeNativeLogStore.toJsonArray()"))
    }
}
