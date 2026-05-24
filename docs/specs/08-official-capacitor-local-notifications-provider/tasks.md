# Tasks

- [x] 1. Add official Capacitor Local Notifications wiring in Platform Wrapper
  - Add `@capacitor/local-notifications` to the Capacitor Android wrapper dependencies at the Capacitor 6-compatible version.
  - Wire the plugin into the manual Android project through Gradle/settings and Capacitor plugin registry evidence.
  - Keep `POST_NOTIFICATIONS` permission and avoid adding unrelated notification-listener/status-bar permissions.
  - Add or update Platform Wrapper tests proving the official `LocalNotifications` native path is present.

- [x] 2. Inject a Platform Wrapper Capacitor live notification provider
  - Add a staged provider script or inline provider that publishes Browser's host-neutral live notification bridge methods.
  - Back permission, show, replace, and clear behavior with official `LocalNotifications` operations.
  - Create quiet detected and lyrics-ready no-sound channels, with lyrics-ready vibration where supported.
  - Preserve existing runtime host bridge capabilities such as debug archive save.
  - Add diagnostics for provider kind, bootstrap state, permission result, show result, clear result, and fallback reason.

- [x] 3. Remove the custom Android live notification plugin source of truth
  - Remove or stop registering `AxolyncLiveSongNotificationPlugin` from Android runtime and staged registry output.
  - Remove Browser direct discovery of the custom `AxolyncLiveSongNotification` Capacitor plugin.
  - Update Platform Wrapper docs/tests to describe official Local Notifications provider behavior.
  - Ensure Android notification capture/status-bar code remains separate and unaffected.

- [x] 4. Update Builder APK validation for official Local Notifications
  - Stop requiring `AxolyncLiveSongNotificationPlugin` in APK inspections.
  - Require official `LocalNotifications` plugin registry/dependency evidence and provider-injection evidence instead.
  - Update focused Builder tests and failure messages.
  - Keep notification-capture/status-bar validation separate from live-song notification delivery validation.

- [x] 5. Verify cross-repo notification provider behavior
  - Run focused Browser tests for wrapper/web notification transport behavior.
  - Run focused Platform Wrapper tests for staging, provider injection, source ownership, and wrapper notification bridge docs.
  - Run focused Builder tests for APK notification validation.
  - Document any remaining manual Android verification step in the final handoff.
