import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const stageScripts = [
  'scripts/stage-browser-assets.mjs',
  'wrappers/mobile/capacitor/android/scripts/stage-browser-assets.mjs',
];
const canonicalAndroidRoot = 'wrappers/mobile/capacitor/android';
const canonicalPluginPath = path.join(
  repoRoot,
  canonicalAndroidRoot,
  'app/src/main/kotlin/com/axolync/android/bridge/AxolyncNativeServiceCompanionHostPlugin.kt',
);

test('Capacitor staged browser bridge publishes capture route APIs in active and canonical scripts', () => {
  for (const rel of stageScripts) {
    const source = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    assert.match(source, /CAPTURE_ROUTE_PROVIDER_KIND = 'capacitor-android-capture-routes'/, rel);
    assert.match(source, /captureRouteProviderKind: CAPTURE_ROUTE_PROVIDER_KIND/, rel);
    assert.match(source, /getCaptureRouteStatus/, rel);
    assert.match(source, /startCaptureRoute/, rel);
    assert.match(source, /stopCaptureRoute/, rel);
    assert.match(source, /setCaptureRouteChunkHandler/, rel);
    assert.match(source, /plugin\.addListener\('captureRouteChunk', emitCaptureRouteChunk\)/, rel);
  }
});

test('canonical Android capture route provider uses AudioRecord source fallback without car-audio capture APIs', () => {
  const source = fs.readFileSync(canonicalPluginPath, 'utf8');

  assert.match(source, /import android\.media\.AudioRecord/);
  assert.match(source, /fun getCaptureRouteStatus\(call: PluginCall\)/);
  assert.match(source, /carConnectionTypeLiveData/);
  assert.match(source, /observeForever/);
  assert.match(source, /observedAndroidXConnectionType/);
  assert.match(source, /currentAndroidXConnectionType/);
  assert.match(source, /observedAndroidXConnectionAtMs/);
  assert.match(source, /observerActive/);
  assert.match(source, /rawAndroidXConnectionType/);
  assert.match(source, /uiModeType/);
  assert.match(source, /removeObserver/);
  assert.match(source, /fun startCaptureRoute\(call: PluginCall\)/);
  assert.match(source, /fun stopCaptureRoute\(call: PluginCall\)/);
  assert.match(source, /notifyListeners\("captureRouteChunk"/);
  assert.match(source, /MediaRecorder\.AudioSource\.UNPROCESSED[\s\S]*MediaRecorder\.AudioSource\.MIC[\s\S]*MediaRecorder\.AudioSource\.VOICE_RECOGNITION/);
  assert.match(source, /AudioRecord\.getMinBufferSize/);
  assert.match(source, /AudioRecord\(/);
  assert.doesNotMatch(source, /CarAudioRecord/);
  assert.doesNotMatch(source, /AudioPlaybackCaptureConfiguration/);
  assert.doesNotMatch(source, /android\.media\.MediaRecorder\(/);
  assert.doesNotMatch(source, /\.setAudioSource\(/);
});

test('canonical Android build documents car-mode capture capability dependencies', () => {
  const buildGradle = fs.readFileSync(path.join(repoRoot, canonicalAndroidRoot, 'app/build.gradle.kts'), 'utf8');
  assert.match(buildGradle, /androidx\.car\.app:app:1\.7\.0/);
});
