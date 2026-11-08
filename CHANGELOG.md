# Changelog

All notable changes to Kitbox. The app is a single file, so the version number in this file is the version of `index.html`.

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
