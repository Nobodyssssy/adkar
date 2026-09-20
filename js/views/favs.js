'use strict';

function toggleFavsView(){
  $('btn-favs').classList.add('active');
  renderFavsGrid();
  showView('view-favs');
}

function closeFavsView(){
  $('btn-favs').classList.remove('active');
  showView('view-cats');
}

function renderFavsGrid(){
  const items = data.filter(d => favs.includes(d.id));
  const g = $('favs-grid');
  if(!items.length){
    g.innerHTML = `<div class="adkar-empty">
      <div class="adkar-empty-icon">${icon('favorite-empty', 40)}</div>
      <div>No favorites yet.<br>Tap the star on any dhikr.</div>
    </div>`;
    return;
  }
  g.innerHTML = items.map(d => adkarCardHTML(d, null)).join('');
}

function toggleFav(id){
  if(favs.includes(id)) favs = favs.filter(x => x !== id);
  else favs.push(id);
  saveFavs();
  if(currentCat) renderAdkarGrid(); else renderFavsGrid();
  renderCatsGrid();
  updateFavsButton();
}

function toggleFavFromDetail(){
  if(!detailId) return;
  toggleFav(detailId);
  const isFav = favs.includes(detailId);
  const btn = $('d-fav-btn');
  btn.innerHTML = icon(isFav ? 'favorite-filled' : 'favorite-empty', 16);
  btn.style.color = isFav ? 'var(--accent2)' : 'var(--text3)';
  btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
  updateFavsButton();
}

function updateFavsButton(){
  const btn = $('btn-favs');
  if(!btn) return;
  const has = Array.isArray(favs) && favs.length > 0;
  btn.innerHTML = icon(has ? 'favorite-filled' : 'favorite-empty', 18);
  btn.setAttribute('aria-label', has ? 'Favorites' : 'No favorites yet');
  btn.classList.toggle('has-favs', has);
}