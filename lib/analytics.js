// Client-safe analytics helpers used by the Stats page, About page and Home.

export const CATEGORY_COLORS = { games: '#ff6b7c', anime: '#c084fc', shows: '#8fa4ff', movies: '#f0c8ff', horror: '#ff9b6b', characters: '#7ee0c2' };

const FRANCHISES = [
  ['God of War', /god of war/i], ['Assassin\'s Creed', /assassin/i], ['Resident Evil', /resident evil/i], ['Grand Theft Auto', /\bgta\b|grand theft/i], ['Prince of Persia', /prince of persia/i],
  ['Red Dead', /red dead/i], ['Uncharted', /uncharted/i], ['Far Cry', /far cry/i], ['Call of Duty', /call of duty|\bcod\b/i], ['Spider-Man', /spider[- ]?man/i], ['Batman', /batman|arkham/i], ['The Witcher', /witcher/i],
  ['Pro Evolution Soccer', /\bpes\b|pro evolution/i], ['FIFA / EA FC', /\bfifa\b|ea sports fc/i], ['Cricket', /cricket/i], ['Need for Speed', /need for speed|\bnfs\b/i], ['Max Payne', /max payne/i], ['Hitman', /hitman/i], ['Tomb Raider', /tomb raider/i], ['Mafia', /\bmafia\b/i],
  ['Naruto', /naruto|boruto/i], ['One Piece', /one piece/i], ['Attack on Titan', /attack on titan|shingeki/i], ['Dragon Ball', /dragon ball/i], ['Bleach', /bleach/i], ['Jujutsu Kaisen', /jujutsu/i], ['Demon Slayer', /demon slayer|kimetsu/i], ['My Hero Academia', /hero academia/i], ['Vinland Saga', /vinland/i], ['Death Note', /death note/i], ['Hunter x Hunter', /hunter/i], ['Fullmetal Alchemist', /fullmetal/i], ['Tokyo Ghoul', /tokyo ghoul/i], ['Monster', /^monster/i], ['Berserk', /berserk/i], ['Solo Leveling', /solo leveling/i],
  ['Breaking Bad universe', /breaking bad|better call saul/i], ['Game of Thrones', /game of thrones|house of the dragon/i], ['Money Heist', /money heist|berlin/i], ['Mirzapur', /mirzapur/i], ['The Family Man', /family man/i], ['Sacred Games', /sacred games/i], ['Special Ops', /special ops/i], ['Criminal Justice', /criminal justice/i], ['Stranger Things', /stranger things/i], ['Peaky Blinders', /peaky/i], ['The Boys', /the boys|gen v/i], ['Dark', /^dark$/i],
];

export function getFranchises(titles, characters = [], limit = 8) {
  const map = new Map();
  const bump = (name, item, kind) => { if (!map.has(name)) map.set(name, { name, titles: [], characters: 0, posters: [] }); const entry = map.get(name); if (kind === 'title') { entry.titles.push(item); if (item.cover_url && entry.posters.length < 3) entry.posters.push(item); } else entry.characters += 1; };
  titles.forEach((title) => { const match = FRANCHISES.find(([, pattern]) => pattern.test(title.title || '')); if (match) bump(match[0], title, 'title'); });
  characters.forEach((character) => { const match = FRANCHISES.find(([, pattern]) => pattern.test(character.franchise || '') || pattern.test(character.name || '')); if (match) bump(match[0], character, 'character'); });
  return [...map.values()].map((entry) => ({ ...entry, count: entry.titles.length, score: entry.titles.length * 2 + entry.characters, category: entry.titles[0]?.category || 'games' })).filter((entry) => entry.count > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getGenres(titles, limit = 14) {
  const counts = {};
  titles.forEach((title) => (title.genre || []).forEach((genre) => { const key = genre.trim(); if (key) counts[key] = (counts[key] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
}

export function getDistribution(stats) {
  return [
    { key: 'games', name: 'Games', value: stats.games || 0, color: CATEGORY_COLORS.games },
    { key: 'anime', name: 'Anime', value: stats.anime || 0, color: CATEGORY_COLORS.anime },
    { key: 'shows', name: 'Shows', value: stats.shows || 0, color: CATEGORY_COLORS.shows },
    { key: 'movies', name: 'Movies', value: (stats.movies || 0) + (stats.horror || 0), color: CATEGORY_COLORS.movies },
    { key: 'characters', name: 'Characters', value: stats.characters || 0, color: CATEGORY_COLORS.characters },
  ].filter((slice) => slice.value > 0);
}

// Growth timeline: the static archive has no timestamps, so we use its curated
// order as a proxy (8 evenly spaced milestones); admin-added entries carry real
// dates and are appended as dated points.
export function getGrowth(titles) {
  const base = titles.filter((title) => !title.custom);
  const custom = titles.filter((title) => title.custom && title.date_added).sort((a, b) => new Date(a.date_added) - new Date(b.date_added));
  const steps = 8; const points = [];
  for (let index = 1; index <= steps; index += 1) {
    const slice = base.slice(0, Math.round((base.length * index) / steps));
    points.push({ label: index === steps ? 'Archive V6' : `Milestone ${index}`, games: slice.filter((title) => title.category === 'games').length, anime: slice.filter((title) => title.category === 'anime').length, shows: slice.filter((title) => title.category === 'shows').length, total: slice.length });
  }
  let running = points[points.length - 1];
  custom.forEach((title) => { running = { ...running, label: new Date(title.date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), total: running.total + 1, [title.category]: (running[title.category] || 0) + 1 }; points.push(running); });
  return points;
}

export function getHallOfFameStats(titles) {
  const hof = titles.filter((title) => title.hall_of_fame);
  const rated = hof.filter((title) => title.rating_external_num);
  const byCategory = ['games', 'anime', 'shows', 'movies', 'horror'].map((category) => ({ category, count: hof.filter((title) => title.category === category).length })).filter((entry) => entry.count > 0);
  const avg = rated.length ? Math.round((rated.reduce((sum, title) => sum + title.rating_external_num, 0) / rated.length) * 10) / 10 : null;
  const top = [...hof].sort((a, b) => (b.rating_external_num || 0) - (a.rating_external_num || 0)).slice(0, 5);
  return { total: hof.length, share: titles.length ? Math.round((hof.length / titles.length) * 100) : 0, byCategory, avg, top };
}

export function getRecentlyAdded(archive, limit = 8) {
  const dated = [...(archive.recent || [])].filter(Boolean);
  if (dated.length >= limit) return dated.slice(0, limit);
  const fill = [...archive.titles].filter((title) => !title.custom).slice(-(limit - dated.length)).reverse();
  return [...dated, ...fill].slice(0, limit);
}

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-US', options);
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days}d ago` : formatDate(value, { month: 'short', day: 'numeric' });
}
