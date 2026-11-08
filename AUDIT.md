# Audit — Kitbox 1.0.0

What was checked before this build was published, what was found, what was fixed, and what is still known to be imperfect. Every claim here is backed by a command in `test/smoke.js` or by a measurement recorded below.

## Scope

The incoming `kitbox.html` (375,473 bytes, 239 tools, 18 categories) was read line by line, then the merged build (510,913 bytes, 280 tools, 21 categories) was tested the same way. Both figures are measured, not estimated.

## Checks run

| Check | Method | Result |
|---|---|---|
| JavaScript parses | `node --check` on the extracted `<script>` | pass |
| Every tool renders | jsdom, each `render()` called once in a fresh container | 280/280 |
| Tool ids unique per category | set comparison | pass |
| Tool names unique across the app | frequency count | pass (after one fix) |
| Every route resolves | `#/`, `#/all`, `#/about`, 21 categories, 21 tool pages | 45/45 |
| No external assets | regex over every `src`/`href` for `http:` | pass |
| No network APIs | regex for `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource` | 0 hits |
| No debug output | regex for `console.log` | 0 hits |
| Ported astronomy | Meeus 25.b and 47.a reference longitudes; Delhi midsummer sunrise/sunset | within tolerance |
| Ported crypto and encodings | MD5 test vectors, CRC32 check value, base32/base58 round trips | pass |
| ZIP output is a real ZIP | written to disk and opened with Python's `zipfile`; `testzip()` clean, contents byte-identical | pass |
| User text is not markup | inject `<img onerror>` into text tools | escaped, no element created |

## Findings and fixes

**1. Duplicate tool name.** "Multiple Numbers Generator" existed twice — `generator/multinumgen` and `random/multinumgen2` — so search returned two identical-looking results with no way to tell them apart. The randomizer version is a lottery-style picker (unique draw from a range) while the generator version is not. *Fixed* by renaming the randomizer one to **Lottery Number Picker**. No functionality was removed.

**2. Unescaped user text in Text Decoration.** `txt('Stylish Tools','textdecoration')` interpolated the user's text straight into `innerHTML`:

```js
box.innerHTML = templates.map(t=>`…>${t.replace('{t}',s)}</div>`)
```

Pasting `<img src=x onerror=…>` executed script in the page. Every other persistence-and-display tool in the file already used `escapeHtml`, so this was the one gap. *Fixed* by escaping the rendered copy while keeping the raw value in `data-copy` (which is `encodeURIComponent`-encoded and only ever read back as text).

**3. Stale counts in section comments.** Comments claimed "GENERAL TOOLS — 12 tools" and similar; the real counts had drifted to 13, 33, 30 and so on. A reader using them to check the registry would be misled. *Fixed* by removing the numbers from the comments, so they cannot go stale again.

**4. Cross-realm date handling in the astronomy port.** `ASTRO.jd()` tested `when instanceof Date`. A `Date` created in another realm (an iframe, a worker, a test harness) fails that test and silently produced `NaN` for sunrise. *Fixed* by duck-typing on `getUTCFullYear` instead.

**5. Missing document metadata.** The file had no `description`, `theme-color`, `color-scheme` or favicon, so a saved copy showed a blank tab icon and shared badly. *Fixed* with meta tags and an inline SVG favicon (data URI, no request).

**6. No way to find a tool among 239.** The home screen was a category grid only; a tool you half-remembered required guessing its category. *Fixed* with the `Ctrl K` palette, the home search field, and the A–Z index.

**7. No accessibility affordances for the cards or the shell.** Category and tool tiles were buttons with no accessible name, and the app had no reduced-motion handling. *Fixed* with `aria-label` on cards, `aria-pressed` on the pin button, `aria-modal` on the palette, and a `prefers-reduced-motion` rule.

## What was deliberately not changed

- **The `tooly:` localStorage prefix.** Renaming it to `kitbox:` would orphan every note, deck and scoreboard an existing user already has. The prefix is cosmetic; the data is not.
- **`Math.random()` in the existing games and randomizers.** Fine for a coin flip or a wheel; the new tools that matter (list picker, PINs, ULIDs, keys) use `crypto.getRandomValues`.
- **No service worker.** A service worker would add a second file and a cache-invalidation problem to solve a problem the single file already solves: it works offline once saved.
- **The 0-radius Windows-10 chrome.** It is the app's identity, not an oversight.

## Known limitations

- **Panchang accuracy.** Solar and lunar longitudes are good to about 0.01–0.05°, so tithi and nakshatra boundaries can be a minute out, and the Lahiri ayanamsa used is the linear approximation, not the full table. Treat the almanac tools as a good estimate, not a ritual authority.
- **Colour-blindness simulation** uses matrix approximations. It shows how a colour *shifts*; it is not a clinical model of any individual's vision.
- **Image palette extraction** buckets to a 4-bit channel grid and de-duplicates. Good for a mood board, not for brand colour matching.
- **EXIF stripping** removes the whole APP1 block, including orientation. A rotated phone photo may come back unrotated. Pixels are otherwise untouched.
- **File encryption depends on a secure context.** Web Crypto requires https or localhost; from `file://` some browsers refuse it. The tool says so rather than failing silently.
- **GZIP and ZIP need modern browsers.** `CompressionStream` is Chrome 80+, Firefox 113+, Safari 16.4+. The tool reports the limitation instead of failing.
- **Sensors and hardware** (compass, level, decibel meter, camera, GPS) need permission and hardware. Each says so plainly when unavailable.
- **The jsdom test cannot exercise canvas, audio, camera or file pickers.** Those tools are checked for a clean render, not for correct pixels or sound. That gap is honest and remains.

## How to re-run

```bash
npm ci
npm test     # 19 checks, exits non-zero on any failure
```

## Second pass — 1.1.0

The same checks were re-run against the merged build (338 tools, 23 categories), plus a new set aimed at the additions.

| Check | Method | Result |
|---|---|---|
| Every tool renders | jsdom, each `render()` in a fresh container | 338/338 |
| Tool ids unique per category | set comparison | pass |
| Tool names unique across the app | frequency count | pass |
| Every route resolves | `#/`, `#/all`, `#/about`, `#/support`, 23 categories, 23 tool pages | 50/50 |
| New arithmetic | A4 at 300 DPI, 18% GST, molar volume at STP, projectile range, C1V1, GSM vs UCS-2 counting | pass |
| Support page content | UPI id and inline QR present in the DOM | pass |
| No loaded external resource | `<script src>`, `<link href>`, `<img src>` scan | pass |
| No network API | `fetch`, `XHR`, `WebSocket`, `EventSource` | 0 hits |

### Findings and fixes in this pass

**1. Backtick inside a template literal.** The Query String Parser's help text quoted `a=1&a=2` with backticks inside a template literal, which ended the string and broke the whole file. Caught by `node --check` before anything else ran. *Fixed* by dropping the backticks.

**2. `matchMedia` assumed to exist.** Device & Screen Info called `window.matchMedia(...)` directly; environments without it threw during render. *Fixed* by a guarded helper that returns false instead of throwing.

**3. Two tools built on the wrong abstraction.** Paper Sizes and Shoe Size were first written on the unit-converter helper, which assumes a linear `factor` per unit. Paper is two-dimensional and shoe sizes are non-linear, so both would have produced nonsense. *Fixed* by giving them their own renders and a `unitTool` helper that registers into the same category without the factor assumption.

**4. A default that made the tool look wrong.** Paper Sizes opened on A0, so the first thing a user saw was the least useful size. *Fixed* by defaulting to A4.

**5. The external-resource test was too blunt.** It failed on any `http` in an `href`, which would have failed the build for the support page's own Ko-fi and PayPal links. *Fixed* by testing only what the page loads — `script src`, `link href`, `img src` — and documenting that outbound links are a deliberate exception, confined to the support page.

**6. Duplicate element ids across tools.** Not a bug in the app (only one tool is mounted at a time) but it broke the test harness, which mounted several tools into one document and then failed to find elements by id. *Fixed in the harness* by clearing the stage between mounts, which is what the router does.

### Known limitations added in this pass

- **Shoe sizes** convert through UK as a common base with a rule-of-thumb formula. Brands differ; this is a starting point, not a fitting.
- **Flight carbon** uses a radiative-forcing multiplier and per-cabin factors that are industry averages. It compares choices; it does not audit an airline.
- **SMS counting** treats any character outside GSM-7 as forcing UCS-2 for the whole message, which is what carriers do, but does not model the GSM-7 extension table's double-width characters beyond the encoding switch.
- **Planetary hours and tithi calendar** inherit the panchang's accuracy: about a minute at boundaries, and local tradition may differ.
- **Speak Text** depends on voices installed in the operating system; on a bare Linux install there may be none, and the tool says so.

## Documentation pass — 1.1.1

The app did not change in this pass; only what surrounds it did. What was checked:

| Check | Method | Result |
|---|---|---|
| Every image and link in the README resolves | scan every `src`/`href` and test the path on disk | 17 references, 0 missing |
| Badge numbers match reality | `node tools/check-badges.js` — counts tools and categories out of `kitbox.html`, tests out of `test/smoke.js`, size from the file | pass |
| Badges render offline | local SVG, no badge service, no network at render time | pass |
| Screenshots are current | regenerated from the committed files by `tools/shots.py` | pass |
| Screenshots show real values | the Panchang shot is taken with `TZ=Asia/Kolkata`, so sunrise reads 06:46, not 01:16 | pass |

### Findings

**1. A hand-typed number was wrong.** The size badge said 638 KB, which is the file size in *thousands* of bytes; in KiB it is 623 KB. Caught by the badge checker the moment it existed. *Fixed* by computing the value in `badges.py` from the file itself, so it cannot be typed wrong again.

**2. Screenshots taken in UTC showed nonsense.** The first Panchang screenshot reported sunrise at 01:16 and sunset at 12:27, because the container runs in UTC while the tool reports local time. Nothing was wrong with the app — but a README image that looks wrong is worse than no image. *Fixed* by pinning `TZ=Asia/Kolkata` in `tools/shots.py` and documenting why.

**3. The badge could rot silently.** Local SVG badges have no service to keep them current. *Fixed* by making `check-badges.js` part of CI: if the tool count or test count changes without the badge changing, the build fails with the numbers printed.

## B1 — quick wins (1.2.0)

Eighteen items, all in the shell. What was checked, and what the checks caught.

| Check | Result |
|---|---|
| Every tool still renders | 338/338 |
| Routes, including the new 404 | pass |
| The fifteen new shell assertions | pass |
| Full suite | 42 passed, 0 failed |
| Size | 621 KB → 633 KB (+12 KB), inside the 680 KB budget |
| No new external resource, no network call | pass |

### Findings

**1. `innerText` does not exist in jsdom, and that hid a real bug.** The copy-on-double-click handler read `box.innerText`. In a browser that is correct — it respects hidden text. In the harness it is `undefined`, so the handler returned early and the test failed for the right reason: the code had no fallback. *Fixed* by reading `innerText || textContent`, which is also more correct for a node that has never been laid out.

**2. An unknown tool bounced through two redirects before landing on the home page.** `renderTool` redirected to `#/category/<bad>`, `renderCategory` redirected to `#/`, and the user saw the home screen with no explanation. *Fixed*: both now call `renderNotFound` directly, and the 404 page offers a search box and two ways back.

**3. A manifest written before `git add` silently omits new files.** This was caught by CI on the B0 commit, not by the local check, because the local check compared the manifest against the same incomplete file list. *Fixed* in `tools/check-manifest.py`, which now reads `git ls-files --cached --others --exclude-standard` — so an untracked file still belongs in the manifest, and the check fails on the next push rather than the next release.

**4. `aria-live` on a container that is rebuilt wholesale is a compromise, not a solution.** Putting it on `#toolRoot` means a screen reader may announce more than the changed value. It is better than silence, and the honest fix — per-output live regions — needs the tools to declare their outputs, which is B5 work. Recorded here so it is not mistaken for done.

## B2 — contrast and accessibility (1.2.1)

| Check | Result |
|---|---|
| Every tile clears 4.5:1 with the ink the app picked | pass — worst 4.51:1 |
| `axe-core` across 50 pages | 0 violations |
| Labels associated with controls (Panchang sample) | 5/5 |
| Full suite | 51 passed, 0 failed |
| Size | 633 KB → 636 KB |

### What axe found, and why it took three passes

The first sweep reported **one** violation across five pages, on the Panchang: `label — Form elements must have labels`. The markup had labels, but as siblings rather than associated controls, which is the same thing to a screen reader as no label at all. Fixing that by hand would have meant editing several hundred inputs across 338 tools, so `associateLabels()` does it once per render instead.

Widening the sweep to all 50 pages then found **two more**: an unnamed colour swatch in the Color Picker, and nine unnamed buttons in Tic-Tac-Toe. Both were real, both were fixed at the source rather than by relaxing the rule.

### Findings

**1. A later top-level function silently replaced an earlier one.** The new contrast helper `relLuminance(hex)` was shadowed by the Color Picker's existing `relLuminance(r,g,b)`, so `inkFor()` returned ink for every tile and every ratio computed as `NaN`. The smoke test caught it only because the assertion printed the worst ratio — `NaN` is not `< 4.5`, so the check *passed* while the feature was broken. *Fixed* by renaming to `tileLuminance`, and *guarded* by a new test that fails on any duplicate top-level function name. This is the class of bug the `register()` API in B12 exists to prevent.

**2. A passing test hid the bug.** Worth stating plainly: `badTiles.filter(t => t.ratio < 4.5)` returns an empty array when the ratio is `NaN`. The assertion now reports the worst ratio as evidence, so a broken computation shows up as `NaN:1` in the output rather than as a green tick.

**3. Wiring landed in the wrong function.** The text-size control's event listeners were attached at the end of `renderSupport` instead of `renderAbout`, because both pages end with an identical footer line and the patch anchored on it. The button did nothing. *Fixed* by anchoring on the Credits block, which only the About page has.

**4. Tab order, recorded** (document order, home page): skip link → Back → Support → About → search → first-run dismiss → All tools A–Z → the 23 category tiles → footer links. On a tool page: skip link → Back → breadcrumb → Support → About → Pin → the tool's inputs. Two elements appear in that list which a browser will skip: `#backBtn` when it is `visibility:hidden`, and `#palInput` inside the closed palette. jsdom does not compute visibility, so the audit lists them; the browser does not.

### Known limitations added

- `body{zoom}` is the least-invasive way to scale an app whose type is set in pixels. It is supported in Chrome, Safari and Firefox 126+, and it is not a standard property. If it ever stops working the app is unchanged at 100%, which is the default.
- axe's colour-contrast rule needs layout and skips in jsdom, so contrast is asserted by computing the ratios directly instead — which is stricter, since it covers every tile rather than the ones axe happens to render.

## B3 — findability (1.3.0)

| Check | Result |
|---|---|
| Full suite | 63 passed, 0 failed |
| axe across 50 pages | 0 violations |
| Size | 638 KB → 646 KB |
| Every category with > 8 tools has a filter | 18 of 18 |

### Findings

**1. A pin must not outrank a better name.** The first version added a flat bonus to any pinned tool, and the test that expected the pinned MD5 to top a search for `hash` failed — correctly. *Hash Generator* starts with the query; MD5 contains it as a second word. A pin is a tie-breaker, not a trump card, so the test was rewritten to assert the bonus (+8) rather than the outcome. The behaviour is now stated in a comment so the next person does not "fix" it.

**2. Recent searches were rendered in the wrong branch of the palette.** The history block went inside the `if(!results.length)` guard, which is only reached when there are no pinned or recent *tools* — so anyone with a pin saw their history never appear. *Fixed* by appending the history group after the pinned/recent list, unconditionally.

**3. Two of the nine items were already true.** Searching by group label worked because the group was already in the index string, and the index already carried the category name. Rather than invent work, both got tests and a line in the changelog saying so.

### Known limitations added

- The "new" chip is a hand-maintained list of ids, not derived from release metadata. When B12 adds `since` to every registration, the list should be replaced by a comparison against the current version. Until then, a tool added in 1.3.0 will not be chipped unless its id is added to `NEW_TOOLS`.
- `g`-chords are single-key and time-boxed to 1.2 s. They are ignored while a text field has focus, which is the only sane default, but it does mean they do not work from the palette.

## B4 — the stability spine (1.4.0)

| Check | Result |
|---|---|
| Every tool wears its pinned code | 339/339 |
| Codes unique | pass |
| Every retired id has an alias | pass (none retired yet) |
| Error boundary + log | pass |
| Timer-leak sweep over all 339 tools | 0 leaks |
| Full suite | 70 passed, 0 failed |
| axe across 50 pages | 0 violations |
| Size | 647 KB → 656 KB |

### What the timer sweep found

Nothing — every tool that starts an interval already called `setCleanup`. That is worth saying plainly rather than dressing up: the sweep exists to keep it true, and its first run was clean because the original author was careful. It now fails the build if a new tool forgets.

### Findings

**1. Codes were positional, and nothing noticed.** Inserting a tool between two others in the same category silently renumbered every later code in that category. Nothing in the app broke — codes are only labels — but a bug report quoting `FIL-03` would point at a different tool after the next release. Pinned in `codes.json`, embedded in the app, checked in CI.

**2. `cryptoAvailable()` is false in the test harness.** jsdom does not expose `crypto.subtle`, so the four crypto tools take their "needs a secure context" path under test. That is correct behaviour and worth recording: the tests prove the guard works, not that the cryptography does. The crypto itself is still covered by the MD5, CRC32, base32 and ZIP assertions, which do not need Web Crypto.

**3. The Error Log is a new tool, so the count moved.** 338 → 339. That is the first time a batch added a tool since 1.1.0, and it exercised the whole pipeline: `codes.json`, `ids.json`, `ALL_TOOLS.md`, the badges, the landing page count. All four were regenerated and checked, which is exactly what B0 built them for.

### Known limitations added

- The alias map is hand-written and currently empty, because nothing has been renamed yet. Its value is prospective: the next rename gets an entry rather than a broken link.
- Capability chips are declarative. A tool that needs the camera but is not in `TOOL_REQUIRES` gets no chip; the list is short and deliberate, and the test suite only asserts the mechanism, not the completeness of the mapping.
- The error boundary catches throws during render. An error thrown later, inside an event handler, is caught by the global handler and logged, but cannot restore the tool — it was already rendered.

## B5 — the consistency sweep (1.5.0)

| Check | Result |
|---|---|
| Full suite | 82 passed, 0 failed |
| axe across 50 pages | 0 violations |
| Examples point at real fields | 26/26 |
| Size | 656 KB → 668 KB |

### Findings

**1. Half the worked examples pointed at fields that did not exist.** `fillExample` looks up inputs by id and silently skips a miss — correct defensive behaviour, and exactly the kind of silence that makes a feature look implemented when it is not. Four of the first twenty-six examples used ids I had guessed from the tool's *purpose* rather than read from its markup. *Fixed* by dumping the real ids from every tool and correcting the map, and *guarded* by a test that walks `EXAMPLES` and fails on any id the tool does not render.

**2. `CSS.escape` does not exist in jsdom.** The example filler used it to build a selector from an id. *Fixed* by using an attribute selector instead, which needs no escaping and works everywhere.

**3. The paste chip needed layout to decide where to sit.** The first version refused to appear when `getBoundingClientRect().width` was zero, which is always true in jsdom and never true for a focused, visible field in a browser. *Fixed* by treating focus as the proof that the field is on screen, and checking only that it is not inside a `[hidden]` container.

**4. The shell's own buttons were not covered by the sweep.** `applyToolChrome` walks the tool root, so the previous/next arrows — which the shell renders — kept their unexplained `disabled`. *Fixed* in the shell markup.

### Known limitations added

- The state cache is per session, in memory. Reloading the page forgets it; that is deliberate, because persisting every field of every tool would fill `localStorage` with noise nobody asked for.
- Examples are hand-written and cover 26 of 339 tools. A generic example would teach nothing, so the rest simply do not offer one until someone writes a good case for them.
- The CSV copy quotes every field, including numbers. That is the safe default for spreadsheets; a consumer that wants typed columns will need to parse them.

## B6 — preferences and permalinks (1.5.1)

| Check | Result |
|---|---|
| Full suite | 87 passed, 0 failed |
| axe across 50 pages | 0 violations |
| Number-format call sites rewritten | 31 |
| Size | 668 KB → 674 KB (budget raised to 760 KB deliberately) |

### Findings

**1. A preference cannot beat a memory, and should not.** The units preference sets which unit a converter *opens* on, but the converter already remembered the pair you last used — from B2 — and that memory won every time. That is the right behaviour (an explicit choice beats a default) and it made the preference look broken. *Fixed* by making **Reset** clear the remembered pair too, so there is a way to get back to the default, and by documenting the order: memory, then preference, then the unit's own position in the list.

**2. `en-US` was used for two different jobs.** Grouping numbers and formatting dates. Only the first should follow the number preference; the second is about language, not digits. The rewrite touched `toLocaleString` call sites only, and left `Intl.DateTimeFormat('en-US', …)` in the world clock alone.

**3. The size budget is now the binding constraint, not the tests.** 674 KB against 760 KB. B7 and B8 will take another 15–20 KB. This is the last batch that can grow freely; B12's source split is what makes the budget meaningful again, because a built file can be minified while the source stays readable.

### Known limitations added

- The units preference affects converter defaults only. Tools that print a unit they chose for themselves — a BMI in kg, a flight in km — keep their own unit, because silently converting an output is a worse surprise than showing the unit in the label.
- Permalinks carry scalar fields up to 200 characters. A link with a long note in it is deliberately not offered.
- A permalink exposes its inputs in the URL. For a calculator that is the point; for anything personal, do not copy the link.

## B7 — storage you can trust (1.6.0)

| Check | Result |
|---|---|
| Full suite | 97 passed, 0 failed |
| Schema migration | v1 → v2, both steps verified on old-shaped data |
| Every written key declared | pass (23 keys, one prefix) |
| Backup carries version + schema | pass |
| Per-key erase leaves the rest intact | pass |
| Size | 677 KB → 683 KB |

### Findings

**1. A failed write looked exactly like a successful one.** `store.set` wrapped `localStorage.setItem` in `try{}catch(e){}` and returned nothing. On a full disk, or in a private window where storage is blocked, every save in the app quietly did nothing — no message, no log, no way to notice until a reload lost the work. It now returns a boolean, reports once per session with the likely cause, and writes to the error log. That is the single most valuable fix in this batch and it took four lines.

**2. The allow-list was still hand-typed, one release after it caused a bug.** In 1.0.0 the restore filter dropped the pinned and recent keys. The fix then was to add three strings to a `Set`; the structural fix is this batch, where the set is derived from `STORE_KEYS` and a test compares it against every `store.set` in the source. The dynamic key (`'unit-last-' + id`) is declared as a prefix, and the test understands prefixes — otherwise it would either miss it or cry wolf.

**3. Migrations must not be able to half-apply.** The version is written inside the loop, after each step, not once at the end. If step 2 throws, step 1 stays applied and the log records it; the app keeps working on data it understands.

### Known limitations added

- Migration 2 normalises shape, not meaning. A deck whose cards were stored under different field names is left alone rather than guessed at.
- The encrypted backup uses the same PBKDF2 parameters as the file encryption tool (250,000 iterations, SHA-256). That is deliberately the same number in two places; if it is ever raised, old backups still open because the salt and parameters travel with the file.
- Erasing a key is immediate and has no undo. It asks once, and that is the whole safety net.

## B8 — security hardening (1.6.1)

| Check | Result |
|---|---|
| Fuzz: 169 text fields × 8 payloads × 339 tools | 0 injections |
| Fuzz harness mutation-tested | re-introducing the 1.0.0 bug makes it fail, precisely |
| EXIF Orientation survives a strip | 6 → 6 |
| CSP present and restrictive | pass |
| Full suite | 99 passed, 0 failed |
| axe across 50 pages | 0 violations |
| Size | 686 KB → 690 KB |

### The result worth stating plainly

**No tool put user text into the DOM unescaped.** The escaping discipline the original author started, and that the 1.0.0 audit found one hole in, now holds across 339 tools and 1,352 payload attempts. That is a better outcome than a list of findings, and it is only worth believing because the harness was mutation-tested: re-introducing the exact `textDecoration` bug makes it fail with `text/textdecoration field #tdIn payload "<img src=x onerror=…" → img[onerror]`. A green test that cannot go red proves nothing.

### Findings

**1. The strip was destroying the one tag that mattered.** `stripJpegMetadata` dropped the entire APP1 block, which is correct for camera make, timestamps and GPS — and wrong for `Orientation`, which is not metadata about the photo but an instruction for reading it. A portrait photo came back landscape. *Fixed* by reading the tag before the strip and rebuilding a minimal 34-byte EXIF block around it. The audit had this as a known limitation since 1.0.0; it is now closed.

**2. A CSP that bans inline script would ban the app.** `default-src 'none'` with `script-src 'unsafe-inline'` is not a weakening, it is the only policy a single-file app can have — and it still blocks every network, frame, form and object the app would never load anyway. Recorded in `SECURITY.md` rather than left as a surprise to the next reader.

**3. Buffer wiping is theatre if it is described as a guarantee.** The decrypt path now zeroes its arrays, and the hint says what that is worth: JavaScript cannot promise a string is gone, and the browser may already have copied it. The honest sentence is more useful than the code.

### Known limitations added

- The fuzz covers `input[type=text]` and `textarea`. Number, date and colour inputs cannot carry a payload worth testing, and file inputs are exercised by the size guards instead.
- The CSP is a meta tag, not a header. A meta tag cannot set `frame-ancestors`, so clickjacking protection is absent — it needs a server, and there is no server.
- The orientation block is written little-endian with a single entry. That is valid EXIF and every decoder tested here reads it, but a strict validator may prefer the original byte order preserved.

## B9 — performance (1.6.2)

Measured in Chromium headless against the real file, twice, on this machine. Not in jsdom.

| Measure | Value |
|---|---|
| Page ready | ~90 ms (parse + boot + first route) |
| All 339 tools rendered, cold | 720–745 ms (three renders each, median) |
| All 339 tools rendered, warm | ~600 ms → **~0.55 ms per render** |
| Tools over 5 ms warm | 4 |
| Slowest warm | Browser Feature Check 16–29 ms, Gradient Wallpaper 11–13 ms |
| Timezone Converter | 80.8 ms → **2.4–3.7 ms** |
| `kitbox.html` gzipped | 711 KB → 195 KB (27%) |

### Findings

**1. The roadmap's performance item was based on a measurement of the harness.** `general/tzconv` showed 474 ms in jsdom and 80.8 ms in a browser; the app as a whole showed 5.2 s in jsdom and 406 ms in a browser. jsdom builds DOM in JavaScript and does no layout, so it overstates every render and understates nothing. The bench exists so that the next performance decision is made on the second set of numbers.

**2. The 80 ms was mostly a one-time cost, and the first bench hid it.** Timezone Converter's cost was `Intl.supportedValuesOf('timeZone')` building the IANA list on first use — paid once per session, then cached — plus 400 `<option>` elements. The first bench reported one sample per tool, so the one-time cost landed entirely on whichever tool happened to trigger it, and a later run reported a tool as *slower warm than cold*, which is not a thing. *Fixed* by rendering each tool three times and taking the median, and by reporting a cold pass and a warm pass separately. That is the difference between a number and a story.

**3. A capped list must keep the selection.** Capping the zone list at 80 and filtering it broke the converter outright: if the selected zone was not in the first 80, assigning `select.value` to it left the select empty and the tool threw `Invalid time zone specified`. *Fixed* by always including the current selection in the list, even when the filter excludes it — and there is a test for exactly that case, because it is the case a filter makes easy to miss.

**4. Virtualisation was on the list and is not needed.** The largest table is 129 rows. Building it costs 27.8 ms once, when you open that tool. Virtualising it would add code, a scroll listener and a class of bug to save less than 30 ms on a page nobody keeps open. Recorded as not-done with the measurement that justifies it.

### Known limitations added

- The bench renders into a detached container, so it measures DOM construction but not layout or paint. A tool that is cheap to build and expensive to lay out would not show up.
- The numbers above are one machine, headless Chromium. They are useful for comparing tools against each other, not for predicting a phone.
- `dist/` is generated and ignored by git; the checksums are for the artefact a release attaches, not for the repository.

## B10 — testing depth (1.7.0)

| Check | Result |
|---|---|
| Interaction sweep | 301 tools driven, 0 failures |
| Fixtures | 15 calculators, all hand-checkable |
| Round trips | base64, base32, base58 |
| Real files | ZIP (header, names, contents), PNG detection, CSV parsing |
| Landing page | 29 links, all resolve |
| Full suite | 103 + 9 + 6 assertions, 0 failures |
| Size | 695 KB → 695 KB (tests are not shipped) |

### What the sweep found

Nothing broke — 301 tools took input and none threw. That is worth stating plainly, and worth qualifying: the sweep fills **one** field per tool with a plausible value. It proves no handler references an element its own tool no longer renders, which is the most common way a tool rots. It does not prove every combination of inputs is handled.

### Findings

**1. A test helper destroyed the thing it was testing.** The first version of the deep-test harness cleared its staging area by rewriting `document.body.innerHTML`, which deleted the app's own `#app`, header and palette — every render after the first tool failed. The symptom looked like a tool bug. *Fixed* by creating one staging container and emptying it, which is what the app's own router does.

**2. Two fixtures were wrong about what the tool computes.** `calc/percentage`'s first panel answers "what percent is X of Y" — 25 of 200 is 12.5%, not 50 — and `calc/sigfig` only computes when its button is pressed. Both were corrected, and the fixture format grew an optional `click` so a button-driven tool can be tested rather than skipped. That is the fixture doing its job: it disagreed with my assumption, and the tool was right.

**3. Statement coverage of the app is not measurable yet, and the number here is a proxy.** The app is one script with no module boundaries, so a coverage tool would mostly report the router. Tool-level interaction coverage — 301 of 339 — is the honest proxy, and B12's source split is what makes real coverage possible.

### Known limitations added

- The interaction sweep fills one field per tool. A tool with six fields is tested with one of them.
- Fixtures cover 15 of the calculators. The rest are covered only by "it renders and survives input".
- The fuzz, interaction and axe runs are single-pass, not property-based. They are good at catching a class of mistake, not at proving absence.

## B11 — distribution (1.7.1)

| Check | Result |
|---|---|
| Pages | enabled on `main` / root, https enforced, rebuilding on every push |
| Release workflow | refuses a tag that disagrees with `APP_VERSION` |
| Minified build | 339/339 tools render, search, routing and arithmetic verified |
| Gzipped size | 711 KB → 195 KB (27%); minified → 186 KB |
| `/latest/` | redirect page, fixed URL |

### Findings

**1. A hand-written minifier produced a file that did not parse.** The first version tracked strings, template literals, regexes and `${ }` nesting with a state machine. It looked correct, reported a plausible 4% saving, and the output died on `Unexpected token '{'` at the first `${…}` after a mis-tracked backtick. The app is 700 KB of JavaScript in which most markup lives inside template literals; a single wrong backtick turns every later template inside out. *Fixed* by deleting the state machine and using **acorn** to report exact comment ranges. acorn is a devDependency; the app still ships with zero.

**2. The saving is smaller than the roadmap assumed.** The roadmap guessed the gzipped file would be about 90 KB; it is 195 KB. Removing comments saves 3% raw and 4% gzipped, because the file is dense with code rather than with prose. The `.gz` is the distribution path; the minified copy is a small bonus that is now verified rather than assumed.

**3. A tag can ship the wrong build if nothing checks.** The release workflow compares the tag to `APP_VERSION` in the file and fails the build on a mismatch. Without that, `v1.8.0` could attach a 1.7 build and nobody would notice until a user compared checksums.

### Verified after publishing

- **Release `v1.7.1` exists with seven assets**: `kitbox.html` (711,431 B), `kitbox.html.gz` (194,602 B), `kitbox.min.html` (688,949 B), `kitbox.min.html.gz` (186,369 B), `index.html` (38,164 B), `index.html.gz` (9,143 B) and `SHA256SUMS` (493 B). The release job checked the tag against `APP_VERSION` before publishing, so the assets and the version agree by construction.
- **`/latest/`** is served from the repository root and redirects to `../kitbox.html`.
- **The personal index is automatic and was not forced.** `drsamonline.github.io` regenerates `repos.json` from the GitHub API on a daily cron (03:37 UTC) and on push to that repository. The current file was generated at 10:43, before this repository existed, so Kitbox is not in it yet; it will be after the next run. Dispatching that workflow needs Actions permission on that repository, which this session does not have — recorded rather than worked around.

### Known limitations added

- The release attaches files to a GitHub Release; it does not publish to any package registry, and there is no auto-update. That is deliberate — an offline-first app that phones home to check for updates has broken its own rule.
- `dist/` is generated in CI and not committed, so the checksums describe the artefact, not the repository. The tag plus `APP_VERSION` is what ties them together.
- The minified copy keeps all indentation, including indentation inside template literals, because that is content. It is smaller by comments only.

## B12 — architecture (2.0.0)

| Check | Result |
|---|---|
| `build(split(kitbox.html))` | byte-identical to the original |
| Parts | 16 JS files, 12,163 lines |
| Registration paths | 1 (`register()`), 21 adapters |
| Unit tests on the extracted library | 23 passed, 0 failed |
| ESLint (concatenated script) | 0 errors, 0 warnings |
| `tsc --checkJs` (dist/lib.js) | 0 errors |
| Full suite | 146 checks, 0 failed |
| Size | 697 KB → 700 KB |

### Findings

**1. Splitting a single file is only safe if you can prove the split changed nothing.** The cut was made at section boundaries and verified by rebuilding and comparing bytes; the first attempt differed at line 658 because the parts were joined with an extra newline, and the second at the last line because the closing `</script>` had been swallowed into the final part. Both were caught by `cmp` before any other change, which is the entire argument for doing the split before doing anything else.

**2. Two of the three "undefined at registration" bugs were ordering.** `register()` needed `NEW_TOOLS`, `KEYWORDS` and `TOOL_REQUIRES`, which lived in the shell part, after the tools. Moving them into the core was the fix — and the fact that `const` in a later file is a temporal dead zone, not `undefined`, is why the app failed loudly instead of half-registering tools.

**3. The new unit tests found a real bug in twenty minutes.** Base58 of an empty byte array encoded to `"1"` and decoded back to two zero bytes: `fromBase58` seeded its accumulator with `[0]` and `toBase58` never special-cased empty input. It had been in the app since 1.1.0, reachable from the codec's Decode button, and no DOM-level test would ever have looked at it.

**4. Lint and types found almost nothing, which is the honest result.** ESLint's only finds were six dead variables; `tsc` on the library is clean. That is what a well-written 12,000-line file looks like when you finally point a checker at it — and it is worth saying that the checkers did not justify themselves by volume, they justified themselves by existing.

### Known limitations added

- `register()` attaches `keywords` and `requires` from the side maps rather than taking them as arguments. The next tool can pass them directly; the 339 existing ones keep working.
- The library extraction is by name, from a whitelist in `tools/build-lib.js`. A new pure function is not testable until it is added to that list.
- `tsconfig.json` sets `noImplicitAny: false`. Turning it on would need JSDoc on every parameter of the 22 extracted functions; that is the natural next step, not a blocker.

## B13 — four categories (2.1.0)

| Check | Result |
|---|---|
| Tools / categories | 356 / 27 (was 339 / 23) |
| Codes pinned for the new tools | 17 added |
| axe across pages | 58 pages, 0 violations |
| Interaction sweep | 317 tools driven, 0 failures |
| ESLint | 0 errors, 0 warnings |
| Full suite | 146 checks, 0 failures |
| Size | 700 KB → 723 KB |

### Findings

**1. axe caught a table with an empty header cell.** The multiplication table's corner cell was `<th></th>`, which is a real violation (`empty-table-header`) and a real problem for a screen reader: it announces a column with no name. Fixed with `scope="col"` and an `aria-label`, and the sweep now covers 58 pages instead of 50 because the four new categories each get one.

**2. Every new tool had to be registered before it could be pinned.** The test that every tool wears its pinned code failed for all 17 new tools until `tools/gen-codes.js` ran — which is the design working: a tool cannot appear in the app with a code nobody has recorded.

**3. A disclaimer is part of the tool, not a footer.** The four clinical calculators carry the same note in the same place, and it says what the numbers assume. The alternative — a clean-looking calculator with a caveat in a README nobody reads — is the version that gets someone hurt.

### Known limitations added

- Clinical tools implement textbook formulas (CKD-EPI 2021, 15/26 gratuity, 0.8 mg/dL calcium correction). They do not know your patient, your lab's reference range, or your protocol.
- The Money category is the old tax regime for HRA, and does not model surcharge, cess or state-specific professional tax.
- Accessibility tools preview and check; they cannot test with an actual screen reader, which remains the only real test.

## B14 — packaging (2.2.0)

| Check | Result |
|---|---|
| `app/index.html` == `kitbox.html` | pass (verified by `build.py --check`) |
| Packaging workflow | calls `app-builder/.github/workflows/build.yml@main` |
| IndexedDB fallback | pass (jsdom has no IndexedDB, which is the fallback case) |
| Full suite | 151 checks, 0 failures |
| Size | 723 KB → 726 KB |

### Findings

**1. A second copy of the app is the price of packaging, so it is checked.** The kit copies a folder into the EXE and the APK, so the app has to exist at `app/index.html` as well as at the root. Rather than trust two files to stay in step, `tools/build.py` writes both from `src/` and `--check` compares both — one command, one failure mode.

**2. Calling the kit rather than copying it is the whole point.** `app-builder`'s own workflow comments record a hand-copied version that kept `if: always()` on its release job and therefore deleted a published release when a build failed. This repository calls the reusable workflow with three inputs and inherits every fix.

**3. IndexedDB cannot be tested in jsdom, so the fallback is what is tested.** The suite asserts that `bigStore` degrades to localStorage when `indexedDB` is absent — which is exactly the jsdom case and exactly the case for a browser in private mode with storage blocked. The IndexedDB path itself is exercised only by using the app in a browser, and that is recorded rather than glossed.

### Verified after the first run — and one cross-repo failure

The packaging workflow ran on the 2.2.0 push. Job by job:

| Job | Result |
|---|---|
| Portable EXE (Windows) | **success** |
| Portable binary (Linux) | **success** |
| The demo must be the app | success |
| A retrofit must not remove a capability | success |
| A kit is never retrofitted into a repository | success |
| Version and changelog | success |
| **Android APK** | **failure — Java compilation error** |
| Publish the rolling release | skipped, correctly, because a job it depends on failed |

So the wiring is right and the Windows and Linux binaries build; the **APK fails inside `app-builder`'s own Gradle project**, not in this repository. The kit's `apk/app/build.gradle.kts` targets `compileSdk = 34`, `sourceCompatibility 17`, `jvmTarget 17`, and the failing job ran on the `ubuntu-26.04` runner image — the likely shape of the problem is a toolchain mismatch between that image's JDK, AGP 8.x and the Kotlin plugin. `app-builder`'s own CI ("tests") passes because it does not build the APK, so nothing there catches this.

Deliberately not worked around from here: patching another repository's Android project from a consumer repo would fork the kit, which is exactly the failure mode its own comments warn about. The rolling release is skipped rather than published half-built — that is the kit behaving correctly.

### Known limitations added

- The APK cannot be produced until the kit's Android build is fixed; the EXE and the Linux binary are unaffected. When the kit is fixed, this repository inherits it with no change.
- Notepad is the only tool on `bigStore`. Flashcards and trivia still use localStorage until someone hits the 5 MB ceiling with them.
- `app/` duplicates 726 KB in the repository. A symlink would halve it and break the Windows runner, which does not follow them.

## Borrowed ideas (2.3.0)

| Check | Result |
|---|---|
| Tools / categories | 370 / 27 (was 356 / 27) |
| Fuzz | 196 fields across 370 tools, 0 injections |
| Interaction sweep | 331 tools driven, 0 failures |
| axe | 58 pages, 0 violations |
| ESLint | 0 errors, 0 warnings |
| Full suite | 151 checks, 0 failures |
| Size | 726 KB → 756 KB |

### On licences

Four repositories were read; none of their code is in this app. it-tools is GPL-3.0 and cannot be relicensed here at all — an idea is not copyrightable, an implementation is. CyberChef (Apache-2.0) and compressorjs (MIT) would permit copying with attribution; the tools were written from their definitions anyway, because the definition is what makes them testable. Each new tool is checked against a published value — the Vigenère textbook vector, the chmod octal table, RFC 6238 — rather than against another project's output, which is the difference between understanding a thing and copying it.

### Findings

**1. Pinned codes were being applied before the tools that needed them existed.** The loop lived in the core part; a tool registered in a later part got the counter's code, so `text/xor` came out TXT-34 while `codes.json` said TXT-41. It had been invisible because every earlier batch added tools to parts that loaded *after* the loop's old home in the shell. Moving the loop to the end of the load fixed it, and the existing check would have caught it sooner if the loop had ever been exercised by a later part.

**2. A second full-tool sweep is cheap now.** Adding fourteen tools cost three minutes of verification: build, test, lint, axe, fuzz, interaction. That is the return on B12's structure — before the split, adding tools meant editing a 700 KB file by hand.

### Known limitations added

- The XOR brute force ranks by printable-character density, which is a heuristic and fails on short inputs.
- TOTP and RSA need Web Crypto, so both say so on a page served over plain http.
- The SQL prettifier is regex-based: it will mangle a subquery you wanted inline, and it does not validate anything.

## B15–B17 (2.4.0)

| Check | Result |
|---|---|
| Tools / categories | 389 / 27 (was 370 / 27) |
| Full suite | 155 checks across six files, 0 failures |
| Interaction sweep | 343 tools driven, 0 failures |
| Fuzz | 215 fields across 389 tools, 0 injections |
| axe | 58 pages, 0 violations |
| ESLint / tsc | clean |
| Size | 758 KB → 790 KB |

### Findings

**1. A category initialiser wiped a whole category.** `TOOLS.clinical = []` in the B13 part ran *after* the eight clinical scores had registered from a part that sorts earlier, so the category came out empty and the app still built and tested green — because no test asserted that a specific clinical tool existed. The initialisers are now idempotent (`TOOLS.x = TOOLS.x || []`), which makes load order irrelevant, and nine assertions now name specific clinical tools.

**2. My Hamming expectation was wrong twice.** `karolin` / `kathrin` differ in three characters, which is 9 bits — I wrote 3, then 8, before computing it properly. The tool was right each time. Worth recording because the temptation with a failing assertion is to change the tool.

**3. Two of the eight clinical scores have a scoring shape that is easy to get wrong.** Wells DVT subtracts 2 for an alternative diagnosis, so the total can be negative; CHA₂DS₂-VASc counts age twice at different weights, so ticking both age rows double-counts. Both are now tested with the values that expose them.

### Known limitations added

- Clinical scores are implemented from the published instruments, without the validation studies behind them. They do not know the patient.
- ZIP Extract handles store and deflate. Encrypted archives are listed and refused rather than half-read; other methods are named in the error.
- The tuner needs a microphone and a quiet room; it reports nonsense on a chord and says so.
