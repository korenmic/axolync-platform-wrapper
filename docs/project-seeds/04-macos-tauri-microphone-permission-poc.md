# Seed 04: macOS Tauri Microphone Permission POC

## Summary

Add the first low-risk macOS Tauri microphone permission metadata needed for packaged Axolync DMG testing.

## Product Context

Axolync macOS Tauri artifacts can fail live capture before microphone startup when `navigator.mediaDevices.getUserMedia` is unavailable. Browser diagnostics will distinguish API absence from permission failure, but the wrapper template should still declare the macOS microphone usage purpose expected by Tauri/macOS bundles.

## Technical Constraints

- Do not claim this alone fixes WebKit/Tauri media API exposure.
- Keep the change limited to the Tauri wrapper template.
- If diagnostics still show missing `navigator.mediaDevices`, a native CoreAudio/Tauri bridge remains a follow-up.

## Open Questions

None. User approved the POC metadata step.
