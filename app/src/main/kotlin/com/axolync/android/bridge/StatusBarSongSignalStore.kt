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
    val primary = if (text.isNotEmpty()) text else title
    val secondary = when {
        text.isNotEmpty() && title.isNotEmpty() -> title
        subText.isNotEmpty() -> subText
        else -> ""
    }

    val separators = listOf(" - ", " – ", " — ", " • ")
    for (sep in separators) {
        if (primary.contains(sep)) {
            val parts = primary.split(sep, limit = 2).map { it.trim() }
            if (parts.size == 2 && parts[0].isNotEmpty() && parts[1].isNotEmpty()) {
                val songTitle = if (shazamish) parts[1] else parts[0]
                val artist = if (shazamish) parts[0] else parts[1]
                return StatusBarSongSignal(
                    title = songTitle,
                    artist = artist,
                    sourcePackage = sourcePackage,
                    capturedAtMs = capturedAtMs
                )
            }
        }
    }

    if (title.isNotEmpty()) {
        return StatusBarSongSignal(
            title = title,
            artist = secondary.ifEmpty { null },
            sourcePackage = sourcePackage,
            capturedAtMs = capturedAtMs
        )
    }

    return StatusBarSongSignal(
        title = text,
        artist = if (subText.isNotEmpty()) subText else null,
        sourcePackage = sourcePackage,
        capturedAtMs = capturedAtMs
    )
}
