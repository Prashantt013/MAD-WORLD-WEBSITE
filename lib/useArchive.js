'use client';

import useSWR, { mutate } from 'swr';
import { ALL_TITLES, characters as defaultCharacters, quotes as defaultQuotes, getStats } from './data';

export const ARCHIVE_KEY = '/api/archive';
const fallbackData = { titles: ALL_TITLES, characters: defaultCharacters, quotes: defaultQuotes, stats: { ...getStats(), total: ALL_TITLES.length, custom: 0 }, recent: [] };
const fetcher = (url) => fetch(url, { cache: 'no-store' }).then((response) => (response.ok ? response.json() : Promise.reject(new Error(`${response.status}`))));

// Single shared source of truth for the merged archive (static JSON + admin
// entries). SWR dedupes requests across every component on the page and
// `refreshArchive()` re-syncs all lists instantly after a new entry is saved.
export function useArchive() {
  const { data, error, isLoading } = useSWR(ARCHIVE_KEY, fetcher, { fallbackData, revalidateOnFocus: false, dedupingInterval: 15000, keepPreviousData: true });
  const archive = data?.titles ? data : fallbackData;
  return { ...archive, loading: isLoading && !data, error };
}

export function refreshArchive() {
  return mutate(ARCHIVE_KEY);
}

export function useLive(path, options = {}) {
  const { data, error, isLoading } = useSWR(path, fetcher, { revalidateOnFocus: false, dedupingInterval: 60000, ...options });
  return { data, error, loading: isLoading && !data };
}
