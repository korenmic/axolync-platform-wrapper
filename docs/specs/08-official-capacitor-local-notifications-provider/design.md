# Design

## Overview

Browser already has the right high-level abstraction: a `LiveSongNotificationService` that chooses between wrapper, web, and noop transports.

This spec fixes the wrapper side:

- Platform Wrapper provides a Capacitor-specific native provider script during mobile staging.
- That provider script uses official Capacitor Local Notifications APIs behind Browser's existing runtime host bridge contract.
- Browser consumes only the host-neutral bridge and keeps web notification behavior untouched.
- Builder validates the official provider path in APK artifacts.

## Runtime Ownership

Browser owns:

- live song notification lifecycle,
- user settings,
- web notification fallback,
- transport selection,
- debug bundle export,
- stale-session safety.

Platform Wrapper owns:

- Capacitor Android provider implementation,
- Capacitor package/native dependency wiring,
- provider injection into staged mobile assets,
- wrapper-native diagnostics.

Builder owns:

- artifact inspection and CI/report proof that APK outputs include the official notification provider path.

## Capacitor Provider Injection

The Capacitor staging script should inject a provider script into the staged `index.html`.

The script should:

- load or rely on the packaged Capacitor native bridge runtime,
- call the official `LocalNotifications` plugin via the Capacitor bridge,
- publish the existing Browser-facing methods on `window.__AXOLYNC_RUNTIME_HOST_BRIDGE__`,
- preserve existing runtime-host methods such as debug archive saving,
- expose diagnostics such as provider kind, method availability, permission result, show result, and clear result.

The provider kind should be:

```text
capacitor-local-notifications
```

## Official Local Notifications Wiring

The Capacitor Android project should add the official Local Notifications package at the same major line as Capacitor 6.

Native wiring should include:

- npm dependency for `@capacitor/local-notifications`,
- Gradle include/dependency for the plugin Android project if the existing manual Capacitor project does not run `cap sync`,
- plugin registry entry for `LocalNotifications`,
- `POST_NOTIFICATIONS` manifest permission, already present today.

The provider should use official APIs equivalent to:

- `checkPermissions`
- `requestPermissions`
- `createChannel`
- `schedule`
- `cancel`
- `removeDeliveredNotifications` where supported

## Notification Mapping

Browser bridge input maps to Local Notifications as follows:

- `id`: stable numeric notification id derived from Browser's stable id string.
- `phase = detected`: title/body from Browser, quiet channel, no vibration.
- `phase = lyrics-ready`: title/body from Browser, lyrics-ready channel, vibration allowed, no sound.
- replacement: cancel/remove existing stable id before scheduling the replacement when needed.
- clear: cancel pending notification and remove delivered notification for the stable id when supported.

Channel ids:

- `axolync_live_song_detected`
- `axolync_live_song_lyrics_ready`

## Custom Plugin Removal

Remove the custom Android notification implementation as a source of truth:

- remove or stop registering `AxolyncLiveSongNotificationPlugin`,
- remove `axolync-live-song-notification` plugin registry entries,
- remove Browser direct discovery of `AxolyncLiveSongNotification`,
- update docs/tests to describe official Local Notifications provider behavior.

This removal does not affect the older Android status-bar notification capture feature, which is a separate suspended/feature-flagged capability.

## Browser Compatibility

Browser should continue to instantiate transports in this order:

1. wrapper host bridge transport,
2. web notification transport,
3. noop transport.

The wrapper host bridge is resolved lazily. If Platform Wrapper publishes a native provider, Browser uses it. If not, Browser falls back to web notifications. This preserves working Chrome, Edge, Opera, and Firefox behavior.

## Diagnostics

Debug bundle output should make failure reasons actionable:

- selected transport kind,
- native provider kind,
- host bootstrap snapshot,
- whether Capacitor native bridge/runtime is present,
- provider method names,
- last permission result,
- last show result,
- last clear result,
- fallback reason.

The settings UI should show the underlying unsupported reason when notifications are enabled but native/web delivery cannot proceed.

## Verification

Focused verification should cover:

- Browser transport tests for abstract wrapper provider and web fallback.
- Platform Wrapper staging tests proving `LocalNotifications` provider injection and custom plugin removal.
- Platform Wrapper Android bridge tests proving native dependency/registry evidence.
- Builder APK inspection tests proving official provider validation.

Manual proof after rebuild:

- Android debug bundle should show wrapper selected and provider kind `capacitor-local-notifications`.
- Android should prompt for notification permission where required.
- Detected song should post a quiet notification.
- Lyrics-ready should replace it with the same song title and vibrate if the host allows it.
