# Seed 11: P0 Clean Capacitor Android Native Microphone Route

## Priority

P0

## Summary

Expose one Capacitor Android native microphone capture route to Browser using `AudioRecord` with `MediaRecorder.AudioSource.UNPROCESSED`, without Android Auto detection, AndroidX `CarConnection`, cached car-state observation, loopback playback capture, or fallback source attempts.

This is the clean replacement for the broader Seed 09 experiment.

## Product Context

Manual Android Auto testing proved the native Android route can capture audio while car playback continues. The successful run used:

- native `AudioRecord`;
- `UNPROCESSED` audio source;
- Capacitor global listener path for chunk delivery;
- Browser-side wrapper chunk ingestion.

The previous implementation included extra policy machinery that is no longer desired for the mergeable clean version:

- car-mode detection;
- AndroidX `CarConnection`;
- cached/observed car state;
- route recommendations depending on Android Auto state;
- `UNPROCESSED -> MIC -> VOICE_RECOGNITION` source fallback;
- playback-capture/loopback diagnostics.

The clean version should expose native Android microphone capture as a simple wrapper capability. Browser can use it whenever the wrapper reports support.

## Technical Constraints

- Do not use `CarAudioRecord`.
- Do not request audio focus.
- Do not switch Android audio mode to call/communication mode.
- Do not use AndroidX `CarConnection`.
- Do not cache or observe Android Auto/car-mode state.
- Do not expose car-mode state to Browser.
- Do not implement source fallback. Use only `MediaRecorder.AudioSource.UNPROCESSED`.
- Do not expose `AudioPlaybackCapture` / loopback in this seed.
- Use Capacitor's global listener path:
  - `window.Capacitor.addListener('AxolyncNativeServiceCompanionHost', 'nativeMicrophoneChunk', handler)` or an equivalent stable event name agreed with Browser.
- Fail loudly if the listener API is unavailable.
- Native chunks must include:
  - sequence;
  - sample rate;
  - channel count;
  - PCM payload;
  - RMS/peak/non-zero sample diagnostics.
- Start/stop calls must be idempotent enough for Browser play/stop cycles.
- Normal non-car Android sanity and Android Auto sanity must both be manually retested before merge.

## Clean Host Bridge Surface

Expose the minimal Browser-facing methods through the existing native bridge host:

- `getNativeMicrophoneRouteStatus()`
- `startNativeMicrophoneRoute()`
- `stopNativeMicrophoneRoute()`
- `setNativeMicrophoneChunkHandler()` on the Browser-injected JavaScript bridge side, backed by the Capacitor global listener.

Exact names may follow existing bridge naming style, but the scope must remain one route: native Android microphone.

## Related Seeds

- Browser Seed 161: Clean wrapper native microphone route.
- Platform Wrapper Seed 09: superseded broader capture route design; use only as implementation reference.
- Browser Seed 154: superseded broader Browser broker design; use only as implementation reference.

## Open Questions

None. The resolved direction is: one native Android microphone implementation using `UNPROCESSED`, no car-mode logic, no source fallback, no loopback route, and no Builder changes.
