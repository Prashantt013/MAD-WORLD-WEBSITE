# MAD WORLD V4

A personal entertainment archive — Games, Anime, Shows, Horror, Characters, Quotes,
Hall of Fame, and an Archive Report — built with Next.js (static export), so it
deploys straight to GitHub Pages with no server required.

## What's new in this pass: real posters

Every title and character now renders its actual poster/portrait art instead
of a text-only gradient case. 253 items total:

- **232 resolved from your local image folders** (Games, Anime, English Shows,
  Hindi Shows, Horror movies, Character), fuzzy-matched by filename and copied
  into `/public/posters/<category>/<slug>.<ext>`
- **20 resolved from the `Cover/Poster` / `Poster Link` URL columns** in your
  spreadsheet, for titles that had no local file
- **1 with no image anywhere** (Joe Goldberg) — falls back to the gradient
  case design automatically, same as before

If an image URL ever breaks or a local file goes missing, the card detects
the failed load and falls back to the gradient — nothing renders broken.

The homepage hero now also has a background image (`public/images/hero-bg.jpg`,
from your wallpaper pack) with a dark scrim over it for text legibility.

## This is also the "add more titles later" automation

Adding a new game, show, or anime going forward is now just:

1. Add a row to the relevant sheet tab in your spreadsheet (Title, Status,
   Genre, etc.) — same as always.
2. **Optional:** drop a poster image into the matching folder (e.g. a new
   file in `Anime/`), named close to the title. Or just paste an image URL
   into that row's `Cover/Poster` column instead — either works.
3. Run:
   ```bash
   python3 scripts/generate-data.py path/to/MAD_WORLD_Master_Database.xlsx --assets path/to/asset/folder
   ```
   `--assets` should point at the folder that contains your `Games`, `Anime`,
   `English Shows`, `Hindi Shows`, `Horror movies`, and `Character` subfolders.

That single command rebuilds every file in `/data` **and** copies/matches
posters. No manual JSON editing, no re-coding a component, ever.

## ⚠️ Hall of Fame column is still blank in your spreadsheet

Same issue as the last workbook, so I'm restating it: your actual spreadsheet's
Hall of Fame column has no `Yes` values in it. The `/data/*.json` shipped here
has it correctly restored (35 titles, from your stated all-time favorites),
but that patch was applied to the *generated JSON only* — not your source file.

**If you run `generate-data.py` again before fixing this, Hall of Fame will
go back to 0.** Before your next regeneration: open the workbook, and on each
tab's Hall of Fame column, mark `Yes` for your favorites. One-time fix, then
the pipeline keeps it from then on.

## Setup

```bash
npm install
npm run dev       # http://localhost:3000
```

I could not run `npm install` or `next build` myself in this environment —
it has no network access, so packages can't be fetched here. I traced every
import path by hand and confirmed they all resolve, tested the full data +
poster pipeline against your real spreadsheet and asset folders, and checked
the resulting design with a standalone static preview (real posters, hero
background, Hall of Fame ribbons — all render correctly). But please run
`npm run build` yourself before deploying, to catch anything only a real
Next.js compile would surface.

## Deploying to GitHub Pages

```bash
npm run build     # outputs static site to /out
```

Push the contents of `/out` to your `gh-pages` branch (or use a GitHub Action
that runs `npm run build` and publishes `/out`). If your repo isn't served
from the domain root (e.g. `username.github.io/mad-world` instead of a
custom domain), uncomment and set `basePath` in `next.config.mjs` to match
your repo name first.

**Note on image size:** the 232 local posters add up to ~46MB in `/public`.
That's fine for GitHub Pages (well under its size limits) but worth knowing
if you're also on a metered connection when you push.

## Project structure

```
app/                 Next.js pages (App Router)
  games/              Games library + [slug] detail pages
  anime/              Anime library + [slug] detail pages
  shows/              Shows library (English + Indian) + [slug] detail pages
  horror/             Horror library + [slug] detail pages
  hall-of-fame/       Curated Hall of Fame gallery
  characters/         Character index + [slug] detail pages
  quotes/             Quotes Wall
  stats/              Archive Report (genre breakdown, achievements)
  about/              Bio + socials
  search/             Cross-category search results
  character-court/    Head-to-head character bracket voting (Phase 3)
  timeline/           Archive-order timeline (Phase 3 — see caveat below)
  wrapped/            Taste-profile recap slides (Phase 3 — see caveat below)
  certificate/[category]/[slug]/   Printable per-title archive certificate
components/          Nav, Footer, CaseCard, CharacterCard, PosterThumb,
                      LibraryGrid, TitleDetail
lib/data.js          Single data-access layer — every page reads through this
data/*.json          The actual archive data (regenerate via scripts/)
public/posters/      Resolved poster/portrait images, by category
public/images/       Hero background and other static site images
scripts/generate-data.py   Rebuilds /data + posters from your Excel workbook
```

## What's implemented from the Phase 2 plan

- ✅ Individual detail pages per title (`/games/[slug]`, etc.) with related titles + characters
- ✅ Real poster/portrait art on every card and detail page, with graceful fallback
- ✅ Personal rating field in the schema (empty until you fill it in — shows "— / 10" until then)
- ✅ Universal cross-category search
- ✅ Quotes Wall (auto-extracted from every title's Famous Quote field)
- ✅ Stats / Archive Report with genre breakdown and seeded achievements
- ✅ Franchise-aware "More Like This" (matches by shared genre tags within a category)

## Phase 3 additions

- **Character Court** (`/character-court`) — an 8-character single-elimination
  bracket, randomly drawn each visit. Winners persist to `localStorage` as a
  "Past Champions" list (client-side only, no backend — resets if you clear
  browser storage or switch devices).
- **Archive Certificates** (`/certificate/[category]/[slug]`, linked from every
  detail page) — a museum-placard-style page per title with a working
  print/PDF button (`window.print()`, styled via `@media print`).
- **MAD WORLD Timeline** (`/timeline`) — **read the in-page disclosure before
  you trust this one.** There is no `date_added` or `date_completed` data
  anywhere in the sheet yet, so this is sorted by *archive order* (the
  sequence titles appear in your spreadsheet), not by when you actually
  finished anything. It's built to become a real chronological timeline the
  moment those date fields are populated — no code changes needed, just data.
- **MAD WORLD Wrapped** (`/wrapped`) — a Spotify-Wrapped-style slide recap.
  Same honesty caveat as Timeline: with no completion dates, this is a
  **taste-profile snapshot** (top genre, a franchise-overlap guess, Hall of
  Fame count, a random quote) — not a real "this year" recap. It'll become
  one once dates exist.

### Franchise detection is a guess, not real data

`getTopFranchiseGuess()` in `lib/data.js` groups titles by their first 1–3
words (case-normalized) — good enough to correctly surface "God of War" as
your deepest franchise, but it's pattern-matching on titles, not a real
`franchise_id` relationship. Treat it as a fun stat, not ground truth, until
franchise grouping gets modeled properly.

### Why Trakt / Stash / GG auto-sync isn't built

This one's a real architecture decision, not a code gap:

Your GG/Stash/Trakt data currently comes in as manual exports or screenshots
because none of them expose an easy CSV export. Auto-syncing would mean
calling their APIs directly, which changes the shape of this whole project:

1. **API tokens can't live in a static site.** Anything shipped to a static
   export is public — a token embedded in the JS bundle is visible to anyone
   who views source. It needs a server to hold the secret.
2. **That means adding a backend** — even a minimal one, like a Vercel/Netlify
   serverless function on a schedule that writes into `/data/*.json` and
   redeploys. Buildable, just not "static HTML/JSON on GitHub Pages" as-is.
3. **GG and Stash** would need the same treatment *if* they ever expose a
   public API — neither does as of this writing.

If you want this built, the honest next step is deciding whether to move
hosting off GitHub Pages to something like Vercel — a hosting decision worth
making deliberately, not as a side effect of a sync feature.

## What's not done yet

- **Client-side persistence** ("Currently Playing" tracking, progress bars) —
  needs a `currently_playing` status value added to the data model.
- **Franchise clustering UI** (grouping God of War 1–4 visually as one shelf) —
  the data relationship isn't modeled yet beyond genre-tag matching.
- **Story DNA radar chart** — not started; would need theme tags (revenge,
  redemption, found-family, etc.) added per title first.
- **Real chronological Timeline / Wrapped** — both pages exist and work today,
  but need `date_added` / `date_completed` filled into the sheet to become
  genuinely date-based instead of archive-order-based.
