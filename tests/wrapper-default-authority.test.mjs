import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('wrapper authority preserves default override order without leaking topology to browser or addons', () => {
  const docs = fs.readFileSync(path.join(repoRoot, 'docs', 'wrapper-platform-authority.md'), 'utf8');
  const expectedOrder = [
    'builder TOML',
    'wrapper TOML',
    'wrapper source defaults',
    'browser build config defaults',
    'browser runtime defaults',
  ];

  let previousIndex = -1;
  for (const label of expectedOrder) {
    const index = docs.indexOf(label);
    assert.notEqual(index, -1, `missing default authority label: ${label}`);
    assert.ok(index > previousIndex, `${label} must appear after the previous authority layer`);
    previousIndex = index;
  }

  const layout = fs.readFileSync(path.join(repoRoot, 'config', 'wrapper-layout.json'), 'utf8');
  assert.equal(layout.includes('axolync-browser'), false, 'wrapper topology must not depend on a browser repo path');
  assert.equal(layout.includes('addon'), false, 'wrapper topology must not expose addon-owned defaults or paths');
});
