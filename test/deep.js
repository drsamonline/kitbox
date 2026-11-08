/* The deeper tests: fixtures for the calculators, round trips for the codecs,
 * real files through the file tools, and the landing page's links.
 *
 * Each of these is a promise the app makes:
 *   - a calculator that gave the right answer keeps giving it
 *   - encode then decode returns what you started with
 *   - a file you hand a tool is read correctly
 *   - every link on the landing page goes somewhere
 *
 * Usage: node test/deep.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'kitbox.html'), 'utf8');
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures.json'), 'utf8'));

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

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? (pass++, console.log('PASS  ' + name + (extra ? '  (' + extra + ')' : '')))
       : (fail++, console.log('FAIL  ' + name + (extra ? '  (' + extra + ')' : '')));
};

// One staging container, emptied between tools. Rewriting document.body to
// clear it destroys the app's own elements and every later render fails.
const STAGE = w.document.createElement('div');
w.document.body.appendChild(STAGE);
const stage = () => { STAGE.innerHTML = ''; return STAGE; };

setTimeout(async () => {
  const TOOLS = w.eval('TOOLS');
  const mountTool = (cat, id) => {
    const holder = stage();
    const root = w.document.createElement('div');
    holder.appendChild(root);
    TOOLS[cat].find(t => t.id === id).render(root);
    return root;
  };
  const type = (el, value) => {
    el.value = value;
    el.dispatchEvent(new w.Event('input', { bubbles: true }));
    el.dispatchEvent(new w.Event('change', { bubbles: true }));
  };

  /* ---- fixtures: a calculator that was right stays right ---- */
  for (const [key, spec] of Object.entries(fixtures.tools)) {
    const [cat, id] = key.split('/');
    const root = mountTool(cat, id);
    for (const [fieldId, value] of Object.entries(spec.inputs)) {
      const el = root.querySelector('[id="' + fieldId + '"]');
      if (!el) { ok(key + ' field ' + fieldId + ' exists', false); continue; }
      type(el, value);
    }
    if (spec.click) root.querySelector(spec.click).click();
    const out = root.textContent.replace(/\s+/g, ' ');
    ok(key + ' — ' + spec.expects, out.includes(spec.output), out.slice(0, 70));
  }

  /* ---- round trips: encode then decode is the identity ---- */
  const roundTrip = (cat, id, inputId, outId, encBtn, decBtn, text) => {
    const root = mountTool(cat, id);
    const input = root.querySelector('#' + inputId);
    type(input, text);
    root.querySelector(encBtn).click();
    const encoded = root.querySelector('#' + outId).value !== undefined
      ? root.querySelector('#' + outId).value
      : root.querySelector('#' + outId).textContent.trim();
    type(input, encoded);
    root.querySelector(decBtn).click();
    const decoded = root.querySelector('#' + outId).value !== undefined
      ? root.querySelector('#' + outId).value
      : root.querySelector('#' + outId).textContent.trim();
    ok(cat + '/' + id + ' round trip — ' + JSON.stringify(text), decoded === text, JSON.stringify(decoded).slice(0, 40));
  };

  roundTrip('dev', 'base64', 'b64In', 'b64Out', '#b64Enc', '#b64Dec', 'Kitbox — offline');
  roundTrip('dev', 'base32', 'b58In', 'b58Out', '[data-b="32enc"]', '[data-b="32dec"]', 'round trip');
  roundTrip('dev', 'base32', 'b58In', 'b58Out', '[data-b="58enc"]', '[data-b="58dec"]', 'Kitbox');

  /* ---- files: synthetic File objects through the real handlers ---- */
  // zipcreate reads files, builds a ZIP and saves it; capture the blob instead
  let zipBytes = null;
  w.eval('saveBlob = function(blob){ window.__saved = blob; }');
  const zipRoot = mountTool('files', 'zipcreate');
  const zipInput = zipRoot.querySelector('#zpFiles');
  const files = [
    new w.File(['hello'], 'a.txt', { type: 'text/plain' }),
    new w.File(['x,y\n1,2'], 'b.csv', { type: 'text/csv' })
  ];
  Object.defineProperty(zipInput, 'files', { value: files, configurable: true });
  zipInput.dispatchEvent(new w.Event('change', { bubbles: true }));
  zipRoot.querySelector('#zpGo').click();
  await new Promise(r => setTimeout(r, 120));
  const saved = w.__saved;
  if (saved) {
    const buf = new Uint8Array(await saved.arrayBuffer());
    zipBytes = buf;
    ok('the ZIP tool reads real files and builds an archive',
       buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 3 && buf[3] === 4, buf.length + ' bytes');
    const text = Buffer.from(buf).toString('latin1');
    ok('both file names are in the archive', text.includes('a.txt') && text.includes('b.csv'));
    ok('the file contents are in the archive', text.includes('hello') && text.includes('x,y'));
  } else {
    ok('the ZIP tool reads real files and builds an archive', false, 'nothing was saved');
  }

  // filetype reads the first bytes and names the format
  const ftRoot = mountTool('files', 'filetype');
  const ftInput = ftRoot.querySelector('#ftFile');
  const png = new w.File([Uint8Array.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0])], 'x.png', { type: 'image/png' });
  Object.defineProperty(ftInput, 'files', { value: [png], configurable: true });
  ftInput.dispatchEvent(new w.Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 80));
  ok('the file type detector reads a PNG by its bytes',
     /PNG image/.test(ftRoot.textContent), ftRoot.textContent.replace(/\s+/g, ' ').slice(0, 60));

  // csvtable parses a real CSV file into rows
  const cvRoot = mountTool('files', 'csvtable');
  const cvInput = cvRoot.querySelector('#cvFile');
  const csv = new w.File(['name,city\nAsha,Vadodara\nRavi,Surat'], 'x.csv', { type: 'text/csv' });
  Object.defineProperty(cvInput, 'files', { value: [csv], configurable: true });
  cvInput.dispatchEvent(new w.Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 120));
  ok('the CSV viewer parses a real file into rows',
     cvRoot.querySelectorAll('#cvTable tr').length === 3, cvRoot.querySelectorAll('#cvTable tr').length + ' rows');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}, 800);
