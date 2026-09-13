'use strict';

function askDelDhikr(id){
  delId = id;
  delCat = null;
  $('conf-ico').textContent = '🗑️';
  $('conf-t').textContent = 'Delete this dhikr?';
  $('conf-x').textContent = 'This cannot be undone.';
  $('ov-confirm').classList.add('open');
  lockBody();
}

function askDelCat(key){
  delCat = key;
  delId = null;
  const c = getCat(key);
  const n = data.filter(d => d.cat === key).length;
  $('conf-ico').textContent = '📂';
  $('conf-t').textContent = `Delete "${c.ar}"?`;
  $('conf-x').textContent = `This will also delete ${n} adkar in this category.`;
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
    data = data.filter(d => d.cat !== delCat);
    saveCats(); saveData();
    toast('🗑️ Category deleted');
    renderCatListBody();
    renderCatsGrid();
  } else if(delId){
    favs = favs.filter(x => x !== delId);
    data = data.filter(x => x.id !== delId);
    delete counters[`c_${delId}`];
    saveData(); saveCtrs(); saveFavs();
    toast('🗑️ Deleted');
    if(currentCat) renderAdkarGrid();
    renderCatsGrid();
  }
  closeConfirm();
}