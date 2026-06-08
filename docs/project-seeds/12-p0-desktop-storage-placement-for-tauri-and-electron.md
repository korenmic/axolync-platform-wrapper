# Desktop Storage Placement For Tauri And Electron

## Summary

Make desktop wrapper runtimes own Axolync storage placement explicitly, for both Tauri and Electron, so rebuilt desktop artifacts no longer accidentally share stale OS-default WebView/app-data storage.

The immediate production policy is:

- Windows portable desktop artifacts store runtime-created data under the launched artifact folder at `storage/`.
- macOS and Linux desktop artifacts store runtime-created data under `~/.axolync/storage`.
- read-only package layouts, such as a mounted macOS `.dmg`, must never silently fall back to browser/WebView defaults.
- browser, mobile, and web builds do not decide desktop storage placement.

Priority:
- `P0`

## Product Context

Portable desktop artifacts should be predictable to reset and test. If a user extracts or rebuilds a desktop artifact, it should not reuse hidden stale state from an unrelated older run unless that behavior was explicitly configured.

This matters because stale global WebView/AppData storage can break old/new artifact runs with storage-version conflicts such as:

- IndexedDB requested-version downgrade errors
- stale addon/theme manifests
- stale generated runtime settings
- mismatched browser/runtime storage schemas after rebuilding artifacts

Desktop wrapper code is the correct owner because only the host wrapper can direct Tauri/Electron app-data and WebView user-data paths. Browser code can consume storage-related runtime information, but it must not own OS-level storage placement.

## Technical Constraints

### Wrapper Ownership

- Tauri runtime code must receive and apply the selected Axolync storage root before WebView/browser storage initializes.
- Electron runtime code must receive and apply the selected Axolync storage root before app-ready/browser-window storage initializes.
- Both wrappers must expose truthful diagnostics or startup logs showing the resolved storage mode and storage root.

### Storage Layout

The chosen storage root should contain separate subfolders for distinct storage classes, for example:

- `storage/app-data/`
- `storage/webview-user-data/`
- `storage/native-assets/`
- `storage/logs/`
- `storage/cache/`

The exact subfolder names can be refined during spec-making, but native app data and WebView/user-data/profile storage must not be collapsed into an ambiguous single bucket.

### Current Placement Policy

- Windows portable desktop: resolve storage under the launched artifact root as `<artifact-root>/storage`.
- macOS desktop: resolve storage under `~/.axolync/storage`.
- Linux desktop: resolve storage under `~/.axolync/storage`.
- macOS mounted `.dmg` and other read-only package layouts: use `~/.axolync/storage`; do not try to write into the mounted image.

### Failure Policy

- If the selected storage root cannot be created or written, fail loudly with a clear error.
- Do not silently fall back to AppData, browser-default storage, WebKit defaults, Chromium defaults, or other hidden host defaults.
- If a wrapper platform cannot redirect a required WebView storage surface, it must report that limitation truthfully.

### Config Vocabulary

The implementation may reserve storage-placement names for future expansion:

- `portable`: artifact-root storage where supported.
- `axolync-home`: `~/.axolync/storage`.
- `system`: future OS-default app storage such as AppData/Application Support.
- `custom`: future explicit configured path.

For the first implementation, only the currently approved behavior needs to be active.

## Scope

1. Implement a shared storage-placement resolver for desktop wrapper runtimes.
2. Wire Tauri to use the resolved storage root for app-owned runtime roots and WebView user-data where supported.
3. Wire Electron to use the resolved storage root for app-owned runtime roots and WebView/user-data where supported.
4. Emit startup diagnostics proving the selected storage mode and resolved paths.
5. Fail clearly when storage cannot be created/written.
6. Document wrapper limitations if any storage surface cannot be redirected.

## Non-Goals

- Changing mobile storage behavior.
- Changing hosted web/browser storage behavior.
- Implementing future installed-app `system` storage mode now.
- Implementing future arbitrary `custom` storage paths now.
- Building a legacy-storage nuke/reset tool; that belongs in builder as a separate support seed.

## Resolved Questions

1. Tauri storage placement should be resolved during the earliest wrapper startup hook that can still affect app-data and WebView/user-data paths. The exact API/hook is an implementation discovery detail, not a product decision blocker.
2. Electron storage placement should be resolved in the bootstrap path before app-ready/browser-window creation, using `app.setPath("userData", ...)` or the equivalent current Electron authority. The exact file/function is an implementation discovery detail.
3. Use these first-pass subfolders under the selected storage root:
   - `storage/app-data/`
   - `storage/webview-user-data/`
   - `storage/native-assets/`
   - `storage/logs/`
   - `storage/cache/`
4. Emit startup diagnostics that identify the selected storage placement mode and resolved root paths. Include the same evidence in debug ZIP metadata where wrapper-to-debug metadata exists; otherwise startup logs are acceptable until the debug ZIP bridge can consume wrapper metadata.

## Acceptance Direction

- Tauri and Electron both resolve desktop storage through the same Axolync policy.
- Windows portable artifacts write runtime-created state under `<artifact-root>/storage`.
- macOS/Linux desktop artifacts write runtime-created state under `~/.axolync/storage`.
- WebView/IndexedDB/localStorage storage placement is covered or truthfully reported as unsupported.
- Browser/mobile/web code does not own desktop storage placement.
- Startup logs make the resolved storage root auditable.
