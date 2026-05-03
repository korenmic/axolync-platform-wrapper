import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const repoRoot = resolve(import.meta.dirname, '..');
const contract = require('../../axolync-contract/tools/repo-descriptor.js');

test('platform-wrapper descriptor validates through axolync-contract', () => {
  const descriptorPath = resolve(repoRoot, 'axolync.repo.toml');
  const descriptorText = readFileSync(descriptorPath, 'utf8');
  const result = contract.parseRepoDescriptorToml(descriptorText, { path: descriptorPath });

  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.descriptor.repo.id, 'axolync-platform-wrapper');
  assert.deepEqual(result.descriptor.repo.roles, ['consumer', 'consumable']);
});

test('platform-wrapper descriptor declares required contract and browser dependencies', () => {
  const descriptor = contract.loadRepoDescriptorFile(resolve(repoRoot, 'axolync.repo.toml')).descriptor;
  const consumes = descriptor.consumes.repos.map((repo) => ({
    id: repo.id,
    use: repo.use,
    required: repo.required
  }));

  assert.deepEqual(consumes, [
    {
      id: 'axolync-contract',
      use: 'schema-and-runtime-contracts',
      required: true
    },
    {
      id: 'axolync-browser',
      use: 'browser-runtime',
      required: true
    }
  ]);
});

test('platform-wrapper descriptor exports dedicated canonical wrapper topology', () => {
  const descriptor = contract.loadRepoDescriptorFile(resolve(repoRoot, 'axolync.repo.toml')).descriptor;
  const topology = descriptor.exports.wrapper_topology;

  assert.equal(topology.authority, 'config/wrapper-layout.json');
  assert.deepEqual(
    topology.families.map((family) => [family.type, family.name, family.path]),
    [
      ['mobile', 'capacitor', 'wrappers/mobile/capacitor'],
      ['desktop', 'tauri', 'wrappers/desktop/tauri'],
      ['desktop', 'electron', 'wrappers/desktop/electron']
    ]
  );

  for (const family of topology.families) {
    assert.match(family.path, new RegExp(`^wrappers/${family.type}/${family.name}`));
    if (family.workspace_template_path) {
      assert.match(family.workspace_template_path, new RegExp(`^wrappers/${family.type}/${family.name}/`));
    }
    if (family.native_companion_path) {
      assert.match(family.native_companion_path, new RegExp(`^wrappers/${family.type}/${family.name}/`));
    }
  }
});

test('platform-wrapper descriptor models generated wrapper outputs as exports only', () => {
  const descriptor = contract.loadRepoDescriptorFile(resolve(repoRoot, 'axolync.repo.toml')).descriptor;
  const generatedOutputs = descriptor.exports.generated_outputs;

  assert.deepEqual(
    generatedOutputs.map((output) => [output.name, output.kind, output.path]),
    [
      ['capacitor-android-workspace', 'workspace', 'wrappers/mobile/capacitor/android'],
      ['capacitor-public-assets', 'copied-asset', 'wrappers/mobile/capacitor/android/app/src/main/assets/public'],
      ['tauri-workspace-template', 'template', 'wrappers/desktop/tauri/workspace-template'],
      ['electron-workspace-template', 'template', 'wrappers/desktop/electron/workspace-template'],
      ['native-service-companion-host-protocol', 'native-payload', 'native-service-companions/host-protocol'],
      ['native-service-companion-deployment', 'generated-asset', 'native-service-companions/deployment']
    ]
  );

  const consumedIds = descriptor.consumes.repos.map((repo) => repo.id);
  for (const output of generatedOutputs) {
    assert.equal(consumedIds.includes(output.path), false);
    assert.equal(consumedIds.includes(output.name), false);
  }
});
