import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('Tauri macOS template declares microphone usage purpose', () => {
  const plist = readFileSync(join(
    process.cwd(),
    'wrappers',
    'desktop',
    'tauri',
    'workspace-template',
    'src-tauri',
    'Info.plist',
  ), 'utf8');

  assert.match(plist, /<key>NSMicrophoneUsageDescription<\/key>/);
  assert.match(plist, /Axolync uses microphone audio/);
});
