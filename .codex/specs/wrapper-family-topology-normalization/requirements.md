# Requirements Document

## Introduction

This spec corrects the wrapper authority repo topology after the previous ownership migration moved source into the wrapper repo but left desktop wrappers under the misleading top-level `templates/desktop/*` path. The final shape must make every active wrapper family visible under `wrappers/<type>/<wrapper_name>/...`.

This spec also covers the physical repo identity cutover: the current `axolync-android-wrapper` checkout and Git remote are still compatibility names. The final authority identity is `axolync-platform-wrapper`; the repo rename, local folder rename, origin update, and bootstrap reference updates must be treated as part of the same completion boundary, not deferred into another half-migration.

## Resolved Questions

1. The canonical topology is `wrappers/<type>/<wrapper_name>/...`.
2. Capacitor lives under `wrappers/mobile/capacitor`, with Android, iOS, and shared mobile subpaths.
3. Tauri and Electron live under `wrappers/desktop/tauri` and `wrappers/desktop/electron`.
4. `workspace-template` means tracked wrapper-owned source copied by builder into generated build workspaces. It is not an untracked output folder.
5. Top-level `templates/desktop/*` is interim migration history and must not remain active source.
6. Production paths should fail when typed wrapper paths are missing, not silently fall back.
7. Consumer override priority remains: builder TOML, wrapper TOML, wrapper runtime defaults, browser config defaults, browser runtime defaults.
8. Browser remains topology-neutral. Addons may have wrapper-specific payloads, but this topology concern does not require addon repo changes.

## Requirements

### Requirement 1

**User Story:** As a wrapper maintainer, I want every active wrapper family under a typed `wrappers/` topology, so the repo structure reflects wrapper ownership without relying on misleading legacy names.

#### Acceptance Criteria

1. WHEN the wrapper topology is inspected THEN active mobile wrappers SHALL live under `wrappers/mobile/<wrapper_name>/...`.
2. WHEN the wrapper topology is inspected THEN active desktop wrappers SHALL live under `wrappers/desktop/<wrapper_name>/...`.
3. WHEN active source exists outside typed `wrappers/` paths THEN it SHALL be treated as compatibility history, quarantine, or an invalid active-source state.
4. WHEN tests validate wrapper topology THEN they SHALL fail if active wrapper families are only discoverable under top-level `templates/`.

### Requirement 2

**User Story:** As a Capacitor owner, I want Capacitor represented as a mobile wrapper family, so Android, iOS, and shared Capacitor code have a neutral parent path.

#### Acceptance Criteria

1. WHEN the migration is complete THEN active Android/Capacitor source SHALL be canonical under `wrappers/mobile/capacitor/android`.
2. WHEN Capacitor shared code exists THEN it SHALL be canonical under `wrappers/mobile/capacitor/shared`.
3. WHEN Capacitor iOS placeholders exist THEN they SHALL be canonical under `wrappers/mobile/capacitor/ios` and SHALL NOT claim runnable iOS support.
4. IF old `wrappers/capacitor/*` paths remain temporarily THEN they SHALL be documented as compatibility shims and SHALL NOT be the final active authority.

### Requirement 3

**User Story:** As a desktop wrapper owner, I want Tauri and Electron represented as desktop wrapper families, so desktop wrappers are no longer hidden under a top-level template folder.

#### Acceptance Criteria

1. WHEN the migration is complete THEN active Tauri wrapper source SHALL be canonical under `wrappers/desktop/tauri`.
2. WHEN the migration is complete THEN active Electron wrapper source SHALL be canonical under `wrappers/desktop/electron`.
3. WHEN Tauri or Electron needs copyable generated-workspace source THEN that source SHALL live under a nested role folder such as `workspace-template`.
4. WHEN top-level `templates/desktop/tauri` or `templates/desktop/electron` exists THEN it SHALL NOT be accepted as canonical active source.

### Requirement 4

**User Story:** As a builder integrator, I want machine-readable wrapper metadata to expose the typed topology, so builder can consume wrapper-owned paths without guessing.

#### Acceptance Criteria

1. WHEN `config/wrapper-layout.json` is read THEN it SHALL identify canonical active paths under `wrappers/mobile/*` and `wrappers/desktop/*`.
2. WHEN compatibility aliases exist THEN metadata SHALL identify them separately from canonical active source.
3. WHEN metadata points active source to `templates/desktop/*` THEN topology validation SHALL fail.
4. WHEN metadata points active source to missing or placeholder-only paths THEN topology validation SHALL fail.

### Requirement 5

**User Story:** As a repository owner, I want the physical repo identity renamed to `axolync-platform-wrapper`, so the repo name no longer lies about being Android-only.

#### Acceptance Criteria

1. WHEN the repo identity cutover is performed THEN the GitHub repository SHALL be renamed from `axolync-android-wrapper` to `axolync-platform-wrapper` or an explicit equivalent approved target.
2. WHEN the repo identity cutover is performed THEN the local checkout folder SHALL be renamed to match the final repo identity.
3. WHEN the repo identity cutover is performed THEN the local `origin` remote SHALL point to the final GitHub repo URL.
4. WHEN bootstrap or managed-repo documentation references the wrapper repo THEN it SHALL use the final repo identity and SHALL not require the old Android-only name for normal operation.
5. IF a temporary old-name compatibility reference remains THEN it SHALL be documented as transitional and tracked for removal.

### Requirement 6

**User Story:** As a migration reviewer, I want guardrails against another soft completion, so checked tasks cannot hide topology or rename gaps.

#### Acceptance Criteria

1. WHEN tests run THEN they SHALL verify that `wrappers/` contains active desktop and mobile wrapper family roots.
2. WHEN tests run THEN they SHALL verify that top-level `templates/desktop/*` is not used as canonical active source.
3. WHEN tests run THEN they SHALL verify that repo identity metadata and documentation do not present `axolync-android-wrapper` as the final authority.
4. WHEN a task only updates docs without moving active source or validating paths THEN it SHALL NOT satisfy the physical topology requirements.

### Requirement 7

**User Story:** As a defaults owner, I want topology migration to preserve override priority, so moving wrapper source does not change runtime behavior.

#### Acceptance Criteria

1. WHEN wrapper defaults are consumed by builder THEN builder TOML/profile overrides SHALL keep highest priority.
2. WHEN builder does not override a wrapper value THEN wrapper TOML defaults SHALL take priority over wrapper runtime constants.
3. WHEN wrapper defaults do not define a value THEN browser config defaults and browser runtime defaults SHALL remain lower fallback layers.
4. WHEN topology paths change THEN the override chain SHALL remain behaviorally equivalent.

### Requirement 8

**User Story:** As an addon and browser maintainer, I want topology changes isolated to wrapper ownership, so unrelated repos are not forced to learn wrapper folder layout.

#### Acceptance Criteria

1. WHEN browser code runs THEN it SHALL remain unaware of the wrapper repo topology.
2. WHEN addons ship wrapper-specific native payloads THEN they SHALL continue to own their payload descriptors without depending on wrapper repo folder names.
3. WHEN topology metadata changes THEN addon repos SHALL NOT need code changes solely because wrapper source moved under typed paths.
4. WHEN implementation requires browser or addon changes THEN those changes SHALL be rejected unless they fix a generic existing contract bug unrelated to topology.
