'use client';

import Link from 'next/link';
import { useState } from 'react';
import Poster from './Poster';
import { CATEGORY_META } from '../lib/data';

function statusBadge(status) {
  if (!status) return 'ARCHIVED';
  if (status.includes('Owned')) return 'OWNED';
  if (status.includes('Want')) return 'WISHLIST';
  if (status.includes('Progress') || status.includes('Watched')) return 'WATCHED';
  return status.toUpperCase();
}

export default function CaseCard({ title, compact = false, interactive = true }) {
  const [flipped, setFlipped] = useState(false);
  const meta = CATEGORY_META[title.category] || CATEGORY_META.games;
  const detailHref = `/${title.category}/${title.slug}`;
  const rating = title.rating_external_num;
  return (
    <div className={`case ${title.hall_of_fame ? 'hof' : ''} ${flipped ? 'flipped' : ''}`} onClick={() => interactive && setFlipped((value) => !value)} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined} onKeyDown={(event) => { if (interactive && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setFlipped((value) => !value); } }} aria-label={`${title.title} card`}>
      <div className="case-inner">
        <div className="case-front">
          <Poster src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} label={meta.label} compact />
          <div className="scrim" />
          {title.hall_of_fame && <div className="case-ribbon">HALL OF FAME</div>}
          <span className="case-badge">{statusBadge(title.status)}</span>
          {rating ? <div className="case-rating">{rating}</div> : null}
          <div className="case-text"><div className="case-title">{title.title}</div><div className="case-sub">{title.genre?.[0] || meta.label}{title.release_year ? ` · ${title.release_year}` : ''}</div></div>
        </div>
        <div className="case-back">
          <span className="eyebrow">{meta.label}{title.language ? ` · ${title.language}` : ''}</span>
          <div className="cb-title">{title.title}</div>
          <div className="cb-summary">{title.summary || 'No summary logged yet.'}</div>
          {title.famous_quote && <div className="cb-quote">“{title.famous_quote}”</div>}
          <Link href={detailHref} className="cb-link" onClick={(event) => event.stopPropagation()}>View full entry →</Link>
        </div>
      </div>
    </div>
  );
}
