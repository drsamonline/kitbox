# Changelog

All notable changes to Kitbox. The app is a single file, so the version number in this file is the version of `index.html`.

## Unreleased

### Changed

- **The language set is fixed at English, Hindi and Gujarati.** E-101 in the roadmap and B13 in the plan both say so now, and "any other language" has moved into the deliberately-not-doing table with its reason: each language is a dictionary to maintain and re-verify every release, and a half-translated fourth language is worse than none.

## 2.10.0 — 2026-11-09

B29 and B30 from [BACKLOG-TOOLS.md](BACKLOG-TOOLS.md).

### B29 — signing, IPv6, JSONPath (3)

- **RSA Sign / Verify** — RSASSA-PKCS1-v1_5 or RSA-PSS, pasted key, and a clear verdict. Signing proves who sent it; the encryption tool beside it hides it from everyone else, and the hints say which is which.
- **IPv6 Header & ICMPv6** — the 40-byte fixed header from pasted hex, plus an address expander that turns `2001:db8::1` into eight groups and names the address type (link-local, ULA, multicast, documentation, global unicast).
- **JSONPath Query** — `$`, `.key`, `[0]`, `[*]`, `..key` and `[?(@.price > 10)]`, and it says when it meets a path it does not implement rather than quietly returning nothing.

### B30 — image controls, sound levels, a month of moon (5)

- **Image HSL**, **Invert Image**, **Image Opacity** — the individual controls, where the existing filters tool has presets. Built on one shared harness, so the file loading, the sliders and the download behave identically in all three.
- **Decibels & Sound Level** — dB SPL, a power ratio, a voltage ratio and dBm, with the factor-of-two difference explained rather than assumed.
- **RC Filter Response** — cut-off, time constant, and the response an octave and a decade either side.
- **Moon Table for a Month** — moonrise, moonset, phase and illumination per day.

### Fixed

- **The JSONPath filter could never match.** The token is `[?(@.price > 10)]` and the parser stripped `[?` and `]` but left the parentheses, so the expression started with `(` and failed its own check — reporting "only @.field <op> value filters are supported" for the exact syntax the hint advertises.
- **IPv6 addresses were printed without zero padding**, so `2001:0db8::1` came out as `2001:db8:0:0:…` and could not be compared with the expanded form below it.
- An image-apply callback referenced `root` from outside its closure; the linter's `no-undef` caught it before the build.

## 2.9.0 — 2026-11-09

B27 and B28 from [BACKLOG-TOOLS.md](BACKLOG-TOOLS.md).

### B27 — text at the level of code points and bits (3)

- **Punycode / IDN** — RFC 3492 per label, both directions. Verified against the published vectors: `münchen.de` → `xn--mnchen-3ya.de`, and `例え.テスト` → `xn--r8jz45g.xn--zckzah`.
- **Code Point Inspector** — each character's code point, UTF-8 bytes and UTF-16 units, with the astral characters marked. This is where `"🧰".length === 2` comes from.
- **Huffman Coding** — builds the tree, prints the code table, and says when the text is too flat to save anything.

### B28 — packets, RSA, two games (5)

- **Packet Header Parser** — IPv4, TCP, UDP and ICMP headers from pasted hex, with the payload offset taken from the IP header's own IHL rather than from counting.
- **RSA Encrypt / Decrypt** — RSA-OAEP with SHA-256, using a pasted public or private key, and a plain refusal when the message exceeds what the key can carry.
- **Pong** and **Breakout** — canvas, keyboard or pointer, scores kept locally.

### Changed — the tests can now reach the crypto

`test/smoke.js` hands the page **Node's real `crypto.subtle`**, because jsdom ships none. Every crypto tool was previously untestable in CI and reported "needs Web Crypto" instead of doing its job. Now the RSA round trip, the JWK conversion and the certificate parsing run against a real engine in the suite.

### Fixed

- Two dead locals in the punycode and Pong code, caught by the linter: a shadowed `delta` in the bias adapter and an unused `target` in the Pong setup.

## 2.8.0 — 2026-11-08

B25 and B26 from [BACKLOG-TOOLS.md](BACKLOG-TOOLS.md).

### B25 — QR payloads, UTM, a month of sun (3)

- **QR Payload Builder** — the thing you actually scan: WiFi join, contact card, email, SMS, location, otpauth URI, or a plain link, rendered as a QR with the app's own encoder and downloadable as PNG. One tool with a type selector rather than seven tools with the same canvas, for the same reason the extractors are one tool.
- **UTM Converter** — latitude/longitude ↔ UTM easting/northing and zone, WGS84, with the band letter and the Norway exception named.
- **Sun Table for a Month** — sunrise, sunset and daylight for every day, which is what you want when planning around light rather than asking about one day.

### B26 — what is inside a file (4)

- **ELF Header Reader** — class, endianness, type, machine, entry point, section names, and whether it is stripped.
- **File Carver** — PNG, JPEG, PDF, ZIP and GIF recovered from a blob by signature and end marker, each one saveable.
- **MIME Decoder** — multipart bodies split, quoted-printable and base64 decoded, encoded-word subjects resolved.
- **Sudoku Solver** — backtracking, with a contradiction check and an ambiguity warning.

### Fixed

- **The Sudoku solver printed the puzzle back.** The grid is restored on the way out of the recursion, so the "solution" was the board it started with — and it said "Solved in 8 ms" while doing it. The finished board is now copied at the moment it completes. My first verification caught it only because it compared the digits to the published solution rather than checking that the grid looked full.

### Changed

- 428 tools across 27 categories (was 421).
- 182 checks (was 182 → 147 in the suite, 189 across all files).
- The gzipped budget moved from 260 KB to 285 KB: 428 tools at roughly 620 bytes gzipped each. Recorded as a decision, not a drift.

## 2.7.0 — 2026-11-08

B23 and B24 from [BACKLOG-TOOLS.md](BACKLOG-TOOLS.md).

### B23 — keys, files, data (5)

- **JWK ↔ PEM** — RSA public and private, both directions. The app could *read* DER since B18; this needed a *writer*, and writing it means the reader and the writer can be tested against each other. The test that matters: **Node's Web Crypto imports the PEM this tool produces**, public and private, so the DER is not merely well-shaped but correct.
- **File Splitter & Joiner** — split into named parts, rejoin by sorted name, with a missing-part warning.
- **Duplicate Finder** — SHA-256 per file, grouped, with the space wasted; size-only mode says plainly that same size is not same file.
- **CSV to SQL** — PostgreSQL, MySQL or SQLite identifiers, `O'Brien` quoted as `O''Brien`, empty cells as NULL.
- **Modular Arithmetic** — modular power without the power, modular inverse (and why it may not exist), extended GCD with the Bézout identity, and the Chinese remainder theorem with the coprime check.

### B24 — two references, two accessibility checks (4)

- **SI Prefixes** — including quetta, ronna, ronto and quecto, with the value written at every scale.
- **Greek Alphabet** — with the sound each letter makes, which is the part people need.
- **Link Text Checker** — a screen reader can list every link out of context, so "click here" becomes six identical entries.
- **Reflow at 200%** — WCAG 1.4.10: does the text still fit a 320 px viewport at 400% zoom.

### Fixed

- **A stray expression in the SI prefix table.** The pico row read `1e12 ? 1e-12 : 0`, which happened to produce the right value for the wrong reason; it is now just `1e-12`.

### Changed

- 421 tools across 27 categories (was 412).
- 175 checks (was 175 → 139 in the suite, 181 across all files).

## 2.6.0 — 2026-11-08

B20, B21 and B22 from [BACKLOG-TOOLS.md](BACKLOG-TOOLS.md).

### B20 — the ASN.1 parser pays for itself (4)

- **X.509 Certificate Reader** — subject, issuer, serial, validity, signature algorithm, key size and the names it is valid for, from a PEM or DER hex. It says plainly that it does **not** verify the signature: a certificate is a claim, and only the issuer's signature turns it into evidence.
- **JSON Schema From a Sample**, **Regex Explainer**, **CSS Clamp Builder**.
- The DER parser moved out of the ASN.1 tool into `src/js/05-lib.js`, so the certificate reader and the ASN.1 tool share one implementation, and it is now in `dist/lib.js` where Node can test it.

### B21 — two science, one almanac (3)

- **Resistor Colour Code**, **Buffer pH** (Henderson–Hasselbalch, with the buffer-capacity warning), **Ekadashi List** — the eleventh tithi of each fortnight, found by walking the year a day at a time and asking which tithi the sunrise carries.

### B22 — three games (3)

- **2048**, **Minesweeper** (first click always safe), **Snake** (solid walls, no wrapping). Arrow keys, WASD or swipe; scores kept locally under two newly declared store keys.

### Fixed, found while building

- **A certificate's serial is not the first INTEGER in the file.** It is the first INTEGER that is a *direct child* of the TBS structure; taking the first anywhere finds the version number inside the `[0]` wrapper and prints "serial 0x02".
- **A Name is SEQUENCE of SET of SEQUENCE**, not a SEQUENCE of OID/value pairs. The first attempt found no subject at all.
- **The public key is one level down**, inside `subjectPublicKeyInfo`, not a direct child of the TBS structure — and its modulus carries a DER sign-padding byte, so a 2048-bit key reported as 2056 until the padding was stripped.
- **Ekadashi counted 44 days instead of 22**, because a tithi can last into a second sunrise and the dedupe compared against the previous *row* rather than measuring the run.

### Changed

- 412 tools across 27 categories (was 402).
- 164 checks (was 164 → 132 in the suite, 176 across all files).
- `test/fixture-cert.pem` is a real self-signed certificate, generated with openssl and committed, so the certificate reader is tested against something a browser would accept rather than a hand-made byte string.

## 2.5.0 — 2026-11-08

B18 and B19 from [BACKLOG-TOOLS.md](BACKLOG-TOOLS.md).

### B18 — derivation, ASN.1, three physics calculators (6)

- **PBKDF2 Derive** and **HKDF Derive** — the two key-derivation functions the app was missing, with the salt shown as bytes so the same one can be pasted back. The hint says which is for a password and which is for a key that already has entropy, because using the wrong one is the common mistake.
- **ASN.1 Parser** — DER in hex to a tree: SEQUENCE, INTEGER, OID, BIT STRING, the string types, and the time types. This is the tool that makes a certificate readable rather than trusted, and it is the first step towards the X.509 reader.
- **RC Time Constant**, **Lens Equation**, **Doppler Shift** — each checked by hand: 10 kΩ and 100 µF is 1 s; a 50 mm lens with the object at 500 mm puts the image at 55.6 mm and 0.11× inverted; 440 Hz approaching at 30 m/s reads 482 Hz.

### B19 — the almanac's missing two, and four accessibility previews (6)

- **Choghadiya** — the day cut into eight parts from sunrise and the night into eight from sunset, with the sequence chosen by weekday, which is why Tuesday and Friday are not the same table. Good and avoid parts are marked.
- **Moonrise & Moonset** — found by scanning the moon's altitude minute by minute and interpolating the crossing. The hint says plainly that it is good to a few minutes, not to the second.
- **Screen Reader Preview**, **Caption Length Checker**, **Colour-Blind Safe Pair**, **Reduced Motion Preview**.

### Fixed — the same bug as 2.4.0, one layer down

`TOOLS.clinical = []` was fixed last release, but twenty-three *other* category initialisers had the same shape. Adding a tool from a part that sorts earlier than its category's initialiser meant the category was emptied a moment later: the two new Almanac tools registered, then vanished, and the build stayed green because nothing asserted they existed. All 23 initialisers are now `TOOLS.x = TOOLS.x || []`, so load order cannot destroy a registration anywhere in the app.

Also: a test that named `files/zipcreate` as "the first tool in Files" broke when ZIP Extract was added ahead of it. The test now asks the registry which tool is first, because adding a tool to a category legitimately changes the order.

### Changed

- 402 tools across 27 categories (was 389).
- 164 checks (was 164).

## 2.4.0 — 2026-11-08

Three batches from [BACKLOG-TOOLS.md](BACKLOG-TOOLS.md), plus the clinical scores that were on the "deliberately not doing" list.

### B15 — the small ones (8)

IP Format Converter (dotted, integer, hex, octal, binary, class, RFC 1918) · Hash Identifier · UUID Analyser (version, variant, and whether it leaks a timestamp) · Cron Generator, which completes the Cron Parser · JWT Signer (HS256/384/512) · Set Operations (union, intersection, difference, symmetric difference, power set, Cartesian product) · Edit Distance (Levenshtein, with the operations shown) · Hamming Distance.

### B16 — the medium ones (4)

**Word-Level Diff** — line diff is the wrong grain for prose; one changed word marked the whole line. **Extract From Text** — URLs, emails, IPv4, MACs, domains and hashes out of a log dump. **ZIP Extract** — reads the central directory and inflates each entry with `DecompressionStream('deflate-raw')`, which is why this needed no library. **Tuner** — autocorrelation on the microphone, nearest note and cents off.

One deliberate deviation from "one tool per job": the extractors are one tool with checkboxes, because five tools with the same textarea and five different regexes would be five copies of one tool.

### B17 — clinical scores (8)

Glasgow Coma Scale · CURB-65 · qSOFA · Wells (DVT) · Wells (PE) · CHA₂DS₂-VASc · HAS-BLED · Child-Pugh.

These were under "deliberately not doing", with the reason: a score that drives a decision needs a clinician to own it. The owner of this app is a clinician, so the reason no longer holds. Each carries the same note in the same place — a published score, implemented as written, a prompt for judgement and not a substitute for it. The Wells DVT score is shown able to go negative, because it can, and that surprises people.

### Fixed

- **A category array could wipe tools registered by an earlier part.** `TOOLS.clinical = []` ran after the clinical scores had already registered, silently emptying the category. The initialisers are now `TOOLS.x = TOOLS.x || []`, so load order cannot destroy a registration.
- My own Hamming assertion said 9 bits when the characters differ in 9 bits — the arithmetic in the test was wrong twice before it was right.

### Changed

- 389 tools across 27 categories (was 370).
- 155 checks (was 155 → 121 in the suite, 155 across all files).

## 2.3.0 — 2026-11-08

Four projects were read for what they know that Kitbox did not: **CyberChef** (Apache-2.0), **it-tools** (GPL-3.0), **localpdfmerger** (Apache-2.0) and **compressorjs** (MIT). Fourteen tools came out of it.

### Licensing, stated plainly

No code was copied. it-tools is **GPL-3.0**, which cannot be relicensed into this project at all; CyberChef and localpdfmerger are Apache-2.0 and compressorjs is MIT, which would each require attribution of copied source. What travels freely between projects is the *idea* — "a chmod calculator", "XOR brute force", "Shannon entropy" — so each tool here is written from the definition, and the test suite checks it against a published value rather than against their output.

### Added — from it-tools

- **chmod Calculator** — octal ↔ symbolic, both directions, with setuid/setgid/sticky named.
- **Basic Auth Header** — and a sentence saying it is encoding, not encryption.
- **MAC Address Generator** — locally administered addresses only, because a test fixture with a real vendor prefix is how you end up impersonating one.
- **IPv4 Range Expander** — accepts `a - b` or CIDR; answers "same /24?" which is what a firewall rule actually asks. The Subnet Calculator stays the other half.
- **Meta Tag Generator** — the tags that make a link unfurl, with `og:image` named as the one that matters.
- **SQL Prettifier** — a formatter, not a parser, and it says so.
- **TOTP Generator** — RFC 6238, HMAC-SHA1, six or eight digits, with a countdown. Checked against a server, not used as your authenticator.
- **RSA Key Pair** — RSASSA-PKCS1-v1_5, SPKI and PKCS#8 in PEM, generated in the page and never stored.

### Added — from CyberChef

- **XOR Cipher** with single-byte brute force, ranked by how much each result looks like English.
- **Vigenère Cipher** — verified against the textbook vector: ATTACKATDAWN with LEMON is LXFOPVEFRNHR.
- **Shannon Entropy** — bits per byte and in total, with a plain reading of the number.
- **Ascii85** — encode and decode, including the `<~ ~>` form, and `z` for four zero bytes.

### Added — from it-tools and CyberChef together

- **Unicode Escapes** — `\uXXXX` (with surrogate pairs), `\xXX`, HTML entities, and one button that unescapes all three.

### Added — from it-tools, in Generator

- **SVG Placeholder** — a placeholder that weighs bytes instead of megabytes.

### Not taken

- **PDF merging** (`localpdfmerger`). It depends on pdf-lib; a hand-written merger is several hundred lines of object-stream parsing and would be the least-tested code in the app. The honest options are "ship a dependency" or "do not ship it", and the first rule of this project is no dependencies.
- **bcrypt, BIP39, IPFS-style safelinks** — each needs a table or a cipher implementation that is not worth the bytes.
- **`compressorjs`'s compression loop** — Kitbox already compresses with canvas; the useful part was the reminder that EXIF orientation matters, which the image tools already handle through the metadata strip.

### Changed

- 370 tools across 27 categories (was 356).
- 151 checks (was 146), including five new assertions each verified against a published value.

### Fixed

- **Pinned codes were applied too early.** The pinning loop lived in the core part, so a tool registered in any later part got the counter's code instead of its pinned one. It now runs at the end of the load, and the check that compares `codes.json` with the app catches it if it ever moves again.

## 2.2.0 — 2026-11-08

Batch **B14** of [PLAN.md](PLAN.md): packaging.

### Added

- **A portable EXE and an Android APK**, built by `drsamonline/app-builder`. `.github/workflows/build-apps.yml` *calls* the kit's reusable workflow rather than copying it — a copy cannot receive a fix, and the kit's own notes record what happened when 28 repos carried a drifted copy. Binaries land on the rolling `app-latest` release; the versioned releases stay as they were.
- **`app/`** — the folder the kit copies into the EXE and the APK: `index.html` (a byte-identical copy of `kitbox.html`, written by `tools/build.py` and verified by `--check`), `manifest.webmanifest` and `icon.svg`.
- **IndexedDB for the one collection that grows.** Notepad notes now go through `bigStore`, which uses IndexedDB when the browser has it and falls back to localStorage when it does not. The synchronous copy is still read first so the list paints immediately; the async read replaces it a tick later and doubles as the migration.

### Changed

- 151 checks (was 146).
- `python3 tools/build.py --check` now verifies two files, not one.

### Notes

- **The packaging workflow ran on this push: the Windows EXE and the Linux portable binary built successfully; the Android APK failed inside `app-builder`'s Gradle project with a Java compilation error** (the kit's own CI does not build the APK, so nothing there catches it). The rolling release was skipped rather than published half-built. Details and the job-by-job result are in `AUDIT.md`.
- Notes moved out of localStorage, so the backup tool's `notepad-notes` key is now a migration source rather than the live copy. `bigStore.remove` keeps them in step.
- The APK is a WebView wrapper of the same file; the EXE is a Python launcher that serves the folder on 127.0.0.1 and opens a browser. Neither adds a network call.

## 2.1.0 — 2026-11-08

Batch **B13** of [PLAN.md](PLAN.md): four categories that were missing. Internationalisation was dropped by decision, not deferred.

### Added — Accessibility (5)

Reading Ruler · Dyslexia-Friendly Preview · Text Spacing Checker · Alt Text Checker · Focus Ring Preview. Each answers a question someone actually asks: does my text survive WCAG 1.4.12 spacing, does this alt text say anything, is my focus ring 2 px and 3:1.

### Added — Education (4)

Multiplication Table · Times Table Quiz · Unit Circle · Formula Sheet.

### Added — Clinical (4)

Paediatric Dose · IV Drip Rate · eGFR (CKD-EPI 2021) · Corrected Calcium & Anion Gap. **Every one carries a disclaimer and always will**: a calculator is not a clinician, and the numbers depend on assumptions a patient may not fit.

### Added — Money, India (4)

HRA Exemption · EPF Corpus · Gratuity · PPF / FD Maturity — in the rules an Indian salary actually follows (15/26 gratuity, 3.67% to EPF and 8.33% to EPS, metro HRA at 50%).

### Changed

- 356 tools across 27 categories (was 339 in 23).
- Installability without a second file: `apple-mobile-web-app-*` tags, an inline SVG touch icon, and a `data:` manifest. iOS honours these; Chrome requires a same-origin manifest, which one file cannot provide, so it offers install from its own menu instead. Recorded rather than pretended.
- The interaction sweep now drives 317 tools (was 301) — the 16 new ones with inputs all survive being typed into.

### Dropped

- **Internationalisation (E-100 … E-104).** The interface is English-only, by decision. Each language is a dictionary to maintain, re-check on every release and re-test in the layout, and a half-translated interface is worse than none. The tools themselves still accept and display any script you paste into them.

## 2.0.0 — 2026-11-08

Batch **B12** of [PLAN.md](PLAN.md): architecture. The app still ships as one file; it is no longer *edited* as one file.

### Changed — the file is now built

- **`src/` is the source.** Sixteen parts under `src/js/`, in filename order, concatenated into `src/index.template.html` by `python3 tools/build.py`. CI fails if the committed `kitbox.html` differs from what the source produces, so the file that ships is always the file the source describes.
- **The split was proven before it was trusted.** `tools/split-once.py` cut the original 12,459-line file at section boundaries, and `build(split(x))` was checked to be **byte-identical** to `x`. Only then did anything else change.
- **One registration path.** `register()` in the core is now the only place a tool becomes a tool: it assigns the code, validates the id, and attaches the metadata. The 21 helper functions (`txt`, `gen`, `calc` …) are six-line adapters over it — kept because they read well at 339 call sites, but there is one implementation.
- **Metadata lives on the tool.** `since`, `tags`, `keywords` and `requires` are fields of the registered object rather than three side maps consulted at render time. `since` is derived from the 1.1.0 list, `keywords` and `requires` fall back to the maps until they are inlined.

### Added

- **A library that can be tested without a browser.** `node tools/build-lib.js` lifts 22 pure declarations out of the built app with **acorn** and writes `dist/lib.js`. `node test/lib.js` then runs 23 assertions against it in Node, in about 200 ms.
- **ESLint over the concatenated script** — 0 errors, 0 warnings. It found six genuinely dead variables (`nums`, `score`, `re`, `guessedWord`, `rise`, an uncalled `today()`), all removed.
- **`tsc --checkJs`** over `dist/lib.js`, clean, with a `tsconfig.json` that says why the app's other 12,000 lines are not typechecked.

### Fixed — found by the new unit tests

- **Base58 round-tripped the empty string into two zero bytes.** `fromBase58` seeded its accumulator with `[0]` and `toBase58` emitted `"1"` for no input, so encode-then-decode invented data. Both fixed, with the empty case now in the test.
- **The Meeus 47.a assertion in my own test used the wrong Julian day** (2448908.5, an October date, for an April example). The code was right; the test was wrong.

### Not done, and why

- **A page per category (E-116) and per-category generated docs (E-87)** are deferred. `ALL_TOOLS.md` is already generated from the registry, and the landing page already lists every category with live counts; a third surface would need its own freshness check for little gain.
- **Typechecking the app itself** would need JSDoc on 12,000 lines. The library is where types pay for themselves; the UI is DOM glue that a type checker mostly restates.

## 1.7.1 — 2026-11-08

Batch **B11** of [PLAN.md](PLAN.md): distribution. Nothing in the app changed except the version string.

### Added

- **A release per tag.** Pushing `v1.7.1` builds the artefacts, refuses to publish if the tag and `APP_VERSION` disagree, and attaches `kitbox.html`, the gzipped copy, the minified copy and its gzipped copy, the landing page, and `SHA256SUMS`. Release notes are lifted from this file.
- **`/latest/`** — a fixed URL that always serves the current build, so a bookmark or a printed QR code keeps working across releases.
- **A minified copy** (`dist/kitbox.min.html`) built by removing comments with **acorn's** comment ranges, then verified by running the app's own checks against the artefact: all 339 tools render, search ranks, a calculation gives the same answer, the support page keeps its details.

### Measured, so the claim is honest

| | Raw | Gzipped |
|:--|--:|--:|
| `kitbox.html` | 711 KB | 195 KB |
| `kitbox.min.html` | 689 KB | 186 KB |

Removing 268 comments saves **3% raw, 4% gzipped**. Real minification — whitespace, identifier mangling — needs a parser that understands template literals well enough to rewrite them, which is what the B12 source split exists to enable. Recorded rather than pretended.

### Changed

- The support button's "Books" link and the release notes both come from one place now, so a release cannot describe a different build than it ships.

## 1.7.0 — 2026-11-08

Batch **B10** of [PLAN.md](PLAN.md): testing depth — the last batch before the cut line.

### Added

- **An interaction sweep**: every tool is rendered, its first field is filled with a value appropriate to the field, and the tool must survive the input without throwing or emptying itself. **301 of 339 tools driven; 0 failures.** The other 38 have no input to drive — reference tables, games with buttons, tools that only read files.
- **Fixtures for fifteen calculators** in `test/fixtures.json`, each with an expected value that can be checked by hand: 100 → 125 is +25.00%, 18% of ₹10,000 is ₹1,800, 22.4 L at STP is one mole, MD5('abc') is the published vector, 440 Hz is A4. A fixture may only be added when the arithmetic is verified, never to make a red test green.
- **Round-trip tests** through the real UI: base64, base32 and base58 encode → decode returns the original string.
- **Real files through the real handlers**: two `File` objects into the ZIP tool (the archive is captured and its header, names and contents checked), a PNG header into the file type detector, a CSV into the viewer.
- **A landing-page link test**: every file, tool link, category link, the stated counts and the support details are checked against the app's registry.

### Changed

- The badge row now reads **118 checks** rather than "tests", because it counts every assertion across all six test files rather than the smoke suite alone.
- CI runs five test commands: the suite, axe, fuzz, interaction, and deep/links.

## 1.6.2 — 2026-11-08

Batch **B9** of [PLAN.md](PLAN.md): performance — measured in a browser this time, not in jsdom.

### Added

- **`?bench=1`** renders all 339 tools into a detached container and reports the time, cold and warm, with a median of three renders each. In Chromium: **331 ms cold, ~180 ms warm, 0.53 ms mean per tool**. The jsdom figure the roadmap was written from was 5.2 s — thirteen times worse, and it was measuring the harness, not the app.
- **`tools/dist.py`** builds `dist/kitbox.html.gz` (711 KB → 195 KB, 27%), the same for the landing page, and a `SHA256SUMS` file. CI uploads them as an artefact on every push until B11 gives them a release.

### Changed

- **The timezone converter no longer builds 400+ `<option>` elements.** It was the slowest thing in the app at 80.8 ms — a fifth of the total render time — and most of that was `Intl.supportedValuesOf` building the IANA list on first use, with the DOM cost on top. It now has a filter field and shows the first 80 matches, keeping whatever is currently selected even when the filter excludes it. Warm render: **2.4–3.7 ms**.
- The world clock's add-a-city list got the same treatment.
- Two literals that only one tool needs (`WORDLE_WORDS`, `ASCII_FONT`) moved out of the top-level scope into the tools that use them.
- 103 tests (was 99).

### Not done, and why

- **Virtualising long tables** was conditional on the bench saying it was needed. The largest table in the app is the ASCII table at 129 rows, then the periodic table at 73 and the dial codes at 69. Nothing is near the 500-row threshold, so there is nothing to virtualise. Recorded rather than invented.

## 1.6.1 — 2026-11-08

Batch **B8** of [PLAN.md](PLAN.md): security hardening.

### Added

- **A Content-Security-Policy** in the page: `default-src 'none'`, no `connect-src`, no frames, no forms, images and media only from `data:` and `blob:` URIs the app made itself. Inline script and style stay allowed because the app *is* the inline script. A network call added by a future commit would now be blocked by the browser as well as by CI.
- **A fuzz pass over every text field**: 169 fields across 339 tools, eight markup payloads each, asserting that nothing creates a script, an iframe, an `on*` handler, a `javascript:` URL, or a window flag. It runs in CI.
- **The EXIF `Orientation` tag survives a metadata strip.** Dropping the whole APP1 block used to leave a portrait phone photo sideways, because the pixels were always sideways and the tag was the only thing saying so. The strip now rebuilds a 34-byte EXIF block containing that one tag.

### Changed

- The Encrypt tool says plainly that buffers are zeroed after use but a browser cannot guarantee a copy is not still in memory — encrypt at rest, not instead of a locked screen.
- `SECURITY.md` gained a "what the browser enforces" section.
- 99 tests (was 97), plus the fuzz pass as its own CI step.

## 1.6.0 — 2026-11-08

Batch **B7** of [PLAN.md](PLAN.md): storage you can trust.

### Added

- **A declared key registry.** Every key the app writes is now declared in `STORE_KEYS` with a label and the tool that owns it. The backup tool builds its list from that instead of a hand-typed allow-list — which is exactly what silently dropped the pinned and recent keys in 1.0.0. A test now walks every `store.set('…')` in the source and fails on any key that is not declared.
- **Schema versioning with migrations.** `STORE_SCHEMA` is 2, and `migrateStore()` runs at startup, one step at a time, writing the version only after each step succeeds — a half-migrated store is worse than an old one. Migration 2 repairs habits with no `log` array and decks with no id.
- **A backup that says what it is**: `{app, version, schema, exportedAt, data}`, and the restore reports which version the file came from and how many keys it had to skip.
- **Encrypted backups** — AES-256-GCM with a PBKDF2 key, the same envelope as the file encryption tool, saved as `.kbx` and reopened from the same picker.
- **Per-key erase** and **per-key size** in the backup table, plus a total.
- **Quota handling.** `store.set` used to swallow a failed write silently, so a full disk looked like a successful save. It now reports once, names the likely cause, and logs it.

### Changed

- 97 tests (was 87).

## 1.5.1 — 2026-11-08

Batch **B6** of [PLAN.md](PLAN.md): preferences and permalinks.

### Added

- **A number-format preference** — Indian grouping (`₹1,00,000`) or international (`₹100,000`), in About → Display. All 31 formatting call sites now ask one helper instead of hard-coding `en-IN`, so no tool can disagree with another.
- **A units preference** — metric or imperial. It sets which unit a converter opens on (length → feet, mass → pounds, volume → gallons, temperature → Fahrenheit) rather than converting anything behind your back.
- **Copy link** on every tool page: a URL that carries the scalar inputs, so a calculation can be sent to someone. Fields over 200 characters are left out — a permalink with an essay in it is not a link anybody should paste into a chat. Following the link fills the fields and recomputes.

### Changed

- **Reset now clears the converter's remembered unit pair** as well as the session's inputs. Without that, the units preference could never take effect on a converter you had already used — the stored pair won, correctly, forever.
- 87 tests (was 82).
- The CI size budget was raised from 680 KB to 760 KB deliberately, with the reason in the workflow.

## 1.5.0 — 2026-11-08

Batch **B5** of [PLAN.md](PLAN.md): the consistency sweep. Ten decisions made the same way 339 times — implemented once in the shell, not edited into 339 tools.

### Added

- **A tool remembers what you typed.** Leave a calculator to check something, come back, and your numbers are still there — and it recomputes rather than showing a stale answer, because the restore dispatches `input` and `change` the way a keystroke would.
- **Reset** on every tool page, which forgets the memory and starts again.
- **"Try an example"** on 26 tools that have a good worked example — the fields fill with a plausible case, so a tool teaches itself. The example is opt-in per tool and the test suite checks that every example points at a field that actually exists.
- **Every disabled button now says why**, in a `title` and `aria-disabled`, including the prev/next arrows at the ends of a category.
- **Drag and drop** works on every file input.
- **A paste chip** appears over any empty text field, because the clipboard is how text usually arrives and a phone's long-press menu is a lottery.
- **Double-click a table to copy it as CSV** — quoted, one row per line — rather than copying the text it happens to display.
- **An empty result says what to do** ("Fill in the fields above to see a result") instead of showing a bare dash.
- **`data-unit` support** on number inputs, so a field can carry its unit as a placeholder.

### Changed

- 82 tests (was 70). New: state memory and recompute, reset, the example button, example integrity, disabled explanations, drop zones, the empty-result hint, the paste chip, and CSV from a table.

### Notes

- Two of the ten items were already true and are now documented as convention rather than rebuilt: standard error wording (B4's `readFileSafely` and `CRYPTO_MSG` cover the real cases) and unit suffixes in labels (most tools already carry them; `data-unit` exists for the rest).

## 1.4.0 — 2026-11-08

Batch **B4** of [PLAN.md](PLAN.md): the stability spine. The hinge batch — everything after it assumes these are true.

### Added

- **Pinned tool codes.** Codes came from a counter at registration, so inserting a tool in the middle of a category renumbered everything after it — and the code is what a user quotes in a bug report. `codes.json` records the code each tool was first given, the app embeds that map, and `tools/gen-codes.js` assigns codes for new tools and refuses to let an existing one change. 339 codes pinned.
- **Stable ids with an alias map.** A pin or a bookmark stores `cat/id`. `ID_ALIASES` maps a retired id to its replacement and `renderTool` resolves it before looking anything up, so a rename no longer breaks a link. `ids.json` keeps every id that has ever existed; the check fails if one disappears without an alias.
- **An error boundary.** A tool that throws now costs you that tool, not the page: you get a panel with the message, a copy button and two ways out. Before this, a throw during `render()` left a blank panel with no explanation.
- **A local error log** — the last twenty errors, on the device, newest first, in **System → Error Log**, with copy and clear. `window.onerror` and `unhandledrejection` feed it too. Nothing is reported anywhere.
- **Capability chips.** Fourteen tools declare what they need — camera, microphone, location, motion, Web Audio, speech synthesis, a secure context — and the tool page shows a chip when this machine cannot provide it, before you tap it.
- **`cryptoAvailable()` and `readFileSafely()`** — one place decides whether Web Crypto is usable, and a failed file read now says which file and what to do instead of surfacing a DOM exception.

### Changed

- 70 tests (was 63). New: pinned codes, capability chip, alias resolution, the error boundary, the log, and a **timer-leak sweep** that mounts every tool, runs cleanup, and fails if anything is still running.

### Fixed

- The four file tools and the two crypto tools disagreed about how to check for Web Crypto; they now all ask the same helper.

## 1.3.0 — 2026-11-08

Batch **B3** of [PLAN.md](PLAN.md): findability. Nine items, all in the search index and the category page.

### Added

- **Keyword aliases.** A tool's name is what it was called; a keyword list is what people call it. `emi` finds the EMI calculator, `checksum` finds hashing, `tithi` finds the almanac, `wpm` finds the typing test. About ninety tools now carry keywords — the vocabulary of the problem, not of the implementation.
- **A filter box on any category with more than eight tools.** Calculation has 51; typing three letters beats scanning four screens.
- **Previous and next arrows** on a tool page, so a category can be walked without going back to the grid.
- **A "new" chip** on the 58 tools that arrived in 1.1.0, so a returning user can see what changed.
- **Recent searches** in the empty palette, remembered locally, clickable to re-run.
- **`⌘1`–`⌘9`** opens the nth result; **`g` then `h` / `a` / `s` / `t`** goes home, to the A–Z list, to Support, to About.

### Changed

- **Ranking.** A keyword hit now scores between a name match and a substring match, and a pin adds 8 to the score — enough to break a tie, not enough to overturn a better name match. That is deliberate: `hash` should still find *Hash Generator* first even if you pinned MD5.
- 63 tests (was 51).

### Notes

- Searching by group label (`remove`, `analysis`, `time`) already worked, because the group was in the index. It now has a test so it keeps working.

## 1.2.1 — 2026-11-08

Batch **B2** of [PLAN.md](PLAN.md): contrast and accessibility. Nine items, and the app is measurably better for each.

### Fixed — contrast

- **Fourteen of 23 category tiles failed WCAG AA with white text.** White on `#22D9D9` was 1.75:1 against a 4.5:1 threshold. The tile text colour is now chosen at render time from the measured ratio — `inkFor()` picks white or ink per colour — so no tile can regress, including ones added later. Worst tile after the change: **4.51:1**.
- **Two colours failed with dark ink as well**, so they were adjusted rather than re-texted: General `#E31C7D` → `#C2185B` (5.87:1 with white), Files & Data `#4C6EF5` → `#3B5BDB` (5.67:1). The support accent, the heart icon and the landing page's "Support this" button used the same pink and moved with it.

### Fixed — accessibility

- **Every form label is now associated with its control.** `axe-core` found exactly one violation across 50 pages: the `.field` labels were siblings of their inputs rather than linked to them. Rather than edit several hundred inputs, `associateLabels()` runs after each tool renders and sets `for`/`id`. New tools are correct without anyone remembering.
- **Two more, found on the second sweep**: the colour picker's swatch had no accessible name, and Tic-Tac-Toe's nine cells were unnamed buttons. Both fixed at the source.
- **Sketch Pad has a keyboard path** — the only tool in the app that had none. The canvas is focusable, arrow keys move a cursor (Shift for bigger steps), Space or Enter stamps the current tool.
- **Landmarks**: `<header>`, `<main id="app">`, and a `<nav aria-label="App pages">` around the page buttons.
- **`prefers-contrast: more`** raises the muted greys and strengthens output borders.
- **Text size** — 100 / 112 / 125% in About → Display, remembered per device. There are no translucent surfaces in the app, so `prefers-reduced-transparency` has nothing to do; recorded rather than ignored.

### Added

- **`test/axe.js`** and `npm run a11y` — 50 pages (home, all, about, support, 23 categories, 23 tool pages) with zero violations allowed. Wired into CI.
- **A duplicate-declaration check** in the suite, after a real bug: our `relLuminance(hex)` was silently replaced by the Color Picker's own `relLuminance(r,g,b)` — a later top-level function wins. The check now fails on any duplicate.

### Changed

- 51 tests (was 42).

## 1.2.0 — 2026-11-08

Batch **B1** of [PLAN.md](PLAN.md): eighteen quick wins, all in the shell. No tool changed what it does; the app around them got out of the way.

### Added

- **Double-click any result to copy it.** Delegated on the document, so it survives the re-render most tools do on every keystroke — attaching a button to each `.output` would have vanished the moment the tool redrew. A transient toast confirms it.
- **A not-found page** with a search box. An unknown hash used to bounce to the home screen through two redirects, which reads as a broken link; now it says "Nothing here" and offers a way out.
- **`?q=` deep link** — `kitbox.html?q=hash` opens the palette pre-filled, so a search is a shareable link.
- **Skip link** as the first element in the body, **`<noscript>`** that explains itself, **`aria-live`** on the tool root, and a **live result count** in the palette.
- **Print stylesheet** — chrome, search and the pin button are hidden; results print white on white.
- **First-run hint** for `Ctrl K`, shown once and dismissed for good.
- **File-size guards** at 200 MB (100 MB for encryption) with a sentence instead of a frozen tab.
- **Passphrase strength** in Encrypt/Decrypt and Sealed Note — the only password fields in the app with no feedback at all.
- **Open Graph and Twitter card** on the landing page, so a shared link produces a preview.

### Changed

- **Breadcrumb on a tool page is a link** back to its category.
- **Scroll position is remembered per page**, so going into a tool and back no longer dumps you at the top of a 51-tile grid.
- **Focus moves to the page heading** on navigation, for screen readers. Not on first paint, where stealing focus would be rude.
- **Category tiles carry a `title`**, so a clipped name can be read.

### Fixed

- An unknown tool id no longer redirects twice and lands on the home page — it renders the not-found panel directly.

### Tests

27 → 42. New: the `<noscript>`, the skip link, the 404 panel, the breadcrumb link, the live region, double-click copy, tile titles, the first-run hint appearing and staying dismissed, the palette count, passphrase strength, the size guards, and `?q=` opening the palette in a second window.

## 1.1.2 — 2026-11-08

Batch **B0** of [PLAN.md](PLAN.md). Documentation and CI only — the app and the landing page are unchanged.

### Added

- **`ALL_TOOLS.md`** — every tool with its code and `category/id`, generated from the registry by `tools/gen-all-tools.js`. CI fails if it drifts.
- **`CONTRIBUTING.md`, `SECURITY.md`, `PRIVACY.md`, `USAGE.md`** — the five rules a contribution must keep, an honest threat model (including what a single file cannot protect against), what is stored and where, and how to actually use the thing.
- **`docs/` is now a small site**: `docs/index.html`, `changelog.html`, `roadmap.html` and `plan.html`, rendered from the markdown by `tools/build-docs.py` so the two audiences — GitHub and Pages — read one source.
- **`tools/build-landing.py`** — the landing page generator, now in the repository instead of a scratch folder. It lifts the stylesheet out of `kitbox.html` and reads the category grid out of the registry, so the landing page cannot advertise a tool count the app does not have.
- **`tools/check-manifest.py`** — verifies every tracked file against `MANIFEST.json`, and rewrites it with `--write`.
- **Issue template** that asks for System → Device info, and a contact link to `AUDIT.md` for "a tool gave a wrong number".

### Changed

- CI went from three steps to seventeen: the test suite, badges, `ALL_TOOLS.md`, the landing page, `docs/`, the manifest, the plan coverage, no external resources, no network calls, no `eval`/`new Function`/`document.write`/`javascript:` URLs, and a 680 KB size budget.
- `npm run check` runs the whole local set in one command.

## Unreleased

### Added

- **`PLAN.md`** — the 119 roadmap items grouped into 15 shippable batches, quick wins first and structural work last, with dependencies, effort, a "done when" per batch, and the cut line at batch ten. `tools/check-plan.py` asserts every item is scheduled exactly once and runs in CI.

- **`ROADMAP.md`** — an exhaustive, numbered backlog (E-01 … E-119): quick wins, accessibility, search, tool consistency, storage, reliability, performance, security, architecture, testing, i18n, new tools and categories, distribution, documentation, and a "deliberately not doing" table with the reason for each refusal. Three findings are measured rather than asserted: 14 of 23 category tiles fail WCAG AA with white text, tool codes are positional and renumber when a tool is inserted, and pinned tools break silently if an id is renamed.

## 1.1.1 — 2026-11-08

Documentation only. The app and the landing page are byte-identical to 1.1.0.

### Added

- **A README that shows the thing.** A generated banner, eight local SVG badges, five screenshots (home, a tool page, a category, mobile, the landing page), and a category table with an icon per row.
- **`tools/badges.py`** draws the badges and banner as local SVG — no badge service, because an offline-first app that needs the network to say "no network" has broken its own rule.
- **`tools/shots.py`** takes the screenshots with headless Chromium, pinned to `Asia/Kolkata` so time-bearing shots show Indian times.
- **`tools/check-badges.js`** fails the build if a badge number drifts from the app. Wired into CI as its own step.
- `npm run badges` and `npm run shots` as shortcuts.

### Fixed

- The size badge first claimed **638 KB** — that was the file in thousands, not KiB. It now reads the real size at build time (623 KB) instead of a number typed by hand.

## 1.1.0 — 2026-11-08

The breadth pass: 59 more small, fast tools, two new categories, a landing page, and a Support page in both. Every addition is a separate tool — nothing was merged into an existing one.

### Added — Reference (new category, 5 tools)

ASCII Table, Big-O Cheatsheet, Regex Cheatsheet, Country Dial Codes, Keyboard Shortcuts. Static tables and cheat sheets: open, read, copy a pattern, close.

### Added — System (new category, 3 tools)

Device & Screen Info, Browser Feature Check, Local Storage Usage. What this browser can actually do, and what Kitbox has written to it.

### Added — across the existing categories (51 tools)

- **General:** Speak Text (system voices, no network), Big Clock.
- **Text:** Remove Accents, Smart Quotes Fixer, Word Frequency, Hard Wrap at Width, Invisible Character Detector.
- **Generator:** Passphrase Generator, Username Generator.
- **Calculation:** Date Difference, Percentage Change, Sleep Cycle Calculator, Rounding.
- **Unit:** Paper Sizes, Shoe Size.
- **Finance:** Simple Interest, SIP Calculator, GST Split.
- **Randomizer:** Team Shuffler, Magic 8-Ball.
- **Health:** Heart Rate Zones, Pregnancy Due Date.
- **Development:** JSON → TypeScript, Query String Parser, Cron Next Runs, SQL IN List Builder.
- **Colours:** Colour Harmony, Tints & Shades, Random Colour.
- **Science:** Ideal Gas Law, Projectile Range, Molarity & Dilution.
- **Geo:** Antipode Finder, Bearing → Cardinal, Coordinate Rounder.
- **Audio:** Tap Tempo, Frequency → Note.
- **Games:** Reaction Time Test, Typing Speed.
- **Travel:** Flight Carbon.
- **Nature:** Golden & Blue Hour, Day Length Calendar.
- **Productivity:** Checklist, Meeting Cost.
- **Files & Data:** File Type Detector, Base64 → File.
- **Almanac:** Planetary Hours, Tithi Calendar.
- **Communication:** SMS Character Counter, Phone Number Formatter.

### Added — Support

- A **Support page** inside the app (`#/support`, heart in the top bar, link in the footer) with the UPI id, an inline scannable UPI QR, Ko-fi, PayPal, the book store, the app index and email.
- A **landing page** (`index.html`) in the app's own theme, reusing the app's stylesheet so the two cannot drift, with the category grid generated from the live registry and the same support block.

### Improved — existing tools

- **Notepad** gained a search field, so a hundred notes are usable.
- **Unit Converter** remembers the last from/to pair per converter instead of resetting to the first two units.
- **World Clock** marks a city as tomorrow or yesterday when its date differs from yours.

### Changed

- The app moved to `kitbox.html`; `index.html` is now the landing page.
- The external-resource test now distinguishes a loaded resource from an outbound link: the app loads nothing, and the only outbound links are the support ones a person chooses to click.

## 1.0.0 — 2026-11-08

The merged build: the original 239-tool file, plus 41 tools folded in from the rest of the drsamonline projects, plus the shell work that makes 280 tools navigable.

### Added — Files & Data (new category, 10 tools)

- **ZIP Creator** — store-only archives written byte by byte; local headers, central directory, CRC32, EOCD. Validated against Python's `zipfile`.
- **GZIP Compress / Decompress** — over the platform's Compression Streams, no library.
- **File Hash & Checksum** — SHA-1/256/384/512 and CRC32, with an optional compare field.
- **Encrypt / Decrypt a File** — AES-256-GCM with a PBKDF2-SHA256 key (250,000 iterations) in a self-describing `.kbx` container.
- **Sealed Note** — encrypt a note into a block of text, open it once.
- **CSV ↔ JSON** — quoted fields, embedded commas, doubled quotes, optional type casting.
- **CSV Viewer** — sortable table with row and column counts.
- **Photo Metadata & GPS** — read EXIF tags and GPS coordinates, then download a copy with the metadata removed.
- **Image → Base64** — data URI, with a copy-as-CSS option.
- **Line Ending Converter** — detect and convert LF, CRLF and CR.

### Added — Almanac (new category, 3 tools)

- **Panchang** — tithi, nakshatra, yoga, karana, paksha, moon phase, sunrise, sunset, ayanamsa.
- **Rahu Kaal & Muhurat** — the eighth daylight segment and the Abhijit muhurat for your coordinates.
- **Sun & Moon Times** — sunrise, solar noon, sunset, day length, moon phase and sidereal position.

### Added — Communication (new category, 3 tools)

- **vCard Generator**, **Calendar Invite** (.ics), **Message Link Builder** (WhatsApp, SMS, Telegram, mailto).

### Added — existing categories (25 tools)

- **Development:** ULID & NanoID, Base32/Base58, HMAC, MD5, CIDR/Subnet, MIME lookup, Markdown preview, INI/.env/TOML parser, .gitignore generator.
- **Calculation:** Statistics, Correlation & Regression, Scientific notation & significant figures, Fuel economy & trip cost, Electricity cost, Markup/margin/break-even.
- **Finance:** Savings Goal, Debt Payoff Planner (snowball vs avalanche, side by side).
- **Health:** TDEE, Macros & Body Fat.
- **Text:** Keywords & Text Similarity (tf-idf), Readability & Reading Time.
- **Colours:** WCAG Contrast Checker, Colour Blindness Simulator, Palette from Image.
- **Randomizer:** Random from List, PIN Generator.

### Added — shell

- **Command palette** — `Ctrl K` / `⌘ K`, or `/`, searches all 280 tools with ranked matching and an ordered-letters fallback.
- **Home search field** with the same ranking, replacing the category grid while you type.
- **Pinned tools** — star any tool; pinned and recent tools appear on the home screen.
- **All tools A–Z** page with a live filter.
- **Escape** closes the palette, then steps back a page.
- Document metadata: description, theme colour, colour scheme, inline SVG favicon.

### Fixed

- Duplicate tool name "Multiple Numbers Generator" — the randomizer version is now **Lottery Number Picker**.
- **Text Decoration** interpolated user text into `innerHTML` unescaped, so pasted markup executed. Now escaped.
- Astronomy port tested `instanceof Date`, which returns `NaN` for dates from another realm. Now duck-typed.
- Stale tool counts removed from the section comments.
- Category and tool cards had no accessible name; the pin button had no pressed state. Both added.
- `prefers-reduced-motion` is now honoured.

### Changed

- About page documents where the new tools came from and what is stored locally.
- Category descriptions and counts regenerated from the live registry.

## 0.x — before this build

The original single-file toolbox: 239 tools across 18 categories, all local, no dependencies. Its history predates this repository.
