import { NextResponse } from 'next/server';
import { ALL_TITLES, characters, getHallOfFame, getStats, quotes } from '../../../lib/data';
import { ARCHIVE_FORMAT, getArchiveCollection, publicEntry, readCustomEntries, validateEntry } from '../../../lib/archive-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeCustom(entries) {
  const titles = entries.filter((entry) => entry.kind !== 'character').map(publicEntry).map((entry) => ({ ...entry, id: entry.id, category: entry.category || `${entry.kind}s`, title: entry.title || entry.name, slug: entry.slug, genre: entry.genre || [], cover_url: entry.cover_url || entry.image || null, famous_quote: entry.famous_quote || entry.quote || null }));
  const customCharacters = entries.filter((entry) => entry.kind === 'character').map(publicEntry).map((entry) => ({ ...entry, id: entry.id, slug: entry.slug, name: entry.name, franchise: entry.franchise || '', type: 'Custom Character', famous_line: entry.famous_line || entry.quote || '', cover_url: entry.cover_url || entry.image || null }));
  return { titles, characters: customCharacters };
}

async function mergedArchive() {
  const custom = normalizeCustom(await readCustomEntries());
  return { titles: [...ALL_TITLES, ...custom.titles], characters: [...characters, ...custom.characters], quotes, stats: { ...getStats(), games: getStats().games + custom.titles.filter((entry) => entry.category === 'games').length, anime: getStats().anime + custom.titles.filter((entry) => entry.category === 'anime').length, shows: getStats().shows + custom.titles.filter((entry) => entry.category === 'shows').length, characters: characters.length + custom.characters.length } };
}

export async function GET(request, { params }) {
  try {
    const path = (await params)?.path || [];
    if (path[0] === 'archive') {
      const archive = await mergedArchive();
      if (path[1] === 'export' || path[1] === 'backup') return new NextResponse(JSON.stringify({ format: ARCHIVE_FORMAT, version: 1, exportedAt: new Date().toISOString(), entries: await readCustomEntries() }, null, 2), { headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="mad-world-${path[1]}.json"`, 'Cache-Control': 'no-store' } });
      return NextResponse.json(archive, { headers: { 'Cache-Control': 'no-store' } });
    }
    const resource = path[0] || 'summary';
    if (resource === 'titles') return NextResponse.json({ titles: ALL_TITLES });
    if (resource === 'characters') return NextResponse.json({ characters });
    if (resource === 'quotes') return NextResponse.json({ quotes });
    if (resource === 'hall-of-fame') return NextResponse.json({ titles: getHallOfFame() });
    return NextResponse.json({ stats: getStats(), titleCount: ALL_TITLES.length, characterCount: characters.length, quoteCount: quotes.length });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to read the archive', detail: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const path = (await params)?.path || [];
    if (path[0] === 'archive' && path[1] === 'restore') {
      const payload = await request.json();
      if (payload?.format !== ARCHIVE_FORMAT || !Array.isArray(payload.entries)) return NextResponse.json({ error: 'Unsupported backup format' }, { status: 400 });
      const collection = await getArchiveCollection();
      if (payload.mode === 'replace') await collection.deleteMany({});
      const docs = payload.entries.map((entry) => ({ ...entry, _id: entry._id || entry.id, id: undefined, createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(), updatedAt: new Date() })).filter((entry) => entry._id);
      if (docs.length) await collection.bulkWrite(docs.map((entry) => ({ updateOne: { filter: { _id: entry._id }, update: { $set: entry }, upsert: true } })), { ordered: false });
      return NextResponse.json({ restored: docs.length, mode: payload.mode === 'replace' ? 'replace' : 'merge' });
    }
    if (path[0] !== 'archive') {
      const payload = await request.json();
      if (!payload?.name) return NextResponse.json({ error: 'A title name is required' }, { status: 400 });
      return NextResponse.json({ ok: true, title: { ...payload, id: `local-${Date.now()}` } }, { status: 201 });
    }
    const validation = validateEntry(await request.json());
    if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
    try { await (await getArchiveCollection()).insertOne(validation.entry); } catch (error) { if (error?.code === 11000) return NextResponse.json({ error: 'This entry already exists in the archive.' }, { status: 409 }); throw error; }
    return NextResponse.json(publicEntry(validation.entry), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to save archive entry', detail: error.message }, { status: 400 });
  }
}