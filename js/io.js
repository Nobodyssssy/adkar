'use strict';

function exportData(){
  const payload = {cats, data, favs, version: 3};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `adkari-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  toast('Exported', 'download');
}

async function importData(e, mode){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    try{
      const json = JSON.parse(ev.target.result);
      if(!json.data || !Array.isArray(json.data)){ toast('Invalid file', 'alert'); return; }

      const normalized = json.data.map(d => {
        const obj = {...d};
        if(typeof obj.cat === 'string' && !Array.isArray(obj.categories)){
          obj.categories = [obj.cat];
          delete obj.cat;
        }
        if(!Array.isArray(obj.categories)) obj.categories = [];
        if(!Array.isArray(obj.tags)) obj.tags = [];
        return obj;
      });

      if(mode === 'replace'){
        if(Array.isArray(json.cats)){ cats = json.cats; await store.saveCats(cats); }
        data = normalized;
        await store.saveAdkar(data);
        if(Array.isArray(json.favs)){ favs = json.favs; await store.saveFavs(favs); }
        nextId = Math.max(0, ...data.map(d => d.id)) + 1;
        toast('Imported (replaced)', 'upload');
      } else {
        const key = d => normalizeAr(d.arabic).slice(0, 200);
        const existing = new Set(data.map(key));

        if(Array.isArray(json.cats)){
          const existKeys = new Set(cats.map(c => c.key));
          json.cats.forEach(c => {
            if(!existKeys.has(c.key)){ cats.push(c); existKeys.add(c.key); }
          });
          await store.saveCats(cats);
        }

        let added = 0;
        const toAdd = [];
        normalized.forEach(d => {
          const k = key(d);
          if(!existing.has(k)){
            const newD = {...d, id: nextId++};
            toAdd.push(newD);
            data.push(newD);
            existing.add(k);
            added++;
          }
        });
        if(toAdd.length) await store.saveAdkar(data);

        if(Array.isArray(json.favs)){
          favs = [...new Set([...favs, ...json.favs])];
          await store.saveFavs(favs);
        }
        toast(`Merged: +${added} new adkar`, 'shuffle');
      }
      renderCatsGrid();
      renderCatListBody();
    } catch(err) {
      console.error(err);
      toast('Invalid JSON file', 'alert');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}