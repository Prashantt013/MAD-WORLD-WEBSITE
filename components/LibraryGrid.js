'use client';

import { useMemo, useState } from 'react';
import CaseCard from './CaseCard';

export default function LibraryGrid({ titles, statusOptions, extraFilter }) {
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const [extra, setExtra] = useState('All');

  const filtered = useMemo(() => {
    let items = titles;
    if (status !== 'All') items = items.filter((t) => t.status === status);
    if (extraFilter && extra !== 'All') {
      items = items.filter(
  (t) => t[extraFilter.field] === extra
);
    }
    if (q.trim()) {
      const term = q.trim().toLowerCase();
      items = items.filter((t) => t.title.toLowerCase().includes(term));
    }
    return items;
  }, [titles, status, q, extra]);

  return (
    <div>
      <div className="filter-row">
        <button
          className={`chip ${status === 'All' ? 'active' : ''}`}
          onClick={() => setStatus('All')}
        >
          All
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            className={`chip ${status === s ? 'active' : ''}`}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}

        {extraFilter && (
          <>
            <span className="divider" />
            <button
              className={`chip ${extra === 'All' ? 'active' : ''}`}
              onClick={() => setExtra('All')}
            >
              {extraFilter.allLabel}
            </button>
            {extraFilter.options.map((o) => (
              <button
                key={o}
                className={`chip ${extra === o ? 'active' : ''}`}
                onClick={() => setExtra(o)}
              >
                {o}
              </button>
            ))}
          </>
        )}

        <div className="lib-search">
          <span className="mono" style={{ fontSize: 12, color: 'var(--ash)' }}>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter this shelf..."
          />
        </div>
      </div>

      <div className="count-tag">
        {filtered.length} title{filtered.length === 1 ? '' : 's'}
      </div>

      <div className="grid">
        {filtered.length === 0 && <div className="empty-msg">No titles match this filter.</div>}
        {filtered.map((t) => (
          <CaseCard key={t.id} title={t} />
        ))}
      </div>

      <style jsx>{`
        .filter-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 24px; }
        .divider { width: 1px; height: 20px; background: var(--line); margin: 0 6px; }
        .chip {
          font-family: 'JetBrains Mono'; font-size: 11px; padding: 6px 14px; border-radius: 16px;
          border: 1px solid var(--line); color: var(--ash); cursor: pointer; background: var(--void2);
          transition: all .2s;
        }
        .chip.active { background: rgba(166,24,44,0.15); border-color: var(--blood); color: var(--bone); }
        .lib-search {
          margin-left: auto; display: flex; align-items: center; gap: 8px;
          background: var(--panel); border: 1px solid var(--line); border-radius: 20px; padding: 8px 16px; min-width: 200px;
        }
        .lib-search input { background: none; border: none; outline: none; color: var(--bone); font-size: 13px; width: 100%; font-family: 'Inter'; }
        .count-tag { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--ash); margin-top: 20px; }
        .empty-msg { color: var(--ash); font-family: 'JetBrains Mono'; font-size: 13px; padding: 40px 0; text-align: center; grid-column: 1/-1; }
      `}</style>
    </div>
  );
}
