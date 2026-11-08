/* Fuzz every text field in every tool with markup payloads.
 *
 * The app builds most of its output with innerHTML, so the one bug class that
 * matters is user text reaching the DOM unescaped. `escapeHtml` exists and is
 * used almost everywhere; this proves it, tool by tool, instead of trusting it.
 *
 * A payload "wins" if it creates a script, an iframe, an svg with an on* handler,
 * or an image with an onerror — or if it manages to set window.__pwn.
 *
 * Usage: node test/fuzz.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'kitbox.html'), 'utf8');

const PAYLOADS = [
  '<img src=x onerror="window.__pwn=1">',
  '"><script>window.__pwn=2</script>',
  '<svg onload="window.__pwn=3">',
  'javascript:window.__pwn=4',
  '<iframe src="javascript:window.__pwn=5"></iframe>',
  "'><img src=x onerror=window.__pwn=6>",
  '<a href="javascript:window.__pwn=7">x</a>',
  '<<script>window.__pwn=8//<</script>'
];

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });
const w = dom.window;
w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => {
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  if (/^create(Linear|Radial|Conic)Gradient$/.test(k)) return () => ({ addColorStop() {} });
  return () => {};
}});
w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
w.MediaElementPlay = () => {};

setTimeout(() => {
  const TOOLS = w.eval('TOOLS');
  const CATS = w.eval('CATS');

  const stage = w.document.createElement('div');
  w.document.body.appendChild(stage);

  const injected = rootEl => {
    const bad = [];
    if (rootEl.querySelector('script, iframe, object, embed')) bad.push('script/iframe/object');
    rootEl.querySelectorAll('*').forEach(el => {
      for (const attr of el.attributes || []) {
        if (/^on/i.test(attr.name)) bad.push(el.tagName.toLowerCase() + '[' + attr.name + ']');
        if (attr.name === 'href' && /^javascript:/i.test(attr.value)) bad.push('javascript: href');
        if (attr.name === 'src' && /^javascript:/i.test(attr.value)) bad.push('javascript: src');
      }
    });
    if (w.__pwn !== undefined) bad.push('window.__pwn=' + w.__pwn);
    return bad;
  };

  let failures = 0, fields = 0, tools = 0;

  for (const c of CATS) {
    for (const t of (TOOLS[c.id] || [])) {
      tools++;
      stage.innerHTML = '';
      const root = w.document.createElement('div');
      stage.appendChild(root);
      try { t.render(root); } catch (e) { continue; }

      const inputs = [...root.querySelectorAll('input[type=text], input:not([type]), textarea')];
      for (const field of inputs) {
        fields++;
        for (const payload of PAYLOADS) {
          w.__pwn = undefined;
          try {
            field.value = payload;
            field.dispatchEvent(new w.Event('input', { bubbles: true }));
            field.dispatchEvent(new w.Event('change', { bubbles: true }));
          } catch (e) { /* a tool that throws on odd input is a different test */ }
          const bad = injected(root);
          if (bad.length) {
            failures++;
            console.log('FAIL  ' + c.id + '/' + t.id + '  field #' + (field.id || field.name || '?') +
                        '  payload ' + JSON.stringify(payload.slice(0, 24)) + '  →  ' + [...new Set(bad)].join(', '));
            break;
          }
        }
      }
    }
  }

  w.__pwn = undefined;
  console.log((failures ? 'FAIL  ' : 'PASS  ') + fields + ' fields across ' + tools + ' tools, ' + PAYLOADS.length + ' payloads each, ' + failures + ' injection(s)');
  process.exit(failures ? 1 : 0);
}, 800);
