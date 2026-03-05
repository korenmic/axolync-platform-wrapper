package com.axolync.android.bridge

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class StatusBarSongSignalStoreTest {

    @Test
    fun `parses shazam auto mode now-playing text`() {
        val signal = parseStatusBarSongSignal(
            titleRaw = "Auto Shazam is on",
            textRaw = "Now playing Even Flow by Pearl Jam",
            subTextRaw = null,
            sourcePackage = "com.shazam.android",
            capturedAtMs = 1234L
        )

        assertNotNull(signal)
        assertEquals("Even Flow", signal?.title)
        assertEquals("Pearl Jam", signal?.artist)
        assertEquals("com.shazam.android", signal?.sourcePackage)
    }

    @Test
    fun `parses shazam song card title and artist`() {
        val signal = parseStatusBarSongSignal(
            titleRaw = "Alive (Live)",
            textRaw = "Pearl Jam",
            subTextRaw = null,
            sourcePackage = "com.shazam.android",
            capturedAtMs = 1234L
        )

        assertNotNull(signal)
        assertEquals("Alive (Live)", signal?.title)
        assertEquals("Pearl Jam", signal?.artist)
    }

    @Test
    fun `returns null for non shazam package to avoid false positives`() {
        val signal = parseStatusBarSongSignal(
            titleRaw = "Notification",
            textRaw = "Tap to open",
            subTextRaw = null,
            sourcePackage = "com.google.android.gm",
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
