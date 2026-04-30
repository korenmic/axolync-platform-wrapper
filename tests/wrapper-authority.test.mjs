import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

test('wrapper authority config names the target platform wrapper and temporary Android alias', () => {
  const authorityPath = path.join(repoRoot, 'config', 'wrapper-authority.json');
  const authority = JSON.parse(fs.readFileSync(authorityPath, 'utf8'));

  assert.equal(authority.targetRepo, 'axolync-platform-wrapper');
  assert.equal(authority.currentPhysicalRepo, 'axolync-android-wrapper');
  assert.equal(authority.migrationMode, 'rename-refactor-source');
  assert.equal(authority.compatibilityAlias, 'axolync-android-wrapper');
  assert.deepEqual(authority.activeWrapperFamilies, ['capacitor']);
  assert.equal(authority.activePlatformPaths.capacitorAndroid, 'wrappers/capacitor/android');
  assert.match(
    authority.removalCriteria.join('\n'),
    /builder resolves axolync-platform-wrapper directly/,
  );
});
