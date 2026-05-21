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
