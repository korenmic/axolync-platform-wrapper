package com.axolync.android.assets

import java.io.File
import java.util.zip.ZipFile
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PreinstalledBridgeManifestParityTest {

    @Test
    fun `wrapped preinstalled manifest versions match bundled bridge zip manifests`() {
        val browserAssetsRoot = listOf(
            File("app/src/main/assets/axolync-browser"),
            File("src/main/assets/axolync-browser")
        ).firstOrNull(File::exists)
            ?: throw AssertionError("Cannot locate checked-in axolync-browser asset tree")

        val manifestFile = File(browserAssetsRoot, "plugins/preinstalled/manifest.json")
        assertTrue("Preinstalled manifest must exist", manifestFile.exists())

        val plugins = extractManifestEntries(manifestFile.readText())
        assertTrue("Wrapped preinstalled manifest must enumerate at least one bridge plugin", plugins.isNotEmpty())

        for (entry in plugins) {
            val id = entry.id
            val expectedVersion = entry.version
            val zipPath = entry.url.removePrefix("/")
            val zipFile = File(browserAssetsRoot, zipPath)
            assertTrue("Preinstalled ZIP must exist for $id", zipFile.exists())

            ZipFile(zipFile).use { zip ->
                val manifestEntry = zip.getEntry("manifest.json")
                    ?: throw AssertionError("manifest.json missing inside ${zipFile.name}")
                val zippedManifest = zip.getInputStream(manifestEntry).bufferedReader().use { it.readText() }
                val zippedId = extractJsonString(zippedManifest, "id")
                val zippedVersion = extractJsonString(zippedManifest, "version")
                assertEquals("Preinstalled manifest id drift for $id", id, zippedId)
                assertEquals("Preinstalled manifest version drift for $id", expectedVersion, zippedVersion)
            }
        }
    }

    private fun extractManifestEntries(json: String): List<ManifestEntry> {
        val entryPattern = Regex(
            """\{[^{}]*"id"\s*:\s*"([^"]+)"[^{}]*"version"\s*:\s*"([^"]+)"[^{}]*"url"\s*:\s*"([^"]+)"[^{}]*}""",
            setOf(RegexOption.DOT_MATCHES_ALL)
        )
        return entryPattern.findAll(json).map { match ->
            ManifestEntry(
                id = match.groupValues[1],
                version = match.groupValues[2],
                url = match.groupValues[3]
            )
        }.toList()
    }

    private fun extractJsonString(json: String, key: String): String {
        val pattern = Regex(""""${Regex.escape(key)}"\s*:\s*"([^"]+)"""")
        return pattern.find(json)?.groupValues?.get(1)
            ?: throw AssertionError("Missing \"$key\" inside bundled plugin manifest")
    }

    private data class ManifestEntry(
        val id: String,
        val version: String,
        val url: String
    )
}
