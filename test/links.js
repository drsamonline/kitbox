/* Every link on the landing page goes somewhere.
 *
 * The landing page is generated from the app's registry, so a broken link
 * usually means a category was renamed and the generator kept an old href —
 * exactly the kind of thing nobody clicks until a stranger does.
 *
 * Usage: node test/links.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const landing = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const appHtml = fs.readFileSync(path.join(ROOT, 'kitbox.html'), 'utf8');

const dom = new JSDOM(appHtml, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });
const w = dom.window;
w.scrollTo = () => {};

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? (pass++, console.log('PASS  ' + name + (extra ? '  (' + extra + ')' : '')))
       : (fail++, console.log('FAIL  ' + name + (extra ? '  (' + extra + ')' : '')));
};

setTimeout(() => {
  const doc = new JSDOM(landing).window.document;
  const refs = [...doc.querySelectorAll('[href], [src]')]
    .map(el => ({ el, url: el.getAttribute('href') || el.getAttribute('src') }))
    .filter(r => r.url);

  const internal = refs.filter(r => !/^(https?:|mailto:|#|data:)/.test(r.url));
  const missing = internal.filter(r => {
    const file = r.url.split('#')[0].split('?')[0];
    return file && !fs.existsSync(path.join(ROOT, file));
  });
  ok('every file the landing page points at exists', missing.length === 0,
     missing.map(m => m.url).slice(0, 4).join(', ') || internal.length + ' links checked');

  const TOOLS = w.eval('TOOLS');
  const CATS = w.eval('CATS');
  const routeProblems = [];
  for (const r of internal) {
    const frag = r.url.includes('#') ? r.url.split('#')[1] : '';
    if (!frag || !frag.startsWith('/tool/')) continue;
    const [, , cat, id] = frag.split('/');
    const list = TOOLS[cat] || [];
    if (!list.some(t => t.id === id)) routeProblems.push(frag);
  }
  ok('every tool link resolves to a real tool', routeProblems.length === 0, routeProblems.join(', '));

  const catProblems = [];
  for (const r of internal) {
    const frag = r.url.includes('#') ? r.url.split('#')[1] : '';
    if (!frag || !frag.startsWith('/category/')) continue;
    const cat = frag.split('/')[2];
    if (!CATS.some(c => c.id === cat)) catProblems.push(frag);
  }
  ok('every category link resolves to a real category', catProblems.length === 0, catProblems.join(', '));

  // the counts on the landing page must match the app, not a number typed once
  const total = CATS.reduce((a, c) => a + (TOOLS[c.id] || []).length, 0);
  const body = doc.body.textContent;
  ok('the landing page states the real tool count', body.includes(String(total)) && body.includes(String(CATS.length)),
     total + ' tools, ' + CATS.length + ' categories');

  ok('the landing page links to the app', !!doc.querySelector('a[href="kitbox.html"]'));
  ok('the landing page carries the support details',
     /drsohilboi@ybl/.test(body) && !!doc.querySelector('svg.segno'));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 700);
