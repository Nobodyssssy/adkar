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
      <div class="adkar-empty-icon">⭐</div>
      <div>No favorites yet.<br>Tap ★ on any dhikr.</div>
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
}

function toggleFavFromDetail(){
  if(!detailId) return;
  toggleFav(detailId);
  const isFav = favs.includes(detailId);
  $('d-fav-btn').textContent = isFav ? '★' : '☆';
  $('d-fav-btn').style.color = isFav ? '#e8c97a' : 'var(--text3)';
}