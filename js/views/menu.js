'use strict';

/* Main menu - dropdown from the hamburger button
   Opens overlay + dropdown; closes on outside click or Escape. */

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
  const iconEl = $('menu-theme-icon');
  const label  = $('menu-theme-label');
  if(!iconEl || !label) return;
  const isLight = document.body.classList.contains('light');
  iconEl.innerHTML = icon(isLight ? 'sun' : 'moon', 20);
  label.textContent = isLight ? 'Light mode' : 'Dark mode';
}

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    const overlay = $('menu-overlay');
    if(overlay && overlay.classList.contains('open')){
      closeMainMenu();
    }
  }
});