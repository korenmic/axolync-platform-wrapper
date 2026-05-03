import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const workspaceRoot = resolve(import.meta.dirname, '..', '..');
const browserDescriptorReaderPath = resolve(workspaceRoot, 'axolync-browser', 'scripts', 'repo-descriptor-reader.mjs');

test('browser descriptor reader stays wrapper-topology agnostic', () => {
  const source = readFileSync(browserDescriptorReaderPath, 'utf8');
  for (const forbidden of [
    'wrapper_topology',
    'wrappers/',
    'tauri',
    'electron',
    'capacitor',
    'android',
    'ios',
    'desktop',
    'mobile'
  ]) {
    assert.equal(source.includes(forbidden), false, `browser descriptor reader must not know wrapper topology token ${forbidden}`);
  }
});
