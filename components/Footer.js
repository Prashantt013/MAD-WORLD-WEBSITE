import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand"><span className="brand-mark">M</span><strong style={{ font: '700 15px var(--font-display)', letterSpacing: '0.14em' }}>MAD <b style={{ color: 'var(--red)' }}>WORLD</b></strong></div>
          <p>A cinematic personal archive of the games, anime, shows, characters and lines worth remembering. Curated by Prashant, powered by real-time data from Steam, MyAnimeList, IGN, GameSpot and more.</p>
        </div>
        <div className="footer-col"><h4>Archive</h4><Link href="/hall-of-fame">Hall of Fame</Link><Link href="/games">Games</Link><Link href="/anime">Anime</Link><Link href="/shows">Shows</Link><Link href="/characters">Characters</Link><Link href="/quotes">Quotes</Link></div>
        <div className="footer-col"><h4>Live</h4><Link href="/trending">Trending</Link><Link href="/news">News Hub</Link><Link href="/history">Award History</Link><Link href="/stats">Stats</Link><Link href="/achievements">Achievements</Link><Link href="/recommendations">Recommendations</Link></div>
        <div className="footer-col"><h4>Curator</h4><Link href="/about">About Prashant</Link><Link href="/add">Add to Archive</Link><Link href="/admin/archive-sync">Archive Sync</Link><a href="https://youtube.com/@madworldgamingg" target="_blank" rel="noreferrer">YouTube</a><a href="https://www.instagram.com/1madworldd" target="_blank" rel="noreferrer">Instagram</a></div>
      </div>
      <div className="footer-bottom"><span>MAD WORLD V7 · Private archive · Public obsession</span><span>Curated by Prashant · © 2026</span></div>
    </footer>
  );
}
