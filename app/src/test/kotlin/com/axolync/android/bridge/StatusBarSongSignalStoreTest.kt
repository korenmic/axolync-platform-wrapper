package com.axolync.android.bridge

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class StatusBarSongSignalStoreTest {

    @Test
    fun `parses shazam style text as artist-title`() {
        val signal = parseStatusBarSongSignal(
            titleRaw = "Auto Shazam",
            textRaw = "Daft Punk - Harder Better Faster Stronger",
            subTextRaw = null,
            sourcePackage = "com.shazam.android",
            capturedAtMs = 1234L
        )

        assertNotNull(signal)
        assertEquals("Harder Better Faster Stronger", signal?.title)
        assertEquals("Daft Punk", signal?.artist)
        assertEquals("com.shazam.android", signal?.sourcePackage)
    }

    @Test
    fun `returns null when title and text are both empty`() {
        val signal = parseStatusBarSongSignal(
            titleRaw = "   ",
            textRaw = "",
            subTextRaw = null,
            sourcePackage = "com.example",
            capturedAtMs = 1234L
        )
        assertNull(signal)
    }

    @Test
    fun `store keeps latest timestamp only`() {
        StatusBarSongSignalStore.clear()
        StatusBarSongSignalStore.update(
            StatusBarSongSignal(
                title = "Older",
                artist = "Artist",
                sourcePackage = "pkg",
                capturedAtMs = 10L
            )
        )
        StatusBarSongSignalStore.update(
            StatusBarSongSignal(
                title = "Newest",
                artist = "Artist",
                sourcePackage = "pkg",
                capturedAtMs = 20L
            )
        )

        assertEquals("Newest", StatusBarSongSignalStore.latestSignal()?.title)
    }
}
