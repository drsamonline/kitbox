/* ============================================================
   TOOLY — offline toolbox. Single-file, zero dependencies.
   ============================================================ */

/* ---------- Category registry ---------- */
const CATS = [
  {id:'general',   code:'GEN', name:'General Tools',      color:'#C2185B', desc:'A number of different tools that can be used for a variety of purposes.', icon:'toolbox'},
  {id:'text',      code:'TXT', name:'Text Tools',          color:'#E6A400', desc:'More than thirty beneficial features that help you edit your text content.', icon:'text'},
  {id:'generator', code:'GNR', name:'Generator Tools',     color:'#9FCB1B', desc:'Generative tools for creating many types of things.', icon:'gen'},
  {id:'calc',      code:'CAL', name:'Calculation Tools',   color:'#F4483D', desc:'Helps you find the solutions of your mathematical operations.', icon:'calc'},
  {id:'image',     code:'IMG', name:'Image Tools',         color:'#2F86EB', desc:'Helpful tools that can be used to change your image\u2019s form.', icon:'image'},
  {id:'unit',      code:'UNI', name:'Unit Converter',      color:'#A93CF5', desc:'Various units of measure, weight, temperature and more.', icon:'unit'},
  {id:'finance',   code:'FIN', name:'Finance Tools',       color:'#3FCB6B', desc:'Financial tools to help you manage, calculate, and plan your finances.', icon:'finance'},
  {id:'random',    code:'RND', name:'Randomizer Tools',    color:'#22D9D9', desc:'A number of randomizer tools to assist you in making decisions.', icon:'dice'},
  {id:'health',    code:'HLT', name:'Health Tools',        color:'#1FCE9C', desc:'A number of different tools to support your wellness journey.', icon:'health'},
  {id:'dev',       code:'DEV', name:'Development Tools',   color:'#12A99A', desc:'Create an organized page for your codes using development tools.', icon:'dev'},
  {id:'colors',    code:'CLR', name:'Colors Tools',        color:'#F2871A', desc:'Several choices of color tools to help you handle colors.', icon:'palette'},
  {id:'science',   code:'SCI', name:'Science Tools',       color:'#7B4FE0', desc:'Physics, chemistry, and lab-relevant calculators.', icon:'science'},
  {id:'geo',       code:'GEO', name:'Geo Tools',           color:'#0E9F6E', desc:'Coordinates, distance, bearing, and sun position tools.', icon:'geo'},
  {id:'audio',     code:'AUD', name:'Audio Tools',         color:'#D6336C', desc:'Tone generator, metronome, noise, and audio utilities — powered by your device speaker and microphone.', icon:'audio'},
  {id:'games',     code:'GAM', name:'Games',               color:'#F59F00', desc:'Quick offline games and brain teasers.', icon:'games'},
  {id:'travel',    code:'TRV', name:'Travel Tools',        color:'#1971C2', desc:'Packing lists, flight duration, and travel reference tools.', icon:'travel'},
  {id:'nature',    code:'NAT', name:'Nature Tools',        color:'#2F9E44', desc:'Moon phase, solstices, and sky-related estimators.', icon:'nature'},
  {id:'productivity', code:'PRD', name:'Productivity',     color:'#495057', desc:'Focus timer and a simple offline notepad.', icon:'productivity'},
  {id:'files',     code:'FIL', name:'Files & Data',        color:'#3B5BDB', desc:'ZIP, gzip, hashing, encryption and metadata — your files stay on your device.', icon:'files'},
  {id:'almanac',   code:'ALM', name:'Almanac',              color:'#C2410C', desc:'Panchang, rahu kaal, sunrise and moon timings, computed from the Meeus series.', icon:'almanac'},
  {id:'comms',     code:'COM', name:'Communication',        color:'#0B7285', desc:'Contact cards, calendar invites and message links you can hand to any app.', icon:'comms'},
  {id:'reference', code:'REF', name:'Reference',            color:'#5F3DC4', desc:'Cheat sheets and tables you keep open beside the tool you are using.', icon:'reference'},
  {id:'system',    code:'SYS', name:'System',               color:'#343A40', desc:'What this browser and this device can actually do.', icon:'system'},
  {id:'accessibility', code:'ACC', name:'Accessibility', color:'#6D28D9', desc:'Reading, spacing and focus tools for making something readable by more people.', icon:'a11y'},
  {id:'education',  code:'EDU', name:'Education',        color:'#0891B2', desc:'Tables, references and drills for the things worth knowing by heart.', icon:'edu'},
  {id:'clinical',   code:'CLN', name:'Clinical',         color:'#B91C1C', desc:'Dose, drip and electrolyte arithmetic — with the caveat that a calculator is not a clinician.', icon:'clinical'},
  {id:'money',      code:'MNY', name:'Money (India)',    color:'#A16207', desc:'HRA, EPF, gratuity and maturity, in the rules an Indian salary actually follows.', icon:'money'},
];

const ICONS = {
  toolbox:'<path d="M3 8h18v11H3z"/><path d="M3 12h18"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  text:'<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/>',
  gen:'<rect x="4" y="4" width="16" height="4"/><path d="M4 12h16M4 16h10M4 20h6"/>',
  calc:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-4 4-3-3-6 6"/>',
  unit:'<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
  finance:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  dice:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3"/><circle cx="16" cy="8" r="1.3"/><circle cx="8" cy="16" r="1.3"/><circle cx="16" cy="16" r="1.3"/><circle cx="12" cy="12" r="1.3"/>',
  health:'<path d="M12 21s-7-4.35-9.5-8.5C.7 8.6 2.9 5 6.5 5c2 0 3.3 1 5.5 3 2.2-2 3.5-3 5.5-3 3.6 0 5.8 3.6 4 7.5C19 16.65 12 21 12 21z"/>',
  dev:'<polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/>',
  palette:'<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r="1.2"/><circle cx="12" cy="8" r="1.2"/><circle cx="15.5" cy="10.5" r="1.2"/><circle cx="9.5" cy="14.5" r="1.2"/><path d="M12 21a9 9 0 0 0 0-18 3 3 0 0 0 0 6h.5a2 2 0 0 1 0 4H12a2 2 0 0 0 0 4z" fill="none"/>',
  science:'<path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2"/><path d="M9 2h6"/><path d="M8 14h8"/>',
  geo:'<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  audio:'<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  games:'<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="10.5" r="1"/><circle cx="18" cy="13.5" r="1"/>',
  travel:'<path d="M3 12l18-8-8 18-2-8-8-2z"/>',
  nature:'<path d="M12 3a9 9 0 1 0 9 9c0-.5-.04-1-.1-1.5A6 6 0 0 1 12 3z"/>',
  productivity:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  files:'<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 11h16"/>',
  almanac:'<circle cx="12" cy="12" r="9"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/><path d="M12 7l3 5-3 5-3-5z"/>',
  comms:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  reference:'<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h5z"/>',
  a11y:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  edu:'<path d="M4 6h16v12H4z"/><path d="M8 6v12M4 10h16"/>',
  clinical:'<path d="M12 5v14M5 12h14"/>',
  money:'<path d="M4 18h16"/><path d="M8 18V9M12 18V5M16 18v-6"/>',
  system:'<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>',
};
/* Pick the text colour that actually passes on a tile, from the colour itself
   rather than by eye: 14 of the original 23 tiles failed WCAG AA with white
   text (white on #22D9D9 is 1.75:1 against a 4.5:1 threshold). */
function tileLuminance(hex){
  const h = String(hex||'#ffffff').replace('#','');
  const full = h.length === 3 ? h.split('').map(c=>c+c).join('') : h;
  const ch = [0,2,4].map(i=>parseInt(full.slice(i,i+2),16)/255)
    .map(c=> c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
  return 0.2126*ch[0] + 0.7152*ch[1] + 0.0722*ch[2];
}
function contrastWith(a, b){
  const la = tileLuminance(a), lb = tileLuminance(b);
  return (Math.max(la,lb) + 0.05) / (Math.min(la,lb) + 0.05);
}
const TILE_INK_DARK = '#17171d', TILE_INK_LIGHT = '#ffffff';
function inkFor(hex){
  return contrastWith(hex, TILE_INK_LIGHT) >= contrastWith(hex, TILE_INK_DARK) ? TILE_INK_LIGHT : TILE_INK_DARK;
}

function iconSvg(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.toolbox}</svg>`;}

/* ---------- Tool registry ---------- */
/* TOOLS[catId] = [{id, name, code, render(root)}]   render() builds the tool UI + wires events */
const TOOLS = {};

/* ---------------- storage helper ---------------- */
const APP_VERSION = '2.5.0';
const STORE_SCHEMA = 2;

/* Every key this app writes, what it is called, and which tool owns it. The
   backup tool builds its list from here instead of a hand-typed allow-list —
   which is what dropped the pinned/recents keys on the floor once. A key that
   is written but not declared here is a bug the test suite catches. */
const STORE_KEYS = {
  'simple-counter':        { label: 'Simple Counter', tool: 'general/counter' },
  'scoreboard':            { label: 'Scoreboard', tool: 'general/scoreboard' },
  'ruler-scale':           { label: 'Ruler calibration', tool: 'general/ruler' },
  'currency-rates':        { label: 'Currency rates', tool: 'finance/currency' },
  'notepad-notes':         { label: 'Notepad', tool: 'productivity/notepad' },
  'sketchpad-palette':     { label: 'Sketch Pad palette', tool: 'productivity/sketchpad' },
  'flashcard-decks':       { label: 'Flashcard decks', tool: 'productivity/flashcards' },
  'trivia-decks':          { label: 'Trivia quizzes', tool: 'games/triviacreator' },
  'habits-list':           { label: 'Habit Tracker', tool: 'productivity/habittracker' },
  'checklists':            { label: 'Checklists', tool: 'productivity/checklist' },
  'worldclock-cities':     { label: 'World Clock cities', tool: 'general/worldclock' },
  'clinical-health-entries': { label: 'Clinical health entries', tool: 'health/clinicalhealth' },
  'panchang-place':        { label: 'Panchang location', tool: 'almanac/panchang' },
  'pinned':                { label: 'Pinned tools', tool: 'shell' },
  'recent':                { label: 'Recently used', tool: 'shell' },
  'palette-history':       { label: 'Recent searches', tool: 'shell' },
  'seen-palette-hint':     { label: 'First-run hint dismissed', tool: 'shell' },
  'text-size':             { label: 'Text size', tool: 'shell' },
  'num-format':            { label: 'Number format', tool: 'shell' },
  'units':                 { label: 'Units preference', tool: 'shell' },
  'error-log':             { label: 'Error log', tool: 'system/errorlog' },
  'schema':                { label: 'Storage schema', tool: 'shell' },
  'unit-last-*':           { label: 'Last unit pair', tool: 'unit', prefix: true }
};

/* One write path, so a full disk is reported instead of swallowed. */
let quotaWarned = false;
const store = {
  get(k, d){ try{ const v = localStorage.getItem('tooly:'+k); return v===null? d : JSON.parse(v);}catch(e){return d;} },
  set(k, v){
    try{
      localStorage.setItem('tooly:'+k, JSON.stringify(v));
      return true;
    }catch(e){
      const full = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
      if(!quotaWarned){
        quotaWarned = true;
        try{
          toast(full
            ? 'This device\u2019s storage is full — that last change was not saved. Productivity \u2192 Backup & Restore shows what is using the space.'
            : 'That change could not be saved (storage blocked by the browser).');
        }catch(err){}
        try{ logError('storage', e); }catch(err){}
      }
      return false;
    }
  },
  remove(k){ try{ localStorage.removeItem('tooly:'+k); return true; }catch(e){ return false; } },
  allKeys(){ try{ return Object.keys(localStorage).filter(k=>k.startsWith('tooly:')).map(k=>k.slice(6)); }catch(e){ return []; } },
  bytes(k){ try{ return (localStorage.getItem('tooly:'+k)||'').length; }catch(e){ return 0; } }
};

/* Schema migrations. Each step runs once, in order, and the version is only
   written after it succeeds — a half-migrated store is worse than an old one. */
const MIGRATIONS = {
  1: ()=>{ /* versioning arrived after the data; existing keys are already v1 */ },
  2: ()=>{
    const habits = store.get('habits-list', null);
    if(Array.isArray(habits)) store.set('habits-list', habits.map(h=>({name:h && h.name || 'Habit', log:Array.isArray(h && h.log) ? h.log : []})));
    const decks = store.get('flashcard-decks', null);
    if(Array.isArray(decks)) store.set('flashcard-decks', decks.map((d,i)=>({
      id: d && d.id || 'deck-' + i,
      name: d && d.name || 'Deck ' + (i+1),
      cards: Array.isArray(d && d.cards) ? d.cards.filter(c=>c && (c.front || c.back)) : []
    })));
  }
};

function migrateStore(){
  let at = Number(store.get('schema', 0)) || 0;
  if(at >= STORE_SCHEMA) return at;
  for(let v = at + 1; v <= STORE_SCHEMA; v++){
    try{
      if(MIGRATIONS[v]) MIGRATIONS[v]();
      store.set('schema', v);
      at = v;
    }catch(e){
      logError('migration ' + v, e);
      break;
    }
  }
  return at;
}

/* -- Export / Import helpers, reused by any tool that persists data -- */
function downloadJSON(data, filename){
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}
function readJSONFile(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>{ try{ resolve(JSON.parse(reader.result)); }catch(e){ reject(e); } };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/* -- Tool lifecycle cleanup --
   Any tool that starts a timer, camera stream, microphone stream, geolocation watch, or
   audio node MUST call setCleanup(fn) once during render() with a function that stops it.
   The router calls runCleanup() before every navigation (including tab close), so leaving
   a tool always stops whatever it started — no lingering intervals, mics, cameras, or GPS. */
let currentCleanup = null;
function setCleanup(fn){ currentCleanup = fn; }
function runCleanup(){ if(currentCleanup){ try{ currentCleanup(); }catch(e){} currentCleanup = null; } }

/* Escapes text for safe insertion into innerHTML. Use for ANY user-typed or imported string
   (note titles/bodies, deck/card text, team/habit names, decoded JWT/QR content, etc.) before
   interpolating it into a template literal that gets assigned to innerHTML. */
function escapeHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

/* A transient message at the bottom of the screen. */
let toastTimer = null;
function toast(msg){
  let el = document.getElementById('kToast');
  if(!el){
    el = document.createElement('div');
    el.id = 'kToast'; el.className = 'toast';
    el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('on'), 1500);
}

/* A paste button appears over an empty text field, because the clipboard is
   the most common way text arrives and on a phone the long-press menu is a
   lottery. Delegated, so it works in every tool and survives re-renders. */
let pasteChip = null;
function hidePasteChip(){
  if(pasteChip && pasteChip.parentNode) pasteChip.parentNode.removeChild(pasteChip);
  pasteChip = null;
}
document.addEventListener('focusin', e=>{
  hidePasteChip();
  const el = e.target;
  if(!el || (el.tagName !== 'TEXTAREA' && !(el.tagName === 'INPUT' && el.type === 'text'))) return;
  if(el.value || !(navigator.clipboard && navigator.clipboard.readText)) return;
  if(el.closest('[hidden]')) return;
  const rect = el.getBoundingClientRect();
  pasteChip = document.createElement('button');
  pasteChip.type = 'button';
  pasteChip.className = 'pastechip';
  pasteChip.textContent = 'Paste';
  pasteChip.style.top = (window.scrollY + rect.top + 4) + 'px';
  pasteChip.style.left = (window.scrollX + rect.right - 62) + 'px';
  pasteChip.addEventListener('mousedown', ev=>ev.preventDefault());
  pasteChip.addEventListener('click', async ()=>{
    try{
      const text = await navigator.clipboard.readText();
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      toast('Pasted');
    }catch(err){ toast('The browser would not let Kitbox read the clipboard'); }
    hidePasteChip();
    el.focus();
  });
  document.body.appendChild(pasteChip);
});
document.addEventListener('focusout', ()=>setTimeout(hidePasteChip, 150));

/* Double-click any result block to copy it. Delegated on the document, so it
   survives the re-render most tools do on every keystroke — attaching a button
   to each .output would vanish the moment the tool redrew itself. */
document.addEventListener('dblclick', e=>{
  const target = e.target && e.target.closest ? e.target : null;
  // A table is copied as CSV, not as the text it happens to display.
  const table = target ? target.closest('table') : null;
  if(table && table.rows.length > 1 && !table.closest('.palette-overlay')){
    const csv = Array.from(table.rows).map(r=>Array.from(r.cells)
      .map(c=>'"' + c.textContent.trim().replace(/"/g, '""') + '"').join(',')).join('\n');
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(csv).then(()=>toast('Table copied as CSV'), ()=>toast('Could not copy'));
    }
    return;
  }
  const box = target ? target.closest('.output') : null;
  if(!box) return;
  if(box.querySelector('input,textarea,select,button')) return;
  const text = (box.innerText || box.textContent || '').trim();
  if(!text || text === '—') return;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>toast('Copied'), ()=>toast('Could not copy — select the text instead'));
  } else {
    toast('Copy is not available in this browser');
  }
});

/* How numbers are grouped. Indian grouping is 1,00,000; international is
   100,000. One preference, read at format time, so a tool cannot disagree. */
function numLocale(){ return store.get('num-format', 'in') === 'us' ? 'en-US' : 'en-IN'; }
function prefUnits(){ return store.get('units', 'metric') === 'imperial' ? 'imperial' : 'metric'; }

/* Web Crypto needs a secure context. One place decides that, so no tool has to
   remember the rule and none of them can disagree about it. */
function cryptoAvailable(){
  try{ return !!(window.crypto && window.crypto.subtle && window.crypto.subtle.digest); }
  catch(e){ return false; }
}
const CRYPTO_MSG = 'This needs Web Crypto, which browsers only expose on https or localhost. Serve the file (python3 -m http.server) or open it from the published page.';

/* A failed file read should say what to do about it, not just "error". */
function readFileSafely(file){
  return readFileBytes(file).catch(err=>{
    const name = (file && file.name) || 'that file';
    throw new Error('The browser could not read "' + name + '". It may have moved, or been blocked — choose it again. (' + ((err && err.message) || err) + ')');
  });
}

/* Files are read whole into memory, so there is a ceiling. Better a sentence
   than a frozen tab. */
const MAX_FILE_MB = 200;
function fileTooBig(file, mb){
  return !!file && file.size > (mb || MAX_FILE_MB) * 1048576;
}
function fileTooBigMsg(file, mb){
  return 'That file is ' + fmtBytes(file.size) + '. Kitbox reads the whole file into memory, so it stops at '
    + (mb || MAX_FILE_MB) + ' MB — split it first, or use a tool built for files that size.';
}

/* Rough passphrase strength: length times the size of the character pool,
   with the obvious passphrases scored zero regardless of length. */
function passStrength(p){
  if(!p) return {score:0, label:'', bits:0};
  let classes = 0;
  if(/[a-z]/.test(p)) classes++;
  if(/[A-Z]/.test(p)) classes++;
  if(/\d/.test(p)) classes++;
  if(/[^A-Za-z0-9]/.test(p)) classes++;
  const common = /^(password|passphrase|letmein|qwerty|123456|admin|welcome|iloveyou)/i.test(p);
  const bits = Math.round(p.length * Math.log2(Math.max(2, classes * 26)));
  const score = common ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  const label = common ? 'too common — pick something else' : ['', 'weak', 'fair', 'good', 'strong'][score];
  return {score, label, bits};
}

/* YYYY-MM-DD in the user's LOCAL timezone (not UTC — Date#toISOString is UTC and can land on
   the wrong calendar day for anyone not in UTC+0, especially near midnight). Used anywhere a
   tool needs to compare "today" against a stored date, e.g. habit streaks and flashcard due dates. */
function localDateStr(d){
  d = d || new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

/* Renders a standard "Export / Import" row into `container` for a given store key.
   onImport(data) is called after a successful import so the caller can re-render. */
function exportImportRow(container, key, filename, onImport){
  container.innerHTML = `
    <div class="segrow">
      <button class="btn" data-exp>⬇ Export data</button>
      <label class="btn" style="cursor:pointer">⬆ Import data<input type="file" accept="application/json" data-imp style="display:none"></label>
    </div>
    <div class="hint" data-impmsg style="display:none"></div>`;
  container.querySelector('[data-exp]').addEventListener('click', ()=>{
    downloadJSON(store.get(key, null), filename);
  });
  container.querySelector('[data-imp]').addEventListener('change', async e=>{
    const file = e.target.files[0]; if(!file) return;
    const msg = container.querySelector('[data-impmsg]');
    try{
      const data = await readJSONFile(file);
      store.set(key, data);
      msg.style.display='block'; msg.textContent = 'Imported successfully.';
      onImport && onImport(data);
    }catch(err){ msg.style.display='block'; msg.textContent = 'That file was not valid — import cancelled.'; }
  });
}
const TOOL_REQUIRES = {
  scanner: 'camera', soundrecorder: 'microphone', decibelmeter: 'microphone', visualizer: 'microphone',
  compass: 'motion', level: 'motion', gpsspeed: 'geolocation',
  tonegen: 'audio', metronome: 'audio', noise: 'audio', binaural: 'audio',
  tts: 'speech',
  filecrypt: 'secure', sealednote: 'secure', filehash: 'secure', hmac: 'secure'
};

/* CODES:START */
const STABLE_CODES = { "accessibility/altcheck":"ACC-04", "accessibility/captions":"ACC-07", "accessibility/cbpalette":"ACC-08", "accessibility/dyslexiapreview":"ACC-02", "accessibility/focuspreview":"ACC-05", "accessibility/motionpreview":"ACC-09", "accessibility/readingruler":"ACC-01", "accessibility/srpreview":"ACC-06", "accessibility/textspacing":"ACC-03", "almanac/choghadiya":"ALM-06", "almanac/horas":"ALM-04", "almanac/moonrise":"ALM-07", "almanac/panchang":"ALM-01", "almanac/rahukaal":"ALM-02", "almanac/sunmoon":"ALM-03", "almanac/tithical":"ALM-05", "audio/binaural":"AUD-04", "audio/decibelmeter":"AUD-05", "audio/hznote":"AUD-09", "audio/metronome":"AUD-02", "audio/noise":"AUD-03", "audio/soundrecorder":"AUD-07", "audio/taptempo":"AUD-08", "audio/tonegen":"AUD-01", "audio/tuner":"AUD-10", "audio/visualizer":"AUD-06", "calc/agecalc":"CAL-11", "calc/aspectratio":"CAL-05", "calc/average":"CAL-03", "calc/circle":"CAL-16", "calc/circleact":"CAL-24", "calc/cone":"CAL-29", "calc/conefrustum":"CAL-32", "calc/cube":"CAL-25", "calc/cylinder":"CAL-33", "calc/datediff":"CAL-48", "calc/daysuntilnewyear":"CAL-14", "calc/decimaltofraction":"CAL-07", "calc/electricity":"CAL-46", "calc/ellipsoid":"CAL-30", "calc/exponent":"CAL-09", "calc/factorial":"CAL-10", "calc/fibonacci":"CAL-37", "calc/fractionsimplify":"CAL-06", "calc/fueleconomy":"CAL-45", "calc/gcdlcm":"CAL-39", "calc/graphplotter":"CAL-36", "calc/hamming":"CAL-54", "calc/hexagon":"CAL-23", "calc/levenshtein":"CAL-53", "calc/logarithm":"CAL-41", "calc/multitimecalc":"CAL-13", "calc/npr_ncr":"CAL-38", "calc/pentagon":"CAL-22", "calc/percentage":"CAL-02", "calc/percentchange":"CAL-49", "calc/pricing":"CAL-47", "calc/primenumber":"CAL-08", "calc/prism":"CAL-28", "calc/proportional":"CAL-04", "calc/pyramid":"CAL-27", "calc/pyramidfrustum":"CAL-31", "calc/quadratic":"CAL-40", "calc/rectangle":"CAL-17", "calc/regression":"CAL-43", "calc/rhombus":"CAL-18", "calc/righttriangle":"CAL-20", "calc/rounding":"CAL-51", "calc/setops":"CAL-52", "calc/sigfig":"CAL-44", "calc/simplecalc":"CAL-01", "calc/sleepcalc":"CAL-50", "calc/sphere":"CAL-26", "calc/spherecap":"CAL-34", "calc/spheresegment":"CAL-35", "calc/square":"CAL-15", "calc/statistics":"CAL-42", "calc/timecalc":"CAL-12", "calc/trapezoid":"CAL-21", "calc/triangle":"CAL-19", "clinical/chads":"CLN-10", "clinical/childpugh":"CLN-12", "clinical/curb65":"CLN-06", "clinical/drip":"CLN-02", "clinical/egfr":"CLN-03", "clinical/electrolytes":"CLN-04", "clinical/gcs":"CLN-05", "clinical/hasbled":"CLN-11", "clinical/paeddose":"CLN-01", "clinical/qsofa":"CLN-07", "clinical/wellsdvt":"CLN-08", "clinical/wellspe":"CLN-09", "colors/blendcolors":"CLR-03", "colors/colorblind":"CLR-06", "colors/colorpicker":"CLR-01", "colors/contrast":"CLR-05", "colors/harmony":"CLR-08", "colors/imagecolorpicker":"CLR-02", "colors/isdarkened":"CLR-04", "colors/paletteimg":"CLR-07", "colors/randomcolor":"CLR-10", "colors/tintshade":"CLR-09", "comms/icsinvite":"COM-02", "comms/linkbuilder":"COM-03", "comms/phoneformat":"COM-05", "comms/smscount":"COM-04", "comms/vcard":"COM-01", "dev/asn1":"DEV-52", "dev/base32":"DEV-25", "dev/base64":"DEV-06", "dev/baseconverter":"DEV-01", "dev/basicauth":"DEV-38", "dev/beautifycss":"DEV-03", "dev/beautifyhtml":"DEV-05", "dev/beautifyjson":"DEV-02", "dev/beautifyxml":"DEV-04", "dev/chmod":"DEV-37", "dev/configparse":"DEV-31", "dev/crongen":"DEV-48", "dev/cronnext":"DEV-35", "dev/cronparser":"DEV-17", "dev/cssgradient":"DEV-19", "dev/datauri":"DEV-12", "dev/gitignore":"DEV-32", "dev/hashgen":"DEV-09", "dev/hashid":"DEV-46", "dev/hkdf":"DEV-51", "dev/hmac":"DEV-26", "dev/htmlentity":"DEV-11", "dev/httpstatus":"DEV-18", "dev/ipformat":"DEV-45", "dev/iprange":"DEV-40", "dev/jsondiff":"DEV-23", "dev/jsontots":"DEV-33", "dev/jsonyaml":"DEV-21", "dev/jwtdebug":"DEV-16", "dev/jwtsign":"DEV-49", "dev/macaddr":"DEV-39", "dev/md5":"DEV-27", "dev/mdpreview":"DEV-30", "dev/metatags":"DEV-41", "dev/mime":"DEV-29", "dev/pbkdf2":"DEV-50", "dev/pwgen":"DEV-14", "dev/pwstrength":"DEV-13", "dev/querystring":"DEV-34", "dev/regextester":"DEV-15", "dev/rsakeys":"DEV-44", "dev/sqlin":"DEV-36", "dev/sqlpretty":"DEV-42", "dev/subnet":"DEV-28", "dev/textdiff":"DEV-10", "dev/totp":"DEV-43", "dev/uaparser":"DEV-20", "dev/ulid":"DEV-24", "dev/unixtime":"DEV-22", "dev/urlencode":"DEV-07", "dev/uuid":"DEV-08", "dev/uuidanalyse":"DEV-47", "education/formulasheet":"EDU-04", "education/timesquiz":"EDU-02", "education/timestable":"EDU-01", "education/unitcircle":"EDU-03", "files/b64file":"FIL-12", "files/csvjson":"FIL-06", "files/csvtable":"FIL-07", "files/exif":"FIL-08", "files/filecrypt":"FIL-04", "files/filehash":"FIL-03", "files/filetype":"FIL-11", "files/gzip":"FIL-02", "files/imgbase64":"FIL-09", "files/lineendings":"FIL-10", "files/sealednote":"FIL-05", "files/zipcreate":"FIL-01", "files/zipextract":"FIL-13", "finance/amortization":"FIN-09", "finance/billsplit":"FIN-05", "finance/budgetsplit":"FIN-13", "finance/commission":"FIN-07", "finance/currency":"FIN-01", "finance/debtpayoff":"FIN-16", "finance/discount":"FIN-06", "finance/gstsplit":"FIN-19", "finance/inflation":"FIN-10", "finance/investment":"FIN-03", "finance/loanemi":"FIN-02", "finance/mortgageafford":"FIN-11", "finance/retirement":"FIN-08", "finance/savingsgoal":"FIN-15", "finance/simpleinterest":"FIN-17", "finance/sip":"FIN-18", "finance/taxcalc":"FIN-04", "finance/tiptable":"FIN-12", "finance/wageconverter":"FIN-14", "games/hangman":"GAM-05", "games/memorymatch":"GAM-03", "games/numberguess":"GAM-02", "games/reaction":"GAM-09", "games/simonsays":"GAM-06", "games/tictactoe":"GAM-01", "games/triviacreator":"GAM-08", "games/typingtest":"GAM-10", "games/wordle":"GAM-07", "games/wordscramble":"GAM-04", "general/compass":"GEN-09", "general/countdown":"GEN-04", "general/counter":"GEN-02", "general/level":"GEN-12", "general/morse":"GEN-06", "general/num2word":"GEN-08", "general/roman":"GEN-07", "general/ruler":"GEN-01", "general/scoreboard":"GEN-03", "general/stopwatch":"GEN-05", "general/str2byte":"GEN-10", "general/tzconv":"GEN-11", "general/worldclock":"GEN-13", "generator/bigclock":"GNR-07", "generator/lorem":"GNR-02", "generator/multinumgen":"GNR-04", "generator/numgen":"GNR-03", "generator/passphrase":"GNR-08", "generator/placeholder":"GNR-10", "generator/qrcode":"GNR-01", "generator/scanner":"GNR-05", "generator/tts":"GNR-06", "generator/usernames":"GNR-09", "geo/antipode":"GEO-08", "geo/bearing":"GEO-02", "geo/cardinal":"GEO-09", "geo/coordround":"GEO-10", "geo/distance":"GEO-01", "geo/dmsconv":"GEO-04", "geo/gpsspeed":"GEO-06", "geo/midpoint":"GEO-03", "geo/polygonarea":"GEO-07", "geo/sunrise":"GEO-05", "health/bmi":"HLT-01", "health/bmr":"HLT-04", "health/clinicalhealth":"HLT-05", "health/duedate":"HLT-08", "health/heartzones":"HLT-07", "health/idealweight":"HLT-03", "health/tdeemacros":"HLT-06", "health/water":"HLT-02", "image/addtext":"IMG-07", "image/asciiart":"IMG-18", "image/blur":"IMG-08", "image/collage":"IMG-12", "image/compressor":"IMG-09", "image/crop":"IMG-02", "image/enhancer":"IMG-13", "image/filters":"IMG-14", "image/flip":"IMG-06", "image/formatconverter":"IMG-10", "image/gradientwallpaper":"IMG-04", "image/imageinfo":"IMG-16", "image/memegenerator":"IMG-17", "image/mosaic":"IMG-11", "image/resize":"IMG-01", "image/rotate":"IMG-15", "image/rounded":"IMG-03", "image/trimtransparency":"IMG-05", "money/epf":"MNY-02", "money/gratuity":"MNY-03", "money/hra":"MNY-01", "money/ppf":"MNY-04", "nature/daylength":"NAT-06", "nature/goldenhour":"NAT-05", "nature/moonphase":"NAT-01", "nature/nightsky":"NAT-04", "nature/solsticeequinox":"NAT-02", "nature/sunexposure":"NAT-03", "productivity/backup":"PRD-04", "productivity/checklist":"PRD-07", "productivity/flashcards":"PRD-06", "productivity/habittracker":"PRD-02", "productivity/meetingcost":"PRD-08", "productivity/notepad":"PRD-03", "productivity/pomodoro":"PRD-01", "productivity/sketchpad":"PRD-05", "random/eightball":"RND-11", "random/flipcoin":"RND-03", "random/luckywheel":"RND-01", "random/multinumgen2":"RND-02", "random/pin":"RND-09", "random/randomlist":"RND-08", "random/rolldice":"RND-07", "random/rps":"RND-05", "random/spinbottle":"RND-06", "random/teamshuffler":"RND-10", "random/yesno":"RND-04", "reference/asciitable":"REF-01", "reference/bigo":"REF-02", "reference/dialcodes":"REF-04", "reference/regexcheat":"REF-03", "reference/shortcuts":"REF-05", "science/density":"SCI-07", "science/doppler":"SCI-15", "science/forceaccel":"SCI-02", "science/halflife":"SCI-05", "science/idealgas":"SCI-10", "science/lens":"SCI-14", "science/molarity":"SCI-12", "science/molarmass":"SCI-03", "science/ohmslaw":"SCI-01", "science/periodictable":"SCI-09", "science/phestimator":"SCI-04", "science/projectile":"SCI-11", "science/rc":"SCI-13", "science/speedofsound":"SCI-06", "science/wavelengthfreq":"SCI-08", "system/deviceinfo":"SYS-01", "system/errorlog":"SYS-02", "system/features":"SYS-03", "system/storage":"SYS-04", "text/accents":"TXT-36", "text/addbreaklines":"TXT-16", "text/affix":"TXT-11", "text/ascii85":"TXT-44", "text/asciibanner":"TXT-32", "text/bigtext":"TXT-20", "text/braille":"TXT-33", "text/caesar":"TXT-22", "text/cases":"TXT-01", "text/charfreq":"TXT-30", "text/entropy":"TXT-43", "text/extract":"TXT-47", "text/findreplace":"TXT-02", "text/invisible":"TXT-40", "text/kaomoji":"TXT-19", "text/keywords":"TXT-34", "text/leetspeak":"TXT-25", "text/natophonetic":"TXT-24", "text/numberlines":"TXT-12", "text/randomstring":"TXT-28", "text/readability":"TXT-35", "text/repeattext":"TXT-05", "text/reverselines":"TXT-14", "text/reversetext":"TXT-13", "text/reversewords":"TXT-15", "text/rmbreaklines":"TXT-10", "text/rmduplines":"TXT-08", "text/rmdupwords":"TXT-09", "text/rmempty":"TXT-07", "text/rmspaces":"TXT-06", "text/slugify":"TXT-23", "text/smartquotes":"TXT-37", "text/sortlines":"TXT-03", "text/striphtml":"TXT-29", "text/stylishfont":"TXT-17", "text/textbinary":"TXT-27", "text/textcounter":"TXT-04", "text/textdecoration":"TXT-18", "text/texthex":"TXT-26", "text/textsplitter":"TXT-31", "text/texttoemoji":"TXT-21", "text/unicodeescape":"TXT-45", "text/vigenere":"TXT-42", "text/worddiff":"TXT-46", "text/wordfreq":"TXT-38", "text/wrapwidth":"TXT-39", "text/xor":"TXT-41", "travel/baggagesize":"TRV-03", "travel/carbon":"TRV-05", "travel/flightduration":"TRV-02", "travel/packinglist":"TRV-01", "travel/plugguide":"TRV-04", "unit/acceleration":"UNI-20", "unit/angle":"UNI-02", "unit/area":"UNI-07", "unit/capacitance":"UNI-18", "unit/charge":"UNI-14", "unit/cooking":"UNI-04", "unit/cssunits":"UNI-23", "unit/current":"UNI-11", "unit/data":"UNI-22", "unit/datatransfer":"UNI-24", "unit/energy":"UNI-01", "unit/force":"UNI-15", "unit/imageresolution":"UNI-26", "unit/length":"UNI-08", "unit/luminance":"UNI-29", "unit/luminousflux":"UNI-30", "unit/mass":"UNI-10", "unit/papersize":"UNI-32", "unit/pixeldensity":"UNI-25", "unit/prefix":"UNI-06", "unit/pressure":"UNI-12", "unit/resistance":"UNI-17", "unit/shoesize":"UNI-33", "unit/sound":"UNI-28", "unit/speed":"UNI-19", "unit/temperature":"UNI-03", "unit/tempgradient":"UNI-31", "unit/time":"UNI-05", "unit/torque":"UNI-21", "unit/typography":"UNI-27", "unit/voltage":"UNI-13", "unit/volume":"UNI-09", "unit/work":"UNI-16" };
/* CODES:END */

/* ---------- Search metadata ----------
   Two maps, both small enough to read and both checked by the test suite:
   NEW_TOOLS marks what arrived in 1.1.0, KEYWORDS is the vocabulary people
   actually use for a tool rather than the name it was given. */
const NEW_TOOLS = new Set('tts bigclock accents smartquotes wordfreq wrapwidth invisible passphrase usernames datediff percentchange sleepcalc rounding papersize shoesize simpleinterest sip gstsplit teamshuffler eightball heartzones duedate jsontots querystring cronnext sqlin harmony tintshade randomcolor idealgas projectile molarity antipode cardinal coordround taptempo hznote reaction typingtest carbon goldenhour daylength checklist meetingcost filetype b64file horas tithical smscount phoneformat asciitable bigo regexcheat dialcodes shortcuts deviceinfo features storage'.split(' '));

const KEYWORDS = {
  'loanemi': 'emi instalment mortgage repayment loan',
  'investment': 'compound interest growth corpus',
  'sip': 'systematic investment plan mutual fund monthly',
  'taxcalc': 'income tax slab deduction',
  'gstsplit': 'gst cgst sgst igst tax invoice',
  'qrcode': 'qr barcode scan link url',
  'scanner': 'qr barcode camera scan',
  'base64': 'b64 encode decode',
  'hashgen': 'sha sha256 checksum digest fingerprint',
  'filehash': 'sha checksum digest md5 crc integrity verify',
  'md5': 'checksum legacy digest',
  'hmac': 'signature webhook sign',
  'uuid': 'guid identifier unique id',
  'ulid': 'guid sortable identifier',
  'unixtime': 'epoch timestamp utc unix',
  'tzconv': 'timezone time zone utc offset convert',
  'worldclock': 'time zone clock cities',
  'panchang': 'tithi nakshatra yoga karana almanac hindu calendar',
  'rahukaal': 'rahu kaal muhurat abhijit inauspicious',
  'tithical': 'tithi calendar month almanac',
  'horas': 'hora planetary hours chaldean',
  'moonphase': 'lunar phase moon',
  'goldenhour': 'sunset sunrise blue hour photography light',
  'sunmoon': 'sunrise sunset moonrise almanac',
  'zipcreate': 'zip archive compress bundle package',
  'gzip': 'gzip compress decompress tgz',
  'filecrypt': 'encrypt decrypt aes password protect',
  'sealednote': 'encrypt note one time secret',
  'exif': 'metadata gps location privacy strip photo',
  'csvjson': 'csv json convert table',
  'csvtable': 'csv table spreadsheet view',
  'contrast': 'wcag accessibility a11y contrast ratio',
  'colorblind': 'colour blindness deuteranopia accessibility',
  'harmony': 'complementary triadic analogous palette scheme',
  'tintshade': 'lighten darken ramp palette scale',
  'regexcheat': 'regex regular expression pattern reference',
  'regextester': 'regex regular expression test match',
  'bigo': 'complexity algorithm performance reference',
  'asciitable': 'ascii char code reference',
  'dialcodes': 'country calling code phone prefix',
  'shortcuts': 'keyboard hotkey shortcut reference',
  'deviceinfo': 'screen viewport dpr browser system info',
  'features': 'browser support capability detection',
  'storage': 'localstorage quota data usage',
  'bmi': 'body mass index weight health',
  'bmr': 'basal metabolic rate calories',
  'tdeemacros': 'tdee calories macros protein body fat',
  'water': 'hydration intake litres',
  'datediff': 'date difference between days business',
  'agecalc': 'age birthday years old',
  'percentage': 'percent increase decrease change',
  'statistics': 'mean median mode standard deviation quartile',
  'regression': 'correlation r squared linear fit trend',
  'idealgas': 'pv nrt moles gas',
  'projectile': 'trajectory range ballistic throw',
  'molarity': 'dilution c1v1 concentration solution',
  'ohm': 'resistance voltage current electricity',
  'ohmslaw': 'resistance voltage current electricity',
  'morse': 'morse code dit dah telegraph',
  'braille': 'braille dots accessibility',
  'caesar': 'caesar shift cipher rot',
  'roman': 'roman numerals',
  'num2word': 'number to words spelling',
  'notepad': 'notes text memo write',
  'flashcards': 'spaced repetition srs study cards',
  'pomodoro': 'focus timer tomato',
  'habittracker': 'habit streak daily',
  'checklist': 'todo task list tick',
  'backup': 'export import restore data',
  'sketchpad': 'draw canvas paint sketch',
  'meetingcost': 'meeting cost salary time',
  'reaction': 'reflex speed reaction time',
  'typingtest': 'typing speed wpm',
  'carbon': 'flight emissions co2 climate travel',
  'packinglist': 'travel packing checklist luggage',
  'papersize': 'a4 a3 letter paper dimensions dpi',
  'shoesize': 'shoe size uk eu us foot',
  'heartzones': 'heart rate zone cardio training bpm',
  'duedate': 'pregnancy due date naegele gestation',
  'smscount': 'sms characters ucs2 gsm parts',
  'phoneformat': 'e164 phone number format whatsapp',
  'vcard': 'contact card address book',
  'icsinvite': 'calendar invite ics event',
  'password': 'password passphrase credential',
  'pwgen': 'password generate random credential',
  'pin': 'pin code digits',
  'passphrase': 'passphrase diceware words',
};

/* An aliased id resolves to the tool that replaced it. */
function resolveToolId(catId, toolId){
  const alias = ID_ALIASES[catId + '/' + toolId];
  return alias ? alias.split('/')[1] : toolId;
}


/* ---------- Big storage ----------
   localStorage is about 5 MB and synchronous. IndexedDB is neither, but it is
   asynchronous, and rewriting every tool to await its own data would be a much
   larger change than this batch. So: the collections that grow — notes, decks —
   go through here, which uses IndexedDB when the browser has it and falls back
   to localStorage when it does not. Reads at render time still come from the
   synchronous copy, so nothing flashes empty. */
const bigStore = (()=>{
  const DB = 'kitbox', NAME = 'blobs';
  let dbp = null;
  function open(){
    if(dbp) return dbp;
    dbp = new Promise((resolve, reject)=>{
      if(!('indexedDB' in window)){ reject(new Error('no indexedDB')); return; }
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = ()=>{ try{ req.result.createObjectStore(NAME); }catch(e){} };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('indexedDB open failed'));
    });
    return dbp;
  }
  function tx(mode, fn){
    return open().then(db=> new Promise((res, rej)=>{
      const t = db.transaction(NAME, mode);
      const req = fn(t.objectStore(NAME));
      req.onsuccess = ()=>res(req.result);
      req.onerror = ()=>rej(req.error);
    }));
  }
  return {
    available(){ return 'indexedDB' in window; },
    get(key, fallback){
      return tx('readonly', s=>s.get(key)).then(v=> v === undefined ? fallback : v,
                                                 ()=> store.get(key, fallback));
    },
    set(key, value){
      return tx('readwrite', s=>s.put(value, key)).then(()=>true, ()=> store.set(key, value));
    },
    remove(key){
      return tx('readwrite', s=>s.delete(key)).then(()=>true, ()=> store.remove(key));
    }
  };
})();

/* ---------- One registration path ----------
   Every tool arrives through here. The 22 helper functions (txt, gen, calc …)
   are six-line adapters over this, kept because they read well at 339 call
   sites. Metadata that used to live in side maps is attached here, so a tool
   carries its own description: when it arrived, what it needs, what people
   call it. */
function register(spec){
  const cat = CATS.find(x => x.id === spec.cat);
  if(!cat) throw new Error('register: unknown category "' + spec.cat + '"');
  const list = TOOLS[cat.id] || (TOOLS[cat.id] = []);
  if(list.some(t => t.id === spec.id)) throw new Error('register: duplicate id "' + cat.id + '/' + spec.id + '"');
  list.push({
    id: spec.id,
    code: spec.code || cat.code + '-' + String(list.length + 1).padStart(2, '0'),
    name: spec.name,
    group: spec.group || '',
    render: spec.render,
    since: spec.since || (NEW_TOOLS.has(spec.id) ? '1.1.0' : '1.0.0'),
    tags: spec.tags || [],
    keywords: spec.keywords || KEYWORDS[spec.id] || '',
    requires: spec.requires || TOOL_REQUIRES[spec.id] || null
  });
}
