'use client';

import { Star } from 'lucide-react';
import Poster from './Poster';
import { formatDate } from '../lib/analytics';

const CATEGORY_BY_SOURCE = { Steam: 'games', RAWG: 'games', IGDB: 'games', MyAnimeList: 'anime', AniList: 'anime', TMDB: 'movies' };

export default function LiveCard({ item }) {
  const category = CATEGORY_BY_SOURCE[item.source] || 'default';
  const body = (
    <>
      <Poster src={item.poster} fallback={item.backdrop} title={item.title} category={category} label={item.source} />
      <span className="badge live-source">{item.source}</span>
      {item.rating ? <span className="live-rating"><Star size={10} fill="currentColor" /> {Number(item.rating).toFixed(1)}</span> : null}
      <div className="live-body">
        <h3>{item.title}</h3>
        <div className="live-meta">{[item.date ? formatDate(item.date) : null, item.meta].filter(Boolean).join(' · ')}</div>
        {item.ratingLabel && <div className="live-rating-label">{item.ratingLabel}</div>}
        {item.genres?.length ? <div className="live-genres">{item.genres.map((genre) => <span key={genre}>{genre}</span>)}</div> : null}
      </div>
    </>
  );
  return item.url ? <a className="live-card" href={item.url} target="_blank" rel="noreferrer">{body}</a> : <div className="live-card">{body}</div>;
}
