'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import Poster from '../Poster';
import { Header } from './archive';
import { useLive } from '../../lib/useArchive';

const TRACKS = [
  { key: 'goty', href: '/history/goty', category: 'games', accent: 'Games' },
  { key: 'anime', href: '/history/anime-of-the-year', category: 'anime', accent: 'Anime' },
  { key: 'tv', href: '/history/tv-show-of-the-year', category: 'shows', accent: 'Television' },
  { key: 'movies', href: '/history/movie-of-the-year', category: 'movies', accent: 'Film' },
];
export const HISTORY_ROUTES = { goty: 'goty', 'anime-of-the-year': 'anime', 'tv-show-of-the-year': 'tv', 'movie-of-the-year': 'movies', 'english-shows': 'tv', 'indian-shows': 'tv', movies: 'movies' };

export function HistoryHubPage() {
  const { data, loading } = useLive('/api/awards');
  return (
    <div className="page-shell">
      <Header eyebrow="The long view" title="Award History" description="Real winners, year by year: The Game Awards, the Crunchyroll Anime Awards, the Primetime Emmys and the Academy Awards." />
      <div className="history-hub-grid">{TRACKS.map((track, index) => { const info = data?.tracks?.[track.key]; const latest = info?.winners?.[0]; return <Link href={track.href} key={track.key} className="history-hub-card fade-up" style={{ animationDelay: `${index * 0.08}s` }}>{latest && <Poster src={latest.poster} title={latest.title} category={track.category} contain={latest.logo} />}<span className="history-index">0{index + 1} · {track.accent}</span><h2>{info?.label || (loading ? '…' : track.accent)}</h2><p>{info?.description || ''}</p>{latest && <div className="latest"><Award size={12} color="var(--gold)" /> Latest: <b>{latest.title}</b> · {latest.year}</div>}<span className="text-link">Open timeline →</span></Link>; })}</div>
    </div>
  );
}

export function HistoryTrackPage({ track }) {
  const meta = TRACKS.find((entry) => entry.key === track) || TRACKS[0];
  const { data, loading } = useLive(`/api/awards?track=${meta.key}`);
  const info = data?.tracks?.[meta.key];
  const winners = info?.winners || [];
  const [decade, setDecade] = useState('All');
  const decades = ['All', ...new Set(winners.map((winner) => `${Math.floor(winner.year / 10) * 10}s`))];
  const shown = winners.filter((winner) => decade === 'All' || `${Math.floor(winner.year / 10) * 10}s` === decade);
  return (
    <div className="page-shell">
      <Link href="/history" className="back-link">← All award tracks</Link>
      <Header eyebrow={info?.award || 'Award history'} title={info?.label || meta.accent} description={info?.description} />
      {decades.length > 2 && <div className="archive-toolbar">{decades.map((item) => <button key={item} className={`chip ${decade === item ? 'active' : ''}`} onClick={() => setDecade(item)}>{item === 'All' ? 'Every year' : item}</button>)}</div>}
      {loading ? <div className="timeline">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeleton" style={{ height: 240, marginBottom: 22 }} />)}</div> : (
        <div className="timeline">{shown.map((winner, index) => (
          <article className="timeline-item panel fade-up" key={`${winner.year}-${winner.title}`} style={{ animationDelay: `${Math.min(index, 6) * 0.06}s` }}>
            <span className="timeline-year">{winner.year}</span>
            <Poster src={winner.poster} title={winner.title} category={meta.category} label={String(winner.year)} contain={winner.logo} loading={index < 3 ? 'eager' : 'lazy'} />
            <div className="timeline-copy">
              <div className="row"><span className="year-big">{winner.year}</span><span className="badge gold"><Award size={11} /> {winner.category}</span></div>
              <h3>{winner.title}</h3>
              <div className="row"><span className="pill ghost">{info?.award}</span>{winner.studio && <span className="pill ghost">{winner.studio}</span>}</div>
              <p>{winner.description}</p>
              {winner.url && <a href={winner.url} target="_blank" rel="noreferrer" className="text-link">Read more <ExternalLink size={11} /></a>}
            </div>
          </article>
        ))}</div>
      )}
    </div>
  );
}
