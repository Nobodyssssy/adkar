# Sahib (صاحب)

Sahib is an offline-first, installable Progressive Web App designed as a daily Islamic companion.
It provides fast, private, and readable access to adhkar, prayer times, the Hijri calendar, Names of Allah, a digital tasbih, and a local PDF library with user uploads and selective offline book caching.

The app is built with vanilla HTML, CSS, and JavaScript.
There is no framework and no build step.

## Features

### Adhkar and Hisn al-Muslim

- Full Hisn al-Muslim dataset with v4 taxonomy and visible subcategory UI.
- Current data state:
  - 251 Hisn entries
  - 42 curated seed entries
  - 293 total adhkar on a fresh install
- 17 frozen top-level buckets:
  - nawm
  - wudu
  - masjid
  - salah
  - salah_after
  - sabah
  - masaa
  - duaa
  - dhikr
  - food
  - travel
  - hajj
  - sickness
  - janazah
  - clothing
  - home
  - aam
- Retired category keys that must never reappear:
  - mutafarriqa
  - cat_100
  - cat_200
  - salah_in
  - istiqaz
  - taam
  - safar
- Every category card has its own icon.
- Inside each bucket:
  - bilingual chip row
  - All chip plus curated subtag chips
  - live count pills on chips
  - empty subtags hidden
  - filtering by bucket:subtag works
- Group headers use curated taxonomy labels instead of raw internal tags.
- Raw tag badges have been removed from:
  - adhkar cards
  - detail modal
  - search results
  - session mode
- Arabic text, English transliteration, hadith references, and virtues where available.
- Versioned auto-merge system:
  - updates are seeded from `js/hisn-data.js`
  - duplicates are detected using normalized Arabic text plus repeat count
  - personal counters and favorites are preserved
  - v4 multi-category rows are preserved during merge
- Hisn 92 and Hisn 93 are separate entries:
  - Hisn 92: repeat 10, categories sabah and masaa
  - Hisn 93: repeat 100, category sabah
  - dedupe key is normalized Arabic plus repeat count, not just normalized Arabic
- Session mode:
  - focused dhikr completion flow
  - resume from live counters
  - progress tracking
  - done-state visual feedback
- Adhkar detail modal:
  - Arabic shown by default inside a bordered shell
  - English transliteration behind an AR/EN toggle
  - Source and Virtue collapsed by default into one "Source & Virtue" fold
  - Fold state does not persist across modal opens
- Session overlay:
  - Same AR/EN toggle as the detail modal
  - Same single "Source & Virtue" fold
  - Session back button goes to the previous dhikr when not on the first item
- Adhkar cards:
  - Arabic only on the card, no transliteration
  - Mobile layout: content row on top, actions and completion ring on one row beneath
  - Edit and delete buttons are dimmed by default, brighten on card hover
- Adhkar detail modal progressive disclosure is live as of v2.10.42.
### Prayer Times and Daily Cycle

- Prayer times through the Aladhan API.
- Location support with GPS or manual city selection.
- Monthly prayer data is cached locally.
- Offline fallback:
  - the last successful prayer month is stored under `prayer-last-good`
  - when the network fails, the app serves the snapshot with a stale flag
  - the prayer view shows an updated pill:
    - online: `Updated Xm ago`
    - offline: `Offline · last update DD/MM HH:MM (Xd ago)`
- Visual daily cycle bar from Maghrib to Maghrib.
- Highlights:
  - night
  - last third of the night
  - day
  - forbidden prayer times
- Source-linked panels for relevant rulings.

### Hijri Calendar

- Hijri date display.
- Islamic events and recommended observances.
- Type-driven SVG icons for event categories.
- Works offline using inline event data and `Intl.DateTimeFormat`.
- Hijri events are stored in js/hijri-events.js and rendered from inline data only. No network calls.

### Names of Allah

- Asma ul-Husna view.
- Flashcard-style study mode.
- Inline data, fully offline.

### Library and Reader

- Curated local PDF library stored under `assets/books`.
- Nine category folders, 70 books total:
  1. Quran and Its Sciences (5)
  2. Hadith and Its Sciences (9)
  3. Prophet's Biography and History (6)
  4. Islamic Creed and Theology (12)
  5. Islamic Jurisprudence and Usul (7)
  6. Purification of the Soul and Adhkar (14)
  7. Modern Studies and Issues (7)
  8. General Books and Literature (5)
  9. Companions and Caliphs (5)
- Beginner path banner on library landing:
  - ten curated books in reading order
  - per-book notes in Arabic and English
  - notes render after cover generation
- Local PDF uploads:
  - upload any PDF from device into IndexedDB
  - stored in the `local_books` object store
  - size limits:
    - 500 MB per file allowed
    - 900 MB warning threshold
    - approximately 1.2 GB refuse ceiling
  - generated page-1 cover thumbnails cached locally
  - edit title, author, and description in Arabic and English
  - delete single book or delete all uploaded books
  - merged into search, category counts, detail modal, and reader
  - already offline because blobs live in IndexedDB
- Offline book cache:
  - five small beginner-path PDFs are auto-precached on service worker install
  - approximate auto-precached size: 14 MB
  - auto-precached books:
    - Jazariyyah
    - Kitab al-Tawhid
    - Ma La Yasa al-Muslim Jahl
    - Manhaj al-Salikin
    - Hisn al-Muslim
  - five heavy beginner-path PDFs can be downloaded on demand
  - the whole library can be downloaded on demand from the Library download modal
  - cached books are stored in a dedicated `sahib-books` cache
  - the `sahib-books` cache is exempt from normal service worker activation cleanup
  - book PDF requests are served cache-first when available
  - Range requests pass through to the network
  - outbound source links such as sunnah.com or quran.com are not fetched or cached
- Reader powered by a vendored EmbedPDF PDFium WASM engine:
  - correct Arabic shaping and glyph rendering natively
  - no server-side rasterization
  - no page-image folders
  - no PDF.js
  - no external cmap or standard-font downloads
  - PDFium engine files are precached with the app shell
- Three page rendering modes:
  - Light
  - Dark
  - Sepia
- Page bookmarks:
  - toggle current page
  - bookmark list panel
  - jump to bookmark
  - remove bookmark
  - persisted in IndexedDB
- Header favorites dropdown:
  - favorite adhkar
  - favorite books based on bookmarks or reading progress
  - live count badges
  - precached in the service worker shell
- Continue-reading strip on library landing.
- Reading progress persisted in IndexedDB.
- Reader close button pops the history entry; browser back closes the reader.

### Library Download UI

- Small accent-bordered download button on the Library landing header.
- Opens a modal with:
  - cached book count
  - cached size in MB
  - origin quota remaining
  - Beginner path job
  - Whole library job
  - live progress
  - Cancel
  - Clear cached books
- Downloaded state uses a solid Catppuccin Mocha green pill with dark text.
- Quota errors are toasted distinctly from network errors.
- The storage label is intentionally called `Origin quota remaining`, not free disk space.

### Digital Tasbih

- Tactile counter interface.
- Preset configurations.
- Done-state feedback.
- Fully offline.
- The tasbih view itself makes no direct fetch, HTTP, localStorage, or IndexedDB calls.

### Search

- Fuzzy search across adhkar.
- Filters by category, reliability, tag, and favorites.
- Search bar visible on category and search views.
- Library search covers curated books and local uploaded books.

### Themes

- Dark and light modes based on Catppuccin Mocha and Latte.
- Five accent variants:
  - gold
  - peach
  - blue
  - green
  - mauve
- CSS-variable driven theming.
- SVG sprite icon system, no emoji-dependent UI rendering.

### Scroll and Navigation

- Floating scroll-to-top button appears after 300px of scroll.
- Hidden while the session overlay or reader overlay is open.
- Browser back button (Chrome/Edge desktop Alt+Left, Android system back) closes
  the current pushed view: adhkar list, detail modal, session overlay, reader,
  favorites adkar view. Top-level tabs (Home, Prayer, Hijri, Asma, Library,
  Tasbih) do not push history entries.
- Adhkar categories render in a fixed display order:
  sabah, masaa, nawm, salah, salah_after, wudu, masjid, food, travel, hajj,
  sickness, janazah, clothing, home, duaa, dhikr, aam.
- Category grid: 2 columns at 480px and below, 3 columns from 481 to 1199,
  4 columns at 1200 and above.
- `css/responsive.css` is the single authority for mobile layout overrides.
  Do not add responsive rules to `layout.css`; they lose the cascade.
### Offline and Privacy

- Service worker caching for offline use.
- App shell is precached and served cache-first.
- All user data stored locally in IndexedDB.
- No accounts.
- No tracking.
- No cloud sync.
- Uploaded PDFs never leave the device.
- Book PDFs are only cached when auto-precached or explicitly downloaded by the user.
- External source links are not prefetched.

## Tech Stack

- Frontend: vanilla JavaScript ES6+, HTML5, CSS3.
- Styling: custom CSS variables, Catppuccin-inspired palette.
- Storage: IndexedDB through a small custom wrapper.
- Database version: v4.
- Object stores:
  - cats
  - adkar
  - favs
  - counters
  - meta
  - local_books
- Migration: automatic one-time migration from older localStorage data.
- Offline:
  - service worker with cache-first app shell
  - dedicated `sahib-books` cache for PDFs
  - prayer month snapshot fallback
  - selective beginner PDF precaching
- Fonts: self-hosted Amiri for Arabic and Tajawal for UI.
- Icons: Lucide-style SVG sprite in `assets/icons/sprite.svg`.
- PDF rendering: EmbedPDF, PDFium compiled to WASM, vendored under `js/vendor/` and tracked in git.
- Local uploads: Blob URLs served from IndexedDB `local_books` object store.
- Auto-precache of five small beginner PDFs on service worker install (~14 MB).
- Library download modal for on-demand caching of the beginner path or the whole library.
## Data Merge Model

Sahib uses a deterministic, versioned merge system.

- Core seed data lives in `js/data-defaults.js`.
- Hisn al-Muslim data lives in `js/hisn-data.js`.
- Taxonomy labels live in `js/adhkar-taxonomy.js`.
- On boot, `js/state.js` compares local `hisnMergedV2` meta against `window.HISN_VERSION`.
- Current Hisn version: 4.
- If the dataset version is newer:
  - new entries are merged into IndexedDB
  - duplicate Arabic text is skipped
  - duplicate detection uses normalized Arabic text plus repeat count
  - v4 `categories` arrays are preserved
  - ids are assigned from the current maximum id
  - user counters and favorites remain untouched
- Category icons are resynced on boot from `defaultCats()` when missing.
- This resync is idempotent.

The dedupe key change prevents Hisn 92 and Hisn 93 from being collapsed again after future version bumps.

To update Hisn data:

1. Edit `js/hisn-data.js`.
2. Bump `window.HISN_VERSION`.
3. Bump the service worker version in `sw.js`.
4. Clear site data and hard reload.

For bulk retagging or large data authoring:

- Do not ask a chat LLM to rewrite hundreds of entries directly.
- Use a local deterministic script.
- Produce an audit table first.
- Apply mechanically.
- Delete the one-off script after use.

## Offline Book Cache Model

The offline book system is intentionally selective.

- `js/offline-books.js` exposes `window.OFFLINE_BOOKS`.
- It owns:
  - the `sahib-books` cache name
  - URL tables for beginner-path PDFs
  - `offlineBookUrl(id)`
  - `isBookCached(id)`
  - `listCachedBookIds()`
  - `cacheBookById(id, signal)`
  - `cacheBeginnerBooks()`
  - `clearOfflineBooks()`
- `sw.js`:
  - precaches the app shell
  - then auto-fetches the five small beginner PDFs
  - auto-precache failures are logged, not fatal
  - serves book PDFs cache-first from `sahib-books`
  - passes Range requests through
  - exempts `sahib-books` from activate cleanup
  - evicts old versioned app-shell caches on activate
- `js/offline-ui.js` exposes `window.OFFLINE_UI`.
- It owns the Library download modal:
  - open
  - close
  - start mode
  - cancel
  - clear
- The Library landing header button opens the modal.
- The modal shows honest storage information:
  - cached book count
  - cached size
  - origin quota remaining
- Do not label `navigator.storage.estimate().quota` as free disk space.
- It is the per-origin quota, typically around 10 GB on Chromium.

## Prayer Offline Snapshot Model

Prayer times now degrade gracefully offline.

- `js/prayer.js`:
  - `_rememberLastGoodMonth()` stores the last successful month under `prayer-last-good`
  - `_loadLastGoodMonth()` reads it back
  - `fetchMonth()` snapshots successful responses
  - `getToday()` and `getMonth()` catch network errors and fall back to the snapshot
  - fallback responses are marked `stale: true`
- `getMonth()` now returns `{ data, ts, stale }`.
- All callers must handle that shape.
- `js/views/prayer.js`:
  - renders a `.prayer-updated` pill under the location line
  - uses `_formatAgo()` and `_formatStamp()`
  - shows online freshness or offline stale timing
  - duplicate pill rendering was removed

## Local Development

Clone the repository.

Start a local server. The app requires a server for service worker registration and PDF/font handling.

```cmd
cd "C:\Users\Protagonist\Desktop\Html app\Sahib"
python start.py
```

Then open:

```text
http://localhost:5500
```

For production testing, deploy the `main` branch to GitHub Pages.

## Repository Hygiene

Git history was rewritten to purge removed raster JPEG folders from past commits.
The remote repository is now smaller, but the remaining weight is dominated by the curated PDF collection itself, around 743 MB.
Further reduction would require removing books from the repository, not more history surgery.

Current known debt:

- `.continue-pin-badge` CSS rule in `css/views/books.css` is dead code after the pin system removal.
- Beginner banner arrow may render empty if `chevron-left` is missing from the sprite.
- Local book editing currently uses native `prompt()` dialogs.
- Temporary adhkar backup files are still on disk but gitignored:
  - `*.pre-v3`
  - `*.v3bak`

They should be deleted manually after confirming stability.

## Current Roadmap
Offline core (shell precache, prayer snapshot, sahib-books cache, five beginner PDFs auto-precached, download modal, honest quota label) is shipped as of v2.10.30.

1. Per-book download button:
   - badge and button on each book card
   - uses existing `OFFLINE_BOOKS.cacheBookById`
2. Offline indicator pill:
   - small Online/Offline badge in Settings and/or Home
3. Qibla UI:
   - `js/qibla.js` exists and is precached
   - UI entry is currently hidden
4. Settings storage estimate line:
   - show origin quota honestly
5. Adhkar detail modal progressive disclosure:
   - collapse source
   - collapse virtue
   - collapse English transliteration
   - add Arabic/English toggle where appropriate
6. RTL directional audit:
   - wrong-way back arrows
   - chevrons
   - prayer table orientation
   - directional icon flipping rules
7. Contrast and readability pass:
   - low-contrast gray text on dark navy
   - badges, chips, timeline labels, focus rings
8. Modal ergonomics and consistency pass:
   - Cancel/Save ordering
   - mobile 48px touch targets
   - fixed buttons clipping badges/tags
   - cramped modal controls
9. Card action and density pass:
   - edit/delete accidental taps
   - overly prominent card actions
   - card height inflation
   - compact mobile category grids
10. Desktop layout balance pass:
   - centered max-width around 1200px
   - sparse Tasbih and Asma layouts
   - category grid spacing versus dashboard
11. Timeline legibility pass:
   - overlapping labels
   - unreadable timestamps
   - narrow-screen prayer/Hijri timeline clipping
12. Visual icon consistency pass:
   - category icon colors versus dashboard gold-outlined style
13. Mobile Tasbih ergonomics pass:
   - settings gear too close to counter ring
14. Bottom navigation bar.
15. Adhkar v4.1 data refinement:
   - Hajj/Umrah split
   - dhikr/tahlil refinement
16. Cross-cutting tag filter axis:
   - frequency
   - context
   - length
17. AR/EN i18n pass, always last.
18. Aria-label sweep on remaining icon-only buttons.
19. Destructive-action copy fixes.
20. Settings import/export visual hierarchy.
21. Empty-state audit.
22. Attribution footer verification.
23. Dead-code sweep and `.adkar-grid` consolidation.

## Project Principles

- Offline-first.
- No build step.
- No framework.
- Arabic-first content.
- Local privacy.
- Incremental, verifiable changes.
- Deterministic data transformations over chat-authored bulk edits.
- Selective offline caching over blind full-library caching.