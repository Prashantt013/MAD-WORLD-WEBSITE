'use client';

import { CATEGORY_META } from '../lib/data';

export default function Certificate({ title }) {
  const meta = CATEGORY_META[title.category];
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="cert-wrap">
      <div className="cert-actions no-print">
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <div className="certificate" style={{ '--cat-color': meta.color }}>
        <div className="cert-border">
          <div className="cert-eyebrow">MAD WORLD ARCHIVE</div>
          <div className="cert-seal">🎖</div>
          <h1>{title.title}</h1>
          <div className="cert-category">{meta.label}{title.language ? ` · ${title.language}` : ''}</div>

          {title.hall_of_fame && <div className="cert-hof">Hall of Fame Inductee</div>}

          <div className="cert-divider" />

          <p className="cert-statement">
            This certifies that <strong>{title.title}</strong> has been formally catalogued
            into the MAD WORLD personal entertainment archive
            {title.status ? `, with a status of “${title.status}”` : ''}.
          </p>

          {title.famous_quote && (
            <p className="cert-quote">&ldquo;{title.famous_quote}&rdquo;</p>
          )}

          {title.why_in_madworld && (
            <p className="cert-why">{title.why_in_madworld}</p>
          )}

          <div className="cert-footer">
            <div>
              <div className="cert-label">Curator</div>
              <div className="cert-value">Prashant</div>
            </div>
            <div>
              <div className="cert-label">Rating</div>
              <div className="cert-value">
                {title.personal_rating ? `${title.personal_rating}/10` : title.rating_external || '—'}
              </div>
            </div>
            <div>
              <div className="cert-label">Certified</div>
              <div className="cert-value">{today}</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cert-wrap { max-width: 800px; margin: 120px auto 80px; padding: 0 24px; }
        .cert-actions { text-align: center; margin-bottom: 24px; }
        .certificate {
          background: linear-gradient(160deg, var(--cat-color) 0%, #0a0a0c 70%);
          border-radius: 4px; padding: 4px;
        }
        .cert-border {
          border: 2px solid var(--gold);
          padding: 56px 48px;
          text-align: center;
          background: rgba(10,10,12,0.55);
        }
        .cert-eyebrow {
          font-family: 'JetBrains Mono'; font-size: 12px; letter-spacing: 0.3em;
          color: var(--gold); margin-bottom: 16px;
        }
        .cert-seal { font-size: 40px; margin-bottom: 12px; }
        .certificate h1 {
          font-size: clamp(28px, 5vw, 48px); color: #fff; text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
        }
        .cert-category {
          font-family: 'JetBrains Mono'; font-size: 12px; color: rgba(255,255,255,0.7);
          text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;
        }
        .cert-hof {
          display: inline-block; margin-top: 16px; font-family: 'JetBrains Mono'; font-size: 11px;
          color: #1a1400; background: var(--gold); padding: 5px 14px; border-radius: 12px; font-weight: 700;
        }
        .cert-divider { width: 80px; height: 1px; background: var(--gold); margin: 28px auto; opacity: 0.5; }
        .cert-statement { color: var(--bone); font-size: 15px; line-height: 1.7; max-width: 520px; margin: 0 auto 20px; }
        .cert-quote { font-style: italic; color: var(--gold); font-size: 14px; margin-bottom: 20px; }
        .cert-why { color: rgba(236,228,216,0.7); font-size: 13px; line-height: 1.6; max-width: 480px; margin: 0 auto 20px; }
        .cert-footer {
          display: flex; justify-content: space-around; margin-top: 32px; padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.15);
        }
        .cert-label { font-family: 'JetBrains Mono'; font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; }
        .cert-value { font-family: 'Bebas Neue'; font-size: 20px; color: #fff; margin-top: 4px; }

        @media print {
          :global(nav), :global(footer), .no-print { display: none !important; }
          .cert-wrap { margin: 0; max-width: 100%; }
          .certificate { background: white; }
          .cert-border { background: white; border-color: #333; }
          .certificate h1, .cert-value { color: #111; text-shadow: none; }
          .cert-statement, .cert-why { color: #333; }
        }
      `}</style>
    </div>
  );
}
