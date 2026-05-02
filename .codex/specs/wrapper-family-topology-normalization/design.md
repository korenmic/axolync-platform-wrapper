# Design Document

## Overview

The wrapper authority repo will be normalized around a single typed topology:

```text
wrappers/
  desktop/
    tauri/
      workspace-template/
      native-service-companion/
      README.md
    electron/
      workspace-template/
      native-service-companion/
      README.md
  mobile/
    capacitor/
      android/
      ios/
      shared/
      README.md
```

This design treats `workspace-template` as tracked wrapper-owned source that builder copies into generated build workspaces. It is not an untracked output directory and not a top-level ownership domain. The old top-level `templates/desktop/*` paths become invalid as canonical active source.

The repo identity cutover is part of this topology completion. The target authority is `axolync-platform-wrapper`; `axolync-android-wrapper` remains only a pre-cutover compatibility name until the GitHub repo, local checkout folder, remote URL, and bootstrap references are updated.

## Architecture

The topology has three layers:

1. Repo identity: `axolync-platform-wrapper` is the final source authority.
2. Wrapper family type: `wrappers/mobile` and `wrappers/desktop`.
3. Wrapper implementation: `capacitor`, `tauri`, `electron`.

Wrapper metadata remains the machine-readable contract for builder consumption. `config/wrapper-layout.json` must describe canonical paths and any temporary compatibility aliases separately.

The builder cutover spec consumes this topology. This wrapper-side spec publishes the structure, metadata, validation, and repo identity proof.

## Components and Interfaces

### Wrapper Family Paths

- `wrappers/mobile/capacitor/android` contains active Android/Capacitor source.
- `wrappers/mobile/capacitor/ios` contains only placeholder/future support unless a separate iOS implementation proves it runnable.
- `wrappers/mobile/capacitor/shared` contains shared Capacitor/mobile wrapper logic.
- `wrappers/desktop/tauri/workspace-template` contains Tauri workspace skeleton source copied by builder.
- `wrappers/desktop/electron/workspace-template` contains Electron workspace skeleton source copied by builder.

### Wrapper Layout Metadata

`config/wrapper-layout.json` should expose each wrapper family with:

- `type`: `mobile` or `desktop`.
- `name`: `capacitor`, `tauri`, or `electron`.
- `root`: canonical typed wrapper root.
- `platforms`: concrete canonical source paths.
- `compatibilityAliases`: old temporary paths, if any.
- `active`: whether the path is build-consumable now.

Canonical `root` or `authorityPath` values must not point to top-level `templates/desktop/*`.

### Repo Identity Proof

Repo identity validation should check tracked docs/config that describe:

- final authority name: `axolync-platform-wrapper`;
- current compatibility alias status, if any;
- bootstrap/managed-repo references that should move to the final name;
- absence of final-authority language that still treats `axolync-android-wrapper` as the permanent repo.

Actual GitHub rename/local folder rename is operational, but the implementation tasks must include scripts/docs/tests that make the expected state explicit and verifiable.

## Data Models

### Wrapper Family Entry

```json
{
  "type": "desktop",
  "name": "tauri",
  "root": "wrappers/desktop/tauri",
  "active": true,
  "platforms": {
    "windows": {
      "templateRoot": "wrappers/desktop/tauri/workspace-template"
    }
  },
  "compatibilityAliases": []
}
```

### Compatibility Alias Entry

```json
{
  "path": "templates/desktop/tauri",
  "reason": "historical interim path",
  "active": false,
  "removeAfter": "builder typed topology cutover"
}
```

## Error Handling

Topology validation should fail actionably when:

- a canonical active path is missing;
- a canonical active path points under top-level `templates/desktop/*`;
- `wrappers/desktop/tauri` or `wrappers/desktop/electron` is missing;
- `wrappers/mobile/capacitor/android` is missing or placeholder-only;
- metadata cannot distinguish canonical source from compatibility aliases;
- repo identity docs still present `axolync-android-wrapper` as the final authority.

Failures should name the bad path and the expected replacement path.

## Testing Strategy

Add wrapper-local structural tests that:

- parse `config/wrapper-layout.json`;
- assert every active wrapper root starts with `wrappers/mobile/` or `wrappers/desktop/`;
- assert Tauri and Electron exist under `wrappers/desktop/*`;
- assert Capacitor Android exists under `wrappers/mobile/capacitor/android`;
- reject active `templates/desktop/*`;
- detect placeholder-only source roots;
- validate repo identity docs/config use `axolync-platform-wrapper` as the final authority and old names only as temporary aliases.

The tests should not require Android emulators, Tauri builds, or Electron packaging. Their job is source topology proof.
