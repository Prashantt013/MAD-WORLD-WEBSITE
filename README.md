# MAD WORLD V7 — Cinematic Entertainment Archive

A premium, Netflix/IMDb-style personal archive of games, anime, shows, movies, characters and quotes — with **live trending data, a news hub and real award history** — built on Next.js 15 (App Router) and MongoDB.

## What's new in V7

| Area | Upgrade |
| --- | --- |
| Design system | Deep purple / crimson / gold palette, glass panels, glows, hover depth, film-grain background |
| Navbar | Blur-glass, active pill highlight, hover underline animation, scroll-shrink, lucide social icons, `Add` CTA |
| Home | Left-side floating **poster stack** (auto-rotating Hall of Fame + top games/anime), 7-tile stats strip, live trending & news teasers |
| Stats (`/stats`) | Replaces Character Court. Count-up hero tiles, distribution donut, growth timeline, franchises, genres, Hall of Fame statistics, recently added |
| Trending (`/trending`) | **Real data**: Steam (top sellers + most played, keyless), RAWG & IGDB (optional keys), MyAnimeList via Jikan with AniList fallback, TMDB movies/series (optional key). Cached 30 min |
| News Hub (`/news`) | IGN, GameSpot, Steam news wire, Anime News Network, MyAnimeList, Variety, THR, Collider (RSS). Featured story + grid, source filters, TMDB release radar (optional). Cached 15 min |
| History (`/history`) | Real winners: The Game Awards GOTY, Crunchyroll Anime of the Year, Emmy Outstanding Drama, Oscar Best Picture (2014 → 2025/26) with posters, timeline layout |
| Fun facts | Floating bottom-right widget, 44 anime/game/movie/character facts, auto-rotate 45 s, next/close, remembers dismissal per session |
| Posters | Strict chain: **sheet poster URL → local file → generated gradient title card**. 252/253 items now use the master sheet's poster links |
| Add (`/add`) | Password-protected universal intake (Game / Anime / Show / Movie) with live card preview. Saves to MongoDB and instantly updates Home, shelves, Quotes, Hall of Fame, Stats and search |
| Archive Sync | MongoDB + local JSON fallback, export/backup/restore, delete, re-sync, search indexing |
| About | Digital-museum layout: rooms, gaming & anime journey timelines, milestones, achievement cards |
| Deployment | `next build` passes clean, no hydration warnings, Vercel-ready, all secrets via env |

## Quick start

```bash
yarn install
cp .env.example .env      # fill in MONGO_URL, ADMIN_PASSWORD (+ optional API keys)
yarn dev                  # http://localhost:3000
yarn build && yarn start  # production
```

## Environment variables

See `.env.example`. Only `ADMIN_PASSWORD` is needed for the Add page; `MONGO_URL` makes entries permanent (without it the app writes to `data/custom-archive.json`, or `/tmp` on Vercel). `RAWG_API_KEY`, `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET` and `TMDB_API_KEY` are optional and switch on extra live sources with no code changes.

## Deploying to Vercel

1. Import the repo, framework preset **Next.js**.
2. Add the environment variables above (MongoDB Atlas connection string recommended).
3. Deploy. Live data endpoints set `s-maxage` headers so Vercel's edge cache serves them fast.

## Data pipeline

- `data/*.json` — the static archive (games, anime, shows, horror, characters, quotes, about, awards, facts).
- `scripts/sync_sheet.py` — pulls the public MAD WORLD Google Sheet and merges poster URLs, summaries, quotes, notes and ratings into the JSON (ids/slugs preserved). Run `python3 scripts/sync_sheet.py` whenever the sheet changes.
- `scripts/resolve_award_posters.py` — one-off resolver that bakes Wikipedia poster URLs into `data/awards.json`.
- Admin-added entries live in MongoDB (`archive_entries`) and are merged with the static data by `/api/archive`.

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/archive` | Merged archive (static + MongoDB) with stats and recent entries |
| `GET /api/archive/export` · `/backup` · `/custom` · `/recent` | Sync helpers |
| `POST /api/archive` | Add an entry (header `x-admin-key`) |
| `POST /api/archive/restore` | Merge/replace a backup (admin) |
| `DELETE /api/archive/:id` | Remove an admin-added entry (admin) |
| `POST /api/admin/verify` | Check the admin password |
| `GET /api/search?q=` | Ranked search across titles, characters and quotes |
| `GET /api/trending` | Live games / anime / movies & shows |
| `GET /api/news` | Aggregated RSS news by category |
| `GET /api/awards[?track=goty|anime|tv|movies]` | Award history |
| `GET /api/facts` | Fun-fact pool |

## Project structure

```
app/
  layout.js, page.js            # shell + home
  [...slug]/page.js             # client router for every archive route
  api/[[...path]]/route.js      # all API endpoints
components/
  Nav, Footer, FunFact, HeroStack, Poster, CaseCard, CharacterCard, LiveCard, NewsCard, TitleDetail, Certificate
  pages/ archive, stats, trending, news, history, about, add, misc
lib/
  data.js (static loaders), analytics.js, useArchive.js (SWR), archive-merge.js
  mongodb.js, cache.js, archive-server.js, live.js, news.js, awards.js  (server only)
data/  scripts/  public/posters/
```
