package com.axolync.android.assets

import java.io.File
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PackagedBrowserTouchParityAssetsTest {

    @Test
    fun `wrapped browser assets include Android touch receipt and granularity diagnostics`() {
        val assetsDir = File("src/main/assets/axolync-browser/assets")
        val bundle = assetsDir
            .listFiles()
            ?.firstOrNull { file -> file.name.matches(Regex("main-[A-Za-z0-9_-]+\\.js")) }
        assertNotNull("expected wrapped browser assets to contain a hashed main bundle", bundle)
        val source = bundle!!.readText()

        assertTrue(source.contains("touch.received"))
        assertTrue(source.contains("touch.drag.primed"))
        assertTrue(source.contains("touch.drag.moved"))
        assertTrue(source.contains("touch.pinch.started"))
        assertTrue(source.contains("touch.pinch.applied"))
        assertTrue(source.contains("touch.cleared"))
    }
}
