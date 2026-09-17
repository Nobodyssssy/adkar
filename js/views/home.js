'use strict';

/* ═══════════════════════════════════════════════════════════
   Home dashboard
   • Today card (Hijri + Gregorian date, next prayer, event)
   • Quote of the day
   • Feature cards (Adkar, Prayer, Hijri, Names, Library)
   ═══════════════════════════════════════════════════════════ */

async function renderHome(){
  const host = $('home-body');
  if(!host) return;

  /* Ensure quote lang preference is loaded */
  if(typeof _quoteLang !== 'undefined' && _quoteLang === null){
    const saved = await store.getMeta('quoteLang');
    _quoteLang = saved === 'en' ? 'en' : 'ar';
  }

  /* Build all three sections */
  const todayHTML = await renderTodayCardHTML();
  const quoteHTML = renderHomeQuoteHTML();
  const featuresHTML = renderHomeFeaturesHTML();

  host.innerHTML = `
    ${todayHTML}
    ${quoteHTML}
    ${featuresHTML}
  `;

  /* Reuse existing quote expand toggle */
  if(typeof _quoteExpanded !== 'undefined'){
    /* nothing extra needed — quote card already has its own click handler */
  }

  /* Start date refresh watcher */
  if(!window._homeDateWatcher){
    window._homeDateWatcher = setInterval(() => {
      if(document.getElementById('home-today-date-en')){
        refreshHomeDate();
      }
    }, 60 * 1000);
  }
  
    if(typeof injectHeaderIcons === 'function'){
    setTimeout(() => injectHeaderIcons(), 0);
  }
}

/* ═══════════════════════════════════════════════════════════
   TODAY CARD
   ═══════════════════════════════════════════════════════════ */
async function renderTodayCardHTML(){
  const date = new Date();
  const hijri = (typeof getHijriParts === 'function') ? getHijriParts(date) : null;
  const weekdayAr = (typeof WEEKDAYS_AR !== 'undefined') ? WEEKDAYS_AR[date.getDay()] : '';
  const weekdayEn = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthEn = date.toLocaleDateString('en-US', { month: 'short' });

  /* Hijri line */
  let hijriLine = '';
  if(hijri){
    hijriLine = `${weekdayAr} ${hijri.day} ${hijri.monthNameAr} ${hijri.year}`;
  }

  /* Gregorian line */
  const gregorianLine = `${weekdayEn} ${date.getDate()} ${monthEn} ${date.getFullYear()}`;

 /* Next prayer — only if we have a cached location */
let prayerLine = '';
try{
  if(typeof getToday === 'function'){
    const result = await getToday();
    if(result && result.today){
      const next = findNextPrayer(result.today.timings);
      if(next){
        const timeStr = next.time;
        const countdown = formatCountdown(next.minutesLeft);
        prayerLine = `
          <div class="home-today-prayer" onclick="openPrayerView()" style="cursor:pointer">
            <span class="home-prayer-icon">${icon('mosque', 16)}</span>
            <span class="home-prayer-label">${next.name}${next.tomorrow ? ' (tomorrow)' : ''}</span>
            <span class="home-prayer-time">${timeStr}</span>
            <span class="home-prayer-countdown">in ${countdown}</span>
          </div>
        `;
      }
    }
  }
}catch(err){
  /* NO_LOCATION or fetch error — show a friendly prompt instead of hiding */
  prayerLine = `
    <div class="home-today-prayer" onclick="openLocationPicker()" style="cursor:pointer">
      <span class="home-prayer-icon">${icon('map-pin', 16)}</span>
      <span class="home-prayer-label">Set your location</span>
      <span class="home-prayer-countdown">for prayer times</span>
    </div>
  `;
}

  /* Today's special event — from Hijri events */
  let eventLine = '';
  try{
    if(typeof getTodaysEvents === 'function' && typeof getTodayHijri === 'function'){
      const events = getTodaysEvents();
      if(events && events.length){
        const ev = events[0];
        eventLine = `
          <div class="home-today-event" onclick="openHijriEvent('${ev.id}')">
            <span class="home-event-icon">${ev.icon}</span>
            <span class="home-event-name">${ev.nameAr}</span>
            <span class="home-event-arrow">›</span>
          </div>
        `;
      }
    }
  }catch(err){
    eventLine = '';
  }

  return `
    <div class="home-today-card">
      <div class="home-today-date-ar" id="home-today-date-ar">${hijriLine}</div>
      <div class="home-today-date-en" id="home-today-date-en">${gregorianLine}</div>
      ${prayerLine}
      ${eventLine}
    </div>
  `;
}

function refreshHomeDate(){
  const date = new Date();
  const hijri = (typeof getHijriParts === 'function') ? getHijriParts(date) : null;
  const weekdayAr = (typeof WEEKDAYS_AR !== 'undefined') ? WEEKDAYS_AR[date.getDay()] : '';

  if(hijri){
    const arEl = $('home-today-date-ar');
    if(arEl) arEl.textContent = `${weekdayAr} ${hijri.day} ${hijri.monthNameAr} ${hijri.year}`;
  }
  const enEl = $('home-today-date-en');
  if(enEl){
    const weekdayEn = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthEn = date.toLocaleDateString('en-US', { month: 'short' });
    enEl.textContent = `${weekdayEn} ${date.getDate()} ${monthEn} ${date.getFullYear()}`;
  }
}

/* ═══════════════════════════════════════════════════════════
   QUOTE CARD (moved from adkar page)
   ═══════════════════════════════════════════════════════════ */
function renderHomeQuoteHTML(){
  if(typeof getTodayQuote !== 'function') return '';

  const q = getTodayQuote();
  if(!q) return '';

  const lang = (typeof _quoteLang !== 'undefined' && _quoteLang) ? _quoteLang : 'ar';
  const tafsirText = lang === 'ar' ? (q.tafsirAr || '') : (q.tafsirEn || '');
  const tafsirClass = lang === 'ar' ? 'ar' : 'en';
  const badgeIcon = q.type === 'quran' ? '📖' : '🕌';
  const badgeLabel = q.type === 'quran' ? 'Verse' : 'Hadith';

  const isExpanded = (typeof _quoteExpanded !== 'undefined') ? _quoteExpanded : false;

  return `
    <div class="quote-card home-quote-card ${isExpanded ? 'expanded' : ''}" id="quote-card" onclick="toggleHomeQuote(event)">
      ${(() => {
        const date = new Date();
        const hijri = (typeof getHijriParts === 'function') ? getHijriParts(date) : null;
        const weekdayAr = (typeof WEEKDAYS_AR !== 'undefined') ? WEEKDAYS_AR[date.getDay()] : '';
        if(hijri){
          return `<div class="quote-dateline">${weekdayAr} ${hijri.day} ${hijri.monthNameAr} ${hijri.year}</div>`;
        }
        return '';
      })()}
      <div class="quote-header">
        <div class="quote-badge">
          <span class="quote-badge-icon">${badgeIcon}</span>
          <span>${badgeLabel} · ${q.time}</span>
        </div>
        <span class="quote-expand-hint">${isExpanded ? '▲' : '▼'}</span>
      </div>

      <div class="quote-text">${q.ar}</div>
      <div class="quote-ref">${q.ref}</div>

      <div class="quote-teaser">Tap to read tafsir</div>

      <div class="quote-tafsir-wrap">
        <div class="quote-tafsir-header">
          <span class="quote-tafsir-label">📚 Tafsir</span>
          <div class="quote-lang-toggle">
            <button class="quote-lang-btn ${lang==='ar'?'on':''}" onclick="event.stopPropagation();setQuoteLang('ar')">عربي</button>
            <button class="quote-lang-btn ${lang==='en'?'on':''}" onclick="event.stopPropagation();setQuoteLang('en')">EN</button>
          </div>
        </div>
        <div class="quote-tafsir-body ${tafsirClass}">${tafsirText}</div>
        ${q.link ? `<a class="quote-link" href="${q.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🔗 Read full source →</a>` : ''}
      </div>
    </div>
  `;
}

function toggleHomeQuote(event){
  if(event){
    if(event.target.closest('.quote-lang-toggle')) return;
    if(event.target.closest('.quote-link')) return;
  }
  if(typeof _quoteExpanded !== 'undefined'){
    _quoteExpanded = !_quoteExpanded;
    renderHome();
  }
}

/* ═══════════════════════════════════════════════════════════
   FEATURE CARDS
   ═══════════════════════════════════════════════════════════ */
function renderHomeFeaturesHTML(){
  const features = [
    {
      id: 'adkar',
      icon: 'book-open',
      color: '#f5a623',
      labelAr: 'الأذكار',
      labelEn: 'Adkar',
      subAr: 'حصن المسلم',
      subEn: 'Fortress of the Muslim',
      action: 'goToAdkarCategories',
    },
    {
      id: 'prayer',
      icon: 'mosque',       /* custom icon we'll add */
      color: '#4caf89',
      labelAr: 'الصلاة',
      labelEn: 'Prayer times',
      subAr: 'مواقيت الصلاة',
      subEn: 'Daily times',
      action: 'openPrayerView',
    },
    {
      id: 'hijri',
      icon: 'calendar',
      color: '#8b4cc9',
      labelAr: 'التقويم',
      labelEn: 'Hijri calendar',
      subAr: 'الأحداث الإسلامية',
      subEn: 'Islamic events',
      action: 'openHijriView',
    },
    {
      id: 'asma',
      icon: 'sparkles',
      color: '#c9604c',
      labelAr: 'أسماء الله',
      labelEn: '99 Names of Allah',
      subAr: 'الأسماء الحسنى',
      subEn: 'Asma al-Husna',
      action: 'openAsmaView',
    },
    {
      id: 'books',
      icon: 'library',
      color: '#4c7fc9',
      labelAr: 'المكتبة',
      labelEn: 'Library',
      subAr: 'الكتب الإسلامية',
      subEn: 'Islamic books',
      action: 'openBooksView',
    },
  ];

  /* Language detection — use Arabic if any field shows Arabic, else English */
  const useArabic = true; /* dashboard defaults to Arabic labels (matches app's soul) */

 return `
    <div class="home-features-grid">
      ${features.map(f => `
        <div class="home-feature-card" style="--cc:${f.color}" onclick="${f.action}()">
          <div class="home-feature-icon">${icon(f.icon, 40)}</div>
          <div class="home-feature-label-ar">${f.labelAr}</div>
          <div class="home-feature-label-en">${f.labelEn}</div>
          <div class="home-feature-sub">${f.subAr}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION HELPERS
   ═══════════════════════════════════════════════════════════ */
function goToAdkar(){
  /* Alias for backward compatibility — routes to the categories grid */
  goToAdkarCategories();
}

function goHomeView(){
  showView('view-home');
  renderHome();
  window.scrollTo(0, 0);
}