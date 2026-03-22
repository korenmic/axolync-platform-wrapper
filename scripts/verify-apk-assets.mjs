import { execFileSync } from 'node:child_process';
import path from 'node:path';

function readZipEntry(apkPath, entryPath) {
  return execFileSync('unzip', ['-p', apkPath, entryPath], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(message);
  }
}

function assertExcludes(haystack, needle, message) {
  if (haystack.includes(needle)) {
    throw new Error(message);
  }
}

function verifyApk(apkPath) {
  const resolved = path.resolve(apkPath);
  const indexHtml = readZipEntry(resolved, 'assets/public/index.html');
  const syncWorker = readZipEntry(resolved, 'assets/public/workers/syncengineBridgeWorker.js');
  const lyricWorker = readZipEntry(resolved, 'assets/public/workers/lyricflowBridgeWorker.js');

  assertIncludes(
    indexHtml,
    'window.__AXOLYNC_RUNTIME_PROFILE = "debug";',
    `APK is missing staged debug runtime profile override: ${resolved}`,
  );

  assertExcludes(
    syncWorker,
    'require("./capacitorSyncFallback.js")',
    `APK ships stale SyncEngine worker CommonJS import: ${resolved}`,
  );
  assertIncludes(
    syncWorker,
    'function buildCapacitorSyncFallbackResult(',
    `APK is missing inlined Capacitor SyncEngine fallback helper: ${resolved}`,
  );

  assertExcludes(
    lyricWorker,
    'require("./directLrcLibFallback.js")',
    `APK ships stale LyricFlow worker CommonJS import: ${resolved}`,
  );
  assertIncludes(
    lyricWorker,
    'function fetchDirectLrcLibLyrics(',
    `APK is missing inlined direct LRCLIB helper: ${resolved}`,
  );

  console.log(`[verify-apk-assets] ok ${resolved}`);
}

const apkPaths = process.argv.slice(2);
if (apkPaths.length === 0) {
  throw new Error('Usage: node scripts/verify-apk-assets.mjs <apk-path> [more-apk-paths...]');
}

for (const apkPath of apkPaths) {
  verifyApk(apkPath);
}
