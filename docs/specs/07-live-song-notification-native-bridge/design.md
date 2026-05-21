# Design

## Overview

Platform Wrapper exposes optional native notification bridge methods to Browser. Browser remains the orchestration owner and calls these methods only when runtime capability metadata reports support.

The bridge is intentionally minimal and local-only. It does not support remote push notifications or killed-app background behavior.

## Bridge API

Suggested runtime host bridge shape:

```ts
getLiveSongNotificationCapabilities(): Promise<LiveSongNotificationCapabilities>
requestNotificationPermission(input: { reason: string }): Promise<NotificationPermissionResult>
showLiveSongNotification(input: LiveSongNotificationBridgeShowInput): Promise<NotificationBridgeResult>
clearLiveSongNotification(input: { id: string }): Promise<NotificationBridgeResult>
```

`LiveSongNotificationCapabilities` should include:

- `supportsPermissionRequest`
- `supportsSilent`
- `supportsBuzz`
- `supportsReplace`
- `supportsClear`
- `host`
- optional `degradedReasons`

Bridge results should distinguish:

- success,
- degraded success,
- unsupported,
- denied,
- failure.

## Capacitor Android

Use Capacitor Local Notifications or an equivalent native wrapper implementation.

Android channel strategy:

- detection channel: no sound, no vibration,
- lyric-ready channel: no sound, vibration enabled where supported.

If the platform cannot express this distinction, the bridge reports the unsupported capability so Browser can log degradation.

## Tauri Desktop

Tauri is the primary desktop target. Use the active Tauri notification plugin/bridge if present. If not present, expose absent/degraded capability metadata rather than adding Browser assumptions.

## Electron Desktop

Electron is secondary. The first native bridge pass may leave Electron on web/no-op fallback unless packaged EXE tests prove that a native bridge is required.

## Testing

Tests should focus on bridge shape, capability reporting, Android channel configuration, and safe absence/degradation. Native manual proof can be documented where automated host tests are not practical.
