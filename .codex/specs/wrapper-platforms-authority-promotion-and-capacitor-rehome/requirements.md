# Requirements Document

## Introduction

This spec promotes the current Android-named wrapper repo toward the neutral cross-platform wrapper authority named `axolync-platform-wrapper`. The preferred path is to rename/refactor `axolync-android-wrapper` into `axolync-platform-wrapper` if GitHub logistics allow history preservation and do not break current Android consumption. If that is not feasible immediately, this repo remains the migration source until parity is proven in a new sibling repo.

The implementation must preserve existing Android/Capacitor buildability and native bridge lessons from Vibra and LRCLIB. Android becomes one wrapper family under the broader wrapper authority, not the only implied purpose of the repo.

## Resolved Questions

1. Prefer renaming/refactoring `axolync-android-wrapper` into `axolync-platform-wrapper`.
2. If rename is not acceptable, create `axolync-platform-wrapper` as a new sibling repo and treat this repo as the temporary migration source.
3. Rehome Android under `wrappers/capacitor/android`.
4. Keep `wrappers/capacitor/ios` as a placeholder only.
5. Keep shared wrapper bridge concepts in wrapper-owned shared code.
6. Keep addon-owned native payload descriptors and assets in addon repos.
7. Preserve Vibra native proxy and LRCLIB native local bridge behavior or expose truthful diagnostics.

## Requirements

### Requirement 1

**User Story:** As a wrapper maintainer, I want this Android-named repo promoted into a neutral wrapper authority, so Android/Capacitor becomes one wrapper family instead of the repo's entire identity.

#### Acceptance Criteria

1. WHEN the repo promotion plan is encoded THEN it SHALL target the `axolync-platform-wrapper` identity.
2. WHEN rename/refactor is feasible THEN the repo SHALL preserve Git history and current Android buildability.
3. IF rename/refactor is not feasible THEN this repo SHALL remain a temporary migration source until the new sibling repo proves Android parity.
4. WHEN documentation references active wrapper ownership THEN it SHALL not describe Android as the only future purpose of the repo.

### Requirement 2

**User Story:** As a Capacitor implementor, I want Android code rehomed under a wrapper-family layout, so future iOS and shared Capacitor work can be added without Android-only structure.

#### Acceptance Criteria

1. WHEN Android code is reorganized THEN Android-specific runtime code SHALL live under `wrappers/capacitor/android` or an equivalent Capacitor child path.
2. WHEN shared Capacitor code exists THEN it SHALL live outside Android-specific folders.
3. WHEN iOS placeholder structure is added THEN it SHALL be labeled as placeholder/staging only and SHALL not claim working iOS support.
4. WHEN build scripts reference Android paths THEN they SHALL be updated to the new layout without breaking Android builds.

### Requirement 3

**User Story:** As a native bridge owner, I want wrapper-owned bridge concepts separated from addon-owned payloads, so Vibra and LRCLIB fixes stay in the right repos.

#### Acceptance Criteria

1. WHEN generic native service companion host code is organized THEN it SHALL live in wrapper-owned shared areas.
2. WHEN Vibra or LRCLIB addon-specific payload files are referenced THEN their source truth SHALL remain in the addon repos.
3. WHEN host compatibility metadata is emitted THEN it SHALL distinguish unsupported, unavailable, refused, startup-failed, and running states.
4. WHEN native operator startup fails THEN diagnostics SHALL expose the failure truth instead of enabling false controls.

### Requirement 4

**User Story:** As a release operator, I want Android build parity preserved during promotion, so repo ownership cleanup does not break APK generation.

#### Acceptance Criteria

1. WHEN the layout changes THEN existing Gradle/Capacitor build tasks SHALL still be able to build the Android wrapper.
2. WHEN browser assets are staged THEN staging SHALL still place the browser output where Capacitor expects it.
3. WHEN native service companion assets are included THEN packaging SHALL avoid duplicate or root-level stray native payload copies.
4. WHEN builder consumes this repo during transition THEN compatibility paths SHALL keep current APK generation working until builder consumes the neutral identity.

### Requirement 5

**User Story:** As a bootstrap owner, I want agents and builder to understand the promotion state, so future edits target the correct wrapper authority.

#### Acceptance Criteria

1. WHEN bootstrap docs are updated THEN they SHALL explain whether this repo is the renamed authority or a temporary migration source.
2. WHEN managed repo docs list wrapper repos THEN they SHALL include the target `axolync-platform-wrapper` identity.
3. WHEN Android-specific docs remain THEN they SHALL be scoped as Android/Capacitor docs, not whole-repo identity docs.
4. WHEN temporary compatibility aliases exist THEN they SHALL include removal criteria.

### Requirement 6

**User Story:** As a regression owner, I want wrapper promotion tests, so Android native bridge behavior survives the rehome.

#### Acceptance Criteria

1. WHEN Android files move THEN structural tests SHALL prove required Android/Capacitor files still exist in the expected generated layout.
2. WHEN native bridge host code is touched THEN tests SHALL cover capability-state mapping for at least Vibra and LRCLIB operator kinds.
3. WHEN app-private asset deployment paths change THEN tests SHALL verify path normalization and duplicate-payload prevention.
4. WHEN compatibility mode is active THEN tests SHALL prove old builder consumption still resolves until the new builder path is active.

## Self-Review Notes

- Requirements are Android-wrapper scoped and do not make builder own wrapper runtime code.
- Requirements use `axolync-platform-wrapper`, matching the final repo-name answer.
- Requirements preserve Android buildability and native bridge truth as hard constraints.
- Requirements explicitly keep iOS as placeholder only.
