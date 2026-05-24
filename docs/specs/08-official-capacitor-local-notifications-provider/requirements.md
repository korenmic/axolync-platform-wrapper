# Requirements

## Introduction

This spec replaces the custom Android live-song notification plugin with a Platform Wrapper-owned native notification provider that uses Capacitor's official Local Notifications plugin.

Browser remains the notification orchestration owner. Platform Wrapper owns wrapper-specific native delivery. Builder owns artifact validation.

## Resolved Decisions

- Browser must keep an abstract native notification provider boundary and must not import Capacitor/Tauri/Electron-specific implementations.
- Capacitor Android must use the official `LocalNotifications` plugin path instead of the custom `AxolyncLiveSongNotificationPlugin`.
- The existing Web Notifications path must remain intact for hosted web and desktop browsers.
- Platform Wrapper must inject native provider support only into wrapper artifacts that need it.
- Diagnostics must be explicit enough to prove which provider path ran.

## Requirements

### Requirement 1: Browser-Owned Intent And Web Fallback

**User Story:** As a user, I want browser notifications to keep working in normal web browsers while native wrappers use native delivery.

#### Acceptance Criteria

1. Browser SHALL continue to own detected-song, lyrics-ready replacement, and clear semantics.
2. Browser SHALL continue to support the existing Web Notifications transport for hosted web browsers.
3. Browser SHALL NOT import `@capacitor/local-notifications` or any wrapper-specific notification package.
4. Browser SHALL consume native notifications only through a host-neutral runtime bridge.

### Requirement 2: Capacitor Local Notifications Provider

**User Story:** As an Android APK user, I want live song notifications to use the official Capacitor notification implementation.

#### Acceptance Criteria

1. Platform Wrapper SHALL add official Capacitor Local Notifications support to the Capacitor Android project.
2. Platform Wrapper SHALL publish Browser-facing live notification bridge methods backed by `LocalNotifications`.
3. The provider SHALL support permission check/request, show/schedule, replacement by stable id, and clear/cancel/remove where supported.
4. Detection notifications SHALL be quiet and non-buzzing.
5. Lyrics-ready notifications SHALL be quiet and buzz/vibrate where supported.
6. Android notification sound SHALL be disabled for this feature.

### Requirement 3: Remove Custom Android Notification Source Of Truth

**User Story:** As a maintainer, I want one Android notification implementation so behavior is not split or contradictory.

#### Acceptance Criteria

1. The custom `AxolyncLiveSongNotificationPlugin` SHALL no longer be the Android notification implementation.
2. Browser SHALL no longer discover or special-case the custom `AxolyncLiveSongNotification` Capacitor plugin.
3. Platform Wrapper staging SHALL stop publishing custom live-song notification plugin registry entries.
4. Tests and docs SHALL refer to the official Local Notifications provider instead of the custom plugin.

### Requirement 4: Builder Artifact Truth

**User Story:** As a release operator, I want artifact inspection to prove the APK has the official notification provider path.

#### Acceptance Criteria

1. Builder APK inspection SHALL stop requiring `AxolyncLiveSongNotificationPlugin`.
2. Builder APK inspection SHALL validate the official `LocalNotifications` plugin registry/native dependency evidence.
3. Builder failure messages SHALL identify missing official Capacitor notification wiring clearly.
4. Existing Android notification-capture/status-bar checks SHALL remain separate from live-song notification delivery.

### Requirement 5: Diagnostics And Fallback Reasons

**User Story:** As a tester, I want a debug bundle to explain exactly why notifications did or did not work.

#### Acceptance Criteria

1. Runtime diagnostics SHALL report the selected provider kind, such as `capacitor-local-notifications`, `tauri-native`, `web`, or `noop`.
2. Diagnostics SHALL include permission, show, and clear results where calls happened.
3. Diagnostics SHALL include native provider bootstrap details for Capacitor artifacts.
4. Fallback to web or noop SHALL include a clear reason.
5. Unsupported wrapper behavior SHALL be reported as unsupported/degraded rather than success.

### Requirement 6: Verification

**User Story:** As a maintainer, I want focused tests proving the provider split and artifact inspection behavior.

#### Acceptance Criteria

1. Browser tests SHALL prove the web transport still works and wrapper provider discovery remains abstract.
2. Platform Wrapper tests SHALL prove the Capacitor staging provider is injected and the custom plugin is not the source of truth.
3. Builder tests SHALL prove APK validation expects official Local Notifications wiring.
4. Focused test commands SHALL be documented in the implementation notes or final report.
