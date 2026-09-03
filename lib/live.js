import 'server-only';
import { cached, fetchJson } from './cache';

// ---------------------------------------------------------------------------
// Live trending adapters. Every adapter returns a normalized array of
// { id, title, poster, backdrop, rating, ratingLabel, date, genres, meta, source, url }
// so the UI never needs to know which provider answered.
// ---------------------------------------------------------------------------

const TTL = { games: 60 * 30, anime: 60 * 30, screen: 60 * 30 };

function card(partial) {
  return { id: String(partial.id), title: partial.title || 'Untitled', poster: partial.poster || null, backdrop: partial.backdrop || null, rating: partial.rating ?? null, ratingLabel: partial.ratingLabel || null, date: partial.date || null, genres: (partial.genres || []).filter(Boolean).slice(0, 3), meta: partial.meta || null, source: partial.source, url: partial.url || null };
}

// ---------------- GAMES ----------------
async function steamTopGames() {
  const [charts, featured] = await Promise.allSettled([
    fetchJson('https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/'),
    fetchJson('https://store.steampowered.com/api/featuredcategories?cc=us&l=en'),
  ]);
  const mostPlayed = charts.status === 'fulfilled' ? (charts.value?.response?.ranks || []).slice(0, 10).map((item) => ({ appid: item.appid, players: item.peak_in_game, tag: 'Most played' })) : [];
  const sellers = featured.status === 'fulfilled' ? (featured.value?.top_sellers?.items || []).slice(0, 10).map((item) => ({ appid: item.id, name: item.name, header: item.header_image, tag: 'Top seller' })) : [];
  const seen = new Set();
  const apps = [...sellers, ...mostPlayed].filter((item) => item.appid && !seen.has(item.appid) && seen.add(item.appid)).slice(0, 14);
  const details = await Promise.allSettled(apps.map((app) => fetchJson(`https://store.steampowered.com/api/appdetails?appids=${app.appid}&cc=us&l=en`)));
  return apps.map((app, index) => {
    const data = details[index].status === 'fulfilled' ? details[index].value?.[app.appid]?.data : null;
    if (!data && !app.name) return null;
    if (data && data.type && data.type !== 'game') return null; // skip hardware, DLC, soundtracks
    const metacritic = data?.metacritic?.score ? Math.round(data.metacritic.score) / 10 : null;
    return card({ id: `steam-${app.appid}`, title: data?.name || app.name, poster: `https://cdn.cloudflare.steamstatic.com/steam/apps/${app.appid}/library_600x900.jpg`, backdrop: data?.header_image || app.header, rating: metacritic, ratingLabel: metacritic ? `Metacritic ${data.metacritic.score}` : (app.players ? `${Number(app.players).toLocaleString()} peak players` : 'Steam top seller'), date: data?.release_date?.date || null, genres: (data?.genres || []).map((genre) => genre.description), meta: app.tag, source: 'Steam', url: `https://store.steampowered.com/app/${app.appid}` });
  }).filter(Boolean);
}

async function rawgTrending() {
  const key = process.env.RAWG_API_KEY;
  if (!key) return [];
  const today = new Date();
  const from = new Date(today); from.setMonth(from.getMonth() - 8);
  const iso = (date) => date.toISOString().slice(0, 10);
  const data = await fetchJson(`https://api.rawg.io/api/games?key=${key}&dates=${iso(from)},${iso(today)}&ordering=-added&page_size=14`);
  return (data.results || []).map((game) => card({ id: `rawg-${game.id}`, title: game.name, poster: game.background_image, backdrop: game.background_image, rating: game.rating || (game.metacritic ? game.metacritic / 10 : null), ratingLabel: game.metacritic ? `Metacritic ${game.metacritic}` : (game.rating ? `RAWG ${game.rating}/5` : null), date: game.released, genres: (game.genres || []).map((genre) => genre.name), meta: `${(game.added || 0).toLocaleString()} collectors`, source: 'RAWG', url: `https://rawg.io/games/${game.slug}` }));
}

async function igdbTrending() {
  const id = process.env.IGDB_CLIENT_ID; const secret = process.env.IGDB_CLIENT_SECRET;
  if (!id || !secret) return [];
  const token = await cached('igdb-token', 60 * 60 * 24 * 20, async () => (await fetchJson(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method: 'POST' })).access_token);
  const now = Math.floor(Date.now() / 1000);
  const body = `fields name,slug,cover.image_id,total_rating,first_release_date,genres.name,hypes; where first_release_date > ${now - 60 * 60 * 24 * 240} & first_release_date < ${now + 60 * 60 * 24 * 120} & cover != null; sort hypes desc; limit 14;`;
  const games = await fetchJson('https://api.igdb.com/v4/games', { method: 'POST', headers: { 'Client-ID': id, Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' }, body });
  return games.map((game) => card({ id: `igdb-${game.id}`, title: game.name, poster: game.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${game.cover.image_id}.jpg` : null, rating: game.total_rating ? Math.round(game.total_rating) / 10 : null, ratingLabel: game.total_rating ? `IGDB ${Math.round(game.total_rating)}/100` : null, date: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().slice(0, 10) : null, genres: (game.genres || []).map((genre) => genre.name), meta: game.hypes ? `${game.hypes} hypes` : null, source: 'IGDB', url: `https://www.igdb.com/games/${game.slug}` }));
}

export function getTrendingGames() {
  return cached('trending:games:v2', TTL.games, async () => {
    const [steam, rawg, igdb] = await Promise.allSettled([steamTopGames(), rawgTrending(), igdbTrending()]);
    const pick = (result) => (result.status === 'fulfilled' ? result.value : []);
    const sources = { steam: steam.status === 'fulfilled', rawg: Boolean(process.env.RAWG_API_KEY) && rawg.status === 'fulfilled', igdb: Boolean(process.env.IGDB_CLIENT_ID) && igdb.status === 'fulfilled' };
    return { items: [...pick(rawg), ...pick(igdb), ...pick(steam)], sources, configured: { rawg: Boolean(process.env.RAWG_API_KEY), igdb: Boolean(process.env.IGDB_CLIENT_ID && process.env.IGDB_CLIENT_SECRET) }, updatedAt: new Date().toISOString() };
  });
}

// ---------------- ANIME ----------------
async function jikanTrending() {
  const data = await fetchJson('https://api.jikan.moe/v4/top/anime?filter=airing&limit=16');
  return (data.data || []).map((anime) => card({ id: `mal-${anime.mal_id}`, title: anime.title_english || anime.title, poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url, rating: anime.score, ratingLabel: anime.score ? `MAL ${anime.score}` : null, date: anime.aired?.from ? anime.aired.from.slice(0, 10) : null, genres: (anime.genres || []).map((genre) => genre.name), meta: `${anime.episodes ? `${anime.episodes} eps` : 'Ongoing'} · ${anime.status || ''}`.trim(), source: 'MyAnimeList', url: anime.url }));
}

async function anilistTrending() {
  const query = '{ Page(perPage: 16) { media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { id siteUrl title { english romaji } coverImage { extraLarge large } averageScore episodes status startDate { year month day } genres } } }';
  const data = await fetchJson('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  const status = { RELEASING: 'Currently Airing', FINISHED: 'Finished Airing', NOT_YET_RELEASED: 'Not yet aired' };
  return (data.data?.Page?.media || []).map((anime) => card({ id: `anilist-${anime.id}`, title: anime.title.english || anime.title.romaji, poster: anime.coverImage?.extraLarge || anime.coverImage?.large, rating: anime.averageScore ? anime.averageScore / 10 : null, ratingLabel: anime.averageScore ? `AniList ${anime.averageScore}%` : null, date: anime.startDate?.year ? `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, '0')}-${String(anime.startDate.day || 1).padStart(2, '0')}` : null, genres: anime.genres, meta: `${anime.episodes ? `${anime.episodes} eps` : 'Ongoing'} · ${status[anime.status] || anime.status}`, source: 'AniList', url: anime.siteUrl }));
}

export function getTrendingAnime() {
  return cached('trending:anime:v2', TTL.anime, async () => {
    try { const items = await jikanTrending(); if (items.length) return { items, source: 'MyAnimeList (Jikan)', updatedAt: new Date().toISOString() }; } catch { /* MAL is frequently rate limited, fall back */ }
    const items = await anilistTrending();
    return { items, source: 'AniList (MyAnimeList unavailable)', updatedAt: new Date().toISOString() };
  });
}

// ---------------- MOVIES & SHOWS ----------------
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
async function tmdb(pathname) {
  const key = process.env.TMDB_API_KEY;
  const data = await fetchJson(`https://api.themoviedb.org/3${pathname}${pathname.includes('?') ? '&' : '?'}api_key=${key}`);
  return data.results || [];
}

export function getTrendingScreen() {
  return cached('trending:screen:v2', TTL.screen, async () => {
    if (!process.env.TMDB_API_KEY) return { configured: false, movies: [], shows: [], updatedAt: new Date().toISOString() };
    const [movies, shows, genreMovie, genreTv] = await Promise.all([tmdb('/trending/movie/week'), tmdb('/trending/tv/week'), fetchJson(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`), fetchJson(`https://api.themoviedb.org/3/genre/tv/list?api_key=${process.env.TMDB_API_KEY}`)]);
    const genreName = (list, ids = []) => ids.map((id) => list.genres?.find((genre) => genre.id === id)?.name).filter(Boolean);
    return {
      configured: true,
      movies: movies.slice(0, 14).map((movie) => card({ id: `tmdb-m-${movie.id}`, title: movie.title, poster: movie.poster_path ? TMDB_IMG + movie.poster_path : null, backdrop: movie.backdrop_path ? TMDB_IMG + movie.backdrop_path : null, rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null, ratingLabel: movie.vote_average ? `TMDB ${movie.vote_average.toFixed(1)}` : null, date: movie.release_date, genres: genreName(genreMovie, movie.genre_ids), meta: 'Movie', source: 'TMDB', url: `https://www.themoviedb.org/movie/${movie.id}` })),
      shows: shows.slice(0, 14).map((show) => card({ id: `tmdb-t-${show.id}`, title: show.name, poster: show.poster_path ? TMDB_IMG + show.poster_path : null, backdrop: show.backdrop_path ? TMDB_IMG + show.backdrop_path : null, rating: show.vote_average ? Math.round(show.vote_average * 10) / 10 : null, ratingLabel: show.vote_average ? `TMDB ${show.vote_average.toFixed(1)}` : null, date: show.first_air_date, genres: genreName(genreTv, show.genre_ids), meta: 'Series', source: 'TMDB', url: `https://www.themoviedb.org/tv/${show.id}` })),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function getTrending() {
  const [games, anime, screen] = await Promise.allSettled([getTrendingGames(), getTrendingAnime(), getTrendingScreen()]);
  const value = (result, fallback) => (result.status === 'fulfilled' ? result.value : { ...fallback, error: result.reason?.message || 'unavailable' });
  return { games: value(games, { items: [] }), anime: value(anime, { items: [] }), screen: value(screen, { configured: Boolean(process.env.TMDB_API_KEY), movies: [], shows: [] }), generatedAt: new Date().toISOString() };
}
