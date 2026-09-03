'use client';

import Poster from './Poster';
import { timeAgo } from '../lib/analytics';

export function NewsCard({ item, category }) {
  return (
    <a className="news-card" href={item.link} target="_blank" rel="noreferrer">
      <Poster src={item.image} title={item.title} category={category} label={item.source} compact />
      <div className="news-body">
        <div className="news-kicker"><b>{item.source}</b>{item.label && <span className="badge purple" style={{ padding: '3px 6px' }}>{item.label}</span>}</div>
        <h3>{item.title}</h3>
        {item.summary && <p>{item.summary}</p>}
        <footer><span>{timeAgo(item.date)}</span><span>Read →</span></footer>
      </div>
    </a>
  );
}

export function NewsMini({ item, category }) {
  return (
    <a className="news-mini" href={item.link} target="_blank" rel="noreferrer">
      <Poster src={item.image} title={item.title} category={category} label={item.source} compact />
      <div><div className="news-kicker"><b>{item.source}</b><span>{timeAgo(item.date)}</span></div><h3>{item.title}</h3></div>
    </a>
  );
}

export function NewsFeatured({ item, category }) {
  return (
    <a className="news-featured" href={item.link} target="_blank" rel="noreferrer">
      <Poster src={item.image} title={item.title} category={category} label={item.source} loading="eager" />
      <div className="news-copy"><div className="news-kicker"><span className="badge red">Top story</span><b>{item.source}</b><span>{timeAgo(item.date)}</span></div><h2>{item.title}</h2>{item.summary && <p>{item.summary}</p>}<span className="text-link">Read the full story →</span></div>
    </a>
  );
}
