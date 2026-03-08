package com.axolync.android.server

import java.io.File
import org.junit.Assert.assertTrue
import org.junit.Test

class LocalHttpServerMimeTypeTest {

    @Test
    fun `LocalHttpServer serves packaged bridge worker ts assets as javascript`() {
        val source = File("src/main/kotlin/com/axolync/android/server/LocalHttpServer.kt").readText()

        assertTrue(source.contains("\".ts\" to \"application/javascript\""))
    }
}
