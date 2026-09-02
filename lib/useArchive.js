'use client';

import { useEffect, useState } from 'react';
import { ALL_TITLES, characters as defaultCharacters, quotes as defaultQuotes } from './data';

const initial = { titles: ALL_TITLES, characters: defaultCharacters, quotes: defaultQuotes, loading: true };

export function useArchive() {
  const [archive, setArchive] = useState(initial);
  useEffect(() => {
    let active = true;
    fetch('/api/archive', { cache: 'no-store' }).then((response) => response.ok ? response.json() : null).then((payload) => { if (active && payload?.titles) setArchive({ ...payload, loading: false }); else if (active) setArchive((value) => ({ ...value, loading: false })); }).catch(() => active && setArchive((value) => ({ ...value, loading: false })));
    return () => { active = false; };
  }, []);
  return archive;
}