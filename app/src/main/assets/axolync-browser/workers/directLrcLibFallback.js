const LRCLIB_GET_URL = 'https://lrclib.net/api/get';
const LRCLIB_SEARCH_URL = 'https://lrclib.net/api/search';
function normalizeText(value) {
    return value.trim().replace(/\s+/g, ' ');
}
function parseSongIdentity(songId) {
    const raw = normalizeText(songId);
    if (!raw)
        return null;
    for (const separator of ['::', ' - ', ' — ', '|', '/']) {
        if (!raw.includes(separator))
            continue;
        const [left, right] = raw.split(separator, 2);
        const artist = normalizeText(left);
        const title = normalizeText(right);
        if (artist && title) {
            return { artist, title };
        }
    }
    const colonParts = raw.split(':').map(normalizeText).filter(Boolean);
    if (colonParts.length >= 3 && colonParts[0].includes('.')) {
        return {
            artist: normalizeText(colonParts.slice(2).join(':')),
            title: colonParts[1],
        };
    }
    if (colonParts.length === 2) {
        return {
            artist: colonParts[0],
            title: colonParts[1],
        };
    }
    return null;
}
function buildUrl(baseUrl, params) {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(params)) {
        if (value.trim()) {
            url.searchParams.set(key, value);
        }
    }
    return url.toString();
}
function parseLrcTimestamp(value) {
    const match = value.match(/^(\d{2}):(\d{2})(?:[.:](\d{1,3}))?$/);
    if (!match)
        return null;
    const minutes = Number.parseInt(match[1], 10);
    const seconds = Number.parseInt(match[2], 10);
    const fractionRaw = match[3] ?? '0';
    const fractionMs = fractionRaw.length === 1
        ? Number.parseInt(fractionRaw, 10) * 100
        : fractionRaw.length === 2
            ? Number.parseInt(fractionRaw, 10) * 10
            : Number.parseInt(fractionRaw.slice(0, 3), 10);
    return (minutes * 60000) + (seconds * 1000) + fractionMs;
}
function parseLrcToLyricData(raw) {
    const entries = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
        const match = line.match(/^\[([^\]]+)\](.*)$/);
        if (!match)
            return null;
        const inSongMs = parseLrcTimestamp(match[1]);
        const text = normalizeText(match[2] ?? '');
        if (inSongMs === null || !text)
            return null;
        return { inSongMs, text };
    })
        .filter((entry) => entry !== null);
    if (entries.length === 0)
        return null;
    return {
        granularity: 'line',
        units: entries.map((entry, index) => {
            const nextStart = entries[index + 1]?.inSongMs ?? (entry.inSongMs + 2500);
            return {
                text: entry.text,
                inSongMs: entry.inSongMs,
                durationMs: Math.max(200, nextStart - entry.inSongMs),
            };
        }),
    };
}
async function readJson(response) {
    try {
        return await response.json();
    }
    catch {
        return null;
    }
}
function pickBestRecord(records, identity) {
    const artist = identity.artist.toLowerCase();
    const title = identity.title.toLowerCase();
    for (const record of records) {
        if (!record || typeof record !== 'object')
            continue;
        const row = record;
        const rowArtist = String(row.artistName ?? '').trim().toLowerCase();
        const rowTitle = String(row.trackName ?? '').trim().toLowerCase();
        if (rowArtist === artist && rowTitle === title) {
            return row;
        }
    }
    const first = records.find((record) => record && typeof record === 'object');
    return first ? first : null;
}
function extractSyncedLyrics(record) {
    if (!record || typeof record !== 'object')
        return null;
    const syncedLyrics = String(record.syncedLyrics ?? '').trim();
    if (!syncedLyrics)
        return null;
    return parseLrcToLyricData(syncedLyrics);
}
async function fetchRecord(url, fetchImpl) {
    const response = await fetchImpl(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`LRCLIB request failed: ${response.status} ${response.statusText}`.trim());
    }
    return readJson(response);
}
async function fetchDirectLrcLibLyrics(songId, fetchImpl = fetch) {
    const identity = parseSongIdentity(songId);
    if (!identity) {
        throw new Error(`LRCLIB fallback could not parse song identity from "${songId}"`);
    }
    try {
        const getRecord = await fetchRecord(buildUrl(LRCLIB_GET_URL, {
            artist_name: identity.artist,
            track_name: identity.title,
        }), fetchImpl);
        const payload = extractSyncedLyrics(getRecord);
        if (payload)
            return payload;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('404')) {
            throw error;
        }
    }
    const searchRecord = await fetchRecord(buildUrl(LRCLIB_SEARCH_URL, {
        artist_name: identity.artist,
        track_name: identity.title,
    }), fetchImpl);
    const searchRows = Array.isArray(searchRecord) ? searchRecord : [];
    let picked = pickBestRecord(searchRows, identity);
    if (!picked && identity.artist) {
        const titleOnlyRecord = await fetchRecord(buildUrl(LRCLIB_SEARCH_URL, {
            track_name: identity.title,
        }), fetchImpl);
        picked = pickBestRecord(Array.isArray(titleOnlyRecord) ? titleOnlyRecord : [], identity);
    }
    const payload = extractSyncedLyrics(picked);
    if (!payload) {
        throw new Error(`LRCLIB fallback returned no synced lyrics for "${songId}"`);
    }
    return payload;
}
