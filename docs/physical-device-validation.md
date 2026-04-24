# Physical Device Validation

This document defines the physical-device validation flow historically tracked under task `19` in `deprecated/.kiro/specs/android-apk-wrapper/tasks.md`.

## Target Device Profile

- Android 10+ (2019 or newer device class)
- 4GB RAM minimum
- Microphone available
- Stable Wi-Fi connection for remote provider checks

## Execution

Run:

```bash
./scripts/run-physical-device-validation.sh
```

The script:

1. Detects connected `adb` device(s)
2. Captures device model + Android version metadata
3. Runs instrumentation sanity tests
4. Stores a run report at:
   - `tests/output/physical-device/latest.md`
   - `tests/output/physical-device/history.ndjson`

## Measurements

The validation run currently tracks:

- connected Android test pass/fail status
- Audio-capture sanity pipeline enablement
- Device profile metadata for reproducibility

If no device is connected, the script writes a `SKIPPED` report entry with reason `no_adb_device_connected`.

## LRCLIB Native Loopback Proof Limit

The Capacitor LRCLIB native implementation is currently non-device proven only. Unit and staging tests can prove descriptor dispatch, packaged asset presence, Brotli DB deployment code paths, SQLite query code paths, loopback route code paths, and APK asset guardrails, but they do not prove a real Android WebView can fetch the bound loopback server on a physical device.

Do not mark the Android LRCLIB native path device-proven until a debug archive from a real APK run contains all of these events for `axolync-addon-lrclib` / `lrclib_local`:

- `host.registration.loaded` with `runtimeOperatorKind=lrclib-local-loopback-v1`
- `runtime-operator.dispatch.selected`
- `lrclib.db.asset.resolved`
- `lrclib.db.deploy.completed` or `lrclib.db.deploy.reused`
- `runtime-operator.lrclib.loopback.bound`
- `companion.connection.resolved`
- `lrclib.loopback.request.received`
- `lrclib.sqlite.open.completed`
- `lrclib.sqlite.query.completed`
- `lrclib.loopback.request.completed`

The first manual proof should install an LRCLIB-native APK variant, enable LRCLIB native mode, request a known local-subset lyric, export the debug archive, and verify the local-result classification is `local-hit`, `plain-only`, or truthful `subset-miss` without Android claiming native success while returning wrapper HTML or unrelated Shazam/Vibra responses.
