# Android Auto Projected UI Surface

## Priority

- `P2`

## Summary

Investigate and design an Android Auto-facing Axolync UI surface that can coexist with normal Android UI and navigation split-screen behavior.

## Product Context

Fixing Android Auto audio capture is the immediate P0 need. Separately, Axolync may need an Android Auto-specific UI surface, similar to how media apps expose a simplified car-safe interface while retaining the normal phone interface.

This is not required to prove non-blocking detection, but it may become important for real Android Auto usability.

## Technical Constraints

- Do not block the P0 capture route work on this seed.
- Respect Android Auto app category and template restrictions.
- Platform Wrapper should own Android Auto app/template integration.
- Browser should only expose car-safe route/controller intents if the wrapper requests them through a generic host bridge.
- The UI must not duplicate core playback/detection state machines.
- Any Android Auto UI must have diagnostics proving which surface is active.

## Open Questions

1. Which Android Auto app category can Axolync legitimately fit under?
2. Should the first car UI expose only start/stop detection, or also selected song and lyric sync state?
3. Should this be a projected Android Auto UI only, or also support Android Automotive OS?

