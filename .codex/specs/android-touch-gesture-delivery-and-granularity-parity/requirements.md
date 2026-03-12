# Requirements Document

## Introduction

This feature restores Android touch gesture delivery so touch input reaches the same lyric interaction model that already works for mouse input on desktop and on Android-with-mouse. The scope is Android-wrapper-first: prove where touch is blocked, preserve the existing browser zoom/long-press protections, and deliver gesture parity for the lyric view without regressing desktop behavior.

## Requirements

### Requirement 1

**User Story:** As an Android user, I want touch gestures to reach the lyric view runtime, so that drag and pinch perform the same logical lyric actions that mouse already performs.

#### Acceptance Criteria

1. WHEN a single-finger drag gesture begins on the Android lyric view THEN the system SHALL deliver a touch sequence to the browser lyric interaction layer.
2. WHEN a two-finger gesture begins on the Android lyric view THEN the system SHALL deliver enough gesture data for Axolync granularity handling instead of swallowing the gesture before browser runtime can interpret it.
3. IF the Android wrapper blocks a touch gesture before WebView delivery THEN the system SHALL record that block in Android-native diagnostics.
4. WHEN touch delivery is successful THEN the system SHALL expose browser-side receipt evidence in runtime diagnostics.

### Requirement 2

**User Story:** As a product operator, I want browser-native zoom and long-press behavior to stay disabled, so that enabling gesture parity does not reintroduce unwanted WebView behaviors.

#### Acceptance Criteria

1. WHEN Android touch gesture delivery is restored THEN the system SHALL continue blocking browser-native pinch zoom side effects.
2. WHEN Android touch gesture delivery is restored THEN the system SHALL continue preventing long-press text selection and context-menu behavior on the WebView.
3. IF a native gesture gate is required to preserve these protections THEN the system SHALL implement the narrowest gate that still permits Axolync gesture delivery.

### Requirement 3

**User Story:** As a user switching between desktop and Android, I want mouse and touch to trigger the same logical lyric actions, so that the lyric scene behaves consistently across platforms.

#### Acceptance Criteria

1. WHEN Android drag input is delivered to the lyric scene THEN the system SHALL map it to the same manual lyric-unit navigation action family used by mouse drag.
2. WHEN Android pinch input is delivered to the lyric scene THEN the system SHALL map it to the same granularity-zoom action family used by mouse wheel.
3. IF the lyric scene is in a non-interactive state that already blocks manual navigation for mouse THEN the system SHALL apply the same block to Android touch.
4. WHEN gesture parity is implemented THEN the system SHALL avoid introducing a separate Android-only lyric interaction model.

### Requirement 4

**User Story:** As a developer debugging Android touch issues, I want explicit native and browser diagnostics, so that I can localize whether a failure is in native delivery, browser receipt, or action dispatch.

#### Acceptance Criteria

1. WHEN Android touch diagnostics are enabled THEN the system SHALL record native touch lifecycle events for single-touch and multi-touch transitions.
2. WHEN Android touch diagnostics are enabled THEN the system SHALL record browser lyric-view touch receipt events for the same gesture categories.
3. WHEN a gesture reaches action dispatch THEN the system SHALL record the resulting logical action in diagnostics.
4. WHEN debug artifacts are exported THEN the system SHALL include the Android touch delivery diagnostics in the exportable logs.

### Requirement 5

**User Story:** As an engineer maintaining the Android wrapper, I want regression tests for the touch delivery path, so that future wrapper changes cannot silently break gesture parity.

#### Acceptance Criteria

1. WHEN the Android wrapper gesture gate changes THEN the system SHALL have automated tests that verify the native touch policy still permits intended lyric-scene gestures.
2. WHEN browser lyric touch wiring changes THEN the system SHALL have automated tests that verify drag and pinch receipt remain wired to the lyric interaction layer.
3. WHEN Android gesture parity is implemented THEN the system SHALL have at least one automated proof that drag advances lyric navigation and pinch changes granularity through the intended runtime path.
4. IF desktop code paths are touched while implementing Android gesture parity THEN the system SHALL add or update regression coverage proving desktop behavior remains unchanged.

### Requirement 6

**User Story:** As the maintainer of the working desktop path, I want Android touch fixes to stay scoped, so that the near-correct desktop lyric behavior is protected.

#### Acceptance Criteria

1. WHEN Android gesture parity is implemented THEN the system SHALL scope native-touch handling changes to Android-wrapper behavior.
2. IF browser shared code is modified for gesture parity THEN the system SHALL gate Android-specific behavior by runtime/platform conditions instead of changing desktop behavior by default.
3. WHEN the feature is complete THEN the system SHALL preserve existing mouse-driven lyric interactions on desktop.
