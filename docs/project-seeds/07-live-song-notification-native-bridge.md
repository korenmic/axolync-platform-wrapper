# Live Song Notification Native Bridge

## Summary

Expose Platform Wrapper native notification capabilities for Browser-owned live song notifications.

This child seed comes from Browser umbrella seed `86-cross-platform-live-song-notifications.md`. Browser owns when notifications should happen. Platform Wrapper owns host-native delivery where plain web notifications are insufficient.

Wrapper scope:

- Determine active packaged targets: Capacitor Android, Tauri desktop, Electron desktop, or other wrapper hosts.
- Expose a minimal runtime host bridge for local/live song notifications if missing.
- Support permission requests, show, replace-by-id/tag, and clear-by-id where possible.
- Configure Android notification behavior through native/local notification channels where required.
- Report capability metadata so Browser can degrade truthfully.

Priority:

- `P1`

## Product Context

Browser JavaScript cannot guarantee identical notifications across hosted web, Android WebView, and desktop wrappers. Native packaged apps should use native notification systems when possible.

The wrapper bridge should let Browser ask for a host-neutral notification intent and receive a truthful result, not require Browser to know Android/Tauri/Electron details.

Expected native behavior:

- Detection notification: silent, no buzz.
- Lyric-ready replacement: silent, buzz/vibrate where supported.
- Stable id/tag replacement where supported.
- Clear current notification where supported.
- Unsupported behavior must be reported as degraded rather than faked.

## Technical Constraints

- Do not decide live song timing in Platform Wrapper.
- Keep Browser as the orchestration owner.
- Keep the bridge minimal and host-neutral.
- Do not introduce remote push notifications.
- Do not require background/killed-app notification support.
- Capacitor Android should prefer Local Notifications or equivalent native bridge.
- Android channel design must avoid notification sound for this feature.
- If Android cannot support silent+buzz replacement in one channel, document and expose the limitation.
- Tauri should use the Tauri notification plugin/bridge if active.
- Electron should either prove web notifications are sufficient or expose a native bridge.
- Capability metadata should include support for permission, silent, buzz, replace, and clear.

Suggested bridge shape:

- `requestNotificationPermission({ reason })`
- `showLiveSongNotification({ id, title, body, phase, silent, buzz })`
- `clearLiveSongNotification({ id })`
- `getLiveSongNotificationCapabilities()`

## Resolved Decisions

- Capacitor Android should use two notification channels if required to express quiet detection and silent buzz-ready replacement.
- Tauri is the primary desktop packaged target for this feature.
- Electron is secondary; it may initially degrade to web/no-op fallback unless packaged EXE testing proves a native bridge is required.
- Platform Wrapper native transport is not mandatory for the first Browser+Builder PR group, but this seed defines the native bridge follow-up.

## Open Questions

None.
