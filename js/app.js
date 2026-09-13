'use strict';

(function init(){
  store.checkDailyReset();
  renderCatsGrid();

  /* Close session on Escape */
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      const sess = $('session-overlay');
      if(sess && sess.classList.contains('open')) closeSession();
    }
  });

  /* ── Standalone-mode class (for CSS tweaks when installed) ── */
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if(isStandalone) document.documentElement.classList.add('pwa-standalone');

  /* ── Log ── */
  console.log(
    '%cأذكاري · My Adkar' + (isStandalone ? ' (installed)' : ''),
    'color:#c9a84c;font-weight:bold'
  );
})();