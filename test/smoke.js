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
// jsdom ships no crypto.subtle, so every crypto tool used to be untestable here.
// Handing the page Node's real implementation means the RSA, TOTP and JWK paths
// run against a real engine rather than being skipped.
try { Object.defineProperty(w.crypto, 'subtle', { value: require('crypto').webcrypto.subtle, configurable: true }); }
catch (e) { w.crypto.subtle = require('crypto').webcrypto.subtle; }

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

  // Ask the registry which tool is first rather than naming one: adding a tool
  // to a category legitimately changes the order, and a test that hard-codes
  // the old order fails for a reason that is not a bug.
  const filesFirst = ev('TOOLS.files[0].id'), filesSecond = ev('TOOLS.files[1].id');
  ev('location.hash="#/tool/files/' + filesFirst + '"'); ev('route()');
  const prevBtn = w.document.querySelector('#prevBtn'), nextBtn = w.document.querySelector('#nextBtn');
  ok('the first tool has a disabled previous arrow', !!prevBtn && prevBtn.disabled && !nextBtn.disabled, filesFirst);
  nextBtn.click();
  ok('the next arrow moves within the category', ev('location.hash') === '#/tool/files/' + filesSecond,
     filesFirst + ' → ' + filesSecond);

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


  /* 16. security hardening (B8) */
  const csp = w.document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  ok('the page ships a Content-Security-Policy', !!csp && /default-src 'none'/.test(csp.content) && /connect-src 'none'/.test(csp.content),
     csp ? csp.content.slice(0, 60) + '…' : 'missing');

  // a phone photo's Orientation tag must survive a metadata strip
  const exifJpeg = Uint8Array.from([
    0xFF, 0xD8,
    0xFF, 0xE1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0xFF, 0xD9]);
  const strippedJpeg = ev('stripJpegMetadata')(exifJpeg);
  ok('stripping metadata keeps the EXIF Orientation tag',
     ev('readOrientation')(exifJpeg) === 6 && ev('readOrientation')(strippedJpeg) === 6,
     'before ' + ev('readOrientation')(exifJpeg) + ', after ' + ev('readOrientation')(strippedJpeg));


  /* 17. performance (B9) */
  ev('location.hash="#/tool/general/tzconv"'); ev('route()');
  const tzFrom = w.document.querySelector('#tzFrom');
  const allZones = tzFrom.options.length;
  ok('the timezone converter does not build every zone up front', allZones <= 82, allZones + ' options');
  const tzFilter = w.document.querySelector('#tzFilter');
  tzFilter.value = 'europe/lon'; tzFilter.dispatchEvent(new w.Event('input'));
  const filtered = [...w.document.querySelector('#tzFrom').options].map(o => o.value);
  // The currently chosen zone stays in the list, so the assertion is
  // "matches plus the selection", not "matches only".
  const chosenZone = w.document.querySelector('#tzFrom').value;
  ok('filtering narrows the zone list',
     filtered.length > 0 && filtered.filter(z => z !== chosenZone).every(z => /europe\/lon/i.test(z)),
     filtered.slice(0, 3).join(', '));
  tzFilter.value = 'zzzz'; tzFilter.dispatchEvent(new w.Event('input'));
  ok('a filter that matches nothing keeps the chosen zone',
     w.document.querySelector('#tzFrom').options.length === 1 && w.document.querySelector('#tzFrom').value === chosenZone,
     w.document.querySelector('#tzFrom').value);

  const benchHtml = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/?bench=1' });
  stubCanvas(benchHtml.window);
  await new Promise(r => setTimeout(r, 900));
  const bench = benchHtml.window.__bench;
  ok('?bench=1 measures every tool, cold and warm',
     !!bench && bench.results.length === ev('TOOLS && Object.keys(TOOLS).reduce((a,k)=>a+TOOLS[k].length,0)') &&
     bench.total > 0 && bench.coldTotal > 0,
     bench ? bench.results.length + ' tools, warm ' + Math.round(bench.total) + ' ms' : 'no bench');
  benchHtml.window.close();


  /* 18. packaging and big storage (B14) */
  ok('the notepad falls back to localStorage when IndexedDB is absent',
     ev('bigStore.available()') === false,
     'jsdom has no IndexedDB, which is exactly the fallback case');
  ev("store.set('notepad-notes', [{title:'A', body:'hello'}])");
  const fallbackRead = await ev("bigStore.get('notepad-notes', null)");
  ok('a read falls back to the synchronous store', Array.isArray(fallbackRead) && fallbackRead[0].title === 'A',
     JSON.stringify(fallbackRead && fallbackRead[0]));

  ok('app/index.html is the same bytes as kitbox.html',
     fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8') === html);
  ok('the packaged app carries a manifest and an icon',
     fs.existsSync(path.join(__dirname, '..', 'app', 'manifest.webmanifest')) &&
     fs.existsSync(path.join(__dirname, '..', 'app', 'icon.svg')));


  /* 19. borrowed ideas (2.3.0) — each verified against a published value */
  ev('location.hash="#/tool/dev/chmod"'); ev('route()');
  ok('chmod 755 is rwxr-xr-x', w.document.querySelector('#cmSym').value === 'rwxr-xr-x', w.document.querySelector('#cmSym').value);

  ev('location.hash="#/tool/text/vigenere"'); ev('route()');
  const vgIn = w.document.querySelector('#vgIn'), vgKey = w.document.querySelector('#vgKey');
  vgIn.value = 'ATTACKATDAWN'; vgKey.value = 'LEMON';
  w.document.querySelector('#vgEnc').click();
  ok('Vigenère ATTACKATDAWN with LEMON is LXFOPVEFRNHR',
     w.document.querySelector('#vgOut').textContent === 'LXFOPVEFRNHR', w.document.querySelector('#vgOut').textContent);

  ev('location.hash="#/tool/text/ascii85"'); ev('route()');
  const a85In = w.document.querySelector('#a85In');
  a85In.value = 'Kitbox — offline';
  w.document.querySelector('#a85Enc').click();
  const a85Encoded = w.document.querySelector('#a85Out').textContent;
  a85In.value = a85Encoded;
  w.document.querySelector('#a85Dec').click();
  ok('Ascii85 round-trips a non-ASCII string', w.document.querySelector('#a85Out').textContent === 'Kitbox — offline', a85Encoded.slice(0, 20));

  ev('location.hash="#/tool/text/entropy"'); ev('route()');
  const enIn = w.document.querySelector('#enIn');
  enIn.value = 'aaaaaaaaaa'; enIn.dispatchEvent(new w.Event('input'));
  ok('a constant string has zero entropy', /0\.000/.test(w.document.querySelector('#enOut').textContent));

  ev('location.hash="#/tool/dev/iprange"'); ev('route()');
  const irIn = w.document.querySelector('#irIn');
  irIn.value = '10.0.0.0/30'; irIn.dispatchEvent(new w.Event('input'));
  ok('a /30 expands to four addresses', /4/.test(w.document.querySelector('#irOut').textContent),
     w.document.querySelector('#irOut').textContent.replace(/\s+/g, ' ').slice(0, 60));


  /* 20. B15-B17: the tools asked for, each checked against a known value */
  ev('location.hash="#/tool/dev/ipformat"'); ev('route()');
  ok('192.168.1.10 is 3232235786', /3232235786/.test(w.document.querySelector('#ifOut').textContent));

  ev('location.hash="#/tool/calc/levenshtein"'); ev('route()');
  ok('kitten → sitting is an edit distance of 3',
     /Distance3/.test(w.document.querySelector('#lvOut').textContent.replace(/\s+/g, '')));

  ev('location.hash="#/tool/calc/hamming"'); ev('route()');
  ok('karolin/kathrin differ in 9 bits',
     /Bitsdifferent9/.test(w.document.querySelector('#hmOut').textContent.replace(/\s+/g, '')));

  ev('location.hash="#/tool/calc/setops"'); ev('route()');
  ok('the union of two sets of four and three is five',
     /Size5/.test(w.document.querySelector('#soOut').textContent.replace(/\s+/g, '')));

  ev('location.hash="#/tool/text/extract"'); ev('route()');
  const exIn = w.document.querySelector('#exIn');
  exIn.value = 'see https://example.com/a and mail dr@example.org from 10.0.0.7';
  exIn.dispatchEvent(new w.Event('input'));
  const exText = w.document.querySelector('#exOut').textContent;
  ok('the extractor finds a URL, an email and an IP',
     /example\.com/.test(exText) && /dr@example\.org/.test(exText) && /10\.0\.0\.7/.test(exText));

  ev('location.hash="#/tool/clinical/gcs"'); ev('route()');
  ok('GCS defaults to E4 V5 M6 = 15',
     /Total15/.test(w.document.querySelector('#gsOut').textContent.replace(/\s+/g, '')));

  ev('location.hash="#/tool/clinical/chads"'); ev('route()');
  const cdBoxes = [...w.document.querySelectorAll('[data-cd]')];
  cdBoxes[2].checked = true; cdBoxes[4].checked = true;
  cdBoxes[2].dispatchEvent(new w.Event('change'));
  ok('CHA₂DS₂-VASc: age ≥ 75 plus stroke is 4',
     /Total4/.test(w.document.querySelector('#cdOut').textContent.replace(/\s+/g, '')));

  ev('location.hash="#/tool/clinical/wellsdvt"'); ev('route()');
  const wdBoxes = [...w.document.querySelectorAll('[data-wd]')];
  wdBoxes[0].checked = true; wdBoxes[9].checked = true;
  wdBoxes[0].dispatchEvent(new w.Event('change'));
  ok('Wells DVT can go negative — cancer +1, alternative diagnosis −2',
     /Total-1/.test(w.document.querySelector('#wdOut').textContent.replace(/\s+/g, '')));

  ev('location.hash="#/tool/clinical/childpugh"'); ev('route()');
  ok('Child-Pugh starts at 5, Class A',
     /Total5/.test(w.document.querySelector('#cpOut').textContent.replace(/\s+/g, '')) && /Class A/.test(w.document.querySelector('#cpOut').textContent));


  /* 21. B20-B22: certificate, schema, regex, clamp, resistor, buffer, games */
  ev('location.hash="#/tool/dev/x509"'); ev('route()');
  const certIn = w.document.querySelector('#xcIn');
  certIn.value = fs.readFileSync(path.join(__dirname, '..', 'test', 'fixture-cert.pem'), 'utf8');
  certIn.dispatchEvent(new w.Event('input'));
  const certText = w.document.querySelector('#xcOut').textContent.replace(/\s+/g, ' ');
  ok('the certificate reader finds the subject', /CN=kitbox\.example/.test(certText), certText.slice(0, 60));
  ok('the certificate reader finds the SAN names', /www\.kitbox\.example/.test(certText) && /127\.0\.0\.1/.test(certText));
  ok('the certificate reader reports RSA · 2048 bits', /RSA · 2048 bits/.test(certText), 'key size after DER padding');
  ok('the certificate reader does not claim to verify', /Nothing here is verified/.test(w.document.querySelector('#xcOut').textContent));

  ev('location.hash="#/tool/dev/jsonschema"'); ev('route()');
  const inferred = JSON.parse(w.document.querySelector('#jsOut').textContent);
  ok('JSON Schema infers an integer for a whole number', inferred.properties.id.type === 'integer');
  ok('JSON Schema infers an array of strings', inferred.properties.tags.items.type === 'string');

  ev('location.hash="#/tool/dev/cssclamp"'); ev('route()');
  ok('the clamp builder emits a clamp() with a slope',
     /clamp\(1rem, .*vw, 2\.2rem\)/.test(w.document.querySelector('#clOut').textContent));

  ev('location.hash="#/tool/science/resistor"'); ev('route()');
  ok('brown-black-red-gold reads as 1 kΩ ±5%',
     /1 kΩ/.test(w.document.querySelector('#rsOut').textContent) && /±5%/.test(w.document.querySelector('#rsOut').textContent));

  ev('location.hash="#/tool/science/bufferph"'); ev('route()');
  ok('equal acid and base gives pH = pKa', /4\.76/.test(w.document.querySelector('#bpOut').textContent));

  ev('location.hash="#/tool/games/game2048"'); ev('route()');
  ok('2048 starts with two tiles on a 4×4 board',
     w.document.querySelectorAll('#g4Board > div').length === 16);

  ev('location.hash="#/tool/games/minesweeper"'); ev('route()');
  ok('minesweeper renders a 9×9 board', w.document.querySelectorAll('[data-ms]').length === 81);


  /* 22. B23-B24: keys, modular arithmetic, CSV to SQL, references */
  ev('location.hash="#/tool/dev/jwkpem"'); ev('route()');
  const jwkIn = w.document.querySelector('#jkIn');
  // A fixed RSA-512 public key, so the test needs no crypto and no randomness.
  jwkIn.value = JSON.stringify({ kty:'RSA', n:'0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw', e:'AQAB' });
  jwkIn.dispatchEvent(new w.Event('input'));
  const jwkPem = w.document.querySelector('#jkOut').textContent;
  ok('a JWK becomes a PEM public key', /^-----BEGIN PUBLIC KEY-----/.test(jwkPem), jwkPem.split('\n')[0]);
  w.document.querySelector('[data-jk="toJwk"]').click();
  jwkIn.value = jwkPem; jwkIn.dispatchEvent(new w.Event('input'));
  ok('the PEM round-trips to the same modulus',
     JSON.parse(w.document.querySelector('#jkOut').textContent).n ===
     '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw');

  ev('location.hash="#/tool/calc/modular"'); ev('route()');
  ok('7^560 mod 561 is 1 — Fermat holds for a Carmichael number',
     /<td>1<\/td>/.test(w.document.querySelector('#mdOut').innerHTML));
  w.document.querySelector('[data-md="inv"]').click();
  ok('the modular inverse of 3 mod 11 is 4', /<td>4<\/td>/.test(w.document.querySelector('#mdOut').innerHTML));
  w.document.querySelector('[data-md="crt"]').click();
  ok('the Chinese remainder of 2 mod 3 and 3 mod 5 is 8 mod 15',
     /8 \(mod 15\)/.test(w.document.querySelector('#mdOut').textContent));

  ev('location.hash="#/tool/files/csvtosql"'); ev('route()');
  ok("CSV to SQL escapes O'Brien correctly", /'O''Brien'/.test(w.document.querySelector('#csOut').textContent));

  ev('location.hash="#/tool/accessibility/linktext"'); ev('route()');
  ok('the link checker flags "click here"',
     /meaningless out of context/.test(w.document.querySelector('#ltOut').textContent));


  /* 23. B25-B26: QR payloads, UTM, sun table, Sudoku, MIME */
  ev('location.hash="#/tool/generator/qrpayload"'); ev('route()');
  const qpType = w.document.querySelector('#qpType');
  qpType.value = 'wifi'; qpType.dispatchEvent(new w.Event('change'));
  w.document.querySelector('#qpSsid').value = 'My Net';
  w.document.querySelector('#qpPass').value = 'p;w';
  w.document.querySelector('#qpSsid').dispatchEvent(new w.Event('input'));
  ok('the WiFi payload escapes a semicolon in the password',
     w.document.querySelector('#qpOut').textContent === 'WIFI:T:WPA;S:My Net;P:p\\;w;;',
     w.document.querySelector('#qpOut').textContent);
  qpType.value = 'otp'; qpType.dispatchEvent(new w.Event('change'));
  w.document.querySelector('#qpIssuer').value = 'Kitbox';
  w.document.querySelector('#qpAcct').value = 'a@b.com';
  w.document.querySelector('#qpSecret').value = 'JBSWY3DPEHPK3PXP';
  w.document.querySelector('#qpSecret').dispatchEvent(new w.Event('input'));
  ok('the otpauth URI carries the secret and the digits',
     /^otpauth:\/\/totp\/Kitbox:a%40b\.com\?secret=JBSWY3DPEHPK3PXP&issuer=Kitbox&digits=6&period=30$/
       .test(w.document.querySelector('#qpOut').textContent));

  ev('location.hash="#/tool/geo/utm"'); ev('route()');
  ok('22.3072, 73.1812 falls in UTM zone 43Q',
     /Zone43Q/.test(w.document.querySelector('#utOut').textContent.replace(/\s+/g, '')));

  ev('location.hash="#/tool/almanac/suntable"'); ev('route()');
  ok('the sun table has one row per day of the month',
     w.document.querySelector('#stOut').querySelectorAll('tr').length === 31);

  ev('location.hash="#/tool/games/sudoku"'); ev('route()');
  w.document.querySelector('#sdSample').click();
  const solvedCells = [...w.document.querySelectorAll('#sdBoard > div')].map(d => d.textContent).join('');
  ok('the Sudoku solver returns the published solution',
     solvedCells.slice(0, 9) === '534678912', solvedCells.slice(0, 9));
  ok('the solved Sudoku grid has no blanks', /^\d{81}$/.test(solvedCells));

  ev('location.hash="#/tool/dev/mimeparse"'); ev('route()');
  const mimeText = w.document.querySelector('#mpOut').textContent;
  ok('the MIME decoder resolves an encoded-word subject', /Test — email/.test(mimeText));
  ok('the MIME decoder finds both parts of a multipart body',
     /Part 2/.test(mimeText) && /plain part/.test(mimeText));


  /* 24. B27-B28: punycode, code points, Huffman, packet headers, RSA */
  ev('location.hash="#/tool/text/punycode"'); ev('route()');
  const pnIn = w.document.querySelector('#pnIn');
  pnIn.value = 'münchen.de'; pnIn.dispatchEvent(new w.Event('input'));
  ok('münchen.de encodes to xn--mnchen-3ya.de',
     /xn--mnchen-3ya\.de/.test(w.document.querySelector('#pnOut').textContent));
  pnIn.value = '例え.テスト'; pnIn.dispatchEvent(new w.Event('input'));
  ok('the Japanese test vector encodes to xn--r8jz45g.xn--zckzah',
     /xn--r8jz45g\.xn--zckzah/.test(w.document.querySelector('#pnOut').textContent),
     w.document.querySelector('#pnOut').textContent.replace(/\s+/g, ' ').slice(0, 50));
  w.document.querySelector('[data-pn="dec"]').click();
  pnIn.value = 'xn--mnchen-3ya.de'; pnIn.dispatchEvent(new w.Event('input'));
  ok('the ASCII form decodes back to münchen.de',
     /münchen\.de/.test(w.document.querySelector('#pnOut').textContent));

  ev('location.hash="#/tool/text/codepoints"'); ev('route()');
  ok('the code point inspector marks an astral character as a surrogate pair',
     /surrogate pair/.test(w.document.querySelector('#cpOut').textContent));

  ev('location.hash="#/tool/dev/packet"'); ev('route()');
  const pkText = w.document.querySelector('#pkOut').textContent;
  ok('the packet parser reads the IPv4 addresses and the protocol',
     /192\.168\.1\.1/.test(pkText) && /TCP/.test(pkText));
  const pkNext = w.document.querySelector('#pkNext');
  pkNext.value = 'tcp'; pkNext.dispatchEvent(new w.Event('input'));
  ok('the packet parser continues into the TCP header at the IHL offset',
     /Source port/.test(w.document.querySelector('#pkOut').textContent));

  ev('location.hash="#/tool/dev/rsacrypt"'); ev('route()');
  const rsaPair = await require('crypto').webcrypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' },
    true, ['encrypt', 'decrypt']);
  const pemOf = (buf, label) => '-----BEGIN ' + label + '-----\n' +
    Buffer.from(buf).toString('base64').match(/.{1,64}/g).join('\n') + '\n-----END ' + label + '-----';
  const spki = pemOf(await require('crypto').webcrypto.subtle.exportKey('spki', rsaPair.publicKey), 'PUBLIC KEY');
  const pkcs8 = pemOf(await require('crypto').webcrypto.subtle.exportKey('pkcs8', rsaPair.privateKey), 'PRIVATE KEY');
  w.document.querySelector('#rsKey').value = spki;
  w.document.querySelector('#rsMsg').value = 'The result is normal.';
  w.document.querySelector('#rsGo').click();
  await new Promise(r => setTimeout(r, 400));
  const rsaCipher = (w.document.querySelector('#rsOut').textContent.match(/[A-Za-z0-9+/=]{60,}/) || [])[0];
  ok('RSA encrypts with a pasted public key', !!rsaCipher, rsaCipher ? rsaCipher.slice(0, 20) + '…' : 'no ciphertext');
  if (rsaCipher) {
    w.document.querySelector('[data-rs="dec"]').click();
    w.document.querySelector('#rsKey').value = pkcs8;
    w.document.querySelector('#rsMsg').value = rsaCipher;
    w.document.querySelector('#rsGo').click();
    await new Promise(r => setTimeout(r, 400));
    ok('RSA decrypts back to the original text',
       /The result is normal\./.test(w.document.querySelector('#rsOut').textContent));
  }


  /* 25. B29-B30: signing, IPv6, JSONPath, dB, RC filter, moon table */
  ev('location.hash="#/tool/dev/rsasign"'); ev('route()');
  const signPair = await require('crypto').webcrypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' },
    true, ['sign', 'verify']);
  const pemFor = (buf, label) => '-----BEGIN ' + label + '-----\n' +
    Buffer.from(buf).toString('base64').match(/.{1,64}/g).join('\n') + '\n-----END ' + label + '-----';
  const signPriv = pemFor(await require('crypto').webcrypto.subtle.exportKey('pkcs8', signPair.privateKey), 'PRIVATE KEY');
  const signPub = pemFor(await require('crypto').webcrypto.subtle.exportKey('spki', signPair.publicKey), 'PUBLIC KEY');
  w.document.querySelector('#sgKey').value = signPriv;
  w.document.querySelector('#sgMsg').value = 'The result is normal.';
  w.document.querySelector('#sgGo').click();
  await new Promise(r => setTimeout(r, 400));
  const signature = (w.document.querySelector('#sgOut').textContent.match(/[A-Za-z0-9+/=]{60,}/) || [])[0];
  ok('RSA signs with a pasted private key', !!signature, signature ? signature.slice(0, 18) + '…' : 'none');
  if (signature) {
    w.document.querySelector('[data-sg="verify"]').click();
    w.document.querySelector('#sgKey').value = signPub;
    w.document.querySelector('#sgSig').value = signature;
    w.document.querySelector('#sgGo').click();
    await new Promise(r => setTimeout(r, 400));
    ok('RSA verifies its own signature', /valid signature/.test(w.document.querySelector('#sgOut').textContent));
    w.document.querySelector('#sgMsg').value = 'The result is abnormal.';
    w.document.querySelector('#sgGo').click();
    await new Promise(r => setTimeout(r, 400));
    ok('RSA rejects a tampered message', /does not match/.test(w.document.querySelector('#sgOut').textContent));
  }

  ev('location.hash="#/tool/dev/ipv6"'); ev('route()');
  ok('the IPv6 parser reads version 6 and the full-form addresses',
     /Version6/.test(w.document.querySelector('#i6Out').textContent.replace(/\s+/g, '')) &&
     /2001:0db8/.test(w.document.querySelector('#i6Out').textContent));
  ok('the address expander expands :: to eight groups',
     /2001:0db8:0000:0000:0000:0000:0000:0001/.test(w.document.querySelector('#i6AddrOut').textContent));

  ev('location.hash="#/tool/dev/jsonpath"'); ev('route()');
  const jpPath = w.document.querySelector('#jpPath');
  jpPath.value = '$..price'; jpPath.dispatchEvent(new w.Event('input'));
  ok('JSONPath recursive descent finds every price',
     (w.document.querySelector('#jpOut').textContent.match(/8\.95|12\.99|19\.95/g) || []).length === 3);
  jpPath.value = '$.store.book[?(@.price > 10)].title'; jpPath.dispatchEvent(new w.Event('input'));
  ok('JSONPath filter keeps only the book over 10',
     /B/.test(w.document.querySelector('#jpOut').textContent) && !/A/.test(w.document.querySelector('#jpOut').textContent));

  ev('location.hash="#/tool/science/decibel"'); ev('route()');
  ok('94 dB SPL is about 1 Pa', /1\.0\d* Pa/.test(w.document.querySelector('#dbOut').textContent));

  ev('location.hash="#/tool/science/rcfilter"'); ev('route()');
  ok('1 kΩ and 100 nF give a 1.59 kHz cut-off', /1\.59 kHz/.test(w.document.querySelector('#rfOut').textContent));

  /* 26. the app makes no network calls and loads nothing external */
  // Loaded resources only: a link the user can click is fine, a resource the
  // page fetches by itself is not.
  const loaded = [...html.matchAll(/<script[^>]*src="([^"]+)"/g), ...html.matchAll(/<link[^>]*href="([^"]+)"/g),
                  ...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]).filter(u => /^https?:/.test(u));
  ok('no external scripts, styles, fonts or images', loaded.length === 0, loaded.join(', '));
  ok('no fetch, XHR, WebSocket or EventSource', !/fetch\(|XMLHttpRequest|new WebSocket|EventSource/.test(html));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 600);
