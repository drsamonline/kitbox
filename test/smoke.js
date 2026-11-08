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

const APP = path.join(__dirname, '..', 'index.html');
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

setTimeout(() => {
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
  const routes = ['#/', '#/all', '#/about'];
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

  /* 6. the app makes no network calls and loads nothing external */
  const external = [...html.matchAll(/(?:src|href)="(?!data:|#)([^"]+)"/g)].map(m => m[1]);
  ok('no external scripts, styles or fonts', external.filter(u => /^https?:/.test(u)).length === 0, external.join(', '));
  ok('no fetch, XHR, WebSocket or EventSource', !/fetch\(|XMLHttpRequest|new WebSocket|EventSource/.test(html));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 600);
