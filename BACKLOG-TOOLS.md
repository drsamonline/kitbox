# Tools still to add — the exhaustive list

> **Shipped since this list was written (2.4.0):** IP Format Converter, Hash Identifier, UUID Analyser, Cron Generator, JWT Signer, Set Operations, Edit Distance, Hamming Distance, Word-Level Diff, Extract From Text, ZIP Extract, Tuner, and eight clinical scores (GCS, CURB-65, qSOFA, Wells DVT, Wells PE, CHA₂DS₂-VASc, HAS-BLED, Child-Pugh). Also shipped in 2.6.0: X.509 Certificate Reader, JSON Schema From a Sample, Regex Explainer, CSS Clamp Builder, Resistor Colour Code, Buffer pH, Ekadashi List, 2048, Minesweeper, Snake. The rows below are what remains.

Every candidate tool I can see, after reading **CyberChef** (506 operations), **it-tools** (80 tools) and this app's own gaps. Nothing here is a commitment; it is a list with enough detail that picking from it is easy.

**Effort:** **S** ≈ under an hour · **M** ≈ half a day · **L** ≈ a day or more.

**The two hard rules** every row obeys unless it says otherwise: no dependency, and no network. Anything that needs a library, a data file over ~100 KB, or a server is in the last table with the reason, not in the list.

**Where the idea came from** is in brackets: `[CC]` CyberChef, `[IT]` it-tools, `[KB]` this app's own gaps.

---

## Text (22)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| Word-level diff | M | Diff by word rather than by line — the one you want for prose | [KB] |
| Hyphenation | M | Break long words at syllable boundaries (Liang's algorithm, no dictionary) | [KB] |
| Syllable counter | S | Count syllables per word and estimate reading level | [KB] |
| Concordance | S | Every occurrence of a word with its line context | [KB] |
| A1Z26 cipher | S | Letters ↔ 1–26, both directions | [CC] |
| Affine cipher | S | Encode/decode with the a·x+b form, and say when the key is invalid | [CC] |
| Atbash cipher | S | The reversed alphabet, in one line | [CC] |
| Bacon cipher | S | A/B five-bit groups, with the 24- and 26-letter variants | [CC] |
| Rail fence cipher | S | Zig-zag transposition, 2–10 rails | [CC] |
| Bifid cipher | M | Polybius square transposition | [CC] |
| ROT47 | S | The printable-ASCII rotation | [CC] |
| ROT8000 | M | Unicode rotation, the modern ROT13 | [CC] |
| Quoted-printable | S | Encode/decode `=E2=80=94`-style email encoding | [CC] |
| Char codes | S | Text ↔ decimal/hex/octal code points, with a delimiter choice | [CC] |
| Hexdump | S | Classic `xxd`-style dump and the reverse | [CC] |
| Strip ANSI escapes | S | Remove colour codes from pasted terminal output | [CC] |
| Remove null bytes | S | The invisible byte that breaks parsers | [CC] |
| Leet speak | S | Convert to and from 1337 | [CC] |
| Escape/unescape string | S | `\n`, `\t`, `\"` — JS-style escapes, both ways | [CC] |
| Normalise Unicode | S | NFC/NFD/NFKC/NFKD, and show where they differ | [CC] |
| Punycode / IDN | S | `münchen.de` ↔ `xn--mnchen-3ya.de` | [CC] |
| Extractors (5 tools) | S each | Pull URLs, email addresses, IPs, MACs and domains out of a block of text | [CC] |

## Development (24)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| JWT signer | M | HS256/384/512 signature and verification — the Debugger only reads | [CC] |
| PBKDF2 derive | S | Derive a key from a passphrase and show it in hex/base64 | [CC] |
| HKDF derive | S | The other derivation everyone needs | [CC] |
| JWK ↔ PEM | M | Convert between the JSON key format and PEM | [CC] |
| ASN.1 parser | M | Decode a hex DER blob into a tree — the key to certificates | [CC] |
| X.509 certificate reader | L | Subject, issuer, validity, SANs from a `.pem` | [CC] |
| Parse CSR | L | What a certificate signing request actually asks for | [CC] |
| Hash identifier | S | Name a hash by its length and alphabet | [CC] |
| UUID analyser | S | Version, variant, and whether it is random or time-based | [CC] |
| IP format converter | S | One address in decimal, hex, octal and dotted form | [CC] |
| IPv6 ULA generator | S | A `fd00::/8` prefix for a private network | [IT] |
| Random port generator | S | An unused-looking high port, with a note on what is registered | [IT] |
| Email normaliser | S | Lowercase, strip dots and `+tags`, and say what that breaks | [IT] |
| Docker run → compose | M | Turn a `docker run` line into a `compose.yaml` | [IT] |
| Cron generator | S | Build a crontab line from dropdowns — the parser is the other half | [IT] |
| `.editorconfig` generator | S | The settings most repos actually want | [KB] |
| Dockerfile generator | M | Language, base image, port, and a multi-stage build | [KB] |
| Makefile generator | S | The five targets every project needs | [KB] |
| systemd unit generator | S | Service, restart policy, hardening flags | [KB] |
| JSON Schema from a sample | M | Infer a schema from an example object | [KB] |
| SemVer comparer | S | Is 1.2.3-beta.1 before 1.2.3? With the precedence rules shown | [KB] |
| Conventional commit helper | S | Type, scope, breaking change, and the line it produces | [KB] |
| Regex explainer | M | Walk a pattern token by token and say what each part matches | [KB] |
| CSS clamp builder | S | A fluid `clamp()` from a min, a max and two viewport widths | [KB] |

## Files & Data (9)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| **ZIP Extract** | M | Now possible without a library: read the central directory and inflate with `DecompressionStream('deflate-raw')` | [KB] |
| File splitter / joiner | S | Cut a large file into parts and put it back | [KB] |
| Duplicate finder | M | Hash a folder's files and group the matches | [KB] |
| Batch renamer | M | Rename inside a ZIP, with a preview | [KB] |
| CSV → SQL | S | `INSERT` statements, with quoting that survives an apostrophe | [CC] |
| File carver | L | Find embedded files (images, ZIPs) inside another file | [CC] |
| ELF header reader | M | Architecture, entry point, sections — for the "what is this binary" question | [CC] |
| File tree | S | A directory listing as a tree, from pasted paths | [CC] |
| MIME decoder | M | Unpack a `multipart/*` email body | [CC] |

## Calculation (7)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| Set operations | S | Union, intersection, difference, power set, Cartesian product of two lists | [CC] |
| Modular arithmetic | S | Modular exponentiation and inverse, with the steps | [CC] |
| Extended GCD | S | Bézout coefficients, which is how modular inverse works | [CC] |
| Levenshtein distance | S | Edit distance between two strings, and the alignment | [CC] |
| Hamming distance | S | Bit differences, for checksums and error codes | [CC] |
| Chi-square / index of coincidence | M | The two numbers a cryptanalyst starts with | [CC] |
| Date-time delta in working days | S | Business days between two dates with a holiday list | [KB] |

## Image (7)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| Invert | S | Negative of an image, alpha preserved | [CC] |
| Sharpen | S | Unsharp mask with an amount slider | [CC] |
| Dither | M | Floyd–Steinberg to 1-bit, for e-ink and pixel art | [CC] |
| HSL adjust | S | Hue rotation, saturation and lightness without a filter preset | [CC] |
| Opacity | S | Composite onto a chosen background at an alpha | [CC] |
| Normalise / auto-levels | S | Stretch the histogram to the full range | [CC] |
| Contrast stretch | S | The other half of brightness — with a histogram | [CC] |

## Science (8)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| RC / RL time constant | S | Charge and discharge curves with the numbers | [KB] |
| Lens equation | S | Focal length, object and image distance, magnification | [KB] |
| Doppler shift | S | Frequency shift for a moving source or observer | [KB] |
| Blackbody peak | S | Wien's law: colour temperature to peak wavelength | [KB] |
| Titration | S | Concentration from volume and molarity, with the equation shown | [KB] |
| Buffer pH | M | Henderson–Hasselbalch with the ratio | [KB] |
| Decibel conversions | S | dB, power ratio, voltage ratio, dBm | [KB] |
| Resistor colour code | S | Bands to value and back, in both directions | [KB] |

## Audio (4)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| Tuner | M | Microphone, autocorrelation, nearest note and cents off | [KB] |
| Chord builder | S | Notes of a chord, and the frequencies to play them | [KB] |
| Interval trainer | S | Play two notes, name the interval | [KB] |
| Note player | S | A piano keyboard that plays through Web Audio | [KB] |

## Games (5)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| 2048 | M | The one everybody plays once | [KB] |
| Minesweeper | M | With a first-click guarantee | [KB] |
| Snake | S | Arrow keys, a score, and a wall | [KB] |
| Sudoku solver | M | Paste a grid, get a solution and a difficulty read | [KB] |
| Pong | S | Two paddles, one ball, no network | [KB] |

## Money, India (5)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| Step-up SIP | S | A SIP that rises with income each year | [KB] |
| FD ladder | S | Split a lump sum across maturities and show the yield | [KB] |
| NPS corpus | S | Contribution, return and annuity split at 60 | [KB] |
| Leave encashment | S | Exemption rules for retirement vs resignation | [KB] |
| Salary structure splitter | M | CTC into basic, HRA, allowances and the take-home | [KB] |

## Almanac (4)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| Choghadiya | S | The day's eight segments and their quality, from sunrise | [KB] |
| Moonrise / moonset | M | Needs the lunar altitude crossing, which `ASTRO` nearly has | [KB] |
| Muhurat finder | M | Good windows for a given activity on a given day | [KB] |
| Ekadashi list | S | The year's ekadashi dates for a location | [KB] |

## Geo (3)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| UTM converter | M | Latitude/longitude ↔ UTM easting/northing and zone | [CC] |
| What three words, offline | L | Needs the wordlist; would add ~1 MB, so probably never | [KB] |
| Timezone from coordinates | M | Needs a coarse polygon set; borderline | [KB] |

## Accessibility (4)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| Screen-reader text preview | S | Strip markup and show what a reader would announce | [KB] |
| Caption length checker | S | Subtitle line length and reading speed | [KB] |
| Colour-blind safe palette check | S | Is this pair distinguishable under each simulation? | [KB] |
| Reduced-motion preview | S | What your animation looks like with motion off | [KB] |

## Reference (5)

| Tool | Effort | What it does | From |
|:--|:--|:--|:--|
| SI prefixes | S | yocto to quetta, with the exponents | [KB] |
| Greek alphabet | S | Letters, names, and the symbols maths borrows | [KB] |
| HTML entities table | S | The 100 that matter, searchable | [KB] |
| Git command reference | S | The twenty commands people look up | [IT] |
| Keycode info | S | Press a key, see `event.key`, `code`, `keyCode` | [IT] |

---

## Needs a dependency — will not ship

| Tool | Why not |
|:--|:--|
| PDF merge, split, compress, sign (`localpdfmerger`) | pdf-lib is ~300 KB. A hand-written merger is several hundred lines of object-stream parsing and would be the least-tested code here. |
| OCR | Tesseract WASM is 10+ MB. |
| bcrypt, Argon2, scrypt | Each is a tuned native implementation; a JavaScript one would be slow *and* easy to get subtly wrong. |
| PGP, Fernet, GOST, SM4, Ascon | Cipher suites that need a vetted implementation, not a fresh one. |
| Bzip2, LZMA, LZ4, Protobuf, Avro, MessagePack, CBOR, BSON | Format libraries. (`deflate-raw` is the exception — the browser already has it.) |
| Disassemblers (x86, ARM) | Enormous opcode tables. |
| Machine-learning anything (`[IT]`'s "safelink decoder", "BIP39" is borderline) | A model, a wordlist, or both. |

## Deliberately not doing

| Tool | Why not |
|:--|:--|
| Income-tax slab calculator | The slabs change every budget; a stale calculator is worse than none. |
| State-specific professional tax, stamp duty | Same, and 28 sets of rules. |
| Clinical scores (Wells, CURB-65, Glasgow) | A score that drives a decision needs a clinician to own it, not a toolbox. |
| Any tool that phones home for rates, lookups or validation | The first rule. |
| BIP39 seed phrases | 16 KB of wordlist for a use that belongs in a hardware wallet, not here. |

---

## If you want the highest value per hour

In this order, from the list above:

1. **ZIP Extract** (M) — the only missing half of a tool that already exists, and now possible without a library.
2. **JWT signer** (M) — the Debugger reads tokens; signing them is what people actually need next.
3. **Word-level diff** (M) — the current diff is line-based, which is the wrong grain for prose.
4. **Set operations** (S) — five useful tools in one afternoon.
5. **Chime: IP format converter + hash identifier + UUID analyser** (S each) — three small ones that answer "what is this string?".
6. **Extractors** (S each) — URLs, emails, IPs out of a log dump.
7. **Cron generator** (S) — completes a tool that only parses today.
8. **Tuner** (M) — the one audio tool people reach for and cannot find offline.

That is roughly **four days** for eight tools, and it would take the app from 370 to about 390.
