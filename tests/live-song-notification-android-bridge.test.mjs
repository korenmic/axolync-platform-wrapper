import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

const androidRoots = [
  'app',
  'wrappers/mobile/capacitor/android/app',
];

test('Android live song notification bridge is published in active and canonical Capacitor sources', () => {
  for (const androidRoot of androidRoots) {
    const sourceRoot = path.join(repoRoot, androidRoot, 'src/main');
    const pluginPath = path.join(sourceRoot, 'kotlin/com/axolync/android/bridge/AxolyncLiveSongNotificationPlugin.kt');
    const mainActivityPath = path.join(sourceRoot, 'kotlin/com/axolync/android/activities/MainActivity.kt');
    const manifestPath = path.join(sourceRoot, 'AndroidManifest.xml');
    const pluginRegistryPath = path.join(sourceRoot, 'assets/capacitor.plugins.json');
    const mirroredPluginRegistryPath = path.join(sourceRoot, 'assets/capacitor/capacitor.plugins.json');

    const pluginSource = fs.readFileSync(pluginPath, 'utf8');
    assert.match(pluginSource, /@CapacitorPlugin\(\s*name = "AxolyncLiveSongNotification"/);
    assert.match(pluginSource, /fun getLiveSongNotificationCapabilities/);
    assert.match(pluginSource, /fun requestNotificationPermission/);
    assert.match(pluginSource, /fun showLiveSongNotification/);
    assert.match(pluginSource, /fun clearLiveSongNotification/);
    assert.match(pluginSource, /DETECTED_CHANNEL_ID/);
    assert.match(pluginSource, /LYRICS_READY_CHANNEL_ID/);

    const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
    assert.match(mainActivity, /registerPlugin\(AxolyncLiveSongNotificationPlugin::class\.java\)/);

    const manifest = fs.readFileSync(manifestPath, 'utf8');
    assert.match(manifest, /android\.permission\.POST_NOTIFICATIONS/);

    for (const registryPath of [pluginRegistryPath, mirroredPluginRegistryPath]) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      assert.equal(
        registry.some((entry) => entry.classpath === 'com.axolync.android.bridge.AxolyncLiveSongNotificationPlugin'),
        true,
        `missing live notification plugin registry entry in ${registryPath}`,
      );
    }
  }
});

test('live song notification bridge contract is documented for wrapper implementations', () => {
  const docs = fs.readFileSync(path.join(repoRoot, 'docs/live-song-notification-bridge.md'), 'utf8');
  assert.match(docs, /getLiveSongNotificationCapabilities/);
  assert.match(docs, /showLiveSongNotification/);
  assert.match(docs, /clearLiveSongNotification/);
  assert.match(docs, /silent=true/);
  assert.match(docs, /buzz=true/);
  assert.match(docs, /Capacitor Android publishes `AxolyncLiveSongNotification`/);
  assert.match(docs, /Tauri desktop does not currently publish a native notification command/);
  assert.match(docs, /Electron is not an active release artifact today/);
  assert.match(docs, /Do not add Electron-only native notification code until Electron artifacts are active again/);
});
