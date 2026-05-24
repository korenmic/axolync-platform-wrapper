# Live Song Notification Bridge

The Browser runtime consumes live song notifications through the runtime host bridge. Wrappers expose native notification behavior by publishing these methods on the host bridge; Browser must not import or directly discover wrapper-specific notification plugins.

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

- Capacitor Android publishes these host-bridge methods from Platform Wrapper staging code and backs them with the official Capacitor `LocalNotifications` plugin. The old custom `AxolyncLiveSongNotification` plugin is not a supported source of truth.
- Tauri desktop publishes the same bridge through global Tauri invoke commands and the native `tauri-plugin-notification` plugin. It owns permission and native toast posting where the host supports it. Windows portable ZIP artifacts must report notification delivery as unsupported because Tauri's notification plugin only displays native Windows toasts for installed apps. Buzz, fully silent delivery, and explicit active-toast clearing are reported as degraded when the platform/API cannot guarantee them.
- Electron is not an active release artifact today. If it is revived, it should either rely on Web Notifications or publish the same bridge contract explicitly.

## Electron Boundary

Do not add Electron-only native notification code until Electron artifacts are active again. The current supported boundary is Browser Web Notifications or an explicit future implementation of the same host-bridge methods above.
