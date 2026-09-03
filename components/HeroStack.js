'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Poster from './Poster';
import { CATEGORY_META } from '../lib/data';

// Floating, auto-rotating poster stack for the home hero. Shows Hall of Fame
// entries first, then the highest rated games and anime.
export default function HeroStack({ titles = [] }) {
  const featured = useMemo(() => {
    const withPoster = titles.filter((title) => title.cover_url || title.local_cover);
    const hof = withPoster.filter((title) => title.hall_of_fame);
    const top = (category) => withPoster.filter((title) => title.category === category && !title.hall_of_fame).sort((a, b) => (b.rating_external_num || 0) - (a.rating_external_num || 0));
    const seen = new Set();
    return [...hof.slice(0, 6), ...top('games').slice(0, 3), ...top('anime').slice(0, 3)].filter((title) => !seen.has(`${title.category}-${title.id}`) && seen.add(`${title.category}-${title.id}`)).slice(0, 9);
  }, [titles]);
  const [active, setActive] = useState(0);
  useEffect(() => { if (featured.length < 2) return undefined; const timer = setInterval(() => setActive((value) => (value + 1) % featured.length), 4200); return () => clearInterval(timer); }, [featured.length]);
  if (!featured.length) return <div className="hero-stack"><div className="hero-stack-glow" /></div>;
  const count = featured.length;
  const position = (index) => { const offset = (index - active + count) % count; if (offset === 0) return 'pos-0'; if (offset === 1) return 'pos-2'; if (offset === count - 1) return 'pos-1'; if (offset === 2) return 'pos-4'; if (offset === count - 2) return 'pos-3'; return 'pos-hidden'; };
  const current = featured[active];
  return (
    <div className="hero-stack" aria-label="Featured titles">
      <div className="hero-stack-glow" />
      {featured.map((title, index) => (
        <Link key={`${title.category}-${title.id}`} href={`/${title.category}/${title.slug}`} className={`stack-card ${position(index)} ${title.hall_of_fame ? 'hof' : ''}`} tabIndex={index === active ? 0 : -1} aria-hidden={index !== active} onClick={(event) => { if (index !== active) { event.preventDefault(); setActive(index); } }}>
          <Poster src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} label={CATEGORY_META[title.category]?.label} compact loading={index < 3 ? 'eager' : 'lazy'} />
        </Link>
      ))}
      <div className="stack-caption"><span>{current.hall_of_fame ? 'Hall of Fame' : CATEGORY_META[current.category]?.label}{current.rating_external ? ` · ${current.rating_external}` : ''}</span><strong>{current.title}</strong><div className="stack-dots">{featured.map((title, index) => <button key={title.id} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show ${title.title}`} />)}</div></div>
    </div>
  );
}
