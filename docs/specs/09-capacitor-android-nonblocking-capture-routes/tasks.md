# Tasks

- [x] 1. Add Capacitor Android capture route capability/status bridge fields and diagnostics events.
- [x] 2. Implement Android car-mode detection using AndroidX `CarConnection` with safe fallback behavior.
- [x] 3. Implement native phone microphone `AudioRecord` capture without `CarAudioRecord`, audio focus, or communication mode.
- [x] 4. Implement Android audio source fallback ordering and diagnostics for `UNPROCESSED`, `MIC`, and `VOICE_RECOGNITION`.
- [x] 5. Add `AudioPlaybackCapture` loopback capability and consent/blocking diagnostics where supported.
- [x] 6. Add platform-wrapper tests/static checks for route capability truth, car-mode recommendation, forbidden APIs, source fallback, and bridge publication.
- [x] 7. Replace one-shot AndroidX `CarConnection` reads with cached/observed car connection state so Android Auto recommendations survive transient `unknown` values.
- [x] 8. Expand capture-route status diagnostics with raw AndroidX connection type, UI mode, connection source, errors, and generated timestamps.
- [x] 9. Add compact native route progress diagnostics for `AudioRecord` chunk delivery and update platform-wrapper tests/static checks for the hardened diagnostics.
