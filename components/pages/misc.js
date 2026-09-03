'use client';

import Link from 'next/link';
import Poster from '../Poster';
import { Header } from './archive';
import { useArchive } from '../../lib/useArchive';
import { getFranchises, getHallOfFameStats } from '../../lib/analytics';

export function AchievementsPage() {
  const archive = useArchive();
  const stats = archive.stats;
  const hof = getHallOfFameStats(archive.titles);
  const franchises = getFranchises(archive.titles, archive.characters, 3);
  const achievements = [
    ['First Blood', 'Log your first game', stats.games, 1, '🎮'], ['Century Club', 'Collect 100 games', stats.games, 100, '⚔'], ['Anime Marathon', 'Collect 50 anime entries', stats.anime, 50, '✦'], ['Binge Architect', 'Collect 50 shows', stats.shows, 50, '▣'],
    ['Character Collector', 'Archive 100 characters', stats.characters, 100, '♛'], ['Quote Keeper', 'Save 100 quotes', stats.quotes, 100, '”'], ['Hall of Fame Curator', 'Induct 10 legendary titles', hof.total, 10, '🏆'], ['Franchise Loyalist', `Ten entries from one franchise (${franchises[0]?.name || '—'})`, franchises[0]?.count || 0, 10, '♾'],
    ['Archivist', 'Add 5 titles through the Add page', stats.custom || 0, 5, '✎'], ['Universe Builder', 'Reach 250 total titles', stats.total || archive.titles.length, 250, '✧'],
  ];
  const unlocked = achievements.filter(([, , value, goal]) => value >= goal).length;
  return (
    <div className="page-shell">
      <Header eyebrow="Steam-inspired milestones" title="Achievements" description={`Every story logged is a small unlock. ${unlocked} of ${achievements.length} achievements earned so far.`} />
      <div className="achievement-grid">{achievements.map(([name, description, value, goal, icon]) => { const progress = Math.min(100, Math.round((value / goal) * 100)); return <div className={`achievement-card panel ${progress >= 100 ? 'unlocked' : ''}`} key={name}><div className="achievement-icon">{icon}</div><div className="achievement-copy"><span className="eyebrow">{progress >= 100 ? 'Unlocked' : 'In progress'}</span><h2>{name}</h2><p>{description}</p><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{value} / {goal}</small></div></div>; })}</div>
    </div>
  );
}

export function RecommendationsPage() {
  const archive = useArchive();
  const pairs = [['Attack on Titan', 'Vinland Saga', 'If you love high-stakes dark fantasy and the cost of freedom, follow this path.'], ['Breaking Bad', 'The Family Man', 'For morally complicated leads, double lives, and pressure that never lets up.'], ['God of War', 'Red Dead Redemption 2', 'Two meditations on violence, fatherhood, and the possibility of becoming better.'], ['Monster', 'Death Note', 'Psychological cat-and-mouse stories where the real monster is never obvious.'], ['One Piece', 'Naruto', 'Long-form adventure, found family, and a hero who refuses to quit.'], ['Resident Evil 4', 'Resident Evil Village', 'Survival horror that trades a village for a castle and keeps the tension.']];
  return (
    <div className="page-shell">
      <Header eyebrow="Curated next steps" title="Recommendations" description="A hand-built recommendation engine connecting the stories already living in your archive." />
      <div className="recommend-grid">{pairs.map(([source, target, reason]) => { const match = archive.titles.find((title) => title.title.toLowerCase().includes(target.toLowerCase())); return <div className="recommend-card panel hover" key={target}><div><span className="eyebrow">Because you love</span><h2>{source}</h2></div><div className="recommend-arrow">→</div><Poster src={match?.cover_url} fallback={match?.local_cover} title={target} category={match?.category || 'default'} compact /><div><span className="eyebrow purple">Try next</span><h3>{target}</h3><p>{reason}</p>{match && <Link href={`/${match.category}/${match.slug}`} className="text-link">Open recommendation →</Link>}</div></div>; })}</div>
    </div>
  );
}
