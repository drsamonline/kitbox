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
