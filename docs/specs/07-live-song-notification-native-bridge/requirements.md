# Requirements

## Introduction

This spec adds Platform Wrapper native notification bridge capabilities for Browser-owned live song notifications.

Browser owns when notifications should be posted. Platform Wrapper owns host-native delivery where plain web notifications are insufficient.

## Resolved Decisions

- Capacitor Android should use two notification channels if required to express quiet detection and silent buzz-ready replacement.
- Tauri is the primary desktop packaged target.
- Electron is secondary and may degrade to web/no-op fallback unless packaged EXE testing proves native bridge support is required.
- Platform Wrapper native transport is not mandatory for the first Browser+Builder PR group, but this spec defines the native follow-up.

## Requirements

### Requirement 1: Native Capability Reporting

**User Story:** As Browser, I need truthful wrapper notification capabilities so I can choose the correct transport.

#### Acceptance Criteria

1. Platform Wrapper SHALL expose live song notification capability metadata when native notification support exists.
2. Capability metadata SHALL indicate support for permission, silent, buzz, replace, and clear.
3. Unsupported host behavior SHALL be reported as unsupported/degraded rather than success.
4. Browser SHALL be able to no-op safely when the bridge is absent.

### Requirement 2: Native Notification Bridge

**User Story:** As Browser, I want a minimal host-neutral bridge for local live song notifications.

#### Acceptance Criteria

1. The bridge SHALL support permission request where the host requires it.
2. The bridge SHALL support showing a live song notification by stable id.
3. The bridge SHALL support replacing an existing notification by stable id/tag where host APIs allow it.
4. The bridge SHALL support clearing a notification by stable id where host APIs allow it.
5. Bridge calls SHALL return structured success, degraded, or failure results.

### Requirement 3: Android Capacitor Behavior

**User Story:** As an Android APK operator, I want live song notifications to use Android-native behavior.

#### Acceptance Criteria

1. Capacitor Android SHALL prefer Local Notifications or equivalent native local notification support.
2. Detection notifications SHALL be silent and no-buzz.
3. Lyric-ready replacements SHALL be silent and buzz/vibrate where supported.
4. If one Android channel cannot express both behaviors, Platform Wrapper SHALL use two channels or report the unsupported buzz limitation.
5. Android notification sound SHALL be disabled for this feature.

### Requirement 4: Desktop Wrapper Behavior

**User Story:** As a packaged desktop operator, I want the desktop host to use the best supported native notification path.

#### Acceptance Criteria

1. Tauri SHALL be treated as the primary desktop wrapper target for native notification support.
2. Tauri SHALL use a native notification plugin/bridge where available.
3. Electron MAY degrade to web/no-op fallback unless testing proves native bridge support is required.
4. Desktop unsupported/degraded behavior SHALL be visible through capability metadata.
