/* Keeps the README badges honest.
 *
 * The badges are local SVG files (tools/badges.py), which means nobody
 * regenerates them by accident — and nobody notices when they go stale.
 * This checks them against the thing they claim to describe:
 *
 *   tools, categories  -> counted from kitbox.html itself
 *   tests              -> counted from the ok(...) calls in test/smoke.js
 *   size               -> the real size of kitbox.html
 *
 * Run: node tools/check-badges.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

let fail = 0;
function expect(label, actual, badgeFile) {
  const svg = read('docs/assets/' + badgeFile);
  const text = (svg.match(/>([^<>]+)<\/text>/g) || []).map(s => s.replace(/[<>]|\/text/g, '')).join(' ');
  const ok = text.includes(String(actual));
  console.log((ok ? 'PASS  ' : 'FAIL  ') + label + ': badge says “' + text.trim() + '”, reality is ' + actual);
  if (!ok) fail++;
}

const dom = new JSDOM(read('kitbox.html'), { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });

setTimeout(() => {
  const TOOLS = dom.window.eval('TOOLS');
  const CATS = dom.window.eval('CATS');
  const toolCount = CATS.reduce((a, c) => a + (TOOLS[c.id] || []).length, 0);
  const catCount = CATS.filter(c => (TOOLS[c.id] || []).length).length;

  expect('tools', toolCount, 'badge-tools.svg');
  expect('categories', catCount, 'badge-categories.svg');

  // every assertion in every test file, not just the smoke suite
  const files = fs.readdirSync(path.join(ROOT, 'test')).filter(f => f.endsWith('.js'));
  const tests = files.reduce((a, f) => a + (read('test/' + f).match(/\bok\(/g) || []).length, 0);
  expect('checks', tests, 'badge-checks.svg');

  const kb = Math.round(fs.statSync(path.join(ROOT, 'kitbox.html')).size / 1024);
  const svgSize = read('docs/assets/badge-size.svg');
  const sizeOk = svgSize.includes(kb + ' KB');
  console.log((sizeOk ? 'PASS  ' : 'FAIL  ') + 'size: badge says “' + (svgSize.match(/(\d+) KB/) || [])[1] + ' KB”, reality is ' + kb + ' KB');
  if (!sizeOk) fail++;

  // The banner repeats the two headline numbers in prose.
  const banner = read('docs/assets/banner.svg');
  const bannerOk = banner.includes(toolCount + ' tools') && banner.includes(catCount + ' categories');
  console.log((bannerOk ? 'PASS  ' : 'FAIL  ') + 'banner: “' + toolCount + ' tools across ' + catCount + ' categories”');
  if (!bannerOk) fail++;

  console.log('\n' + (fail ? fail + ' badge(s) out of date — run python3 tools/badges.py' : 'all badges match the app'));
  process.exit(fail ? 1 : 0);
}, 600);
