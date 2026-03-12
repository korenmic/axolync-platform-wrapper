# Android Touch Fix Roadmap - 2026-03-12

## Short answer

The first A/B idea is only partially exhausted.

- **Exhausted:** wrapper-level A/B using `AXOLYNC_ANDROID_TOUCH_SUPPRESSION_MODE`
- **Not exhausted:** browser-side suppression isolation inside the wrapped browser bundle

That means the earlier `full` versus `off` APK comparison was real, but it only tested one layer of the suppression stack.

## What has already been done

### Completed diagnosis work

1. Added native Android touch-delivery logging in the wrapper.
2. Added browser-side lyric-scene touch receipt logging.
3. Reworked the obvious native multi-touch swallow path in `MainActivity.kt`.
4. Added debug/export surfaces so Android touch evidence can be inspected later.
5. Added the first A/B flag:
   - `AXOLYNC_ANDROID_TOUCH_SUPPRESSION_MODE`

### Completed A/B result

These two cases have already been tested in substance:

1. **Historical baseline**
   - behavior before the new flag existed
   - effectively equivalent to wrapper suppression mode `full`
2. **Explicit wrapper-off build**
   - `AXOLYNC_ANDROID_TOUCH_SUPPRESSION_MODE=off`

### What that result means

The wrapper-only A/B did **not** restore clean touch parity.

So the wrapper-injected suppression bundle is not the whole story.

## Why the first A/B was not enough

The wrapped browser still contains its own independent blockers, including:

- static viewport lock with `user-scalable=no`
- `#lyric-display { touch-action: none; }`
- Android-wrapper lyric display overflow suppression
- browser-level `gesturestart` prevention

Those survive even when the wrapper-only suppression mode is switched off.

## Current map

### Done

- native logging
- browser receipt logging
- native gate rewrite
- wrapper-level A/B flag
- wrapper-level `full` versus `off` testing

### Current

- isolate the wrapped browser's own suppression stack separately from the native wrapper stack

### Next

1. Add a second browser-side profile:
   - `AXOLYNC_ANDROID_BROWSER_TOUCH_SUPPRESSION_PROFILE`
   - passed into browser build as `VITE_AXOLYNC_ANDROID_TOUCH_SUPPRESSION_PROFILE`
2. Build one APK with:
   - wrapper suppression still configurable
   - browser suppression set to `relaxed`
3. Compare whether touch behavior changes materially

### After that

If touch becomes sane:
- the browser-side suppression layer is confirmed as a major blocker
- re-enable protections incrementally until the smallest safe subset is found

If touch is still chaotic:
- stop broad A/B work
- move to more targeted hit-testing / event-path instrumentation
- keep the control panel fallback on deck as a permanent product feature

## Practical interpretation of A/B now

### Exhausted

- wrapper-only A/B

### Still valid and now implemented

- layered A/B
  - wrapper suppression mode
  - browser suppression profile

That is the correct remaining experiment. It is not the same thing as repeating the old A/B.

## Remaining steps to get to "done"

1. Test the new browser-side suppression profile in a wrapped Android APK.
2. Decide whether touch delivery becomes:
   - restored
   - improved but still inconsistent
   - unchanged
3. If restored or improved:
   - re-enable the browser protections in smaller pieces
4. If unchanged:
   - stop using suppression toggles as the main theory
   - pivot to target-layer hit testing and event-path tracing
5. Only after that, decide whether the permanent control-panel fallback becomes:
   - necessary for product reliability
   - or primarily accessibility / power-user functionality

## Bottom line

We are not in a random loop.

We have exhausted one real branch of the investigation, and the next branch is now explicitly defined:

- **Branch 1 done:** wrapper suppression A/B
- **Branch 2 now active:** browser suppression A/B
