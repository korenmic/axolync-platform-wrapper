# Platform Wrapper Descriptor-Owned Test Command Exports Requirements

## Requirement 1

**User Story:** As Builder, I want Platform Wrapper command metadata from the descriptor, so validation does not rely on fallback config.

### Acceptance Criteria

1. WHEN Builder resolves Platform Wrapper commands THEN it SHALL use descriptor-owned build, sanity, and full-test exports.
2. WHEN descriptor exports are available THEN Platform Wrapper fallback warnings SHALL disappear.
3. WHEN wrapper validation runs THEN existing wrapper behavior SHALL remain unchanged.

## Requirement 2

**User Story:** As a platform maintainer, I want descriptor cleanup isolated from runtime behavior, so desktop/mobile wrapper functionality is not changed accidentally.

### Acceptance Criteria

1. WHEN this spec is implemented THEN native capture/runtime behavior SHALL NOT change.
2. WHEN validation runs THEN command discovery SHALL be descriptor-owned.
