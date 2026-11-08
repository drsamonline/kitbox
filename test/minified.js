/* The minified build must behave like the real one.
 *
 * tools/minify.js removes comments using acorn's ranges, which is safe in
 * principle. This is the part that makes it safe in fact: the artefact that
 * would be published is rendered, searched and routed exactly like the app.
 *
 * Usage: node tools/minify.js && node test/minified.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const FILE = path.join(__dirname, '..', 'dist', 'kitbox.min.html');
let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? (pass++, console.log('PASS  ' + name + (extra ? '  (' + extra + ')' : '')))
       : (fail++, console.log('FAIL  ' + name + (extra ? '  (' + extra + ')' : '')));
};

if (!fs.existsSync(FILE)) {
  console.log('FAIL  dist/kitbox.min.html does not exist — run node tools/minify.js first');
  process.exit(1);
}

const html = fs.readFileSync(FILE, 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });
const w = dom.window;
w.scrollTo = () => {};
w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => {
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  if (/^create(Linear|Radial|Conic)Gradient$/.test(k)) return () => ({ addColorStop() {} });
  return () => {};
}});
w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
w.HTMLMediaElement.prototype.play = () => Promise.resolve();
w.HTMLMediaElement.prototype.pause = () => {};
w.HTMLMediaElement.prototype.load = () => {};

setTimeout(() => {
  const TOOLS = w.eval('TOOLS');
  const CATS = w.eval('CATS');

  let total = 0;
  const broken = [];
  for (const c of CATS) for (const t of (TOOLS[c.id] || [])) {
    total++;
    const box = w.document.createElement('div');
    try { t.render(box); } catch (e) { broken.push(c.id + '/' + t.id + ': ' + e.message.split('\n')[0]); }
  }
  ok('every tool renders from the minified build', broken.length === 0,
     broken.length ? broken.slice(0, 3).join(' | ') : total + ' tools');

  ok('search still ranks', w.eval('searchTools("emi")[0].id') === 'loanemi', w.eval('searchTools("emi")[0].id'));

  w.eval('location.hash="#/tool/almanac/panchang"; route()');
  ok('a tool page routes and renders', /Tithi/.test(w.document.querySelector('#toolRoot').textContent));

  w.eval('location.hash="#/tool/calc/percentchange"; route()');
  const a = w.document.querySelector('#pcA'), b = w.document.querySelector('#pcB');
  a.value = '100'; a.dispatchEvent(new w.Event('input'));
  b.value = '125'; b.dispatchEvent(new w.Event('input'));
  ok('a calculation gives the same answer after minification',
     /\+25\.00%/.test(w.document.querySelector('#pcOut').textContent));

  ok('the support page keeps its payment details',
     (w.eval('location.hash="#/support"'), w.eval('route()'), /drsohilboi@ybl/.test(w.document.querySelector('#app').textContent)));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 800);
