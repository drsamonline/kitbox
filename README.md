# Kitbox

**Every tool, one offline app.** 280 tools across 21 categories in a single HTML file — no build step, no dependencies, no network, no account.

Open `index.html` from disk, from a USB stick, or from GitHub Pages. Everything runs in the page.

- **280 tools, 21 categories**, all reachable from one search box (`Ctrl K`).
- **One file.** No CDN, no fonts to fetch, no service worker, nothing to install.
- **Zero runtime dependencies.** No library ships inside it; the ZIP writer, MD5, CRC32, the panchang and the AES envelope are all written out in the file.
- **Nothing is uploaded.** Files you hash, zip, compress, encrypt or strip metadata from are read by the page and written back to your device.

## What is in it

| Category | Tools | What it covers |
|---|---:|---|
| General | 13 | Ruler, counters, countdown, stopwatch, Morse, Roman numerals, compass, level, world clock |
| Text | 35 | Case, find and replace, sorting, ciphers, slugify, braille, ASCII banners, readability, keywords |
| Generator | 5 | QR codes, Lorem Ipsum, number generators, barcode scanning |
| Calculation | 47 | Everyday maths, algebra, geometry and solids, statistics, regression, fuel and electricity cost, pricing |
| Image | 18 | Resize, crop, compress, convert, filters, collage, ASCII art — all local |
| Unit converter | 31 | Length, mass, volume, energy, pressure, data, typography, and more |
| Finance | 16 | EMI, investment, tax, amortisation, savings goal, debt payoff |
| Randomizer | 9 | Wheel, dice, coin, rock-paper-scissors, random from a list, PINs |
| Health | 6 | BMI, BMR, water, ideal weight, clinical calculations, TDEE and macros |
| Development | 32 | JSON, YAML, base64, hashes, HMAC, MD5, JWT, cron, ULID, CIDR, MIME, Markdown, configs |
| Colours | 7 | Picker, blend, WCAG contrast, colour-blindness simulation, palette from an image |
| Science | 9 | Ohm's law, molar mass, pH, half-life, density, wavelength, periodic table |
| Geo | 7 | Distance, bearing, midpoint, DMS, sunrise, GPS speed, polygon area |
| Audio | 7 | Tone generator, metronome, noise, binaural beats, decibel meter, recorder |
| Games | 8 | Tic-tac-toe, memory, hangman, Wordle, Simon, trivia |
| Travel | 4 | Packing lists, flight duration, bag sizes, plug types |
| Nature | 4 | Moon phase, solstices, sun exposure, night-sky brightness |
| Productivity | 6 | Pomodoro, habits, notepad, sketch pad, flashcards, backup and restore |
| **Files & Data** | 10 | ZIP, gzip, file hashing, file encryption, sealed notes, CSV, EXIF and GPS, base64 |
| **Almanac** | 3 | Panchang, rahu kaal, sun and moon times |
| **Communication** | 3 | vCard, calendar invites, message links |

The last three categories, and 41 of the tools, were added in the merged build by folding in work from the rest of the drsamonline projects — see [Where the tools came from](#where-the-tools-came-from).

## Getting it

```bash
git clone https://github.com/drsamonline/kitbox.git
cd kitbox
open index.html      # or: xdg-open index.html
```

Or serve it: `python3 -m http.server` and visit `http://localhost:8000`. Both work; the file has no dependency on being served.

## Finding a tool

- **`Ctrl K`** (or `⌘ K`) opens the search from anywhere. It ranks exact names first, then prefixes, then word starts, then substrings, then an ordered-letters fallback, so `panchng` still finds Panchang.
- **`/`** opens the same search when you are not already typing in a field.
- **Pin** a tool with the star on its page; pinned and recently used tools appear at the top of the home screen.
- **All tools A–Z** lists everything alphabetically if you would rather browse.

## Where the tools came from

Kitbox was one file with 239 tools. The merged build adds 41 more, rewritten to run inside this page:

| From | Brought over |
|---|---|
| `export-kit` | Store-only ZIP writer (local headers, central directory, CRC32) |
| `compress-kit` | GZIP compress and decompress over Compression Streams |
| `crypto-kit` | AES-256-GCM with PBKDF2-SHA256 keys; file encryption and sealed notes |
| `astro-kit`, `app-panchang` | Julian day, Meeus solar and lunar longitude, Lahiri ayanamsa, tithi, nakshatra, yoga, karana, rahu kaal |
| `app-image-toolkit` | EXIF and GPS reading, and metadata stripping that leaves pixels untouched |
| `ml-kit` | tf-idf keyword ranking and cosine similarity |
| `TTB`, `All4ONE` | Statistics, regression, sig figs, fuel and electricity cost, pricing, savings, debt payoff, ULID, base32/base58, HMAC, MD5, CIDR, MIME, Markdown, config parsing, .gitignore, vCard, ICS, message links |

## What it refuses to do

- **No network calls.** Not for updates, not for fonts, not for analytics. The test suite fails if a `fetch`, `XMLHttpRequest`, `WebSocket` or `EventSource` appears in the file, or if any external `src` or `href` is added.
- **No silent uploads.** Files are read with `FileReader` and written with `Blob` and `a[download]`. There is no server to send them to.
- **No telemetry.** Nothing is counted, profiled or reported.
- **No account.** There is nothing to sign into.

## Accuracy, honestly

- The panchang uses the Meeus solar and lunar series with an approximate Lahiri ayanamsa. Tithi and nakshatra boundaries land within roughly a minute of a published almanac; **they are approximations, and local tradition may differ.** The test suite pins the solar and lunar longitudes to the published Meeus worked examples.
- Health, finance and science calculators use standard public formulas. They are general-purpose tools, not professional instruments — nothing here is a substitute for medical, financial or legal advice.
- MD5 is included for legacy checksums only. It is not collision-resistant and must never be used for passwords.

## Tests

```bash
npm ci
npm test
```

19 checks: every tool renders, ids and names are unique, all 45 routes resolve, the ported algorithms match their reference values, user text is escaped rather than parsed as markup, and the file loads nothing external.

## Your data

Tools that remember things between visits — Notepad, Flashcards, Trivia Creator, Sketch Pad's palette, Scoreboard, Habit Tracker, Packing List, currency rates, ruler calibration, pinned tools, recents, the Panchang's last location — store it in this browser's `localStorage` under the `tooly:` prefix. It never leaves the device, and clearing browser data erases it. **Productivity → Backup & Restore** exports everything to one JSON file.

## Licence

PolyForm Noncommercial 1.0.0 — see [LICENSE](LICENSE).

Crafted by **Dr. Sohil Momin, BHMS** — Vadodara, Gujarat, India.
