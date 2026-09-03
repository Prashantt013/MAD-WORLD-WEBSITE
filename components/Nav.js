'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Github, Instagram, Menu, Plus, Search, X, Youtube } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Home' }, { href: '/hall-of-fame', label: 'Hall of Fame' }, { href: '/games', label: 'Games' }, { href: '/anime', label: 'Anime' }, { href: '/shows', label: 'Shows' },
  { href: '/characters', label: 'Characters' }, { href: '/quotes', label: 'Quotes' }, { href: '/trending', label: 'Trending' }, { href: '/news', label: 'News' }, { href: '/history', label: 'History' }, { href: '/stats', label: 'Stats' }, { href: '/about', label: 'About' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  function search(event) { event.preventDefault(); if (query.trim()) { router.push(`/search?q=${encodeURIComponent(query.trim())}`); setQuery(''); } }
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="MAD WORLD home"><span className="brand-mark">M</span><span className="brand-text"><strong>MAD <b>WORLD</b></strong><small>Entertainment archive</small></span></Link>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary">
          {LINKS.map((link) => <Link key={link.href} href={link.href} className={isActive(link.href) ? 'active' : ''}>{link.label}</Link>)}
          <Link href="/add" className={`nav-cta ${isActive('/add') ? 'active' : ''}`}><Plus size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />Add</Link>
        </nav>
        <div className="nav-right">
          <form className="nav-search" onSubmit={search} role="search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the archive" aria-label="Search archive" /></form>
          <div className="social-links">
            <a className="yt" href="https://youtube.com/@madworldgamingg" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={15} /></a>
            <a className="ig" href="https://www.instagram.com/1madworldd" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a>
            <a className="gh" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={15} /></a>
          </div>
          <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </div>
    </header>
  );
}
