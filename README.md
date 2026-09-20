# صاحب · Sahib

Offline-first Islamic companion PWA. Arabic-first (RTL), English labels.
Built for personal daily use on phone, laptop and PC. Installable, works offline.

**Live:** https://nobodyssssy.github.io/adkar/

## Features

- **Adkar** — curated remembrances with categories, tags, favorites, counters,
  session mode, multi-category support, CRUD, JSON import/export
- **Prayer times** — Aladhan API (method 19, Algeria), 90-day offline cache,
  next-prayer countdown, forbidden-times card
- **Daily cycle bar** — Maghrib-to-Maghrib hourly timeline with night/day/last-third
  segments and forbidden windows; tappable details on home and prayer views
- **Hijri calendar** — month grid with 21 sourced Islamic events
- **99 Names of Allah** — full Tirmidhi list, AR/EN tafsir, memorization tracking,
  flashcards (meaning→name / name→meaning / mixed)
- **Daily quote** — 127 verified verses and hadiths, rotates by time of day, tafsir toggle
- **Library** — Islamic books across 8 categories with a PDF.js reader
  (scroll/flip modes, TOC, thumbnails, page memory, pins)
- **Tasbih** — digital counter with targets, color presets, hotkeys, haptics, persistence
- **Themes** — dark/light mode + 5 accent variants (gold, peach, blue, green, mauve),
  Catppuccin-based palette, persisted per device

## Tech stack

- Vanilla HTML / CSS / JS — no framework, no build step
- IndexedDB for all persistence (per-device)
- Service worker — offline-first app shell, network-first HTML
- PDF.js 3.11 (reader), Fuse.js 7 (fuzzy bilingual search)
- Self-hosted fonts: Amiri (Arabic), Tajawal (UI)
- Lucide icon sprite (SVG symbols)
- Python `start.py` — tiny LAN server for local development

## Run locally

```bash
python start.py
# then open http://localhost:5500  (or your LAN IP)

Any static file server works. No build, no install.
Deploy
GitHub Pages, built from main.
After any CSS/JS/HTML change, bump VERSION in sw.js so devices pick up the update.
Project structure

index.html          app shell + all modals
sw.js               service worker (cache version lives here)
manifest.webmanifest
css/
  base.css          fonts, theme variables, accent variants
  layout.css        header, menu, grids
  components.css    buttons, modals, session, reader, toast
  responsive.css    breakpoints
  views/            one file per view (home, adkar, prayer, hijri, asma,
                    flashcards, books, tasbih)
js/
  app.js            boot, theme + accent settings
  state.js          in-memory state, loaded from IndexedDB
  store.js          persistence layer
  db.js             IndexedDB wrapper
  views/            one file per view renderer
assets/
  fonts/  icons/  books/  audio/  compass/
  
Data sources

    Adkar: curated collection with authenticity grades (sahih / hasan / da'if)
    Quotes: Qur'an and sahih hadith only, with references
    99 Names: Tirmidhi list, tafsir summaries AR/EN
    Hijri events: sourced list maintained in js/hijri-events.js
    Prayer times: Aladhan API (https://aladhan.com
    )

Attribution

    Icons: Lucide — ISC license (https://lucide.dev
    )
    Fonts: Amiri & Tajawal — SIL Open Font License
    PDF.js: Mozilla — Apache 2.0
    Fuse.js: MIT
    Palette: Catppuccin — MIT (https://catppuccin.com
    )
    Prayer times API: Aladhan

License
Personal project. Not for redistribution.  
  