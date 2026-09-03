'use client';

import Link from 'next/link';
import { useState } from 'react';
import CaseCard from '../CaseCard';
import LiveCard from '../LiveCard';
import { Header } from './archive';
import { useArchive, useLive } from '../../lib/useArchive';
import { timeAgo } from '../../lib/analytics';

function Skeletons({ count = 7 }) { return <div className="live-grid">{Array.from({ length: count }).map((_, index) => <div key={index} className="skeleton" style={{ aspectRatio: '2 / 3.4' }} />)}</div>; }

function Section({ eyebrow, title, description, sources, children, updatedAt }) {
  return <section className="trend-section fade-up"><div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p>{sources && <div className="source-row">{sources.map((source) => <span className={`source-pill ${source.ok ? '' : 'off'}`} key={source.name}><i />{source.name}{source.ok ? '' : ' · not connected'}</span>)}{updatedAt && <span className="source-pill" style={{ borderStyle: 'dashed' }}>Refreshed {timeAgo(updatedAt)}</span>}</div>}</div></div>{children}</section>;
}

export function TrendingPage() {
  const { data, loading, error } = useLive('/api/trending');
  const archive = useArchive();
  const [gameFilter, setGameFilter] = useState('All');
  const games = data?.games?.items || [];
  const gameSources = [...new Set(games.map((item) => item.source))];
  const shownGames = games.filter((item) => gameFilter === 'All' || item.source === gameFilter).slice(0, 14);
  const anime = data?.anime?.items || [];
  const screen = data?.screen || {};
  const archiveScreen = archive.titles.filter((title) => title.category === 'shows' || title.category === 'movies').sort((a, b) => (b.rating_external_num || 0) - (a.rating_external_num || 0)).slice(0, 7);
  return (
    <div className="page-shell">
      <Header eyebrow="Real-time discovery" title="Trending now" description="Live rankings pulled from Steam, RAWG, IGDB, MyAnimeList and TMDB — cached for speed, refreshed every 30 minutes." />
      {error && <div className="error-message">Live data is temporarily unavailable. Showing cached results where possible.</div>}

      <Section eyebrow="Games" title="Trending games" description="Top sellers and most-played titles right now, with ratings, release dates and genres." updatedAt={data?.games?.updatedAt} sources={[{ name: 'Steam', ok: data?.games?.sources?.steam !== false }, { name: 'RAWG', ok: Boolean(data?.games?.configured?.rawg) }, { name: 'IGDB', ok: Boolean(data?.games?.configured?.igdb) }]}>
        {gameSources.length > 1 && <div className="archive-toolbar">{['All', ...gameSources].map((source) => <button key={source} className={`chip ${gameFilter === source ? 'active' : ''}`} onClick={() => setGameFilter(source)}>{source}</button>)}</div>}
        {loading ? <Skeletons /> : shownGames.length ? <div className="live-grid">{shownGames.map((item) => <LiveCard key={item.id} item={item} />)}</div> : <div className="empty-state">Steam is not responding right now. Try again in a minute.</div>}
        {data && !data.games?.configured?.rawg && <div className="connect-panel panel" style={{ marginTop: 18 }}><div><span className="eyebrow purple">Optional upgrade</span><h3>Add RAWG & IGDB for a richer game feed</h3><p>Steam powers this shelf out of the box. Drop a free RAWG key into <code>RAWG_API_KEY</code> (and Twitch credentials into <code>IGDB_CLIENT_ID</code> / <code>IGDB_CLIENT_SECRET</code>) to add cross-platform releases, community ratings and hype scores — no code changes needed.</p></div><a className="btn btn-ghost btn-sm" href="https://rawg.io/apidocs" target="_blank" rel="noreferrer">Get a RAWG key</a></div>}
      </Section>

      <Section eyebrow="Anime" title="Trending anime" description="The most popular airing series, with scores, episode counts and status." updatedAt={data?.anime?.updatedAt} sources={[{ name: data?.anime?.source || 'MyAnimeList (Jikan)', ok: anime.length > 0 }]}>
        {loading ? <Skeletons /> : anime.length ? <div className="live-grid">{anime.slice(0, 14).map((item) => <LiveCard key={item.id} item={item} />)}</div> : <div className="empty-state">Anime rankings are unavailable right now.</div>}
      </Section>

      <Section eyebrow="Movies & shows" title="Trending on screen" description="This week's most-watched films and series worldwide." updatedAt={screen.updatedAt} sources={[{ name: 'TMDB', ok: Boolean(screen.configured) }]}>
        {loading ? <Skeletons /> : screen.configured ? (<>
          <div className="section-heading" style={{ marginTop: 20 }}><h3 style={{ font: '600 20px var(--font-display)' }}>Movies</h3></div><div className="live-grid">{(screen.movies || []).slice(0, 14).map((item) => <LiveCard key={item.id} item={item} />)}</div>
          <div className="section-heading" style={{ marginTop: 32 }}><h3 style={{ font: '600 20px var(--font-display)' }}>Series</h3></div><div className="live-grid">{(screen.shows || []).slice(0, 14).map((item) => <LiveCard key={item.id} item={item} />)}</div>
        </>) : (<>
          <div className="connect-panel panel" style={{ marginTop: 18 }}><div><span className="eyebrow purple">Connect TMDB</span><h3>Live movie & series trends are one key away</h3><p>Add a free TMDB v3 key to <code>TMDB_API_KEY</code> in your environment and this shelf switches to real weekly trending data with posters, ratings and release dates. Until then, here are the highest-rated screen titles from your own archive.</p></div><a className="btn btn-ghost btn-sm" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">Get a TMDB key</a></div>
          <div className="shelf-row">{archiveScreen.map((title) => <CaseCard key={`${title.category}-${title.id}`} title={title} compact />)}</div>
        </>)}
      </Section>
      <div style={{ marginTop: 40 }} className="result-count">Data © respective providers · <Link href="/news" className="text-link" style={{ margin: 0 }}>Open the News Hub →</Link></div>
    </div>
  );
}
