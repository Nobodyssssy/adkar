# Sahib (صاحب)

Sahib is an offline-first, installable Progressive Web App designed as a daily Islamic companion.
It provides fast, private, and readable access to adhkar, prayer times, the Hijri calendar, Names of Allah, a digital tasbih, and a local PDF library.

The app is built with vanilla HTML, CSS, and JavaScript.
There is no framework and no build step.

## Features

### Adhkar and Hisn al-Muslim

- Full Hisn al-Muslim dataset: 267 entries covering 132 chapters.
- Arabic text, English transliteration, hadith references, and virtues where available.
- Versioned auto-merge system:
  - updates are seeded from `js/hisn-data.js`
  - duplicates are detected using normalized Arabic text
  - personal counters and favorites are preserved
- Subcategory tag system:
  - tag vocabulary in `HISN_TAGS`
  - tag filter chips in the adhkar view
  - grouping by primary tag
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

- Local PDF library stored under `assets/books`.
- Nine category folders, 70 books total:
  1. Quran & Its Sciences (5)
  2. Hadith & Its Sciences (9)
  3. Prophet's Biography & History (6)
  4. Islamic Creed & Theology (12)
  5. Islamic Jurisprudence & Usul (7)
  6. Purification of the Soul & Adhkar (14)
  7. Modern Studies & Issues (7)
  8. General Books & Literature (5)
  9. Companions & Caliphs (5)
- Catalog lives in `js/books-data.js`; helpers in `js/books.js`; view in `js/views/books.js`.
- Reader powered by a vendored EmbedPDF (PDFium) WASM engine:
  - correct Arabic shaping and glyph rendering natively
  - no server-side rasterization, no page-image folders
  - no PDF.js and no external cmap or standard-font downloads
- Three page rendering modes: Light, Dark, Sepia.
- Reading progress and per-book bookmarks persisted in IndexedDB.
- Continue-reading strip and pinned books on the library landing page.

### Digital Tasbih

- Tactile counter interface.
- Preset configurations.
- Done-state feedback.

### Search

- Fuzzy search across adhkar.
- Filters by category, reliability, tag, and favorites.
- Search bar visible on category and search views.

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

## Tech Stack

- Frontend: vanilla JavaScript ES6+, HTML5, CSS3.
- Styling: custom CSS variables, Catppuccin-inspired palette.
- Storage: IndexedDB through a small custom wrapper.
- Migration: automatic one-time migration from older localStorage data.
- Offline: service worker with cache-first assets and network-first navigation.
- Fonts: self-hosted Amiri for Arabic and Tajawal for UI.
- Icons: Lucide-style SVG sprite in `assets/icons/sprite.svg`.
- PDF rendering: EmbedPDF (PDFium compiled to WASM), vendored under `js/vendor/` and tracked in git.

## Data Merge Model

Sahib uses a deterministic, versioned merge system.

- Core seed data lives in `js/data-defaults.js`.
- Hisn al-Muslim data lives in `js/hisn-data.js`.
- On boot, `js/state.js` compares local `hisnMergedV2` meta against `window.HISN_VERSION`.
- If the dataset version is newer:
  - new entries are merged into IndexedDB
  - duplicate Arabic text is skipped
  - ids are assigned from the current maximum id
  - user counters and favorites remain untouched

To update Hisn data:

1. Edit `js/hisn-data.js`.
2. Bump `window.HISN_VERSION`.
3. Bump the service worker version in `sw.js`.
4. Clear site data and hard reload.

## Local Development

Clone the repository.

Start a local server. The app requires a server for service worker registration and PDF/font handling.

```cmd
cd "C:\Users\Protagonist\Desktop\Html app\Sahib"
python start.py