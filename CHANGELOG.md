# Changelog

All notable changes to Kitbox. The app is a single file, so the version number in this file is the version of `index.html`.

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
