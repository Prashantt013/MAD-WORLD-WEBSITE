'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Flame, Newspaper, Trophy } from 'lucide-react';
import CaseCard from '../components/CaseCard';
import HeroStack from '../components/HeroStack';
import Poster from '../components/Poster';
import LiveCard from '../components/LiveCard';
import { NewsMini } from '../components/NewsCard';
import { useArchive, useLive } from '../lib/useArchive';

export default function HomePage() {
  const archive = useArchive();
  const { data: trending } = useLive('/api/trending');
  const { data: news } = useLive('/api/news');
  const titles = archive.titles;
  const stats = archive.stats;
  const [quote, setQuote] = useState(null);
  const [spotlight, setSpotlight] = useState(null);

  // Randomness only on the client, after hydration.
  useEffect(() => {
    const quotes = archive.quotes || [];
    if (quotes.length) setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    const withPoster = archive.characters.filter((character) => character.cover_url);
    if (withPoster.length) setSpotlight(withPoster[Math.floor(Math.random() * withPoster.length)]);
  }, [archive.quotes, archive.characters]);

  const shelves = useMemo(() => [
    { label: 'Hall of Fame', href: '/hall-of-fame', eyebrow: 'The legendary shelf', description: 'The entries with a permanent place in the archive.', items: titles.filter((title) => title.hall_of_fame).slice(0, 10) },
    { label: 'Games', href: '/games', eyebrow: 'Curated collection', description: 'A hand-picked shelf of game favourites.', items: titles.filter((title) => title.category === 'games').sort((a, b) => (b.rating_external_num || 0) - (a.rating_external_num || 0)).slice(0, 10) },
    { label: 'Anime', href: '/anime', eyebrow: 'Curated collection', description: 'Long arcs and sharp philosophies.', items: titles.filter((title) => title.category === 'anime').sort((a, b) => (b.rating_external_num || 0) - (a.rating_external_num || 0)).slice(0, 10) },
    { label: 'Shows', href: '/shows', eyebrow: 'Curated collection', description: 'Prestige drama and crime sagas.', items: titles.filter((title) => title.category === 'shows').sort((a, b) => (b.rating_external_num || 0) - (a.rating_external_num || 0)).slice(0, 10) },
  ], [titles]);
  const queue = titles.filter((title) => title.category !== 'games' && title.up_to_date === false).slice(0, 8);
  const recentlyAdded = (archive.recent || []).filter((item) => item.title).slice(0, 8);
  const liveGames = trending?.games?.items?.slice(0, 6) || [];
  const liveAnime = trending?.anime?.items?.slice(0, 6) || [];
  const headlines = [...(news?.gaming?.items?.slice(0, 2) || []), ...(news?.anime?.items?.slice(0, 2) || []), ...(news?.screen?.items?.slice(0, 1) || [])];
  const statEntries = [
    ['Titles', stats.total || titles.length, '/library', 'total'], ['Games', stats.games, '/games', 'games'], ['Anime', stats.anime, '/anime', 'anime'], ['Shows', stats.shows, '/shows', 'shows'],
    ['Characters', stats.characters, '/characters', 'characters'], ['Quotes', stats.quotes, '/quotes', 'quotes'], ['Hall of Fame', stats.hallOfFame, '/hall-of-fame', 'hall'],
  ];

  return (
    <main>
      <section className="hero-home">
        <div className="fade-up"><HeroStack titles={titles} /></div>
        <div className="hero-copy fade-up d1">
          <div className="kicker"><span className="pulse-dot" style={{ marginRight: 10 }} />Private archive · public obsession</div>
          <h1>Stories that<br /><span>stay with you.</span></h1>
          <p>Welcome to MAD WORLD — a living catalogue of the games, anime, shows, characters and lines that made the journey unforgettable. Now with live trending data, news and real award history.</p>
          <div className="hero-actions"><Link href="/hall-of-fame" className="btn btn-primary">Enter the Hall of Fame <ArrowUpRight size={14} /></Link><Link href="/library" className="btn btn-ghost">Explore the archive</Link><Link href="/trending" className="btn btn-ghost"><Flame size={14} /> Trending</Link></div>
          <div className="hero-meta"><span>Curated by Prashant</span><span className="meta-divider" /><span>{stats.total || titles.length} titles</span><span className="meta-divider" /><span>{stats.hallOfFame} in the Hall of Fame</span><span className="meta-divider" /><span>Updated live</span></div>
        </div>
      </section>

      <section className="stats-strip"><div className="container stat-grid">{statEntries.map(([label, number, href, tone]) => <Link key={label} href={href} className={`stat-tile tone-${tone}`}><strong>{number}</strong><span>{label}</span><i>↗</i></Link>)}</div></section>

      {shelves.map((shelf, index) => <section className="container home-section" key={shelf.label}><div className="section-heading"><div><span className="eyebrow">{shelf.eyebrow}</span><h2>{shelf.label}</h2><p>{shelf.description}</p></div><Link href={shelf.href} className="text-link">See all →</Link></div><div className="shelf-row">{shelf.items.map((title) => <CaseCard key={`${title.category}-${title.id}`} title={title} compact />)}</div>{index === 0 && recentlyAdded.length > 0 && <div className="source-row"><span className="source-pill"><i />Recently added: {recentlyAdded.map((item) => item.title).slice(0, 3).join(' · ')}</span></div>}</section>)}

      {queue.length > 0 && <section className="container home-section"><div className="section-heading"><div><span className="eyebrow purple">Your queue</span><h2>Catching up</h2><p>Series with episodes still waiting.</p></div><Link href="/anime" className="text-link">View shelf →</Link></div><div className="shelf-row">{queue.map((title) => <CaseCard key={`${title.category}-${title.id}`} title={title} compact />)}</div></section>}

      {(liveGames.length > 0 || liveAnime.length > 0) && <section className="container home-section"><div className="section-heading"><div><span className="eyebrow red">Live right now</span><h2>Trending beyond the archive</h2><p>What the world is playing and watching this week.</p></div><Link href="/trending" className="text-link">Full trending hub →</Link></div><div className="shelf-row live">{[...liveGames.slice(0, 4), ...liveAnime.slice(0, 4)].map((item) => <LiveCard key={item.id} item={item} />)}</div></section>}

      <section className="container feature-grid home-section">
        <div className="quote-feature glass-card"><span className="eyebrow">Quote of the day</span><blockquote>“{quote?.text || 'Do not be sorry. Be better.'}”</blockquote><div className="quote-credit">{quote?.title_name || 'God of War'} <span>·</span> {quote?.category_ref || 'games'}</div><Link href="/quotes" className="text-link">Open quote room →</Link></div>
        {spotlight ? <Link href={`/characters/${spotlight.slug}`} className="character-feature glass-card"><Poster src={spotlight.cover_url} fallback={spotlight.local_cover} title={spotlight.name} category="characters" /><div className="character-feature-copy"><span className="eyebrow">Character spotlight</span><h2>{spotlight.name}</h2><p>{spotlight.bio || spotlight.famous_line}</p><span className="text-link">Meet the character →</span></div></Link> : <div className="character-feature glass-card"><div className="character-feature-copy"><span className="eyebrow">Character spotlight</span><h2>Loading…</h2></div></div>}
      </section>

      {headlines.length > 0 && <section className="container home-section" style={{ paddingBottom: 90, paddingTop: 0 }}><div className="section-heading"><div><span className="eyebrow"><Newspaper size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 6 }} />News wire</span><h2>Latest headlines</h2></div><Link href="/news" className="text-link">Open the News Hub →</Link></div><div className="news-side" style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>{headlines.map((item) => <NewsMini key={item.id} item={item} category={item.category === 'anime' ? 'anime' : item.category === 'screen' ? 'movies' : 'games'} />)}</div><div className="source-row" style={{ marginTop: 18 }}><Link href="/history" className="source-pill"><Trophy size={11} color="var(--gold)" /> Award history: Game, Anime, TV & Movie of the Year</Link></div></section>}
    </main>
  );
}
