/* ================================================================
   ROUTER + RENDER
   ================================================================ */
const app = document.getElementById('app');
const backBtn = document.getElementById('backBtn');
const crumb = document.getElementById('crumb');
const brandDot = document.getElementById('brandDot');

function setAccent(color){ document.documentElement.style.setProperty('--accent', color || '#14141c'); }

/* CODES:START */
const STABLE_CODES = { "almanac/horas":"ALM-04", "almanac/panchang":"ALM-01", "almanac/rahukaal":"ALM-02", "almanac/sunmoon":"ALM-03", "almanac/tithical":"ALM-05", "audio/binaural":"AUD-04", "audio/decibelmeter":"AUD-05", "audio/hznote":"AUD-09", "audio/metronome":"AUD-02", "audio/noise":"AUD-03", "audio/soundrecorder":"AUD-07", "audio/taptempo":"AUD-08", "audio/tonegen":"AUD-01", "audio/visualizer":"AUD-06", "calc/agecalc":"CAL-11", "calc/aspectratio":"CAL-05", "calc/average":"CAL-03", "calc/circle":"CAL-16", "calc/circleact":"CAL-24", "calc/cone":"CAL-29", "calc/conefrustum":"CAL-32", "calc/cube":"CAL-25", "calc/cylinder":"CAL-33", "calc/datediff":"CAL-48", "calc/daysuntilnewyear":"CAL-14", "calc/decimaltofraction":"CAL-07", "calc/electricity":"CAL-46", "calc/ellipsoid":"CAL-30", "calc/exponent":"CAL-09", "calc/factorial":"CAL-10", "calc/fibonacci":"CAL-37", "calc/fractionsimplify":"CAL-06", "calc/fueleconomy":"CAL-45", "calc/gcdlcm":"CAL-39", "calc/graphplotter":"CAL-36", "calc/hexagon":"CAL-23", "calc/logarithm":"CAL-41", "calc/multitimecalc":"CAL-13", "calc/npr_ncr":"CAL-38", "calc/pentagon":"CAL-22", "calc/percentage":"CAL-02", "calc/percentchange":"CAL-49", "calc/pricing":"CAL-47", "calc/primenumber":"CAL-08", "calc/prism":"CAL-28", "calc/proportional":"CAL-04", "calc/pyramid":"CAL-27", "calc/pyramidfrustum":"CAL-31", "calc/quadratic":"CAL-40", "calc/rectangle":"CAL-17", "calc/regression":"CAL-43", "calc/rhombus":"CAL-18", "calc/righttriangle":"CAL-20", "calc/rounding":"CAL-51", "calc/sigfig":"CAL-44", "calc/simplecalc":"CAL-01", "calc/sleepcalc":"CAL-50", "calc/sphere":"CAL-26", "calc/spherecap":"CAL-34", "calc/spheresegment":"CAL-35", "calc/square":"CAL-15", "calc/statistics":"CAL-42", "calc/timecalc":"CAL-12", "calc/trapezoid":"CAL-21", "calc/triangle":"CAL-19", "colors/blendcolors":"CLR-03", "colors/colorblind":"CLR-06", "colors/colorpicker":"CLR-01", "colors/contrast":"CLR-05", "colors/harmony":"CLR-08", "colors/imagecolorpicker":"CLR-02", "colors/isdarkened":"CLR-04", "colors/paletteimg":"CLR-07", "colors/randomcolor":"CLR-10", "colors/tintshade":"CLR-09", "comms/icsinvite":"COM-02", "comms/linkbuilder":"COM-03", "comms/phoneformat":"COM-05", "comms/smscount":"COM-04", "comms/vcard":"COM-01", "dev/base32":"DEV-25", "dev/base64":"DEV-06", "dev/baseconverter":"DEV-01", "dev/beautifycss":"DEV-03", "dev/beautifyhtml":"DEV-05", "dev/beautifyjson":"DEV-02", "dev/beautifyxml":"DEV-04", "dev/configparse":"DEV-31", "dev/cronnext":"DEV-35", "dev/cronparser":"DEV-17", "dev/cssgradient":"DEV-19", "dev/datauri":"DEV-12", "dev/gitignore":"DEV-32", "dev/hashgen":"DEV-09", "dev/hmac":"DEV-26", "dev/htmlentity":"DEV-11", "dev/httpstatus":"DEV-18", "dev/jsondiff":"DEV-23", "dev/jsontots":"DEV-33", "dev/jsonyaml":"DEV-21", "dev/jwtdebug":"DEV-16", "dev/md5":"DEV-27", "dev/mdpreview":"DEV-30", "dev/mime":"DEV-29", "dev/pwgen":"DEV-14", "dev/pwstrength":"DEV-13", "dev/querystring":"DEV-34", "dev/regextester":"DEV-15", "dev/sqlin":"DEV-36", "dev/subnet":"DEV-28", "dev/textdiff":"DEV-10", "dev/uaparser":"DEV-20", "dev/ulid":"DEV-24", "dev/unixtime":"DEV-22", "dev/urlencode":"DEV-07", "dev/uuid":"DEV-08", "files/b64file":"FIL-12", "files/csvjson":"FIL-06", "files/csvtable":"FIL-07", "files/exif":"FIL-08", "files/filecrypt":"FIL-04", "files/filehash":"FIL-03", "files/filetype":"FIL-11", "files/gzip":"FIL-02", "files/imgbase64":"FIL-09", "files/lineendings":"FIL-10", "files/sealednote":"FIL-05", "files/zipcreate":"FIL-01", "finance/amortization":"FIN-09", "finance/billsplit":"FIN-05", "finance/budgetsplit":"FIN-13", "finance/commission":"FIN-07", "finance/currency":"FIN-01", "finance/debtpayoff":"FIN-16", "finance/discount":"FIN-06", "finance/gstsplit":"FIN-19", "finance/inflation":"FIN-10", "finance/investment":"FIN-03", "finance/loanemi":"FIN-02", "finance/mortgageafford":"FIN-11", "finance/retirement":"FIN-08", "finance/savingsgoal":"FIN-15", "finance/simpleinterest":"FIN-17", "finance/sip":"FIN-18", "finance/taxcalc":"FIN-04", "finance/tiptable":"FIN-12", "finance/wageconverter":"FIN-14", "games/hangman":"GAM-05", "games/memorymatch":"GAM-03", "games/numberguess":"GAM-02", "games/reaction":"GAM-09", "games/simonsays":"GAM-06", "games/tictactoe":"GAM-01", "games/triviacreator":"GAM-08", "games/typingtest":"GAM-10", "games/wordle":"GAM-07", "games/wordscramble":"GAM-04", "general/compass":"GEN-09", "general/countdown":"GEN-04", "general/counter":"GEN-02", "general/level":"GEN-12", "general/morse":"GEN-06", "general/num2word":"GEN-08", "general/roman":"GEN-07", "general/ruler":"GEN-01", "general/scoreboard":"GEN-03", "general/stopwatch":"GEN-05", "general/str2byte":"GEN-10", "general/tzconv":"GEN-11", "general/worldclock":"GEN-13", "generator/bigclock":"GNR-07", "generator/lorem":"GNR-02", "generator/multinumgen":"GNR-04", "generator/numgen":"GNR-03", "generator/passphrase":"GNR-08", "generator/qrcode":"GNR-01", "generator/scanner":"GNR-05", "generator/tts":"GNR-06", "generator/usernames":"GNR-09", "geo/antipode":"GEO-08", "geo/bearing":"GEO-02", "geo/cardinal":"GEO-09", "geo/coordround":"GEO-10", "geo/distance":"GEO-01", "geo/dmsconv":"GEO-04", "geo/gpsspeed":"GEO-06", "geo/midpoint":"GEO-03", "geo/polygonarea":"GEO-07", "geo/sunrise":"GEO-05", "health/bmi":"HLT-01", "health/bmr":"HLT-04", "health/clinicalhealth":"HLT-05", "health/duedate":"HLT-08", "health/heartzones":"HLT-07", "health/idealweight":"HLT-03", "health/tdeemacros":"HLT-06", "health/water":"HLT-02", "image/addtext":"IMG-07", "image/asciiart":"IMG-18", "image/blur":"IMG-08", "image/collage":"IMG-12", "image/compressor":"IMG-09", "image/crop":"IMG-02", "image/enhancer":"IMG-13", "image/filters":"IMG-14", "image/flip":"IMG-06", "image/formatconverter":"IMG-10", "image/gradientwallpaper":"IMG-04", "image/imageinfo":"IMG-16", "image/memegenerator":"IMG-17", "image/mosaic":"IMG-11", "image/resize":"IMG-01", "image/rotate":"IMG-15", "image/rounded":"IMG-03", "image/trimtransparency":"IMG-05", "nature/daylength":"NAT-06", "nature/goldenhour":"NAT-05", "nature/moonphase":"NAT-01", "nature/nightsky":"NAT-04", "nature/solsticeequinox":"NAT-02", "nature/sunexposure":"NAT-03", "productivity/backup":"PRD-04", "productivity/checklist":"PRD-07", "productivity/flashcards":"PRD-06", "productivity/habittracker":"PRD-02", "productivity/meetingcost":"PRD-08", "productivity/notepad":"PRD-03", "productivity/pomodoro":"PRD-01", "productivity/sketchpad":"PRD-05", "random/eightball":"RND-11", "random/flipcoin":"RND-03", "random/luckywheel":"RND-01", "random/multinumgen2":"RND-02", "random/pin":"RND-09", "random/randomlist":"RND-08", "random/rolldice":"RND-07", "random/rps":"RND-05", "random/spinbottle":"RND-06", "random/teamshuffler":"RND-10", "random/yesno":"RND-04", "reference/asciitable":"REF-01", "reference/bigo":"REF-02", "reference/dialcodes":"REF-04", "reference/regexcheat":"REF-03", "reference/shortcuts":"REF-05", "science/density":"SCI-07", "science/forceaccel":"SCI-02", "science/halflife":"SCI-05", "science/idealgas":"SCI-10", "science/molarity":"SCI-12", "science/molarmass":"SCI-03", "science/ohmslaw":"SCI-01", "science/periodictable":"SCI-09", "science/phestimator":"SCI-04", "science/projectile":"SCI-11", "science/speedofsound":"SCI-06", "science/wavelengthfreq":"SCI-08", "system/deviceinfo":"SYS-01", "system/errorlog":"SYS-02", "system/features":"SYS-03", "system/storage":"SYS-04", "text/accents":"TXT-36", "text/addbreaklines":"TXT-16", "text/affix":"TXT-11", "text/asciibanner":"TXT-32", "text/bigtext":"TXT-20", "text/braille":"TXT-33", "text/caesar":"TXT-22", "text/cases":"TXT-01", "text/charfreq":"TXT-30", "text/findreplace":"TXT-02", "text/invisible":"TXT-40", "text/kaomoji":"TXT-19", "text/keywords":"TXT-34", "text/leetspeak":"TXT-25", "text/natophonetic":"TXT-24", "text/numberlines":"TXT-12", "text/randomstring":"TXT-28", "text/readability":"TXT-35", "text/repeattext":"TXT-05", "text/reverselines":"TXT-14", "text/reversetext":"TXT-13", "text/reversewords":"TXT-15", "text/rmbreaklines":"TXT-10", "text/rmduplines":"TXT-08", "text/rmdupwords":"TXT-09", "text/rmempty":"TXT-07", "text/rmspaces":"TXT-06", "text/slugify":"TXT-23", "text/smartquotes":"TXT-37", "text/sortlines":"TXT-03", "text/striphtml":"TXT-29", "text/stylishfont":"TXT-17", "text/textbinary":"TXT-27", "text/textcounter":"TXT-04", "text/textdecoration":"TXT-18", "text/texthex":"TXT-26", "text/textsplitter":"TXT-31", "text/texttoemoji":"TXT-21", "text/wordfreq":"TXT-38", "text/wrapwidth":"TXT-39", "travel/baggagesize":"TRV-03", "travel/carbon":"TRV-05", "travel/flightduration":"TRV-02", "travel/packinglist":"TRV-01", "travel/plugguide":"TRV-04", "unit/acceleration":"UNI-20", "unit/angle":"UNI-02", "unit/area":"UNI-07", "unit/capacitance":"UNI-18", "unit/charge":"UNI-14", "unit/cooking":"UNI-04", "unit/cssunits":"UNI-23", "unit/current":"UNI-11", "unit/data":"UNI-22", "unit/datatransfer":"UNI-24", "unit/energy":"UNI-01", "unit/force":"UNI-15", "unit/imageresolution":"UNI-26", "unit/length":"UNI-08", "unit/luminance":"UNI-29", "unit/luminousflux":"UNI-30", "unit/mass":"UNI-10", "unit/papersize":"UNI-32", "unit/pixeldensity":"UNI-25", "unit/prefix":"UNI-06", "unit/pressure":"UNI-12", "unit/resistance":"UNI-17", "unit/shoesize":"UNI-33", "unit/sound":"UNI-28", "unit/speed":"UNI-19", "unit/temperature":"UNI-03", "unit/tempgradient":"UNI-31", "unit/time":"UNI-05", "unit/torque":"UNI-21", "unit/typography":"UNI-27", "unit/voltage":"UNI-13", "unit/volume":"UNI-09", "unit/work":"UNI-16" };
/* CODES:END */

/* Ids that have been renamed. A pin or a bookmark stores cat/id, so an id is a
   promise; when one has to change, the old one is listed here and resolved
   before anything looks for the tool. tools/gen-codes.js checks that every
   retired id appears in this map. */
const ID_ALIASES = {};

/* ---------- Search index, across every tool in every category ---------- */
const TOOL_INDEX = [];
CATS.forEach(c=>{
  (TOOLS[c.id]||[]).forEach(t=>{
    TOOL_INDEX.push({
      catId: c.id, catName: c.name, catColor: c.color, catIcon: c.icon,
      id: t.id, name: t.name, code: t.code, group: t.group || '',
      keywords: (KEYWORDS[t.id] || ''),
      hay: (t.name+' '+t.code+' '+c.name+' '+(t.group||'')+' '+(KEYWORDS[t.id]||'')).toLowerCase()
    });
  });
});

/* Ranked match: exact, prefix, word-start, substring, then an ordered
   subsequence fallback so "clrfnd" still finds "Colour Blindness Simulator". */
function scoreTool(tool, q){
  if(!q) return 0;
  const name = tool.name.toLowerCase();
  const keywords = (tool.keywords || '').toLowerCase();
  let score = 0;
  if(name === q) score = 100;
  else if(name.startsWith(q)) score = 85;
  else if(new RegExp('\\b'+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).test(name)) score = 70;
  else if(name.includes(q)) score = 55;
  else if(keywords.split(/\s+/).includes(q)) score = 50;      // the word people actually use
  else if(keywords.includes(q)) score = 40;
  else if(tool.hay.includes(q)) score = 30;
  else {
    let i = 0;
    for(const ch of name){ if(ch === q[i]) i++; if(i === q.length){ score = 15; break; } }
  }
  if(!score) return 0;
  // What you use, and what you chose, comes first among equals.
  if(isPinned(tool.catId, tool.id)) score += 8;
  else if(store.get('recent', []).some(r=>r.cat === tool.catId && r.tool === tool.id)) score += 4;
  return score;
}
function searchTools(q){
  const query = q.trim().toLowerCase();
  if(!query) return [];
  return TOOL_INDEX
    .map(t=>({t, s: scoreTool(t, query)}))
    .filter(x=>x.s > 0)
    .sort((a,b)=> b.s - a.s || a.t.name.localeCompare(b.t.name))
    .slice(0, 40)
    .map(x=>x.t);
}

/* ---------- Pinned tools and recents ---------- */
function pinnedList(){ return store.get('pinned', []); }
function isPinned(catId, toolId){ return pinnedList().some(p=>p.cat===catId && p.tool===toolId); }
function togglePin(catId, toolId){
  const list = pinnedList();
  const i = list.findIndex(p=>p.cat===catId && p.tool===toolId);
  if(i >= 0) list.splice(i,1);
  else list.push({cat:catId, tool:toolId});
  store.set('pinned', list);
  return i < 0;
}
function noteRecent(catId, toolId){
  const list = store.get('recent', []).filter(p=>!(p.cat===catId && p.tool===toolId));
  list.unshift({cat:catId, tool:toolId});
  store.set('recent', list.slice(0,8));
}
function lookup(catId, toolId){
  const cat = CATS.find(c=>c.id===catId);
  const id = resolveToolId(catId, toolId);
  const tool = cat ? (TOOLS[catId]||[]).find(t=>t.id===id) : null;
  return (cat && tool) ? {cat, tool} : null;
}

/* ---------- Cards ---------- */
function catCard(cat){
  const has = TOOLS[cat.id] && TOOLS[cat.id].length>0;
  return `<button class="tag ${has?'':'disabled'}" style="--c:${cat.color};--ci:${inkFor(cat.color)}" data-cat="${cat.id}" ${has?'':'disabled'} aria-label="${escapeHtml(cat.name)} — ${has?TOOLS[cat.id].length+' tools':'coming soon'}" title="${escapeHtml(cat.name)}${has?' — '+TOOLS[cat.id].length+' tools':''}">
    <div class="hole"></div>
    <div class="icon">${iconSvg(cat.icon)}</div>
    <div class="name">${escapeHtml(cat.name)}</div>
    <div class="code">${cat.code} · ${has?TOOLS[cat.id].length:'soon'}${has?' tools':''}</div>
  </button>`;
}

function toolCard(cat, tool){
  const pinned = isPinned(cat.id, tool.id);
  return `<button class="tag" style="--c:${cat.color};--ci:${inkFor(cat.color)}" data-tool="${tool.id}" aria-label="${escapeHtml(tool.name)}" title="${escapeHtml(tool.name)} · ${tool.code}">
    <div class="hole"></div>
    <div class="icon">${iconSvg(cat.icon)}</div>
    <div class="name">${escapeHtml(tool.name)}${pinned?' <span style="color:var(--c)">•</span>':''}${NEW_TOOLS.has(tool.id)?'<span class="newchip">new</span>':''}</div>
    <div class="code">${tool.code}</div>
  </button>`;
}

function pinnedRow(container, list){
  const items = list.map(p=>lookup(p.cat, p.tool)).filter(Boolean);
  if(!items.length) return false;
  container.innerHTML = items.map(({cat, tool})=>toolCard(cat, tool)).join('');
  container.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click', ()=>{
    const cat = items.find(i=>i.tool.id === b.dataset.tool).cat;
    location.hash = '#/tool/'+cat.id+'/'+b.dataset.tool;
  }));
  return true;
}

/* ---------- Home ---------- */
function renderHome(){
  setAccent('#14141c');
  backBtn.classList.add('hidden');
  crumb.textContent='';
  const total = TOOL_INDEX.length;
  const catCount = CATS.filter(c=>TOOLS[c.id]&&TOOLS[c.id].length).length;
  app.innerHTML = `
    <div class="hero">
      <div class="badge">KIT</div>
      <div>
        <h1>Every tool, one offline app</h1>
        <p>${total} tools across ${catCount} categories. Everything below runs locally in this page — no server, no network calls, works offline after the first load.</p>
      </div>
    </div>
    <div class="searchbar">
      <input type="search" id="homeSearch" placeholder="Search ${total} tools — try “hash”, “panchang”, “zip”" aria-label="Search tools" autocomplete="off">
      <span class="kbdhint">Ctrl K</span>
    </div>
    <div id="firstRun"></div>
    <div id="homeResults"></div>
    <div id="pinnedBlock" style="display:none">
      <div class="section-label">Pinned</div>
      <div class="grid" id="pinnedGrid" style="margin-bottom:30px"></div>
    </div>
    <div id="recentBlock" style="display:none">
      <div class="section-label">Recently used</div>
      <div class="grid" id="recentGrid" style="margin-bottom:30px"></div>
    </div>
    <div class="section-label" style="display:flex;justify-content:space-between;align-items:center">
      <span>Categories</span>
      <a href="#/all" style="color:var(--shell-muted);text-decoration:none;font-size:12px">All tools A–Z →</a>
    </div>
    <div class="grid" id="catGrid">${CATS.map(catCard).join('')}</div>
    <div class="footer-note">Kitbox — crafted by Dr. Sohil Momin, BHMS · Vadodara, India · single-file offline web app, no dependencies · <a href="#/support" style="color:#C2185B;text-decoration:none">Support this</a> · <a href="#/about" style="color:var(--shell-muted);text-decoration:none">About</a></div>
  `;
  app.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click', ()=>{
    if(b.disabled) return;
    location.hash = '#/category/'+b.dataset.cat;
  }));
  const pinBlock = app.querySelector('#pinnedBlock');
  if(pinnedRow(app.querySelector('#pinnedGrid'), pinnedList())) pinBlock.style.display = 'block';
  const recBlock = app.querySelector('#recentBlock');
  if(pinnedRow(app.querySelector('#recentGrid'), store.get('recent', []))) recBlock.style.display = 'block';

  if(!store.get('seen-palette-hint', false)){
    const fr = app.querySelector('#firstRun');
    fr.className = 'firstrun';
    fr.innerHTML = `<span class="hint" style="margin:0">Press <b>Ctrl K</b> (or <b>⌘ K</b>) anywhere to search all ${TOOL_INDEX.length} tools.</span>
      <button class="btn ghost" id="frDone" style="padding:4px 10px;font-size:12px">Got it</button>`;
    fr.querySelector('#frDone').addEventListener('click', ()=>{
      store.set('seen-palette-hint', true);
      fr.remove();
    });
  }

  const input = app.querySelector('#homeSearch');
  const results = app.querySelector('#homeResults');
  input.addEventListener('input', ()=>{
    const q = input.value.trim();
    if(!q){
      results.innerHTML = '';
      pinBlock.style.display = pinnedList().length ? 'block' : 'none';
      recBlock.style.display = store.get('recent',[]).length ? 'block' : 'none';
      app.querySelector('#catGrid').style.display = '';
      return;
    }
    const hits = searchTools(q);
    pinBlock.style.display = 'none';
    recBlock.style.display = 'none';
    app.querySelector('#catGrid').style.display = 'none';
    results.innerHTML = hits.length
      ? `<div class="section-label">${hits.length} match${hits.length===1?'':'es'}</div><div class="grid">${hits.map(t=>toolCard({id:t.catId,color:t.catColor,icon:t.catIcon}, {id:t.id, name:t.name, code:t.code})).join('')}</div>`
      : `<div class="empty">Nothing matches “${escapeHtml(q)}”.</div>`;
    results.querySelectorAll('[data-tool]').forEach(b=>{
      const t = hits.find(h=>h.id === b.dataset.tool);
      b.addEventListener('click', ()=>{ location.hash = '#/tool/'+t.catId+'/'+t.id; });
    });
  });
}

/* ---------- Category ---------- */
function renderCategory(catId){
  const cat = CATS.find(c=>c.id===catId);
  if(!cat){ renderNotFound('#/category/' + catId); return; }
  setAccent(cat.color);
  backBtn.classList.remove('hidden');
  crumb.innerHTML = `<b>${escapeHtml(cat.name)}</b>`;
  const tools = TOOLS[catId] || [];
  let toolsHtml;
  if(!tools.length){
    toolsHtml = `<div class="empty">Nothing in this category yet. <a href="#/" style="color:var(--accent)">Back to all categories</a>.</div>`;
  } else if(tools.some(t=>t.group)){
    const groups = [];
    tools.forEach(t=>{
      const g = t.group || '';
      let entry = groups.find(x=>x.name===g);
      if(!entry){ entry = {name:g, items:[]}; groups.push(entry); }
      entry.items.push(t);
    });
    toolsHtml = groups.map(g=>`
      <div class="section-label">${escapeHtml(g.name)}</div>
      <div class="grid" style="margin-bottom:30px">${g.items.map(t=>toolCard(cat,t)).join('')}</div>
    `).join('');
  } else {
    toolsHtml = `<div class="grid">${tools.map(t=>toolCard(cat,t)).join('')}</div>`;
  }
  app.innerHTML = `
    <div class="catband">
      <div class="hero" style="padding:0">
        <div class="badge">${cat.code}</div>
        <div><h1>${escapeHtml(cat.name)}</h1><p>${escapeHtml(cat.desc)}</p></div>
      </div>
    </div>
    ${tools.length > 8 ? `<div class="searchbar"><input type="search" id="catFilter" placeholder="Filter these ${tools.length} tools" aria-label="Filter tools in this category" autocomplete="off"></div>` : ''}
    <div id="catBody">${toolsHtml}</div>
  `;
  const filter = app.querySelector('#catFilter');
  if(filter){
    filter.addEventListener('input', ()=>{
      const q = filter.value.trim().toLowerCase();
      app.querySelectorAll('#catBody [data-tool]').forEach(b=>{
        const name = b.querySelector('.name').textContent.toLowerCase();
        b.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
      app.querySelectorAll('#catBody .section-label').forEach(lbl=>{
        const grid = lbl.nextElementSibling;
        const any = grid && Array.from(grid.querySelectorAll('[data-tool]')).some(b=>b.style.display !== 'none');
        lbl.style.display = any ? '' : 'none';
        if(grid) grid.style.display = any ? '' : 'none';
      });
    });
  }
  app.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click', ()=>{
    location.hash = '#/tool/'+catId+'/'+b.dataset.tool;
  }));
}

/* ---------- All tools, A–Z ---------- */
function renderAll(){
  setAccent('#14141c');
  backBtn.classList.remove('hidden');
  crumb.innerHTML = '<b>All tools</b>';
  const sorted = [...TOOL_INDEX].sort((a,b)=>a.name.localeCompare(b.name));
  const letters = [...new Set(sorted.map(t=>t.name[0].toUpperCase()))].sort();
  app.innerHTML = `
    <div class="hero" style="padding:6px 2px 20px">
      <div class="badge">A–Z</div>
      <div><h1>All ${sorted.length} tools</h1><p>Every tool in the box, alphabetically. Search is faster if you know what you are looking for.</p></div>
    </div>
    <div class="searchbar"><input type="search" id="allSearch" placeholder="Filter…" aria-label="Filter tools" autocomplete="off"><span class="kbdhint">Ctrl K</span></div>
    <div id="allList">
      ${letters.map(L=>{
        const items = sorted.filter(t=>t.name[0].toUpperCase()===L);
        return `<div class="section-label" data-letter>${L}</div>
          <div class="alist">${items.map(t=>`<a class="aitem" href="#/tool/${t.catId}/${t.id}"><span>${escapeHtml(t.name)}</span><span class="acat" style="color:${t.catColor}">${escapeHtml(t.catName)}</span></a>`).join('')}</div>`;
      }).join('')}
    </div>`;
  const search = app.querySelector('#allSearch');
  search.addEventListener('input', ()=>{
    const q = search.value.trim().toLowerCase();
    app.querySelectorAll('.alist').forEach(list=>{
      let shown = 0;
      list.querySelectorAll('.aitem').forEach(a=>{
        const hit = !q || a.textContent.toLowerCase().includes(q);
        a.style.display = hit ? '' : 'none';
        if(hit) shown++;
      });
      const label = list.previousElementSibling;
      if(label && label.hasAttribute('data-letter')) label.style.display = shown ? '' : 'none';
      list.style.display = shown ? '' : 'none';
    });
  });
}

/* ---------- Tool page ---------- */
/* Associate every .field label with the control beside it. The markup predates
   the association and there are several hundred inputs; doing it once here
   fixes them all, and keeps new tools correct without anyone remembering to
   write for/id by hand. axe-core found this — it is the only violation the
   whole app had. */
function associateLabels(scope){
  scope.querySelectorAll('.field').forEach(field=>{
    const label = Array.from(field.children).find(el=>el.tagName === 'LABEL');
    if(!label) return;
    const control = field.querySelector('input, select, textarea');
    if(!control || label.htmlFor) return;
    if(label.contains(control)) return;          // already associated by wrapping
    if(!control.id) control.id = 'kb-' + Math.random().toString(36).slice(2, 9);
    label.htmlFor = control.id;
  });
}

/* What a tool needs from the machine. Shown as a chip before you use it, so a
   tool that cannot work here says so instead of failing halfway. */


function capabilityIssue(toolId){
  const need = TOOL_REQUIRES[toolId];
  if(!need) return null;
  const has = {
    secure: cryptoAvailable,
    camera: ()=>!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    microphone: ()=>!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    geolocation: ()=>!!navigator.geolocation,
    motion: ()=>'DeviceOrientationEvent' in window,
    speech: ()=>!!window.speechSynthesis,
    audio: ()=>!!(window.AudioContext || window.webkitAudioContext)
  }[need];
  if(!has || has()) return null;
  const label = {
    secure: 'needs https or localhost', camera: 'needs a camera', microphone: 'needs a microphone',
    geolocation: 'needs location access', motion: 'needs a motion sensor',
    speech: 'needs speech synthesis', audio: 'needs the Web Audio API'
  }[need] || 'needs a capability this browser lacks';
  return label;
}

/* ---------- Tool chrome ----------
   Everything here runs after a tool renders, so it applies to all 339 of them
   without editing any of them: remembered inputs, an example to try, a reset,
   a reason on every disabled button, drag-and-drop on every file input, a
   paste chip on every empty text field, CSV on every table, and a hint where a
   result would go. */

const TOOL_STATE = new Map();          // "cat/id" -> { inputId: value }

/* What a tool can offer as a worked example, keyed by the input ids it uses.
   Opt-in on purpose: a good example is specific, and a generic one teaches
   nothing. */
const EXAMPLES = {
  'calc/percentage': { pX: '25', pY: '200' },
  'calc/percentchange': { pcA: '100', pcB: '125' },
  'calc/simplecalc': { scIn: '12*(3+4)/2' },
  'calc/fueleconomy': { feDist: '420', feFuel: '31', fePrice: '105' },
  'calc/electricity': { elW: '1500', elH: '2', elR: '8' },
  'calc/pricing': { prCost: '100', prPrice: '150', prFixed: '50000' },
  'calc/statistics': { stIn: '12, 15, 15, 18, 21, 22, 40' },
  'calc/sigfig': { sfIn: '0.004560', sfN: '3' },
  'finance/loanemi': { emiP: '2500000', emiR: '8.5', emiY: '20' },
  'finance/gstsplit': { gsAmt: '10000' },
  'finance/sip': { spAmt: '10000', spRate: '12', spYears: '15' },
  'health/bmi': { bmiW: '70', bmiH: '170' },
  'health/tdeemacros': { tdAge: '35', tdHt: '170', tdWt: '70' },
  'dev/subnet': { snCidr: '192.168.1.0/24' },
  'dev/md5': { md5In: 'The quick brown fox jumps over the lazy dog' },
  'dev/base32': { b58In: 'hello' },
  'dev/sqlin': { sqIn: "1\n2\nO'Brien" },
  'text/accents': { acIn: 'Crème brûlée, jalapeño, façade' },
  'text/smartquotes': { sqIn: '\u201cPaste from Word here\u201d \u2014 it normalises.\u2026' },
  'text/readability': { rdIn: 'A good tool does one thing completely, tells you when it cannot, and never asks for your email address first.' },
  'text/keywords': { kwIn: 'The repertory records graded symptoms; the materia medica records the remedy. Symptoms are graded, remedies are recorded.' },
  'files/csvjson': { cjIn: 'name,city\nAsha,Vadodara\nRavi,Surat' },
  'colors/contrast': { ctFg: '#17171d', ctBg: '#ffffff' },
  'science/idealgas': { igP: '101.325', igV: '22.4', igT: '0' },
  'geo/distance': { dsLat1: '22.3072', dsLng1: '73.1812', dsLat2: '19.0760', dsLng2: '72.8777' },
  'random/teamshuffler': { tmIn: 'Asha\nRavi\nMeera\nKabir\nNita\nImran' }
};

function captureToolState(key, rootEl){
  if(!rootEl) return;
  const state = {};
  rootEl.querySelectorAll('input[id], textarea[id], select[id]').forEach(el=>{
    if(el.type === 'file') return;
    state[el.id] = el.type === 'checkbox' ? el.checked : el.value;
  });
  TOOL_STATE.set(key, state);
}

function restoreToolState(key, rootEl){
  const state = TOOL_STATE.get(key);
  if(!state) return;
  rootEl.querySelectorAll('input[id], textarea[id], select[id]').forEach(el=>{
    if(el.type === 'file' || !(el.id in state)) return;
    if(el.type === 'checkbox') el.checked = !!state[el.id];
    else el.value = state[el.id];
    // Tell the tool its own value changed, so it recomputes rather than
    // showing a result that no longer matches the field.
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function fillExample(key, rootEl){
  const example = EXAMPLES[key];
  if(!example) return;
  Object.keys(example).forEach(id=>{
    const el = rootEl.querySelector('[id="' + id + '"]');
    if(!el) return;
    el.value = example[id];
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/* A greyed-out button with no explanation is a dead end. */
function explainDisabled(rootEl){
  rootEl.querySelectorAll('button[disabled]').forEach(b=>{
    if(!b.title) b.title = 'Nothing to act on yet — fill in the fields first.';
    if(!b.getAttribute('aria-disabled')) b.setAttribute('aria-disabled', 'true');
  });
}

/* Drop a file on the field instead of hunting for it in the picker. */
function wireDropZones(rootEl){
  rootEl.querySelectorAll('input[type=file]').forEach(inp=>{
    const zone = inp.closest('.field') || inp.parentElement;
    if(!zone || zone.dataset.dropWired) return;
    zone.dataset.dropWired = '1';
    zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.style.outline = '2px dashed var(--accent)'; });
    zone.addEventListener('dragleave', ()=>{ zone.style.outline = ''; });
    zone.addEventListener('drop', e=>{
      e.preventDefault();
      zone.style.outline = '';
      if(!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      try{
        inp.files = e.dataTransfer.files;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        toast('File added');
      }catch(err){ toast('That drop could not be read — use the picker'); }
    });
  });
}

/* A hint where the result will appear, instead of a bare dash. */
function hintEmptyOutputs(rootEl){
  if(!rootEl.querySelector('input, textarea, select')) return;
  rootEl.querySelectorAll('.output').forEach(o=>{
    if(o.textContent.trim() !== '—' || o.children.length) return;
    const h = document.createElement('div');
    h.className = 'hint';
    h.style.margin = '0';
    h.textContent = 'Fill in the fields above to see a result.';
    o.appendChild(h);
  });
}

/* Opt-in unit hints: <input type="number" data-unit="cm"> shows "cm" as the
   placeholder until the field has a value. */
function applyUnits(rootEl){
  rootEl.querySelectorAll('input[type=number][data-unit]').forEach(el=>{
    if(!el.placeholder) el.placeholder = el.dataset.unit;
  });
}

function applyToolChrome(key, rootEl){
  restoreToolState(key, rootEl);
  explainDisabled(rootEl);
  wireDropZones(rootEl);
  applyUnits(rootEl);
  hintEmptyOutputs(rootEl);
}

/* ---------- Errors ----------
   A tool that throws should cost you that tool, not the page. The error is
   logged locally (never sent anywhere) and shown with enough detail to report. */
function logError(where, err){
  try{
    const log = store.get('error-log', []);
    log.unshift({
      at: new Date().toISOString(),
      where: where,
      message: (err && err.message) || String(err),
      stack: ((err && err.stack) || '').split('\n').slice(0, 4).join('\n')
    });
    store.set('error-log', log.slice(0, 20));
  }catch(e){ /* storage full or blocked: the panel below still shows */ }
}

function renderToolError(catId, tool, err, rootEl){
  logError(catId + '/' + tool.id, err);
  const details = tool.name + ' (' + tool.code + ')\n' + ((err && err.message) || String(err)) + '\n' + ((err && err.stack) || '');
  rootEl.innerHTML = `
    <div class="output" style="border-color:#c0392b">
      <div style="font-weight:600;color:#c0392b;margin-bottom:8px">This tool hit an error</div>
      <div class="hint" style="margin:0 0 10px">The rest of Kitbox still works. Nothing was sent anywhere — the details below are only on this device.</div>
      <div class="mono" style="font-size:12px;word-break:break-word">${escapeHtml((err && err.message) || String(err))}</div>
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn" id="errCopy">Copy details</button>
      <a class="btn" href="#/category/${catId}" style="text-decoration:none;text-align:center">Back to ${escapeHtml((CATS.find(c=>c.id===catId)||{}).name||'the category')}</a>
      <a class="btn" href="#/" style="text-decoration:none;text-align:center">Home</a>
    </div>
    <div class="hint">If it repeats, System → Error Log has the history, and the issue template asks for it.</div>`;
  const btn = rootEl.querySelector('#errCopy');
  if(btn) btn.addEventListener('click', ()=>{
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(details).then(()=>toast('Copied'), ()=>{});
  });
}

function renderTool(catId, toolId){
  const cat = CATS.find(c=>c.id===catId);
  toolId = resolveToolId(catId, toolId);
  const tool = (TOOLS[catId]||[]).find(t=>t.id===toolId);
  if(!cat || !tool){ renderNotFound('#/tool/' + catId + '/' + toolId); return; }
  setAccent(cat.color);
  backBtn.classList.remove('hidden');
  crumb.innerHTML = `<a class="crumblink" href="#/category/${catId}">${escapeHtml(cat.name)}</a> / ${escapeHtml(tool.name)}`;
  noteRecent(catId, toolId);
  currentToolKey = catId + '/' + toolId;
  const siblings = TOOLS[catId] || [];
  const at = siblings.findIndex(t=>t.id === toolId);
  const prevTool = at > 0 ? siblings[at-1] : null;
  const nextTool = at >= 0 && at < siblings.length-1 ? siblings[at+1] : null;
  app.innerHTML = `
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div>
          <div class="code-pill">${tool.code}</div>${capabilityIssue(toolId) ? ` <span class="chip">${escapeHtml(capabilityIssue(toolId))}</span>` : ''}
          <h2 style="margin-bottom:0">${escapeHtml(tool.name)}</h2>
        </div>
        <div style="display:flex;gap:6px;flex:none;align-items:flex-start">
          <button class="btn ghost" id="prevBtn" style="font-size:12.5px" aria-label="Previous tool in this category" ${prevTool?'':'disabled title="This is the first tool in the category" aria-disabled="true"'}>←</button>
          <button class="btn ghost" id="nextBtn" style="font-size:12.5px" aria-label="Next tool in this category" ${nextTool?'':'disabled title="This is the last tool in the category" aria-disabled="true"'}>→</button>
          ${EXAMPLES[catId + '/' + toolId] ? `<button class="btn ghost" id="exBtn" style="font-size:12.5px">Try an example</button>` : ''}
          <button class="btn ghost" id="linkBtn" style="font-size:12.5px" title="Copy a link that carries what you have typed">Copy link</button>
          <button class="btn ghost" id="rsBtn" style="font-size:12.5px" title="Clear what you typed and start again">Reset</button>
          <button class="btn ghost" id="pinBtn" style="font-size:12.5px" aria-pressed="${isPinned(catId,toolId)}">${isPinned(catId,toolId)?'★ Pinned':'☆ Pin'}</button>
        </div>
      </div>
      <div class="divider"></div>
      <div id="toolRoot" aria-live="polite"></div>
    </div>
  `;
  const exBtn = app.querySelector('#exBtn');
  if(exBtn) exBtn.addEventListener('click', ()=>fillExample(catId + '/' + toolId, toolRoot));
  app.querySelector('#linkBtn').addEventListener('click', ()=>{
    const link = toolPermalink(catId, toolId, toolRoot);
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(link).then(()=>toast('Link copied'), ()=>toast('Could not copy'));
    } else {
      toast('Copy is not available in this browser');
    }
  });
  app.querySelector('#rsBtn').addEventListener('click', ()=>{
    TOOL_STATE.delete(catId + '/' + toolId);
    // Reset means the converter forgets its remembered pair too, not just
    // this session's inputs — otherwise the imperial default never applies.
    store.allKeys().filter(k=>k.startsWith('unit-last-')).forEach(k=>{
      try{ localStorage.removeItem('tooly:' + k); }catch(e){}
    });
    renderTool(catId, toolId);
    toast('Reset');
  });
  if(prevTool) app.querySelector('#prevBtn').addEventListener('click', ()=>{ location.hash = '#/tool/'+catId+'/'+prevTool.id; });
  if(nextTool) app.querySelector('#nextBtn').addEventListener('click', ()=>{ location.hash = '#/tool/'+catId+'/'+nextTool.id; });
  app.querySelector('#pinBtn').addEventListener('click', e=>{
    const now = togglePin(catId, toolId);
    e.target.textContent = now ? '★ Pinned' : '☆ Pin';
    e.target.setAttribute('aria-pressed', String(now));
  });
  const toolRoot = document.getElementById('toolRoot');
  const stateKey = catId + '/' + toolId;
  try{
    tool.render(toolRoot);
    associateLabels(toolRoot);
    applyToolChrome(stateKey, toolRoot);
    applyPendingParams(toolRoot);
  }catch(err){
    renderToolError(catId, tool, err, toolRoot);
  }
}

function applyTextSize(v){
  const scale = Number(v) || 1;
  document.body.style.zoom = scale === 1 ? '' : String(scale);
  store.set('text-size', scale);
  document.querySelectorAll('[data-ts]').forEach(b=>{
    b.classList.toggle('primary', Number(b.dataset.ts) === scale);
  });
  const note = document.getElementById('tsNote');
  if(note) note.textContent = scale === 1 ? 'Default size.' : 'Scaled to ' + Math.round(scale*100) + '%.';
}
function applyPreferences(){
  const num = store.get('num-format', 'in');
  const units = store.get('units', 'metric');
  document.querySelectorAll('[data-num]').forEach(b=>b.classList.toggle('primary', b.dataset.num === num));
  document.querySelectorAll('[data-units]').forEach(b=>b.classList.toggle('primary', b.dataset.units === units));
  const note = document.getElementById('prefNote');
  if(note) note.textContent = 'Numbers in ' + (num === 'us' ? 'international' : 'Indian') + ' grouping; units ' + units + '. Tools already on screen keep their old formatting until you next calculate.';
}
function renderAbout(){
  setAccent('#14141c');
  backBtn.classList.remove('hidden');
  crumb.innerHTML = `<b>About Kitbox</b>`;
  const totalTools = CATS.reduce((a,c)=>a+(TOOLS[c.id]?TOOLS[c.id].length:0),0);
  const totalCats = CATS.filter(c=>TOOLS[c.id]&&TOOLS[c.id].length).length;
  app.innerHTML = `
    <div class="hero" style="padding:8px 2px 30px">
      <div class="badge">KIT</div>
      <div><h1>About Kitbox</h1><p>A single-file, offline toolbox — ${totalTools} tools across ${totalCats} categories, everything running locally on your device.</p></div>
    </div>
    <div class="panel" style="margin-bottom:20px">
      <h2 style="margin-top:0">What this is</h2>
      <p style="color:var(--ink-soft);line-height:1.7">Kitbox is one plain HTML file with no external scripts, fonts, or CDN links. Once you've opened it once, it keeps working with no internet connection — forever, on any device with a modern browser. There's no install, no account, no server, and nothing is ever uploaded anywhere. Images, sketches, and files you work with in Kitbox's tools are processed entirely on your device.</p>

      <h2>How your data works</h2>
      <p style="color:var(--ink-soft);line-height:1.7">A handful of tools remember things between visits — Notepad, Flashcards, Trivia Creator, Sketch Pad's palette, Scoreboard, Habit Tracker, the Packing List, currency rates, ruler calibration, your pinned tools, your recently used list, and the last place you used the Panchang. That data lives only in this browser's local storage on this device; it is never sent anywhere. Because it's local to the browser, clearing your browser data will erase it, and it won't automatically appear on another device or in another browser.</p>
      <p style="color:var(--ink-soft);line-height:1.7">Use <b>Productivity → Backup & Restore</b> to export everything at once, or use the Export/Import buttons inside Notepad, Flashcards, Trivia Creator, Scoreboard, and Currency to back up or share just that tool's data. Exported files are plain JSON — readable, portable, and safe to keep as a backup or send to someone else (e.g. sharing a flashcard deck or quiz with a colleague or student).</p>

      <h2>Finding a tool</h2>
      <p style="color:var(--ink-soft);line-height:1.7">Press <b>Ctrl K</b> (or <b>⌘ K</b> on a Mac) anywhere to search all the tools at once, or <b>/</b> to jump into the same search. Tools you use often can be <b>pinned</b> with the star on any tool page — pinned tools and your recent ones then appear at the top of the home screen. <b>All tools A–Z</b> lists everything alphabetically if you would rather browse.</p>

      <h2>Categories</h2>
      <table class="mono">${CATS.filter(c=>TOOLS[c.id]&&TOOLS[c.id].length).map(c=>`<tr><td>${c.name}</td><td>${TOOLS[c.id].length} tools</td></tr>`).join('')}</table>

      <h2>Notes on accuracy</h2>
      <p style="color:var(--ink-soft);line-height:1.7">Calculators here (health, finance, science, geometry) are built from standard public formulas and spot-checked against known reference values, but they're general-purpose tools, not professional instruments — nothing in Kitbox is a substitute for medical, financial, or legal advice. Tools that use your device's sensors, camera, or microphone (compass, level, decibel meter, GPS speed, barcode scanner) need permission and hardware support, and will say so plainly if unavailable.</p>

      <h2>Display</h2>
      <p style="color:var(--ink-soft);line-height:1.7">The whole app can be scaled up if 14.5px is small on your screen. This is remembered on this device.</p>
      <div class="segrow" id="tsRow">
        <button class="btn" data-ts="1">100%</button>
        <button class="btn" data-ts="1.12">112%</button>
        <button class="btn" data-ts="1.25">125%</button>
      </div>
      <div class="hint" id="tsNote"></div>

      <p style="color:var(--ink-soft);line-height:1.7;margin-top:18px">Numbers and units, for this device:</p>
      <div class="segrow" id="numRow">
        <button class="btn" data-num="in">Indian — ₹1,00,000</button>
        <button class="btn" data-num="us">International — ₹100,000</button>
      </div>
      <div class="segrow" id="unitRow" style="margin-top:10px">
        <button class="btn" data-units="metric">Metric — km, kg, °C</button>
        <button class="btn" data-units="imperial">Imperial — mi, lb, °F</button>
      </div>
      <div class="hint" id="prefNote"></div>

      <h2>Where the tools came from</h2>
      <p style="color:var(--ink-soft);line-height:1.7">Kitbox began as a single-file toolbox. The Files &amp; Data, Almanac and Communication categories, and several of the newer calculation, development and colour tools, were folded in from the rest of the drsamonline projects — the ZIP writer from <b>export-kit</b>, compression from <b>compress-kit</b>, the AES-256-GCM envelope from <b>crypto-kit</b>, the panchang from <b>astro-kit</b> and <b>app-panchang</b>, EXIF stripping from <b>app-image-toolkit</b>, tf-idf from <b>ml-kit</b>, and a long list of everyday utilities from <b>TTB</b> and <b>All4ONE</b>. Everything was rewritten to run inside this one page, with no library and no network call.</p>

      <h2>Credits</h2>
      <p style="color:var(--ink-soft);line-height:1.7">Crafted by <b>Dr. Sohil Momin, BHMS</b> — Vadodara, Gujarat, India.</p>
    </div>
  `;
  app.querySelectorAll('[data-ts]').forEach(b=>b.addEventListener('click', ()=>applyTextSize(b.dataset.ts)));
  app.querySelectorAll('[data-num]').forEach(b=>b.addEventListener('click', ()=>{
    store.set('num-format', b.dataset.num);
    applyPreferences();
  }));
  app.querySelectorAll('[data-units]').forEach(b=>b.addEventListener('click', ()=>{
    store.set('units', b.dataset.units);
    applyPreferences();
  }));
  applyTextSize(store.get('text-size', 1));
  applyPreferences();
}

/* ---------- Command palette (Ctrl/⌘ K, or /) ---------- */
(function(){
  const overlay = document.createElement('div');
  overlay.className = 'palette-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="palette" role="dialog" aria-modal="true" aria-label="Search tools">
      <input type="search" id="palInput" placeholder="Search every tool…" autocomplete="off" spellcheck="false" aria-label="Search every tool">
      <div id="palCount" class="sr-only" aria-live="polite"></div>
      <div id="palList" class="pal-list"></div>
      <div class="pal-foot"><span>↑ ↓ move</span><span>↵ open</span><span>esc close</span><span style="margin-left:auto">${TOOL_INDEX.length} tools</span></div>
    </div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector('#palInput');
  const list = overlay.querySelector('#palList');
  let results = [], active = 0;

  function paint(){
    if(!input.value.trim()){
      const pinned = pinnedList().map(p=>lookup(p.cat, p.tool)).filter(Boolean).slice(0,6);
      const recent = store.get('recent', []).map(p=>lookup(p.cat, p.tool)).filter(Boolean).slice(0,6);
      results = [...pinned, ...recent.filter(r=>!pinned.some(p=>p.tool.id===r.tool.id))];
      if(!results.length){
        const hist = store.get('palette-history', []);
        list.innerHTML = hist.length
          ? `<div class="pal-group">Recent searches</div>` + hist.map(h=>`<button class="pal-item" data-hist="${escapeHtml(h)}"><span>${escapeHtml(h)}</span><span class="pal-cat">search</span></button>`).join('')
            + `<div class="pal-empty">Type to search ${TOOL_INDEX.length} tools.</div>`
          : `<div class="pal-empty">Type to search ${TOOL_INDEX.length} tools. Try “panchang”, “hash”, “zip”.</div>`;
        list.querySelectorAll('[data-hist]').forEach(b=>b.addEventListener('click', ()=>{
          input.value = b.dataset.hist;
          paint();
        }));
        announce(0);
        return;
      }
      active = 0;
      const hist = store.get('palette-history', []);
      list.innerHTML = `<div class="pal-group">Pinned and recent</div>` + results.map((r,i)=>
          `<button class="pal-item ${i===active?'on':''}" data-i="${i}"><span>${escapeHtml(r.tool.name)}</span><span class="pal-cat" style="color:${r.cat.color}">${escapeHtml(r.cat.name)}</span></button>`).join('')
        + (hist.length
            ? `<div class="pal-group">Recent searches</div>` + hist.map(h=>
                `<button class="pal-item" data-hist="${escapeHtml(h)}"><span>${escapeHtml(h)}</span><span class="pal-cat">search</span></button>`).join('')
            : '');
      list.querySelectorAll('[data-hist]').forEach(b=>b.addEventListener('click', ()=>{
        input.value = b.dataset.hist;
        paint();
      }));
    } else {
      results = searchTools(input.value).map(t=>({cat:{id:t.catId, name:t.catName, color:t.catColor}, tool:{id:t.id, name:t.name}}));
      active = 0;
      list.innerHTML = results.length
        ? results.slice(0,20).map((r,i)=>`<button class="pal-item ${i===active?'on':''}" data-i="${i}"><span>${escapeHtml(r.tool.name)}</span><span class="pal-cat" style="color:${r.cat.color}">${escapeHtml(r.cat.name)}</span></button>`).join('')
        : `<div class="pal-empty">No tool matches that.</div>`;
    }
    announce(results.length);
    list.querySelectorAll('.pal-item').forEach(b=>{
      b.addEventListener('click', ()=>choose(+b.dataset.i));
      b.addEventListener('mousemove', ()=>{ active = +b.dataset.i; highlight(); });
    });
  }
  function announce(n){
    const el = overlay.querySelector('#palCount');
    if(el) el.textContent = n ? n + (n === 1 ? ' result' : ' results') : 'No results';
  }
  function highlight(){
    list.querySelectorAll('.pal-item').forEach((b,i)=>b.classList.toggle('on', i===active));
  }
  function choose(i){
    const r = results[i];
    if(!r) return;
    const q = input.value.trim();
    if(q){
      const hist = store.get('palette-history', []).filter(h=>h !== q);
      hist.unshift(q);
      store.set('palette-history', hist.slice(0, 5));
    }
    close();
    location.hash = '#/tool/'+r.cat.id+'/'+r.tool.id;
  }
  function open(query){
    overlay.hidden = false;
    input.value = query || '';
    paint();
    input.focus();
    store.set('seen-palette-hint', true);
    const hint = document.getElementById('firstRun');
    if(hint) hint.remove();
  }
  function close(){ overlay.hidden = true; }

  let gPending = false, gAt = 0;
  input.addEventListener('input', paint);

  /* ?q=hash opens the palette pre-filled, so a search is a shareable link. */
  const initial = new URLSearchParams(location.search).get('q');
  if(initial) open(initial);
  overlay.addEventListener('click', e=>{ if(e.target === overlay) close(); });
  window.addEventListener('keydown', e=>{
    const typing = /^(input|textarea|select)$/i.test((document.activeElement||{}).tagName||'');
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); overlay.hidden ? open() : close(); return; }
    if(e.key === '/' && !typing && overlay.hidden){ e.preventDefault(); open(); return; }
    if(!overlay.hidden){
      if(e.key === 'Escape'){ e.preventDefault(); close(); }
      else if(e.key === 'ArrowDown'){ e.preventDefault(); active = Math.min(active+1, Math.max(0, Math.min(results.length,20)-1)); highlight(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); active = Math.max(0, active-1); highlight(); }
      else if(e.key === 'Enter'){ e.preventDefault(); choose(active); }
      else if((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)){
        e.preventDefault();
        choose(Number(e.key) - 1);
      }
      return;
    }
    if(e.key === 'Escape' && location.hash && location.hash !== '#/' && !typing){ history.back(); }

    /* g then h / a / s / t — home, all tools, support, this tool. */
    if(!typing && !overlay.hidden === false){
      if(gPending && Date.now() - gAt < 1200){
        const dest = { h:'#/', a:'#/all', s:'#/support', t:'#/about' }[e.key];
        gPending = false;
        if(dest){ e.preventDefault(); location.hash = dest; return; }
      }
      if(e.key === 'g'){ gPending = true; gAt = Date.now(); return; }
    }
  });
})();


/* ---------- Support ---------- */
function renderSupport(){
  setAccent('#C2185B');
  backBtn.classList.remove('hidden');
  crumb.innerHTML = '<b>Support Kitbox</b>';
  app.innerHTML = `
    <div class="hero" style="padding:8px 2px 26px">
      <div class="badge" style="background:#E31C7D">SM</div>
      <div>
        <h1>Support Kitbox</h1>
        <p>Free, offline, accountless — and staying that way. If it earned its keep, this is how to say so.</p>
      </div>
    </div>

    <div class="panel" style="margin-bottom:20px">
      <h2 style="margin-top:0">Nothing here is gated</h2>
      <p style="color:var(--ink-soft);line-height:1.7">There is no paid tier, no account, no tracking and no network request anywhere in this file — supporting it buys you nothing inside the app, because there is nothing inside the app to buy. What it buys is the next version: the time to audit another tool, write another test, and keep the whole thing free for the next person who needs a toolbox on a machine with no internet.</p>
    </div>

    <div class="section-label">If you would like to</div>
    <div class="panel" style="margin-bottom:20px">
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:none">
          <div style="background:#fff;padding:10px;border:1px solid var(--line);width:196px">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="176" height="176" class="segno"><title>UPI: drsohilboi@ybl</title><desc>Scan with any UPI app to pay Dr. Sohil Momin</desc><g transform="scale(6)"><path fill="#fff" d="M0 0h37v37h-37z"/><path class="qrline" stroke="#0b0b0b" d="M2 2.5h7m2 0h2m2 0h1m4 0h4m1 0h1m2 0h7m-33 1h1m5 0h1m2 0h2m1 0h4m1 0h1m3 0h2m3 0h1m5 0h1m-33 1h1m1 0h3m1 0h1m1 0h2m3 0h1m1 0h2m1 0h2m1 0h2m3 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h2m1 0h1m2 0h1m2 0h1m5 0h2m1 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h1m6 0h1m1 0h3m1 0h4m1 0h1m1 0h3m1 0h1m-33 1h1m5 0h1m1 0h1m1 0h6m1 0h1m3 0h2m1 0h1m1 0h1m5 0h1m-33 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-25 1h1m1 0h3m2 0h1m3 0h3m-22 1h1m1 0h5m2 0h1m2 0h4m1 0h1m1 0h1m2 0h2m2 0h5m-29 1h2m1 0h1m2 0h2m2 0h1m1 0h1m1 0h1m1 0h7m1 0h1m3 0h1m-31 1h1m1 0h1m3 0h4m2 0h1m2 0h1m1 0h2m8 0h1m2 0h2m-32 1h1m1 0h1m1 0h1m2 0h2m1 0h1m3 0h1m5 0h2m2 0h1m2 0h1m1 0h3m-32 1h2m3 0h4m2 0h1m3 0h1m1 0h1m1 0h1m4 0h2m2 0h1m2 0h2m-31 1h2m1 0h1m1 0h1m1 0h2m3 0h2m1 0h1m1 0h5m1 0h1m1 0h1m1 0h4m-33 1h1m3 0h1m1 0h2m2 0h1m1 0h1m2 0h1m2 0h1m1 0h1m6 0h2m1 0h2m-29 1h3m1 0h1m1 0h1m1 0h2m8 0h1m2 0h2m1 0h1m1 0h3m-31 1h3m1 0h2m5 0h2m1 0h1m1 0h3m2 0h4m2 0h2m1 0h1m-30 1h4m2 0h2m4 0h1m1 0h1m1 0h6m1 0h2m4 0h2m-33 1h1m1 0h1m1 0h8m1 0h4m3 0h2m2 0h1m3 0h3m-31 1h2m1 0h1m4 0h1m1 0h1m3 0h2m5 0h1m2 0h3m1 0h1m1 0h1m1 0h1m-33 1h3m3 0h2m1 0h3m1 0h2m1 0h4m1 0h2m1 0h2m2 0h2m1 0h2m-33 1h2m1 0h2m3 0h1m2 0h1m3 0h2m2 0h3m1 0h1m2 0h2m2 0h3m-33 1h1m2 0h4m1 0h1m2 0h3m1 0h1m4 0h1m3 0h1m1 0h1m4 0h1m-32 1h1m1 0h1m1 0h1m3 0h1m4 0h1m2 0h1m3 0h3m1 0h2m4 0h3m-33 1h1m2 0h1m1 0h2m3 0h1m1 0h3m1 0h4m2 0h7m3 0h1m-25 1h1m1 0h1m3 0h1m1 0h2m1 0h2m2 0h2m3 0h1m3 0h1m-33 1h7m4 0h1m2 0h2m5 0h4m1 0h1m1 0h1m2 0h1m-32 1h1m5 0h1m1 0h1m2 0h2m1 0h2m5 0h4m3 0h1m1 0h1m-31 1h1m1 0h3m1 0h1m1 0h1m1 0h6m3 0h1m2 0h1m1 0h5m-29 1h1m1 0h3m1 0h1m1 0h2m1 0h3m1 0h2m1 0h3m2 0h1m3 0h3m1 0h2m-33 1h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m2 0h2m3 0h1m1 0h2m1 0h3m-28 1h1m5 0h1m2 0h3m3 0h1m2 0h5m2 0h2m1 0h1m1 0h1m-31 1h7m1 0h4m1 0h2m1 0h4m2 0h5m1 0h1m2 0h1"/></g></svg>
          </div>
          <div class="mono" style="font-size:11.5px;color:var(--ink-soft);margin-top:8px;text-align:center">Scan with any UPI app</div>
        </div>
        <div style="flex:1;min-width:240px">
          <table class="mono">
            <tr><td style="white-space:nowrap;padding-right:16px">UPI (India)</td><td><b>drsohilboi@ybl</b><div class="hint" style="margin:2px 0 0">payee Dr. Sohil Momin · any amount</div></td></tr>
            <tr><td style="white-space:nowrap;padding-right:16px">Ko-fi</td><td><a href="https://ko-fi.com/matneo" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">ko-fi.com/matneo</a></td></tr>
            <tr><td style="white-space:nowrap;padding-right:16px">PayPal</td><td><a href="https://paypal.me/drsohilmomin" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">paypal.me/drsohilmomin</a></td></tr>
            <tr><td style="white-space:nowrap;padding-right:16px">My books</td><td><a href="https://www.amazon.com/stores/author/B08ZT331LY/allbooks" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Amazon author store</a></td></tr>
            <tr><td style="white-space:nowrap;padding-right:16px">More apps</td><td><a href="https://drsamonline.github.io/" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">drsamonline.github.io</a></td></tr>
            <tr><td style="white-space:nowrap;padding-right:16px">Email</td><td><a href="mailto:sohilmomin2000@gmail.com" style="color:var(--accent)">sohilmomin2000@gmail.com</a></td></tr>
          </table>
        </div>
      </div>
    </div>

    <div class="section-label">Other ways that cost nothing</div>
    <div class="panel" style="margin-bottom:20px">
      <p style="color:var(--ink-soft);line-height:1.7;margin:0">
        Tell someone who works on a locked-down machine. Report a tool that gave a wrong answer — that is worth more than money, because a calculator nobody checks is a liability. Send the passage you want as the next category. Or just keep using it offline, which is the whole point.
      </p>
    </div>

    <div class="panel">
      <h2 style="margin-top:0">About the person behind it</h2>
      <p style="color:var(--ink-soft);line-height:1.7;margin:0">Dr. Sohil Momin, BHMS — a homeopathic physician in Vadodara, Gujarat, who writes software for the places where the internet is not: clinics, classrooms, and the old laptop in the consulting room. Kitbox is one of a fleet of single-file tools, all offline, all without accounts.</p>
    </div>
    <div class="footer-note">Kitbox — crafted by Dr. Sohil Momin, BHMS · Vadodara, India</div>
  `;
}

/* Where you were on each page, so going into a tool and back does not dump you
   at the top of a 51-tile grid. */
const scrollMemo = new Map();
let lastHash = '';
let seenFirstRoute = false;

/* ---------- Bench (?bench=1) ----------
   Measured in the browser that is actually running the app, not in jsdom.
   It renders every tool into a detached container and times it, so the numbers
   describe the real cost of building the UI rather than of parsing the file. */
function renderBench(){
  setAccent('#14141c');
  backBtn.classList.add('hidden');
  crumb.innerHTML = '<b>Bench</b>';
  // Two passes: the first pays every one-time cost (Intl.supportedValuesOf
  // building the IANA list, feature probing, lazily built literals), the
  // second is what a tool actually costs once the app is warm. Reporting only
  // one of them is how a one-time 80 ms gets mistaken for a slow tool.
  // Three renders per tool, median taken: one sample per tool is dominated by
  // whatever GC happens to land in that slot — the first version reported a
  // tool as slower warm than cold, which is not a thing.
  function sweep(){
    const out = [];
    const box = document.createElement('div');
    for(const c of CATS){
      for(const t of (TOOLS[c.id] || [])){
        const samples = [];
        let failed = false;
        for(let i=0;i<3;i++){
          const s = performance.now();
          try{ t.render(box); }catch(e){ failed = true; }
          samples.push(performance.now() - s);
          box.textContent = '';
        }
        samples.sort((a,b)=>a-b);
        out.push({ id: c.id + '/' + t.id, name: t.name, ms: samples[1], failed });
      }
    }
    return out;
  }
  const firstStarted = performance.now();
  const cold = sweep();
  const coldTotal = performance.now() - firstStarted;
  const started = performance.now();
  const results = sweep();
  const total = performance.now() - started;
  const coldOf = {};
  cold.forEach(r=>{ coldOf[r.id] = r.ms; });
  let nav = null;
  try{
    const e = performance.getEntriesByType('navigation')[0];
    if(e && e.domContentLoadedEventEnd > 0) nav = e.domContentLoadedEventEnd;
    else if(performance.timing && performance.timing.navigationStart > 0){
      nav = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    }
    if(nav !== null && (nav < 0 || nav > 60000)) nav = null;
  }catch(err){}
  // Headless and file:// runs often have no navigation entry at all; time since
  // the page started is still an honest "how long until it was usable".
  if(nav === null) nav = performance.now();
  results.sort((a,b)=>b.ms - a.ms);
  const slow = results.slice(0, 20);
  const over = results.filter(r=>r.ms > 5).length;
  app.innerHTML = `
    <div class="hero" style="padding:6px 2px 20px">
      <div class="badge">BENCH</div>
      <div>
        <h1>Bench</h1>
        <p>${results.length} tools rendered into a detached container in this browser, not in a test harness.</p>
      </div>
    </div>
    <div class="output" style="margin-bottom:18px">
      <table class="mono">
        <tr><td>Page ready (DOMContentLoaded)</td><td>${nav === null ? 'not reported' : nav.toFixed(0) + ' ms'}</td></tr>
        <tr><td>All ${results.length} tools, first pass (cold)</td><td>${coldTotal.toFixed(0)} ms</td></tr>
        <tr><td>All ${results.length} tools, second pass (warm)</td><td>${total.toFixed(0)} ms</td></tr>
        <tr><td>Mean per tool, warm</td><td>${(total / results.length).toFixed(2)} ms</td></tr>
        <tr><td>Tools over 5 ms</td><td>${over}</td></tr>
        <tr><td>Slowest</td><td>${slow[0].name} ${slow[0].ms.toFixed(1)} ms</td></tr>
      </table>
    </div>
    <div class="section-label">Slowest twenty</div>
    <table class="mono">
      <tr><th style="text-align:left">Tool</th><th style="text-align:left">id</th><th style="text-align:left">ms</th></tr>
      ${slow.map(r=>`<tr><td>${escapeHtml(r.name)}${r.failed ? ' (threw)' : ''}</td><td>${escapeHtml(r.id)}</td><td>${r.ms.toFixed(1)} <span style="color:#9a9a9f">(cold ${(coldOf[r.id]||0).toFixed(1)})</span></td></tr>`).join('')}
    </table>
    <div class="hint">Append <span class="mono">?bench=1</span> to the URL to run this again. Nothing is sent anywhere; the numbers are for you.</div>`;
  window.__bench = { coldTotal, total, nav, results: results.map(r=>({ id: r.id, ms: +r.ms.toFixed(2), cold: +(coldOf[r.id]||0).toFixed(2), failed: r.failed })) };
}

function renderNotFound(hash){
  setAccent('#14141c');
  backBtn.classList.remove('hidden');
  crumb.innerHTML = '<b>Not found</b>';
  app.innerHTML = `
    <div class="hero" style="padding:8px 2px 24px">
      <div class="badge" style="background:#495057">404</div>
      <div>
        <h1>Nothing here</h1>
        <p>There is no tool at <span class="mono">${escapeHtml(hash)}</span>. The link may be old, or the tool may have been renamed.</p>
      </div>
    </div>
    <div class="searchbar">
      <input type="search" id="nfSearch" placeholder="Search all ${TOOL_INDEX.length} tools" aria-label="Search tools" autocomplete="off">
      <span class="kbdhint">Ctrl K</span>
    </div>
    <div class="row">
      <a class="btn" href="#/" style="text-decoration:none;text-align:center">All categories</a>
      <a class="btn" href="#/all" style="text-decoration:none;text-align:center">All tools A–Z</a>
    </div>`;
  const input = app.querySelector('#nfSearch');
  input.focus();
  input.addEventListener('keydown', e=>{
    if(e.key !== 'Enter') return;
    const hit = searchTools(input.value)[0];
    if(hit) location.hash = '#/tool/' + hit.catId + '/' + hit.id;
  });
}

let currentToolKey = null;
let pendingParams = null;

/* A link that carries the inputs. Scalar fields only — a permalink with a
   2,000-character note in it is not a link anybody should send. */
function toolPermalink(catId, toolId, rootEl){
  const params = new URLSearchParams();
  rootEl.querySelectorAll('input[id], textarea[id], select[id]').forEach(el=>{
    if(el.type === 'file' || el.type === 'checkbox') return;
    const v = el.value;
    if(v === '' || v == null || v.length > 200) return;
    params.set(el.id, v);
  });
  const base = location.protocol === 'file:' ? location.href.split('#')[0] : location.origin + location.pathname;
  const q = params.toString();
  return base + '#/tool/' + catId + '/' + toolId + (q ? '?' + q : '');
}

function applyPendingParams(rootEl){
  if(!pendingParams) return;
  Object.keys(pendingParams).forEach(id=>{
    const el = rootEl.querySelector('[id="' + id + '"]');
    if(!el || el.type === 'file') return;
    el.value = pendingParams[id];
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  pendingParams = null;
}

function route(){
  runCleanup();
  const rawHash = location.hash || '#/';
  const qAt = rawHash.indexOf('?');
  const hash = qAt >= 0 ? rawHash.slice(0, qAt) : rawHash;
  if(qAt >= 0){
    pendingParams = {};
    new URLSearchParams(rawHash.slice(qAt + 1)).forEach((v, k)=>{ pendingParams[k] = v; });
  }
  if(lastHash) scrollMemo.set(lastHash, window.scrollY);
  if(currentToolKey){
    captureToolState(currentToolKey, document.getElementById('toolRoot'));
    currentToolKey = null;
  }
  const parts = hash.replace('#/','').split('/').filter(Boolean);
  if(new URLSearchParams(location.search).has('bench')){ renderBench(); return; }
  if(parts[0]==='about') renderAbout();
  else if(parts[0]==='all') renderAll();
  else if(parts[0]==='support') renderSupport();
  else if(parts[0]==='category' && parts[1]) renderCategory(parts[1]);
  else if(parts[0]==='tool' && parts[1] && parts[2]) renderTool(parts[1], parts[2]);
  else if(!parts.length) renderHome();
  else renderNotFound(hash);
  lastHash = hash;

  // Move focus to the page heading, so a screen reader lands on the new page
  // instead of staying where the previous one was. Skipped on first paint,
  // where stealing focus would be rude.
  const h1 = app.querySelector('h1');
  if(h1 && seenFirstRoute){
    h1.setAttribute('tabindex', '-1');
    h1.focus({preventScroll: true});
  }
  seenFirstRoute = true;
  window.scrollTo(0, scrollMemo.get(hash) || 0);
}
migrateStore();

window.addEventListener('error', e=>{ logError('window', e.error || e.message); });
window.addEventListener('unhandledrejection', e=>{ logError('promise', e.reason); });

backBtn.addEventListener('click', ()=>{ history.back(); });
document.getElementById('aboutBtn').addEventListener('click', ()=>{ location.hash = '#/about'; });
document.getElementById('supportBtn').addEventListener('click', ()=>{ location.hash = '#/support'; });
window.addEventListener('hashchange', route);
window.addEventListener('beforeunload', runCleanup);
route();
