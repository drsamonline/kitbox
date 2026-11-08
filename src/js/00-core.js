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
const APP_VERSION = '2.0.0';
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

/* Codes come from a counter at registration, so inserting a tool renumbers
   every tool after it in that category — and the code is what a user quotes in
   a bug report. STABLE_CODES pins each tool to the code it was first given;
   tools/gen-codes.js assigns new ones and writes the map back into this file. */
CATS.forEach(c=>{
  (TOOLS[c.id]||[]).forEach(t=>{
    const pinned = STABLE_CODES[c.id + '/' + t.id];
    if(pinned) t.code = pinned;
  });
});

/* An aliased id resolves to the tool that replaced it. */
function resolveToolId(catId, toolId){
  const alias = ID_ALIASES[catId + '/' + toolId];
  return alias ? alias.split('/')[1] : toolId;
}

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
