/* Smoke + function tests for Kitbox.
 *
 * The app is one HTML file with no build step, so the tests load it in jsdom
 * exactly as a browser would, then:
 *   1. render every tool once and fail on any thrown error;
 *   2. check that tool ids and tool names are unique;
 *   3. route every category and every first tool through the real router;
 *   4. check the ported algorithms against published reference values
 *      (Meeus 25.b and 47.a, MD5 test vectors, CRC32, base32/base58).
 *
 * Usage: npm ci && npm test
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const APP = path.join(__dirname, '..', 'kitbox.html');
const html = fs.readFileSync(APP, 'utf8');
const PINNED = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'codes.json'), 'utf8'));

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? (pass++, console.log('PASS  ' + name + (extra ? '  (' + extra + ')' : '')))
       : (fail++, console.log('FAIL  ' + name + (extra ? '  (' + extra + ')' : '')));
};

/* jsdom has no canvas implementation; a stub is enough to build the UI. */
function stubCanvas(w) {
  const ctx = new Proxy({}, { get: (t, k) => {
    if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (k === 'measureText') return () => ({ width: 10 });
    if (/^create(Linear|Radial|Conic)Gradient$/.test(k)) return () => ({ addColorStop() {} });
    if (k === 'canvas') return null;
    return () => {};
  }});
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
  w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.HTMLMediaElement.prototype.pause = () => {};
  w.HTMLMediaElement.prototype.load = () => {};
}

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });
const w = dom.window;
stubCanvas(w);

setTimeout(async () => {
  const ev = s => w.eval(s);
  const TOOLS = ev('TOOLS'), CATS = ev('CATS');
  const mount = (cat, id) => {
    const root = w.document.createElement('div');
    w.document.body.appendChild(root);
    TOOLS[cat].find(t => t.id === id).render(root);
    return root;
  };

  /* 1. every tool renders */
  let total = 0;
  const failures = [];
  for (const cat of CATS) {
    for (const tool of (TOOLS[cat.id] || [])) {
      total++;
      const root = w.document.createElement('div');
      w.document.body.appendChild(root);
      try { tool.render(root); }
      catch (e) { failures.push(cat.id + '/' + tool.id + ' :: ' + e.message.split('\n')[0]); }
      finally { root.remove(); }
    }
  }
  ok('every tool renders (' + total + ' tools, ' + CATS.length + ' categories)', failures.length === 0, failures.join('; '));

  /* 2. unique ids and names */
  const ids = [], names = [];
  for (const cat of CATS) {
    const seen = new Set();
    for (const t of (TOOLS[cat.id] || [])) {
      if (seen.has(t.id)) ids.push(cat.id + '/' + t.id);
      seen.add(t.id);
      names.push(t.name.toLowerCase());
    }
  }
  ok('tool ids are unique within each category', ids.length === 0, ids.join(', '));
  const dupNames = names.filter((n, i) => names.indexOf(n) !== i);
  ok('tool names are unique across the app', dupNames.length === 0, [...new Set(dupNames)].join(', '));

  /* 3. the router survives every page */
  const routes = ['#/', '#/all', '#/about', '#/support'];
  for (const cat of CATS) {
    if (!(TOOLS[cat.id] || []).length) continue;
    routes.push('#/category/' + cat.id);
    routes.push('#/tool/' + cat.id + '/' + TOOLS[cat.id][0].id);
  }
  let routeFails = 0;
  for (const r of routes) {
    try { ev('location.hash=' + JSON.stringify(r)); ev('route()'); }
    catch (e) { routeFails++; console.log('  route ' + r + ' :: ' + e.message.split('\n')[0]); }
  }
  ok('every route renders', routeFails === 0, routes.length + ' routes');

  /* 4. ported algorithms against reference values */
  const A = ev('ASTRO');
  ok('sun apparent longitude vs Meeus 25.b (199.90895)',
     Math.abs(A.sunLongitude(2448908.5) - 199.90895) < 0.02, A.sunLongitude(2448908.5).toFixed(5));
  ok('moon longitude vs Meeus 47.a (133.162655)',
     Math.abs(A.moonLongitude(2448724.5) - 133.162655) < 0.05, A.moonLongitude(2448724.5).toFixed(5));
  ok('J2000 = JD 2451545.0', Math.abs(A.jd({ y: 2000, m: 1, d: 1, h: 12 }) - 2451545.0) < 1e-6);

  const midsummer = A.sunriseSunset(new Date(Date.UTC(2026, 5, 21)), 28.6139, 77.2090);
  ok('Delhi midsummer sunrise ~05:20 IST', midsummer.sunrise + 5.5 > 5.1 && midsummer.sunrise + 5.5 < 5.6,
     (midsummer.sunrise + 5.5).toFixed(2));
  ok('Delhi midsummer sunset ~19:25 IST', midsummer.sunset + 5.5 > 19.1 && midsummer.sunset + 5.5 < 19.7,
     (midsummer.sunset + 5.5).toFixed(2));

  let root = mount('dev', 'md5');
  const md5in = root.querySelector('#md5In');
  md5in.value = 'abc'; md5in.dispatchEvent(new w.Event('input'));
  ok('MD5("abc")', root.querySelector('#md5Out').textContent.trim() === '900150983cd24fb0d6963f7d28e17f72');
  md5in.value = 'The quick brown fox jumps over the lazy dog'; md5in.dispatchEvent(new w.Event('input'));
  ok('MD5(quick brown fox)', root.querySelector('#md5Out').textContent.trim() === '9e107d9d372bb6826bd81d3542a419d6');

  ok('CRC32("123456789") = cbf43926', ev('crc32(bytesFromText("123456789")).toString(16)') === 'cbf43926');

  const zip = ev('Array.from(buildZip([{name:"a.txt", data: bytesFromText("hello")}]))');
  ok('ZIP has a local header and an end-of-central-directory record',
     zip[0] === 0x50 && zip[1] === 0x4b && zip[2] === 3 && zip[3] === 4 &&
     zip.slice(-22, -18).join(',') === [0x50, 0x4b, 5, 6].join(','));

  root = mount('dev', 'base32');
  const bIn = root.querySelector('#b58In'), bOut = root.querySelector('#b58Out');
  const click = k => root.querySelector('[data-b="' + k + '"]').click();
  bIn.value = 'hello'; click('32enc');
  ok('base32("hello") = NBSWY3DP', bOut.value === 'NBSWY3DP');
  bIn.value = bOut.value; click('32dec');
  ok('base32 round trip', bOut.value === 'hello');
  bIn.value = 'hello'; click('58enc');
  ok('base58("hello") = Cn8eVZg', bOut.value === 'Cn8eVZg');

  /* 5. user text is escaped, never parsed as markup */
  root = mount('text', 'textdecoration');
  const td = root.querySelector('#tdIn');
  td.value = '<img src=x onerror="window.__pwn=1">';
  td.dispatchEvent(new w.Event('input'));
  ok('user text is escaped in text decoration', root.querySelectorAll('img').length === 0 && !w.__pwn);

  /* 5b. second-pass tools: spot-check the arithmetic against known values */
  root = mount('unit', 'papersize');
  ok('A4 at 300 DPI is 2480 × 3508 px',
     root.querySelector('#psOut').textContent.includes('2480') && root.querySelector('#psOut').textContent.includes('3508'));

  root = mount('finance', 'gstsplit');
  ok('18% GST on ₹10,000 adds ₹1,800',
     root.querySelector('#gsOut').textContent.includes('1800.00') && root.querySelector('#gsOut').textContent.includes('11800.00'));

  root = mount('science', 'idealgas');
  ok('22.4 L at STP is one mole', /0\.999\d mol/.test(root.querySelector('#igOut').textContent));

  root = mount('science', 'projectile');
  ok('20 m/s at 45° ranges about 40.77 m', /40\.7\d m/.test(root.querySelector('#pjOut').textContent));

  root = mount('comms', 'smscount');
  const smsIn = root.querySelector('#smIn');
  smsIn.value = 'Hello ₹'; smsIn.dispatchEvent(new w.Event('input'));
  ok('a ₹ symbol forces UCS-2', root.querySelector('#smOut').textContent.includes('UCS-2'));

  root = mount('text', 'accents');
  root.querySelector('#acIn').value = 'Crème brûlée, Ærø';
  root.querySelector('#acGo').click();
  ok('accents stripped to ASCII', root.querySelector('#acOut').value === 'Creme brulee, AEro');

  root = mount('dev', 'sqlin');
  const sqIn = root.querySelector('#sqIn');
  sqIn.value = "O'Brien"; sqIn.dispatchEvent(new w.Event('input'));
  ok("SQL list escapes O'Brien", root.querySelector('#sqOut').textContent.includes("'O''Brien'"));

  /* 5c. the support page carries the real UPI details, inline */
  ev('location.hash="#/support"'); ev('route()');
  const support = w.document.querySelector('#app').textContent;
  ok('support page has the UPI id and a QR', support.includes('drsohilboi@ybl') && !!w.document.querySelector('#app svg.segno'));


  /* 7. the shell: B1 quick wins */
  ok('a <noscript> explains itself', /<noscript>/.test(html) && /Kitbox needs JavaScript/.test(html));
  ok('skip link is the first thing in the body', !!w.document.querySelector('a.skip[href="#app"]'));

  ev('location.hash="#/tool/nope/nothing"'); ev('route()');
  const nf = w.document.querySelector('#app').textContent;
  ok('an unknown tool renders a not-found panel, not the home page',
     /Nothing here/.test(nf) && !!w.document.querySelector('#nfSearch'), nf.slice(0, 50).replace(/\s+/g, ' '));

  ev('location.hash="#/tool/almanac/panchang"'); ev('route()');
  const crumb = w.document.querySelector('#crumb a.crumblink');
  ok('the breadcrumb links back to the category', !!crumb && crumb.getAttribute('href') === '#/category/almanac');
  ok('the tool root is a live region', w.document.querySelector('#toolRoot').getAttribute('aria-live') === 'polite');

  // double-click to copy: delegated, so it survives a tool re-rendering itself
  let copied = null;
  Object.defineProperty(w.navigator, 'clipboard', {
    value: { writeText: t => { copied = t; return Promise.resolve(); } }, configurable: true });
  const box = w.document.createElement('div');
  box.className = 'output'; box.textContent = 'hello result';
  w.document.querySelector('#toolRoot').appendChild(box);
  box.dispatchEvent(new w.MouseEvent('dblclick', { bubbles: true }));
  await new Promise(r => setTimeout(r, 10));
  ok('double-click copies a result block', copied === 'hello result', JSON.stringify(copied));
  ok('and says so', !!w.document.getElementById('kToast'));

  ev('location.hash="#/"'); ev('route()');
  const catBtn = w.document.querySelector('[data-cat]');
  ok('category tiles carry a title attribute', !!catBtn.getAttribute('title'), catBtn.getAttribute('title'));

  const fr = w.document.querySelector('#firstRun');
  ok('the first-run hint mentions Ctrl K', !!fr && /Ctrl K/.test(fr.textContent));
  ev("store.set('seen-palette-hint', true)"); ev('route()');
  ok('the first-run hint stays dismissed', w.document.querySelector('#firstRun').textContent.trim() === '');

  const palCount = w.document.querySelector('#palCount');
  ok('the palette announces its result count', !!palCount && palCount.getAttribute('aria-live') === 'polite');

  ev('location.hash="#/tool/files/filecrypt"'); ev('route()');
  const pw = w.document.querySelector('#fcPass');
  pw.value = 'correct horse battery staple'; pw.dispatchEvent(new w.Event('input'));
  ok('the passphrase field reports strength',
     /strong|good|fair|weak|common/.test(w.document.querySelector('#fcPassHint').textContent),
     w.document.querySelector('#fcPassHint').textContent.slice(0, 50));

  ok('file size guards exist', ev("typeof fileTooBig === 'function' && typeof fileTooBigMsg === 'function'"));

  /* 8. ?q= opens the palette pre-filled, in a fresh window */
  const deep = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/?q=hash' });
  stubCanvas(deep.window);
  await new Promise(r => setTimeout(r, 700));
  const d = deep.window.document;
  ok('?q= opens the palette with the query filled',
     !d.querySelector('.palette-overlay').hidden && d.querySelector('#palInput').value === 'hash',
     d.querySelector('#palInput').value);
  ok('?q= finds matching tools', d.querySelectorAll('.pal-item').length > 0,
     d.querySelectorAll('.pal-item').length + ' results');
  deep.window.close();


  /* 9. contrast and accessibility (B2) */
  const tiles = ev("CATS.map(c=>({name:c.name, color:c.color, ink:inkFor(c.color), ratio:contrastWith(c.color, inkFor(c.color))}))");
  const badTiles = tiles.filter(t => t.ratio < 4.5);
  ok('every category tile clears 4.5:1 with the ink the app picked',
     badTiles.length === 0,
     badTiles.length ? badTiles.map(t => t.name + ' ' + t.color + ' ' + t.ratio.toFixed(2)).join(', ')
                     : 'worst ' + Math.min(...tiles.map(t => t.ratio)).toFixed(2) + ':1');

  ok('the page has a main landmark', !!w.document.querySelector('main#app'));
  ok('the top bar is a header', !!w.document.querySelector('header.topbar'));
  ok('the page buttons sit in a labelled nav', !!w.document.querySelector('nav[aria-label]'));

  ev('location.hash="#/tool/almanac/panchang"'); ev('route()');
  const labelled = Array.from(w.document.querySelectorAll('#toolRoot .field label'))
    .filter(l => l.htmlFor || l.querySelector('input,select,textarea'));
  const fields = w.document.querySelectorAll('#toolRoot .field').length;
  ok('every field label is associated with its control', labelled.length === fields, labelled.length + '/' + fields);

  ev('location.hash="#/tool/productivity/sketchpad"'); ev('route()');
  const spCanvas = w.document.querySelector('#spCanvas');
  ok('the sketch canvas is reachable by keyboard', !!spCanvas && spCanvas.getAttribute('tabindex') === '0' && !!spCanvas.getAttribute('aria-label'));

  ev('location.hash="#/about"'); ev('route()');
  const big = w.document.querySelector('[data-ts="1.25"]');
  ok('the about page offers a text-size control', !!big);
  if (big) {
    big.click();
    ok('text size is remembered', ev("store.get('text-size', 1)") === 1.25, String(ev("store.get('text-size', 1)")));
    w.document.querySelector('[data-ts="1"]').click();
  }


  /* 10. no duplicate top-level declarations — a later function silently wins
     over an earlier one of the same name, which is how a helper was quietly
     replaced by a tool's own relLuminance(r,g,b) during B2 */
  const script = html.slice(html.indexOf('<script>'), html.lastIndexOf('</script>'));
  const fnames = [...script.matchAll(/^function ([A-Za-z_$][\w$]*)\(/gm)].map(m => m[1]);
  const dupFns = [...new Set(fnames.filter((n, i) => fnames.indexOf(n) !== i))];
  ok('no duplicate top-level function names', dupFns.length === 0, dupFns.join(', '));


  /* 11. findability (B3) */
  const searchIds = q => ev('searchTools(' + JSON.stringify(q) + ').map(t=>t.id)');
  ok('an alias finds the tool people mean by it', searchIds('emi')[0] === 'loanemi', searchIds('emi').slice(0, 3).join(','));
  ok('a keyword finds a tool whose name does not contain it',
     searchIds('checksum').slice(0, 3).includes('filehash'), searchIds('checksum').slice(0, 3).join(','));
  ok('the group label is searchable', searchIds('remove').length > 0, searchIds('remove').slice(0, 3).join(','));

  const scoreOf = id => ev("(function(){const t=TOOL_INDEX.find(x=>x.id===" + JSON.stringify(id) + ");return scoreTool(t,'hash');})()");
  const bare = scoreOf('md5');
  ev("togglePin('dev','md5')");
  ok('a pin raises the score without overturning a better name match', scoreOf('md5') === bare + 8, bare + ' -> ' + scoreOf('md5'));
  ev("togglePin('dev','md5')");

  ev('location.hash="#/category/files"'); ev('route()');
  ok('tools added in 1.1.0 are marked new', w.document.querySelectorAll('.newchip').length > 0,
     w.document.querySelectorAll('.newchip').length + ' chips');

  const filter = w.document.querySelector('#catFilter');
  ok('a large category gets a filter box', !!filter);
  if (filter) {
    filter.value = 'hash'; filter.dispatchEvent(new w.Event('input'));
    const shown = [...w.document.querySelectorAll('#catBody [data-tool]')].filter(b => b.style.display !== 'none');
    ok('the category filter narrows the grid', shown.length === 1 && /Hash/.test(shown[0].textContent),
       shown.map(b => b.textContent.trim().slice(0, 18)).join(' | '));
  }

  ev('location.hash="#/tool/files/zipcreate"'); ev('route()');
  const prevBtn = w.document.querySelector('#prevBtn'), nextBtn = w.document.querySelector('#nextBtn');
  ok('the first tool has a disabled previous arrow', !!prevBtn && prevBtn.disabled && !nextBtn.disabled);
  nextBtn.click();
  ok('the next arrow moves within the category', ev('location.hash') === '#/tool/files/gzip', ev('location.hash'));

  ev("store.set('palette-history', ['panchang'])");
  const ov = w.document.querySelector('.palette-overlay');
  ov.hidden = false;
  const palInput = w.document.querySelector('#palInput');
  palInput.value = ''; palInput.dispatchEvent(new w.Event('input'));
  ok('recent searches are offered in the empty palette', /Recent searches/.test(ov.textContent));
  const histBtn = w.document.querySelector('[data-hist]');
  if (histBtn) {
    histBtn.click();
    ok('a recent search fills the box', palInput.value === 'panchang', palInput.value);
  }
  ov.hidden = true;

  w.document.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'g', bubbles: true }));
  w.document.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'a', bubbles: true }));
  ok('g then a opens the A–Z list', ev('location.hash') === '#/all', ev('location.hash'));


  /* 12. the stability spine (B4) */
  const unpinned = [];
  for (const c of CATS) for (const t of (TOOLS[c.id] || [])) {
    if (PINNED[c.id + '/' + t.id] !== t.code) unpinned.push(c.id + '/' + t.id);
  }
  ok('every tool wears the code pinned for it', unpinned.length === 0, unpinned.slice(0, 3).join(', '));

  ev('location.hash="#/tool/generator/scanner"'); ev('route()');
  const chip = w.document.querySelector('.chip');
  ok('a tool that needs hardware says so before you tap it', !!chip && /camera/.test(chip.textContent), chip && chip.textContent);

  ev("ID_ALIASES['files/zip'] = 'files/zipcreate'");
  ev('location.hash="#/tool/files/zip"'); ev('route()');
  ok('a retired id resolves to the tool that replaced it', /ZIP Creator/.test(w.document.querySelector('#app').textContent));
  delete ev('ID_ALIASES')['files/zip'];

  const throwing = TOOLS.files.find(t => t.id === 'zipcreate');
  const realRender = throwing.render;
  throwing.render = () => { throw new Error('deliberate failure'); };
  ev('location.hash="#/tool/files/zipcreate"'); ev('route()');
  const errPanel = w.document.querySelector('#toolRoot').textContent;
  ok('a tool that throws shows a panel instead of blanking the page',
     /hit an error/.test(errPanel) && /deliberate failure/.test(errPanel));
  ok('the failure is logged on the device', /deliberate failure/.test(JSON.stringify(ev("store.get('error-log', [])"))));
  throwing.render = realRender;

  ev('location.hash="#/tool/system/errorlog"'); ev('route()');
  ok('System → Error Log shows the history', /deliberate failure/.test(w.document.querySelector('#toolRoot').textContent));

  // timer leak: every tool must clean up after itself
  const live = new Set();
  const realSet = w.setInterval, realClear = w.clearInterval;
  w.setInterval = (fn, ms) => { const id = realSet(fn, ms); live.add(id); return id; };
  w.clearInterval = id => { live.delete(id); return realClear(id); };
  const leaked = [];
  for (const c of CATS) for (const t of (TOOLS[c.id] || [])) {
    const box = w.document.createElement('div');
    try { t.render(box); } catch (e) { /* a render failure is B4's other test */ }
    ev('runCleanup()');
    if (live.size) { leaked.push(c.id + '/' + t.id); live.forEach(id => realClear(id)); live.clear(); }
  }
  w.setInterval = realSet; w.clearInterval = realClear;
  ok('no tool leaves a timer running after cleanup', leaked.length === 0, leaked.slice(0, 5).join(', '));


  /* 13. the consistency sweep (B5) */
  ev('location.hash="#/tool/calc/percentchange"'); ev('route()');
  const pcA = w.document.querySelector('#pcA'), pcB = w.document.querySelector('#pcB');
  pcA.value = '200'; pcA.dispatchEvent(new w.Event('input'));
  pcB.value = '250'; pcB.dispatchEvent(new w.Event('input'));
  ev('location.hash="#/"'); ev('route()');
  ev('location.hash="#/tool/calc/percentchange"'); ev('route()');
  ok('a tool remembers what you typed when you come back',
     w.document.querySelector('#pcA').value === '200' && w.document.querySelector('#pcB').value === '250',
     w.document.querySelector('#pcA').value + '/' + w.document.querySelector('#pcB').value);
  ok('and recomputes rather than showing a stale answer', /\+25\.00%/.test(w.document.querySelector('#pcOut').textContent));

  w.document.querySelector('#rsBtn').click();
  ok('reset forgets it again', w.document.querySelector('#pcA').value === '100', w.document.querySelector('#pcA').value);

  const exBtn = w.document.querySelector('#exBtn');
  ok('a tool with a worked example offers it', !!exBtn);
  if (exBtn) {
    exBtn.click();
    ok('the example fills the fields', w.document.querySelector('#pcB').value === '125', w.document.querySelector('#pcB').value);
  }

  // every example must point at an input that exists, or it is a silent no-op
  const examples = ev('EXAMPLES');
  const deadExamples = [];
  for (const key of Object.keys(examples)) {
    ev('location.hash="#/tool/' + key + '"'); ev('route()');
    const ids = new Set([...w.document.querySelectorAll('#toolRoot input, #toolRoot textarea, #toolRoot select')].map(e => e.id));
    for (const id of Object.keys(examples[key])) if (!ids.has(id)) deadExamples.push(key + ' -> ' + id);
  }
  ok('every worked example points at a real field', deadExamples.length === 0, deadExamples.slice(0, 3).join(', '));

  ev('location.hash="#/tool/files/zipcreate"'); ev('route()');
  const buildBtn = w.document.querySelector('#zpGo');
  ok('a disabled button says why it is disabled', !!buildBtn.title && buildBtn.getAttribute('aria-disabled') === 'true', buildBtn.title);
  ok('file fields accept a dropped file', !!w.document.querySelector('[data-drop-wired]'));

  ev('location.hash="#/tool/calc/percentage"'); ev('route()');
  ok('an empty result says what to do', /Fill in the fields/.test(w.document.querySelector('#toolRoot').textContent));

  Object.defineProperty(w.navigator, 'clipboard', {
    value: { writeText: () => Promise.resolve(), readText: () => Promise.resolve('pasted text') }, configurable: true });
  ev('location.hash="#/tool/text/accents"'); ev('route()');
  const accentBox = w.document.querySelector('#acIn');
  accentBox.focus();
  const pasteChipEl = w.document.querySelector('.pastechip');
  ok('a paste chip appears over an empty text field', !!pasteChipEl);
  if (pasteChipEl) {
    pasteChipEl.click();
    await new Promise(r => setTimeout(r, 20));
    ok('the chip pastes into the field', accentBox.value === 'pasted text', accentBox.value);
  }

  let tableCopy = null;
  Object.defineProperty(w.navigator, 'clipboard', {
    value: { writeText: t => { tableCopy = t; return Promise.resolve(); }, readText: () => Promise.resolve('') }, configurable: true });
  ev('location.hash="#/tool/almanac/panchang"'); ev('route()');
  const panTable = w.document.querySelector('#toolRoot table');
  panTable.dispatchEvent(new w.MouseEvent('dblclick', { bubbles: true }));
  await new Promise(r => setTimeout(r, 20));
  ok('double-clicking a table copies it as CSV', !!tableCopy && /^"Tithi"/.test(tableCopy), (tableCopy || '').split('\n')[0].slice(0, 30));


  /* 14. preferences and permalinks (B6) */
  ev('location.hash="#/tool/finance/savingsgoal"'); ev('route()');
  const sgText = () => w.document.querySelector('#sgOut').textContent.replace(/\s+/g, ' ');
  ok('numbers default to Indian grouping', /4,70,000/.test(sgText()), sgText().slice(0, 70));
  ev("store.set('num-format','us')");
  ev('location.hash="#/"'); ev('route()');
  ev('location.hash="#/tool/finance/savingsgoal"'); ev('route()');
  ok('the number preference switches to international grouping',
     /470,000/.test(sgText()) && !/4,70,000/.test(sgText()), sgText().slice(0, 70));
  ev("store.set('num-format','in')");

  ev("store.set('units','imperial')");
  ev('location.hash="#/"'); ev('route()');
  ev('location.hash="#/tool/unit/length"'); ev('route()');
  ok('the unit preference opens the converter on feet', w.document.querySelector('#ucTo').value === 'ft',
     w.document.querySelector('#ucTo').value);
  ev("store.set('units','metric')");

  let permalink = null;
  Object.defineProperty(w.navigator, 'clipboard', {
    value: { writeText: t => { permalink = t; return Promise.resolve(); }, readText: () => Promise.resolve('') }, configurable: true });
  ev('location.hash="#/tool/calc/percentchange"'); ev('route()');
  const plA = w.document.querySelector('#pcA'), plB = w.document.querySelector('#pcB');
  plA.value = '300'; plA.dispatchEvent(new w.Event('input'));
  plB.value = '375'; plB.dispatchEvent(new w.Event('input'));
  w.document.querySelector('#linkBtn').click();
  await new Promise(r => setTimeout(r, 10));
  ok('copy link builds a URL carrying the inputs',
     !!permalink && /#\/tool\/calc\/percentchange\?pcA=300&pcB=375/.test(permalink), permalink);

  const frag = (permalink || '').split('#')[1] || '';
  ev('location.hash="#/"'); ev('route()');
  ev('location.hash="#' + frag + '"'); ev('route()');
  ok('following that link restores the inputs and the answer',
     w.document.querySelector('#pcA').value === '300' && /\+25\.00%/.test(w.document.querySelector('#pcOut').textContent),
     w.document.querySelector('#pcA').value + ' → ' + w.document.querySelector('#pcOut').textContent.slice(0, 30));


  /* 15. storage you can trust (B7) */
  ok('the store is migrated to the current schema', ev("store.get('schema', 0)") === ev('STORE_SCHEMA'),
     'v' + ev("store.get('schema', 0)") + ' of ' + ev('STORE_SCHEMA'));
  ok('the app version matches package.json',
     ev('APP_VERSION') === require(path.join(__dirname, '..', 'package.json')).version,
     ev('APP_VERSION') + ' vs ' + require(path.join(__dirname, '..', 'package.json')).version);

  ev("store.set('habits-list', [{name:'Water'}])");
  ev("store.set('flashcard-decks', [{name:'Anatomy', cards:[{front:'a',back:'b'}]}])");
  ev("store.set('schema', 1)"); ev('migrateStore()');
  ok('migration 2 gives an old habit its missing log', /"log":\[\]/.test(ev("JSON.stringify(store.get('habits-list'))")));
  ok('migration 2 gives an old deck an id', /"id":"deck-0"/.test(ev("JSON.stringify(store.get('flashcard-decks'))")));

  // every key the app writes must be declared, or a backup cannot restore it
  const writtenKeys = [...html.matchAll(/store\.set\('([^']+)'/g)].map(m => m[1]);
  const declaredKeys = ev('Object.keys(STORE_KEYS)');
  const undeclared = [...new Set(writtenKeys)].filter(k => {
    if (declaredKeys.includes(k)) return false;
    return !declaredKeys.some(d => d.endsWith('*') && k.startsWith(d.slice(0, -1)));
  });
  ok('every key the app writes is declared in STORE_KEYS', undeclared.length === 0, undeclared.join(', '));

  ev('location.hash="#/tool/productivity/backup"'); ev('route()');
  const bkRows = [...w.document.querySelectorAll('#bkList tr')].map(r => r.textContent.replace(/\s+/g, ' ').trim());
  ok('the backup table names each key and its size', bkRows.some(r => /Habit Tracker/.test(r)), bkRows.slice(0, 3).join(' | ').slice(0, 80));
  ok('the table shows the schema version', /schema/i.test(bkRows[0] || ''), bkRows[0]);
  ok('each key can be erased on its own', w.document.querySelectorAll('[data-erase]').length >= 2);

  ev("downloadJSON = (d)=>{ window.__exported = d; }");
  w.document.querySelector('#bkExportAll').click();
  ok('the backup carries the app version and the schema',
     !!w.__exported && w.__exported.version === ev('APP_VERSION') && w.__exported.schema === ev('STORE_SCHEMA'),
     JSON.stringify({ version: w.__exported && w.__exported.version, schema: w.__exported && w.__exported.schema }));

  const realConfirm = w.confirm;
  w.confirm = () => true;
  w.document.querySelector('[data-erase="habits-list"]').click();
  ok('erasing one key leaves the others alone',
     ev("store.get('habits-list', null)") === null && !!ev("store.get('flashcard-decks', null)"));
  w.confirm = realConfirm;

  /* 16. the app makes no network calls and loads nothing external */
  // Loaded resources only: a link the user can click is fine, a resource the
  // page fetches by itself is not.
  const loaded = [...html.matchAll(/<script[^>]*src="([^"]+)"/g), ...html.matchAll(/<link[^>]*href="([^"]+)"/g),
                  ...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]).filter(u => /^https?:/.test(u));
  ok('no external scripts, styles, fonts or images', loaded.length === 0, loaded.join(', '));
  ok('no fetch, XHR, WebSocket or EventSource', !/fetch\(|XMLHttpRequest|new WebSocket|EventSource/.test(html));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 600);
