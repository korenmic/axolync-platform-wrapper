# Requirements Document

## Introduction

This spec makes `axolync-platform-wrapper` the runtime authority for desktop storage placement. Tauri and Electron desktop wrappers must resolve Axolync app-data, WebView/user-data, diagnostics, native-assets, logs, and cache roots explicitly instead of inheriting hidden OS/browser defaults.

## Requirements

### Requirement 1

**User Story:** As a desktop artifact tester, I want portable Windows artifacts to keep runtime state beside the launched artifact, so that old AppData or WebView state cannot corrupt rebuilt portable runs.

#### Acceptance Criteria

1. WHEN a Windows desktop wrapper resolves storage in `portable` mode THEN it SHALL use `<artifact-root>/storage` as the selected storage root.
2. WHEN storage subpaths are created THEN the wrapper SHALL use distinct subfolders for `app-data`, `webview-user-data`, `native-assets`, `logs`, and `cache`.
3. WHEN the selected storage root cannot be created or written THEN startup SHALL fail loudly with an actionable error instead of silently falling back to OS/browser defaults.
4. IF the artifact is still zipped or launched from an unusable location THEN the wrapper SHALL report the storage failure truthfully.

### Requirement 2

**User Story:** As a macOS/Linux desktop tester, I want Axolync storage to live in a visible Axolync-owned home path, so that read-only package layouts do not write to ambiguous browser defaults.

#### Acceptance Criteria

1. WHEN a macOS desktop wrapper resolves storage THEN it SHALL use `~/.axolync/storage` as the selected storage root.
2. WHEN a Linux desktop wrapper resolves storage THEN it SHALL use `~/.axolync/storage` as the selected storage root.
3. WHEN a read-only macOS `.dmg` style launch occurs THEN the wrapper SHALL NOT attempt to write into the mounted image.
4. WHEN the Axolync home storage root cannot be created or written THEN startup SHALL fail loudly.

### Requirement 3

**User Story:** As a wrapper maintainer, I want Tauri and Electron to share the same storage-placement policy, so that wrapper behavior does not drift by host family.

#### Acceptance Criteria

1. WHEN Tauri starts THEN it SHALL resolve storage before app-data and WebView/user-data paths are used.
2. WHEN Electron starts THEN it SHALL resolve storage before `app.ready` and before BrowserWindow creation.
3. WHEN storage placement is resolved THEN both wrappers SHALL expose the same normalized storage metadata shape.
4. IF a WebView storage surface cannot be redirected by a wrapper platform THEN the wrapper SHALL report that limitation truthfully.

### Requirement 4

**User Story:** As a diagnostician, I want storage placement evidence in wrapper diagnostics, so that debug logs show where desktop state was written.

#### Acceptance Criteria

1. WHEN a desktop wrapper starts THEN it SHALL log the selected storage profile, platform, storage root, and resolved subpaths.
2. WHEN native companion diagnostics are queried THEN storage placement metadata SHALL be included when that bridge exists.
3. WHEN diagnostics are unavailable for a wrapper path THEN startup logs SHALL still include storage placement evidence.

### Requirement 5

**User Story:** As a browser maintainer, I want browser/mobile/web to stay out of desktop storage placement, so that storage ownership remains in the wrapper layer.

#### Acceptance Criteria

1. WHEN desktop storage placement is implemented THEN browser runtime code SHALL NOT decide OS storage paths.
2. WHEN mobile/web hosts run THEN this desktop storage placement code SHALL NOT change their storage behavior.
3. WHEN tests verify the feature THEN they SHALL assert Tauri and Electron surfaces are present without coupling browser to wrapper internals.
