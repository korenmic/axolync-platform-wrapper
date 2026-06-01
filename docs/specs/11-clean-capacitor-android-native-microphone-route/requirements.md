# Requirements: Clean Capacitor Android Native Microphone Route

## Introduction

Capacitor Android needs to expose one native microphone route to Browser. The implementation must be intentionally small: no Android Auto detection, no car-state cache, no loopback route, and no Android audio-source fallback list.

## Requirements

### Requirement 1: Single native microphone route

**User Story:** As an Android APK user, I want Axolync to capture from the Android native microphone route, so Android Auto playback can keep running while Axolync listens.

#### Acceptance Criteria

1. WHEN Browser asks for native microphone status THEN the wrapper SHALL report whether the native microphone route is available.
2. WHEN Browser starts native microphone capture THEN the wrapper SHALL use `AudioRecord` with `MediaRecorder.AudioSource.UNPROCESSED`.
3. WHEN Browser starts native microphone capture THEN the wrapper SHALL NOT try `MIC` or `VOICE_RECOGNITION` fallback sources.
4. WHEN Browser starts native microphone capture THEN the wrapper SHALL NOT request audio focus or change Android audio mode.

### Requirement 2: No car-mode policy

**User Story:** As a maintainer, I want the wrapper to avoid Android Auto-specific branching, so the capture route is simple and testable.

#### Acceptance Criteria

1. The wrapper SHALL NOT use AndroidX `CarConnection`.
2. The wrapper SHALL NOT observe, cache, or expose Android Auto/car-mode state.
3. The wrapper SHALL NOT recommend different capture behavior based on car mode.
4. The wrapper SHALL expose one native microphone capability that Browser may choose generically.

### Requirement 3: Chunk bridge

**User Story:** As Browser, I want a reliable listener path for native microphone chunks.

#### Acceptance Criteria

1. The wrapper SHALL publish chunks through Capacitor global listener events.
2. The wrapper SHALL expose JavaScript bootstrap methods for status, listener registration, start, and stop.
3. IF the Capacitor global listener API is unavailable THEN listener registration SHALL return a failed/unavailable status.
4. Each chunk SHALL include sequence, sample rate, channel count, PCM payload, and compact signal diagnostics.

### Requirement 4: Diagnostics and tests

**User Story:** As a tester, I want logs that prove the native route is active without large per-chunk spam.

#### Acceptance Criteria

1. Native diagnostics SHALL record start, selected audio source, listener path, chunk count, and stop.
2. Native diagnostics SHALL NOT log every chunk.
3. Tests SHALL prove only `UNPROCESSED` is used for this route.
4. Tests SHALL prove AndroidX car APIs and source fallback logic are absent from this clean implementation.
