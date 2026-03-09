function isErrorEnvelope(value) {
    return Boolean(value
        && typeof value === 'object'
        && typeof value.code === 'string'
        && typeof value.message === 'string'
        && typeof value.retryable === 'boolean');
}
function formatErrorEnvelope(value) {
    const details = value.details && typeof value.details === 'object'
        ? Object.entries(value.details)
            .map(([key, entry]) => `${key}=${String(entry)}`)
            .join(' ')
        : '';
    return details
        ? `LyricFlow bridge backend error [${value.code}] ${value.message} | ${details}`
        : `LyricFlow bridge backend error [${value.code}] ${value.message}`;
}
function resolveEndpoint(baseUrl, path) {
    const normalizedPath = String(path).replace(/^\/+/, '');
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (/^https?:\/\//i.test(normalizedBase)) {
        return new URL(normalizedPath, normalizedBase).toString();
    }
    const origin = typeof self.location?.origin === 'string' ? self.location.origin : 'http://127.0.0.1';
    return new URL(normalizedPath, new URL(normalizedBase, origin)).toString();
}
async function postJson(baseUrl, path, payload, headers = {}) {
    const response = await fetch(resolveEndpoint(baseUrl, path), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(payload),
    });
    const text = await response.text().catch(() => '');
    let parsed = null;
    if (text) {
        try {
            parsed = JSON.parse(text);
        }
        catch {
            parsed = null;
        }
    }
    if (isErrorEnvelope(parsed)) {
        throw new Error(formatErrorEnvelope(parsed));
    }
    if (!response.ok) {
        throw new Error(`LyricFlow bridge request failed: ${response.status} ${response.statusText} ${text}`.trim());
    }
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('LyricFlow bridge request failed: invalid JSON response');
    }
    return parsed;
}
self.onmessage = async (event) => {
    const msg = event?.data && typeof event.data === 'object' ? event.data : {};
    const requestId = typeof msg.requestId === 'string' ? msg.requestId : undefined;
    const sessionId = typeof msg.sessionId === 'string' ? msg.sessionId : undefined;
    const baseUrl = typeof msg.baseUrl === 'string' && msg.baseUrl.trim() ? msg.baseUrl.trim() : '';
    try {
        if (!baseUrl) {
            throw new Error('LyricFlow bridge worker missing baseUrl');
        }
        if (msg.type === 'init') {
            const result = await postJson(baseUrl, '/v1/lyricflow/initialize', {
                requestId,
                sessionId,
                sessionContext: msg.sessionContext,
            });
            self.postMessage({ type: 'result', requestId, sessionId, result });
            return;
        }
        if (msg.type === 'process') {
            const headers = {};
            if (Array.isArray(msg.settings?.adapterIds) && msg.settings.adapterIds.length > 0) {
                headers['X-Axolync-Adapter-Ids'] = msg.settings.adapterIds.join(',');
            }
            if (msg.settings?.parallelRace === true) {
                headers['X-Axolync-Parallel-Race'] = 'true';
            }
            const result = await postJson(baseUrl, '/v1/lyricflow/get-lyrics', {
                requestId,
                sessionId,
                songId: msg.songId,
                granularity: msg.granularity,
                chunkMeta: msg.chunkMeta,
            }, headers);
            self.postMessage({ type: 'result', requestId, sessionId, result });
            return;
        }
        if (msg.type === 'dispose') {
            const result = await postJson(baseUrl, '/v1/lyricflow/dispose', {
                requestId,
                sessionId,
            });
            self.postMessage({ type: 'result', requestId, sessionId, result });
            return;
        }
        throw new Error(`Unsupported LyricFlow bridge worker message type: ${String(msg.type ?? '<empty>')}`);
    }
    catch (error) {
        self.postMessage({
            type: 'error',
            requestId,
            sessionId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
