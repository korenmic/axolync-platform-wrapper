const { existsSync, mkdirSync, rmSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const { dirname, join } = require('node:path');

const RUNTIME_CONFIG_FILE = 'runtime-config.json';
const STORAGE_PROFILE_ENV = 'AXOLYNC_DESKTOP_STORAGE_PROFILE';
const STORAGE_ROOT_ENV = 'AXOLYNC_DESKTOP_STORAGE_ROOT';
const NATIVE_DATA_ENV = 'AXOLYNC_NATIVE_DATA_DIR';
const VALID_STORAGE_PROFILES = new Set(['portable', 'axolync-home']);

function readRuntimeConfig(appDir) {
  const runtimeConfigPath = join(appDir, 'native-service-companions', RUNTIME_CONFIG_FILE);
  if (!existsSync(runtimeConfigPath)) {
    return {};
  }
  try {
    const parsed = JSON.parse(require('node:fs').readFileSync(runtimeConfigPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function defaultStorageProfile() {
  return process.platform === 'win32' ? 'portable' : 'axolync-home';
}

function normalizeStorageProfile(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return defaultStorageProfile();
  }
  if (!VALID_STORAGE_PROFILES.has(normalized)) {
    throw new Error(`Unsupported Axolync desktop storage profile "${normalized}".`);
  }
  return normalized;
}

function resolveAxolyncHomeRoot() {
  const homeDir = os.homedir();
  if (!homeDir) {
    throw new Error('Unable to resolve Axolync home storage because the user home directory is unavailable.');
  }
  return join(homeDir, '.axolync', 'storage');
}

function resolvePortableRoot(warnings) {
  if (process.platform !== 'win32') {
    warnings.push('portable-profile-mapped-to-axolync-home-on-posix');
    return resolveAxolyncHomeRoot();
  }
  return join(dirname(process.execPath), 'storage');
}

function ensureWritableDirectory(dirPath) {
  mkdirSync(dirPath, { recursive: true });
  const probePath = join(dirPath, '.axolync-storage-probe');
  writeFileSync(probePath, String(Date.now()), 'utf8');
  rmSync(probePath, { force: true });
}

function resolveDesktopStoragePlacement({ appDir } = {}) {
  const runtimeConfig = appDir ? readRuntimeConfig(appDir) : {};
  const storageProfile = normalizeStorageProfile(
    process.env[STORAGE_PROFILE_ENV] || runtimeConfig.storageProfile,
  );
  const warnings = [];
  const storageRoot = storageProfile === 'portable'
    ? resolvePortableRoot(warnings)
    : resolveAxolyncHomeRoot();
  const placement = {
    storageProfile,
    storageRoot,
    appDataDir: join(storageRoot, 'app-data'),
    webviewUserDataDir: join(storageRoot, 'webview-user-data'),
    nativeAssetsDir: join(storageRoot, 'native-assets'),
    logsDir: join(storageRoot, 'logs'),
    cacheDir: join(storageRoot, 'cache'),
    warnings,
  };
  for (const dirPath of [
    placement.storageRoot,
    placement.appDataDir,
    placement.webviewUserDataDir,
    placement.nativeAssetsDir,
    placement.logsDir,
    placement.cacheDir,
  ]) {
    ensureWritableDirectory(dirPath);
  }
  process.env[STORAGE_PROFILE_ENV] = storageProfile;
  process.env[STORAGE_ROOT_ENV] = storageRoot;
  process.env[NATIVE_DATA_ENV] = placement.nativeAssetsDir;
  return placement;
}

module.exports = {
  VALID_STORAGE_PROFILES,
  resolveDesktopStoragePlacement,
};
