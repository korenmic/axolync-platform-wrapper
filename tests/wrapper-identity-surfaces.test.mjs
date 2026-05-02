import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function listFiles(dir) {
  const rootDir = path.join(ROOT, dir);
  const found = [];
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFiles(path.relative(ROOT, entryPath)));
    } else {
      found.push(path.relative(ROOT, entryPath));
    }
  }
  return found;
}

test('repo-level identity describes the platform-wrapper migration source, not an Android-only authority', () => {
  const readme = read('README.md');
  assert.match(readme.split(/\r?\n/u)[0], /Platform Wrapper Migration Source/);
  assert.match(readme, /Target wrapper authority: `axolync-platform-wrapper`/);
  assert.match(readme, /Android is one child target under the Capacitor wrapper family/);
  assert.match(readme, /Soft completion is not accepted/);
  assert.doesNotMatch(readme.split(/\r?\n/u)[0], /Android Wrapper/);
});

test('shared wrapper authority docs keep Android-specific details under capacitor android paths', () => {
  const authority = read('docs/wrapper-platform-authority.md');
  const androidReadme = read('wrappers/mobile/capacitor/android/README.md');
  assert.match(authority, /Use `wrappers\/mobile\/capacitor\/android\/` for Android host details/);
  assert.match(authority, /metadata, compatibility aliases, placeholder directories, quarantine ledgers, or docs-only changes are not valid completion signals/i);
  assert.match(authority, /compatibility alias can be removed after builder resolves `axolync-platform-wrapper` directly/);
  assert.match(androidReadme, /Do not add new shared wrapper concepts directly under Android-only paths/);
});

test('shared wrapper source areas do not claim Android-only repo ownership', () => {
  const sharedFiles = [
    ...listFiles('wrappers/mobile/capacitor/shared'),
    ...listFiles('native-service-companions'),
  ];
  assert.ok(sharedFiles.length > 0);
  for (const relPath of sharedFiles) {
    const text = read(relPath);
    assert.doesNotMatch(text, /Axolync Android Wrapper/);
    assert.doesNotMatch(text, /Android-only repo authority/);
  }
});
