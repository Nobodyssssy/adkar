'use strict';

function askDelDhikr(id){
  delId = id;
  delCat = null;
  $('conf-ico').innerHTML = icon('trash', 32);
  $('conf-t').textContent = 'Delete this dhikr?';
  $('conf-x').textContent = 'This cannot be undone.';
  $('ov-confirm').classList.add('open');
  lockBody();
}

function askDelCat(key){
  delCat = key;
  delId = null;
  const c = getCat(key);
  const n = data.filter(d =>
    Array.isArray(d.categories) && d.categories.includes(key)
  ).length;
  $('conf-ico').innerHTML = icon('layers', 32);
  $('conf-t').textContent = `Delete "${c.ar}"?`;
  $('conf-x').textContent = `This will remove it from ${n} adkar. Dhikr that were only in this category will be deleted entirely.`;
  $('ov-confirm').classList.add('open');
  lockBody();
}

function closeConfirm(){
  $('ov-confirm').classList.remove('open');
  delId = null;
  delCat = null;
  unlockBody();
}

function doDelete(){
  if(delCat){
    cats = cats.filter(c => c.key !== delCat);
    store.deleteCat(delCat);

    const toDelete = [];
    data.forEach(d => {
      if(!Array.isArray(d.categories)) return;
      if(!d.categories.includes(delCat)) return;
      d.categories = d.categories.filter(k => k !== delCat);
      if(d.categories.length === 0){
        toDelete.push(d.id);
      } else {
        store.putAdkar(d);
      }
    });
    toDelete.forEach(id => {
      data = data.filter(x => x.id !== id);
      store.deleteAdkar(id);
      favs = favs.filter(x => x !== id);
      store.removeFav(id);
      delete counters[`c_${id}`];
    });
    if(toDelete.length) store.saveCounters(counters);
    store.saveFavs(favs);

    toast('Category deleted', 'trash');
    renderCatListBody();
    renderCatsGrid();

  } else if(delId){
    favs = favs.filter(x => x !== delId);
    data = data.filter(x => x.id !== delId);
    delete counters[`c_${delId}`];
    store.deleteAdkar(delId);
    store.removeFav(delId);
    store.setCounter(delId, 0);
    toast('Deleted', 'trash');
    if(currentCat) renderAdkarGrid();
    renderCatsGrid();
  }
  closeConfirm();
}