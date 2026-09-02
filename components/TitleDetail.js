import Link from 'next/link';
import CaseCard from './CaseCard';
import PosterThumb from './PosterThumb';
import { CATEGORY_META } from '../lib/data';

export default function TitleDetail({ title, characters, related, quotes }) {
  const meta = CATEGORY_META[title.category];

  return (
    <div className="page-shell">
      <Link href={meta.path} className="back-link">
        ← Back to {meta.label}
      </Link>

      <div className="detail-hero" style={{ '--cat-color': meta.color }}>
        <div className="hero-poster">
          <PosterThumb src={title.cover_url} alt={title.title} color={meta.color} />
        </div>
        <div className="hero-content">
          {title.hall_of_fame && <div className="hof-tag">🏆 Hall of Fame</div>}
          <div className="eyebrow">
            {meta.label}
            {title.language ? ` · ${title.language}` : ''}
          </div>
          <h1>{title.title}</h1>
          <div className="meta-row">
            {title.status && <span className="pill">{title.status}</span>}
            {title.rating_external && <span className="pill">{title.rating_external}</span>}
            {title.season && <span className="pill">{title.season}</span>}
            {title.episode_count && <span className="pill">{title.episode_count}</span>}
            {title.genre?.map((g) => (
              <span className="pill ghost" key={g}>{g}</span>
            ))}
          </div>
        </div>
      </div>

      <Link href={`/certificate/${title.category}/${title.slug}`} className="cert-link">
        🎖 Get Archive Certificate
      </Link>

      <div className="detail-body">
        <div className="main-col">
          {title.summary && (
            <section>
              <h3>Summary</h3>
              <p>{title.summary}</p>
            </section>
          )}
          {title.famous_quote && (
            <section>
              <h3>Famous Quote</h3>
              <p className="quote">“{title.famous_quote}”</p>
            </section>
          )}
          {title.prashant_note && (
            <section>
              <h3>Prashant&rsquo;s Note</h3>
              <p>{title.prashant_note}</p>
            </section>
          )}
          {title.why_in_madworld && (
            <section>
              <h3>Why It&rsquo;s In MAD WORLD</h3>
              <p>{title.why_in_madworld}</p>
            </section>
          )}
          {!title.summary && !title.famous_quote && !title.prashant_note && (
            <p className="empty-note">
              This entry is still waiting on Summary / Quote / Prashant&rsquo;s Note — add them to the
              source sheet and they&rsquo;ll show up here automatically.
            </p>
          )}
        </div>

        <div className="side-col">
          <div className="rating-box">
            <div className="rating-label">Personal Rating</div>
            <div className="rating-value">
              {title.personal_rating ? `${title.personal_rating}/10` : '— / 10'}
            </div>
            {!title.personal_rating && (
              <div className="rating-hint">Not rated yet</div>
            )}
          </div>
        </div>
      </div>

      {characters?.length > 0 && (
        <section className="related-section">
          <h3>Characters From This Title</h3>
          <div className="char-row">
            {characters.map((c) => (
              <Link key={c.id} href={`/characters/${c.slug}`} className="char-chip">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {related?.length > 0 && (
        <section className="related-section">
          <h3>More Like This</h3>
          <div className="grid">
            {related.map((t) => (
              <CaseCard key={t.id} title={t} />
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .back-link {
          font-family: 'JetBrains Mono'; font-size: 12px; color: var(--ash);
          display: inline-block; margin-bottom: 24px;
        }
        .back-link:hover { color: var(--bone); }
        .cert-link {
          display: inline-block; font-family: 'JetBrains Mono'; font-size: 12px; color: var(--gold);
          border: 1px solid var(--gold); padding: 8px 16px; border-radius: 16px; margin-bottom: 24px;
        }
        .cert-link:hover { background: rgba(201,162,39,0.1); }

        .detail-hero {
          display: flex; gap: 32px; align-items: flex-end;
          border-radius: 16px; padding: 40px;
          background: linear-gradient(135deg, var(--cat-color) 0%, #0a0a0c 85%);
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 40px;
        }
        .hero-poster { flex: 0 0 180px; aspect-ratio: 2 / 3; }
        .hero-content { flex: 1; min-width: 0; }
        @media (max-width: 700px) {
          .detail-hero { flex-direction: column; align-items: flex-start; }
          .hero-poster { flex: 0 0 auto; width: 140px; }
        }
        .hof-tag {
          display: inline-block; font-family: 'JetBrains Mono'; font-size: 11px;
          color: #1a1400; background: var(--gold); padding: 4px 12px; border-radius: 12px;
          margin-bottom: 16px; font-weight: 700;
        }
        .eyebrow {
          font-family: 'JetBrains Mono'; font-size: 12px; letter-spacing: 0.15em;
          color: rgba(255,255,255,0.7); text-transform: uppercase; margin-bottom: 8px;
        }
        .detail-hero h1 { font-size: clamp(36px, 6vw, 64px); color: #fff; text-shadow: 2px 2px 0 rgba(0,0,0,0.3); }
        .meta-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
        .pill {
          font-family: 'JetBrains Mono'; font-size: 11px; padding: 6px 12px; border-radius: 14px;
          background: rgba(0,0,0,0.4); color: #fff; border: 1px solid rgba(255,255,255,0.2);
        }
        .pill.ghost { background: transparent; }

        .detail-body { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; }
        .main-col section { margin-bottom: 32px; }
        .main-col h3 { font-size: 20px; color: var(--gold); margin-bottom: 10px; letter-spacing: 0.03em; }
        .main-col p { color: var(--ash); line-height: 1.7; font-size: 14px; }
        .quote { font-style: italic; color: var(--bone); border-left: 2px solid var(--gold); padding-left: 14px; }
        .empty-note {
          color: var(--ash); font-family: 'JetBrains Mono'; font-size: 12px;
          border: 1px dashed var(--line); padding: 20px; border-radius: 8px;
        }

        .rating-box {
          border: 1px solid var(--line); border-radius: 12px; padding: 24px; text-align: center;
          background: var(--void2);
        }
        .rating-label { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--ash); text-transform: uppercase; letter-spacing: 0.1em; }
        .rating-value { font-family: 'Bebas Neue'; font-size: 40px; color: var(--gold); margin-top: 8px; }
        .rating-hint { font-family: 'JetBrains Mono'; font-size: 10px; color: var(--ash); margin-top: 4px; }

        .related-section { margin-top: 56px; }
        .related-section h3 { font-size: 24px; color: var(--bone); margin-bottom: 20px; }
        .char-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .char-chip {
          font-family: 'JetBrains Mono'; font-size: 12px; color: var(--bone);
          border: 1px solid var(--line); padding: 8px 16px; border-radius: 16px; background: var(--panel);
        }
        .char-chip:hover { border-color: var(--blood); }

        @media (max-width: 800px) {
          .detail-body { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
