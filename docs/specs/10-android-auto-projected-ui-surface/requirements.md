# Requirements: Android Auto Projected UI Surface

## Source Seed

- `docs/project-seeds/10-p0-android-auto-projected-ui-surface.md`

## Requirements

### R1. Android Auto launcher discovery

The Android APK artifact must declare Android Auto projected template support so Android Auto can discover Axolync and make it selectable in Customize Launcher.

Acceptance criteria:

- The Android app manifest declares `com.google.android.gms.car.application` metadata that points to `@xml/automotive_app_desc`.
- `automotive_app_desc.xml` exists and declares `<uses name="template" />`.
- The manifest declares an exported `androidx.car.app.CarAppService` service.
- The service intent filter uses the official `androidx.car.app.CarAppService` action.

### R2. Minimal car-safe template surface

The Android Auto surface must render a minimal Android for Cars template screen.

Acceptance criteria:

- The service extends AndroidX `CarAppService`.
- The service returns a `Session` whose first `Screen` renders a template through AndroidX Car App Library APIs.
- The first screen is read-only/status-oriented and does not duplicate Axolync's browser playback, lyric, songsense, or syncengine state machines.
- The screen tells the user to use the phone app for full controls until a later seed adds a generic control bridge.

### R3. Normal phone runtime preservation

Adding Android Auto support must not break normal Android phone launch or native microphone behavior.

Acceptance criteria:

- The existing Capacitor `MainActivity` launcher intent remains present.
- No AndroidX `CarConnection` or car-mode negotiation logic is introduced.
- The clean native microphone route remains independent from the projected UI surface.

### R4. Builder artifact-profile control and proof

Builder must expose an Android artifact-profile TOML setting that records whether Android Auto launcher support is expected.

Acceptance criteria:

- Android artifact profiles default this setting to enabled.
- Non-Android profiles either omit it or normalize it to disabled.
- Builder passes the setting into Android build metadata/report evidence.
- Builder tests prove the setting is parsed, defaulted, and surfaced for Android profiles.

### R5. Tests and diagnostics

Static and build-time tests must prove the Android Auto wiring.

Acceptance criteria:

- Platform Wrapper tests verify manifest metadata, `automotive_app_desc.xml`, service action, AndroidX Car dependencies, and no car-mode negotiation logic.
- Builder tests verify the TOML/default/report path for the Android Auto launcher-support setting.
- The tests are static and do not require an Android Auto car, emulator, or Desktop Head Unit.

