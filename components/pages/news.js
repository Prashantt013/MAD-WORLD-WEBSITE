'use client';

import { useState } from 'react';
import { NewsCard, NewsFeatured, NewsMini } from '../NewsCard';
import { Header } from './archive';
import { useLive } from '../../lib/useArchive';
import { timeAgo } from '../../lib/analytics';

const TABS = [
  { key: 'gaming', label: 'Gaming', category: 'games', description: 'Release dates, delays, announcements, DLC drops and studio moves from IGN, GameSpot and the Steam news wire.' },
  { key: 'anime', label: 'Anime', category: 'anime', description: 'Season announcements, adaptations, staff reveals and industry news from Anime News Network and MyAnimeList.' },
  { key: 'screen', label: 'Movies & Shows', category: 'movies', description: 'Casting, trailers, box office and streaming headlines from Variety, The Hollywood Reporter and Collider.' },
];

export function NewsPage() {
  const { data, loading, error } = useLive('/api/news');
  const [active, setActive] = useState('gaming');
  const [sourceFilter, setSourceFilter] = useState('All');
  const tab = TABS.find((entry) => entry.key === active);
  const feed = data?.[active] || { items: [], sources: [] };
  const sources = ['All', ...new Set(feed.items.map((item) => item.source))];
  const items = feed.items.filter((item) => sourceFilter === 'All' || item.source === sourceFilter);
  const withImage = items.filter((item) => item.image);
  const featured = withImage[0] || items[0];
  const side = items.filter((item) => item !== featured).slice(0, 5);
  const rest = items.filter((item) => item !== featured && !side.includes(item));
  const radar = data?.radar;
  return (
    <div className="page-shell">
      <Header eyebrow="Live wire" title="News Hub" description="Headlines across gaming, anime, movies and shows — aggregated from trusted feeds and refreshed every 15 minutes." />
      <div className="news-tabs">{TABS.map((entry) => <button key={entry.key} className={`news-tab ${active === entry.key ? 'active' : ''}`} onClick={() => { setActive(entry.key); setSourceFilter('All'); }}>{entry.label}<b>{data?.[entry.key]?.items?.length ?? '…'}</b></button>)}</div>
      <div className="section-heading" style={{ marginBottom: 18 }}><div><span className="eyebrow">{tab.label} news</span><p>{tab.description}</p><div className="source-row">{(feed.sources || []).map((source) => <span className={`source-pill ${source.ok ? '' : 'off'}`} key={source.name}><i />{source.name}</span>)}{feed.updatedAt && <span className="source-pill" style={{ borderStyle: 'dashed' }}>Refreshed {timeAgo(feed.updatedAt)}</span>}</div></div>{sources.length > 2 && <div className="archive-toolbar" style={{ margin: 0 }}>{sources.map((source) => <button key={source} className={`chip ${sourceFilter === source ? 'active' : ''}`} onClick={() => setSourceFilter(source)}>{source}</button>)}</div>}</div>
      {error && <div className="error-message">News feeds are temporarily unavailable.</div>}
      {loading ? <div className="news-layout"><div className="skeleton" style={{ minHeight: 460 }} /><div className="news-side">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="skeleton" style={{ height: 88 }} />)}</div></div> : featured ? (<>
        <div className="news-layout fade-up"><NewsFeatured item={featured} category={tab.category} /><div className="news-side">{side.map((item) => <NewsMini key={item.id} item={item} category={tab.category} />)}</div></div>
        {rest.length > 0 && <div className="news-grid">{rest.map((item) => <NewsCard key={item.id} item={item} category={tab.category} />)}</div>}
      </>) : <div className="empty-state">No headlines available right now.</div>}
      {active === 'screen' && radar?.configured && radar.items?.length > 0 && <section className="trend-section"><div className="section-heading"><div><span className="eyebrow">TMDB release radar</span><h2>Now playing & upcoming</h2></div></div><div className="news-grid">{radar.items.map((item) => <NewsCard key={item.id} item={item} category="movies" />)}</div></section>}
      {active === 'screen' && radar && !radar.configured && <div className="connect-panel panel" style={{ marginTop: 28 }}><div><span className="eyebrow purple">Optional</span><h3>Add TMDB for a release radar</h3><p>With a <code>TMDB_API_KEY</code> configured this page also shows now-playing and upcoming films with posters and synopses.</p></div><a className="btn btn-ghost btn-sm" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">Get a TMDB key</a></div>}
    </div>
  );
}
