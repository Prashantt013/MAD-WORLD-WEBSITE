import { NextResponse } from 'next/server';
import { ALL_TITLES, characters, getHallOfFame, getStats, quotes } from '../../../lib/data';

export async function GET(request, { params }) {
  try {
    const path = (await params)?.path || [];
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

export async function POST(request) {
  try {
    const payload = await request.json();
    if (!payload?.name) return NextResponse.json({ error: 'A title name is required' }, { status: 400 });
    return NextResponse.json({ ok: true, title: { ...payload, id: `local-${Date.now()}` } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid title payload', detail: error.message }, { status: 400 });
  }
}