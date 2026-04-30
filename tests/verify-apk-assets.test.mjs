import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertDemoAssetState,
  assertLrclibNativeAssetState,
  assertNoDuplicateCompressedNativePayloadRoots,
  resolveExpectedLrclibNativeAssetState,
  resolveExpectedNotificationCaptureState,
} from '../scripts/verify-apk-assets.mjs';

test('assertDemoAssetState accepts the full debug demo payload', () => {
  const zipEntries = [
    'assets/public/index.html',
    'assets/public/demo/player.html',
    'assets/public/demo/plugins/demo-lyricflow.js',
    'assets/public/demo/assets/house_of_the_rising_sun_instrumental.ogg',
  ];

  assert.doesNotThrow(() => {
    assertDemoAssetState(zipEntries, true, '/tmp/debug.apk');
  });
});

test('assertDemoAssetState rejects demo-free payloads that still ship demo media or player assets', () => {
  const zipEntries = [
    'assets/public/index.html',
    'assets/public/demo/player.html',
    'assets/public/demo/assets/house_of_the_rising_sun_instrumental.ogg',
  ];

  assert.throws(() => {
    assertDemoAssetState(zipEntries, false, '/tmp/release.apk');
  }, /unexpectedly ships demo asset in demo-free profile|unexpectedly ships demo asset tree in demo-free profile/);
});

test('assertLrclibNativeAssetState accepts complete native-capable LRCLIB payloads', () => {
  const zipEntries = [
    'assets/public/index.html',
    'assets/public/plugins/preinstalled/axolync-addon-lrclib.zip',
    'assets/public/native-service-companions/manifest.json',
    'assets/public/native-service-companions/axolync-addon-lrclib/lrclib_local/capacitor/operator.json',
  ];

  assert.doesNotThrow(() => {
    assertLrclibNativeAssetState(zipEntries, true, '/tmp/axolync-lrclib-native.apk');
  });
});

test('assertLrclibNativeAssetState rejects partial or remote-only LRCLIB native staging drift', () => {
  const partialZipEntries = [
    'assets/public/index.html',
    'assets/public/native-service-companions/manifest.json',
    'assets/public/native-service-companions/axolync-addon-lrclib/lrclib_local/capacitor/operator.json',
  ];

  assert.throws(() => {
    assertLrclibNativeAssetState(partialZipEntries, true, '/tmp/axolync-lrclib-native.apk');
  }, /missing required LRCLIB native asset/);

  assert.throws(() => {
    assertLrclibNativeAssetState(partialZipEntries, false, '/tmp/axolync.apk');
  }, /unexpectedly ships LRCLIB native companion assets/);

  assert.throws(() => {
    assertLrclibNativeAssetState([
      'assets/public/index.html',
      'assets/public/plugins/preinstalled/axolync-addon-lrclib.zip',
      'assets/public/native-service-companions/manifest.json',
      'assets/public/native-service-companions/axolync-addon-lrclib/lrclib_local/capacitor/operator.json',
      'assets/public/native-service-companions/axolync-addon-lrclib/lrclib_local/capacitor/native/shared/lrclib_local/assets/db.sqlite3.br',
    ], true, '/tmp/axolync-lrclib-native.apk');
  }, /duplicate exploded LRCLIB DB payload/);
});

test('assertNoDuplicateCompressedNativePayloadRoots rejects descriptor-adjacent compressed payload copies generically', () => {
  assert.doesNotThrow(() => {
    assertNoDuplicateCompressedNativePayloadRoots([
      'assets/public/native-service-companions/manifest.json',
      'assets/public/native-service-companions/axolync-addon-vibra/vibra_proxy/capacitor/vibraProxyRuntimeOperator.json',
      'assets/public/native-service-companions/axolync-addon-lrclib/lrclib_local/capacitor/operator.json',
      'assets/public/plugins/preinstalled/axolync-addon-lrclib.zip',
    ], '/tmp/app-normal-release.apk');
  });

  assert.throws(() => {
    assertNoDuplicateCompressedNativePayloadRoots([
      'assets/public/native-service-companions/manifest.json',
      'assets/public/native-service-companions/axolync-addon-lrclib/lrclib_local/capacitor/native/shared/lrclib_local/assets/db.sqlite3.br',
    ], '/tmp/app-normal-release.apk');
  }, /compressed native payload archives outside addon zips/);
});

test('resolveExpectedLrclibNativeAssetState lets builder declare native payload expectations for canonical Gradle output names', () => {
  const previous = process.env.AXOLYNC_ANDROID_EXPECT_LRCLIB_NATIVE_ASSETS;
  try {
    process.env.AXOLYNC_ANDROID_EXPECT_LRCLIB_NATIVE_ASSETS = '1';
    assert.equal(resolveExpectedLrclibNativeAssetState('/tmp/app-normal-release.apk'), true);
    assert.equal(resolveExpectedLrclibNativeAssetState('/tmp/demo/release/app-demo-release.apk'), false);

    process.env.AXOLYNC_ANDROID_EXPECT_LRCLIB_NATIVE_ASSETS = '0';
    assert.equal(resolveExpectedLrclibNativeAssetState('/tmp/lrclib-native/app-normal-release.apk'), false);

    delete process.env.AXOLYNC_ANDROID_EXPECT_LRCLIB_NATIVE_ASSETS;
    assert.equal(resolveExpectedLrclibNativeAssetState('/tmp/lrclib-native/app-normal-release.apk'), true);
    assert.equal(resolveExpectedLrclibNativeAssetState('/tmp/app-normal-release.apk'), false);
  } finally {
    if (previous === undefined) {
      delete process.env.AXOLYNC_ANDROID_EXPECT_LRCLIB_NATIVE_ASSETS;
    } else {
      process.env.AXOLYNC_ANDROID_EXPECT_LRCLIB_NATIVE_ASSETS = previous;
    }
  }
});

test('resolveExpectedNotificationCaptureState keeps notification capture disabled unless explicitly enabled', () => {
  const previous = process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED;
  try {
    delete process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED;
    assert.equal(resolveExpectedNotificationCaptureState(), false);

    process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED = '1';
    assert.equal(resolveExpectedNotificationCaptureState(), true);

    process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED = 'true';
    assert.equal(resolveExpectedNotificationCaptureState(), true);

    process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED = '0';
    assert.equal(resolveExpectedNotificationCaptureState(), false);

    process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED = 'false';
    assert.equal(resolveExpectedNotificationCaptureState(), false);
  } finally {
    if (previous === undefined) {
      delete process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED;
    } else {
      process.env.AXOLYNC_ANDROID_NOTIFICATION_CAPTURE_ENABLED = previous;
    }
  }
});
