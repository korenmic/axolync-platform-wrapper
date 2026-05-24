import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

const androidRoots = [
  'app',
  'wrappers/mobile/capacitor/android/app',
];

test('Android live song notification bridge uses official Capacitor LocalNotifications in active and canonical sources', () => {
  for (const androidRoot of androidRoots) {
    const sourceRoot = path.join(repoRoot, androidRoot, 'src/main');
    const pluginPath = path.join(sourceRoot, 'kotlin/com/axolync/android/bridge/AxolyncLiveSongNotificationPlugin.kt');
    const mainActivityPath = path.join(sourceRoot, 'kotlin/com/axolync/android/activities/MainActivity.kt');
    const manifestPath = path.join(sourceRoot, 'AndroidManifest.xml');
    const pluginRegistryPath = path.join(sourceRoot, 'assets/capacitor.plugins.json');
    const mirroredPluginRegistryPath = path.join(sourceRoot, 'assets/capacitor/capacitor.plugins.json');

    assert.equal(fs.existsSync(pluginPath), false, `custom live notification plugin should be removed: ${pluginPath}`);

    const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');
    assert.doesNotMatch(mainActivity, /AxolyncLiveSongNotificationPlugin/);
    assert.doesNotMatch(mainActivity, /registerPlugin\(AxolyncLiveSongNotificationPlugin::class\.java\)/);

    const manifest = fs.readFileSync(manifestPath, 'utf8');
    assert.match(manifest, /android\.permission\.POST_NOTIFICATIONS/);

    for (const registryPath of [pluginRegistryPath, mirroredPluginRegistryPath]) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      assert.equal(
        registry.some((entry) => entry.classpath === 'com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin'),
        true,
        `missing official LocalNotifications plugin registry entry in ${registryPath}`,
      );
      assert.equal(
        registry.some((entry) => entry.classpath === 'com.axolync.android.bridge.AxolyncLiveSongNotificationPlugin'),
        false,
        `custom live notification plugin registry entry should be absent in ${registryPath}`,
      );
    }
  }
});

test('Android Gradle wiring includes official LocalNotifications module without custom notification implementation', () => {
  for (const wrapperRoot of ['.', 'wrappers/mobile/capacitor/android']) {
    const settings = fs.readFileSync(path.join(repoRoot, wrapperRoot, 'settings.gradle.kts'), 'utf8');
    const buildGradle = fs.readFileSync(path.join(repoRoot, wrapperRoot, 'app/build.gradle.kts'), 'utf8');

    assert.match(settings, /include\(":capacitor-local-notifications"\)/);
    assert.match(settings, /@capacitor\/local-notifications\/android/);
    assert.match(buildGradle, /implementation\(project\(":capacitor-local-notifications"\)\)/);
    assert.doesNotMatch(settings, /axolync-live-song-notification/);
    assert.doesNotMatch(buildGradle, /AxolyncLiveSongNotification/);
  }
});

test('live song notification bridge contract is documented for wrapper implementations', () => {
  const docs = fs.readFileSync(path.join(repoRoot, 'docs/live-song-notification-bridge.md'), 'utf8');
  assert.match(docs, /getLiveSongNotificationCapabilities/);
  assert.match(docs, /showLiveSongNotification/);
  assert.match(docs, /clearLiveSongNotification/);
  assert.match(docs, /silent=true/);
  assert.match(docs, /buzz=true/);
  assert.match(docs, /official Capacitor `LocalNotifications` plugin/);
  assert.match(docs, /old custom `AxolyncLiveSongNotification` plugin is not a supported source of truth/);
  assert.match(docs, /Tauri desktop publishes the same bridge through global Tauri invoke commands/);
  assert.match(docs, /tauri-plugin-notification/);
  assert.match(docs, /Electron is not an active release artifact today/);
  assert.match(docs, /Do not add Electron-only native notification code until Electron artifacts are active again/);
});

test('Tauri live song notification bridge is published in the desktop wrapper template', () => {
  const tauriRoot = path.join(repoRoot, 'wrappers/desktop/tauri/workspace-template/src-tauri');
  const cargoToml = fs.readFileSync(path.join(tauriRoot, 'Cargo.toml'), 'utf8');
  const tauriConfig = fs.readFileSync(path.join(tauriRoot, 'tauri.conf.json'), 'utf8');
  const source = fs.readFileSync(path.join(tauriRoot, 'src/native_service_companion.rs'), 'utf8');

  assert.match(cargoToml, /tauri-plugin-notification = "2"/);
  assert.equal(JSON.parse(tauriConfig).app.withGlobalTauri, true);
  assert.match(source, /use tauri_plugin_notification::\{NotificationExt, PermissionState\}/);
  assert.match(source, /\.plugin\(tauri_plugin_notification::init\(\)\)/);
  assert.match(source, /pub fn axolync_live_song_notification_get_capabilities/);
  assert.match(source, /pub fn axolync_live_song_notification_request_permission/);
  assert.match(source, /pub fn axolync_live_song_notification_show/);
  assert.match(source, /pub fn axolync_live_song_notification_clear/);
  assert.match(source, /axolync_live_song_notification_show,/);
  assert.match(source, /Windows portable artifact cannot display Tauri native notifications/);
});
