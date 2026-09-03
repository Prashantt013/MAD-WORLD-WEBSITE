'use client';

import Link from 'next/link';
import { Award, ChevronLeft } from 'lucide-react';
import CaseCard from './CaseCard';
import Poster from './Poster';
import { CATEGORY_META } from '../lib/data';

export default function TitleDetail({ title, characters = [], related = [], quotes = [] }) {
  const meta = CATEGORY_META[title.category] || CATEGORY_META.games;
  const heroImage = title.cover_url || title.local_cover;
  return (
    <div className="page-shell">
      <Link href={meta.path} className="back-link"><ChevronLeft size={14} /> Back to {meta.label}</Link>
      <div className="detail-hero" style={{ '--cat-color': meta.color, '--hero-image': heroImage ? `url(${heroImage})` : 'none' }}>
        <div className="hero-poster"><Poster src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} label={meta.label} loading="eager" /></div>
        <div className="hero-content">
          {title.hall_of_fame && <span className="badge gold" style={{ marginBottom: 14 }}><Award size={11} /> Hall of Fame</span>}
          <div className="eyebrow">{meta.label}{title.language ? ` · ${title.language}` : ''}{title.release_year ? ` · ${title.release_year}` : ''}</div>
          <h1>{title.title}</h1>
          <div className="meta-row">
            {title.status && <span className="pill">{title.status}</span>}
            {title.rating_external && <span className="pill gold">{title.rating_external}</span>}
            {title.season && <span className="pill">{title.season}</span>}
            {title.episode_count && <span className="pill">{typeof title.episode_count === 'number' ? `${title.episode_count} episodes` : title.episode_count}</span>}
            {title.genre?.map((genre) => <span className="pill ghost" key={genre}>{genre}</span>)}
          </div>
        </div>
      </div>
      <div className="detail-actions"><Link href={`/certificate/${title.category}/${title.slug}`} className="btn btn-ghost btn-sm">🎖 Archive certificate</Link><Link href={`/search?q=${encodeURIComponent(title.genre?.[0] || title.title)}`} className="btn btn-ghost btn-sm">Find similar</Link></div>
      <div className="detail-body">
        <div className="main-col">
          {title.summary && <section><h3>Summary</h3><p>{title.summary}</p></section>}
          {title.famous_quote && <section><h3>Famous Quote</h3><p className="quote">“{title.famous_quote}”</p></section>}
          {title.prashant_note && <section><h3>Prashant&rsquo;s Note</h3><p>{title.prashant_note}</p></section>}
          {title.why_in_madworld && <section><h3>Why It&rsquo;s In MAD WORLD</h3><p>{title.why_in_madworld}</p></section>}
          {title.favorite_character && <section><h3>Favourite Character</h3><p>{title.favorite_character}</p></section>}
          {title.favorite_moment && <section><h3>Favourite Moment</h3><p>{title.favorite_moment}</p></section>}
          {!title.summary && !title.famous_quote && !title.prashant_note && <p className="empty-note">This entry is still waiting on a summary, quote or Prashant&rsquo;s note. Add them in the master sheet or through the Add page and they will appear here automatically.</p>}
          {quotes.length > 0 && <section><h3>Lines from this title</h3>{quotes.map((quote) => <p className="quote" key={quote.id} style={{ marginBottom: 10 }}>“{quote.text}”</p>)}</section>}
        </div>
        <aside className="side-col">
          <div className="panel rating-box"><div className="rating-label">Personal rating</div><div className="rating-value">{title.personal_rating ? `${title.personal_rating}/10` : title.rating_external_num ? `${title.rating_external_num}` : '—'}</div><div className="rating-hint">{title.personal_rating ? 'Curator score' : title.rating_external ? title.rating_external : 'Not rated yet'}</div></div>
          <div className="panel"><span className="eyebrow">Entry facts</span><dl style={{ marginTop: 14 }}><dt>Category</dt><dd>{meta.label}</dd>{title.status && <><dt>Status</dt><dd>{title.status}</dd></>}{title.language && <><dt>Language</dt><dd>{title.language}</dd></>}{title.studio && <><dt>Studio</dt><dd>{title.studio}</dd></>}{title.release_year && <><dt>Released</dt><dd>{title.release_year}</dd></>}{title.character_count && <><dt>Characters</dt><dd>{title.character_count}</dd></>}{typeof title.up_to_date === 'boolean' && <><dt>Up to date</dt><dd>{title.up_to_date ? 'Yes' : 'Catching up'}</dd></>}{title.custom && <><dt>Source</dt><dd>Added via Archive</dd></>}</dl></div>
        </aside>
      </div>
      {characters.length > 0 && <section className="related-section"><h3>Characters from this title</h3><div className="char-row">{characters.map((character) => <Link key={character.id} href={`/characters/${character.slug}`} className="char-chip"><Poster src={character.cover_url} fallback={character.local_cover} title={character.name} category="characters" compact />{character.name}</Link>)}</div></section>}
      {related.length > 0 && <section className="related-section"><h3>More like this</h3><div className="archive-grid">{related.map((item) => <CaseCard key={`${item.category}-${item.id}`} title={item} />)}</div></section>}
    </div>
  );
}
