import 'server-only';
import { getDatabase, hasMongo } from './mongodb';

// Two-layer cache for live data: in-memory (fast, per instance) + MongoDB
// (shared, survives cold starts). Stale values are served if a refresh fails so
// live sections never go blank because a third-party API hiccups.
const memory = globalThis.__madWorldCache || (globalThis.__madWorldCache = new Map());

async function readMongo(key) {
  if (!hasMongo()) return null;
  try { return await (await getDatabase()).collection('live_cache').findOne({ _id: key }); } catch { return null; }
}

async function writeMongo(entry) {
  if (!hasMongo()) return;
  try { await (await getDatabase()).collection('live_cache').updateOne({ _id: entry._id }, { $set: entry }, { upsert: true }); } catch { /* cache is best effort */ }
}

export async function cached(key, ttlSeconds, loader) {
  const now = Date.now();
  const hit = memory.get(key);
  if (hit && hit.expires > now) return hit.value;
  const stored = hit || (await readMongo(key));
  if (stored && stored.expires > now) { memory.set(key, stored); return stored.value; }
  try {
    const value = await loader();
    const entry = { _id: key, value, expires: now + ttlSeconds * 1000, updatedAt: new Date() };
    memory.set(key, entry);
    await writeMongo(entry);
    return value;
  } catch (error) {
    if (stored) return stored.value; // serve stale rather than nothing
    throw error;
  }
}

export async function fetchJson(url, init = {}, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, headers: { 'User-Agent': 'MADWORLD-Archive/7.0 (+personal entertainment archive)', Accept: 'application/json', ...(init.headers || {}) }, cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} from ${new URL(url).hostname}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MADWORLD-Archive/7.0)', Accept: 'application/rss+xml, application/xml, text/xml, */*' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} from ${new URL(url).hostname}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}
