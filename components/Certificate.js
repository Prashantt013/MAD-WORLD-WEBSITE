'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORY_META } from '../lib/data';

export default function Certificate({ title }) {
  const meta = CATEGORY_META[title.category] || CATEGORY_META.games;
  const [today, setToday] = useState('');
  useEffect(() => { setToday(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })); }, []);
  return (
    <div className="cert-wrap">
      <div className="cert-actions no-print"><button className="btn btn-primary" onClick={() => window.print()}>Print / Save as PDF</button><Link href={`/${title.category}/${title.slug}`} className="btn btn-ghost">Back to entry</Link></div>
      <div className="certificate" style={{ '--cat-color': meta.color }}>
        <div className="cert-border">
          <div className="cert-eyebrow">MAD WORLD ARCHIVE</div>
          <div className="cert-seal">🎖</div>
          <h1>{title.title}</h1>
          <div className="cert-category">{meta.label}{title.language ? ` · ${title.language}` : ''}</div>
          {title.hall_of_fame && <div className="cert-hof">Hall of Fame Inductee</div>}
          <div className="cert-divider" />
          <p className="cert-statement">This certifies that <strong>{title.title}</strong> has been formally catalogued into the MAD WORLD personal entertainment archive{title.status ? `, with a status of “${title.status}”` : ''}.</p>
          {title.famous_quote && <p className="cert-quote">&ldquo;{title.famous_quote}&rdquo;</p>}
          {title.why_in_madworld && <p className="cert-why">{title.why_in_madworld}</p>}
          <div className="cert-footer">
            <div><div className="cert-label">Curator</div><div className="cert-value">Prashant</div></div>
            <div><div className="cert-label">Rating</div><div className="cert-value">{title.personal_rating ? `${title.personal_rating}/10` : title.rating_external || '—'}</div></div>
            <div><div className="cert-label">Certified</div><div className="cert-value">{today || '—'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
