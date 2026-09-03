'use client';

import { useEffect, useState } from 'react';

const PALETTES = {
  games: ['#b3122c', '#3b0a2a'], anime: ['#7c3aed', '#2a0f4d'], shows: ['#3556d4', '#141a4d'], movies: ['#a8478f', '#3a0d3a'], horror: ['#8a2c14', '#2a0a0a'], characters: ['#0f8f7a', '#0a2a2f'], news: ['#4c1d95', '#1a0f2e'], default: ['#5b21b6', '#2a0f2a'],
};

/**
 * Poster with a strict fallback chain:
 *   1. remote poster URL from the master sheet / API
 *   2. local poster file shipped with the project
 *   3. generated gradient title card (never a wrong poster)
 *
 * The gradient card always renders underneath the image, so there is no
 * flash of empty space while loading and no dependency on onLoad timing
 * (which can fire before hydration for server-rendered images).
 */
export default function Poster({ src, fallback, title, category = 'default', label, className = '', compact = false, contain = false, loading = 'lazy' }) {
  const sources = [src, fallback].filter((value) => typeof value === 'string' && value.trim());
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [src, fallback]);
  const current = sources[index];
  const [a, b] = PALETTES[category] || PALETTES.default;
  const initial = (title || '?').trim().charAt(0).toUpperCase();
  return (
    <div className={`poster-frame ${className}`} aria-label={title}>
      <div className={`title-card ${compact || current ? 'compact' : ''}`} style={{ '--card-a': a, '--card-b': b }} data-initial={initial}>{!current && <><span>{label || category}</span><strong>{title}</strong></>}</div>
      {current && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={current} src={current} alt={title || ''} loading={loading} referrerPolicy="no-referrer" className={contain ? 'contain' : ''} onError={() => setIndex((value) => value + 1)} />
      )}
    </div>
  );
}
