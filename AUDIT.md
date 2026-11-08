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
