# Implementation Plan

- [x] 1. Instrument native Android touch delivery in `MainActivity` and cover it with wrapper tests
  - Add structured native touch-delivery logging for single-touch and multi-touch lifecycle events in [MainActivity.kt](/home/deck/src/axolync-android-wrapper/app/src/main/kotlin/com/axolync/android/activities/MainActivity.kt).
  - Record whether each event was forwarded to WebView or consumed by the native gesture gate, including the reason for the decision.
  - Add or extend Android wrapper tests to prove the source contains the expected logging and decision branches without regressing long-press suppression.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.4, 5.1, 6.1_

- [x] 2. Add browser-side lyric touch receipt diagnostics and regression coverage
  - Extend the lyric-scene touch handlers in [main.ts](/home/deck/src/axolync-browser/src/main.ts) so Android touch receipt and action dispatch are explicitly logged to the existing granularity diagnostics stream.
  - Cover touchstart/touchmove/touchend, pinch-start/pinch-apply, and manual drag dispatch in browser tests.
  - Add or update browser regression guards proving the Android touch path still reaches the shared dispatcher while desktop mouse behavior remains unchanged.
  - _Requirements: 1.4, 3.1, 3.2, 3.3, 4.2, 4.3, 5.2, 5.4, 6.2, 6.3_

- [x] 3. Rewrite the Android native gesture gate so intended gestures reach WebView without re-enabling browser-native zoom
  - Replace the blanket multi-touch consume logic in [MainActivity.kt](/home/deck/src/axolync-android-wrapper/app/src/main/kotlin/com/axolync/android/activities/MainActivity.kt) with the narrowest policy that still blocks browser-native pinch zoom and long-press side effects.
  - Preserve single-finger delivery and allow multi-touch gesture data to reach the browser lyric scene.
  - Update Android wrapper tests to prove the new gate forwards intended touch input while keeping zoom/selection suppression in place.
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.4, 5.1, 6.1_

- [x] 4. Add cross-layer diagnostics proof and debug-export coverage for Android touch gesture parity
  - Ensure exported diagnostics contain both native touch-delivery logs and browser-side touch receipt/action logs in a correlatable way.
  - Add tests around the Android native log export surface and browser debug archive expectations so the new touch evidence cannot disappear silently.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.3, 5.4_

- [ ] 5. Prove end-to-end Android gesture parity and sync wrapped browser assets
  - Add focused regression coverage that demonstrates the intended Android path can observe drag-driven lyric navigation and pinch-driven granularity actions through the intended runtime path.
  - Regenerate/sync wrapped browser assets in `axolync-android-wrapper` so the checked-in Android asset tree reflects the new browser touch diagnostics/runtime behavior.
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 5.3, 6.1, 6.2_
