# Design: Clean Capacitor Android Native Microphone Route

## Overview

The Capacitor Android wrapper exposes one Browser-facing native microphone route. The route is always the same implementation:

- Android `AudioRecord`
- `MediaRecorder.AudioSource.UNPROCESSED`
- 48 kHz mono PCM16
- Capacitor global listener event for chunk delivery

There is no Android Auto detection. If Browser chooses this route, the wrapper starts it. If Browser does not choose it, the wrapper does nothing.

## Native Plugin Methods

Expose methods through `AxolyncNativeServiceCompanionHostPlugin`:

- `getNativeMicrophoneRouteStatus()`
- `startNativeMicrophoneRoute()`
- `stopNativeMicrophoneRoute()`

The status method returns:

- provider kind;
- route availability;
- host family/platform/ABI;
- selected source name fixed to `UNPROCESSED`;
- latest listener/start/stop diagnostics.

## JavaScript Bootstrap

The staged Browser asset bootstrap exposes methods on `window.__AXOLYNC_RUNTIME_HOST_BRIDGE__`:

- `getNativeMicrophoneRouteStatus`
- `setNativeMicrophoneChunkHandler`
- `startNativeMicrophoneRoute`
- `stopNativeMicrophoneRoute`

`setNativeMicrophoneChunkHandler` registers only this listener path:

```js
window.Capacitor.addListener('AxolyncNativeServiceCompanionHost', 'nativeMicrophoneChunk', handler)
```

If that API is unavailable, return a structured unavailable result. Do not try plugin-local `addListener`.

## AudioRecord Session

Native capture creates one `AudioRecord` with:

- source: `MediaRecorder.AudioSource.UNPROCESSED`
- sample rate: `48000`
- channel config: mono
- encoding: PCM 16-bit

Startup fails if this record cannot initialize or start. It does not try another source.

The capture thread converts buffers into chunk events with:

- `sequence`
- `sampleRateHz`
- `channelCount`
- base64 PCM16 payload or equivalent compact payload expected by Browser
- diagnostics: `sampleCount`, `rms`, `peak`, `nonZeroSamples`

## Removed Scope

The clean implementation must not include:

- AndroidX `CarConnection`;
- UI mode car checks;
- observed/cached car state;
- route recommendations;
- `MIC` or `VOICE_RECOGNITION` fallback;
- `AudioPlaybackCapture` / MediaProjection loopback.

## Tests

Static and unit tests should verify:

- staged JS uses Capacitor global listener;
- staged JS does not use plugin-local listener fallback;
- Kotlin source includes `UNPROCESSED`;
- Kotlin source does not include `VOICE_RECOGNITION`, `CarConnection`, or source-candidate fallback loops for this route;
- Kotlin compile still passes.
