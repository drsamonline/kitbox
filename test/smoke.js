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

  /* 12. the app makes no network calls and loads nothing external */
  // Loaded resources only: a link the user can click is fine, a resource the
  // page fetches by itself is not.
  const loaded = [...html.matchAll(/<script[^>]*src="([^"]+)"/g), ...html.matchAll(/<link[^>]*href="([^"]+)"/g),
                  ...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]).filter(u => /^https?:/.test(u));
  ok('no external scripts, styles, fonts or images', loaded.length === 0, loaded.join(', '));
  ok('no fetch, XHR, WebSocket or EventSource', !/fetch\(|XMLHttpRequest|new WebSocket|EventSource/.test(html));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 600);
