# Tasks

- [x] 1. Define native live notification bridge capability shape
  - Add or document the runtime host bridge methods and result contracts.
  - Include capability metadata for permission, silent, buzz, replace, and clear.
  - Test safe absent/degraded capability reporting.

- [x] 2. Add Capacitor Android native notification support
  - Wire Local Notifications or equivalent native implementation.
  - Configure quiet detection and silent buzz-ready behavior, using two channels if required.
  - Return structured success/degraded/failure results.
  - Add focused tests or documented native proof for channel/capability behavior.

- [ ] 3. Add or validate Tauri desktop notification bridge
  - Use the active Tauri notification plugin/bridge where available.
  - Expose capability metadata to Browser.
  - Add tests or documented proof for supported/degraded desktop behavior.

- [ ] 4. Decide Electron fallback boundary
  - Verify whether current Electron/EXE artifacts exist and whether web notifications are sufficient.
  - Keep Electron on web/no-op fallback unless native proof shows bridge work is required.
  - Document the result in wrapper notes/tests.

- [ ] 5. Validate Platform Wrapper notification bridge
  - Run focused wrapper tests for capability and bridge behavior.
  - Run relevant platform-wrapper validation for touched files.
