package com.axolync.android.bridge

import java.io.File
import org.junit.Assert.assertTrue
import org.junit.Test

class NativeBridgeEmbeddedLyricflowWiringTest {

    @Test
    fun `native bridge exposes embedded lyricflow runtime status and direct invocation hooks`() {
        val source = File("src/main/kotlin/com/axolync/android/bridge/NativeBridge.kt").readText()

        assertTrue(source.contains("fun getEmbeddedLyricflowRuntimeStatus(): String"))
        assertTrue(source.contains("EmbeddedPythonManager.getInstance(context).runSelfTest()"))
        assertTrue(source.contains("fun invokeEmbeddedLyricflowBridge(operation: String, payloadJson: String, headersJson: String?): String"))
        assertTrue(source.contains("NativeBridge embedded LyricFlow call started"))
        assertTrue(source.contains("NativeBridge embedded LyricFlow call succeeded"))
        assertTrue(source.contains("NativeBridge embedded LyricFlow call timed out"))
        assertTrue(source.contains("NativeBridge embedded LyricFlow call failed"))
        assertTrue(source.contains("manager.invokeLyricFlowBridge(operation, payloadJson, headersJson)"))
    }
}
