# Requirements

## Introduction

Platform Wrapper must expose Capacitor Android capture routes through Browser's generic route bridge. The primary route is a non-blocking native phone microphone path for Android Auto. A secondary loopback route may use Android `AudioPlaybackCapture` when supported and consented.

## Requirements

### Requirement 1: Android Auto Capture Recommendation

**User Story:** As an Android Auto user, I want Axolync to switch to a non-blocking native phone microphone route automatically, so detection does not stop current playback.

#### Acceptance Criteria

1. WHEN Capacitor Android detects projected Android Auto or car mode THEN it SHALL recommend `wrapper-preferred-microphone` to Browser.
2. WHEN Android Auto/car mode is not active THEN it SHALL not recommend the Android Auto-specific route.
3. WHEN route state changes THEN it SHALL publish updated route capabilities/status through the Browser-facing host bridge.
4. WHEN car-mode detection is unavailable THEN it SHALL fail closed to no recommendation, not fake Android Auto state.

### Requirement 2: Native Phone Microphone Route

**User Story:** As a packaged Android runtime, I want native `AudioRecord` capture that does not use the car microphone, so capture can run without taking Android Auto audio focus.

#### Acceptance Criteria

1. WHEN native phone microphone capture starts THEN it SHALL not use `CarAudioRecord`.
2. WHEN native phone microphone capture starts THEN it SHALL not request audio focus.
3. WHEN native phone microphone capture starts THEN it SHALL not set call or communication mode.
4. WHEN source modes are attempted THEN it SHALL prefer `UNPROCESSED` when supported, then `MIC`, then `VOICE_RECOGNITION` only as fallback.
5. WHEN audio chunks are produced THEN they SHALL be timestamped and forwarded through the generic host bridge.

### Requirement 3: Android Playback Capture Loopback Route

**User Story:** As an operator, I want Android playback capture as a loopback option when supported, so Axolync can capture app playback directly when Android allows it.

#### Acceptance Criteria

1. WHEN Android `AudioPlaybackCapture` requirements are met THEN the wrapper SHALL declare `wrapper-loopback` support.
2. WHEN loopback capture is requested THEN it SHALL use `MediaProjection` consent flow.
3. WHEN the source app blocks playback capture THEN the wrapper SHALL report a clear unsupported/blocked reason.
4. WHEN loopback is unavailable THEN Browser SHALL see unsupported/unavailable capability truth.

### Requirement 4: Diagnostics

**User Story:** As a developer, I want Android route diagnostics, so manual Android Auto tests can prove which route was used.

#### Acceptance Criteria

1. WHEN route status is reported THEN diagnostics SHALL include car connection state and selected route.
2. WHEN native microphone capture starts THEN diagnostics SHALL include Android audio source mode and fallback sequence.
3. WHEN loopback consent or capture fails THEN diagnostics SHALL include the permission or blocking reason.
4. WHEN chunks are emitted THEN diagnostics SHALL include chunk counts without per-buffer spam.

