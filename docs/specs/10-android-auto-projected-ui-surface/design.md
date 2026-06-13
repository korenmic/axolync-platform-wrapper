# Design: Android Auto Projected UI Surface

## Ownership

Platform Wrapper owns Android Auto native integration. Browser remains platform-agnostic in this seed. Builder owns artifact-profile defaults and build/report evidence.

## Platform Wrapper implementation

The Capacitor Android wrapper should add Android Auto projected template support to the canonical wrapper source:

- Add AndroidX Car App Library dependencies:
  - `androidx.car.app:app`
  - `androidx.car.app:app-projected`
- Add `app/src/main/res/xml/automotive_app_desc.xml` with the `template` capability.
- Add manifest metadata under `<application>`:
  - `android:name="com.google.android.gms.car.application"`
  - `android:resource="@xml/automotive_app_desc"`
- Add a manifest service entry for the Axolync car service:
  - exported
  - action `androidx.car.app.CarAppService`
- Add a minimal Kotlin `CarAppService`, `Session`, and first `Screen`.

The first screen should use a simple `PaneTemplate` with an app-icon header and rows that identify Axolync and explain that full controls remain in the phone UI. This keeps the first surface policy-safe and avoids creating a premature control/state bridge.

If the repository still keeps both a root compatibility Android project and the canonical `wrappers/mobile/capacitor/android` project, both must be updated or a test must prove the root copy is no longer build-authoritative.

## Builder implementation

Builder should add a normalized artifact-profile field:

- Suggested TOML key: `android_auto_launcher_enabled`
- Default for Android profiles: `true`
- Default for non-Android profiles: `false`

Builder should pass this into Android build metadata/report evidence. If Platform Wrapper later supports Gradle-level disabling, this value can become an actual build toggle. In this seed it is still useful because it turns the expected Android Auto launcher surface into explicit builder-owned artifact intent instead of hidden native wiring.

## Validation

Validation is primarily static:

- Manifest and XML checks prove Android Auto discovery.
- Kotlin source checks prove the Car App service exists without reintroducing car-mode capture negotiation.
- Gradle checks prove Car App dependencies are present.
- Builder unit tests prove TOML/default/report evidence.

Manual validation remains required for final product proof: install APK, open Android Auto Customize Launcher, confirm Axolync appears, then open the minimal car screen.

