import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');

const androidProjects = [
  'app',
  'wrappers/mobile/capacitor/android/app',
];

function readProjectFile(projectRoot, relativePath) {
  return fs.readFileSync(path.join(repoRoot, projectRoot, relativePath), 'utf8');
}

test('Android projects declare Android Auto template discovery metadata', () => {
  for (const projectRoot of androidProjects) {
    const manifest = readProjectFile(projectRoot, 'src/main/AndroidManifest.xml');
    const automotiveDesc = readProjectFile(projectRoot, 'src/main/res/xml/automotive_app_desc.xml');

    assert.match(manifest, /android:name="com\.google\.android\.gms\.car\.application"/u, projectRoot);
    assert.match(manifest, /android:resource="@xml\/automotive_app_desc"/u, projectRoot);
    assert.match(automotiveDesc, /<automotiveApp>/u, projectRoot);
    assert.match(automotiveDesc, /<uses name="template" \/>/u, projectRoot);
    assert.doesNotMatch(automotiveDesc, /<uses name="media" \/>/u, projectRoot);
  }
});

test('Android projects expose an AndroidX CarAppService entrypoint', () => {
  for (const projectRoot of androidProjects) {
    const manifest = readProjectFile(projectRoot, 'src/main/AndroidManifest.xml');
    const service = readProjectFile(projectRoot, 'src/main/kotlin/com/axolync/android/car/AxolyncCarAppService.kt');

    assert.match(manifest, /android:name="\.car\.AxolyncCarAppService"/u, projectRoot);
    assert.match(manifest, /android:exported="true"/u, projectRoot);
    assert.match(manifest, /android:name="androidx\.car\.app\.CarAppService"/u, projectRoot);
    assert.match(manifest, /android:name="androidx\.car\.app\.category\.POI"/u, projectRoot);
    assert.match(service, /class AxolyncCarAppService : CarAppService\(\)/u, projectRoot);
    assert.match(service, /override fun onCreateSession\(\): Session/u, projectRoot);
    assert.match(service, /PaneTemplate\.Builder/u, projectRoot);
    assert.match(service, /HostValidator\.ALLOW_ALL_HOSTS_VALIDATOR/u, projectRoot);
    assert.match(service, /hosts_allowlist_sample/u, projectRoot);
  }
});

test('Android projects include projected AndroidX Car App dependencies', () => {
  for (const projectRoot of androidProjects) {
    const gradle = readProjectFile(projectRoot, 'build.gradle.kts');

    assert.match(gradle, /implementation\("androidx\.car\.app:app:1\.7\.0"\)/u, projectRoot);
    assert.match(gradle, /implementation\("androidx\.car\.app:app-projected:1\.7\.0"\)/u, projectRoot);
  }
});

test('Android Auto launcher surface does not reintroduce car-mode capture negotiation', () => {
  const guardedFiles = [
    'app/src/main/kotlin/com/axolync/android/car/AxolyncCarAppService.kt',
    'wrappers/mobile/capacitor/android/app/src/main/kotlin/com/axolync/android/car/AxolyncCarAppService.kt',
    'app/src/main/kotlin/com/axolync/android/bridge/AxolyncNativeServiceCompanionHostPlugin.kt',
    'wrappers/mobile/capacitor/android/app/src/main/kotlin/com/axolync/android/bridge/AxolyncNativeServiceCompanionHostPlugin.kt',
  ];

  for (const relativePath of guardedFiles) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
    assert.doesNotMatch(source, /CarConnection|UiModeManager|ACTION_CAR_MODE|carMode|car-mode/u, relativePath);
  }
});
