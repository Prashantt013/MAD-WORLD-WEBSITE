import 'server-only';
import awards from '../data/awards.json';
import { cached, fetchJson } from './cache';

// Real award history. Winners, descriptions and poster URLs are curated in
// data/awards.json (posters resolved once via scripts/resolve_award_posters.py
// so the runtime stays keyless and fast). Anything still missing a poster is
// looked up lazily from Wikipedia / TMDB and cached for a week.
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

async function wikipediaPoster(title) {
  const data = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original&pilicense=any&format=json&redirects=1&titles=${encodeURIComponent(title)}`, { headers: { Accept: 'application/json' } });
  const page = Object.values(data?.query?.pages || {})[0];
  const source = page?.original?.source || null;
  return source && !source.endsWith('.svg') ? source : null;
}

async function tmdbPoster(item, track) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const kind = track === 'movies' ? 'movie' : 'tv';
  const data = await fetchJson(`https://api.themoviedb.org/3/search/${kind}?api_key=${key}&query=${encodeURIComponent(item.title)}`);
  const hit = data.results?.[0];
  return hit?.poster_path ? TMDB_IMG + hit.poster_path : null;
}

async function resolveMissing(item, track) {
  return cached(`award-poster:${track}:${item.year}:${item.wiki}`, 60 * 60 * 24 * 7, async () => {
    if (track === 'movies' || track === 'tv') { const poster = await tmdbPoster(item, track).catch(() => null); if (poster) return poster; }
    for (const page of [item.wiki, item.fallbackWiki].filter(Boolean)) { const poster = await wikipediaPoster(page).catch(() => null); if (poster) return poster; }
    return null;
  });
}

export async function getAwards(trackFilter) {
  const tracks = trackFilter ? { [trackFilter]: awards.tracks[trackFilter] } : awards.tracks;
  const output = {};
  for (const [track, config] of Object.entries(tracks)) {
    if (!config) continue;
    const winners = await Promise.all(config.winners.map(async (item) => ({ ...item, track, poster: item.poster || (await resolveMissing(item, track).catch(() => null)), url: item.url || `https://en.wikipedia.org/wiki/${item.wiki}` })));
    output[track] = { ...config, winners: winners.sort((a, b) => b.year - a.year) };
  }
  return output;
}
