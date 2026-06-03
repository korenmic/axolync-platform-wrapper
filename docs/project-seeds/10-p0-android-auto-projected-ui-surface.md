# Android Auto Projected UI Surface

## Priority

- `P0`

## Summary

Make Android APK artifacts appear in Android Auto's Customize Launcher by adding the required projected Android Auto template-app discovery surface.

This is not a request to project the normal Capacitor WebView into Android Auto. Android Auto does not discover arbitrary phone launcher activities. The artifact must declare Android Auto support, provide `automotive_app_desc.xml`, expose a valid `androidx.car.app.CarAppService`, and render a minimal car-safe template screen through the Android for Cars App Library.

## Product Context

Axolync now has a working Android native microphone route that can avoid Android Auto playback interruption. The next usability gap is that Axolync is not selectable in Android Auto's Customize Launcher, so the user cannot launch it from the same car UI that exposes apps such as Maps, Spotify, and Waze.

The first car surface should be intentionally minimal. Its purpose is discoverability and safe entry into Axolync while Android Auto is active, not a full karaoke UI. Normal Android phone UI remains the primary Axolync UI.

## Technical Constraints

- Android Auto discovery must use the official template-app path:
  - manifest `<meta-data android:name="com.google.android.gms.car.application" android:resource="@xml/automotive_app_desc" />`
  - `res/xml/automotive_app_desc.xml` with `<uses name="template" />`
  - a manifest-declared service whose intent action is `androidx.car.app.CarAppService`
  - AndroidX Car App Library dependencies, including Android Auto projected support.
- The first implementation must use the `androidx.car.app` template API. It must not fake a media app or add a `MediaBrowserService`, because Axolync is not a music playback provider and that would create the wrong Android Auto category semantics.
- The first template surface may be read-only/status-oriented. It should render Axolync name, listening guidance, and phone-app handoff language. It may expose no start/stop controls until a later seed defines a safe browser/native control bridge.
- The normal Capacitor phone activity must remain unchanged and launchable outside Android Auto.
- Browser must not gain Android Auto-specific code in this seed. Platform Wrapper owns the native projected surface. If future car controls need browser state, a generic host bridge seed must define that separately.
- Builder should expose a TOML artifact-profile value for whether Android Auto launcher support is expected for Android APK artifacts. Default Android profiles should enable it. This value should be projected into build/runtime metadata or Gradle properties so reports and tests can prove intent.
- The implementation must update the canonical Capacitor Android wrapper source, and any root compatibility Android project still used by tests/builds if the repo currently keeps both surfaces.
- Diagnostics/tests must prove:
  - the Android Auto manifest metadata exists when enabled
  - `automotive_app_desc.xml` declares `template`
  - the `CarAppService` service is exported and declares the correct action
  - AndroidX Car App dependencies are present
  - Android APK build metadata records the Android Auto launcher-support setting
  - no AndroidX CarConnection / car-mode negotiation is reintroduced into this seed.
- Manual acceptance target:
  - Build an Android APK with Android Auto launcher support enabled.
  - Install it on the phone.
  - Open Android Auto Customize Launcher.
  - Axolync is visible/selectable there.
  - Opening Axolync from Android Auto shows the minimal car-safe Axolync screen without breaking normal phone UI.

## Open Questions

None. For this seed, choose the projected Android Auto template-app path, keep the first car UI minimal/read-only, and leave Android Automotive OS plus richer controls to future seeds.

## References

- Android Auto templated app discovery requires the `com.google.android.gms.car.application` manifest metadata and an `automotive_app_desc.xml` declaring the `template` capability.
- AndroidX Car App Library currently publishes stable `androidx.car.app:app` and `androidx.car.app:app-projected` artifacts for Android Auto projected support.
