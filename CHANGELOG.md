# Changelog

All notable changes to Kitbox. The app is a single file, so the version number in this file is the version of `index.html`.

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
