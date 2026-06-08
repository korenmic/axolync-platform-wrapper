# Implementation Plan

- [x] 1. Add shared storage-placement helpers to desktop wrapper templates.
  - Add Electron and Tauri helpers that resolve `portable` versus `axolync-home` policy.
  - Create `app-data`, `webview-user-data`, `native-assets`, `logs`, and `cache` subdirectories.
  - Validate write access and fail loudly on failure.
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 4.1_

- [x] 2. Wire Electron storage placement before app-ready.
  - Resolve placement before `app.whenReady()`.
  - Call `app.setPath("userData", placement.webviewUserDataDir)` before BrowserWindow creation.
  - Pass placement metadata into native companion diagnostics.
  - _Requirements: 3.2, 3.3, 4.1, 4.2_

- [x] 3. Wire Tauri storage placement and diagnostics.
  - Initialize placement before the Tauri app is run.
  - Expose placement metadata through native companion diagnostics.
  - Document or diagnose any WebView user-data limitation that cannot be redirected by the current template.
  - _Requirements: 3.1, 3.3, 3.4, 4.1, 4.2, 4.3_

- [x] 4. Add wrapper storage placement tests.
  - Assert Electron uses the storage helper and sets `userData`.
  - Assert Tauri initializes storage placement before app run and exposes diagnostics.
  - Assert browser/mobile/web storage ownership is not introduced.
  - _Requirements: 1.4, 2.3, 2.4, 5.1, 5.2, 5.3_
