import { ALL_TITLES, characters as baseCharacters, quotes as baseQuotes, getStats } from './data';

// Turns admin-added entries (Mongo / local JSON) into the same shape as the
// static archive so every page (shelves, stats, search, quotes, HoF) can treat
// them identically without code changes.
export function normalizeCustom(entries) {
  const publicShape = (entry) => { const { _id, ...rest } = entry; return { ...rest, id: rest.id || String(_id) }; };
  const titles = entries.filter((entry) => entry.kind !== 'character').map(publicShape).map((entry) => ({
    ...entry, category: entry.category || `${entry.kind}s`, title: entry.title || entry.name, genre: entry.genre || [], cover_url: entry.cover_url || entry.image || null,
    famous_quote: entry.famous_quote || entry.quote || null, custom: true, date_added: entry.createdAt || null,
  }));
  const customCharacters = entries.filter((entry) => entry.kind === 'character').map(publicShape).map((entry) => ({
    ...entry, franchise: entry.franchise || '', type: entry.type || 'Custom Character', famous_line: entry.famous_line || entry.quote || '', cover_url: entry.cover_url || entry.image || null, custom: true, date_added: entry.createdAt || null,
  }));
  const customQuotes = titles.filter((title) => title.famous_quote).map((title) => ({ id: `q-${title.id}`, text: title.famous_quote, title_id: title.id, title_slug: title.slug, title_name: title.title, category_ref: title.category, character_id: null, quote_category: 'iconic' }));
  return { titles, characters: customCharacters, quotes: customQuotes };
}

export function buildArchive(customEntries) {
  const custom = normalizeCustom(customEntries);
  const titles = [...ALL_TITLES, ...custom.titles];
  const characters = [...baseCharacters, ...custom.characters];
  const quotes = [...baseQuotes, ...custom.quotes];
  const count = (category) => titles.filter((title) => title.category === category).length;
  const stats = { ...getStats(), games: count('games'), anime: count('anime'), shows: count('shows'), movies: count('movies'), horror: count('horror'), characters: characters.length, quotes: quotes.length, hallOfFame: titles.filter((title) => title.hall_of_fame).length, total: titles.length, custom: custom.titles.length + custom.characters.length };
  return { titles, characters, quotes, stats, recent: [...custom.titles, ...custom.characters].sort((a, b) => new Date(b.date_added || 0) - new Date(a.date_added || 0)).slice(0, 12) };
}
