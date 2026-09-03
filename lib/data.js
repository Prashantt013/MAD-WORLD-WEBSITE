import games from '../data/games.json';
import anime from '../data/anime.json';
import shows from '../data/shows.json';
import horror from '../data/horror.json';
import characters from '../data/characters.json';
import quotes from '../data/quotes.json';
import achievements from '../data/achievements.json';
import about from '../data/about.json';

// Every consumable "thing" in the archive, one flat list.
// Individual category arrays stay available for pages that only need one shelf.
export const ALL_TITLES = [...games, ...anime, ...shows, ...horror];

export const CATEGORY_META = {
  games:  { label: 'Games',      color: '#b3122c', path: '/games' },
  anime:  { label: 'Anime',      color: '#7c3aed', path: '/anime' },
  shows:  { label: 'Shows',      color: '#3556d4', path: '/shows' },
  movies: { label: 'Movies',     color: '#a8478f', path: '/movies' },
  horror: { label: 'Horror',     color: '#8a2c14', path: '/horror' },
  characters: { label: 'Characters', color: '#0f8f7a', path: '/characters' },
};

export function getTitlesByCategory(category) {
  return ALL_TITLES.filter((t) => t.category === category);
}

export function getTitleBySlug(slug) {
  return ALL_TITLES.find((t) => t.slug === slug) || null;
}

export function getHallOfFame() {
  return ALL_TITLES.filter((t) => t.hall_of_fame);
}

export function getCharactersForTitle(titleId) {
  return characters.filter((c) => c.title_id === titleId);
}

export function getRelatedTitles(title, limit = 6) {
  // same category + shares at least one genre tag, excluding itself
  return ALL_TITLES.filter(
    (t) =>
      t.id !== title.id &&
      t.category === title.category &&
      (t.genre || []).some((g) => (title.genre || []).includes(g))
  ).slice(0, limit);
}

export function getQuotesForTitle(titleId) {
  return quotes.filter((q) => q.title_id === titleId);
}

export function getStats() {
  return {
    games: games.length,
    anime: anime.length,
    shows: shows.length,
    horror: horror.length,
    movies: 0,
    hallOfFame: getHallOfFame().length,
    characters: characters.length,
    quotes: quotes.length,
    total: ALL_TITLES.length,
  };
}

export function getGenreBreakdown() {
  const counts = {};
  ALL_TITLES.forEach((t) => {
    (t.genre || []).forEach((g) => {
      counts[g] = (counts[g] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
}

export function getCurrentlyIn(limit = 6) {
  // "Currently In": anime/shows you're caught up on but are still airing —
  // the closest signal the current data model can give us for "actively watching".
  // NOTE: Games don't have a distinct "in progress" status yet (only Owned/Played
  // vs Want to Play) — add a `currently_playing` boolean in a future data pass
  // to surface games here too.
  return ALL_TITLES.filter(
    (t) => t.category !== 'games' && t.up_to_date === true
  ).slice(0, limit);
}

// ---------------- Phase 3 helpers ----------------

// No title has a real date_added yet (see README) — this uses each title's
// position in its source sheet as a stand-in "archive order" so the Timeline
// has something honest to show. Swap to a real date sort once date_added is
// populated by scripts/generate-data.py.
export function getArchiveOrder() {
  return ALL_TITLES.map((t, i) => ({ ...t, archiveIndex: i }));
}

export function getTopGenre() {
  const breakdown = getGenreBreakdown();
  return breakdown.length ? breakdown[0] : null;
}

// Groups by the first word of the title as a rough franchise signal
// (e.g. "God of War 3" / "God of War Ragnarök" both key on "God").
// Good enough for a fun stat, not precise enough for real clustering —
// see README for why real franchise_id modeling is a Phase 3+ follow-up.
export function getTopFranchiseGuess() {
  const counts = {};
  // Track both a normalized key (for accurate counting across inconsistent
  // capitalization like "God of War" vs "God of war") and a display label
  // (the most common casing seen, so the UI doesn't show all-lowercase).
  const displayLabel = {};
  ALL_TITLES.forEach((t) => {
    const key = t.title.split(':')[0].split(' - ')[0].trim();
    const shortKey = key.split(' ').slice(0, 3).join(' ');
    const normalized = shortKey.toLowerCase();
    counts[normalized] = (counts[normalized] || 0) + 1;
    displayLabel[normalized] = displayLabel[normalized] || shortKey;
  });
  const sorted = Object.entries(counts)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1]);
  return sorted.length ? [displayLabel[sorted[0][0]], sorted[0][1]] : null;
}

export function getRandomQuote() {
  if (!quotes.length) return null;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function getRandomCharacter() {
  if (!characters.length) return null;
  return characters[Math.floor(Math.random() * characters.length)];
}

export { games, anime, shows, horror, characters, quotes, achievements, about };
