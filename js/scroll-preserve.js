'use strict';

/* ═══════════════════════════════════════════════════════════
   Scroll preservation helper
   Saves the current scroll position, re-renders, then restores.
   Use with `.view` containers or the whole window.
   ═══════════════════════════════════════════════════════════ */

/**
 * Preserve scroll across a re-render.
 * @param {Function} renderFn  — a function that renders (may be async)
 * @param {string} containerId — optional; if provided, preserves that element's scrollTop
 *                                otherwise preserves window scrollY
 */
async function withPreservedScroll(renderFn, containerId){
  /* Save */
  let savedY;
  let container = null;
  if(containerId){
    container = document.getElementById(containerId);
    savedY = container ? container.scrollTop : 0;
  } else {
    savedY = window.scrollY || window.pageYOffset || 0;
  }

  /* Render */
  await renderFn();

  /* Restore on next frame (layout must be ready) */
  requestAnimationFrame(() => {
    if(container){
      if(container.scrollTop !== savedY) container.scrollTop = savedY;
    } else {
      if(window.scrollY !== savedY) window.scrollTo(0, savedY);
    }
  });
}