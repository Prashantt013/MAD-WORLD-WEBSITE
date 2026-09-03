'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Poster from '../Poster';
import { Header } from './archive';
import { useArchive } from '../../lib/useArchive';
import { CATEGORY_META } from '../../lib/data';
import { CATEGORY_COLORS, formatDate, getDistribution, getFranchises, getGenres, getGrowth, getHallOfFameStats, getRecentlyAdded } from '../../lib/analytics';

function useMounted() { const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []); return mounted; }

function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame; const start = performance.now(); const from = 0;
    const step = (now) => { const progress = Math.min(1, (now - start) / duration); const eased = 1 - Math.pow(1 - progress, 3); setValue(Math.round(from + (target - from) * eased)); if (progress < 1) frame = requestAnimationFrame(step); };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function StatCard({ label, value, hint, tone }) {
  const shown = useCountUp(value || 0);
  return <div className={`stat-card panel tone-${tone}`}><span>{label}</span><strong style={{ color: tone === 'total' ? '#fff' : CATEGORY_COLORS[tone] || 'var(--gold)' }}>{shown}</strong><small>{hint}</small></div>;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip">{label && <div style={{ marginBottom: 6, color: 'var(--muted)' }}>{label}</div>}{payload.map((entry) => <div key={entry.name}>{entry.name}: <b>{entry.value}</b></div>)}</div>;
}

export function StatsPage() {
  const archive = useArchive();
  const mounted = useMounted();
  const stats = archive.stats;
  const titles = archive.titles;
  const total = stats.total || titles.length;
  const distribution = getDistribution(stats);
  const growth = getGrowth(titles);
  const franchises = getFranchises(titles, archive.characters, 8);
  const genres = getGenres(titles, 16);
  const hof = getHallOfFameStats(titles);
  const recent = getRecentlyAdded(archive, 8);
  const maxGenre = genres[0]?.count || 1;
  const maxFranchise = franchises[0]?.score || 1;
  return (
    <div className="page-shell">
      <Header eyebrow="The numbers behind the obsession" title="MAD WORLD Stats" description="A living snapshot of the archive: what fills the shelves, how it grew, which worlds keep pulling you back, and what earned the gold border.">
        <div className="source-row" style={{ marginTop: 18 }}><span className="source-pill"><i />Live from the archive</span>{stats.custom > 0 && <span className="source-pill"><i />{stats.custom} entries added via Archive</span>}</div>
      </Header>

      <div className="stats-hero fade-up d1">
        <StatCard label="Total titles" value={total} hint="Across every shelf" tone="total" />
        <StatCard label="Games" value={stats.games} hint="Played & wishlisted" tone="games" />
        <StatCard label="Anime" value={stats.anime} hint="Series tracked" tone="anime" />
        <StatCard label="Shows" value={stats.shows} hint="English & Indian" tone="shows" />
        <StatCard label="Characters" value={stats.characters} hint="Profiles archived" tone="characters" />
        <StatCard label="Quotes" value={stats.quotes} hint="Lines saved" tone="quotes" />
        <StatCard label="Hall of Fame" value={stats.hallOfFame} hint={`${hof.share}% of the archive`} tone="hall" />
      </div>

      <div className="analytics-grid fade-up d2">
        <div className="analytics-card panel">
          <span className="eyebrow">Collection distribution</span><h2>Where the hours go</h2>
          <div className="chart-box">{mounted && <ResponsiveContainer width="100%" height="100%"><PieChart><defs>{distribution.map((slice) => <filter key={slice.key} id={`glow-${slice.key}`}><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>)}</defs><Pie data={distribution} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={3} stroke="rgba(10,7,19,0.9)" strokeWidth={2} cornerRadius={6}>{distribution.map((slice) => <Cell key={slice.key} fill={slice.color} filter={`url(#glow-${slice.key})`} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer>}</div>
          <div className="legend-list">{distribution.map((slice) => <div className="legend-item" key={slice.key} style={{ '--dot': slice.color }}><i />{slice.name}<b>{slice.value} · {Math.round((slice.value / Math.max(1, distribution.reduce((sum, item) => sum + item.value, 0))) * 100)}%</b></div>)}</div>
        </div>
        <div className="analytics-card panel">
          <span className="eyebrow">Archive growth timeline</span><h2>How the universe expanded</h2>
          <div className="chart-box">{mounted && <ResponsiveContainer width="100%" height="100%"><AreaChart data={growth} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}><defs><linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e5b95c" stopOpacity={0.55} /><stop offset="100%" stopColor="#e5b95c" stopOpacity={0} /></linearGradient><linearGradient id="gGames" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b7c" stopOpacity={0.5} /><stop offset="100%" stopColor="#ff6b7c" stopOpacity={0} /></linearGradient><linearGradient id="gAnime" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c084fc" stopOpacity={0.5} /><stop offset="100%" stopColor="#c084fc" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#6f6685', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#6f6685', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="total" name="Total" stroke="#e5b95c" strokeWidth={2.5} fill="url(#gTotal)" /><Area type="monotone" dataKey="games" name="Games" stroke="#ff6b7c" strokeWidth={1.5} fill="url(#gGames)" /><Area type="monotone" dataKey="anime" name="Anime" stroke="#c084fc" strokeWidth={1.5} fill="url(#gAnime)" /></AreaChart></ResponsiveContainer>}</div>
          <small style={{ color: 'var(--faint)', font: '10px var(--font-mono)', marginTop: 10 }}>Milestones follow the curated archive order; entries added through the Add page appear with real dates.</small>
        </div>
      </div>

      <div className="analytics-grid thirds fade-up d3">
        <div className="analytics-card panel">
          <span className="eyebrow">Most watched franchises</span><h2>The worlds you keep returning to</h2>
          <div className="rank-list">{franchises.map((franchise, index) => <div className="rank-row" key={franchise.name}><span className="n">{String(index + 1).padStart(2, '0')}</span><div className="poster-stack">{franchise.posters.slice(0, 2).map((title) => <Poster key={title.id} src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} compact />)}</div><div><strong>{franchise.name}</strong><small>{franchise.count} {franchise.count === 1 ? 'title' : 'titles'}{franchise.characters ? ` · ${franchise.characters} characters` : ''}</small><div className="bar-track"><i style={{ width: `${Math.max(8, (franchise.score / maxFranchise) * 100)}%`, '--bar': `linear-gradient(90deg, ${CATEGORY_COLORS[franchise.category] || '#c084fc'}, var(--gold))` }} /></div></div><span className="value">{franchise.count}</span></div>)}</div>
        </div>
        <div className="analytics-card panel">
          <span className="eyebrow">Most common genres</span><h2>The archive&rsquo;s taste profile</h2>
          <div className="genre-cloud">{genres.map((genre, index) => <Link href={`/search?q=${encodeURIComponent(genre.name)}`} className={`genre-tag ${index < 2 ? 'size-3' : index < 6 ? 'size-2' : ''}`} key={genre.name}>{genre.name}<b>{genre.count}</b></Link>)}</div>
          <div style={{ marginTop: 'auto', paddingTop: 22 }}>{genres.slice(0, 5).map((genre, index) => <div className="bar-row" key={genre.name}><div><span>{genre.name}</span><b>{genre.count}</b></div><div className="bar-track"><i style={{ width: `${(genre.count / maxGenre) * 100}%`, '--bar': index % 2 ? 'linear-gradient(90deg, var(--red), var(--gold))' : 'linear-gradient(90deg, var(--purple), var(--red))' }} /></div></div>)}</div>
        </div>
      </div>

      <div className="analytics-grid fade-up d4">
        <div className="analytics-card panel glow-gold">
          <span className="eyebrow">Hall of Fame statistics</span><h2>The gold standard</h2>
          <div className="mini-stats"><div className="mini-stat"><strong>{hof.total}</strong><span>Inducted</span></div><div className="mini-stat"><strong>{hof.share}%</strong><span>Of the archive</span></div><div className="mini-stat"><strong>{hof.avg ?? '—'}</strong><span>Avg. rating</span></div></div>
          {hof.byCategory.map((entry) => <div className="bar-row" key={entry.category} style={{ marginTop: 12 }}><div><span>{CATEGORY_META[entry.category]?.label || entry.category}</span><b>{entry.count}</b></div><div className="bar-track"><i style={{ width: `${(entry.count / Math.max(1, hof.total)) * 100}%`, '--bar': `linear-gradient(90deg, ${CATEGORY_COLORS[entry.category]}, var(--gold))` }} /></div></div>)}
          <div className="rank-list" style={{ marginTop: 22 }}>{hof.top.map((title, index) => <Link href={`/${title.category}/${title.slug}`} className="rank-row" key={`${title.category}-${title.id}`}><span className="n">#{index + 1}</span><Poster src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} compact /><div><strong>{title.title}</strong><small>{CATEGORY_META[title.category]?.label} · {title.rating_external || 'Unrated'}</small></div><span className="value" style={{ color: 'var(--gold)' }}>{title.rating_external_num || '★'}</span></Link>)}</div>
        </div>
        <div className="analytics-card panel">
          <span className="eyebrow">Recently added titles</span><h2>Fresh on the shelf</h2>
          <div className="recent-list">{recent.map((item) => <Link href={item.kind === 'character' || item.name && !item.title ? `/characters/${item.slug}` : `/${item.category}/${item.slug}`} className="recent-row" key={`${item.category || 'character'}-${item.id}`}><Poster src={item.cover_url} fallback={item.local_cover} title={item.title || item.name} category={item.category || 'characters'} compact /><div><strong>{item.title || item.name}</strong><small>{CATEGORY_META[item.category]?.label || 'Character'}{item.status ? ` · ${item.status}` : ''}</small></div><time>{item.date_added ? formatDate(item.date_added) : 'Archive'}</time></Link>)}</div>
          <Link href="/add" className="btn btn-primary" style={{ marginTop: 22, alignSelf: 'flex-start' }}>Add a new title</Link>
        </div>
      </div>
    </div>
  );
}
