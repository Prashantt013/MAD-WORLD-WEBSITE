import { NextResponse } from 'next/server';
import facts from '../../../data/facts.json';
import { ALL_TITLES, characters, getHallOfFame, getStats, quotes } from '../../../lib/data';
import { buildArchive } from '../../../lib/archive-merge';
import { ARCHIVE_FORMAT, deleteEntry, isAdmin, publicEntry, readCustomEntries, restoreEntries, saveEntry, validateEntry } from '../../../lib/archive-server';
import { getTrending } from '../../../lib/live';
import { getNews } from '../../../lib/news';
import { getAwards } from '../../../lib/awards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };
const live = { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' };
const json = (body, init = {}) => NextResponse.json(body, { ...init, headers: { ...noStore, ...(init.headers || {}) } });
const forbidden = () => json({ error: 'Admin password required.' }, { status: 401 });

function searchArchive(archive, term) {
  const q = term.toLowerCase();
  const score = (haystack) => { const text = haystack.toLowerCase(); if (!text.includes(q)) return 0; return text.startsWith(q) ? 3 : 1; };
  const titles = archive.titles.map((title) => ({ item: title, score: score(title.title) * 3 + score(`${(title.genre || []).join(' ')} ${title.summary || ''} ${title.famous_quote || ''} ${title.status || ''}`) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).map((entry) => entry.item);
  const chars = archive.characters.map((character) => ({ item: character, score: score(character.name) * 3 + score(`${character.franchise || ''} ${character.famous_line || ''} ${character.type || ''}`) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).map((entry) => entry.item);
  const matchedQuotes = archive.quotes.filter((quote) => `${quote.text} ${quote.title_name}`.toLowerCase().includes(q));
  return { query: term, titles, characters: chars, quotes: matchedQuotes, total: titles.length + chars.length + matchedQuotes.length };
}

export async function GET(request, { params }) {
  try {
    const path = (await params)?.path || [];
    const url = new URL(request.url);
    const resource = path[0] || 'summary';

    if (resource === 'archive') {
      const custom = await readCustomEntries();
      if (path[1] === 'export' || path[1] === 'backup') return new NextResponse(JSON.stringify({ format: ARCHIVE_FORMAT, version: 2, exportedAt: new Date().toISOString(), entries: custom }, null, 2), { headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="mad-world-${path[1]}.json"`, ...noStore } });
      const archive = buildArchive(custom);
      if (path[1] === 'recent') return json({ recent: archive.recent });
      if (path[1] === 'custom') return json({ entries: custom.map(publicEntry) });
      return json(archive);
    }
    if (resource === 'search') {
      const term = (url.searchParams.get('q') || '').trim();
      if (!term) return json({ query: '', titles: [], characters: [], quotes: [], total: 0 });
      return json(searchArchive(buildArchive(await readCustomEntries()), term));
    }
    if (resource === 'trending') return NextResponse.json(await getTrending(), { headers: live });
    if (resource === 'news') return NextResponse.json(await getNews(), { headers: live });
    if (resource === 'awards') return NextResponse.json({ tracks: await getAwards(url.searchParams.get('track') || undefined) }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
    if (resource === 'facts') return NextResponse.json({ facts }, { headers: live });
    if (resource === 'admin' && path[1] === 'status') return json({ protected: Boolean(process.env.ADMIN_PASSWORD), mongo: Boolean(process.env.MONGO_URL) });
    if (resource === 'titles') return json({ titles: ALL_TITLES });
    if (resource === 'characters') return json({ characters });
    if (resource === 'quotes') return json({ quotes });
    if (resource === 'hall-of-fame') return json({ titles: getHallOfFame() });
    return json({ name: 'MAD WORLD API', version: 7, stats: getStats(), endpoints: ['/api/archive', '/api/archive/recent', '/api/search?q=', '/api/trending', '/api/news', '/api/awards', '/api/facts'] });
  } catch (error) {
    return json({ error: 'Unable to read the archive', detail: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const path = (await params)?.path || [];
    if (path[0] === 'admin' && path[1] === 'verify') {
      const payload = await request.json().catch(() => ({}));
      const expected = process.env.ADMIN_PASSWORD;
      if (!expected || payload?.password === expected) return json({ ok: true });
      return json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
    }
    if (path[0] !== 'archive') return json({ error: 'Not found' }, { status: 404 });
    if (!isAdmin(request)) return forbidden();
    const payload = await request.json();
    if (path[1] === 'restore') {
      if (payload?.format !== ARCHIVE_FORMAT || !Array.isArray(payload.entries)) return json({ error: 'Unsupported backup format' }, { status: 400 });
      const restored = await restoreEntries(payload.entries, payload.mode === 'replace' ? 'replace' : 'merge');
      return json({ restored, mode: payload.mode === 'replace' ? 'replace' : 'merge' });
    }
    const validation = validateEntry(payload);
    if (validation.error) return json({ error: validation.error }, { status: 400 });
    const result = await saveEntry(validation.entry);
    if (result.error) return json({ error: result.error }, { status: result.status || 400 });
    return json({ ...publicEntry(result.entry), storage: result.storage }, { status: 201 });
  } catch (error) {
    return json({ error: 'Unable to save archive entry', detail: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const path = (await params)?.path || [];
    if (path[0] !== 'archive' || !path[1]) return json({ error: 'Not found' }, { status: 404 });
    if (!isAdmin(request)) return forbidden();
    const removed = await deleteEntry(path[1]);
    return json({ removed });
  } catch (error) {
    return json({ error: 'Unable to delete archive entry', detail: error.message }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
