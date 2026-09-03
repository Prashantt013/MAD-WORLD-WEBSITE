'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CaseCard from '../CaseCard';
import CharacterCard from '../CharacterCard';
import Certificate from '../Certificate';
import Poster from '../Poster';
import TitleDetail from '../TitleDetail';
import { useArchive } from '../../lib/useArchive';
import { CATEGORY_META } from '../../lib/data';

export const categoryInfo = {
  games: ['Games', 'The complete game shelf — from nostalgic classics to worlds still waiting.'],
  anime: ['Anime', 'Long arcs, sharp philosophies, and worlds that refuse to let go.'],
  shows: ['Shows', 'Prestige drama, crime sagas and the series that owned the weekend.'],
  movies: ['Movies', 'Feature films catalogued into the archive, from award winners to comfort rewatches.'],
  horror: ['Horror', 'The unsettling, the strange, and the stories best watched after dark.'],
};

export function Header({ eyebrow, title, description, center = false, children }) {
  return <div className={`page-header fade-up ${center ? 'center' : ''}`}><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}{children}</div>;
}
export function Loading({ label = 'Loading the archive universe…' }) { return <div className="empty-state">{label}</div>; }

export function LibraryPage({ category }) {
  const archive = useArchive();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const titles = category === 'library' ? archive.titles : archive.titles.filter((title) => title.category === category);
  const statuses = ['All', ...new Set(titles.map((title) => title.status).filter(Boolean))];
  const filtered = titles.filter((title) => (filter === 'All' || title.status === filter) && (!query || `${title.title} ${title.summary || ''} ${(title.genre || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())));
  const info = categoryInfo[category] || ['Library', 'Every title in one cinematic archive, organised into shelves.'];
  return (
    <div className="page-shell">
      <Header eyebrow={category === 'library' ? 'All shelves' : 'Archive shelf'} title={info[0]} description={info[1]} />
      <div className="archive-toolbar">{statuses.map((status) => <button className={`chip ${filter === status ? 'active' : ''}`} key={status} onClick={() => setFilter(status)}>{status === 'All' ? 'Everything' : status}</button>)}<input className="toolbar-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this shelf..." aria-label="Search this shelf" /></div>
      <div className="result-count">{filtered.length} entries · Click a card to flip it</div>
      {archive.loading && !filtered.length ? <Loading /> : filtered.length ? <div className="archive-grid">{filtered.map((title) => <CaseCard key={`${title.category}-${title.id}`} title={title} />)}</div> : <div className="empty-state">No entries match that search{category !== 'library' ? <> — <Link href="/add" className="text-link" style={{ margin: 0 }}>add the first one →</Link></> : '.'}</div>}
    </div>
  );
}

export function HallOfFamePage() {
  const archive = useArchive();
  const hof = archive.titles.filter((title) => title.hall_of_fame).sort((a, b) => (b.rating_external_num || 0) - (a.rating_external_num || 0));
  const spotlight = hof[0];
  return (
    <div className="page-shell">
      <Header eyebrow="The legendary shelf" title="Hall of Fame" description="Not everything makes it here. These are the titles that earned a permanent gold border in the MAD WORLD archive." />
      {spotlight && <div className="hof-hero">
        <div className="spotlight-card"><Poster src={spotlight.cover_url} fallback={spotlight.local_cover} title={spotlight.title} category={spotlight.category} loading="eager" /><div className="spotlight-copy"><span className="eyebrow">Archive spotlight · #1</span><h2>{spotlight.title}</h2><p>{spotlight.summary}</p><Link href={`/${spotlight.category}/${spotlight.slug}`} className="text-link">Open legendary entry →</Link></div></div>
        <div className="ranking-stack">{hof.slice(0, 5).map((title, index) => <Link href={`/${title.category}/${title.slug}`} className="ranked-item" key={`${title.category}-${title.id}`}><span className="rank-number">#{index + 1}</span><Poster src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} compact /><div><strong>{title.title}</strong><small>{CATEGORY_META[title.category]?.label || title.category} · {title.rating_external || 'Unrated'}</small></div></Link>)}</div>
      </div>}
      <div className="result-count">{hof.length} inducted titles</div>
      <div className="archive-grid">{hof.map((title) => <CaseCard key={`${title.category}-${title.id}`} title={title} />)}</div>
    </div>
  );
}

export function CharactersPage() {
  const archive = useArchive();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const types = ['All', ...new Set(archive.characters.map((character) => character.type).filter(Boolean))];
  const shown = archive.characters.filter((character) => (type === 'All' || character.type === type) && `${character.name} ${character.franchise} ${character.type}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="page-shell">
      <Header eyebrow="The faces behind the stories" title="Characters" description="Collectible profiles for the heroes, villains, mentors and chaos agents who made these worlds matter." />
      <div className="archive-toolbar">{types.map((item) => <button className={`chip purple ${type === item ? 'active' : ''}`} key={item} onClick={() => setType(item)}>{item}</button>)}<input className="toolbar-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search characters..." aria-label="Search characters" /></div>
      <div className="result-count">{shown.length} characters</div>
      <div className="characters-grid">{shown.map((character) => <CharacterCard key={character.id} character={character} />)}</div>
    </div>
  );
}

export function CharacterDetailPage({ slug }) {
  const archive = useArchive();
  const character = archive.characters.find((entry) => entry.slug === slug);
  if (!character) return <div className="page-shell"><Header eyebrow="404" title="Character not found" description="This character has not been catalogued yet." /><Link href="/characters" className="btn btn-ghost">Back to characters</Link></div>;
  const title = archive.titles.find((entry) => entry.id === character.title_id) || archive.titles.find((entry) => character.franchise && entry.title.toLowerCase().includes(character.franchise.toLowerCase().split(' ')[0]));
  const related = archive.characters.filter((entry) => entry.slug !== slug && entry.franchise === character.franchise).slice(0, 6);
  return (
    <div className="page-shell">
      <Link href="/characters" className="back-link">← Back to characters</Link>
      <div className="detail-hero" style={{ '--cat-color': CATEGORY_META.characters.color, '--hero-image': character.cover_url ? `url(${character.cover_url})` : 'none' }}>
        <div className="hero-poster"><Poster src={character.cover_url} fallback={character.local_cover} title={character.name} category="characters" loading="eager" /></div>
        <div className="hero-content"><div className="eyebrow">{character.type || 'Character'} · {character.franchise}</div><h1>{character.name}</h1><div className="meta-row">{character.screen_time && <span className="pill">{character.screen_time}</span>}{title && <Link href={`/${title.category}/${title.slug}`} className="pill gold">From {title.title}</Link>}</div></div>
      </div>
      <div className="detail-body">
        <div className="main-col">{character.famous_line && <section><h3>Famous line</h3><p className="quote">“{character.famous_line}”</p></section>}{character.bio && <section><h3>Bio</h3><p>{character.bio}</p></section>}{character.prashant_note && <section><h3>Prashant&rsquo;s Note</h3><p>{character.prashant_note}</p></section>}</div>
        <aside className="side-col"><div className="panel"><span className="eyebrow">Franchise</span><h3 style={{ font: '600 22px var(--font-display)', margin: '10px 0' }}>{character.franchise}</h3>{title && <Link href={`/${title.category}/${title.slug}`} className="text-link">Open {title.title} →</Link>}</div></aside>
      </div>
      {related.length > 0 && <section className="related-section"><h3>Same universe</h3><div className="characters-grid">{related.map((entry) => <CharacterCard key={entry.id} character={entry} />)}</div></section>}
    </div>
  );
}

export function QuotesPage() {
  const archive = useArchive();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [randomIndex, setRandomIndex] = useState(0);
  const allQuotes = archive.quotes || [];
  useEffect(() => { if (allQuotes.length) setRandomIndex(Math.floor(Math.random() * allQuotes.length)); }, [allQuotes.length]);
  const filtered = allQuotes.filter((quote) => (category === 'All' || quote.category_ref === category) && `${quote.text} ${quote.title_name}`.toLowerCase().includes(query.toLowerCase()));
  const random = allQuotes[randomIndex] || allQuotes[0];
  return (
    <div className="page-shell">
      <Header eyebrow="Words worth repeating" title="Quote room" description="The lines that echo after the credits. Search by title, filter by world, and keep the good ones close." />
      {random && <div className="quotes-hero glass-card"><span className="eyebrow">Random archive pull</span><blockquote>“{random.text}”</blockquote><span className="quote-credit">{random.title_name} · {random.category_ref}</span><button className="btn btn-ghost btn-sm" style={{ marginLeft: 16 }} onClick={() => setRandomIndex(Math.floor(Math.random() * allQuotes.length))}>Pull another</button></div>}
      <div className="archive-toolbar">{['All', 'games', 'anime', 'shows', 'movies'].map((item) => <button key={item} className={`chip ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}<input className="toolbar-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quotes..." aria-label="Search quotes" /></div>
      <div className="result-count">{filtered.length} quotes</div>
      <div className="quote-grid">{filtered.map((quote) => <Link href={`/${quote.category_ref}/${quote.title_slug}`} className="quote-card" key={quote.id}><p>“{quote.text}”</p><footer><b>{quote.title_name}</b><br />{quote.category_ref}</footer></Link>)}</div>
    </div>
  );
}

export function DetailPage({ category, slug }) {
  const archive = useArchive();
  const title = archive.titles.find((entry) => entry.category === category && entry.slug === slug);
  if (!title) return archive.loading ? <div className="page-shell"><Loading /></div> : <div className="page-shell"><Header eyebrow="404" title="Entry not found" description="This story has not been catalogued yet." /><Link href={`/${category}`} className="btn btn-ghost">Back to shelf</Link></div>;
  const characters = archive.characters.filter((character) => character.title_id === title.id);
  const related = archive.titles.filter((entry) => entry.id !== title.id && entry.category === title.category && (entry.genre || []).some((genre) => (title.genre || []).includes(genre))).slice(0, 6);
  const quotes = archive.quotes.filter((quote) => quote.title_id === title.id && quote.text !== title.famous_quote);
  return <TitleDetail title={title} characters={characters} related={related} quotes={quotes} />;
}

export function CertificatePage({ category, slug }) {
  const archive = useArchive();
  const title = archive.titles.find((entry) => entry.category === category && entry.slug === slug);
  if (!title) return <div className="page-shell"><Loading /></div>;
  return <Certificate title={title} />;
}

export function SearchPage() {
  const archive = useArchive();
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => { setQuery(new URLSearchParams(window.location.search).get('q') || ''); setReady(true); }, []);
  const term = query.trim().toLowerCase();
  const titles = term ? archive.titles.filter((title) => `${title.title} ${title.summary || ''} ${(title.genre || []).join(' ')} ${title.famous_quote || ''}`.toLowerCase().includes(term)) : [];
  const chars = term ? archive.characters.filter((character) => `${character.name} ${character.franchise} ${character.famous_line || ''}`.toLowerCase().includes(term)) : [];
  const matchedQuotes = term ? archive.quotes.filter((quote) => `${quote.text} ${quote.title_name}`.toLowerCase().includes(term)) : [];
  return (
    <div className="page-shell">
      <Header eyebrow="Global search 2.0" title="Find anything" description="One instant search across games, anime, shows, movies, characters, and quotes — including everything added through the archive." />
      <input autoFocus className="global-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try God of War, Aizen, crime, or a famous line…" aria-label="Global archive search" />
      {ready && term && <div className="search-summary">{titles.length + chars.length + matchedQuotes.length} results across the universe</div>}
      {titles.length > 0 && <section className="search-section"><div className="section-heading"><h2>Titles <span>{titles.length}</span></h2></div><div className="archive-grid" style={{ marginTop: 18 }}>{titles.slice(0, 24).map((title) => <CaseCard key={`${title.category}-${title.id}`} title={title} />)}</div></section>}
      {chars.length > 0 && <section className="search-section"><div className="section-heading"><h2>Characters <span>{chars.length}</span></h2></div><div className="characters-grid" style={{ marginTop: 18 }}>{chars.slice(0, 12).map((character) => <CharacterCard key={character.id} character={character} />)}</div></section>}
      {matchedQuotes.length > 0 && <section className="search-section"><div className="section-heading"><h2>Quotes <span>{matchedQuotes.length}</span></h2></div><div className="quote-grid" style={{ marginTop: 18 }}>{matchedQuotes.slice(0, 12).map((quote) => <Link href={`/${quote.category_ref}/${quote.title_slug}`} className="quote-card" key={quote.id}><p>“{quote.text}”</p><footer><b>{quote.title_name}</b></footer></Link>)}</div></section>}
      {ready && term && !titles.length && !chars.length && !matchedQuotes.length && <div className="empty-state">No matches yet. Try a franchise, character, genre, or famous line.</div>}
    </div>
  );
}
