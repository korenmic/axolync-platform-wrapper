import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const repoRoot = resolve(import.meta.dirname, '..');

function readRepoFile(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), 'utf8');
}

test('Electron storage placement is resolved before app readiness and owns userData', () => {
  const mainSource = readRepoFile('wrappers/desktop/electron/workspace-template/main.cjs');
  const helperSource = readRepoFile('wrappers/desktop/electron/workspace-template/storagePlacement.cjs');
  const hostSource = readRepoFile('wrappers/desktop/electron/workspace-template/nativeServiceCompanionHost.cjs');

  assert.match(helperSource, /VALID_STORAGE_PROFILES = new Set\(\['portable', 'axolync-home'\]\)/u);
  assert.match(helperSource, /portable-profile-mapped-to-axolync-home-on-posix/u);
  assert.match(helperSource, /join\(dirname\(process\.execPath\), 'storage'\)/u);
  assert.match(mainSource, /resolveDesktopStoragePlacement/u);
  assert.match(mainSource, /app\.setPath\('userData', desktopStoragePlacement\.webviewUserDataDir\)/u);
  assert.ok(
    mainSource.indexOf('resolveDesktopStoragePlacement') < mainSource.indexOf('app.whenReady()'),
    'Electron must resolve desktop storage placement before app readiness.',
  );
  assert.match(hostSource, /storagePlacement/u);
  assert.match(hostSource, /host\.registrations\.loaded/u);
});

test('Tauri storage placement initializes before app build and reaches diagnostics', () => {
  const mainSource = readRepoFile('wrappers/desktop/tauri/workspace-template/src-tauri/src/main.rs');
  const helperSource = readRepoFile('wrappers/desktop/tauri/workspace-template/src-tauri/src/storage_placement.rs');
  const hostSource = readRepoFile('wrappers/desktop/tauri/workspace-template/src-tauri/src/native_service_companion.rs');

  assert.match(mainSource, /mod storage_placement;/u);
  assert.match(mainSource, /initialize_desktop_storage\(\)/u);
  assert.ok(
    mainSource.indexOf('initialize_desktop_storage()') < mainSource.indexOf('build_tauri_app'),
    'Tauri storage placement must initialize before building the Tauri app.',
  );
  assert.match(helperSource, /storage_root\.join\("native-assets"\)/u);
  assert.match(helperSource, /portable-profile-mapped-to-axolync-home-on-posix/u);
  assert.match(helperSource, /generated_native_service_companion_runtime_config\.json/u);
  assert.match(helperSource, /serde\(rename = "storageProfile", default\)/u);
  assert.match(helperSource, /std::env::var\(STORAGE_PROFILE_ENV\)/u);
  const configuredStorageProfileBody = helperSource.match(/fn configured_storage_profile\(\) -> Option<String> \{(?<body>[\s\S]*?)\n\}/u)?.groups?.body || '';
  assert.ok(
    configuredStorageProfileBody.indexOf('std::env::var(STORAGE_PROFILE_ENV)') < configuredStorageProfileBody.indexOf('EMBEDDED_NATIVE_SERVICE_COMPANION_RUNTIME_CONFIG_JSON'),
    'Tauri must let the runtime env override the builder-generated storage profile.',
  );
  assert.ok(
    helperSource.indexOf('fn configured_storage_profile()') < helperSource.indexOf('normalize_storage_profile(configured_storage_profile())'),
    'Tauri must consume builder-generated storageProfile before falling back to platform defaults.',
  );
  assert.match(hostSource, /storage_placement: DesktopStoragePlacement/u);
  assert.match(hostSource, /storagePlacement/u);
  assert.match(hostSource, /NativeCompanionHostState::load\(storage_placement\)/u);
  assert.match(hostSource, /AXOLYNC_NATIVE_DATA_DIR/u);
});
