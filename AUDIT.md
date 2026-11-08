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
