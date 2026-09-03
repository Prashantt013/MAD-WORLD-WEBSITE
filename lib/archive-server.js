import 'server-only';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getDatabase, hasMongo } from './mongodb';

export const ARCHIVE_FORMAT = 'mad-world-v5-archive';
export const KINDS = ['game', 'anime', 'show', 'movie', 'character'];
const KIND_CATEGORY = { game: 'games', anime: 'anime', show: 'shows', movie: 'movies', character: 'characters' };

// ---------- storage: MongoDB with local JSON fallback ----------
// On Vercel the project directory is read-only, so the fallback file lives in
// the OS temp dir there; locally it lives in data/custom-archive.json so it
// travels with the repo.
const FALLBACK_FILE = process.env.VERCEL ? path.join(os.tmpdir(), 'mad-world-custom-archive.json') : path.join(process.cwd(), 'data', 'custom-archive.json');

async function readFallback() {
  try { return JSON.parse(await fs.readFile(FALLBACK_FILE, 'utf8')); } catch { return []; }
}
async function writeFallback(entries) {
  try { await fs.mkdir(path.dirname(FALLBACK_FILE), { recursive: true }); await fs.writeFile(FALLBACK_FILE, JSON.stringify(entries, null, 2)); } catch { /* read-only fs */ }
}

export async function getArchiveCollection() {
  const collection = (await getDatabase()).collection('archive_entries');
  await collection.createIndex({ kind: 1, slug: 1 }, { unique: true });
  await collection.createIndex({ name: 'text', summary: 'text', tags: 'text', genre: 'text', franchise: 'text' });
  return collection;
}

export async function readCustomEntries() {
  const local = await readFallback();
  if (!hasMongo()) return local;
  try {
    const remote = await (await getArchiveCollection()).find({}).sort({ updatedAt: -1 }).toArray();
    const seen = new Set(remote.map((entry) => `${entry.kind}:${entry.slug}`));
    return [...remote, ...local.filter((entry) => !seen.has(`${entry.kind}:${entry.slug}`))];
  } catch {
    return local;
  }
}

export async function saveEntry(entry) {
  if (hasMongo()) {
    try {
      await (await getArchiveCollection()).insertOne(entry);
      return { entry, storage: 'mongodb' };
    } catch (error) {
      if (error?.code === 11000) return { error: 'This entry already exists in the archive.', status: 409 };
      // fall through to local storage when Mongo is unreachable
    }
  }
  const local = await readFallback();
  if (local.some((item) => item.kind === entry.kind && item.slug === entry.slug)) return { error: 'This entry already exists in the archive.', status: 409 };
  local.unshift(entry);
  await writeFallback(local);
  return { entry, storage: 'local-json' };
}

export async function deleteEntry(id) {
  let removed = 0;
  if (hasMongo()) { try { removed += (await (await getArchiveCollection()).deleteOne({ _id: id })).deletedCount; } catch { /* ignore */ } }
  const local = await readFallback();
  const kept = local.filter((entry) => entry._id !== id);
  if (kept.length !== local.length) { removed += local.length - kept.length; await writeFallback(kept); }
  return removed;
}

export async function restoreEntries(entries, mode) {
  const docs = entries.map((entry) => ({ ...entry, _id: entry._id || entry.id, id: undefined, createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(), updatedAt: new Date() })).filter((entry) => entry._id);
  if (hasMongo()) {
    try {
      const collection = await getArchiveCollection();
      if (mode === 'replace') await collection.deleteMany({});
      if (docs.length) await collection.bulkWrite(docs.map((entry) => ({ updateOne: { filter: { _id: entry._id }, update: { $set: entry }, upsert: true } })), { ordered: false });
      return docs.length;
    } catch { /* fall back */ }
  }
  const local = mode === 'replace' ? [] : await readFallback();
  const byId = new Map(local.map((entry) => [entry._id, entry]));
  docs.forEach((entry) => byId.set(entry._id, entry));
  await writeFallback([...byId.values()]);
  return docs.length;
}

// ---------- validation ----------
export function cleanString(value, fallback = '') { return typeof value === 'string' ? value.trim() : fallback; }
export function makeSlug(value) { return cleanString(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `entry-${Date.now()}`; }
function toList(value) { return Array.isArray(value) ? value.map((item) => cleanString(item)).filter(Boolean) : cleanString(value).split(/[,/]/).map((item) => item.trim()).filter(Boolean); }
function toNumber(value) { const number = Number(String(value ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(number) && number > 0 ? number : null; }

export function validateEntry(payload) {
  const kind = KINDS.includes(payload?.kind) ? payload.kind : null;
  const name = cleanString(payload?.name || payload?.title);
  if (!kind || !name) return { error: 'Category and title are required.' };
  const rating = toNumber(payload.rating ?? payload.rating_external_num);
  const entry = {
    _id: cleanString(payload._id) || randomUUID(), kind, name, slug: makeSlug(payload.slug || name), category: KIND_CATEGORY[kind],
    status: cleanString(payload.status), genre: toList(payload.genre), rating_external_num: rating, rating_external: rating ? `${rating}/10` : cleanString(payload.rating_external),
    summary: cleanString(payload.summary), famous_quote: cleanString(payload.quote || payload.famous_quote), prashant_note: cleanString(payload.note || payload.prashant_note),
    cover_url: cleanString(payload.poster || payload.image || payload.cover_url), hall_of_fame: payload.hallOfFame === true || payload.hallOfFame === 'true' || payload.hallOfFame === 'on' || payload.hall_of_fame === true,
    language: cleanString(payload.language), release_year: toNumber(payload.releaseYear ?? payload.release_year), character_count: toNumber(payload.characterCount ?? payload.character_count),
    tags: toList(payload.tags), createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(), updatedAt: new Date(),
  };
  if (kind === 'anime') Object.assign(entry, { episode_count: cleanString(payload.episodes), season: cleanString(payload.seasons || payload.season), studio: cleanString(payload.studio) });
  if (kind === 'show') Object.assign(entry, { season: cleanString(payload.seasons || payload.season), episode_count: cleanString(payload.episodes) });
  if (kind === 'character') Object.assign(entry, { franchise: cleanString(payload.franchise), famous_line: cleanString(payload.quote || payload.famous_line), type: cleanString(payload.type) || 'Custom Character', bio: cleanString(payload.summary || payload.bio) });
  return { entry };
}

export function publicEntry(entry) { const { _id, ...rest } = entry; return { ...rest, id: String(_id) }; }

export function isAdmin(request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return true; // no password configured => open intake (dev)
  const provided = request.headers.get('x-admin-key') || '';
  return provided === expected;
}
