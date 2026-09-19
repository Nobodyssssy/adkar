'use strict';
/* Home dashboard tab state */
window._homeTab = window._homeTab || 0;   /* 0 = today card, 1 = daily cycle */
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
    if(typeof _attachHomeTabsSwipe === 'function'){
    setTimeout(_attachHomeTabsSwipe, 0);
  }

  /* Reuse existing quote expand toggle */
  if(typeof _quoteExpanded !== 'undefined'){
    /* nothing extra needed — quote card already has its own click handler */
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
  let todayData = null;
  let location = null;
  let nextDay = null;

  try{
    if(typeof getToday === 'function'){
      const result = await getToday();
      if(result && result.today){
        todayData = result.today;
        location = result.location;

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

        /* Look up tomorrow's data — needed for the daily cycle bar */
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const key = monthKey(location.lat, location.lng, tomorrow.getFullYear(), tomorrow.getMonth() + 1);
        const cached = await store.getMeta(key);
        if(cached && cached.data && typeof _findDayInMonth === 'function'){
          nextDay = _findDayInMonth(cached.data, tomorrow);
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

  /* Build tab 1: today card */
  const todayTabHTML = `
    <div class="home-today-card">
      <div class="home-today-date-ar" id="home-today-date-ar">${hijriLine}</div>
      <div class="home-today-date-en" id="home-today-date-en">${gregorianLine}</div>
      ${prayerLine}
      ${eventLine}
    </div>
  `;

  /* Build tab 2: daily cycle bar — only if data available */
  let cycleTabHTML = '';
  if(
    todayData && nextDay &&
    typeof _computeDailyCycle === 'function' &&
    typeof _renderDailyCycleHTML === 'function'
  ){
    try{
      const cycle = _computeDailyCycle(todayData, nextDay);
      if(cycle){
        /* Expose data so the on-bar taps work on the home page too */
        window._homeCycleData = { today: todayData, nextDay: nextDay };
        cycleTabHTML = _renderDailyCycleHTML(cycle, todayData, nextDay);
      }
    }catch(err){
      console.warn('[home] daily cycle render failed', err);
    }
  }

  /* If we can't render the cycle, just return the today card (no tabs) */
  if(!cycleTabHTML){
    return todayTabHTML;
  }

   /* Two-tab swiper */
  const tab = window._homeTab || 0;
  return `
    <div class="home-tabs" id="home-tabs" data-tab="${tab}">
      <div class="home-tabs-header">
        <div class="home-tabs-dots">
          <span class="home-tab-dot ${tab === 0 ? 'on' : ''}" onclick="setHomeTab(0)"></span>
          <span class="home-tab-dot ${tab === 1 ? 'on' : ''}" onclick="setHomeTab(1)"></span>
        </div>
        <div class="home-tabs-arrows">
          <button class="home-tab-arrow" onclick="setHomeTab(0)" ${tab === 0 ? 'disabled' : ''}>‹</button>
          <button class="home-tab-arrow" onclick="setHomeTab(1)" ${tab === 1 ? 'disabled' : ''}>›</button>
        </div>
      </div>
      <div class="home-tabs-body">
        <div class="home-tab home-tab-today" data-index="0">
          ${todayTabHTML}
        </div>
        <div class="home-tab home-tab-cycle" data-index="1">
          ${cycleTabHTML}
        </div>
      </div>
    </div>
  `;
}

function setHomeTab(idx){
  window._homeTab = idx;
  const tabs = document.getElementById('home-tabs');
  const dots = document.querySelectorAll('.home-tab-dot');
  const arrows = document.querySelectorAll('.home-tab-arrow');
  if(tabs) tabs.dataset.tab = String(idx);
  dots.forEach((d, i) => d.classList.toggle('on', i === idx));
  if(arrows[0]) arrows[0].disabled = (idx === 0);
  if(arrows[1]) arrows[1].disabled = (idx === 1);
}

function _attachHomeTabsSwipe(){
  const body = document.getElementById('home-tabs-body');
  if(!body || body.dataset.swipeAttached === '1') return;
  let startX = 0;
  body.addEventListener('touchstart', e => {
    if(e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
  }, { passive: true });
  body.addEventListener('touchend', e => {
    if(!e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx) < 50) return;
    const cur = window._homeTab || 0;
    if(dx > 0 && cur > 0) setHomeTab(cur - 1);
    else if(dx < 0 && cur < 1) setHomeTab(cur + 1);
  }, { passive: true });
  body.dataset.swipeAttached = '1';
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
      icon: 'mosque',
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
	    {
      id: 'tasbih',
      icon: 'beads',
      color: '#fab387',
      labelAr: 'التسبيح',
      labelEn: 'Tasbih',
      subAr: 'مسبحة إلكترونية',
      subEn: 'Digital counter',
      action: 'openTasbihView',
    },
  ];

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
  goToAdkarCategories();
}

function goHomeView(){
  showView('view-home');
  renderHome();
  window.scrollTo(0, 0);
}