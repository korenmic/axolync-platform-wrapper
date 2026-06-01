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
