package com.axolync.android.bridge

data class StatusBarSongSignal(
    val title: String,
    val artist: String?,
    val sourcePackage: String,
    val capturedAtMs: Long
)

object StatusBarSongSignalStore {
    @Volatile
    private var latest: StatusBarSongSignal? = null

    @Synchronized
    fun update(signal: StatusBarSongSignal) {
        val current = latest
        if (current == null || signal.capturedAtMs >= current.capturedAtMs) {
            latest = signal
        }
    }

    fun latestSignal(): StatusBarSongSignal? = latest

    @Synchronized
    fun clear() {
        latest = null
    }
}

fun parseStatusBarSongSignal(
    titleRaw: String?,
    textRaw: String?,
    subTextRaw: String?,
    sourcePackage: String,
    capturedAtMs: Long
): StatusBarSongSignal? {
    val title = titleRaw.orEmpty().trim()
    val text = textRaw.orEmpty().trim()
    val subText = subTextRaw.orEmpty().trim()
    if (title.isEmpty() && text.isEmpty()) return null

    val shazamish = sourcePackage.contains("shazam", ignoreCase = true)
    if (!shazamish) {
        // SongSense status-bar adapter is currently Shazam-specific to reduce false positives.
        return null
    }

    val nowPlayingMatch = Regex("^\\s*now\\s+playing\\s+(.+?)\\s+by\\s+(.+?)\\s*$", RegexOption.IGNORE_CASE)
        .find(text)
    if (nowPlayingMatch != null) {
        val songTitle = nowPlayingMatch.groupValues[1].trim()
        val artist = nowPlayingMatch.groupValues[2].trim()
        if (songTitle.isNotEmpty()) {
            return StatusBarSongSignal(
                title = songTitle,
                artist = artist.ifEmpty { null },
                sourcePackage = sourcePackage,
                capturedAtMs = capturedAtMs
            )
        }
    }

    // Shazam "song card" notifications are often: title=<song>, text=<artist>.
    val titleIsAutoShazamLabel = title.equals("Auto Shazam is on", ignoreCase = true)
        || title.equals("Auto Shazam", ignoreCase = true)
        || title.equals("Shazam", ignoreCase = true)
    if (title.isNotEmpty() && !titleIsAutoShazamLabel) {
        val artist = when {
            text.isNotEmpty() && !text.startsWith("Now playing", ignoreCase = true) -> text
            subText.isNotEmpty() -> subText
            else -> ""
        }
        return StatusBarSongSignal(
            title = title,
            artist = artist.ifEmpty { null },
            sourcePackage = sourcePackage,
            capturedAtMs = capturedAtMs
        )
    }

    // Fallback for single-line payloads that use separators.
    val separators = listOf(" - ", " – ", " — ", " • ")
    for (sep in separators) {
        if (text.contains(sep)) {
            val parts = text.split(sep, limit = 2).map { it.trim() }
            if (parts.size == 2 && parts[0].isNotEmpty() && parts[1].isNotEmpty()) {
                val leftWords = parts[0].split(Regex("\\s+")).size
                val rightWords = parts[1].split(Regex("\\s+")).size
                // Heuristic: short-left + long-right is usually artist - title.
                val leftLooksLikeArtist = leftWords <= 3 && rightWords >= 4
                val songTitle = if (leftLooksLikeArtist) parts[1] else parts[0]
                val artist = if (leftLooksLikeArtist) parts[0] else parts[1]
                return StatusBarSongSignal(
                    title = songTitle,
                    artist = artist,
                    sourcePackage = sourcePackage,
                    capturedAtMs = capturedAtMs
                )
            }
        }
    }

    return null
}
