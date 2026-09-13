'use strict';

/* ═══════════════════════════════════════════════════════════
   Daily quote card — render + expand + language toggle
   • Renders the current slot's quote
   • Tap card → expands to show tafsir
   • AR/EN toggle inside tafsir
   • Language preference saved to IndexedDB
   ═══════════════════════════════════════════════════════════ */

let _quoteExpanded = false;
let _quoteLang = 'ar';   /* default language for tafsir */

/* ── Render ── */
async function renderQuoteCard(){
  const host = $('quote-card');
  if(!host) return;
  if(typeof getTodayQuote !== 'function'){
    host.style.display = 'none';
    return;
  }

  /* Load saved language preference once */
  if(_quoteLang === null){
    const saved = await store.getMeta('quoteLang');
    _quoteLang = saved === 'en' ? 'en' : 'ar';
  }

  const q = getTodayQuote();
  if(!q){ host.style.display = 'none'; return; }

  const tafsirText = _quoteLang === 'ar' ? (q.tafsirAr || '') : (q.tafsirEn || '');
  const tafsirClass = _quoteLang === 'ar' ? 'ar' : 'en';

  const badgeIcon = q.type === 'quran' ? '📖' : '🕌';
  const badgeLabel = q.type === 'quran' ? 'Verse' : 'Hadith';

  host.classList.toggle('expanded', _quoteExpanded);

  host.innerHTML = `
    <div class="quote-header">
      <div class="quote-badge">
        <span class="quote-badge-icon">${badgeIcon}</span>
        <span>${badgeLabel} · ${q.time}</span>
      </div>
      <span class="quote-expand-hint">${_quoteExpanded ? '▲' : '▼'}</span>
    </div>

    <div class="quote-text">${q.ar}</div>
    <div class="quote-ref">${q.ref}</div>

    <div class="quote-teaser">Tap to read tafsir</div>

    <div class="quote-tafsir-wrap">
      <div class="quote-tafsir-header">
        <span class="quote-tafsir-label">📚 Tafsir</span>
        <div class="quote-lang-toggle">
          <button class="quote-lang-btn ${_quoteLang==='ar'?'on':''}" onclick="event.stopPropagation();setQuoteLang('ar')">عربي</button>
          <button class="quote-lang-btn ${_quoteLang==='en'?'on':''}" onclick="event.stopPropagation();setQuoteLang('en')">EN</button>
        </div>
      </div>
      <div class="quote-tafsir-body ${tafsirClass}">${tafsirText}</div>
      ${q.link ? `<a class="quote-link" href="${q.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🔗 Read full source →</a>` : ''}
    </div>
  `;

  /* Bind expand/collapse — but only on the card itself, not on link or lang buttons */
  host.onclick = (e) => {
    /* Ignore clicks inside the tafsir body's buttons / links */
    if(e.target.closest('.quote-lang-toggle')) return;
    if(e.target.closest('.quote-link')) return;
    _quoteExpanded = !_quoteExpanded;
    renderQuoteCard();
  };
}

/* ── Language toggle ── */
async function setQuoteLang(lang){
  if(lang !== 'ar' && lang !== 'en') return;
  _quoteLang = lang;
  await store.setMeta('quoteLang', lang);
  renderQuoteCard();
}

/* ── Auto-refresh when the 6h slot changes ── */
let _lastSlot = null;
function checkQuoteSlotChange(){
  if(typeof getCurrentTimeSlot !== 'function') return;
  const slot = getCurrentTimeSlot();
  if(slot !== _lastSlot){
    _lastSlot = slot;
    renderQuoteCard();
  }
}

/* Init — start the slot watcher */
(function initQuoteWatcher(){
  /* Ensure language preference is loaded on next render */
  _quoteLang = null;
  /* Check every minute for slot change */
  setInterval(checkQuoteSlotChange, 60 * 1000);
})();