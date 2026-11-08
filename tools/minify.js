/* Build dist/kitbox.min.html by removing comments — using a real parser.
 *
 * The first version of this was a hand-rolled state machine that tracked
 * strings, template literals, regexes and ${ } nesting. It looked right and
 * produced a file that did not parse: a single backtick in the wrong context
 * turns every later template literal inside out. The app is 700 KB of
 * JavaScript in which most of the markup lives inside template literals, so
 * "looks right" is not good enough.
 *
 * acorn gives exact comment ranges. We delete those and nothing else — no
 * whitespace collapsing, no identifier mangling — and then prove the result
 * still works by running the test suite against it.
 *
 * acorn is a devDependency. The app still ships with zero dependencies.
 *
 * Usage: node tools/minify.js [--check]
 */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'kitbox.html');
const OUT = path.join(ROOT, 'dist', 'kitbox.min.html');
const CHECK = process.argv.includes('--check');

const raw = fs.readFileSync(SRC, 'utf8');

const open = raw.indexOf('<script>');
const close = raw.lastIndexOf('</script>');
if (open === -1 || close === -1) {
  console.error('kitbox.html has no <script> block');
  process.exit(1);
}
const head = raw.slice(0, open + '<script>'.length);
const script = raw.slice(open + '<script>'.length, close);
const tail = raw.slice(close);

// HTML comments outside the script are safe to drop wholesale.
const headClean = head.replace(/<!--[\s\S]*?-->/g, '');

// Ask the parser where the comments are.
const comments = [];
acorn.parse(script, {
  ecmaVersion: 'latest',
  sourceType: 'script',
  allowHashBang: true,
  onComment: (block, text, start, end) => comments.push([start, end])
});

let out = '';
let at = 0;
for (const [start, end] of comments) {
  out += script.slice(at, start);
  at = end;
}
out += script.slice(at);

// Collapse the blank lines the removals leave behind, and trailing spaces.
const tidy = text => text.split('\n')
  .map(line => line.replace(/[ \t]+$/, ''))
  .filter((line, i, all) => line.trim() !== '' || (i > 0 && all[i - 1].trim() !== ''))
  .join('\n')
  .replace(/\n+$/, '\n');

const minified = tidy(headClean + out + tail);

fs.mkdirSync(path.dirname(OUT), { recursive: true });

if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== minified) {
    console.log('FAIL  dist/kitbox.min.html is out of date — run node tools/minify.js');
    process.exit(1);
  }
  console.log('PASS  dist/kitbox.min.html matches (' + Math.round(minified.length / 1024) + ' KB)');
  process.exit(0);
}

fs.writeFileSync(OUT, minified);
console.log('kitbox.html     ' + String(raw.length).padStart(7) + ' B');
console.log('kitbox.min.html ' + String(minified.length).padStart(7) + ' B  (' +
            Math.round(100 * minified.length / raw.length) + '% of the original, ' +
            comments.length + ' comments removed)');
