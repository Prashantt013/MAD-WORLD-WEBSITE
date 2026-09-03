'use client';

import { use } from 'react';
import { CertificatePage, CharacterDetailPage, CharactersPage, DetailPage, HallOfFamePage, LibraryPage, QuotesPage, SearchPage, categoryInfo } from '../../components/pages/archive';
import { StatsPage } from '../../components/pages/stats';
import { TrendingPage } from '../../components/pages/trending';
import { NewsPage } from '../../components/pages/news';
import { HISTORY_ROUTES, HistoryHubPage, HistoryTrackPage } from '../../components/pages/history';
import { AboutPage } from '../../components/pages/about';
import { AddPage, ArchiveSyncPage } from '../../components/pages/add';
import { AchievementsPage, RecommendationsPage } from '../../components/pages/misc';

const TITLE_CATEGORIES = Object.keys(categoryInfo);

// Single client-side router for every archive route. Static-looking paths
// (/stats, /news, ...) and dynamic ones (/games/[slug]) share the same merged
// archive hook, so new entries appear everywhere instantly.
export default function ArchiveRoute({ params }) {
  const resolved = params && typeof params.then === 'function' ? use(params) : params;
  const route = resolved?.slug || [];
  const [primary, secondary, tertiary] = route;

  if (primary === 'certificate' && secondary && tertiary) return <CertificatePage category={secondary} slug={tertiary} />;
  if (TITLE_CATEGORIES.includes(primary) && secondary) return <DetailPage category={primary} slug={secondary} />;
  if (primary === 'characters' && secondary) return <CharacterDetailPage slug={secondary} />;
  if (primary === 'hall-of-fame') return <HallOfFamePage />;
  if (primary === 'characters') return <CharactersPage />;
  if (primary === 'quotes') return <QuotesPage />;
  if (primary === 'about') return <AboutPage />;
  if (primary === 'search') return <SearchPage />;
  if (primary === 'trending') return <TrendingPage />;
  if (primary === 'news') return <NewsPage />;
  if (primary === 'stats') return <StatsPage />;
  if (primary === 'achievements') return <AchievementsPage />;
  if (primary === 'recommendations') return <RecommendationsPage />;
  if (primary === 'history' && !secondary) return <HistoryHubPage />;
  if (primary === 'history' && HISTORY_ROUTES[secondary]) return <HistoryTrackPage track={HISTORY_ROUTES[secondary]} />;
  if (primary === 'add') return <AddPage />;
  if (primary === 'admin' && secondary === 'archive-sync') return <ArchiveSyncPage />;
  if (primary === 'admin') return <AddPage />;
  if (primary === 'library') return <LibraryPage category="library" />;
  if (categoryInfo[primary]) return <LibraryPage category={primary} />;
  return <LibraryPage category="library" />;
}
