# Seed 11 - Platform Wrapper Descriptor-Owned Test Command Exports

## Summary

Remove descriptor fallback warnings for `axolync-platform-wrapper` by publishing build, sanity, and full-test command metadata through the repo descriptor.

## Product Context

Platform Wrapper is a consumed core repo. Builder should discover its validation commands from repo-owned descriptor exports, not legacy fallback config.

## Technical Constraints

- Preserve wrapper build/test behavior.
- Do not modify native capture or desktop/mobile runtime logic in this seed.
- Keep any unrelated platform-wrapper PRs separate from this descriptor cleanup branch.

## Required Outcome

- Builder resolves Platform Wrapper command metadata from the descriptor.
- Platform Wrapper descriptor fallback warnings disappear.
- Focused validation proves descriptor-owned discovery.

## Open Questions

- None.
