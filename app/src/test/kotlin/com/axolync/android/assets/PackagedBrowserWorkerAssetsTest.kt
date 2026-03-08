package com.axolync.android.assets

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class PackagedBrowserWorkerAssetsTest {

    @Test
    fun `checked-in browser asset tree contains packaged bridge worker javascript entrypoints`() {
        val browserAssetsRoot = listOf(
            File("app/src/main/assets/axolync-browser"),
            File("src/main/assets/axolync-browser")
        ).firstOrNull(File::exists)
            ?: throw AssertionError("Cannot locate checked-in axolync-browser asset tree")
        assertTrue(browserAssetsRoot.exists())

        val lyricflowWorker = File(browserAssetsRoot, "workers/lyricflowBridgeWorker.js")
        val syncengineWorker = File(browserAssetsRoot, "workers/syncengineBridgeWorker.js")
        val staleLyricflowTsWorker = File(browserAssetsRoot, "assets/lyricflowBridgeWorker-DLMPdRSz.ts")
        val staleSyncengineTsWorker = File(browserAssetsRoot, "assets/syncengineBridgeWorker-Cb95hvyQ.ts")

        assertTrue(lyricflowWorker.exists())
        assertTrue(syncengineWorker.exists())
        assertFalse(staleLyricflowTsWorker.exists())
        assertFalse(staleSyncengineTsWorker.exists())
    }
}
