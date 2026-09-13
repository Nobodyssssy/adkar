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

  console.log('%cأذكاري · My Adkar ready', 'color:#c9a84c;font-weight:bold');
})();