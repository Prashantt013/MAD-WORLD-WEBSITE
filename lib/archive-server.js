import { randomUUID } from 'node:crypto';
import { getDatabase } from './mongodb';

export const ARCHIVE_FORMAT = 'mad-world-v5-archive';

export async function getArchiveCollection() {
  const collection = (await getDatabase()).collection('archive_entries');
  await collection.createIndex({ kind: 1, slug: 1 }, { unique: true });
  await collection.createIndex({ name: 'text', summary: 'text', tags: 'text' });
  return collection;
}

export function cleanString(value, fallback = '') { return typeof value === 'string' ? value.trim() : fallback; }
export function makeSlug(value) { return cleanString(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `entry-${Date.now()}`; }

export function validateEntry(payload) {
  const kind = ['game', 'anime', 'show', 'character'].includes(payload?.kind) ? payload.kind : null;
  const name = cleanString(payload?.name);
  if (!kind || !name) return { error: 'kind and name are required' };
  const entry = {
    _id: cleanString(payload._id) || randomUUID(), kind, name, slug: makeSlug(payload.slug || name),
    category: kind === 'character' ? 'characters' : `${kind}s`, status: cleanString(payload.status), genre: Array.isArray(payload.genre) ? payload.genre.map((item) => cleanString(item)).filter(Boolean) : cleanString(payload.genre).split(',').map((item) => item.trim()).filter(Boolean),
    rating_external_num: Number(payload.rating) || Number(payload.rating_external_num) || null, rating_external: payload.rating ? `${payload.rating}/10` : cleanString(payload.rating_external), summary: cleanString(payload.summary), famous_quote: cleanString(payload.quote || payload.famous_quote), prashant_note: cleanString(payload.note || payload.prashant_note), cover_url: cleanString(payload.poster || payload.image || payload.cover_url), hall_of_fame: Boolean(payload.hallOfFame || payload.hall_of_fame), createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(), updatedAt: new Date(),
  };
  if (kind === 'anime') Object.assign(entry, { episode_count: cleanString(payload.episodes), season: cleanString(payload.seasons), studio: cleanString(payload.studio) });
  if (kind === 'show') Object.assign(entry, { language: cleanString(payload.language) });
  if (kind === 'character') Object.assign(entry, { franchise: cleanString(payload.franchise), name: name, famous_line: cleanString(payload.quote || payload.famous_line) });
  return { entry };
}

export async function readCustomEntries() { return (await getArchiveCollection()).find({}).sort({ updatedAt: -1 }).toArray(); }

export function publicEntry(entry) { const { _id, ...rest } = entry; return { ...rest, id: String(_id) }; }