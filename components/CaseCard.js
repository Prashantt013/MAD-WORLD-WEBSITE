'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORY_META } from '../lib/data';

function statusBadge(status) {
  if (!status) return '';
  if (status.includes('Owned')) return 'OWNED';
  if (status.includes('Want')) return 'WISHLIST';
  if (status.includes('Progress')) return 'WATCHED';
  return status.toUpperCase();
}

export default function CaseCard({ title }) {
  const [flipped, setFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const meta = CATEGORY_META[title.category];
  const detailHref = `/${title.category}/${title.slug}`;
  const rating = title.rating_external_num;
  const hasImage = title.cover_url && !imgError;

  return (
    <div
      className={`case ${title.hall_of_fame ? 'hof' : ''} ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="case-inner">
        <div
          className="case-front"
          style={{ '--cat-color': meta.color }}
        >
          {hasImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={title.cover_url}
              alt={title.title}
              className="poster-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
          <div className={`scrim ${hasImage ? '' : 'scrim-solid'}`} />
          {title.hall_of_fame && <div className="case-ribbon">HALL OF FAME</div>}
          <span className="case-badge">{statusBadge(title.status)}</span>
          {rating && <div className="case-rating">{rating}</div>}
          <div className="case-text">
            <div className="case-title">{title.title}</div>
            <div className="case-sub">{title.genre[0] || meta.label}</div>
          </div>
        </div>
        <div className="case-back">
          <div className="cb-title">{title.title}</div>
          <div className="cb-summary">
            {title.summary || 'No summary logged yet.'}
          </div>
          {title.famous_quote && <div className="cb-quote">“{title.famous_quote}”</div>}
          <Link href={detailHref} className="cb-link" onClick={(e) => e.stopPropagation()}>
            View full entry →
          </Link>
        </div>
      </div>

      <style jsx>{`
        .case {
          position: relative; width: 100%; height: 290px;
          perspective: 1200px; cursor: pointer;
        }
        .case-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(.2,.8,.2,1);
        }
        .case.flipped .case-inner { transform: rotateY(180deg); }
        .case-front, .case-back {
          position: absolute; inset: 0; backface-visibility: hidden;
          border-radius: 8px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 12px 28px rgba(0,0,0,0.5);
        }
        .case-front {
          background: linear-gradient(160deg, var(--cat-color, var(--blood)) 0%, #0a0a0c 78%);
          display: flex; flex-direction: column; justify-content: flex-start;
          padding: 12px;
        }
        .poster-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
        }
        .scrim {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.85) 100%);
        }
        .scrim-solid { background: transparent; }
        .case.hof .case-front {
          border: 2px solid var(--gold);
          box-shadow: 0 0 0 1px var(--gold), 0 12px 28px rgba(0,0,0,0.5);
        }
        .case.hof .case-badge { margin-left: 40px; }
        .case-badge {
          position: relative; z-index: 2; align-self: flex-start;
          font-family: 'JetBrains Mono'; font-size: 9px; letter-spacing: 0.08em;
          background: rgba(0,0,0,0.5); color: var(--bone);
          padding: 4px 8px; border-radius: 3px; text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .case-rating {
          position: absolute; top: 12px; right: 12px; z-index: 2;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono'; font-size: 10px; font-weight: 700; color: var(--gold);
        }
        .case-text {
          position: relative; z-index: 2; margin-top: auto;
        }
        .case-title { font-family: 'Bebas Neue'; font-size: 22px; line-height: 0.98; color: #fff; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }
        .case-sub { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.75); margin-top: 6px; }
        .case-ribbon {
          position: absolute; top: 18px; left: -34px; z-index: 2; transform: rotate(-45deg);
          width: 130px; text-align: center; background: var(--gold); color: #1a1400;
          font-family: 'JetBrains Mono'; font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
          padding: 3px 0; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        .case-back {
          background: var(--panel); transform: rotateY(180deg);
          padding: 16px; display: flex; flex-direction: column; justify-content: flex-start; gap: 8px;
        }
        .cb-title { font-family: 'Bebas Neue'; font-size: 18px; color: var(--bone); }
        .cb-summary { font-size: 11px; color: var(--ash); line-height: 1.5; max-height: 110px; overflow-y: auto; }
        .cb-quote { font-size: 11px; font-style: italic; color: var(--gold); border-left: 2px solid var(--gold); padding-left: 8px; }
        .cb-link {
          margin-top: auto; font-family: 'JetBrains Mono'; font-size: 10px; color: var(--ember);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .cb-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
