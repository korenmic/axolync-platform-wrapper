# Seed 14: De-duplicate Duplicated Project-Seed Indices (axolync-platform-wrapper)

## Priority

P2

## Summary

Assign unique running indices to this repo's project seeds. Parallel-agent authoring produced 2 duplicated index value(s) under `docs/project-seeds/`. Give each colliding seed a unique index, keeping the already-implemented or older seed at its original index and renumbering the others to the next free index.

## Product Context

A duplicate-index scan reports 2 duplicated index value(s) in `axolync-platform-wrapper`. This is part of a workspace-wide cleanup (browser seed 218 tracks the browser case; other affected `axolync-` repos each carry their own dedup seed). Duplicate indices break the assumption that an index uniquely identifies a seed, used by dashboards, reports, and cross-references.

## Technical Constraints

- Keep the implemented/merged seed at its index; if neither collided seed is implemented, keep the older one by first-commit date and renumber the other(s) to the next free unused index.
- Never renumber a seed a merged PR already references.
- Preserve seed content; only the filename index (and any in-file index reference) changes.
- Cross-agent seeds should be coordinated; the first-commit author (`git log --diff-filter=A --format=%an`) carries the Sinq tag.

## Open Questions

- Confirm the keeper vs renumber choice for each collision.
- Add a CI check that fails on duplicate seed indices to prevent recurrence?
