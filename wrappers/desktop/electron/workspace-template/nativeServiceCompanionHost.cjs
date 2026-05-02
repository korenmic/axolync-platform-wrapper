const { appendFileSync, existsSync, mkdirSync, readFileSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const RUNTIME_CONFIG_FILE = 'runtime-config.json';

function companionKey(addonId, companionId) {
  return `${String(addonId || '').trim()}::${String(companionId || '').trim()}`;
}

function buildStatusEnvelope(addonId, companionId, status) {
  return {
    addonId,
    companionId,
    status,
  };
}

function buildResponseEnvelope(addonId, companionId, response) {
  return {
    addonId,
    companionId,
    response,
  };
}

function buildConnectionEnvelope(addonId, companionId, connection) {
  return {
    addonId,
    companionId,
    connection,
  };
}

function unsupportedStatus(lastError = null) {
  return {
    state: 'unsupported',
    available: false,
    enabled: false,
    lastError,
  };
}

function normalizeManifestEntries(rawEntries, appDir) {
  if (!Array.isArray(rawEntries)) {
    return [];
  }
  return rawEntries
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      addonId: String(entry.addonId || '').trim(),
      companionId: String(entry.companionId || '').trim(),
      displayName: String(entry.displayName || '').trim(),
      wrapper: String(entry.wrapper || '').trim(),
      entrypoint: resolve(appDir, String(entry.entrypoint || '').trim()),
    }))
    .filter((entry) => entry.addonId && entry.companionId && entry.wrapper === 'electron' && entry.entrypoint);
}

function readRuntimeConfig(appDir) {
  const runtimeConfigPath = join(appDir, 'native-service-companions', RUNTIME_CONFIG_FILE);
  if (!existsSync(runtimeConfigPath)) {
    return {};
  }
  try {
    const parsed = JSON.parse(readFileSync(runtimeConfigPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function resolveNativeRuntimeDiagnosticsFile(appDir) {
  const envValue = String(process.env.AXOLYNC_NATIVE_RUNTIME_DIAGNOSTICS_FILE || '').trim();
  if (envValue) return envValue;
  const configValue = String(readRuntimeConfig(appDir).nativeRuntimeDiagnosticsFile || '').trim();
  return configValue || null;
}

function appendDiagnosticToFile(filePath, entry) {
  if (!filePath) return;
  try {
    mkdirSync(dirname(filePath), { recursive: true });
    appendFileSync(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
  } catch {
    // File diagnostics must never break the native bridge itself.
  }
}

async function loadRuntimeFactory(registration) {
  const loadedModule = await import(pathToFileURL(registration.entrypoint).href);
  const factory = loadedModule.createNativeServiceCompanionRuntime || loadedModule.createNativeServiceCompanion;
  if (typeof factory !== 'function') {
    throw new Error(`Native service companion "${registration.addonId}:${registration.companionId}" is missing a runtime factory export.`);
  }
  return factory;
}

function createNativeServiceCompanionHost({ appDir }) {
  const registrationByKey = new Map();
  const stateByKey = new Map();
  const diagnostics = [];
  const diagnosticsFilePath = resolveNativeRuntimeDiagnosticsFile(appDir);
  const MAX_DIAGNOSTICS = 200;
  let registrationsLoaded = false;

  function pushDiagnostic({
    source = 'wrapper-host',
    level = 'info',
    addonId = null,
    companionId = null,
    event,
    details = null,
  }) {
    const entry = {
      atMs: Date.now(),
      source,
      level,
      addonId,
      companionId,
      event,
      details,
    };
    diagnostics.push(entry);
    if (diagnostics.length > MAX_DIAGNOSTICS) {
      diagnostics.splice(0, diagnostics.length - MAX_DIAGNOSTICS);
    }
    appendDiagnosticToFile(diagnosticsFilePath, entry);
  }

  async function ensureRegistrationsLoaded() {
    if (registrationsLoaded) {
      return;
    }
    registrationsLoaded = true;
    const manifestPath = join(appDir, 'native-service-companions', 'manifest.json');
    if (!existsSync(manifestPath)) {
      return;
    }
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const entries = normalizeManifestEntries(Array.isArray(parsed) ? parsed : parsed.companions, appDir);
    for (const entry of entries) {
      registrationByKey.set(companionKey(entry.addonId, entry.companionId), entry);
    }
    pushDiagnostic({
      event: 'host.registrations.loaded',
      details: {
        count: registrationByKey.size,
        diagnosticsFile: diagnosticsFilePath,
      },
    });
  }

  function getRegisteredState(addonId, companionId) {
    const key = companionKey(addonId, companionId);
    const existing = stateByKey.get(key);
    if (existing) {
      return existing;
    }
    const next = {
      enabled: false,
      state: 'idle',
      available: true,
      lastError: null,
      connection: null,
      runtime: null,
    };
    stateByKey.set(key, next);
    return next;
  }

  async function resolveRegistration(addonId, companionId) {
    await ensureRegistrationsLoaded();
    return registrationByKey.get(companionKey(addonId, companionId)) || null;
  }

  async function getStatus(addonId, companionId) {
    pushDiagnostic({ addonId, companionId, event: 'companion.status.requested' });
    const registration = await resolveRegistration(addonId, companionId);
    if (!registration) {
      return buildStatusEnvelope(addonId, companionId, unsupportedStatus());
    }
    const state = getRegisteredState(addonId, companionId);
    return buildStatusEnvelope(addonId, companionId, {
      state: state.state,
      available: state.available,
      enabled: state.enabled,
      lastError: state.lastError,
    });
  }

  async function setEnabled(addonId, companionId, enabled) {
    pushDiagnostic({
      addonId,
      companionId,
      event: 'companion.enabled.updated',
      details: { enabled: enabled === true },
    });
    const registration = await resolveRegistration(addonId, companionId);
    if (!registration) {
      return buildStatusEnvelope(
        addonId,
        companionId,
        unsupportedStatus('No prebundled native service companion is registered on this Electron host.'),
      );
    }
    const state = getRegisteredState(addonId, companionId);
    state.enabled = enabled === true;
    if (!state.enabled && state.runtime && typeof state.runtime.stop === 'function') {
      await state.runtime.stop();
      state.runtime = null;
      state.connection = null;
      state.state = 'idle';
    }
    return getStatus(addonId, companionId);
  }

  async function start(addonId, companionId) {
    pushDiagnostic({ addonId, companionId, event: 'companion.start.requested' });
    const registration = await resolveRegistration(addonId, companionId);
    if (!registration) {
      return buildStatusEnvelope(
        addonId,
        companionId,
        unsupportedStatus('No prebundled native service companion is registered on this Electron host.'),
      );
    }
    const state = getRegisteredState(addonId, companionId);
    try {
      state.enabled = true;
      state.state = 'starting';
      if (!state.runtime) {
        const runtimeFactory = await loadRuntimeFactory(registration);
        pushDiagnostic({
          addonId,
          companionId,
          event: 'runtime-operator.payload.selected',
          details: {
            entrypoint: registration.entrypoint,
          },
        });
        state.runtime = await runtimeFactory({
          addonId,
          companionId,
          hostFamily: 'electron',
          appDir,
        });
      }
      if (state.runtime && typeof state.runtime.start === 'function') {
        await state.runtime.start();
      }
      state.connection = typeof state.runtime?.getConnection === 'function'
        ? await state.runtime.getConnection()
        : null;
      state.state = 'running';
      state.lastError = null;
      pushDiagnostic({
        addonId,
        companionId,
        event: 'companion.start.completed',
        details: { baseUrl: state.connection?.baseUrl ?? null },
      });
    } catch (error) {
      state.state = 'error';
      state.lastError = error instanceof Error ? error.message : String(error);
      state.connection = null;
      pushDiagnostic({
        source: 'wrapper-host',
        level: 'error',
        addonId,
        companionId,
        event: 'companion.start.failed',
        details: { error: state.lastError },
      });
    }
    return getStatus(addonId, companionId);
  }

  async function stop(addonId, companionId) {
    pushDiagnostic({ addonId, companionId, event: 'companion.stop.requested' });
    const registration = await resolveRegistration(addonId, companionId);
    if (!registration) {
      return buildStatusEnvelope(addonId, companionId, unsupportedStatus());
    }
    const state = getRegisteredState(addonId, companionId);
    try {
      state.state = 'stopping';
      if (state.runtime && typeof state.runtime.stop === 'function') {
        await state.runtime.stop();
      }
      state.runtime = null;
      state.connection = null;
      state.state = 'idle';
      state.lastError = null;
      pushDiagnostic({ addonId, companionId, event: 'companion.stop.completed' });
    } catch (error) {
      state.state = 'error';
      state.lastError = error instanceof Error ? error.message : String(error);
      pushDiagnostic({
        source: 'wrapper-host',
        level: 'error',
        addonId,
        companionId,
        event: 'companion.stop.failed',
        details: { error: state.lastError },
      });
    }
    return getStatus(addonId, companionId);
  }

  async function request(addonId, companionId, requestEnvelope) {
    pushDiagnostic({
      addonId,
      companionId,
      event: 'companion.request.received',
      details: { operation: requestEnvelope?.request?.operation ?? null },
    });
    const registration = await resolveRegistration(addonId, companionId);
    if (!registration) {
      return buildResponseEnvelope(addonId, companionId, {
        ok: false,
        payload: null,
        error: 'No prebundled native service companion is registered on this Electron host.',
      });
    }
    const state = getRegisteredState(addonId, companionId);
    if (state.state !== 'running' || !state.runtime) {
      return buildResponseEnvelope(addonId, companionId, {
        ok: false,
        payload: null,
        error: 'Native service companion is not running.',
      });
    }
    try {
      const payload = typeof state.runtime.handleRequest === 'function'
        ? await state.runtime.handleRequest(requestEnvelope.request)
        : null;
      pushDiagnostic({
        addonId,
        companionId,
        event: 'companion.request.completed',
        details: { operation: requestEnvelope?.request?.operation ?? null },
      });
      return buildResponseEnvelope(addonId, companionId, {
        ok: true,
        payload,
        error: null,
      });
    } catch (error) {
      state.state = 'error';
      state.lastError = error instanceof Error ? error.message : String(error);
      pushDiagnostic({
        source: 'wrapper-host',
        level: 'error',
        addonId,
        companionId,
        event: 'companion.request.failed',
        details: {
          operation: requestEnvelope?.request?.operation ?? null,
          error: state.lastError,
        },
      });
      return buildResponseEnvelope(addonId, companionId, {
        ok: false,
        payload: null,
        error: state.lastError,
      });
    }
  }

  async function getConnection(addonId, companionId) {
    pushDiagnostic({ addonId, companionId, event: 'companion.connection.requested' });
    const registration = await resolveRegistration(addonId, companionId);
    if (!registration) {
      return buildConnectionEnvelope(addonId, companionId, null);
    }
    const state = getRegisteredState(addonId, companionId);
    return buildConnectionEnvelope(
      addonId,
      companionId,
      state.connection ?? null,
    );
  }

  async function getDiagnostics() {
    const runtimeLogs = [];
    for (const [key, state] of stateByKey.entries()) {
      if (!state.runtime || typeof state.runtime.getDiagnostics !== 'function') {
        continue;
      }
      try {
        const rows = await state.runtime.getDiagnostics();
        if (Array.isArray(rows)) {
          runtimeLogs.push(...rows);
        } else {
          pushDiagnostic({
            source: 'wrapper-host',
            level: 'warn',
            addonId: key.split('::')[0] || null,
            companionId: key.split('::')[1] || null,
            event: 'companion.diagnostics.invalid-runtime-payload',
          });
        }
      } catch (error) {
        pushDiagnostic({
          source: 'wrapper-host',
          level: 'error',
          addonId: key.split('::')[0] || null,
          companionId: key.split('::')[1] || null,
          event: 'companion.diagnostics.failed',
          details: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    }
    return {
      hostFamily: 'electron',
      hostPlatform: 'desktop',
      hostAbi: typeof process.arch === 'string' && process.arch ? process.arch : null,
      generatedAtMs: Date.now(),
      collectionMethod: 'native-bridge-host',
      logs: [...diagnostics, ...runtimeLogs],
    };
  }

  return {
    getStatus,
    setEnabled,
    start,
    stop,
    request,
    getConnection,
    getDiagnostics,
  };
}

module.exports = {
  createNativeServiceCompanionHost,
};
