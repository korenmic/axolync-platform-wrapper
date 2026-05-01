const { contextBridge, ipcRenderer } = require('electron');

const nativeServiceCompanionHost = Object.freeze({
  hostFamily: 'electron',
  hostPlatform: 'desktop',
  hostAbi: typeof process.arch === 'string' && process.arch ? process.arch : null,
  async getStatus(addonId, companionId) {
    return ipcRenderer.invoke('axolync-native-service-companion-host:get-status', addonId, companionId);
  },
  async setEnabled(addonId, companionId, enabled) {
    return ipcRenderer.invoke('axolync-native-service-companion-host:set-enabled', addonId, companionId, enabled);
  },
  async start(addonId, companionId) {
    return ipcRenderer.invoke('axolync-native-service-companion-host:start', addonId, companionId);
  },
  async stop(addonId, companionId) {
    return ipcRenderer.invoke('axolync-native-service-companion-host:stop', addonId, companionId);
  },
  async request(addonId, companionId, request) {
    return ipcRenderer.invoke('axolync-native-service-companion-host:request', addonId, companionId, request);
  },
  async getConnection(addonId, companionId) {
    return ipcRenderer.invoke('axolync-native-service-companion-host:get-connection', addonId, companionId);
  },
  async getDiagnostics() {
    return ipcRenderer.invoke('axolync-native-service-companion-host:get-diagnostics');
  },
});

contextBridge.exposeInMainWorld('__AXOLYNC_NATIVE_SERVICE_COMPANION_HOST__', nativeServiceCompanionHost);
contextBridge.exposeInMainWorld('__AXOLYNC_NATIVE_SERVICE_COMPANION_HOST_FAMILY', 'electron');
