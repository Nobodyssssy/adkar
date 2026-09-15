'use strict';

/* ═══════════════════════════════════════════════════════════
   Main menu — dropdown from the ☰ button
   • Opens overlay + dropdown
   • Closes on outside click or Escape
   ═══════════════════════════════════════════════════════════ */

function toggleMainMenu(event){
  if(event) event.stopPropagation();
  const overlay = $('menu-overlay');
  if(!overlay) return;
  if(overlay.classList.contains('open')){
    closeMainMenu();
  } else {
    openMainMenu();
  }
}

function openMainMenu(){
  const overlay = $('menu-overlay');
  if(!overlay) return;
  overlay.classList.add('open');
  lockBody();
  updateMenuState();
}

function closeMainMenu(){
  const overlay = $('menu-overlay');
  if(!overlay) return;
  overlay.classList.remove('open');
  unlockBody();
}

/* Update the theme icon/label to reflect current state */
function updateMenuState(){
  const icon  = $('menu-theme-icon');
  const label = $('menu-theme-label');
  if(!icon || !label) return;
  const isLight = document.body.classList.contains('light');
  icon.textContent  = isLight ? '☀️' : '🌙';
  label.textContent = isLight ? 'Light mode' : 'Dark mode';
}

/* Close on Escape */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    const overlay = $('menu-overlay');
    if(overlay && overlay.classList.contains('open')){
      closeMainMenu();
    }
  }
});