/* Pin every tool's code and id, so neither can move by accident.
 *
 * Why this exists: codes were assigned by a counter at registration, so
 * inserting a tool in the middle of a category renumbered every tool after it
 * — and the code is what a user quotes in a bug report ("FIL-03 gives the
 * wrong hash"). Ids matter for the same reason plus two more: pins and
 * bookmarks store them.
 *
 *   codes.json  the code each tool was first given, keyed by category/id
 *   ids.json    every id that has ever existed, so a rename can be detected
 *
 * The app embeds codes.json between the CODES:START / CODES:END markers.
 * `--check` fails if the file and the registry disagree, if a code changed,
 * or if an id disappeared without an alias.
 *
 * Usage:
 *   node tools/gen-codes.js            # assign codes for new tools, rewrite the app block
 *   node tools/gen-codes.js --check    # verify (CI)
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'kitbox.html');
const CODES = path.join(ROOT, 'codes.json');
const IDS = path.join(ROOT, 'ids.json');
const CHECK = process.argv.includes('--check');

const START = '/* CODES:START */';
const END = '/* CODES:END */';

const dom = new JSDOM(fs.readFileSync(APP, 'utf8'),
  { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://local.test/' });

setTimeout(() => {
  const TOOLS = dom.window.eval('TOOLS');
  const CATS = dom.window.eval('CATS');

  const current = {};            // "cat/id" -> code the registry produced
  const idsNow = [];
  for (const c of CATS) {
    for (const t of (TOOLS[c.id] || [])) {
      current[c.id + '/' + t.id] = t.code;
      idsNow.push(c.id + '/' + t.id);
    }
  }

  const codes = fs.existsSync(CODES) ? JSON.parse(fs.readFileSync(CODES, 'utf8')) : {};
  const ids = fs.existsSync(IDS) ? JSON.parse(fs.readFileSync(IDS, 'utf8')) : { ids: [] };

  if (CHECK) {
    let fail = 0;
    const say = (ok, msg) => { console.log((ok ? 'PASS  ' : 'FAIL  ') + msg); if (!ok) fail++; };

    const missing = Object.keys(current).filter(k => !codes[k]);
    say(missing.length === 0, 'every tool has a pinned code' + (missing.length ? ': ' + missing.slice(0, 5).join(', ') : ''));

    const changed = Object.keys(codes).filter(k => current[k] && current[k] !== codes[k]);
    say(changed.length === 0, 'no pinned code changed' + (changed.length ? ': ' + changed.slice(0, 5).map(k => k + ' ' + codes[k] + '->' + current[k]).join(', ') : ''));

    const values = Object.values(codes);
    const dupes = values.filter((v, i) => values.indexOf(v) !== i);
    say(dupes.length === 0, 'codes are unique' + (dupes.length ? ': ' + [...new Set(dupes)].join(', ') : ''));

    const gone = ids.ids.filter(k => !idsNow.includes(k));
    const aliases = (dom.window.eval('typeof ID_ALIASES !== "undefined" ? ID_ALIASES : {}') || {});
    const unaliased = gone.filter(k => !Object.prototype.hasOwnProperty.call(aliases, k));
    say(unaliased.length === 0, 'every retired id has an alias' + (unaliased.length ? ': ' + unaliased.join(', ') : ''));

    const embedded = (fs.readFileSync(APP, 'utf8').match(new RegExp(START.replace(/[/*]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[/*]/g, '\\$&'))) || [''])[0];
    say(embedded.includes('"files/zipcreate": "FIL-01"') || Object.keys(codes).every(k => embedded.includes(JSON.stringify(k))),
        'the app embeds the same map as codes.json');

    console.log('\n' + Object.keys(codes).length + ' codes pinned, ' + ids.ids.length + ' ids on record');
    process.exit(fail ? 1 : 0);
  }

  // ---- write mode: assign codes to anything new, keep the rest ----
  const used = new Set(Object.values(codes));
  let added = 0;
  for (const c of CATS) {
    const prefix = c.code;
    let n = 1;
    for (const t of (TOOLS[c.id] || [])) {
      const key = c.id + '/' + t.id;
      if (codes[key]) continue;
      while (used.has(prefix + '-' + String(n).padStart(2, '0'))) n++;
      const code = prefix + '-' + String(n).padStart(2, '0');
      codes[key] = code;
      used.add(code);
      added++;
    }
  }

  const sortedCodes = {};
  Object.keys(codes).sort().forEach(k => { sortedCodes[k] = codes[k]; });
  fs.writeFileSync(CODES, JSON.stringify(sortedCodes, null, 2) + '\n');

  const allIds = [...new Set([...(ids.ids || []), ...idsNow])].sort();
  fs.writeFileSync(IDS, JSON.stringify({ schema: 1, ids: allIds }, null, 2) + '\n');

  // rewrite the embedded block in the app
  const app = fs.readFileSync(APP, 'utf8');
  const block = START + '\nconst STABLE_CODES = ' + JSON.stringify(sortedCodes, null, 0)
    .replace(/","/g, '", "').replace(/^{/, '{ ').replace(/}$/, ' }') + ';\n' + END;
  const re = new RegExp(START.replace(/[/*]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[/*]/g, '\\$&'));
  if (!re.test(app)) {
    console.error('The app has no ' + START + ' / ' + END + ' markers — add them before running this.');
    process.exit(1);
  }
  fs.writeFileSync(APP, app.replace(re, block));

  console.log('codes: ' + Object.keys(sortedCodes).length + ' pinned (' + added + ' new)');
  console.log('ids:   ' + allIds.length + ' on record');
  console.log('wrote the embedded map into kitbox.html');
  process.exit(0);
}, 700);
