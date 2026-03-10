package com.axolync.android.activities

import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class MainActivityRuntimePlatformHintTest {

    @Test
    fun `MainActivity tags web app request as android wrapper`() {
        val source = File("src/main/kotlin/com/axolync/android/activities/MainActivity.kt").readText()
        assertTrue(source.contains("appendQueryParameter(RUNTIME_MODE_QUERY_PARAM, ANDROID_RUNTIME_MODE)"))
        assertTrue(source.contains("CLIENT_PLATFORM_HEADER"))
        assertTrue(source.contains("webView.loadUrl(url, requestHeaders)"))
    }
}
