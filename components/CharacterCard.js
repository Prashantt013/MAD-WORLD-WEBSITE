'use client';

import Link from 'next/link';
import Poster from './Poster';

export default function CharacterCard({ character }) {
  return (
    <Link href={`/characters/${character.slug}`} className="char-card">
      <Poster src={character.cover_url} fallback={character.local_cover} title={character.name} category="characters" label={character.franchise || 'Character'} compact />
      <div className="scrim" />
      <span className="badge">{character.type || 'Character'}</span>
      <div className="text"><div className="name">{character.name}</div><div className="franchise">{character.franchise}</div>{character.famous_line && <div className="quote">“{character.famous_line}”</div>}</div>
    </Link>
  );
}
