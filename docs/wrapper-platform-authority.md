# Wrapper Platform Authority

`axolync-platform-wrapper` is the target source-of-truth identity for Axolync wrapper runtime code.

This checkout is currently still physically named `axolync-android-wrapper`. Treat that name as a temporary compatibility alias while the repo is promoted by rename/refactor. It must not become a permanent second source of wrapper runtime truth.

## Active Migration Mode

- Target authority: `axolync-platform-wrapper`
- Current physical checkout: `axolync-android-wrapper`
- Active mode: `rename-refactor-source`
- Active wrapper family: Capacitor
- Active Android target path: `wrappers/capacitor/android`
- iOS state: placeholder only, no build support is claimed by this repo yet

## Compatibility Policy

Remaining `axolync-android-wrapper` naming is allowed only where external builder/bootstrap code still consumes the old checkout name. New shared wrapper code should be written under wrapper-family paths and docs should describe Android as one child platform under Capacitor.

The compatibility alias can be removed after builder resolves `axolync-platform-wrapper` directly, Android artifact parity is proven from the rehomed path, and no bootstrap docs require the old repo name as the runtime authority.

## Android-Specific Scope

Use `wrappers/capacitor/android/` for Android host details. Shared host protocol, deployment, diagnostics, and wrapper defaults belong under `wrappers/capacitor/shared/` or `native-service-companions/` so future Tauri, Electron, and iOS work does not inherit Android-only ownership names.
