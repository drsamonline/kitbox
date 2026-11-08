/* Interaction sweep: drive every tool's first field and prove it survives.
 *
 * "Every tool renders" was already covered. This asks a harder question —
 * does it still work when you type something into it? — and it is the cheapest
 * way to catch a tool whose handler references an element it no longer renders.
 *
 * It also reports tool-level coverage: how many of the 339 tools have been
 * driven with input, as opposed to merely mounted. That number is the honest
 * proxy for coverage here, because the app is one script and statement
 * coverage of it would measure the router, not the tools.
 *
 * Usage: node test/interact.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'kitbox.html'), 'utf8');
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
  const stage = w.document.createElement('div');
  w.document.body.appendChild(stage);

  // A plausible value for each kind of field, so a tool is driven with input
  // it was designed for rather than a string it would rightly reject.
  function valueFor(el) {
    const type = (el.type || 'text').toLowerCase();
    if (type === 'number' || type === 'range') {
      const min = el.min !== '' ? Number(el.min) : NaN;
      const max = el.max !== '' ? Number(el.max) : NaN;
      if (isFinite(min) && isFinite(max)) return String(min + (max - min) / 2);
      return '42';
    }
    if (type === 'date') return new Date().toISOString().slice(0, 10);
    if (type === 'time') return '09:30';
    if (type === 'datetime-local') return new Date().toISOString().slice(0, 16);
    if (type === 'month') return new Date().toISOString().slice(0, 7);
    if (type === 'color') return '#3366cc';
    if (el.tagName === 'SELECT') return el.options.length > 1 ? el.options[1].value : (el.options[0] || {}).value || '';
    if (el.tagName === 'TEXTAREA') return 'Asha\nRavi\nMeera';
    return 'test input';
  }

  let driven = 0, failures = [];
  for (const c of CATS) {
    for (const t of (TOOLS[c.id] || [])) {
      stage.innerHTML = '';
      const root = w.document.createElement('div');
      stage.appendChild(root);
      try { t.render(root); } catch (e) { continue; }

      const field = root.querySelector('input:not([type=file]):not([type=checkbox]):not([type=radio]), textarea, select');
      if (!field) continue;
      const value = valueFor(field);
      try {
        field.value = value;
        field.dispatchEvent(new w.Event('input', { bubbles: true }));
        field.dispatchEvent(new w.Event('change', { bubbles: true }));
        // Any throw inside a listener is caught by the app's own handler and
        // logged; a logged error means the interaction failed.
        const log = w.eval("store.get('error-log', [])");
        if (log.length) {
          failures.push(c.id + '/' + t.id + ' → ' + log[0].message.slice(0, 80));
          w.eval("store.set('error-log', [])");
        } else if (!root.textContent.trim()) {
          failures.push(c.id + '/' + t.id + ' → the tool emptied itself');
        } else {
          driven++;
        }
      } catch (e) {
        failures.push(c.id + '/' + t.id + ' → ' + e.message.split('\n')[0].slice(0, 80));
      }
    }
  }

  failures.slice(0, 12).forEach(f => console.log('FAIL  ' + f));
  console.log((failures.length ? 'FAIL  ' : 'PASS  ') + driven + ' tools driven with input, ' + failures.length + ' failure(s)');
  process.exit(failures.length ? 1 : 0);
}, 800);
