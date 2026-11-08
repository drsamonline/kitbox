/* ================================================================
   PRODUCTIVITY
   ================================================================ */
TOOLS.productivity = [];
let PRD_N = 0;
function prod(id, name, render){ register({cat:'productivity', id, name, render}); }

prod('pomodoro','Pomodoro Timer', root=>{
  root.innerHTML = `
    <div class="field"><label>Current task</label><input type="text" id="pmTask" placeholder="What are you working on?"></div>
    <div class="row">
      <div class="field"><label>Focus (min)</label><input type="number" id="pmWork" value="25" min="1"></div>
      <div class="field"><label>Break (min)</label><input type="number" id="pmBreak" value="5" min="1"></div>
    </div>
    <div class="counter-display" id="pmDisplay">25:00</div>
    <div class="output" id="pmStatus" style="text-align:center">Focus session</div>
    <div class="segrow"><button class="btn primary" id="pmStart">Start</button><button class="btn" id="pmPause">Pause</button><button class="btn ghost" id="pmReset">Reset</button></div>`;
  let remaining=25*60, timer=null, onBreak=false;
  setCleanup(()=>{ if(timer) clearInterval(timer); });
  function pmMin(id){ return Math.max(1, Math.floor(+root.querySelector(id).value)||1); }
  function fmt(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
  function render(){ root.querySelector('#pmDisplay').textContent = fmt(remaining); }
  root.querySelector('#pmStart').addEventListener('click', ()=>{
    if(timer) return;
    timer = setInterval(()=>{
      remaining--;
      if(remaining<=0){
        onBreak = !onBreak;
        remaining = (onBreak ? pmMin('#pmBreak') : pmMin('#pmWork'))*60;
        root.querySelector('#pmStatus').textContent = onBreak ? 'Break time' : 'Focus session';
      }
      render();
    },1000);
  });
  root.querySelector('#pmPause').addEventListener('click', ()=>{ clearInterval(timer); timer=null; });
  root.querySelector('#pmReset').addEventListener('click', ()=>{
    clearInterval(timer); timer=null; onBreak=false;
    remaining = pmMin('#pmWork')*60;
    root.querySelector('#pmStatus').textContent='Focus session';
    render();
  });
  root.querySelector('#pmWork').addEventListener('input', ()=>{ if(!onBreak && !timer){ remaining=pmMin('#pmWork')*60; render(); } });
  render();
});

prod('habittracker','Habit Tracker', root=>{
  let habits = store.get('habits-list', []);
  root.innerHTML = `
    <div class="row"><input type="text" id="htNew" placeholder="New habit, e.g. Drink water"><button class="btn primary" id="htAdd">+ Add</button></div>
    <div id="htList" style="margin-top:14px"></div>
    <div class="divider"></div>
    <div id="htExport"></div>`;
  exportImportRow(root.querySelector('#htExport'), 'habits-list', 'kitbox-habits.json', data=>{ habits = data||[]; draw(); });
  function persist(){ store.set('habits-list', habits); }
  function last7Days(){ const days=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); days.push(localDateStr(d)); } return days; }
  function streak(h){
    let s=0; let d=new Date();
    while(true){
      const key = localDateStr(d);
      if(h.log.includes(key)){ s++; d.setDate(d.getDate()-1); } else break;
    }
    return s;
  }
  function draw(){
    const days = last7Days();
    root.querySelector('#htList').innerHTML = habits.length ? habits.map((h,i)=>`
      <div class="score-card" style="text-align:left;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b>${escapeHtml(h.name)}</b>
          <span style="display:flex;align-items:center;gap:10px">
            <span class="hint" style="margin:0">🔥 ${streak(h)} day streak</span>
            <button class="btn ghost" data-rmh="${i}" style="padding:4px 8px" aria-label="Remove">✕</button>
          </span>
        </div>
        <div class="segrow" style="margin-top:10px;justify-content:flex-start">
          ${days.map(d=>{
            const done = h.log.includes(d);
            const label = new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'narrow'});
            return `<button class="btn ${done?'primary':''}" data-toggle="${i}|${d}" style="min-width:36px;padding:8px 0">${label}</button>`;
          }).join('')}
        </div>
      </div>`).join('') : '<div class="hint">No habits yet — add one above.</div>';
    root.querySelectorAll('[data-toggle]').forEach(b=>b.addEventListener('click', ()=>{
      const [idx,date] = b.dataset.toggle.split('|');
      const h = habits[+idx];
      const pos = h.log.indexOf(date);
      if(pos===-1) h.log.push(date); else h.log.splice(pos,1);
      persist(); draw();
    }));
    root.querySelectorAll('[data-rmh]').forEach(b=>b.addEventListener('click', ()=>{ habits.splice(+b.dataset.rmh,1); persist(); draw(); }));
  }
  root.querySelector('#htAdd').addEventListener('click', ()=>{
    const name = root.querySelector('#htNew').value.trim();
    if(!name) return;
    habits.push({name, log:[]});
    persist(); root.querySelector('#htNew').value=''; draw();
  });
  draw();
});

prod('notepad','Notepad', root=>{
  // Notes are the one collection that genuinely grows, so they live in
  // IndexedDB when the browser has it. The synchronous copy is still read
  // first so the list paints immediately; the async read replaces it a tick
  // later, and doubles as the migration from the localStorage version.
  let notes = store.get('notepad-notes', []);
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Title</label><input type="text" id="npTitle"></div>
    </div>
    <div class="field"><label>Note</label><textarea id="npBody" style="min-height:140px"></textarea></div>
    <div class="segrow"><button class="btn primary" id="npSave">Save note</button><button class="btn ghost" id="npClear">Clear form</button></div>
    <div class="divider"></div>
    <div class="section-label" style="margin:0 0 10px">Saved notes</div>
    <input type="search" id="npFilter" placeholder="Search notes…" autocomplete="off" aria-label="Search notes" style="width:100%;border:1px solid var(--line-strong);background:var(--panel);padding:9px 11px;font-size:13.5px;margin-bottom:10px">
    <div id="npList"></div>
    <div class="divider"></div>
    <div id="npExport"></div>`;
  exportImportRow(root.querySelector('#npExport'), 'notepad-notes', 'kitbox-notes.json', data=>{ notes = data||[]; drawList(); });
  let editingIdx = null;
  function persist(){
    bigStore.set('notepad-notes', notes);
    store.remove('notepad-notes');   // the copy in localStorage is now stale
  }
  bigStore.get('notepad-notes', null).then(stored=>{
    if(Array.isArray(stored) && stored.length){ notes = stored; drawList(); }
  });
  function drawList(){
    const list = root.querySelector('#npList');
    if(!notes.length){ list.innerHTML = '<div class="hint">No notes yet.</div>'; return; }
    const q = (root.querySelector('#npFilter').value || '').trim().toLowerCase();
    const shown = notes.map((n,i)=>({n,i})).filter(({n})=> !q || ((n.title||'')+' '+(n.body||'')).toLowerCase().includes(q));
    if(!shown.length){ list.innerHTML = '<div class="hint">No note matches “'+escapeHtml(q)+'”.</div>'; return; }
    list.innerHTML = shown.map(({n,i})=>`
      <div class="score-card" style="text-align:left;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <b>${escapeHtml(n.title||'Untitled')}</b>
          <span>
            <button class="btn ghost" data-edit="${i}" style="padding:4px 8px">Edit</button>
            <button class="btn ghost" data-del="${i}" style="padding:4px 8px">Delete</button>
          </span>
        </div>
        <div style="white-space:pre-wrap;font-size:13.5px;color:var(--ink-soft);margin-top:6px">${escapeHtml((n.body||'').slice(0,200))}</div>
      </div>`).join('');
    list.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click', ()=>{
      const i=+b.dataset.edit; editingIdx=i;
      root.querySelector('#npTitle').value = notes[i].title;
      root.querySelector('#npBody').value = notes[i].body;
    }));
    list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', ()=>{
      if(!confirm('Delete this note? This can\'t be undone.')) return;
      notes.splice(+b.dataset.del,1); persist(); drawList();
    }));
  }
  root.querySelector('#npFilter').addEventListener('input', drawList);
  root.querySelector('#npSave').addEventListener('click', ()=>{
    const title = root.querySelector('#npTitle').value.trim();
    const body = root.querySelector('#npBody').value;
    if(!title && !body) return;
    if(editingIdx!==null){ notes[editingIdx] = {title,body}; editingIdx=null; }
    else notes.unshift({title,body});
    persist(); drawList();
    root.querySelector('#npTitle').value=''; root.querySelector('#npBody').value='';
  });
  root.querySelector('#npClear').addEventListener('click', ()=>{
    editingIdx=null; root.querySelector('#npTitle').value=''; root.querySelector('#npBody').value='';
  });
  drawList();
});

prod('backup','Backup & Restore', root=>{
  root.innerHTML = `
    <div class="hint">Everything Kitbox saves on this device lives only in this browser's local storage — nothing is synced anywhere. This page lists all of it, with the space each item uses, and can export, encrypt, restore or erase any of it.</div>
    <table class="mono" id="bkList" style="margin:16px 0"></table>
    <div class="segrow">
      <button class="btn primary" id="bkExportAll">⬇ Export everything</button>
      <button class="btn" id="bkExportEnc">🔒 Export encrypted</button>
      <label class="btn" style="cursor:pointer">⬆ Restore from file<input type="file" accept="application/json,application/octet-stream,.json,.kbx" id="bkImportAll" style="display:none"></label>
    </div>
    <div class="field" id="bkPassWrap" style="display:none">
      <label>Passphrase for the encrypted backup</label>
      <input type="text" id="bkPass" placeholder="at least 8 characters — there is no reset">
      <div class="hint" id="bkPassHint" style="margin-top:6px"></div>
    </div>
    <div class="hint" id="bkMsg" style="display:none"></div>
    <div class="segrow" style="margin-top:16px"><button class="btn ghost" id="bkClearAll">Erase all Kitbox data on this device</button></div>`;

  const declared = Object.keys(STORE_KEYS);
  function labelFor(k){
    if(STORE_KEYS[k]) return STORE_KEYS[k].label;
    const pref = declared.find(d=>d.endsWith('*') && k.startsWith(d.slice(0, -1)));
    return pref ? STORE_KEYS[pref].label : k;
  }
  function isKnown(k){
    if(STORE_KEYS[k]) return true;
    return declared.some(d=>d.endsWith('*') && k.startsWith(d.slice(0, -1)));
  }

  function drawList(){
    const keys = store.allKeys().sort();
    const total = keys.reduce((a,k)=>a + store.bytes(k), 0);
    root.querySelector('#bkList').innerHTML = keys.length
      ? `<tr><td>Storage schema</td><td>v${store.get('schema', 0)} of ${STORE_SCHEMA}</td><td></td></tr>`
        + keys.map(k=>`<tr><td>${escapeHtml(labelFor(k))}</td><td>${fmtBytes(store.bytes(k))}</td>
            <td style="text-align:right"><button class="btn ghost" data-erase="${escapeHtml(k)}" style="padding:2px 8px;font-size:12px">Erase</button></td></tr>`).join('')
        + `<tr><td><b>Total</b></td><td><b>${fmtBytes(total)}</b></td><td></td></tr>`
      : '<tr><td>No saved data yet on this device.</td><td></td><td></td></tr>';
    root.querySelectorAll('[data-erase]').forEach(b=>b.addEventListener('click', ()=>{
      const k = b.dataset.erase;
      if(!confirm('Erase "' + labelFor(k) + '"? This cannot be undone.')) return;
      store.remove(k);
      toast('Erased ' + labelFor(k));
      drawList();
    }));
  }

  function exportAll(){
    const data = {};
    store.allKeys().forEach(k=>{ data[k] = store.get(k); });
    return { app: 'Kitbox', version: APP_VERSION, schema: STORE_SCHEMA, exportedAt: new Date().toISOString(), data };
  }

  root.querySelector('#bkExportAll').addEventListener('click', ()=>{
    downloadJSON(exportAll(), 'kitbox-backup.json');
    const msg = root.querySelector('#bkMsg');
    msg.style.display = 'block';
    msg.textContent = 'Exported ' + store.allKeys().length + ' item(s).';
  });

  root.querySelector('#bkExportEnc').addEventListener('click', async ()=>{
    const wrap = root.querySelector('#bkPassWrap');
    const msg = root.querySelector('#bkMsg');
    msg.style.display = 'block';
    if(wrap.style.display === 'none'){
      wrap.style.display = 'block';
      root.querySelector('#bkPass').focus();
      msg.textContent = 'Choose a passphrase, then press Export encrypted again.';
      return;
    }
    const pass = root.querySelector('#bkPass').value;
    if(pass.length < 8){ msg.textContent = 'Use a passphrase of at least 8 characters.'; return; }
    if(!cryptoAvailable()){ msg.textContent = CRYPTO_MSG; return; }
    try{
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const base = await crypto.subtle.importKey('raw', bytesFromText(pass), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:250000, hash:'SHA-256'},
        base, {name:'AES-GCM', length:256}, false, ['encrypt']);
      const ct = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, bytesFromText(JSON.stringify(exportAll()))));
      const head = new Uint8Array(4 + 16 + 12);
      head.set([0x4b,0x42,0x42,0x31], 0);   // "KBB1"
      head.set(salt, 4); head.set(iv, 20);
      saveBlob(new Blob([head, ct], {type:'application/octet-stream'}), 'kitbox-backup.kbx');
      msg.textContent = 'Encrypted backup saved. Keep the passphrase somewhere else — there is no reset.';
    }catch(e){
      msg.textContent = 'Could not encrypt the backup: ' + (e.message || e);
    }
  });

  root.querySelector('#bkPass').addEventListener('input', e=>{
    const s = passStrength(e.target.value);
    root.querySelector('#bkPassHint').textContent = e.target.value ? s.label + (s.bits ? ' · about ' + s.bits + ' bits' : '') : '';
  });

  root.querySelector('#bkImportAll').addEventListener('change', async e=>{
    const file = e.target.files[0]; if(!file) return;
    const msg = root.querySelector('#bkMsg'); msg.style.display = 'block';
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isSealed = bytes.length > 40 && bytes[0] === 0x4b && bytes[1] === 0x42 && bytes[2] === 0x42 && bytes[3] === 0x31;

    let parsed = null;
    if(isSealed){
      const pass = root.querySelector('#bkPass').value || prompt('Passphrase for this encrypted backup:') || '';
      if(!cryptoAvailable()){ msg.textContent = CRYPTO_MSG; return; }
      try{
        const salt = bytes.slice(4, 20), iv = bytes.slice(20, 32), ct = bytes.slice(32);
        const base = await crypto.subtle.importKey('raw', bytesFromText(pass), 'PBKDF2', false, ['deriveKey']);
        const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:250000, hash:'SHA-256'},
          base, {name:'AES-GCM', length:256}, false, ['decrypt']);
        const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
        parsed = JSON.parse(textFromBytes(pt));
      }catch(err){
        msg.textContent = 'Could not open that backup — wrong passphrase, or the file was changed after it was sealed.';
        return;
      }
    } else {
      try{ parsed = JSON.parse(textFromBytes(bytes)); }
      catch(err){ msg.textContent = 'That file is not a Kitbox backup.'; return; }
    }

    try{
      const data = parsed && parsed.data ? parsed.data : parsed;
      if(!data || typeof data !== 'object') throw new Error('bad shape');
      const entries = Object.entries(data).filter(([k])=>isKnown(k));
      if(!entries.length) throw new Error('no known keys');
      entries.forEach(([k,v])=> store.set(k,v));
      const fromVersion = parsed && parsed.version ? ' from v' + parsed.version : '';
      const skipped = Object.keys(data).length - entries.length;
      msg.textContent = 'Restored ' + entries.length + ' item(s)' + fromVersion
        + (skipped ? ', skipped ' + skipped + ' key(s) this version does not know' : '') + '. Reopen a tool to see its data.';
      drawList();
    }catch(err){
      msg.textContent = 'That backup could not be restored — nothing was changed.';
    }
  });

  root.querySelector('#bkClearAll').addEventListener('click', ()=>{
    if(!confirm('This permanently erases every saved note, deck, score and setting stored by Kitbox on this device. This cannot be undone. Continue?')) return;
    store.allKeys().forEach(k=> store.remove(k));
    drawList();
  });

  drawList();
});

prod('sketchpad','Sketch Pad', root=>{
  root.innerHTML = `
    <div class="row" style="flex-wrap:wrap;gap:6px">
      ${['brush','eraser','line','rect','circle','fill','eyedropper','text'].map(t=>`<button class="btn spTool" data-tool="${t}" style="flex:none;padding:8px 10px">${({brush:'✏️',eraser:'🧹',line:'📏',rect:'⬜',circle:'⭕',fill:'🪣',eyedropper:'💧',text:'🔤'})[t]}</button>`).join('')}
    </div>
    <div class="row" style="align-items:center;margin-top:10px">
      <input type="color" id="spColor" value="#14141c" style="width:44px;height:38px;border:none;border-radius:8px;flex:none">
      <input type="range" id="spSize" min="1" max="40" value="5" style="flex:1">
      <span id="spSizeOut" style="font-family:var(--mono);font-size:12px;color:var(--muted);flex:none;width:28px">5px</span>
    </div>
    <div id="spPalette" style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0"></div>
    <div class="segrow" style="margin-bottom:10px">
      <button class="btn" id="spSavePalette">+ Save color</button>
      <button class="btn" id="spUndo">↩ Undo</button>
      <button class="btn" id="spRedo">↪ Redo</button>
      <button class="btn ghost" id="spClear">Clear</button>
    </div>
    <div style="position:relative;max-width:600px;margin:0 auto">
      <canvas id="spCanvas" width="600" height="420" tabindex="0" role="application"
        aria-label="Drawing canvas. Arrow keys move the cursor, Shift moves it faster, Space stamps the current tool."
        style="width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;touch-action:none;display:block"></canvas>
      <div id="spCursor" aria-hidden="true" style="display:none;position:absolute;width:12px;height:12px;border:2px solid #2f86eb;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none"></div>
    </div>
    <div class="hint" style="text-align:center;margin-top:8px">Keyboard: focus the canvas, move with the arrow keys (Shift for bigger steps), Space or Enter to stamp.</div>
    <div class="segrow" style="margin-top:12px"><button class="btn primary" id="spDownload">Download PNG</button></div>
  `;
  const canvas = root.querySelector('#spCanvas'), ctx = canvas.getContext('2d');
  ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  let tool='brush', color='#14141c', size=5;
  let drawing=false, startX=0, startY=0, snapshotBeforeShape=null;
  let undoStack=[], redoStack=[];
  let palette = store.get('sketchpad-palette', ['#14141c','#ffffff','#e31c7d','#2f86eb','#3fcb6b','#f2871a']);
  function drawPalette(){
    root.querySelector('#spPalette').innerHTML = palette.map(c=>`<button data-c="${c}" style="width:28px;height:28px;border-radius:8px;background:${c};border:1px solid var(--line)"></button>`).join('');
    root.querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click', ()=>{ color=b.dataset.c; root.querySelector('#spColor').value=color; }));
  }
  function saveState(){
    undoStack.push(canvas.toDataURL()); if(undoStack.length>40) undoStack.shift();
    redoStack=[];
  }
  function restore(dataUrl){
    const img = new Image();
    img.onload = ()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
    img.src = dataUrl;
  }
  root.querySelectorAll('.spTool').forEach(b=>b.addEventListener('click', ()=>{
    tool = b.dataset.tool;
    root.querySelectorAll('.spTool').forEach(x=>x.classList.remove('primary'));
    b.classList.add('primary');
  }));
  root.querySelector('#spColor').addEventListener('input', e=>color=e.target.value);
  root.querySelector('#spSize').addEventListener('input', e=>{ size=+e.target.value; root.querySelector('#spSizeOut').textContent=size+'px'; });
  /* Keyboard path: the canvas is the only tool in the app with no way in
     except a pointer. A cursor you can walk with the arrow keys and stamp with
     Space is not the same as drawing, but it is not nothing. */
  let kx = canvas.width/2, ky = canvas.height/2;
  function drawCursor(){
    const c = root.querySelector('#spCursor');
    const rect = canvas.getBoundingClientRect();
    const scale = (rect.width || canvas.width) / canvas.width;
    c.style.left = (kx*scale) + 'px';
    c.style.top = (ky*scale) + 'px';
    c.style.display = document.activeElement === canvas ? 'block' : 'none';
  }
  canvas.addEventListener('focus', drawCursor);
  canvas.addEventListener('blur', drawCursor);
  canvas.addEventListener('keydown', e=>{
    const step = e.shiftKey ? 10 : 2;
    const moves = {ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step]};
    if(moves[e.key]){
      e.preventDefault();
      kx = Math.max(0, Math.min(canvas.width, kx + moves[e.key][0]));
      ky = Math.max(0, Math.min(canvas.height, ky + moves[e.key][1]));
      drawCursor();
    } else if(e.key === ' ' || e.key === 'Enter'){
      e.preventDefault();
      saveState();
      ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.beginPath();
      ctx.arc(kx, ky, Math.max(1, size/2), 0, Math.PI*2);
      ctx.fill();
      drawCursor();
    }
  });
  window.addEventListener('resize', drawCursor);
  setCleanup(()=>window.removeEventListener('resize', drawCursor));

  root.querySelector('#spSavePalette').addEventListener('click', ()=>{
    if(!palette.includes(color)){ palette.push(color); store.set('sketchpad-palette', palette); drawPalette(); }
  });
  root.querySelector('#spUndo').addEventListener('click', ()=>{
    if(!undoStack.length) return;
    redoStack.push(canvas.toDataURL());
    restore(undoStack.pop());
  });
  root.querySelector('#spRedo').addEventListener('click', ()=>{
    if(!redoStack.length) return;
    undoStack.push(canvas.toDataURL());
    restore(redoStack.pop());
  });
  root.querySelector('#spClear').addEventListener('click', ()=>{
    saveState(); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  });
  root.querySelector('#spDownload').addEventListener('click', ()=>downloadCanvas(canvas,'sketch.png'));

  function pos(e){
    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = (e.touches? e.touches[0].clientY : e.clientY) - rect.top;
    return [cx*(canvas.width/rect.width), cy*(canvas.height/rect.height)];
  }
  function floodFill(x,y,fillColor){
    const img = ctx.getImageData(0,0,canvas.width,canvas.height);
    const data = img.data;
    const w=canvas.width, h=canvas.height;
    const startIdx = (Math.floor(y)*w+Math.floor(x))*4;
    const target = [data[startIdx],data[startIdx+1],data[startIdx+2],data[startIdx+3]];
    const fr=parseInt(fillColor.slice(1,3),16), fg=parseInt(fillColor.slice(3,5),16), fb=parseInt(fillColor.slice(5,7),16);
    if(target[0]===fr && target[1]===fg && target[2]===fb) return;
    const stack=[[Math.floor(x),Math.floor(y)]];
    while(stack.length){
      const [px,py] = stack.pop();
      if(px<0||py<0||px>=w||py>=h) continue;
      const idx=(py*w+px)*4;
      if(data[idx]!==target[0]||data[idx+1]!==target[1]||data[idx+2]!==target[2]||data[idx+3]!==target[3]) continue;
      data[idx]=fr; data[idx+1]=fg; data[idx+2]=fb; data[idx+3]=255;
      stack.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);
    }
    ctx.putImageData(img,0,0);
  }
  canvas.addEventListener('pointerdown', e=>{
    const [x,y] = pos(e);
    if(tool==='fill'){ saveState(); floodFill(x,y,color); return; }
    if(tool==='eyedropper'){ const d=ctx.getImageData(x,y,1,1).data; color=`#${d[0].toString(16).padStart(2,'0')}${d[1].toString(16).padStart(2,'0')}${d[2].toString(16).padStart(2,'0')}`; root.querySelector('#spColor').value=color; return; }
    if(tool==='text'){
      const txt = prompt('Enter text:'); if(!txt) return;
      saveState(); ctx.fillStyle=color; ctx.font=`${size*4}px sans-serif`; ctx.fillText(txt,x,y); return;
    }
    saveState();
    drawing=true; startX=x; startY=y;
    snapshotBeforeShape = canvas.toDataURL();
    if(tool==='brush'||tool==='eraser'){ ctx.beginPath(); ctx.moveTo(x,y); }
  });
  canvas.addEventListener('pointermove', e=>{
    if(!drawing) return;
    const [x,y] = pos(e);
    if(tool==='brush'||tool==='eraser'){
      ctx.strokeStyle = tool==='eraser' ? '#ffffff' : color;
      ctx.lineWidth=size; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.lineTo(x,y); ctx.stroke();
    } else if(['line','rect','circle'].includes(tool)){
      const img = new Image();
      img.onload = ()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0);
        ctx.strokeStyle=color; ctx.lineWidth=size;
        ctx.beginPath();
        if(tool==='line'){ ctx.moveTo(startX,startY); ctx.lineTo(x,y); }
        else if(tool==='rect'){ ctx.rect(startX,startY,x-startX,y-startY); }
        else if(tool==='circle'){ const r=Math.hypot(x-startX,y-startY); ctx.arc(startX,startY,r,0,Math.PI*2); }
        ctx.stroke();
      };
      img.src = snapshotBeforeShape;
    }
  });
  window.addEventListener('pointerup', ()=>{ drawing=false; });
  drawPalette();
});

prod('flashcards','Flashcards & Spaced Repetition', root=>{
  let decks = store.get('flashcard-decks', []);
  root.innerHTML = `<div id="fcRoot"></div>`;
  const view = root.querySelector('#fcRoot');
  function persist(){ store.set('flashcard-decks', decks); }
  function today(){ return localDateStr(); }
  function daysFromNow(n){ const d=new Date(); d.setDate(d.getDate()+n); return localDateStr(d); }

  function showDeckList(){
    view.innerHTML = `
      <div class="row"><input type="text" id="fcNewDeck" placeholder="New deck name..."><button class="btn primary" id="fcAddDeck">+ Create</button></div>
      <div class="segrow" style="margin-top:10px"><label class="btn" style="cursor:pointer">⬆ Import deck<input type="file" accept="application/json" id="fcImportDeck" style="display:none"></label></div>
      <div id="fcDecks" style="margin-top:14px"></div>
      <div class="divider"></div>
      <div class="section-label" style="margin:0 0 10px">All flashcard data</div>
      <div id="fcExportAll"></div>`;
    exportImportRow(view.querySelector('#fcExportAll'), 'flashcard-decks', 'kitbox-flashcards-all.json', data=>{ decks = data||[]; draw(); });
    view.querySelector('#fcImportDeck').addEventListener('change', async e=>{
      const file = e.target.files[0]; if(!file) return;
      try{
        const deck = await readJSONFile(file);
        if(!deck || !deck.name || !Array.isArray(deck.cards)) throw new Error('bad shape');
        deck.id = 'd'+Date.now();
        decks.push(deck); persist(); draw();
      }catch(err){ alert('That file doesn\'t look like a valid deck export.'); }
    });
    function draw(){
      view.querySelector('#fcDecks').innerHTML = decks.length ? decks.map(d=>{
        const due = d.cards.filter(c=>!c.due || c.due<=today()).length;
        return `<div class="score-card" style="text-align:left;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
          <div><b>${escapeHtml(d.name)}</b><div class="hint" style="margin:2px 0 0">${d.cards.length} cards · ${due} due today</div></div>
          <span class="segrow" style="margin:0">
            <button class="btn" data-open="${d.id}">Open</button>
            <button class="btn ghost" data-deldeck="${d.id}" aria-label="Remove">✕</button>
          </span>
        </div>`;
      }).join('') : '<div class="hint">No decks yet — create one above.</div>';
      view.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click', ()=>showDeck(b.dataset.open)));
      view.querySelectorAll('[data-deldeck]').forEach(b=>b.addEventListener('click', ()=>{
        decks = decks.filter(d=>d.id!==b.dataset.deldeck); persist(); draw();
      }));
    }
    view.querySelector('#fcAddDeck').addEventListener('click', ()=>{
      const name = view.querySelector('#fcNewDeck').value.trim();
      if(!name) return;
      decks.push({id:'d'+Date.now(), name, cards:[]});
      persist();
      showDeck(decks[decks.length-1].id);
    });
    draw();
  }

  function showDeck(deckId){
    const deck = decks.find(d=>d.id===deckId);
    view.innerHTML = `
      <button class="btn ghost" id="fcBack">← All decks</button>
      <h3 style="margin:12px 0 4px">${escapeHtml(deck.name)}</h3>
      <div class="row">
        <div class="field"><label>Front</label><input type="text" id="fcFront"></div>
        <div class="field"><label>Back</label><input type="text" id="fcBack2"></div>
      </div>
      <div class="segrow"><button class="btn primary" id="fcAddCard">+ Add card</button></div>
      <div class="segrow" style="margin:14px 0"><button class="btn primary" id="fcStudy">Study due cards</button><button class="btn" id="fcQuiz">Quiz mode</button><button class="btn ghost" id="fcExportDeck">⬇ Export this deck</button></div>
      <div id="fcCardList"></div>`;
    view.querySelector('#fcBack').addEventListener('click', showDeckList);
    view.querySelector('#fcExportDeck').addEventListener('click', ()=>{
      downloadJSON(deck, `kitbox-deck-${deck.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.json`);
    });
    function drawCards(){
      view.querySelector('#fcCardList').innerHTML = deck.cards.map((c,i)=>`
        <div class="row" style="border-bottom:1px solid var(--line);padding:8px 0;align-items:center">
          <div style="flex:1">${escapeHtml(c.front)}</div><div style="flex:1;color:var(--ink-soft)">${escapeHtml(c.back)}</div>
          <button class="btn ghost" data-delcard="${i}" style="flex:none;padding:4px 8px" aria-label="Remove">✕</button>
        </div>`).join('');
      view.querySelectorAll('[data-delcard]').forEach(b=>b.addEventListener('click', ()=>{ deck.cards.splice(+b.dataset.delcard,1); persist(); drawCards(); }));
    }
    view.querySelector('#fcAddCard').addEventListener('click', ()=>{
      const front = view.querySelector('#fcFront').value.trim(), back = view.querySelector('#fcBack2').value.trim();
      if(!front||!back) return;
      deck.cards.push({front, back, interval:0, ease:2.5, due:today()});
      persist(); view.querySelector('#fcFront').value=''; view.querySelector('#fcBack2').value=''; drawCards();
    });
    view.querySelector('#fcStudy').addEventListener('click', ()=>studySession(deck));
    view.querySelector('#fcQuiz').addEventListener('click', ()=>quizSession(deck));
    drawCards();
  }

  function studySession(deck){
    let queue = deck.cards.filter(c=>!c.due || c.due<=today());
    if(!queue.length){ view.innerHTML = `<div class="empty">No cards due right now. Nice work!</div><button class="btn" id="fcBackToDeck">← Back</button>`; view.querySelector('#fcBackToDeck').addEventListener('click',()=>showDeck(deck.id)); return; }
    let idx=0, revealed=false;
    function render(){
      const c = queue[idx];
      view.innerHTML = `
        <div class="hint">Card ${idx+1} of ${queue.length}</div>
        <div class="panel" style="text-align:center;padding:40px 20px;cursor:pointer" id="fcCardFace">
          <div style="font-size:20px;font-weight:600">${escapeHtml(revealed ? c.back : c.front)}</div>
          ${!revealed?'<div class="hint" style="margin-top:10px">Tap to reveal</div>':''}
        </div>
        ${revealed ? `<div class="segrow" style="margin-top:16px"><button class="btn" id="fcAgain">Again</button><button class="btn primary" id="fcGood">Good</button><button class="btn" id="fcEasy">Easy</button></div>` : ''}
        <div class="segrow" style="margin-top:14px"><button class="btn ghost" id="fcQuit">Exit</button></div>`;
      view.querySelector('#fcCardFace').addEventListener('click', ()=>{ revealed=true; render(); });
      view.querySelector('#fcQuit').addEventListener('click', ()=>showDeck(deck.id));
      if(revealed){
        function schedule(grade){
          // simplified SM-2: grade 0=again,1=good,2=easy
          if(grade===0){ c.interval=0; c.ease=Math.max(1.3,c.ease-0.2); c.due=today(); }
          else{
            c.interval = c.interval===0 ? 1 : Math.round(c.interval*c.ease);
            if(grade===2){ c.ease+=0.15; c.interval=Math.round(c.interval*1.3)||2; }
            c.due = daysFromNow(c.interval);
          }
          persist();
          idx++; revealed=false;
          if(idx>=queue.length) finish(); else render();
        }
        view.querySelector('#fcAgain').addEventListener('click', ()=>schedule(0));
        view.querySelector('#fcGood').addEventListener('click', ()=>schedule(1));
        view.querySelector('#fcEasy').addEventListener('click', ()=>schedule(2));
      }
    }
    function finish(){
      view.innerHTML = `<div class="empty">Session complete — ${queue.length} card(s) reviewed.</div><button class="btn primary" id="fcDone">← Back to deck</button>`;
      view.querySelector('#fcDone').addEventListener('click', ()=>showDeck(deck.id));
    }
    render();
  }

  function quizSession(deck){
    if(deck.cards.length<4){ view.innerHTML = `<div class="empty">Add at least 4 cards to use quiz mode.</div><button class="btn" id="fcBackQ">← Back</button>`; view.querySelector('#fcBackQ').addEventListener('click',()=>showDeck(deck.id)); return; }
    let order = [...deck.cards].sort(()=>Math.random()-0.5);
    let idx=0, score=0;
    function render(){
      if(idx>=order.length){
        view.innerHTML = `<div class="empty">Quiz complete — ${score}/${order.length} correct.</div><button class="btn primary" id="fcQuizDone">← Back to deck</button>`;
        view.querySelector('#fcQuizDone').addEventListener('click', ()=>showDeck(deck.id));
        return;
      }
      const c = order[idx];
      const distractors = deck.cards.filter(x=>x!==c).sort(()=>Math.random()-0.5).slice(0,3).map(x=>x.back);
      const options = [...distractors, c.back].sort(()=>Math.random()-0.5);
      view.innerHTML = `
        <div class="hint">Question ${idx+1} of ${order.length} · Score: ${score}</div>
        <div class="panel"><div style="font-size:18px;font-weight:600;margin-bottom:14px">${escapeHtml(c.front)}</div>
        <div class="grid" id="fcOptions" style="grid-template-columns:1fr">${options.map(o=>`<button class="tag" data-opt="${encodeURIComponent(o)}"><div class="name">${escapeHtml(o)}</div></button>`).join('')}</div></div>`;
      view.querySelectorAll('[data-opt]').forEach(b=>b.addEventListener('click', ()=>{
        const chosen = decodeURIComponent(b.dataset.opt);
        if(chosen===c.back) score++;
        idx++; render();
      }));
    }
    render();
  }

  showDeckList();
});

/* ================================================================
   FILES & DATA
   Ported into Kitbox from drsamonline/export-kit (ZIP writer),
   drsamonline/compress-kit (Compression Streams),
   drsamonline/crypto-kit (AES-256-GCM envelopes),
   drsamonline/app-image-toolkit (EXIF/GPS strip) and
   drsamonline/TTB (data + media utilities).
   Everything runs in this page: no upload, no dependency, no network.
   ================================================================ */
TOOLS.files = [];
let FIL_N = 0;
function fil(id, name, render){ register({cat:'files', id, name, render}); }

const FILES_HINT = `<div class="hint">Your file is read by this page only — nothing is uploaded, and nothing leaves this device.</div>`;

function bytesFromText(s){ return new TextEncoder().encode(s); }
function textFromBytes(b){ return new TextDecoder().decode(b); }
function fmtBytes(n){
  if(n < 1024) return n+' B';
  if(n < 1048576) return (n/1024).toFixed(1)+' KB';
  return (n/1048576).toFixed(2)+' MB';
}
function saveBlob(blob, filename){
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url; a.download = filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}
function readFileBytes(file){
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(new Uint8Array(r.result)); r.onerror=rej; r.readAsArrayBuffer(file); });
}

/* --- CRC32, shared by the ZIP writer and the checksum tool --- */
const CRC32_TABLE = (()=>{
  const t = new Uint32Array(256);
  for(let i=0;i<256;i++){ let c=i; for(let k=0;k<8;k++) c = c&1 ? 0xEDB88320 ^ (c>>>1) : c>>>1; t[i]=c>>>0; }
  return t;
})();
function crc32(bytes){
  let c = 0xFFFFFFFF;
  for(let i=0;i<bytes.length;i++) c = CRC32_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c>>>8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/* 1. ZIP Creator — store-only archive, written byte by byte. No library. */
fil('zipcreate','ZIP Creator', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>Files to bundle</label><input type="file" id="zpFiles" multiple></div>
    <div class="field"><label>Archive name</label><input type="text" id="zpName" value="kitbox-bundle.zip"></div>
    <div class="output" id="zpList">Choose one or more files to see them listed here.</div>
    <div class="row" style="margin-top:14px"><button class="btn primary" id="zpGo" disabled>Build ZIP</button></div>
    <div class="hint">Store-only ZIP (no compression) — it opens in every unzip tool, and it is honest about what it does rather than silently inflating your files.</div>`;
  const inp = root.querySelector('#zpFiles'), list = root.querySelector('#zpList'), go = root.querySelector('#zpGo');
  let picked = [];
  inp.addEventListener('change', ()=>{
    const chosen = Array.from(inp.files||[]);
    const big = chosen.filter(f=>fileTooBig(f));
    if(big.length){
      picked = [];
      go.disabled = true;
      list.innerHTML = `<div class="hint">${escapeHtml(fileTooBigMsg(big[0]))}</div>`;
      return;
    }
    picked = chosen;
    go.disabled = !picked.length;
    list.innerHTML = picked.length
      ? picked.map(f=>`<div style="display:flex;justify-content:space-between;gap:12px"><span>${escapeHtml(f.name)}</span><span class="mono">${fmtBytes(f.size)}</span></div>`).join('')
      : 'Choose one or more files to see them listed here.';
  });
  go.addEventListener('click', async ()=>{
    if(!picked.length) return;
    go.disabled = true; go.textContent = 'Building…';
    try{
      const entries = [];
      for(const f of picked) entries.push({ name: f.name, data: await readFileSafely(f) });
      const zip = buildZip(entries);
      saveBlob(new Blob([zip], {type:'application/zip'}), (root.querySelector('#zpName').value||'kitbox-bundle.zip').trim());
      list.innerHTML = `<div class="hint">Built ${escapeHtml((root.querySelector('#zpName').value||'').trim()||'kitbox-bundle.zip')} — ${entries.length} file(s), ${fmtBytes(zip.length)}.</div>`;
    }catch(e){
      list.innerHTML = `<div class="hint">Could not build the archive: ${escapeHtml(e.message||String(e))}</div>`;
    }finally{ go.disabled = false; go.textContent = 'Build ZIP'; }
  });
});

/* Store-only ZIP: local headers + central directory + EOCD. */
function buildZip(entries){
  const enc = new TextEncoder();
  const chunks = [], central = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours()&31)<<11) | ((now.getMinutes()&63)<<5) | ((now.getSeconds()/2)&31);
  const dosDate = (((now.getFullYear()-1980)&127)<<9) | (((now.getMonth()+1)&15)<<5) | (now.getDate()&31);
  const u16 = v=>[v&0xFF,(v>>>8)&0xFF];
  const u32 = v=>[v&0xFF,(v>>>8)&0xFF,(v>>>16)&0xFF,(v>>>24)&0xFF];

  entries.forEach(e=>{
    const name = enc.encode(e.name);
    const crc = crc32(e.data);
    const local = [].concat(
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate),
      u32(crc), u32(e.data.length), u32(e.data.length), u16(name.length), u16(0),
      Array.from(name)
    );
    chunks.push(new Uint8Array(local), e.data);
    central.push({ name, crc, size: e.data.length, offset });
    offset += local.length + e.data.length;
  });

  const cdChunks = [];
  let cdSize = 0;
  central.forEach(c=>{
    const cd = [].concat(
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dosTime), u16(dosDate),
      u32(c.crc), u32(c.size), u32(c.size), u16(c.name.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(c.offset), Array.from(c.name)
    );
    cdChunks.push(new Uint8Array(cd));
    cdSize += cd.length;
  });

  const eocd = new Uint8Array([].concat(
    u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length),
    u32(cdSize), u32(offset), u16(0)
  ));

  const all = [...chunks, ...cdChunks, eocd];
  const total = all.reduce((a,b)=>a+b.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  all.forEach(c=>{ out.set(c, p); p += c.length; });
  return out;
}

/* 2. GZIP Compress / Decompress — platform Compression Streams, no library. */
fil('gzip','GZIP Compress / Decompress', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>File</label><input type="file" id="gzFile"></div>
    <div class="row">
      <button class="btn primary" id="gzZip">Compress → .gz</button>
      <button class="btn" id="gzUnzip">Decompress a .gz</button>
    </div>
    <div class="output" id="gzOut">Pick a file, then choose an action.</div>`;
  const out = root.querySelector('#gzOut');
  async function run(mode){
    const f = root.querySelector('#gzFile').files[0];
    if(!f){ out.textContent = 'Choose a file first.'; return; }
    if(fileTooBig(f)){ out.textContent = fileTooBigMsg(f); return; }
    if(typeof CompressionStream === 'undefined'){
      out.textContent = 'This browser does not expose Compression Streams — try a current Chrome, Edge, Firefox or Safari.';
      return;
    }
    out.textContent = 'Working…';
    try{
      const data = await readFileSafely(f);
      const stream = new Blob([data]).stream().pipeThrough(mode==='zip' ? new CompressionStream('gzip') : new DecompressionStream('gzip'));
      const buf = new Uint8Array(await new Response(stream).arrayBuffer());
      const name = mode==='zip' ? f.name+'.gz' : f.name.replace(/\.gz$/i,'') || 'decompressed';
      saveBlob(new Blob([buf]), name);
      const pct = mode==='zip' ? (100 - (buf.length/Math.max(1,data.length))*100) : 0;
      out.innerHTML = `${escapeHtml(f.name)} · ${fmtBytes(data.length)} → <b>${fmtBytes(buf.length)}</b>${mode==='zip'?` · ${pct.toFixed(1)}% smaller`:''}<div class="hint">Saved as ${escapeHtml(name)}.</div>`;
    }catch(e){
      out.innerHTML = `<div class="hint">That file could not be processed — ${escapeHtml(e.message||String(e))}. A .gz file is expected for decompression.</div>`;
    }
  }
  root.querySelector('#gzZip').addEventListener('click', ()=>run('zip'));
  root.querySelector('#gzUnzip').addEventListener('click', ()=>run('unzip'));
});

/* 3. File Hash & Checksum — SHA family via Web Crypto, CRC32 in JS. */
fil('filehash','File Hash & Checksum', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>File</label><input type="file" id="fhFile"></div>
    <div class="output" id="fhOut">Pick a file to hash it.</div>
    <div class="hint">SHA-1/256/384/512 come from the browser's Web Crypto implementation; CRC32 is computed here. Paste a checksum to compare it against the file.</div>
    <div class="field"><label>Compare against (optional)</label><input type="text" id="fhExpect" placeholder="paste a checksum to verify"></div>
    <div class="hint" id="fhVerdict"></div>`;
  const out = root.querySelector('#fhOut');
  async function run(){
    const f = root.querySelector('#fhFile').files[0];
    if(!f) return;
    if(fileTooBig(f)){ out.textContent = fileTooBigMsg(f); return; }
    out.textContent = 'Hashing…';
    let data;
    try{ data = await readFileSafely(f); }
    catch(e){ out.textContent = e.message; return; }
    const rows = [];
    const algos = [['SHA-1','SHA-1'],['SHA-256','SHA-256'],['SHA-384','SHA-384'],['SHA-512','SHA-512']];
    for(const [label, algo] of algos){
      if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
      try{
        const buf = await crypto.subtle.digest(algo, data);
        rows.push([label, Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')]);
      }catch(e){ rows.push([label,'unavailable in this browser']); }
    }
    rows.push(['CRC32', crc32(data).toString(16).padStart(8,'0')]);
    out.innerHTML = `<div class="hint">${escapeHtml(f.name)} · ${fmtBytes(data.length)}</div>
      <table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td style="word-break:break-all">${v}</td></tr>`).join('')}</table>`;
    const expect = (root.querySelector('#fhExpect').value||'').trim().toLowerCase();
    const verdict = root.querySelector('#fhVerdict');
    if(!expect){ verdict.textContent=''; return; }
    const hit = rows.some(([k,v])=>v.toLowerCase()===expect);
    verdict.innerHTML = hit ? '✓ Matches one of the checksums above.' : '✗ No checksum above matches what you pasted.';
  }
  root.querySelector('#fhFile').addEventListener('change', run);
  root.querySelector('#fhExpect').addEventListener('input', run);
});

/* 4. Encrypt / Decrypt a File — AES-256-GCM, PBKDF2-SHA256 (crypto-kit envelope). */
fil('filecrypt','Encrypt / Decrypt a File', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>File</label><input type="file" id="fcFile"></div>
    <div class="field"><label>Passphrase</label><input type="text" id="fcPass" placeholder="a long passphrase — this is the only key">
      <div class="hint" id="fcPassHint" style="margin-top:6px">At least 8 characters. A five-word passphrase beats a short password with symbols in it.</div></div>
    <div class="row">
      <button class="btn primary" id="fcEnc">Encrypt → .kbx</button>
      <button class="btn" id="fcDec">Decrypt a .kbx</button>
    </div>
    <div class="output" id="fcOut">Pick a file and set a passphrase.</div>
    <div class="hint">AES-256-GCM with a PBKDF2-SHA256 key (250,000 iterations). The passphrase is never stored — lose it and the file cannot be recovered. Decryption fails loudly if the file was altered. Buffers are zeroed after use, but a browser cannot guarantee that a copy is not still in memory: encrypt at rest, not as a substitute for a locked screen.</div>`;
  const out = root.querySelector('#fcOut');
  const MAGIC = [0x4b,0x42,0x58,0x31]; // "KBX1"
  const ITER = 250000;
  async function keyFrom(pass, salt){
    const base = await crypto.subtle.importKey('raw', bytesFromText(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:ITER, hash:'SHA-256'},
      base, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
  }
  async function run(mode){
    const f = root.querySelector('#fcFile').files[0];
    const pass = root.querySelector('#fcPass').value;
    if(!f){ out.textContent = 'Choose a file first.'; return; }
    if(fileTooBig(f, 100)){ out.textContent = fileTooBigMsg(f, 100); return; }
    if(!pass || pass.length < 8){ out.textContent = 'Use a passphrase of at least 8 characters.'; return; }
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    out.textContent = 'Working…';
    try{
      const data = await readFileSafely(f);
      if(mode==='enc'){
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await keyFrom(pass, salt);
        const ct = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, data));
        const head = new Uint8Array(4+16+12);
        head.set(MAGIC,0); head.set(salt,4); head.set(iv,20);
        const blob = new Blob([head, ct]);
        const name = f.name+'.kbx';
        saveBlob(blob, name);
        out.innerHTML = `Encrypted ${escapeHtml(f.name)} → ${escapeHtml(name)}<div class="hint">${fmtBytes(data.length)} → ${fmtBytes(blob.size)}. Keep the passphrase somewhere safe — there is no reset.</div>`;
      } else {
        if(data.length < 33 || data[0]!==MAGIC[0] || data[1]!==MAGIC[1] || data[2]!==MAGIC[2] || data[3]!==MAGIC[3]){
          out.textContent = 'That does not look like a Kitbox .kbx file.'; return;
        }
        const salt = data.slice(4,20), iv = data.slice(20,32), ct = data.slice(32);
        const key = await keyFrom(pass, salt);
        const pt = new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct));
        const name = f.name.replace(/\.kbx$/i,'') || 'decrypted';
        saveBlob(new Blob([pt]), name);
        // Best effort only: JavaScript cannot promise a string or buffer is
        // gone from memory, and the browser may have copied it already.
        try{ pt.fill(0); data.fill(0); }catch(e){}
        out.innerHTML = `Decrypted → ${escapeHtml(name)}<div class="hint">${fmtBytes(pt.length)} recovered.</div>`;
      }
    }catch(e){
      out.innerHTML = `<div class="hint">${mode==='dec'?'Decryption failed — wrong passphrase, or the file was changed after it was sealed.':'Encryption failed'} (${escapeHtml(e.message||String(e))}).</div>`;
    }
  }
  root.querySelector('#fcPass').addEventListener('input', e=>{
    const s = passStrength(e.target.value);
    const el = root.querySelector('#fcPassHint');
    el.textContent = e.target.value
      ? s.label + (s.bits ? ' · about ' + s.bits + ' bits' : '') + ' — this is the only key; there is no reset.'
      : 'At least 8 characters. A five-word passphrase beats a short password with symbols in it.';
  });
  root.querySelector('#fcEnc').addEventListener('click', ()=>run('enc'));
  root.querySelector('#fcDec').addEventListener('click', ()=>run('dec'));
});

/* 5. Sealed Note — write a note, seal it with a passphrase, open it once. */
fil('sealednote','Sealed Note', root=>{
  root.innerHTML = `
    <div class="segrow">
      <button class="btn primary" data-mode="seal">Seal a note</button>
      <button class="btn" data-mode="open">Open a sealed note</button>
    </div>
    <div id="snBody"></div>
    <div class="hint">The note is encrypted in this page with AES-256-GCM and handed to you as a block of text. Whoever holds that block and the passphrase can open it once. Nothing is stored in this browser.</div>`;
  const body = root.querySelector('#snBody');
  function seal(){
    body.innerHTML = `
      <div class="field"><label>Note</label><textarea id="snText" placeholder="The thing you want to say, once."></textarea></div>
      <div class="field"><label>Passphrase</label><input type="text" id="snPass" placeholder="share this separately">
        <div class="hint" id="snPassHint" style="margin-top:6px">At least 6 characters. Send the sealed block and the passphrase through different channels.</div></div>
      <button class="btn primary" id="snGo">Seal it</button>
      <div class="output" id="snOut" style="display:none"></div>`;
    body.querySelector('#snPass').addEventListener('input', e=>{
      const s = passStrength(e.target.value);
      body.querySelector('#snPassHint').textContent = e.target.value
        ? s.label + (s.bits ? ' · about ' + s.bits + ' bits' : '')
        : 'At least 6 characters. Send the sealed block and the passphrase through different channels.';
    });
    body.querySelector('#snGo').addEventListener('click', async ()=>{
      const text = body.querySelector('#snText').value;
      const pass = body.querySelector('#snPass').value;
      const out = body.querySelector('#snOut');
      out.style.display = 'block';
      if(!text.trim()){ out.textContent = 'Write something first.'; return; }
      if(pass.length < 6){ out.textContent = 'Use a passphrase of at least 6 characters.'; return; }
      try{
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const base = await crypto.subtle.importKey('raw', bytesFromText(pass), 'PBKDF2', false, ['deriveKey']);
        const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:250000, hash:'SHA-256'},
          base, {name:'AES-GCM', length:256}, false, ['encrypt']);
        const ct = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, bytesFromText(text)));
        const all = new Uint8Array(salt.length+iv.length+ct.length);
        all.set(salt,0); all.set(iv,16); all.set(ct,28);
        let bin = ''; all.forEach(b=>bin += String.fromCharCode(b));
        out.innerHTML = `<div class="hint">Sealed. Send this block and the passphrase through different channels.</div>
          <textarea id="snSealed" style="min-height:120px" readonly>${btoa(bin)}</textarea>`;
        body.querySelector('#snSealed').addEventListener('click', e=>e.target.select());
      }catch(e){ out.textContent = 'Sealing failed: '+(e.message||e); }
    });
  }
  function open(){
    body.innerHTML = `
      <div class="field"><label>Sealed block</label><textarea id="snIn" placeholder="paste the sealed text"></textarea></div>
      <div class="field"><label>Passphrase</label><input type="text" id="snPass2"></div>
      <button class="btn primary" id="snOpen">Open once</button>
      <div class="output" id="snOut2" style="display:none"></div>`;
    body.querySelector('#snOpen').addEventListener('click', async ()=>{
      const out = body.querySelector('#snOut2');
      out.style.display = 'block';
      try{
        const raw = atob(body.querySelector('#snIn').value.trim());
        const all = Uint8Array.from(raw, c=>c.charCodeAt(0));
        if(all.length < 29) throw new Error('not a sealed note');
        const salt = all.slice(0,16), iv = all.slice(16,28), ct = all.slice(28);
        const base = await crypto.subtle.importKey('raw', bytesFromText(body.querySelector('#snPass2').value), 'PBKDF2', false, ['deriveKey']);
        const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:250000, hash:'SHA-256'},
          base, {name:'AES-GCM', length:256}, false, ['decrypt']);
        const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
        out.innerHTML = `<div class="hint">Opened. This is the only time it will be shown — copy it now.</div>
          <div style="white-space:pre-wrap;font-family:var(--mono);font-size:13.5px;line-height:1.6">${escapeHtml(textFromBytes(pt))}</div>`;
        body.querySelector('#snIn').value = '';
      }catch(e){ out.textContent = 'Could not open it — wrong passphrase, or the block was altered.'; }
    });
  }
  root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click', ()=>{
    root.querySelectorAll('[data-mode]').forEach(x=>x.classList.remove('primary'));
    b.classList.add('primary');
    b.dataset.mode==='seal' ? seal() : open();
  }));
  seal();
});

/* 6. CSV ↔ JSON */
fil('csvjson','CSV ↔ JSON', root=>{
  root.innerHTML = `
    <div class="field"><label>CSV in (first row = header)</label><textarea id="cjIn" placeholder="name,city\nAsha,Vadodara\nRavi,Surat"></textarea></div>
    <div class="row">
      <button class="btn primary" id="cjToJson">CSV → JSON</button>
      <button class="btn" id="cjToCsv">JSON → CSV</button>
    </div>
    <div class="field"><label>Output</label><textarea id="cjOut" style="min-height:150px"></textarea></div>
    <div class="hint">Handles quoted fields, embedded commas and doubled quotes. Numbers and true/false are kept as typed unless you tick the box.</div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft)"><input type="checkbox" id="cjCast" checked> Cast numbers and booleans</label>`;
  const inp = root.querySelector('#cjIn'), out = root.querySelector('#cjOut'), cast = root.querySelector('#cjCast');
  function parseCsv(text){
    const rows = []; let row = [], field = '', q = false;
    for(let i=0;i<text.length;i++){
      const c = text[i];
      if(q){
        if(c === '"'){ if(text[i+1] === '"'){ field += '"'; i++; } else q = false; }
        else field += c;
      } else if(c === '"') q = true;
      else if(c === ','){ row.push(field); field=''; }
      else if(c === '\n'){ row.push(field); rows.push(row); row=[]; field=''; }
      else if(c === '\r'){ /* skip */ }
      else field += c;
    }
    if(field.length || row.length){ row.push(field); rows.push(row); }
    return rows.filter(r=>r.some(x=>x!==''));
  }
  function castVal(v){
    if(!cast.checked) return v;
    if(v === 'true') return true;
    if(v === 'false') return false;
    if(v !== '' && !isNaN(v) && /^-?\d*\.?\d+(e[-+]?\d+)?$/i.test(v.trim())) return Number(v);
    return v;
  }
  root.querySelector('#cjToJson').addEventListener('click', ()=>{
    const rows = parseCsv(inp.value);
    if(rows.length < 2){ out.value = 'Need a header row and at least one data row.'; return; }
    const head = rows[0];
    out.value = JSON.stringify(rows.slice(1).map(r=>{
      const o = {}; head.forEach((h,i)=>o[h.trim()||('col'+(i+1))] = castVal(r[i]!==undefined?r[i]:''));
      return o;
    }), null, 2);
  });
  root.querySelector('#cjToCsv').addEventListener('click', ()=>{
    let data;
    try{ data = JSON.parse(inp.value); }catch(e){ out.value = 'That is not valid JSON.'; return; }
    if(!Array.isArray(data)) data = [data];
    if(!data.length){ out.value = 'Empty array.'; return; }
    const keys = [...new Set(data.flatMap(o=>Object.keys(o||{})))];
    const esc = v=>{ const s = v==null?'':String(v); return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; };
    out.value = [keys.join(','), ...data.map(o=>keys.map(k=>esc(o[k])).join(','))].join('\n');
  });
});

/* 7. CSV Viewer & Sorter */
fil('csvtable','CSV Viewer', root=>{
  root.innerHTML = `
    <div class="field"><label>CSV</label><textarea id="cvIn" placeholder="Paste CSV, or choose a .csv file below"></textarea></div>
    <div class="field"><input type="file" id="cvFile" accept=".csv,text/csv"></div>
    <div class="output" id="cvMeta">Paste or open a CSV to see it as a table.</div>
    <div style="overflow:auto;max-height:520px"><table class="mono" id="cvTable"></table></div>`;
  const inp = root.querySelector('#cvIn'), meta = root.querySelector('#cvMeta'), tbl = root.querySelector('#cvTable');
  let rows = [], sortCol = -1, asc = true;
  function parse(text){
    const out = []; let row=[], f='', q=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
      else if(c==='"') q=true;
      else if(c===','){ row.push(f); f=''; }
      else if(c==='\n'){ row.push(f); out.push(row); row=[]; f=''; }
      else if(c!=='\r') f+=c;
    }
    if(f.length||row.length){ row.push(f); out.push(row); }
    return out.filter(r=>r.some(x=>x!==''));
  }
  function draw(){
    if(!rows.length){ tbl.innerHTML=''; return; }
    const head = rows[0], body = rows.slice(1);
    meta.innerHTML = `<div class="hint">${body.length} rows · ${head.length} columns${sortCol>=0?` · sorted by <b>${escapeHtml(head[sortCol])}</b> ${asc?'▲':'▼'}`:''}</div>`;
    tbl.innerHTML = `<tr>${head.map((h,i)=>`<th data-col="${i}" style="cursor:pointer;text-align:left;border-bottom:1px solid #ddd;padding:6px 10px 6px 0">${escapeHtml(h)}</th>`).join('')}</tr>`
      + body.map(r=>`<tr>${head.map((_,i)=>`<td style="padding:4px 10px 4px 0;border-bottom:1px solid #f0f0ee">${escapeHtml(r[i]==null?'':r[i])}</td>`).join('')}</tr>`).join('');
    tbl.querySelectorAll('[data-col]').forEach(th=>th.addEventListener('click', ()=>{
      const i = +th.dataset.col;
      if(sortCol===i) asc = !asc; else { sortCol = i; asc = true; }
      const num = body.every(r=>r[i]==='' || !isNaN(Number(r[i])));
      body.sort((a,b)=> num ? (Number(a[i])||0)-(Number(b[i])||0) : String(a[i]||'').localeCompare(String(b[i]||'')));
      if(!asc) body.reverse();
      rows = [head, ...body];
      draw();
    }));
  }
  inp.addEventListener('input', ()=>{ rows = parse(inp.value); sortCol=-1; draw(); });
  root.querySelector('#cvFile').addEventListener('change', async e=>{
    const f = e.target.files[0]; if(!f) return;
    inp.value = await f.text();
    rows = parse(inp.value); sortCol=-1; draw();
  });
});

/* 8. Photo Metadata & GPS — read EXIF, then strip it. */
fil('exif','Photo Metadata & GPS', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>JPEG photo</label><input type="file" id="exFile" accept="image/jpeg,image/*"></div>
    <div class="output" id="exOut">Choose a JPEG to read its metadata.</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="exStrip" disabled>Download a stripped copy</button></div>
    <div class="hint">Stripping removes the EXIF block entirely — camera, timestamps and GPS coordinates all go. The pixels are untouched.</div>`;
  const out = root.querySelector('#exOut'), strip = root.querySelector('#exStrip');
  let current = null;
  root.querySelector('#exFile').addEventListener('change', async e=>{
    const f = e.target.files[0]; if(!f) return;
    current = f;
    const buf = new Uint8Array(await f.arrayBuffer());
    const tags = readExif(buf);
    strip.disabled = false;
    if(!tags){ out.innerHTML = `<div class="hint">${escapeHtml(f.name)} · ${fmtBytes(f.size)} — no EXIF block found. Nothing to reveal or strip.</div>`; return; }
    out.innerHTML = `<div class="hint">${escapeHtml(f.name)} · ${fmtBytes(f.size)}</div>
      <table class="mono">${tags.map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td style="word-break:break-word">${escapeHtml(v)}</td></tr>`).join('')}</table>`;
  });
  strip.addEventListener('click', async ()=>{
    if(!current) return;
    const buf = new Uint8Array(await current.arrayBuffer());
    const clean = stripJpegMetadata(buf);
    saveBlob(new Blob([clean], {type:'image/jpeg'}), current.name.replace(/\.jpe?g$/i,'')+'-clean.jpg');
    out.innerHTML = `<div class="hint">Saved a copy with metadata removed — ${fmtBytes(buf.length)} → ${fmtBytes(clean.length)}.</div>`;
  });
});

function readExif(bytes){
  if(bytes[0] !== 0xFF || bytes[1] !== 0xD8) return null;
  let p = 2, app1 = null;
  while(p < bytes.length - 4){
    if(bytes[p] !== 0xFF) break;
    const marker = bytes[p+1], len = (bytes[p+2]<<8) | bytes[p+3];
    if(marker === 0xE1){
      const start = p+4;
      if(String.fromCharCode(...bytes.slice(start, start+4)) === 'Exif'){ app1 = {start, len}; break; }
    }
    if(marker === 0xDA) break;
    p += 2 + len;
  }
  if(!app1) return null;
  const tiff = app1.start + 6;
  const le = bytes[tiff] === 0x49;
  const rd16 = o => le ? (bytes[o] | (bytes[o+1]<<8)) : ((bytes[o]<<8) | bytes[o+1]);
  const rd32 = o => le ? (bytes[o] | (bytes[o+1]<<8) | (bytes[o+2]<<16) | (bytes[o+3]<<24)) : ((bytes[o]<<24) | (bytes[o+1]<<16) | (bytes[o+2]<<8) | bytes[o+3]);
  if(rd16(tiff+2) !== 0x2A) return null;
  const ifd0 = tiff + rd32(tiff+4);
  const wanted = {
    0x010F:'Camera make', 0x0110:'Camera model', 0x0131:'Software', 0x0112:'Orientation',
    0x0132:'Date modified', 0x9003:'Date taken', 0x829A:'Exposure (s)', 0x829D:'Aperture (f/)',
    0x8827:'ISO', 0x920A:'Focal length (mm)', 0x8769:'__exif', 0x8825:'__gps'
  };
  const tags = [];
  let gps = null;
  function readIfd(off, depth){
    if(depth > 2 || off <= 0 || off >= bytes.length) return;
    const count = rd16(off);
    for(let i=0;i<count;i++){
      const e = off + 2 + i*12;
      if(e + 12 > bytes.length) return;
      const tag = rd16(e), type = rd16(e+2), n = rd32(e+4);
      const label = wanted[tag];
      if(tag === 0x8769){ readIfd(tiff + rd32(e+8), depth+1); continue; }
      if(tag === 0x8825){ gps = tiff + rd32(e+8); continue; }
      if(!label) continue;
      const size = {1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8}[type] || 1;
      const total = size * n;
      const vo = total > 4 ? tiff + rd32(e+8) : e + 8;
      if(vo + total > bytes.length) continue;
      let val = '';
      if(type === 2){ val = String.fromCharCode(...bytes.slice(vo, vo+n)).replace(/\0+$/,''); }
      else if(type === 5 || type === 10){
        const num = type===5 ? rd32(vo) : rd32(vo), den = type===5 ? rd32(vo+4) : rd32(vo+4);
        val = den ? (num/den).toString() : String(num);
      }
      else if(type === 3) val = String(rd16(vo));
      else if(type === 4 || type === 9) val = String(rd32(vo));
      else val = Array.from(bytes.slice(vo, vo+Math.min(total,16))).join(' ');
      if(val) tags.push([label, val]);
    }
  }
  readIfd(ifd0, 0);
  if(gps){
    const count = rd16(gps);
    const grab = tag => {
      for(let i=0;i<count;i++){
        const e = gps + 2 + i*12;
        if(rd16(e) === tag){
          const type = rd16(e+2), n = rd32(e+4);
          if(type === 2) return String.fromCharCode(...bytes.slice(e+8, e+8+n)).replace(/\0+$/,'');
          const vo = tiff + rd32(e+8);
          const parts = [];
          for(let k=0;k<3;k++){ const num = rd32(vo+k*8), den = rd32(vo+k*8+4); parts.push(den?num/den:0); }
          return parts;
        }
      }
      return null;
    };
    const latRef = grab(1), lat = grab(2), lonRef = grab(3), lon = grab(4);
    if(Array.isArray(lat) && Array.isArray(lon)){
      const dec = (dms)=> dms[0] + dms[1]/60 + dms[2]/3600;
      const la = dec(lat) * (latRef==='S'?-1:1), lo = dec(lon) * (lonRef==='W'?-1:1);
      tags.push(['GPS location', `${la.toFixed(6)}, ${lo.toFixed(6)}`]);
      tags.push(['Map link', `https://www.openstreetmap.org/?mlat=${la.toFixed(6)}&mlon=${lo.toFixed(6)}#map=16/${la.toFixed(5)}/${lo.toFixed(5)}`]);
    }
  }
  return tags.length ? tags : null;
}

/* The Orientation tag is not metadata you want to lose: without it a phone
   photo taken in portrait comes back sideways, because the pixels were always
   sideways and the tag was the only thing saying otherwise. So the strip keeps
   that one tag and rebuilds a minimal EXIF block around it. */
function readOrientation(bytes){
  if(bytes[0] !== 0xFF || bytes[1] !== 0xD8) return null;
  let p = 2;
  while(p < bytes.length - 4){
    if(bytes[p] !== 0xFF) return null;
    const marker = bytes[p+1], len = (bytes[p+2]<<8) | bytes[p+3];
    if(marker === 0xE1 && String.fromCharCode(...bytes.slice(p+4, p+8)) === 'Exif'){
      const tiff = p + 10;
      const le = bytes[tiff] === 0x49;
      const rd16 = o => le ? (bytes[o] | (bytes[o+1]<<8)) : ((bytes[o]<<8) | bytes[o+1]);
      const rd32 = o => le ? (bytes[o] | (bytes[o+1]<<8) | (bytes[o+2]<<16) | (bytes[o+3]<<24))
                           : ((bytes[o]<<24) | (bytes[o+1]<<16) | (bytes[o+2]<<8) | bytes[o+3]);
      if(rd16(tiff+2) !== 0x2A) return null;
      const ifd = tiff + rd32(tiff+4);
      const count = rd16(ifd);
      for(let i=0;i<count;i++){
        const e = ifd + 2 + i*12;
        if(rd16(e) === 0x0112) return rd16(e+8);
      }
      return null;
    }
    if(marker === 0xDA) return null;
    p += 2 + len;
  }
  return null;
}

function minimalExif(orientation){
  // Little-endian TIFF header, one IFD entry (0x0112 Orientation, SHORT, 1),
  // then the APP1 wrapper. 34 bytes all told.
  const body = [
    0x49, 0x49, 0x2A, 0x00,             // II, 42
    0x08, 0x00, 0x00, 0x00,             // IFD0 at offset 8
    0x01, 0x00,                          // one entry
    0x12, 0x01,                          // tag 0x0112
    0x03, 0x00,                          // type SHORT
    0x01, 0x00, 0x00, 0x00,              // count 1
    orientation & 0xFF, (orientation >> 8) & 0xFF, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00               // no next IFD
  ];
  const payload = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00].concat(body);   // "Exif\0\0"
  const len = payload.length + 2;
  return new Uint8Array([0xFF, 0xE1, (len >> 8) & 0xFF, len & 0xFF].concat(payload));
}

function stripJpegMetadata(bytes){
  const orientation = readOrientation(bytes);
  const out = [bytes.slice(0,2)];
  // Re-attach the one tag that changes how the pixels are meant to be read.
  if(orientation && orientation > 1) out.push(minimalExif(orientation));
  let p = 2;
  while(p < bytes.length - 1){
    if(bytes[p] !== 0xFF){ out.push(bytes.slice(p)); break; }
    const marker = bytes[p+1];
    if(marker === 0xD8 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)){ out.push(bytes.slice(p, p+2)); p += 2; continue; }
    const len = (bytes[p+2]<<8) | bytes[p+3];
    const seg = bytes.slice(p, p+2+len);
    const drop = marker === 0xE1 || (marker >= 0xE2 && marker <= 0xEF) || marker === 0xFE;
    if(!drop) out.push(seg);
    p += 2 + len;
    if(marker === 0xDA){ out.push(bytes.slice(p)); break; }
  }
  const total = out.reduce((a,b)=>a+b.length,0);
  const res = new Uint8Array(total);
  let q = 0; out.forEach(c=>{ res.set(c,q); q += c.length; });
  return res;
}

/* 9. Image → Base64 / Data URI */
fil('imgbase64','Image → Base64', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>Image</label><input type="file" id="ibFile" accept="image/*"></div>
    <div class="output" id="ibOut">Choose an image to get its data URI.</div>
    <div class="field"><label>Data URI</label><textarea id="ibUri" style="min-height:110px" readonly></textarea></div>
    <div class="row"><button class="btn" id="ibCopy">Copy</button><button class="btn" id="ibCss">Copy as CSS background</button></div>
    <div class="hint">Above roughly 100 KB a data URI is a poor fit for HTML or CSS — it inflates the file and blocks rendering. Fine for icons, poor for photographs.</div>`;
  const out = root.querySelector('#ibOut'), uri = root.querySelector('#ibUri');
  root.querySelector('#ibFile').addEventListener('change', async e=>{
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ()=>{
      uri.value = r.result;
      out.innerHTML = `<div class="hint">${escapeHtml(f.name)} · ${fmtBytes(f.size)} · data URI ${fmtBytes(r.result.length)}</div>
        <img src="${r.result}" alt="" style="max-width:100%;border:1px solid #e4e4e2">`;
    };
    r.readAsDataURL(f);
  });
  function copy(text){
    if(!text) return;
    if(navigator.clipboard) navigator.clipboard.writeText(text);
    else { uri.select(); document.execCommand('copy'); }
  }
  root.querySelector('#ibCopy').addEventListener('click', ()=>copy(uri.value));
  root.querySelector('#ibCss').addEventListener('click', ()=>copy(`background-image:url("${uri.value}");`));
});

/* 10. Line Ending Converter */
fil('lineendings','Line Ending Converter', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="leIn" placeholder="Paste text — line endings are detected as you type"></textarea></div>
    <div class="hint" id="leDetect">—</div>
    <div class="segrow">
      <button class="btn" data-le="lf">Convert to LF (Unix)</button>
      <button class="btn" data-le="crlf">Convert to CRLF (Windows)</button>
      <button class="btn" data-le="cr">Convert to CR (old Mac)</button>
    </div>
    <div class="field"><label>Result</label><textarea id="leOut"></textarea></div>`;
  const inp = root.querySelector('#leIn'), out = root.querySelector('#leOut'), det = root.querySelector('#leDetect');
  function detect(){
    const t = inp.value;
    const crlf = (t.match(/\r\n/g)||[]).length, cr = (t.match(/\r(?!\n)/g)||[]).length, lf = (t.match(/(?<!\r)\n/g)||[]).length;
    const parts = [];
    if(crlf) parts.push(crlf+' CRLF');
    if(lf) parts.push(lf+' LF');
    if(cr) parts.push(cr+' CR');
    det.textContent = parts.length ? 'Detected: ' + parts.join(' · ') : 'No line breaks yet.';
  }
  inp.addEventListener('input', detect);
  root.querySelectorAll('[data-le]').forEach(b=>b.addEventListener('click', ()=>{
    const t = inp.value.replace(/\r\n|\r|\n/g, '\n');
    out.value = b.dataset.le === 'lf' ? t : b.dataset.le === 'crlf' ? t.replace(/\n/g,'\r\n') : t.replace(/\n/g,'\r');
    detect();
  }));
});

