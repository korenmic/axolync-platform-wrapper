# Design

## Overview

Capacitor Android will publish capture route capabilities through the existing injected host bridge pattern used for wrapper-owned runtime features. Browser remains platform-neutral and consumes only generic route capability/status and chunk events.

## Android Car State

Detection sources:

- Prefer AndroidX `CarConnection` when available to distinguish projected Android Auto / Automotive OS.
- Fallback to Android car-mode signals such as `UiModeManager`.
- If neither source is reliable, report unknown and do not recommend a special route.

## Native Microphone Route

Use Android `AudioRecord` for phone-side capture.

Source selection:

1. Try `MediaRecorder.AudioSource.UNPROCESSED` when supported by the device/runtime.
2. Fallback to `MediaRecorder.AudioSource.MIC`.
3. Fallback to `MediaRecorder.AudioSource.VOICE_RECOGNITION` only if required.

Explicit exclusions:

- No `CarAudioRecord`.
- No audio-focus request.
- No call/communication mode.

Chunks should be encoded into a Browser-usable shape consistent with existing audio pipeline expectations. If exact raw PCM bridging is too expensive for V1, the implementation may use small PCM frame batches with timestamps and diagnostics.

## Playback Capture Route

`AudioPlaybackCapture` uses `MediaProjection` and `AudioPlaybackCaptureConfiguration`. It is conceptually loopback-like but not a virtual microphone. It may be blocked by source app policy.

The wrapper should expose loopback support only when platform/API requirements are present. Runtime blocked-source failures must be reported distinctly from permission denial.

## Bridge Surface

The wrapper should expose methods/events equivalent to:

- `getCaptureRouteCapabilities()`
- `getCaptureRouteStatus()`
- `startCaptureRoute({ routeKind })`
- `stopCaptureRoute({ routeId })`
- `onCaptureRouteChunk`
- `onCaptureRouteDiagnostic`

Use existing bridge conventions and naming if the repo already has a preferred injected host pattern.

## Test Strategy

- Unit-test route capability serialization.
- Unit-test car mode recommendation logic with mocked car connection state.
- Unit-test source fallback ordering.
- Add Android-side tests or static checks proving `CarAudioRecord`, audio focus, and communication mode are not used by the route.
- Add bridge tests proving Browser-facing route fields are emitted.

