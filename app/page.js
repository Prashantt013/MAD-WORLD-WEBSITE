'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CaseCard from '../components/CaseCard';
import { ALL_TITLES, characters, getHallOfFame, getRandomQuote, getStats, quotes } from '../lib/data';
import { useArchive } from '../lib/useArchive';

export default function HomePage() {
  const archive = useArchive();
  const titles = archive.titles || ALL_TITLES;
  const stats = archive.stats || getStats();
  const [recommendation, setRecommendation] = useState(ALL_TITLES[0]);
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    setRecommendation(titles[Math.floor(Math.random() * Math.max(1, titles.length))] || ALL_TITLES[0]);
    setQuote((archive.quotes || quotes)[Math.floor(Math.random() * Math.max(1, (archive.quotes || quotes).length))] || quotes[0]);
  }, [archive.quotes, titles]);

  const spotlight = useMemo(() => characters.find((character) => character.slug === 'kratos') || characters[0], []);
  const shelves = [
    { label: 'Hall of Fame', href: '/hall-of-fame', items: titles.filter((title) => title.hall_of_fame).slice(0, 8) },
    { label: 'Games', href: '/games', items: titles.filter((title) => title.category === 'games').slice(0, 8) },
    { label: 'Anime', href: '/anime', items: titles.filter((title) => title.category === 'anime').slice(0, 8) },
    { label: 'Shows', href: '/shows', items: titles.filter((title) => title.category === 'shows').slice(0, 8) },
  ];
  const statEntries = [
    ['Games', stats.games, '/games', 'games'], ['Anime', stats.anime, '/anime', 'anime'], ['Shows', stats.shows, '/shows', 'shows'],
    ['Horror', stats.horror, '/horror', 'horror'], ['Characters', stats.characters, '/characters', 'characters'], ['Hall of Fame', stats.hallOfFame, '/hall-of-fame', 'hall'],
  ];

  return (
    <main>
      <section className="hero-home"><div className="hero-noise" /><div className="hero-copy"><div className="kicker">Private archive · public obsession</div><h1>Stories that<br /><span>stay with you.</span></h1><p>Welcome to MAD WORLD — a living catalogue of the games, anime, shows, characters and lines that made the journey unforgettable.</p><div className="hero-actions"><Link href="/hall-of-fame" className="btn btn-primary">Enter the Hall of Fame <span>↗</span></Link><Link href="/library" className="btn btn-ghost">Explore the archive</Link></div><div className="hero-meta"><span className="pulse-dot" /> Curated by Prashant <span className="meta-divider" /> Updated for 2026</div></div><div className="hero-card glass-card"><div className="hero-card-top"><span>01 / FEATURED ENTRY</span><span className="gold-dot">✦</span></div><div className="hero-card-image" style={{ backgroundImage: `url(${recommendation?.cover_url || '/images/hero-bg.jpg'})` }} /><div className="hero-card-content"><span className="eyebrow">Today's recommendation</span><h2>{recommendation?.title}</h2><p>{recommendation?.summary}</p><Link href={`/${recommendation?.category}/${recommendation?.slug}`}>View entry <span>→</span></Link></div></div></section>
      <section className="stats-strip"><div className="container stat-grid">{statEntries.map(([label, number, href, tone]) => <Link key={label} href={href} className={`stat-tile tone-${tone}`}><strong>{number}</strong><span>{label}</span><i>↗</i></Link>)}</div></section>
      <section className="container home-section"><div className="section-heading"><div><span className="eyebrow">Your queue</span><h2>Continue watching</h2><p>The worlds currently in rotation.</p></div><Link href="/library" className="text-link">View library →</Link></div><div className="shelf-row">{titles.filter((title) => title.category !== 'games' && title.up_to_date).slice(0, 6).map((title) => <CaseCard key={`${title.category}-${title.id}`} title={title} compact />)}</div></section>
      {shelves.map((shelf) => <section className="container home-section" key={shelf.label}><div className="section-heading"><div><span className="eyebrow">Curated collection</span><h2>{shelf.label}</h2><p>{shelf.label === 'Hall of Fame' ? 'The entries with a permanent place in the archive.' : `A hand-picked shelf of ${shelf.label.toLowerCase()} favorites.`}</p></div><Link href={shelf.href} className="text-link">See all →</Link></div><div className="shelf-row">{shelf.items.map((title) => <CaseCard key={title.id} title={title} compact />)}</div></section>)}
      <section className="container feature-grid home-section"><div className="quote-feature glass-card"><span className="eyebrow">Quote of the day</span><blockquote>“{quote?.text}”</blockquote><div className="quote-credit">{quote?.title_name} <span>·</span> {quote?.category_ref}</div><Link href="/quotes" className="text-link">Open quote room →</Link></div><Link href={`/characters/${spotlight?.slug}`} className="character-feature glass-card"><div className="character-feature-image" style={{ backgroundImage: `url(${spotlight?.cover_url || '/images/hero-bg.jpg'})` }} /><div className="character-feature-copy"><span className="eyebrow">Character spotlight</span><h2>{spotlight?.name}</h2><p>{spotlight?.bio}</p><span className="text-link">Meet the character →</span></div></Link></section>
    </main>
  );
}