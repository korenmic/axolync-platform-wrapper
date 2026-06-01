# Capacitor Android Non-Blocking Capture Routes

## Priority

- `P0`

## Summary

Add Capacitor Android native audio capture providers that can be exposed through Browser's generic wrapper capture route broker.

The immediate goal is to avoid Android Auto playback interruption by using a Shazam-like native phone-side capture route instead of the Android Auto car microphone route. The secondary route is Android playback capture, which is closer to a loopback/virtual line-in concept but has stricter platform limits.

## Product Context

Current Android APK audio capture runs through WebView/browser microphone APIs. In Android Auto testing, starting Axolync detection can stop the currently playing media. Shazam can detect songs while playback continues, so Axolync should not treat `CarAudioRecord` / Android Auto car microphone as the only possible capture path.

The primary Android route should be native phone microphone capture through `AudioRecord`, with no `CarAudioRecord` and no audio-focus request. The wrapper should detect Android Auto/car mode internally and recommend this route to Browser behind the generic capture bridge.

Android `AudioPlaybackCapture` is a different route. It is conceptually similar to a loopback/virtual line-in capture source: it captures playback audio from other apps via `MediaProjection`. It can target allowed playback by usage/UID, but it depends on user consent and source apps allowing capture, so it must be treated as optional and diagnostic-heavy.

## Technical Constraints

- Browser must not contain Android-specific imports or Android Auto logic.
- Capacitor Android owns AndroidX `CarConnection` / car-mode detection.
- Use AndroidX `CarConnection` first to identify projected Android Auto / Automotive OS where possible.
- Fallback to Android car-mode signals such as `UiModeManager` when needed.
- Do not use `CarAudioRecord`.
- Do not request audio focus for the phone-microphone route.
- Do not set call/communication mode.
- Expose route capabilities and active route state through the generic Browser-facing host bridge.
- Support native phone microphone source priority:
  - prefer `UNPROCESSED` if supported;
  - fallback to `MIC`;
  - fallback to `VOICE_RECOGNITION` only if it empirically works better or other sources are unavailable.
- Expose `AudioPlaybackCapture` as a loopback route only when platform requirements are met.
- `AudioPlaybackCapture` must clearly request MediaProjection consent and must log when a source app blocks capture.
- Native chunks must be timestamped and delivered into Browser through the same generic route shape used by other future wrappers.
- Diagnostics must log:
  - car connection state;
  - selected route;
  - Android audio source;
  - fallback source;
  - permission/consent result;
  - chunk counts;
  - whether Browser accepted and forwarded chunks to SongSense.
- Android Auto testing showed `CarConnection` can report `unknown` at capture-route status time even when the APK is being used through Android Auto. The wrapper must expose enough raw diagnostics for Browser/debug bundles to prove whether this is initialization timing, UI-mode mismatch, or a genuine non-car runtime.
- The wrapper should not rely only on a single synchronous `CarConnection.type.value` read if a cached/observed value can make the route recommendation more reliable.

## Reference Notes

- `UNPROCESSED`, `MIC`, and `VOICE_RECOGNITION` are `MediaRecorder.AudioSource` / `AudioRecord` source options, not Axolync settings.
- `AudioPlaybackCapture` is not a microphone mode. It captures playback audio using `AudioPlaybackCaptureConfiguration` and `MediaProjection`.
- `AudioPlaybackCapture` can be an excellent route when it works, but it is not guaranteed for every app because playback sources can opt out.

## Related Seeds

- Browser Seed 154: wrapper capture route broker and loopback toggle.
- Builder Seed 97: alternative capture route capability truth.

## Open Questions

None. Use the resolved direction in this seed.

## Follow-Up Hardening

- Cache/observe AndroidX `CarConnection` state so Android Auto recommendations are not lost when a one-shot read returns `unknown`.
- Include raw AndroidX connection type, UI mode, connection source, and errors in capture-route status logs and response diagnostics.
- Log native `AudioRecord` chunk progress compactly enough to prove the wrapper route is actually delivering audio without flooding runtime logs.
