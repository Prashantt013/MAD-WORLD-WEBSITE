'use client';

import Link from 'next/link';
import Poster from '../Poster';
import { Header } from './archive';
import { useArchive } from '../../lib/useArchive';
import { about } from '../../lib/data';
import { getFranchises, getHallOfFameStats } from '../../lib/analytics';

const JOURNEY = {
  gaming: [
    { era: 'Chapter 01 · The first consoles', title: 'Vice City, PES and Cricket 07', text: 'The archive starts where most Indian gamers of the era started: a shared PC, a pirated-looking disc, and GTA Vice City on repeat. PES 04 and Cricket 07 were the multiplayer rituals that taught patience, timing and trash talk.', match: ['gta vice city', 'pes 04', 'cricket 07'] },
    { era: 'Chapter 02 · Gods and assassins', title: 'God of War, Prince of Persia, Assassin\'s Creed', text: 'Kratos\' rage trilogy and the Prince\'s time-bending sands were the first games that felt like myths. Then Ezio arrived and turned Renaissance Italy into a second home — the franchise that made history feel playable.', match: ['god of war', 'prince of persia', 'assassin'] },
    { era: 'Chapter 03 · Survival', title: 'Resident Evil', text: 'Leon Kennedy\'s worst first day at work became a comfort series. Raccoon City, the village, Ethan Winters\' nightmare — horror stopped being something to avoid and became something to master.', match: ['resident evil'] },
    { era: 'Chapter 04 · Stories that stay', title: 'Red Dead Redemption 2 and the modern era', text: 'Arthur Morgan changed the definition of a protagonist. From here the archive tilts toward narrative: fatherhood in God of War (2018), morality in the West, and worlds that respect the player\'s time.', match: ['red dead', 'god of war ragnar', 'god of war (2018)'] },
  ],
  anime: [
    { era: 'Arc 01 · The gateway', title: 'Death Note and Naruto', text: 'A notebook that kills and a loud kid who never quits. The first two series proved anime could be both a chess match and a marathon — and that a shonen ending can still make a grown man emotional.', match: ['death note', 'naruto'] },
    { era: 'Arc 02 · The long voyage', title: 'One Piece', text: 'Over a thousand episodes, one crew. Luffy\'s journey is the reason the archive tracks "up to date" at all — some stories are not watched, they are lived alongside.', match: ['one piece'] },
    { era: 'Arc 03 · Freedom and its cost', title: 'Attack on Titan', text: 'From the fall of Wall Maria to the Rumbling, Attack on Titan turned mystery into philosophy. It remains the benchmark for what a finale should risk.', match: ['attack on titan'] },
    { era: 'Arc 04 · No enemies', title: 'Vinland Saga, Monster and the thinkers', text: 'Thorfinn\'s refusal to fight, Johan\'s quiet horror, Aizen\'s theatre. The current chapter of the archive is about anime that argue with you long after the credits.', match: ['vinland', 'monster', 'bleach'] },
  ],
};

function find(titles, needles) { return needles.map((needle) => titles.find((title) => title.title.toLowerCase().includes(needle))).filter(Boolean).slice(0, 3); }

export function AboutPage() {
  const archive = useArchive();
  const stats = archive.stats;
  const hof = getHallOfFameStats(archive.titles);
  const franchises = getFranchises(archive.titles, archive.characters, 6);
  const social = (about.social || []).map((entry) => ({ label: entry.label.replace(/[:\s]+$/, '').replace(/\s*\(.*\)/, ''), url: entry.url.trim() }));
  const rooms = [
    { title: 'Who is Prashant?', text: about.website_bio.split('Beyond work')[0], bullets: ['Placement Manager by profession — talent acquisition, employer partnerships, candidate success', 'Gamer, anime enthusiast and storyteller at heart', `Interests: ${about.interests}`] },
    { title: 'Why MAD WORLD exists', text: 'Every entry is a small time capsule: a late-night session, a quote saved in a notes app, a character who changed the way a story landed. MAD WORLD turns those fragments into a museum that keeps growing — private archive, public obsession.', bullets: ['Built from a master spreadsheet, now a living website', 'Sheet + MongoDB keep every new entry permanent', 'Live data from Steam, MyAnimeList, IGN and more sits beside the personal shelves'] },
    { title: 'Hall of Fame philosophy', text: `Only ${hof.total} of ${stats.total || archive.titles.length} titles carry the gold border. Induction is not about ratings — it is about permanence: the stories still being quoted, replayed and recommended years later.`, bullets: ['A title must be finished, revisited, and still argued about', 'One franchise can hold several seats if every entry earns it', hof.avg ? `Current inductees average ${hof.avg} on external ratings` : 'Ratings are a footnote, not the criterion'] },
    { title: 'Future goals', text: 'MAD WORLD is designed to keep expanding without touching code: new titles arrive through the Add page, live shelves refresh themselves, and every stat recalculates automatically.', bullets: ['Log playtime, completion dates and personal ratings', 'Yearly "archive in review" recaps', 'Collaborative watchlists with friends', 'Mad World Gaming videos embedded beside their entries'] },
  ];
  return (
    <div className="page-shell">
      <Header eyebrow="Behind the archive" title="The curator" description="A digital museum about the person behind MAD WORLD — the games that raised him, the anime that rewired him, and the reason any of it is written down." />
      <div className="about-hero fade-up">
        <aside className="profile-card panel"><div className="avatar" /><span className="eyebrow">Curator · explorer</span><h2>Prashant S.</h2><p>{about.short_bio}</p><div className="social-list">{social.map((entry) => <a className="social-pill" key={entry.url} href={entry.url} target="_blank" rel="noreferrer">{entry.label}</a>)}</div></aside>
        <article className="about-story panel"><span className="eyebrow">The personal story</span><h2>Stories that stay with you</h2><p>{about.website_bio}</p><div className="about-stats">{[['Games', stats.games], ['Anime', stats.anime], ['Shows', stats.shows], ['Characters', stats.characters]].map(([label, number]) => <div className="about-stat" key={label}><strong>{number}</strong><span>{label}</span></div>)}</div></article>
      </div>

      <div className="museum-grid">{rooms.map((room, index) => <section className="museum-room panel hover fade-up" data-index={`0${index + 1}`} key={room.title} style={{ animationDelay: `${index * 0.07}s` }}><span className="eyebrow">Room 0{index + 1}</span><h2>{room.title}</h2><p>{room.text}</p><ul>{room.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></section>)}</div>

      <div className="section-heading" style={{ marginTop: 60 }}><div><span className="eyebrow">Gaming journey</span><h2>From Vice City to Valhalla</h2><p>The chapters that built the game shelf.</p></div><Link href="/games" className="text-link">Open the shelf →</Link></div>
      <div className="journey">{JOURNEY.gaming.map((step) => { const posters = find(archive.titles, step.match); return <div className="journey-item panel" key={step.title}><span className="eyebrow">{step.era}</span><h3>{step.title}</h3><p>{step.text}</p>{posters.length > 0 && <div className="journey-posters">{posters.map((title) => <Link key={title.id} href={`/${title.category}/${title.slug}`} title={title.title}><Poster src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} compact /></Link>)}</div>}</div>; })}</div>

      <div className="section-heading" style={{ marginTop: 60 }}><div><span className="eyebrow purple">Anime journey</span><h2>From a death note to Vinland</h2><p>The arcs that rewired how stories are judged.</p></div><Link href="/anime" className="text-link">Open the shelf →</Link></div>
      <div className="journey">{JOURNEY.anime.map((step) => { const posters = find(archive.titles, step.match); return <div className="journey-item panel" key={step.title}><span className="eyebrow purple">{step.era}</span><h3>{step.title}</h3><p>{step.text}</p>{posters.length > 0 && <div className="journey-posters">{posters.map((title) => <Link key={title.id} href={`/${title.category}/${title.slug}`} title={title.title}><Poster src={title.cover_url} fallback={title.local_cover} title={title.title} category={title.category} compact /></Link>)}</div>}</div>; })}</div>

      <div className="section-heading" style={{ marginTop: 60 }}><div><span className="eyebrow">Milestones</span><h2>The archive in numbers</h2></div></div>
      <div className="milestone-grid">{[[stats.total || archive.titles.length, 'Titles logged'], [stats.games, 'Games completed or queued'], [stats.anime, 'Anime finished or airing'], [stats.shows, 'Shows watched'], [stats.characters, 'Characters archived'], [stats.quotes, 'Quotes saved'], [hof.total, 'Hall of Fame seats'], [franchises.length, 'Franchises followed']].map(([value, label]) => <div className="milestone panel" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>

      <div className="section-heading" style={{ marginTop: 60 }}><div><span className="eyebrow">Achievement cards</span><h2>Unlocked so far</h2></div><Link href="/achievements" className="text-link">All achievements →</Link></div>
      <div className="achievement-grid" style={{ marginTop: 22 }}>{[['Century Club', 'Nearly 100 games catalogued', stats.games, 100, '⚔'], ['Anime Marathon', '50+ anime tracked', stats.anime, 50, '✦'], ['Franchise Loyalist', `${franchises[0]?.count || 0} entries from ${franchises[0]?.name || 'one franchise'}`, franchises[0]?.count || 0, 5, '♛'], ['Curator', `${hof.total} Hall of Fame inductions`, hof.total, 10, '🏆']].map(([name, description, value, goal, icon]) => { const progress = Math.min(100, Math.round((value / goal) * 100)); return <div className={`achievement-card panel ${progress >= 100 ? 'unlocked' : ''}`} key={name}><div className="achievement-icon">{icon}</div><div className="achievement-copy"><span className="eyebrow">{progress >= 100 ? 'Unlocked' : 'In progress'}</span><h2>{name}</h2><p>{description}</p><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{value} / {goal}</small></div></div>; })}</div>
    </div>
  );
}
