/* Accessibility audit with axe-core, against the real file in jsdom.
 *
 * It found exactly one violation in the whole app when it was added — the
 * .field labels were siblings of their inputs rather than associated with
 * them — which is now fixed in one place for all 338 tools.
 *
 * Colour-contrast rules need layout, which jsdom does not do, so contrast is
 * asserted separately in test/smoke.js by computing the ratios directly.
 *
 * Usage: node test/axe.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'kitbox.html'), 'utf8');
const axeSource = fs.readFileSync(require.resolve('axe-core').replace(/axe\.js$/, 'axe.min.js'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });
const w = dom.window;
w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => {
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  if (/^create(Linear|Radial|Conic)Gradient$/.test(k)) return () => ({ addColorStop() {} });
  return () => {};
}});
w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';

setTimeout(async () => {
  w.eval(axeSource);
  const TOOLS = w.eval('TOOLS');
  const CATS = w.eval('CATS');

  const pages = ['#/', '#/all', '#/about', '#/support'];
  for (const c of CATS) if ((TOOLS[c.id] || []).length) pages.push('#/category/' + c.id);
  // One tool page per category, so the sweep covers every layout family.
  for (const c of CATS) if ((TOOLS[c.id] || []).length) pages.push('#/tool/' + c.id + '/' + TOOLS[c.id][0].id);

  let fail = 0, checked = 0;
  for (const page of pages) {
    w.eval('location.hash=' + JSON.stringify(page) + '; route()');
    const res = await w.eval("axe.run(document, {resultTypes:['violations']})");
    checked++;
    if (res.violations.length) {
      fail += res.violations.length;
      console.log('FAIL  ' + page);
      for (const v of res.violations) {
        console.log('        ' + v.id + ' (' + v.nodes.length + ') — ' + v.help);
        console.log('        ' + (v.nodes[0].html || '').slice(0, 120));
      }
    }
  }
  console.log((fail ? 'FAIL  ' : 'PASS  ') + checked + ' pages, ' + fail + ' violation(s)');
  process.exit(fail ? 1 : 0);
}, 800);
