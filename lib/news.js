import 'server-only';
import { XMLParser } from 'fast-xml-parser';
import { cached, fetchJson, fetchText } from './cache';

// RSS / Atom news hub. Feeds are fetched in parallel, normalized, deduplicated
// and cached (memory + Mongo) for 15 minutes.
const FEEDS = {
  gaming: [
    { source: 'IGN', url: 'https://feeds.feedburner.com/ign/games-all' },
    { source: 'GameSpot', url: 'https://www.gamespot.com/feeds/game-news/' },
    { source: 'Steam', url: 'https://store.steampowered.com/feeds/news/' },
  ],
  anime: [
    { source: 'Anime News Network', url: 'https://feeds.feedburner.com/animenewsnetwork/news' },
    { source: 'MyAnimeList', url: 'https://myanimelist.net/rss/news.xml' },
  ],
  screen: [
    { source: 'Variety', url: 'https://variety.com/v/film/feed/' },
    { source: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com/c/movies/feed/' },
    { source: 'Collider', url: 'https://collider.com/feed/' },
  ],
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', cdataPropName: '__cdata', textNodeName: '#text' });

function text(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return text(node[0]);
  return String(node.__cdata ?? node['#text'] ?? node['@_href'] ?? '');
}

function stripHtml(html) { return text(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/\s+/g, ' ').trim(); }

function firstImage(item) {
  const candidates = [item['media:content'], item['media:thumbnail'], item.enclosure, item['media:group']?.['media:content']].flat().filter(Boolean);
  for (const media of candidates) { const url = media?.['@_url']; if (url && !/\.(mp3|mp4|m4a)(\?|$)/i.test(url)) return url; }
  const html = text(item['content:encoded']) + text(item.description) + text(item.summary) + text(item.content);
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i) || html.match(/data-image-url=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function normalizeItem(item, source, category) {
  const title = stripHtml(item.title);
  const link = text(item.link) || item.link?.['@_href'] || (Array.isArray(item.link) ? item.link.find((entry) => entry['@_rel'] !== 'self')?.['@_href'] : '');
  const dateRaw = text(item.pubDate) || text(item.published) || text(item.updated) || text(item['dc:date']);
  const date = dateRaw ? new Date(dateRaw) : null;
  return { id: `${source}-${(text(item.guid) || link || title).slice(-60)}`.replace(/[^a-z0-9-]/gi, ''), title, link, date: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null, source, category, image: firstImage(item), summary: stripHtml(item.description || item.summary || item['content:encoded']).slice(0, 220) };
}

async function readFeed({ source, url }, category) {
  const xml = await fetchText(url);
  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || parsed?.['rdf:RDF']?.item || [];
  return (Array.isArray(items) ? items : [items]).slice(0, 20).map((item) => normalizeItem(item, source, category)).filter((item) => item.title && item.link);
}

async function loadCategory(category) {
  const results = await Promise.allSettled(FEEDS[category].map((feed) => readFeed(feed, category)));
  const items = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const seen = new Set();
  const unique = items.filter((item) => { const key = item.title.toLowerCase().slice(0, 60); if (seen.has(key)) return false; seen.add(key); return true; });
  unique.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return { items: unique.slice(0, 30), sources: FEEDS[category].map((feed, index) => ({ name: feed.source, ok: results[index].status === 'fulfilled' })), updatedAt: new Date().toISOString() };
}

async function tmdbReleaseRadar() {
  const key = process.env.TMDB_API_KEY;
  if (!key) return { configured: false, items: [] };
  const [upcoming, nowPlaying] = await Promise.all([fetchJson(`https://api.themoviedb.org/3/movie/upcoming?api_key=${key}&region=US`), fetchJson(`https://api.themoviedb.org/3/movie/now_playing?api_key=${key}&region=US`)]);
  const shape = (movie, label) => ({ id: `tmdb-${movie.id}`, title: movie.title, link: `https://www.themoviedb.org/movie/${movie.id}`, date: movie.release_date ? new Date(movie.release_date).toISOString() : null, source: 'TMDB', category: 'screen', image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null, summary: movie.overview?.slice(0, 200) || '', label });
  return { configured: true, items: [...(upcoming.results || []).slice(0, 8).map((movie) => shape(movie, 'Upcoming')), ...(nowPlaying.results || []).slice(0, 6).map((movie) => shape(movie, 'Now playing'))] };
}

export async function getNews() {
  return cached('news:all:v2', 60 * 15, async () => {
    const [gaming, anime, screen, radar] = await Promise.allSettled([loadCategory('gaming'), loadCategory('anime'), loadCategory('screen'), tmdbReleaseRadar()]);
    const value = (result, fallback) => (result.status === 'fulfilled' ? result.value : { ...fallback, error: result.reason?.message });
    return { gaming: value(gaming, { items: [] }), anime: value(anime, { items: [] }), screen: value(screen, { items: [] }), radar: value(radar, { configured: Boolean(process.env.TMDB_API_KEY), items: [] }), generatedAt: new Date().toISOString() };
  });
}
