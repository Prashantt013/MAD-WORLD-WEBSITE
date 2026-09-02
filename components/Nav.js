'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/', label: 'Home' }, { href: '/hall-of-fame', label: 'Hall of Fame' }, { href: '/games', label: 'Games' }, { href: '/anime', label: 'Anime' },
  { href: '/shows', label: 'Shows' }, { href: '/characters', label: 'Characters' }, { href: '/quotes', label: 'Quotes' }, { href: '/character-court', label: 'Court' }, { href: '/about', label: 'About' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  function search(event) { event.preventDefault(); if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`); }
  return <header className="navbar"><div className="nav-inner"><Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">M</span><span>MAD <b>WORLD</b></span></Link><nav className={`nav-links ${open ? 'open' : ''}`}>{LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={(link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)) ? 'active' : ''}>{link.label}</Link>)}</nav><div className="nav-right"><form className="nav-search" onSubmit={search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search archive" aria-label="Search archive" /></form><div className="social-links"><a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">GH</a><a href="https://instagram.com/1madworldd" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a><a href="https://youtube.com/@madworldgamingg" target="_blank" rel="noreferrer" aria-label="YouTube">YT</a></div><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? '×' : '☰'}</button></div></div></header>;
}