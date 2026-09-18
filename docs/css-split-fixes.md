# CSS Split Audit & Fixes Reference

This document serves as a historical reference for the post-split CSS audit, recording which issues were flagged, the rationale behind every decision, which changes were applied, and what was deliberately retained.

---

## Summary of Decisions & Status

| Item | Topic | File(s) | Status | Rationale |
|------|-------|---------|--------|-----------|
| **1** | `.adkar-grid` scattered | `layout.css`, `responsive.css`, `views/adkar.css` | **Deferred** | `.adkar-grid` is shared between `view-adkar` and `view-favs`. Retained in `layout.css` pending a broader layout pass. |
| **2** | Brace layout in responsive sheets | `responsive.css`, `components.css` | **Resolved** | Token parsing confirmed all media query braces are balanced. Fixed `:has()` indentation in `components.css`. |
| **3a** | Duplicate `.prayer-qibla-card.close` | `css/views/prayer.css` | **Fixed** | Removed early gold block (line 135). Orange state (line 274) is the intentional warning state (`diff <= 25° && !aligned`). |
| **3b** | Duplicate `.reader-title` | `css/components.css` | **Fixed** | Excised redundant duplicate definition block. |
| **3c** | Duplicate `.session-overlay.is-done` | `css/components.css` | **Fixed** | Removed duplicate standalone rule and cleanly formatted `:has()` rule in desktop overlay query. |
| **3d** | Stale media query selectors | `css/views/flashcards.css` | **Fixed** | Replaced non-existent `.flash-ar` / `.flash-translit` with `.flash-front-ar, .flash-back-ar` and `.flash-front-translit, .flash-back-translit`. |
| **4** | Missing `.badge-tag` style | `css/views/adkar.css` | **Fixed** | Added neutral muted styling for tag badges emitted by `js/views/adkar.js`. |
| **5** | `#qibla-debug` inline style | `js/views/prayer.js` | **Retained** | Retained inline styling in JS to prevent out-of-scope logic churn. |
| **6** | Deprecated `--r` / `--rs` tokens | `css/base.css` | **Retained** | Retained tokens in `:root` because over 50 rules depend on `--r: 16px` and `--rs: 10px`. |
| **7** | iOS form input zoom (< 16px) | `components.css`, `layout.css`, `views/asma.css` | **Fixed** | Standardized all input/textarea/select base sizes to `16px` to prevent Safari viewport zooming on iPad/tablets. |
| **8** | Orphan sections (`.loc-row`, `.quote-card`) | `css/components.css` | **Retained** | Kept in `components.css` as reusable widgets across modals and independent modules. |

---

## Detailed Audit Breakdown

### 1. `.adkar-grid` Scattered Across Multiple Files
* **Flagged**: `.adkar-grid` layout lived in `layout.css`, media query overrides in `responsive.css`, and `.adkar-card` in `views/adkar.css`.
* **Investigation**: `.adkar-grid` is used by both `view-adkar` (`#adkar-grid`) and `view-favs` (`#favs-grid`). It functions as a shared list container rather than a purely adkar-specific view component.
* **Resolution**: **Deferred**. Moving it would require either duplicating the rule for favorites, renaming it to a generic container class, or moving breakpoints. Retained in `layout.css` until a dedicated layout consolidation pass.

---

### 2. `responsive.css` Brace Verification & Desktop `:has()` Formatting
* **Flagged**: Suspected misplaced brace near `.session-* <= 480px`.
* **Investigation**:
  * Programmatic brace depth analysis on `responsive.css` proved that all blocks (`≤768px`, `≤480px`, `≤360px`, landscape, `≥1024px`) opened and closed with zero net imbalance.
  * In `components.css`, the desktop media query (`@media (min-width: 768px)`) contained inconsistent indentation around `:has(.session-footer[style*="display: none"])`.
* **Resolution**: Formatting normalized in `components.css`. `responsive.css` confirmed syntactically sound.

---

### 3. Duplicate CSS Rules

#### 3a. `prayer.css` — `.prayer-qibla-card.close` (Gold vs. Orange)
* **Flagged**: Line 135 defined `.prayer-qibla-card.close` with gold accent border, while line 274 defined it with orange border and text.
* **Investigation**: In `js/views/prayer.js`:
  ```js
  const aligned = absDiff <= 10;
  const close   = absDiff <= 25 && !aligned;
  card.classList.toggle('aligned', aligned);
  card.classList.toggle('close',   close);
  ```
  `.aligned` and `.close` are mutually exclusive:
  - `absDiff <= 10°`: Green (`.aligned`).
  - `10° < absDiff <= 25°`: Orange (`.close` warning / approaching state).
  - `> 25°`: Standard neutral.
* **Resolution**: Excised the early gold rule (line 135). The orange rule (line 274) is the true intended visual.

#### 3b. `components.css` — `.reader-title`
* **Flagged**: Defined identically twice in the `READER` section (lines 1404–1416 and lines 1424–1436).
* **Resolution**: Excised the redundant second block.

#### 3c. `components.css` — `.session-overlay.is-done .session-body`
* **Flagged**: Defined standalone at line 408 and again at line 414 grouped with `:has(...)`.
* **Resolution**: Excised the standalone declaration and kept the consolidated `:has()` selector.

#### 3d. `flashcards.css` — `.flash-ar` / `.flash-translit`
* **Flagged**: Media queries at 600px and 400px targeted `.flash-ar` and `.flash-translit`, which did not exist in DOM output.
* **Investigation**: `js/views/asma.js` renders `.flash-front-ar`, `.flash-back-ar`, `.flash-front-translit`, and `.flash-back-translit`.
* **Resolution**: Updated media queries:
  ```css
  @media (max-width: 600px) {
    .flash-front-ar, .flash-back-ar { font-size: 42px; }
    .flash-front-translit, .flash-back-translit { font-size: 16px; }
    ...
  }
  @media (max-width: 400px) {
    .flash-front-ar, .flash-back-ar { font-size: 36px; }
  }
  ```

---

### 4. Missing `.badge-tag` Styling in `views/adkar.css`
* **Flagged**: `js/views/adkar.js` emits `<span class="badge badge-tag">#${esc(t)}</span>`, but no CSS rules existed for `.badge-tag`.
* **Resolution**: Added a neutral, non-competing badge style:
  ```css
  .badge-tag {
    background: var(--surface2);
    border-color: var(--border);
    color: var(--text3);
  }
  ```

---

### 5. `#qibla-debug` Inline Style
* **Flagged**: Written to by `js/compass.js` but styled via inline attributes in `js/views/prayer.js`.
* **Resolution**: Retained as-is in `js/views/prayer.js` to avoid touching JavaScript application logic during CSS-only maintenance.

---

### 6. Deprecated `--r` and `--rs` Tokens
* **Flagged**: `css/base.css` commented `--r: 16px` and `--rs: 10px` as deprecated in favor of `--radius-lg: 20px` and `--radius-sm: 8px`.
* **Investigation**: 50+ selectors across all view files rely on `--r` (16px) and `--rs` (10px). Replacing them outright with 20px / 8px would distort UI density across cards and buttons.
* **Resolution**: **Retained**. Tokens stay active in `:root`.

---

### 7. iOS Auto-Zoom on Input Focus (< 16px)
* **Flagged**: `base.css` set `input, textarea { font-size: 16px; }` to suppress iOS Safari auto-zoom, but `.fi, .fta, .fse` in `components.css` set `font-size: 14px;`, overriding it on tablets and larger viewports (> 480px).
* **Resolution**: Bumped all form controls and search bars to `16px`:
  - `css/components.css`: `.fi, .fta, .fse` (`16px`)
  - `css/components.css`: `.newcat-form .fr2 .fi` (`16px`)
  - `css/layout.css`: `.search-wrap input` (`16px`)
  - `css/views/asma.css`: `.asma-search-wrap input` (`16px`)

---

### 8. Location Picker Rows and Daily Quote Card in `components.css`
* **Flagged**: `.loc-row` and `.quote-card` appeared orphaned in `components.css` without dedicated view CSS files.
* **Investigation**:
  - `.loc-row` is used in the shared location search modal (`js/location.js`).
  - `.quote-card` is operated by `js/views/quote.js` and rendered on the home screen.
* **Resolution**: **Retained in `components.css`**. Both represent self-contained components suitable for reuse outside their parent views.
