package com.axolync.android.server

import java.io.File
import org.junit.Assert.assertTrue
import org.junit.Test

class LocalHttpServerBridgeProxyTest {

    @Test
    fun `LocalHttpServer exposes runtime bridge config and bridge proxy endpoints`() {
        val source = File("src/main/kotlin/com/axolync/android/server/LocalHttpServer.kt").readText()

        assertTrue(source.contains("private const val BRIDGE_CONFIG_PATH = \"/__axolync/runtime-bridge-config\""))
        assertTrue(source.contains("private const val BRIDGE_PROXY_PREFIX = \"/__axolync/bridge/\""))
        assertTrue(source.contains("private fun serveRuntimeBridgeConfig"))
        assertTrue(source.contains("private fun proxyBridgeRequest"))
        assertTrue(source.contains("resolveBridgeTargetUrl(session.uri)"))
    }

    @Test
    fun `LocalHttpServer allows POST for wrapped bridge routes instead of rejecting them as static-only`() {
        val source = File("src/main/kotlin/com/axolync/android/server/LocalHttpServer.kt").readText()

        assertTrue(source.contains("session.method == Method.POST"))
        assertTrue(source.contains("if (bridgeTarget != null && (session.method == Method.GET || session.method == Method.HEAD || session.method == Method.POST))"))
        assertTrue(source.contains("requestMethod = session.method.name"))
        assertTrue(source.contains("if (session.method == Method.POST)"))
    }
}
