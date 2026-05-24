# Official Capacitor Local Notifications Provider

## Summary

Replace the broken custom Android live-song notification plugin with a Platform Wrapper-owned native notification provider that uses Capacitor's official Local Notifications plugin.

Browser remains the owner of notification intent semantics:

- when a detected-song notification is requested
- when it is replaced by a lyrics-ready notification
- when the active notification is cleared
- which user setting gates the feature
- how diagnostics are exported

Platform Wrapper owns native delivery:

- Capacitor Android must use `@capacitor/local-notifications` / `LocalNotifications`.
- Future Capacitor iOS should be able to use the same provider boundary.
- Tauri and Electron should keep separate provider implementations, not Browser-specific imports.
- Web-only Browser builds must continue to use standard Web Notifications without bundling Capacitor-only implementation code.

Priority:

- `P0`

## Product Context

The current Android APK reports:

```text
Live notifications unavailable: notifications unavailable.
```

The debug bundle proves Browser does not see a native notification provider in the APK runtime:

- `selectedTransportKind: "web"`
- wrapper capabilities report `native live notification bridge unavailable`
- `hasWindowCapacitor: false`
- `hasPublishedLiveSongNotificationPlugin: false`
- `hasInjectedRuntimeHostBridge: false`

This means the current custom `AxolyncLiveSongNotificationPlugin` path is not a reliable Android notification source of truth. It also duplicates behavior that Capacitor already maintains officially.

The desired architecture is:

- Browser exposes and consumes a small host-neutral notification bridge contract.
- Platform Wrapper injects the correct native provider for the active wrapper family.
- Capacitor Android uses the official `LocalNotifications` plugin behind that bridge.
- Browser web notifications keep working in normal browsers exactly as they do today.
- The deprecated custom Android notification plugin is removed so there are not two competing Android notification sources of truth.

Reference evidence:

- Capacitor Local Notifications docs: `https://capacitorjs.com/docs/v6/apis/local-notifications`
- Official plugin JS registers `LocalNotifications` through `registerPlugin` from `@capacitor/core`.
- Official Android plugin declares `@CapacitorPlugin(name = "LocalNotifications", permissions = POST_NOTIFICATIONS)`.

## Technical Constraints

- Do not import `@capacitor/local-notifications` in `axolync-browser`.
- Do not bundle Capacitor-only notification implementation into web-only, Tauri-only, or Electron-only Browser assets.
- Keep Browser's existing Web Notifications transport intact for Chrome, Edge, Opera, Firefox, and hosted web.
- Keep Browser as the only notification orchestration owner.
- Platform Wrapper must publish the same Browser-facing methods:
  - `getLiveSongNotificationCapabilities()`
  - `requestNotificationPermission({ reason })`
  - `showLiveSongNotification({ id, phase, title, body, silent, buzz })`
  - `clearLiveSongNotification({ id })`
- Capacitor provider implementation should be injected by the Capacitor staging flow into packaged mobile assets.
- Android delivery must use official Local Notifications APIs for permission, channel creation, schedule/post, and cancel/removal.
- The custom `AxolyncLiveSongNotificationPlugin` Android path must be removed or made unreachable.
- Builder artifact inspection must validate the official `LocalNotifications` path and must stop expecting `AxolyncLiveSongNotificationPlugin`.
- Diagnostics must clearly state the native notification provider kind and fallback reason, for example:
  - `capacitor-local-notifications`
  - `tauri-native`
  - `electron-native`
  - `web`
  - `noop`
- Unsupported native behavior must be truthful, not faked as success.
- Windows portable Tauri notifications remain unsupported unless a separate installed-app or dedicated Windows toast bridge is implemented.

## Resolved Decisions

- This is a seed, not a one-off backlog task, because it spans Platform Wrapper, Browser cleanup, Builder validation, native package dependencies, and diagnostics.
- Browser should keep an abstract native provider opening instead of owning Capacitor/Tauri/Electron-specific implementations.
- Platform Wrapper should own each wrapper-specific native notification provider.
- Capacitor should use the official Local Notifications implementation, not the custom Android plugin.
- The custom Android live-song notification plugin should be removed as a source of truth.
- More debug logging is approved when it clarifies provider selection and native failure reasons.

## Open Questions

None.
