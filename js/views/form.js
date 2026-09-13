'use strict';

function openForm(id = null){
  editId = id;
  $('form-title').textContent = id ? 'Edit Dhikr' : 'Add Dhikr';
  $('f-cat').innerHTML = cats.map(c => `<option value="${c.key}">${c.ar} — ${c.en}</option>`).join('');
  if(id){
    const d = data.find(x => x.id === id);
    $('f-arabic').value      = d.arabic;
    $('f-situation').value   = d.situation || '';
    $('f-translit').value    = d.transliteration || '';
    $('f-cat').value         = d.cat;
    $('f-repeat').value      = d.repeat;
    $('f-rel').value         = d.reliability || '';
    $('f-hadith').value      = d.hadith || '';
    $('f-virtue').value      = d.virtue || '';
  } else {
    ['f-arabic','f-situation','f-translit','f-hadith','f-virtue'].forEach(x => $(x).value = '');
    $('f-repeat').value = 3;
    $('f-rel').value = '';
    if(currentCat) $('f-cat').value = currentCat;
  }
  $('ov-form').classList.add('open');
  lockBody();
}

function closeForm(){
  $('ov-form').classList.remove('open');
  unlockBody();
}

function saveCard(){
  const arabic = $('f-arabic').value.trim();
  if(!arabic){ toast('⚠️ Arabic text required'); return; }
  const obj = {
    arabic,
    situation: $('f-situation').value.trim() || null,
    transliteration: $('f-translit').value.trim() || null,
    cat: $('f-cat').value,
    repeat: parseInt($('f-repeat').value) || 1,
    reliability: $('f-rel').value || null,
    hadith: $('f-hadith').value.trim() || null,
    virtue: $('f-virtue').value.trim() || null
  };
  if(editId){
    const i = data.findIndex(x => x.id === editId);
    data[i] = {...data[i], ...obj};
    toast('✏️ Updated');
  } else {
    obj.id = nextId++;
    data.push(obj);
    toast('✅ Added');
  }
  saveData();
  closeForm();
  if(currentCat) renderAdkarGrid();
  renderCatsGrid();
}