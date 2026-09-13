'use strict';

function exportData(){
  const payload = {cats, data, favs, version: 2};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `adkari-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  toast('⬇️ Exported');
}

function importData(e, mode){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try{
      const json = JSON.parse(ev.target.result);
      if(!json.data || !Array.isArray(json.data)){ toast('⚠️ Invalid file'); return; }

      if(mode === 'replace'){
        if(Array.isArray(json.cats)){ cats = json.cats; saveCats(); }
        data = json.data; saveData();
        if(Array.isArray(json.favs)){ favs = json.favs; saveFavs(); }
        nextId = Math.max(0, ...data.map(d => d.id)) + 1;
        toast('⬆️ Imported (replaced)');
      } else {
        /* MERGE — bug fix #4: dedupe by full normalized Arabic, not first 60 chars */
        const key = d => normalizeAr(d.arabic).slice(0, 200);
        const existing = new Set(data.map(key));

        if(Array.isArray(json.cats)){
          const existKeys = new Set(cats.map(c => c.key));
          json.cats.forEach(c => {
            if(!existKeys.has(c.key)){ cats.push(c); existKeys.add(c.key); }
          });
          saveCats();
        }

        let added = 0;
        json.data.forEach(d => {
          const k = key(d);
          if(!existing.has(k)){
            data.push({...d, id: nextId++});
            existing.add(k);
            added++;
          }
        });
        saveData();

        if(Array.isArray(json.favs)){
          favs = [...new Set([...favs, ...json.favs])];
          saveFavs();
        }
        toast(`🔀 Merged: +${added} new adkar`);
      }
      renderCatsGrid();
      renderCatListBody();
    } catch {
      toast('⚠️ Invalid JSON file');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}