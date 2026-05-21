# Live Song Notification Bridge

The Browser runtime consumes live song notifications through the runtime host bridge. Wrappers may expose native notification behavior by publishing these methods on the host bridge or a platform plugin that the Browser adapter composes into the host bridge.

## Contract

```ts
type LiveSongNotificationCapabilities = {
  supportsPermissionRequest: boolean;
  supportsSilent: boolean;
  supportsBuzz: boolean;
  supportsReplace: boolean;
  supportsClear: boolean;
  degradedReasons?: string[];
};

type NotificationPermissionResult = {
  state: 'granted' | 'denied' | 'prompt' | 'unsupported';
  reason?: string;
};

type NotificationTransportResult = {
  status: 'success' | 'degraded' | 'unsupported' | 'denied' | 'failed';
  reason?: string;
};
```

## Methods

- `getLiveSongNotificationCapabilities()` returns the capability object above.
- `requestNotificationPermission({ reason })` returns the permission result above.
- `showLiveSongNotification({ id, phase, title, body, silent, buzz })` posts or replaces the notification identified by `id`.
- `clearLiveSongNotification({ id })` clears the currently active notification when supported.

## Behavior

- Detection notifications use `silent=true` and `buzz=false`.
- Lyric-ready notifications use `silent=true` and `buzz=true`.
- Wrappers should replace by stable `id` so only one live song notification is visible.
- Wrappers should return `degraded` rather than throwing when a platform lacks buzz, explicit clear, or a permission prompt path.

## Platform Status

- Capacitor Android publishes `AxolyncLiveSongNotification` as a native plugin and owns permission, channels, buzz, replacement, and clear.
- Tauri desktop does not currently publish a native notification command or plugin in the wrapper template. The Browser Web Notification transport is the intentional fallback for desktop until a dedicated Tauri notification command is added.
- Electron is not an active release artifact today. If it is revived, it should either rely on Web Notifications or publish the same bridge contract explicitly.

## Electron Boundary

Do not add Electron-only native notification code until Electron artifacts are active again. The current supported boundary is Browser Web Notifications or an explicit future implementation of the same host-bridge methods above.
