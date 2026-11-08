# Kitbox

**Every tool, one offline app.** 338 tools across 23 categories in a single HTML file — no build step, no dependencies, no network, no account.

- **Open the app:** [kitbox.html](kitbox.html)
- **Landing page:** [index.html](index.html)
- **All tools, A–Z:** inside the app at `#/all`, or press `Ctrl K`

Everything runs in the page. Save the file, open it from a USB stick on a machine with the router switched off, and it works.

## What it is

| | |
|---|---|
| Tools | 338 |
| Categories | 23 |
| Files to install | 1 |
| Runtime dependencies | 0 |
| Network requests | 0 |
| Accounts | 0 |

## Categories

| Category | Tools | What it covers |
|---|---:|---|
| General | 13 | Ruler, counters, countdown, stopwatch, Morse, Roman numerals, compass, level, world clock, text-to-speech, big clock |
| Text | 40 | Case, find and replace, sorting, ciphers, slugify, braille, ASCII banners, readability, keywords, accents, smart quotes, invisible characters, word frequency |
| Generator | 9 | QR codes, Lorem Ipsum, number generators, barcode scanning, passphrases, usernames |
| Calculation | 51 | Everyday maths, algebra, geometry and solids, statistics, regression, dates, sleep cycles, rounding, fuel and electricity cost, pricing |
| Image | 18 | Resize, crop, compress, convert, filters, collage, ASCII art — all local |
| Unit converter | 33 | Length, mass, volume, energy, pressure, data, typography, paper sizes, shoe sizes |
| Finance | 19 | EMI, investment, tax, amortisation, savings goal, debt payoff, simple interest, SIP, GST split |
| Randomizer | 11 | Wheel, dice, coin, rock-paper-scissors, random from a list, PINs, teams, 8-ball |
| Health | 8 | BMI, BMR, water, ideal weight, clinical calculations, TDEE and macros, heart-rate zones, due date |
| Development | 36 | JSON, YAML, base64, hashes, HMAC, MD5, JWT, cron, ULID, CIDR, MIME, Markdown, configs, TypeScript, query strings, SQL lists |
| Colours | 10 | Picker, blend, WCAG contrast, colour-blindness simulation, palette from an image, harmony, tints and shades |
| Science | 12 | Ohm's law, molar mass, pH, half-life, density, wavelength, periodic table, ideal gas, projectiles, molarity |
| Geo | 10 | Distance, bearing, midpoint, DMS, sunrise, GPS speed, polygon area, antipodes, cardinal points, coordinate rounding |
| Audio | 9 | Tone generator, metronome, noise, binaural beats, decibel meter, recorder, tap tempo, Hz to note |
| Games | 10 | Tic-tac-toe, memory, hangman, Wordle, Simon, trivia, reaction time, typing speed |
| Travel | 5 | Packing lists, flight duration, bag sizes, plug types, flight carbon |
| Nature | 6 | Moon phase, solstices, sun exposure, night-sky brightness, golden hour, day length |
| Productivity | 8 | Pomodoro, habits, notepad, sketch pad, flashcards, backup and restore, checklists, meeting cost |
| Files & Data | 12 | ZIP, gzip, file hashing, file encryption, sealed notes, CSV, EXIF and GPS, base64 both ways, file type detection |
| Almanac | 5 | Panchang, rahu kaal, sun and moon times, planetary hours, tithi calendar |
| Communication | 5 | vCard, calendar invites, message links, SMS counting, phone formatting |
| **Reference** | 5 | ASCII table, Big-O cheatsheet, regex cheatsheet, country dial codes, keyboard shortcuts |
| **System** | 3 | Device and screen info, browser feature check, local storage usage |

## Getting it

```bash
git clone https://github.com/drsamonline/kitbox.git
cd kitbox
open kitbox.html        # or: xdg-open kitbox.html
```

Or serve it: `python3 -m http.server` and visit `http://localhost:8000`. Both work; the app has no dependency on being served.

## Finding a tool

- **`Ctrl K`** (or `⌘ K`) searches all 338 tools from anywhere. Exact names first, then prefixes, word starts, substrings, and an ordered-letters fallback — so `panchng` still finds Panchang.
- **`/`** opens the same search when you are not typing in a field.
- **Pin** a tool with the star on its page; pinned and recently used tools appear at the top of the home screen.
- **All tools A–Z** lists everything alphabetically if you would rather browse.

## Where the tools came from

Kitbox began as one file with 239 tools. It has grown in two passes, all rewritten to run inside this page:

| From | Brought over |
|---|---|
| `export-kit` | Store-only ZIP writer (local headers, central directory, CRC32) |
| `compress-kit` | GZIP compress and decompress over Compression Streams |
| `crypto-kit` | AES-256-GCM with PBKDF2-SHA256 keys; file encryption and sealed notes |
| `astro-kit`, `app-panchang` | Julian day, Meeus solar and lunar longitude, Lahiri ayanamsa, tithi, nakshatra, yoga, karana, rahu kaal, planetary hours |
| `app-image-toolkit` | EXIF and GPS reading, and metadata stripping that leaves pixels untouched |
| `ml-kit` | tf-idf keyword ranking and cosine similarity |
| `TTB`, `All4ONE` | Statistics, regression, sig figs, fuel and electricity cost, pricing, savings, debt payoff, ULID, base32/base58, HMAC, MD5, CIDR, MIME, Markdown, config parsing, .gitignore, vCard, ICS, message links, tap tempo, meeting cost |

## What it refuses to do

- **No network calls.** Not for updates, not for fonts, not for analytics. The test suite fails if a `fetch`, `XMLHttpRequest`, `WebSocket` or `EventSource` appears in the file, or if any external script, stylesheet, font or image is added.
- **No silent uploads.** Files are read with `FileReader` and written with `Blob` and `a[download]`. There is no server to send them to.
- **No telemetry.** Nothing is counted, profiled or reported.
- **No account.** There is nothing to sign into.

Outbound *links* exist in exactly one place: the Support page, where Ko-fi, PayPal, the book store and the email address are links you may choose to click. They are not loaded by the page.

## Accuracy, honestly

- The panchang uses the Meeus solar and lunar series with an approximate Lahiri ayanamsa. Tithi and nakshatra boundaries land within roughly a minute of a published almanac; **they are approximations, and local tradition may differ.** The test suite pins the solar and lunar longitudes to the published Meeus worked examples.
- Health, finance and science calculators use standard public formulas. They are general-purpose tools, not professional instruments — nothing here is a substitute for medical, financial or legal advice.
- MD5 is included for legacy checksums only. It is not collision-resistant and must never be used for passwords.
- File encryption needs a secure context (https or localhost) for Web Crypto, and a lost passphrase cannot be recovered.

## Tests

```bash
npm ci
npm test
```

27 checks: every tool renders, ids and names are unique, all 50 routes resolve, the ported algorithms match reference values, the new arithmetic is spot-checked against known answers, the support page carries the real payment details, user text is escaped rather than parsed as markup, and the file loads nothing external.

## Your data

Tools that remember things between visits — Notepad, Flashcards, Trivia Creator, Sketch Pad's palette, Scoreboard, Habit Tracker, Packing List, Checklists, currency rates, ruler calibration, the unit converter's last pair, pinned tools, recents, the Panchang's last location — store it in this browser's `localStorage` under the `tooly:` prefix. It never leaves the device, and clearing browser data erases it. **Productivity → Backup & Restore** exports everything to one JSON file, and **System → Local Storage Usage** shows what is being held.

## Support

Free, offline, accountless — and staying that way. If it earned its keep:

| | |
|---|---|
| UPI (India) | `drsohilboi@ybl` — payee Dr. Sohil Momin, open amount, or scan the QR on the Support page |
| Ko-fi | [ko-fi.com/matneo](https://ko-fi.com/matneo) |
| PayPal | [paypal.me/drsohilmomin](https://paypal.me/drsohilmomin?locale.x=en_GB&country.x=IN) |
| My books | [Amazon author store](https://www.amazon.com/stores/author/B08ZT331LY/allbooks?ccs_id=aed72b9f-71d9-41dc-adee-e9368a317acc) |
| More apps | [drsamonline.github.io](https://drsamonline.github.io/) |
| Email | [sohilmomin2000@gmail.com](mailto:sohilmomin2000@gmail.com) |

Nothing is gated behind it: no paid tier, no account, no tracking. Supporting it buys the next version, not a feature.

## Licence

PolyForm Noncommercial 1.0.0 — see [LICENSE](LICENSE).

Crafted by **Dr. Sohil Momin, BHMS** — Vadodara, Gujarat, India.
