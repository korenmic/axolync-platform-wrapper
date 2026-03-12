package com.axolync.android.activities

import java.io.File
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MainActivityGestureGateParityTest {

    @Test
    fun `MainActivity forwards intended touch gestures while keeping native zoom suppression settings`() {
        val source = File("src/main/kotlin/com/axolync/android/activities/MainActivity.kt").readText()

        assertTrue(source.contains("setSupportZoom(false)"))
        assertTrue(source.contains("builtInZoomControls = false"))
        assertTrue(source.contains("displayZoomControls = false"))
        assertTrue(source.contains("webView.setOnTouchListener"))
        assertTrue(source.contains("forward-multi-touch"))
        assertTrue(source.contains("forward-single-touch"))
        assertFalse(source.contains("reason = \"native-pinch-block\""))
    }
}
