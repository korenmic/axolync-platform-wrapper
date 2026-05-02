# Wrapper Family Topology Normalization

## Summary

Normalize the wrapper authority repo so every active wrapper family lives under one canonical `wrappers/<type>/<wrapper_name>/...` topology.

Seed 04 completed real source ownership movement, but it allowed desktop Tauri and Electron to become canonical under top-level `templates/desktop/...`. That path name came from the old builder implementation vocabulary, not from the wrapper ownership model. A template is an implementation detail inside a wrapper; it is not a top-level owner.

This continuation seed must correct the topology without changing the already-hardened ownership principle: `axolync-platform-wrapper` owns active wrapper runtime/source/template material, and builder consumes it.

## Priority

- `P0`

## Status

- `draft`
- `todo`
- `spec-made`

## Product Context

The wrapper repo should be understandable by inspection:

- `wrappers/mobile/capacitor/...` owns Capacitor mobile wrapper source.
- `wrappers/desktop/tauri/...` owns Tauri desktop wrapper source.
- `wrappers/desktop/electron/...` owns Electron desktop wrapper source.
- Any copyable workspace skeleton is a nested implementation role such as `workspace-template`, not a top-level repo ownership domain.
- Top-level `templates/` must not be an active source authority for wrapper families.

The current layout is misleading because `wrappers/` visually contains only Capacitor while Tauri and Electron live elsewhere. That makes the migration look incomplete and allows future agents to misunderstand the ownership boundary.

## Technical Constraints

- Preserve current working artifact behavior while moving paths.
- Do not move wrapper source back into builder.
- Do not change browser ownership or teach browser about wrapper repo identity.
- Do not move addon-specific native payload truth into the wrapper repo.
- Keep `axolync-platform-wrapper` as the target repo identity.
- The canonical accepted shape is:

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

- Existing `wrappers/capacitor/...` may be moved or shimmed into `wrappers/mobile/capacitor/...`, but active source truth must end at the typed topology.
- If temporary aliases are needed, they must be documented as compatibility shims and must not be accepted as final active source by tests.
- Top-level `templates/desktop/tauri` and `templates/desktop/electron` must become non-active history, be removed, or be quarantined after the builder cutover proves the typed topology works.

## Completion Criteria

This seed is not complete unless all of the following are true:

1. Active Capacitor source is canonical under `wrappers/mobile/capacitor/...`.
2. Active Tauri source is canonical under `wrappers/desktop/tauri/...`.
3. Active Electron source is canonical under `wrappers/desktop/electron/...`.
4. Copyable workspace skeletons live under each wrapper as nested `workspace-template` or equivalent role folders.
5. `config/wrapper-layout.json` identifies typed wrapper family paths as canonical active source.
6. Structural tests fail if active Tauri or Electron source is canonical under top-level `templates/desktop/*`.
7. Structural tests fail if `wrappers/` does not contain active desktop and mobile family paths.
8. Docs explain the difference between wrapper families and nested workspace templates.
9. Any compatibility shims are clearly marked temporary and cannot be mistaken for active source truth.

## Open Questions

Recommended answers for spec-making:

1. Use `wrappers/<type>/<wrapper_name>/...` as the canonical topology.
2. Use `mobile/capacitor` for Capacitor because it may own Android, iOS, and shared mobile code.
3. Use `desktop/tauri` and `desktop/electron` for desktop wrappers.
4. Use nested `workspace-template` folders for copyable generated-workspace skeletons.
5. Remove or quarantine top-level `templates/desktop/*` after builder consumes the new typed topology.
6. Allow only temporary compatibility shims when needed for one migration window, guarded by tests and documentation.
