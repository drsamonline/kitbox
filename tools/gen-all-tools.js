/* Generate ALL_TOOLS.md from the app's own registry.
 *
 * The list cannot drift from the app because it is read out of kitbox.html,
 * the same way the badges are. `--check` verifies the committed file is
 * current and is run in CI.
 *
 * Usage: node tools/gen-all-tools.js [--check]
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'ALL_TOOLS.md');
const CHECK = process.argv.includes('--check');

const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'kitbox.html'), 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });

setTimeout(() => {
  const TOOLS = dom.window.eval('TOOLS');
  const CATS = dom.window.eval('CATS');
  const total = CATS.reduce((a, c) => a + (TOOLS[c.id] || []).length, 0);

  const lines = [];
  lines.push('# Kitbox — complete tool list');
  lines.push('');
  lines.push('**' + total + ' tools across ' + CATS.filter(c => (TOOLS[c.id] || []).length).length + ' categories.**');
  lines.push('');
  lines.push('Generated from the app itself by `node tools/gen-all-tools.js`. Do not edit by hand —');
  lines.push('the file is rewritten from the registry, and CI fails if it is out of date.');
  lines.push('');
  lines.push('| # | Category | Code | Tools |');
  lines.push('|--:|:--|:--|--:|');
  let n = 0;
  for (const c of CATS) {
    const list = TOOLS[c.id] || [];
    if (!list.length) continue;
    n++;
    lines.push('| ' + n + ' | ' + c.name + ' | `' + c.code + '` | ' + list.length + ' |');
  }
  lines.push('');

  for (const c of CATS) {
    const list = TOOLS[c.id] || [];
    if (!list.length) continue;
    lines.push('## ' + c.name + ' — ' + list.length + ' tools');
    lines.push('');
    if (list.some(t => t.group)) {
      const groups = [];
      for (const t of list) {
        const g = t.group || 'Other';
        let e = groups.find(x => x.name === g);
        if (!e) { e = { name: g, items: [] }; groups.push(e); }
        e.items.push(t);
      }
      for (const g of groups) {
        lines.push('**' + g.name + '**');
        lines.push('');
        for (const t of g.items) lines.push('- `' + t.code + '` **' + t.name + '** — `' + c.id + '/' + t.id + '`');
        lines.push('');
      }
    } else {
      for (const t of list) lines.push('- `' + t.code + '` **' + t.name + '** — `' + c.id + '/' + t.id + '`');
      lines.push('');
    }
  }

  const text = lines.join('\n');
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';

  if (CHECK) {
    if (current !== text) {
      console.error('FAIL  ALL_TOOLS.md is out of date — run `node tools/gen-all-tools.js`');
      process.exit(1);
    }
    console.log('PASS  ALL_TOOLS.md matches the registry (' + total + ' tools)');
    process.exit(0);
  }

  fs.writeFileSync(OUT, text);
  console.log('wrote ALL_TOOLS.md — ' + total + ' tools, ' + lines.length + ' lines');
  process.exit(0);
}, 700);
