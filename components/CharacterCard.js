'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function CharacterCard({ character }) {
  const [error, setError] = useState(false);
  const hasImage = character?.cover_url && !error;
  return <Link href={`/characters/${character.slug}`} className="char-card">{hasImage && <img src={character.cover_url} alt={character.name} className="portrait" loading="lazy" onError={() => setError(true)} />}<div className="scrim" /><span className="badge">{character.type}</span><div className="text"><div className="name">{character.name}</div><div className="franchise">{character.franchise}</div><div className="quote">“{character.famous_line}”</div></div></Link>;
}