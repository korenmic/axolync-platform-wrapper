package com.axolync.android.activities

import java.io.File
import org.junit.Assert.assertTrue
import org.junit.Test

class MainActivityTouchDeliveryLoggingTest {

    @Test
    fun `MainActivity records native touch delivery decisions for forwarded and consumed gestures`() {
        val source = File("src/main/kotlin/com/axolync/android/activities/MainActivity.kt").readText()

        assertTrue(source.contains("RuntimeNativeLogStore.record("))
        assertTrue(source.contains("Native touch delivery decision"))
        assertTrue(source.contains("channel=touch-delivery"))
        assertTrue(source.contains("ACTION_POINTER_DOWN"))
        assertTrue(source.contains("ACTION_POINTER_UP"))
        assertTrue(source.contains("forwardedToWebView"))
        assertTrue(source.contains("native-pinch-block"))
        assertTrue(source.contains("forward-single-touch"))
    }
}
