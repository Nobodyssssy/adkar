# Sahib (صاحب)

**Sahib** is an offline-first, installable Progressive Web App (PWA) designed as a daily Islamic companion. It provides fast, private, and beautiful access to daily Adhkar, prayer times, the Hijri calendar, and more — without requiring an internet connection after the initial load.

## ✨ Features

- **📿 Comprehensive Adhkar**: Full integration of *Hisn al-Muslim* (Fortress of the Muslim) covering all 132 chapters (267 entries), complete with Arabic text, English translation, Hadith sources, and virtues.
- **🕌 Prayer Times & Daily Cycle**: Accurate prayer times based on your location (GPS or manual city selection). Includes a visual "Daily Cycle" bar showing the progression from Maghrib to Maghrib, highlighting the last third of the night and forbidden prayer times.
- **🌙 Hijri Calendar**: Track Islamic months and significant historical events.
- **📖 Library & Reader**: Built-in PDF reader for Islamic books with offline caching.
- **📿 Digital Tasbih**: A beautiful, tactile digital counter for daily tasbih.
- **🧠 Session Mode**: A focused, distraction-free mode for completing daily Adhkar with progress tracking and tap counters.
- **🔍 Fuzzy Search**: Find any dhikr instantly with full-text search and filtering by category, reliability (Sahih/Hasan/Da'if), and tags.
- **🎨 Beautiful Themes**: Dark/Light mode support with 5 Catppuccin-inspired accent colors (Gold, Peach, Blue, Green, Mauve).
- **📴 100% Offline**: Service Worker caches the entire app shell and data for instant loading and zero network dependency.
- **🔒 Private**: All data (counters, favorites, settings) is stored locally in IndexedDB. No tracking, no accounts, no cloud sync.

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (No frameworks, no build step).
- **Styling**: Custom Catppuccin Mocha/Latte palette with CSS variables.
- **Storage**: IndexedDB (via custom wrapper) with automatic migration from localStorage.
- **Offline**: Service Worker (Cache-First for assets, Network-First for navigation).
- **Fonts**: Self-hosted *Amiri* (Arabic) and *Tajawal* (UI).
- **Icons**: Lucide SVG sprite.

## 📂 Data Architecture

Sahib uses a deterministic, versioned merge system for its dataset:
- **Core Data**: `js/data-defaults.js` seeds the initial categories and essential Adhkar.
- **Hisn al-Muslim**: `js/hisn-data.js` contains the full 267-entry dataset.
- **Auto-Merge**: On boot, `js/state.js` compares the local `hisnMergedV2` meta flag against `window.HISN_VERSION`. If the file is updated and the version is bumped, new entries are automatically deduplicated (via tashkeel-stripping normalization) and merged into the user's local IndexedDB without overwriting their personal counters or favorites.

## 🚀 Local Development

1. Clone the repository.
2. Start a local server (the app requires a server to register the Service Worker and fetch fonts):
   ```bash
   python start.py
   # or use Live Server in VS Code