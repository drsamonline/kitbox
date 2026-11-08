# Plan — batches, in the order they should ship

The 119 items in [ROADMAP.md](ROADMAP.md), grouped into 15 batches. Quick wins first, structural work later, small items merged where they touch the same file and the same test.

**Totals:** 15 batches, ~56 focused days. The useful line is at **B10 (~25 days)**: everything above it is polish and stability, everything below it is reach and re-architecture.

---

## Progress

| Batch | Version | State | Tests after | Size after |
|:--|:--|:--|--:|--:|
| B0 | 1.1.2 | **shipped** — seventeen CI gates, four policy docs, generated `ALL_TOOLS.md`, `docs/` site | 27 | 623 KB |
| B1 | 1.2.0 | **shipped** — 18 quick wins in the shell | 42 | 633 KB |
| B2 | 1.2.1 | **shipped** — contrast measured per tile, axe across 50 pages, keyboard path for Sketch Pad | 51 | 638 KB |
| B3 | 1.3.0 | **shipped** — aliases, category filter, prev/next, recent searches, `g`-chords | 63 | 647 KB |
| B4 | 1.4.0 | next — the stability spine | — | — |

Every shipped batch is green on CI: the suite, the axe sweep, the badge and manifest and plan checks, the landing and docs freshness checks, the security greps and the size budget.

---

## How a batch works

1. **One batch = one pull request = one version bump = one changelog entry.** No half-migrations.
2. **Every batch ends green on CI with new tests for what it changed.** A batch that adds behaviour without a test is not finished.
3. **Combine small items that share a file or a test.** Copy buttons and paste buttons both touch every tool's markup, so they ship together. A CSS contrast fix and a storage migration do not, so they never do.
4. **Never combine a structural change with a cosmetic one.** If the batch has to be reverted, the revert must not take a nice-to-have with it.
5. **Cap: ten items per batch**, unless they are one mechanical sweep across all 338 tools.
6. **Order is dependency order, not preference order.** B4 exists because B5, B7 and B10 all assume references are stable and failures are visible.

---

## The batches

| # | Version | Theme | Items | Effort | Depends on | Done when |
|:--|:--|:--|--:|--:|:--|:--|
| **B0** | 1.1.2 | Housekeeping — no app change | 8 | ½ d | — | CI checks MANIFEST and the size budget; docs exist; `ALL_TOOLS.md` generated |
| **B1** | 1.2.0 | Quick wins in the app | 18 | 2 d | B0 | The twenty smallest frictions are gone; nothing new to learn |
| **B2** | 1.2.1 | Contrast and accessibility | 9 | 1½ d | B1 | Every tile passes AA; `axe` runs in CI |
| **B3** | 1.3.0 | Findability | 9 | 2 d | B1 | You can find a tool by typing what you call it |
| **B4** | 1.4.0 | The stability spine | 10 | 3½ d | B1 | Codes and ids are stable; a broken tool cannot blank the app |
| **B5** | 1.5.0 | Tool consistency sweep | 10 | 4 d | B4 | Every tool copies, resets, and remembers alike |
| **B6** | 1.5.1 | Preferences and permalinks | 3 | 1½ d | B5 | Numbers read Indian; a result can be linked |
| **B7** | 1.6.0 | Storage you can trust | 7 | 3 d | B4 | Versioned, migratable, exportable, erasable |
| **B8** | 1.6.1 | Security hardening | 6 | 2 d | B4 | CSP set, inputs fuzzed, EXIF orientation kept |
| **B9** | 1.6.2 | Performance | 5 | 1½ d | B1 | Boot measured, timezone list cached, `.gz` published |
| **B10** | 1.7.0 | Testing depth | 6 | 3½ d | B4, B7 | Every tool has an interaction test; calculators have fixtures |
| **B11** | 1.7.1 | Distribution | 6 | 1 d | B0 | Pages live, a tagged release with checksums |
| **B12** | 2.0.0 | Architecture | 9 | 8 d | B10 | `src/` + build; one `register()`; lint and typecheck |
| **B13** | 2.1.0 | Reach — i18n and new categories | 10 | 12 d | B12 | Hindi and Gujarati; Accessibility and Clinical categories |
| **B14** | 2.2.0 | Packaging | 3 | 10 d | B12 | EXE and APK from the same source |

---

## Batch details

### B0 — Housekeeping (½ day, no app change)

**Items:** E-17 `ALL_TOOLS.md` generated · E-18 CONTRIBUTING, SECURITY, PRIVACY, USAGE · E-72 size budget in CI · E-77 CI check for `eval`, `new Function`, unsafe `innerHTML` · E-91 MANIFEST freshness · E-115 `docs/index.html` mirror · E-117 issue template asking for Device info · E-119 public changelog page.

*Why first:* it costs half a day, touches no app code, and every later batch inherits the guards. E-77 in particular may find something — better to know before rewriting a category.

*Risk:* none to the app. The only risk is a CI check that fails on existing code, which is the point.

---

### B1 — Quick wins in the app (2 days, 18 items)

**Items:** E-01 `<noscript>` · E-02 stale empty-category copy · E-03 404 route · E-04 print stylesheet · E-05 copy on every output · E-06 file-size guards · E-07 passphrase strength hint · E-08 `title` on clipped names · E-09 Open Graph tags · E-10 skip link · E-11 focus `<h1>` on route change · E-12 `aria-live` on results · E-13 first-run `Ctrl K` hint · E-16 `?q=` deep link · E-25 palette focus ring · E-26 palette count announcement · E-38 breadcrumb links to category · E-40 scroll restore.

*Why grouped:* every one is a few lines in the shell (`route`, `renderTool`, `renderHome`, the palette), not in a tool. One pass through the router fixes sixteen of them. E-06 is the only one that touches tool code, and only four tools.

*Tests:* route test for a bad hash; copy-button test on three representative tools; `?q=` opens the palette with the query filled.

---

### B2 — Contrast and accessibility (1½ days)

**Items:** E-21 per-tile text colour from the measured ratio · E-22 darken `#E31C7D` and `#4C6EF5` · E-23 `axe-core` in CI · E-24 keyboard path for Sketch Pad · E-27 landmarks · E-28 `prefers-contrast` · E-29 reduced-transparency note · E-30 text-size preference · E-31 recorded tab order.

*Why after B1:* B1 adds a focus ring and a skip link; measuring contrast before the shell is settled means measuring twice.

*Tests:* a contrast assertion for all 23 tiles in the smoke suite (compute, do not eyeball); `axe` with zero violations on five pages.

*The one number that must not regress:* 0 tiles below 4.5:1.

---

### B3 — Findability (2 days)

**Items:** E-14 "new" chip · E-15 prev/next tool · E-32 per-category filter · E-33 keyword aliases · E-34 search across group labels · E-35 rank pinned and recent · E-36 palette history · E-37 `⌘1`–`⌘9` · E-39 `g`-chords.

*Why here:* all nine are search-index work in one file (`TOOL_INDEX`, `scoreTool`, the palette). E-14 and E-33 need two metadata fields — `since` and `keywords` — added by hand to ~40 registrations, not the full E-86 rewrite. That rewrite is B12.

*Tests:* alias queries return the intended tool (`emi` → Loan EMI); ranking puts a pinned tool above an unpinned one at equal score; history round-trips.

---

### B4 — The stability spine (3½ days, the hinge of the plan)

**Items:** E-63 error boundary around `tool.render()` · E-64 local error log · E-65 capability chips · E-66 disable rather than fail · E-67 one guarded `crypto.subtle` helper · E-68 timer-leak test · E-69 explained retry on file reads · E-83 stable tool codes · E-84 stable ids with aliases · E-92 stable-id test.

*Why this is one batch:* these are the items every later batch leans on. B5 caches state per tool (needs stable ids), B7 migrates storage (needs a schema, which needs stable keys), B10 tests interactions (needs failures to be visible rather than fatal). Shipping them apart means shipping four half-done migrations.

*Why not earlier:* it is the first batch that can break a user's pins or links if done wrong. It goes after the cheap wins so there is something to release while it is being done.

*Tests:* mount every tool, unmount, assert no timer survives; rename an id and assert the old one still resolves; force a throw in a tool and assert the app stays usable.

---

### B5 — Tool consistency sweep (4 days, the mechanical one)

**Items:** E-42 example button · E-43 standard reset · E-44 per-tool state cache · E-46 standard error wording · E-47 explain disabled buttons · E-48 drag-and-drop files · E-49 paste-from-clipboard · E-52 copy as CSV/Markdown · E-53 empty-state suggestions · E-54 unit suffixes.

*Why one batch:* each is a decision that has to be made the same way 338 times. Splitting them means revisiting every tool four times. E-42 in particular should be opt-in per tool (`example: {a: 100, b: 125}` in the registration), so the sweep is: add the hook, wire 30 good examples, leave the rest for later commits without blocking the batch.

*Tests:* state cache round-trip on five tools; copy-as-CSV output matches a fixture; every tool with an `example` hook produces a non-empty result.

---

### B6 — Preferences and permalinks (1½ days)

**Items:** E-45 permalinks for scalar inputs · E-50 metric/imperial preference · E-51 Indian vs international number grouping.

*Why separate:* E-51 changes the output of about forty tools, and it is the change most likely to be *wrong* in a way a user notices. It deserves its own version number and its own revert path.

*Tests:* fixture per number format; a permalink round-trip on three tools.

---

### B7 — Storage you can trust (3 days)

**Items:** E-55 storage schema version and migrations · E-56 backup allow-list derived from the registry · E-57 quota handling · E-58 erase per tool · E-59 encrypted backups · E-61 version stamp in the backup file · E-62 per-tool usage inside Backup.

*Why after B4:* a migration without stable keys is a guess. This batch is where the 1.0.0 regression — backup silently dropping the new keys — becomes structurally impossible.

*Tests:* write a v0 backup, restore it, assert every key arrives; fill the quota artificially and assert a readable message instead of a silent failure.

---

### B8 — Security hardening (2 days)

**Items:** E-76 CSP meta · E-78 fuzz the text inputs · E-79 keep EXIF `Orientation` when stripping · E-80 best-effort buffer wipe, stated honestly · E-81 warn above ~100 MB before encrypting · E-82 written threat model.

*Why after B4:* the error boundary makes a fuzz failure a test result rather than a blank page.

*Tests:* a committed payload list driven through every text-taking tool; a JPEG with Orientation=6 survives a strip with the tag intact.

---

### B9 — Performance (1½ days)

**Items:** E-70 cache the timezone list · E-71 in-browser `?bench` mode · E-73 defer heavy data tables · E-74 virtualise tables past ~500 rows (only if the bench says it is needed) · E-75 publish the `.gz`.

*Why late:* the measurements so far are jsdom measurements, and jsdom is not a browser. Build the bench first, then fix what it reports — which may not be the list above.

---

### B10 — Testing depth (3½ days)

**Items:** E-93 one interaction test per tool · E-94 round-trip property tests · E-95 calculator fixtures · E-96 file-input tests with synthetic `File` objects · E-97 coverage on extracted functions · E-98 landing-page link test.

*Why after B4 and B7:* interaction tests need the error boundary (or one failing tool kills the suite) and fixtures need the storage schema (or they write to a shape that is about to change).

*The bar:* every one of the 338 tools has at least one assertion beyond "it rendered".

---

### B11 — Distribution (1 day)

**Items:** E-109 enable GitHub Pages · E-111 a tagged release with `.gz` and `SHA256SUMS` · E-112 `/latest` redirect · E-114 list Kitbox on `drsamonline.github.io` · E-19 release tags per version · E-20 `kitbox.min.html` build artifact.

*Why here:* it is the first point where the app is stable enough that a download should be frozen and checksummed.

*Note:* E-109 needs a permission this account's token does not have — it is a two-minute click in Settings → Pages, and everything else in the batch waits on it.

---

### B12 — Architecture (8 days, the big one)

**Items:** E-90 extract pure algorithms · E-41 one `register()` API · E-86 full metadata on every registration · E-88 ESLint · E-89 `tsc --checkJs` · E-85 `src/` + build with CI asserting the built file matches · E-87 generated docs from metadata · E-116 a page per category · E-118 the "how a tool is written" guide.

*Order inside the batch:* extract functions → lint → typecheck → `register()` → split source → generate docs. Doing the split first would mean doing it twice.

*Why last of the structural work:* it touches all 338 tools at once and buys nothing a user can see. It is the tax paid for every future batch being cheaper.

*The rule that keeps it honest:* the committed `kitbox.html` must be byte-identical to what `build.py` produces, asserted in CI. If that check is ever removed, the split has failed.

---

### B13 — Reach (12 days)

**Items:** E-100 string dictionary · E-101 English/Hindi/Gujarati · E-102 locale-aware numbers and dates · E-103 translatable names and descriptions · E-104 Devanagari rendering check · E-99 visual regression baselines · E-105 Accessibility category · E-106 Education category · E-107 Clinical category · E-108 Money (India) category.

*Split into two releases in practice:* i18n (E-100–E-104) is one version; the four categories and the tools behind them are another. The clinical category cannot ship without a clinician's sign-off recorded in `AUDIT.md`, and that is a calendar dependency, not a coding one.

---

### B14 — Packaging (10 days)

**Items:** E-110 Windows EXE and Android APK via `app-builder` · E-113 inlined web-app manifest · E-60 IndexedDB for notes and decks.

*Why last:* the EXE and APK wrap a file that should stop changing first, and IndexedDB only matters once notes and decks are big enough to hit the 5 MB `localStorage` ceiling — which is a user-data question, not an engineering one.

---

## Dependency graph

```
B0 ──► B1 ──► B2
        │
        ├──► B3 ──► (B12 for full metadata)
        │
        └──► B4 ──┬──► B5 ──► B6
                  ├──► B7 ──┐
                  ├──► B8   │
                  └──► B9   │
                            ▼
                           B10 ──► B12 ──┬──► B13
                                          └──► B14
B0 ─────────────────────────────────────► B11
```

The only hard edges are B4 → (B5, B7, B10) and B10 → B12. Everything else can be reordered without pain.

---

## The cut line

If time is short, ship B0 through B10 and stop. That is ~25 days and it delivers: nothing broken, nothing silently lost, everything findable, every number verified, and a tagged release. B11–B14 are worth doing but none of them fix a problem a user has today.

**The three batches not to skip even under pressure:** B0 (the guards are cheap and permanent), B4 (stable references — every later shortcut depends on it), and B10 (the tests are what make the next two years safe).

---

## Item index — every roadmap item, and where it ships

| Batch | Items |
|:--|:--|
| B0 | E-17, E-18, E-72, E-77, E-91, E-115, E-117, E-119 |
| B1 | E-01, E-02, E-03, E-04, E-05, E-06, E-07, E-08, E-09, E-10, E-11, E-12, E-13, E-16, E-25, E-26, E-38, E-40 |
| B2 | E-21, E-22, E-23, E-24, E-27, E-28, E-29, E-30, E-31 |
| B3 | E-14, E-15, E-32, E-33, E-34, E-35, E-36, E-37, E-39 |
| B4 | E-63, E-64, E-65, E-66, E-67, E-68, E-69, E-83, E-84, E-92 |
| B5 | E-42, E-43, E-44, E-46, E-47, E-48, E-49, E-52, E-53, E-54 |
| B6 | E-45, E-50, E-51 |
| B7 | E-55, E-56, E-57, E-58, E-59, E-61, E-62 |
| B8 | E-76, E-78, E-79, E-80, E-81, E-82 |
| B9 | E-70, E-71, E-73, E-74, E-75 |
| B10 | E-93, E-94, E-95, E-96, E-97, E-98 |
| B11 | E-19, E-20, E-109, E-111, E-112, E-114 |
| B12 | E-41, E-85, E-86, E-87, E-88, E-89, E-90, E-116, E-118 |
| B13 | E-99, E-100, E-101, E-102, E-103, E-104, E-105, E-106, E-107, E-108 |
| B14 | E-60, E-110, E-113 |

119 items, 15 batches, each item in exactly one place.

---

*If an item is dropped, remove it here and from the roadmap in the same commit — a plan with dead entries stops being read.*
