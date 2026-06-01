import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

const routeFiles = [
  'scripts/stage-browser-assets.mjs',
  'wrappers/mobile/capacitor/android/scripts/stage-browser-assets.mjs',
  'app/src/main/kotlin/com/axolync/android/bridge/AxolyncNativeServiceCompanionHostPlugin.kt',
  'wrappers/mobile/capacitor/android/app/src/main/kotlin/com/axolync/android/bridge/AxolyncNativeServiceCompanionHostPlugin.kt',
];

const forbiddenRoutePatterns = [
  {
    label: 'Android Auto or cached car-state policy',
    pattern: /AndroidX|androidx\.car|CarConnection|UiModeManager|ACTION_CAR_MODE|carMode|car-mode/u,
  },
  {
    label: 'Android playback-capture route',
    pattern: /AudioPlaybackCapture|MediaProjection|PlaybackCapture/u,
  },
  {
    label: 'multi-source microphone fallback route',
    pattern: /VOICE_RECOGNITION|AudioSource\.MIC|captureRouteChunk|resolvePreferredMicrophoneAudioSources/u,
  },
];

test('clean Android native microphone route excludes car-mode, playback-capture, and source-fallback bloat', () => {
  for (const routeFile of routeFiles) {
    const source = fs.readFileSync(path.join(repoRoot, routeFile), 'utf8');
    for (const { label, pattern } of forbiddenRoutePatterns) {
      assert.doesNotMatch(source, pattern, `${label} leaked into ${routeFile}`);
    }
  }
});

test('clean Android native microphone bridge uses Capacitor global listener wiring', () => {
  for (const routeFile of [
    'scripts/stage-browser-assets.mjs',
    'wrappers/mobile/capacitor/android/scripts/stage-browser-assets.mjs',
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, routeFile), 'utf8');
    assert.match(source, /capacitor\.addListener\('AxolyncNativeServiceCompanionHost', 'nativeMicrophoneChunk', emitNativeMicrophoneChunk\)/u);
    assert.match(source, /setNativeMicrophoneChunkHandler/u);
    assert.match(source, /getNativeMicrophoneRouteStatus/u);
    assert.match(source, /startNativeMicrophoneRoute/u);
    assert.match(source, /stopNativeMicrophoneRoute/u);
    assert.doesNotMatch(source, /resolvePlugin\(\)\.addListener|plugin\.addListener\('nativeMicrophoneChunk'/u);
  }
});

test('clean Android native microphone plugin exposes one UNPROCESSED AudioRecord source', () => {
  for (const routeFile of [
    'app/src/main/kotlin/com/axolync/android/bridge/AxolyncNativeServiceCompanionHostPlugin.kt',
    'wrappers/mobile/capacitor/android/app/src/main/kotlin/com/axolync/android/bridge/AxolyncNativeServiceCompanionHostPlugin.kt',
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, routeFile), 'utf8');
    const audioSourceUsages = source.match(/MediaRecorder\.AudioSource\./gu) ?? [];
    assert.equal(audioSourceUsages.length, 1, `expected a single native microphone audio source in ${routeFile}`);
    assert.match(source, /MediaRecorder\.AudioSource\.UNPROCESSED/u);
    assert.match(source, /private const val NATIVE_MICROPHONE_SAMPLE_RATE_HZ = 48000/u);
    assert.match(source, /private const val NATIVE_MICROPHONE_CHANNEL_COUNT = 1/u);
    assert.match(source, /private const val NATIVE_MICROPHONE_CHUNK_EVENT = "nativeMicrophoneChunk"/u);
  }
});
