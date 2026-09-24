# Sahib (صاحب)

Sahib is an offline-first, installable Progressive Web App designed as a daily Islamic companion.
It provides fast, private, and readable access to adhkar, prayer times, the Hijri calendar, Names of Allah, a digital tasbih, and a local PDF library with user uploads.

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
- Every category card now has its own icon.
- Inside each bucket:
  - bilingual chip row
  - All chip plus curated subtag chips
  - live count pills on chips
  - empty subtags hidden
  - filtering by bucket:subtag works
- Group headers use curated taxonomy labels instead of raw internal tags.
- Raw `#tag` badges have been removed from:
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
- Hisn 92 and Hisn 93 are now separate entries:
  - Hisn 92: repeat 10, categories sabah and masaa
  - Hisn 93: repeat 100, category sabah
- Session mode:
  - focused dhikr completion flow
  - resume from live counters
  - progress tracking
  - done-state visual feedback

### Prayer Times and Daily Cycle

- Prayer times through the Aladhan API.
- Location support with GPS or manual city selection.
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

### Names of Allah

- Asma ul-Husna view.
- Flashcard-style study mode.
- Memorization tracking where implemented.

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
- Reader powered by a vendored EmbedPDF PDFium WASM engine:
  - correct Arabic shaping and glyph rendering natively
  - no server-side rasterization
  - no page-image folders
  - no PDF.js
  - no external cmap or standard-font downloads
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
- Continue-reading strip on library landing.
- Reading progress persisted in IndexedDB.

### Digital Tasbih

- Tactile counter interface.
- Preset configurations.
- Done-state feedback.

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

### Offline and Privacy

- Service worker caching for offline use.
- All user data stored locally in IndexedDB.
- No accounts.
- No tracking.
- No cloud sync.
- Uploaded PDFs never leave the device.

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
- Offline: service worker with cache-first assets and network-first navigation.
- Fonts: self-hosted Amiri for Arabic and Tajawal for UI.
- Icons: Lucide-style SVG sprite in `assets/icons/sprite.svg`.
- PDF rendering: EmbedPDF, PDFium compiled to WASM, vendored under `js/vendor/` and tracked in git.
- Local uploads: Blob URLs served from IndexedDB `local_books` object store.

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
- `js/hijri-events.js.bak` is still tracked.
- Beginner banner arrow may render empty if `chevron-left` is missing from the sprite.
- Local book editing currently uses native `prompt()` dialogs.
- Temporary adhkar backup files are still on disk but gitignored:
  - `*.pre-v3`
  - `*.v3bak`

They should be deleted manually after confirming stability.

## Current Roadmap

1. Adhkar detail modal progressive disclosure:
   - collapse source
   - collapse virtue
   - collapse English transliteration
   - add Arabic/English toggle where appropriate
2. Internet-status icon on prayer and Hijri cards.
3. Offline policy:
   - precache beginner-path PDFs
   - optional Settings action to download or cache more books
   - clear storage quota messaging
4. Bottom navigation bar.
5. Adhkar v4.1 data refinement:
   - Hajj and Umrah split
   - refine collapsed `dhikr:tahlil` entries
   - use deterministic local scripts only
6. Expose cross-cutting tags in a deliberate filter axis:
   - freq
   - ctx
   - len
7. AR/EN i18n pass, always last.
8. Aria-label sweep on remaining icon-only buttons.
9. Modal consistency pass.
10. Destructive-action copy fixes.
11. Settings import/export visual hierarchy.
12. Empty-state audit.
13. Attribution footer verification.
14. Dead-code sweep and `.adkar-grid` consolidation.

## Project Principles

- Offline-first.
- No build step.
- No framework.
- Arabic-first content.
- Local privacy.
- Incremental, verifiable changes.
- Deterministic data transformations over chat-authored bulk edits.