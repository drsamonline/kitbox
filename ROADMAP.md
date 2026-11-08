# Roadmap — every enhancement worth doing

An exhaustive backlog for Kitbox, written after building the 1.0–1.1.1 releases. Everything here is specific to this codebase: each item names the file, the mechanism, or the measurement that justifies it. Nothing is here because it would sound good in a pitch.

**Legend.** Effort: **S** ≈ under half a day, **M** ≈ one to three days, **L** ≈ a week or more. Impact: **★★★** users feel it immediately, **★★** it removes a class of bug or friction, **★** hygiene that pays off later.

**The rule that governs all of it:** the app stays one file, with no dependency, no network call, and no account. Any item that breaks that rule is listed at the end under [Deliberately not doing](#deliberately-not-doing) with the reason.

---

## 0. The three findings that should set the order

These are measured, not guessed.

**0.1 — 14 of 23 category tiles fail WCAG AA with white text.** White on `#22D9D9` is 1.75:1; the AA threshold is 4.5:1. Two tiles fail with *both* white and dark ink (`#E31C7D` 4.44/4.02, `#4C6EF5` 4.32/4.13), so those two colours need adjusting rather than just a text colour swap. Full table in [§2](#2-accessibility).

**0.2 — tool codes are positional, so inserting a tool renumbers everything after it.** `GEN-01`, `UNI-31` and the rest come from a counter incremented at registration. Add a tool in the middle of a category and every later code shifts — and codes are what a user quotes in a bug report. Needs a committed, stable map ([E-41](#9-architecture--build)).

**0.3 — pinned tools are stored as `{cat, tool}` ids.** Rename an id and a user's pin silently points at nothing. There is no alias map and no test that ids are stable ([E-44](#10-testing--qa)).

Everything in §1 is a quick win; §2–§11 are ordered by the leverage they carry.

---

## 1. Quick wins (each S, most ★★ or ★★★)

| # | Item | Why |
|:--|:--|:--|
| E-01 | **Add `<noscript>`** with a one-line "Kitbox needs JavaScript — it is all local, nothing is sent" | A blank white page with no explanation is the current behaviour when JS is off |
| E-02 | **Replace the stale empty-category copy** ("coming in the next build stage") | No category is empty any more; the string is a leftover |
| E-03 | **404 route** — an unknown hash renders a "no such tool" panel with a search box | Today it silently falls through to home, which reads as a broken link |
| E-04 | **Print stylesheet** (`@media print`) — hide chrome, print the panel white on white | People already print calculator results; they get the dark shell and the heart icon |
| E-05 | **Copy button on every textual output**, via one delegated handler | 24 places already use `navigator.clipboard` by hand; the other ~60 have nothing |
| E-06 | **File-size guard** in ZIP, gzip, hash and encrypt tools (warn above ~200 MB) | They read the whole file into memory; a 2 GB video currently locks the tab |
| E-07 | **Passphrase strength hint** on Encrypt/Decrypt and Sealed Note | The only password field in the app with no feedback at all |
| E-08 | **`title` attributes on truncated tile names** | Long names clip at small widths with no way to read them |
| E-09 | **Open Graph tags + `og:image` on the landing page** (reuse the banner SVG as PNG) | Sharing the link currently produces no preview card |
| E-10 | **Skip link** (`Skip to tools`) before the topbar | Keyboard users tab through the bar on every page |
| E-11 | **Focus the `<h1>` on route change** | Screen readers currently stay where the previous page was |
| E-12 | **`aria-live="polite"` on `.output` blocks** | Results update silently for assistive tech |
| E-13 | **First-run hint**: one line under the search box, "Press Ctrl K anywhere", dismissed on first use, stored | The palette is the best thing in the app and it is invisible |
| E-14 | **"New" chip** on tools added in the current minor release | 59 arrived in 1.1.0 and are indistinguishable from the rest |
| E-15 | **Prev / next tool** arrows on a tool page, within its category | Exploring a category means going back to the grid every time |
| E-16 | **`?q=` deep link** — `kitbox.html?q=hash` opens the palette pre-filled | Makes a search shareable in a message |
| E-17 | **`ALL_TOOLS.md`** generated from the registry, as `TTB` does | A citable list outside the app, and a diff-able record of what exists |
| E-18 | **`CONTRIBUTING.md`, `SECURITY.md`, `PRIVACY.md`, `USAGE.md`** | Every sibling repo has them; this one has none |
| E-19 | **Release tags with the single file, a `.gz`, and a `SHA256SUMS` file** | Downloading from `main` gives no fixed version and no way to verify it |
| E-20 | **`kitbox.min.html` build artifact** (whitespace/comment strip, keep the readable file as canonical) | 621 KB of commented, readable source is a feature; a 300 KB copy is a convenience |

---

## 2. Accessibility

**The measured problem.** Text on the category tiles is 13.5 px semibold, so it needs 4.5:1, not the 3:1 large-text allowance.

| Tile | Colour | White | Ink | Verdict |
|:--|:--|--:|--:|:--|
| Randomizer | `#22D9D9` | 1.75 | 10.19 | dark ink |
| Generator | `#9FCB1B` | 1.90 | 9.38 | dark ink |
| Health | `#1FCE9C` | 2.03 | 8.81 | dark ink |
| Finance | `#3FCB6B` | 2.11 | 8.47 | dark ink |
| Games | `#F59F00` | 2.13 | 8.36 | dark ink |
| Text | `#E6A400` | 2.17 | 8.22 | dark ink |
| Colours | `#F2871A` | 2.54 | 7.02 | dark ink |
| Development | `#12A99A` | 2.93 | 6.09 | dark ink |
| Geo | `#0E9F6E` | 3.39 | 5.27 | dark ink |
| Nature | `#2F9E44` | 3.45 | 5.18 | dark ink |
| Calculation | `#F4483D` | 3.60 | 4.96 | dark ink |
| Image | `#2F86EB` | 3.66 | 4.87 | dark ink |
| Files & Data | `#4C6EF5` | 4.32 | 4.13 | **neither — adjust colour** |
| General | `#E31C7D` | 4.44 | 4.02 | **neither — adjust colour** |
| Unit, Science, Audio, Travel, Productivity, Almanac, Communication, Reference, System | — | ≥4.5 | — | fine as-is |

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-21 | **Pick text colour per tile from the measured ratio** — compute once at registration, not by eye | S | ★★★ |
| E-22 | **Nudge `#E31C7D` and `#4C6EF5` darker** so one of the two text colours clears 4.5:1 | S | ★★ |
| E-23 | **Run `axe-core` in CI** against home, a category, a tool page, the support page and the landing page | M | ★★★ |
| E-24 | **Keyboard operability for canvas tools** — Sketch Pad has no keyboard path at all; add a focusable canvas with arrow-key cursor | M | ★★ |
| E-25 | **Visible focus in the palette** — the highlighted row uses background only; add a focus ring | S | ★★ |
| E-26 | **Announce palette result counts** (`3 results`) via a live region | S | ★★ |
| E-27 | **Landmark structure** — `<main>`, `<nav>` for the topbar, and a labelled `<header>` | S | ★ |
| E-28 | **`prefers-contrast: more`** — raise the muted grey (`#a7adb9` on `#0b0e14` is 8.0:1, fine) and darken the panel hints | S | ★ |
| E-29 | **Respect `prefers-reduced-transparency`** if a translucent surface is ever added; note it now so it is not forgotten | S | ★ |
| E-30 | **Text-size preference** (100 / 112 / 125 %) stored per device | M | ★★ |
| E-31 | **Test the tab order end to end** and record it in `AUDIT.md`, as the sibling repos do | S | ★ |

---

## 3. Search and navigation

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-32 | **Per-category filter box** — 51 calculation tools is a long scroll | S | ★★★ |
| E-33 | **Keyword aliases per tool** (`emi` → Loan EMI, `qr` → QR Code, `utc` → Unix Timestamp) so the thing people type finds the thing they mean | M | ★★★ |
| E-34 | **Search across group labels** — `Remove Tools` inside Text is currently unreachable by name | S | ★★ |
| E-35 | **Rank pinned and recent tools higher** for equal scores | S | ★★ |
| E-36 | **Search history** in the palette (last 5, stored locally, clearable) | S | ★ |
| E-37 | **Keyboard digits** — `⌘1`…`⌘9` opens the nth result | S | ★ |
| E-38 | **Breadcrumb on a tool page links back to its category** — currently plain text | S | ★★ |
| E-39 | **`g` then `h` / `a` / `s`** — home, all tools, support, in the app's own style | S | ★ |
| E-40 | **Scroll position restored** when returning to a category from a tool | S | ★★ |

---

## 4. Tool-level consistency

The app has 338 tools written over three passes. These are the seams where they do not yet behave alike.

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-41 | **One `register()` API** replacing `txt/gen/calc/fin/rnd/health/dev/clr/sci/geo/aud/game/trv/nat/prod/imgtool/fil/alm/com/ref/sys/unitTool` | M | ★★ |
| E-42 | **Standard "example" button** — every input-heavy tool gets one click that fills a worked example | M | ★★★ |
| E-43 | **Standard reset** — one placement, one wording, everywhere | S | ★★ |
| E-44 | **Per-tool state cache** — leaving a tool and coming back keeps your inputs (in memory, not storage) | M | ★★★ |
| E-45 | **Permalink for simple tools** — encode a handful of scalar inputs in the hash (`#/tool/calc/percentage?a=100&b=125`) | M | ★★ |
| E-46 | **Standard error wording** — "what went wrong" plus "what to do", in one component | S | ★★ |
| E-47 | **Explain disabled buttons** — say why, not just grey out | S | ★ |
| E-48 | **Drag-and-drop file inputs** everywhere a file is read | S | ★★ |
| E-49 | **Paste-from-clipboard button** next to the big textareas | S | ★★ |
| E-50 | **Metric/imperial preference** applied to every tool that takes a length, weight or temperature | M | ★★ |
| E-51 | **Number-format preference** — Indian grouping (`₹1,00,000`) vs international (`₹100,000`), currently mixed | M | ★★★ |
| E-52 | **"Copy as CSV / Markdown"** on every result table | S | ★★ |
| E-53 | **Empty-state suggestions** — "nothing here yet, try X" instead of a bare dash | S | ★ |
| E-54 | **Consistent unit suffixes in inputs** (`km`, not `Distance`) | S | ★ |

---

## 5. Data and storage

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-55 | **Storage schema version** (`tooly:schema`) with forward migrations | M | ★★★ |
| E-56 | **Backup allow-list derived from a registry**, not a hand-typed `KNOWN_KEYS` | S | ★★ |
| E-57 | **Quota handling** — catch `QuotaExceededError`, tell the user which tool is full, offer export | M | ★★ |
| E-58 | **Per-tool "erase this tool's data"** button | S | ★★ |
| E-59 | **Encrypted backup** — reuse the AES envelope already in the app | M | ★★ |
| E-60 | **IndexedDB for notes and decks** — `localStorage` caps around 5 MB, which a few hundred flashcards will reach | L | ★★ |
| E-61 | **Backup file includes the app version** so a restore can warn on a mismatch | S | ★ |
| E-62 | **Show storage usage per tool** inside Backup, not only in System | S | ★ |

---

## 6. Reliability and error handling

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-63 | **Error boundary around `tool.render()`** — catch, show a panel with "Copy error details", keep the rest of the app alive | S | ★★★ |
| E-64 | **Local-only error log** (`window.onerror` → ring buffer, viewable in System) | S | ★★ |
| E-65 | **Capability chips on tools that need hardware** — "needs camera", "needs https", shown before you tap | M | ★★★ |
| E-66 | **Disable, don't fail, when a capability is missing** — the tool stays visible but says why it cannot run | S | ★★ |
| E-67 | **Guard every `crypto.subtle` call** on secure context, in one helper | S | ★★ |
| E-68 | **Timer leak test** — patch `setInterval` in the harness, mount and unmount every tool, assert nothing is left running | M | ★★★ |
| E-69 | **Retry-with-explanation for file reads** that fail (permissions, detached blob) | S | ★ |

---

## 7. Performance and size

Measured in jsdom (indicative only — a browser is faster): boot and parse ≈ 2.4 s in jsdom, total render of all 338 tools ≈ 5.2 s, slowest single renders `general/tzconv` 474 ms, `colors/harmony` 357 ms, `calc/graphplotter` 255 ms.

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-70 | **Cache the timezone list** — `tzconv` and `worldclock` both build it per render | S | ★★ |
| E-71 | **Measure in-browser, not jsdom** — add a tiny `?bench` mode that times every `render()` and prints a table | S | ★★ |
| E-72 | **Size budget in CI** — fail if `kitbox.html` grows past a stated ceiling without the number being changed deliberately | S | ★★ |
| E-73 | **Defer heavy data tables** (periodic table, dial codes, ASCII) into functions called on open, not top-level constants | S | ★ |
| E-74 | **Virtualise any table over ~500 rows** (the ASCII table is 128, fine; the tithi calendar and day-length tables are per-month, fine) | M | ★ |
| E-75 | **Publish the `.gz`** — 621 KB of HTML is roughly 90 KB gzipped | S | ★★ |

---

## 8. Security and privacy hardening

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-76 | **CSP meta tag** — `default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'` | S | ★★ |
| E-77 | **CI check: no `eval`, no `new Function`, no `innerHTML =` with a bare variable** | S | ★★★ |
| E-78 | **Fuzz the text inputs** — a committed list of XSS payloads driven through every tool that takes text | M | ★★★ |
| E-79 | **Preserve the EXIF `Orientation` tag** when stripping metadata (today a rotated phone photo comes back sideways) | S | ★★ |
| E-80 | **Wipe decrypted buffers** best-effort after download, and say plainly that JS cannot guarantee it | S | ★ |
| E-81 | **Warn on encrypting a file over ~100 MB** — AES-GCM in one shot needs it all in memory | S | ★ |
| E-82 | **Document the threat model** in `SECURITY.md`: what a single-file app can and cannot protect against | S | ★★ |

---

## 9. Architecture and build

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-83 | **Stable tool codes** — a committed `codes.json` map so `UNI-31` never becomes `UNI-30` when a tool is inserted | M | ★★★ |
| E-84 | **Stable ids with an alias map** — renaming an id keeps old pins and links working | M | ★★★ |
| E-85 | **Split source + build** — `src/` modules and a `build.py` that assembles the single file, with CI asserting the built file matches the committed one | L | ★★ |
| E-86 | **Tool metadata fields** — `since`, `tags`, `requires`, `keywords` on every registration | M | ★★★ |
| E-87 | **Generated `ALL_TOOLS.md`** and a generated per-tool docs page from that metadata | M | ★★ |
| E-88 | **Lint** — ESLint with `no-unused-vars`, `no-implicit-globals`, `no-eval` on the extracted script | M | ★★ |
| E-89 | **Type check via JSDoc** — `tsc --checkJs` over the extracted script | L | ★★ |
| E-90 | **Extract pure algorithms** (`ASTRO`, CRC32, MD5, base32/58, the finance maths) into named functions that tests can import directly | M | ★★★ |
| E-91 | **`MANIFEST.json` freshness check in CI** — recompute the SHAs, fail on drift | S | ★★ |

---

## 10. Testing and QA

Today: 27 checks, all DOM-level.

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-92 | **Stable-id test** — a committed list of every `cat/id`; the build fails if one disappears without an alias | S | ★★★ |
| E-93 | **Per-tool interaction test** — at minimum, fill each tool's first input with a valid value and assert no throw | M | ★★★ |
| E-94 | **Round-trip property tests** — encode/decode pairs (base32, base58, base64, JSON↔YAML, CSV↔JSON, ZIP→unzip) asserted for random inputs | M | ★★★ |
| E-95 | **Fixture tests for the calculators** — a JSON of known input/output pairs, checked on every push | M | ★★★ |
| E-96 | **File-input tests with synthetic `File` objects** — the file tools are currently only tested for a clean render | M | ★★ |
| E-97 | **Coverage report** for the extracted pure functions | S | ★★ |
| E-98 | **Landing-page test** — links resolve, every category tile points at a real route | S | ★★ |
| E-99 | **Visual regression** — screenshot the home, one tool page and the landing, compare against committed baselines with a tolerance | L | ★★ |

---

## 11. Internationalisation and localisation

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-100 | **UI strings in one dictionary** — the first step before any translation, and the reason to do it now | M | ★★ |
| E-101 | **English / Hindi / Gujarati**, following `web-kit`'s approach | L | ★★★ |
| E-102 | **Locale-aware number and date formatting** everywhere, replacing hard-coded `en-IN` and `en-US` | M | ★★★ |
| E-103 | **Translatable tool names and descriptions** in the registry, with an English fallback | M | ★★ |
| E-104 | **Devanagari and Gujarati rendering check** in the screenshot suite | S | ★ |

---

## 12. New tools, by category

Every one of these is pure JS, no dependency, no network. This is the candidate list, not a promise.

**Text.** Word-level diff (the existing Text Diff is line-based); hyphenation points; syllable counter; case-preserving search and replace; Markdown table formatter; Unicode character inspector; lorem-from-a-word (deterministic filler); text expander (`{{name}}` placeholders); essay outline from headings; keyword-in-context (concordance).

**Development.** TOTP/HOTP generator (HMAC is already in the file); password entropy calculator; JSON Schema generator from a sample; regex explainer, token by token; CSS clamp/`min()`/`max()` builder; CSP header builder; Dockerfile generator; Makefile generator; `.env` file comparer; HTTP header builder; base64url codec; diff3 merge; `curl` → fetch converter; JWT signer (HS256), not only the decoder.

**Files.** **ZIP Extract** — `DecompressionStream('deflate-raw')` makes this possible with no library; file splitter and joiner; duplicate file finder by hash across a multi-select; batch renamer that writes a renamed ZIP; CSV → SQL inserts; file metadata timeline.

**Calculation.** Compound annual growth (CAGR); EMI prepayment saving; break-even with variable cost; percentage-of-total and share-of-whole; standard deviation of a running series; date add/subtract with working days; time-zone-aware meeting planner; GPA/CGPA converter; significant-figures arithmetic.

**Money (India).** HRA exemption; EPF/VPF projection; gratuity; old vs new income-tax regime comparison; PPF and FD maturity; post-office scheme comparison; SIP step-up; per-unit electricity slab builder.

**Health (clinical, with the same disclaimers as the existing calculators).** Paediatric weight-based dose; IV drip rate; eGFR (CKD-EPI 2021); corrected calcium; anion gap; fluid deficit; pregnancy weight-gain band. *These carry real liability — each would ship with the calculation shown step by step, the formula cited, and a "not a prescription" line, and each would need a clinician's sign-off in `AUDIT.md` before release.*

**Almanac.** Moonrise and moonset; choghadiya; muhurat finder for a date range; ekadashi and sankranti dates for a year; sidereal time; sunrise direction on the horizon.

**Audio.** Chromatic tuner (microphone + autocorrelation); chord builder and player; interval ear trainer; note-name quiz.

**Games.** 2048; minesweeper; snake; sudoku solver (and generator); pong; a second typing passage set.

**Reference.** Unit circle; multiplication tables; Big-O of common operations per data structure; ASCII control codes with their escape sequences; Indian states and capitals; countries and capitals; keyboard layouts for Devanagari and Gujarati.

**System.** Clipboard inspector (paste and read, no read permission needed); font inspector (`document.fonts`); battery status; network information; print test page.

---

## 13. New categories

Only worth adding when they hold five or more tools; a category of two is a menu item with nothing behind it.

| # | Category | Tools it would hold | Verdict |
|:--|:--|:--|:--|
| E-105 | **Accessibility** | Reading ruler, dyslexia-friendly preview, letter/word spacing preview, focus-ring preview, large-text preview, motion preview | ★★ — five tools already exist in spirit; they need a home |
| E-106 | **Education** | Unit circle, multiplication tables, formula sheet, typing tutor, spelling drill, times-table quiz | ★★ |
| E-107 | **Clinical** | The six calculators in §12, kept apart from general Health on purpose | ★★★ for this author's own use, with sign-off required |
| E-108 | **Money (India)** | HRA, EPF, gratuity, tax regimes, PPF, FD | ★★ — the Finance category is already international in flavour and India-specific tools sit oddly in it |

---

## 14. Distribution and packaging

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-109 | **Enable GitHub Pages** (Settings → Pages → `main` / root) | S | ★★★ — the landing page is written and unreachable |
| E-110 | **Ship a Windows EXE and an Android APK** through `app-builder`, which exists for exactly this | L | ★★★ |
| E-111 | **A release per version** with `kitbox.html`, `kitbox.min.html`, `.gz`, `SHA256SUMS` | S | ★★ |
| E-112 | **A `/latest` redirect page** so a fixed URL always serves the newest release | S | ★ |
| E-113 | **Inlined web-app manifest** (data URI) so the file is installable without a second file | M | ★★ |
| E-114 | **Register in the `drsamonline.github.io` index** so it appears with the rest of the fleet | S | ★★ |

---

## 15. Documentation and community

| # | Item | Effort | Impact |
|:--|:--|:--|:--|
| E-115 | **`docs/index.html` mirroring the README** for people who arrive through Pages rather than GitHub | S | ★ |
| E-116 | **A page per category** with a screenshot and a sentence per tool | M | ★★ |
| E-117 | **An issue template that asks for the System → Device info output** | S | ★★ |
| E-118 | **A "how a tool is written" guide** — the ten-line shape every tool follows, with one worked example | M | ★★ |
| E-119 | **A public changelog page** generated from `CHANGELOG.md` | S | ★ |

---

## Deliberately not doing

Each of these has been considered and rejected for a stated reason. If a reason changes, the item moves up.

| Not doing | Why |
|:--|:--|
| **Cloud sync or accounts** | The entire value is that there is nothing to sign into and nothing to breach. A sync service turns a file into a product. |
| **Analytics of any kind** | Including privacy-preserving ones. A tool for offline clinics should not phone home at all. |
| **A service worker** | It solves a problem the single file already solves, at the cost of a cache-invalidation bug class and a second file. Offered instead as an optional `kitbox-pwa` variant if ever wanted. |
| **PDF editing** (merge, split, rotate) | Needs a PDF library, which breaks the no-dependency rule. `offline-pdf-toolkit` exists and does it properly. |
| **Anything requiring a bundled dataset over ~1 MB** | Country boundaries, ICD codes, drug databases. They belong in a separate app, as `repertory-reader` and `app-panchang` already do. |
| **AI features** | A model means a network call or a 100 MB download, and the app's honesty depends on being able to say "nothing leaves this device". |
| **Moving existing tools between categories** | Breaks pins, links and muscle memory for no functional gain. New categories get new tools. |
| **A dark mode for the panel** | The white panel on the dark shell is the app's identity, and the contrast it gives is better than most "dark modes". The text-size and contrast preferences in §2 cover the real need. |

---

## Suggested sequencing

**1.2 — "trust and find" (one week).** E-21, E-22, E-23 (contrast and axe), E-32 (category filter), E-33 (aliases), E-63 (error boundary), E-83, E-84, E-92 (stable codes and ids), E-14 (new chip), E-77 (CI security check). *Theme: nothing new, everything more findable and less likely to break silently.*

**1.3 — "the file" (two weeks).** E-05, E-42, E-44 (copy, example, state cache), E-55, E-56 (storage version and derived backup), E-06 (size guards), E-68 (timer leak test), E-93–E-95 (interaction, round-trip and fixture tests), E-109, E-111 (Pages and releases).

**2.0 — "reach" (a month).** E-85 (source split and build), E-100–E-102 (i18n and locale formatting), E-51 (number formats), E-110 (EXE and APK), E-105 and E-107 (Accessibility and Clinical categories), plus the strongest six from §12.

---

*Last updated with 1.1.1. If an item here is wrong or has been overtaken, delete it rather than leaving it to rot — a roadmap nobody prunes is worse than none.*
