package com.axolync.android.bridge

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
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
        val now = System.currentTimeMillis()
        StatusBarSongSignalStore.update(
            StatusBarSongSignal(
                title = "Older",
                artist = "Artist",
                sourcePackage = "pkg",
                capturedAtMs = now - 2_000L
            )
        )
        StatusBarSongSignalStore.update(
            StatusBarSongSignal(
                title = "Newest",
                artist = "Artist",
                sourcePackage = "pkg",
                capturedAtMs = now - 1_000L
            )
        )

        assertEquals("Newest", StatusBarSongSignalStore.latestSignal()?.title)
    }

    @Test
    fun `debug entries append only when capture is enabled`() {
        StatusBarSongSignalStore.clear()
        StatusBarSongSignalStore.clearDebugEntries()
        val now = System.currentTimeMillis()
        StatusBarSongSignalStore.setDebugCaptureEnabled(false)
        StatusBarSongSignalStore.appendDebugEntry(
            StatusBarNotificationDebugEntry(
                sourcePackage = "com.shazam.android",
                titleRaw = "Auto Shazam is on",
                textRaw = "Now playing Even Flow by Pearl Jam",
                subTextRaw = null,
                bigTextRaw = null,
                tickerRaw = null,
                category = "status",
                capturedAtMs = now - 2_000L,
                parseReasonCode = "matched_now_playing_by",
                parsedTitle = "Even Flow",
                parsedArtist = "Pearl Jam"
            )
        )
        assertEquals(0, StatusBarSongSignalStore.debugEntriesSnapshot().size)

        StatusBarSongSignalStore.setDebugCaptureEnabled(true)
        StatusBarSongSignalStore.appendDebugEntry(
            StatusBarNotificationDebugEntry(
                sourcePackage = "com.shazam.android",
                titleRaw = "Alive (Live)",
                textRaw = "Pearl Jam",
                subTextRaw = null,
                bigTextRaw = null,
                tickerRaw = null,
                category = "status",
                capturedAtMs = now - 1_000L,
                parseReasonCode = "matched_title_artist_card",
                parsedTitle = "Alive (Live)",
                parsedArtist = "Pearl Jam"
            )
        )
        val rows = StatusBarSongSignalStore.debugEntriesSnapshot()
        assertEquals(1, rows.size)
        assertEquals("Alive (Live)", rows.first().parsedTitle)
    }

    @Test
    fun `store ignores stale notifications older than five minutes`() {
        StatusBarSongSignalStore.clear()
        val now = System.currentTimeMillis()
        val staleCapturedAt = now - (6 * 60 * 1000L)

        StatusBarSongSignalStore.update(
            StatusBarSongSignal(
                title = "Very Old Song",
                artist = "Old Artist",
                sourcePackage = "com.shazam.android",
                capturedAtMs = staleCapturedAt
            )
        )
        assertNull(StatusBarSongSignalStore.latestSignal())
        assertFalse(StatusBarSongSignalStore.isWithinRetentionWindow(staleCapturedAt, now))
    }

    @Test
    fun `pruneExpired clears stale latest signal and debug rows`() {
        StatusBarSongSignalStore.clear()
        StatusBarSongSignalStore.clearDebugEntries()
        StatusBarSongSignalStore.setDebugCaptureEnabled(true)

        val now = System.currentTimeMillis()
        val freshCapturedAt = now - 1000L
        StatusBarSongSignalStore.update(
            StatusBarSongSignal(
                title = "Fresh Song",
                artist = "Artist",
                sourcePackage = "com.shazam.android",
                capturedAtMs = freshCapturedAt
            )
        )
        StatusBarSongSignalStore.appendDebugEntry(
            StatusBarNotificationDebugEntry(
                sourcePackage = "com.shazam.android",
                titleRaw = "Fresh Song",
                textRaw = "Artist",
                subTextRaw = null,
                bigTextRaw = null,
                tickerRaw = null,
                category = "status",
                capturedAtMs = freshCapturedAt,
                parseReasonCode = "matched_title_artist_card",
                parsedTitle = "Fresh Song",
                parsedArtist = "Artist"
            )
        )

        // Simulate app access long after signal expiry (restart/read path).
        StatusBarSongSignalStore.pruneExpired(now + (6 * 60 * 1000L))
        assertNull(StatusBarSongSignalStore.latestSignal())
        assertEquals(0, StatusBarSongSignalStore.debugEntriesSnapshot().size)
    }
}
