/* Unit tests for the pure functions, in Node, with no DOM.
 *
 * Everything here is a mapping from values to values: hashing, checksums,
 * base encodings, ZIP bytes, EXIF, astronomy. Testing them through jsdom would
 * be slower and would prove less — a bug in md5 does not care about the page.
 *
 * Usage: node tools/build-lib.js && node test/lib.js
 */
require('../dist/lib.js');
const K = globalThis.KB;

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? (pass++, console.log('PASS  ' + name + (extra ? '  (' + extra + ')' : '')))
       : (fail++, console.log('FAIL  ' + name + (extra ? '  (' + extra + ')' : '')));
};
const bytes = s => K.bytesFromText(s);
const hex = u8 => Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');

/* escaping */
ok('escapeHtml neutralises every dangerous character',
   K.escapeHtml('<img src=x onerror="a">&\'') === '&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;',
   K.escapeHtml('<b>&"\''));

/* hashing */
ok('MD5("abc") is the published vector', K.md5(bytes('abc')) === '900150983cd24fb0d6963f7d28e17f72', K.md5(bytes('abc')));
ok('MD5 of the empty string is the published vector', K.md5(new Uint8Array(0)) === 'd41d8cd98f00b204e9800998ecf8427e');
ok('MD5 of the fox is the published vector', K.md5(bytes('The quick brown fox jumps over the lazy dog')) === '9e107d9d372bb6826bd81d3542a419d6');
ok('CRC32("123456789") is the check value', K.crc32(bytes('123456789')).toString(16) === 'cbf43926');

/* encodings round-trip */
const samples = ['', 'a', 'hello', 'Kitbox — offline', '\u0000\u00ff\u0080'];
ok('base32 round-trips every sample', samples.every(s => K.textFromBytes(K.fromBase32(K.toBase32(bytes(s)))) === s));
ok('base58 round-trips every sample', samples.every(s => K.textFromBytes(K.fromBase58(K.toBase58(bytes(s)))) === s));
ok('base32("hello") is NBSWY3DP', K.toBase32(bytes('hello')) === 'NBSWY3DP');
ok('base58("hello") is Cn8eVZg', K.toBase58(bytes('hello')) === 'Cn8eVZg');
ok('base32 tolerates lowercase and padding', K.textFromBytes(K.fromBase32('nbswy3dp====')) === 'hello');

/* zip */
const zip = K.buildZip([{ name: 'a.txt', data: bytes('hello') }, { name: 'b.csv', data: bytes('x,y\n1,2') }]);
ok('a ZIP starts with the local file header', zip[0] === 0x50 && zip[1] === 0x4b && zip[2] === 3 && zip[3] === 4);
ok('a ZIP ends with the end-of-central-directory record',
   hex(zip.slice(-22, -18)) === '504b0506', hex(zip.slice(-22, -18)));
const zipText = Buffer.from(zip).toString('latin1');
ok('both names and both payloads are in the archive',
   zipText.includes('a.txt') && zipText.includes('b.csv') && zipText.includes('hello') && zipText.includes('x,y'));

/* exif */
const jpeg = Uint8Array.from([0xFF, 0xD8, 0xFF, 0xE1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
  0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0xFF, 0xD9]);
ok('the orientation tag is read', K.readOrientation(jpeg) === 6);
ok('stripping keeps the orientation tag', K.readOrientation(K.stripJpegMetadata(jpeg)) === 6);
ok('stripping a JPEG with no EXIF leaves a valid empty JPEG', K.stripJpegMetadata(Uint8Array.from([0xFF, 0xD8, 0xFF, 0xD9])).length === 4);

/* astronomy — Meeus, Astronomical Algorithms */
ok('J2000 is JD 2451545.0', K.ASTRO.jd({ y: 2000, m: 1, d: 1, h: 12 }) === 2451545.0);
ok('sun apparent longitude matches Meeus 25.b', Math.abs(K.ASTRO.sunLongitude(2448908.5) - 199.90895) < 0.01,
   K.ASTRO.sunLongitude(2448908.5).toFixed(5));
// Meeus example 47.a is 1992 April 12, which is JD 2448724.5 — not the
// 2448908.5 used for the solar example, which is a different day in October.
ok('moon longitude matches Meeus 47.a', Math.abs(K.ASTRO.moonLongitude(2448724.5) - 133.162655) < 0.02,
   K.ASTRO.moonLongitude(2448724.5).toFixed(5));

/* colour and formatting */
ok('black on white is 21:1', Math.abs(K.contrastWith('#000000', '#ffffff') - 21) < 0.01, K.contrastWith('#000000', '#ffffff').toFixed(2));
ok('tile ink flips for a light tile', K.tileLuminance('#ffffff') === 1 && K.contrastWith('#9FCB1B', '#17171d') > 4.5);
ok('bytes are formatted with a unit', /^\d+(\.\d)? (B|KB|MB|GB)$/.test(K.fmtBytes(1536)), K.fmtBytes(1536));
ok('passphrase strength separates a word from a phrase',
   K.passStrength('password').score === 0 && K.passStrength('correct horse battery staple').score >= 3,
   K.passStrength('password').label + ' / ' + K.passStrength('correct horse battery staple').label);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
