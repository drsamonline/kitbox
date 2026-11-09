# Tools still to add — the exhaustive list

> **Empty as of 2.14.0.** Every row that could be built without a dependency has been built: 493 tools, up from 339 when this list was written. The tables below are what is left, and neither of them is a to-do list — one needs a library the app will not ship, the other is refused on purpose.

What remains, and why each one stays here:

| Tool | Why it is not built |
|:--|:--|
| **ROT8000** | Needs the full rotation table — the exceptions list alone is tens of kilobytes, and a partial implementation produces plausible nonsense. |
| **Timezone from coordinates** | Needs a coarse polygon set for every zone boundary; ~200 KB of data for a lookup the operating system already does. |
| **What three words, offline** | Needs the 40,000-word list, about a megabyte. |
| **Normalise Unicode** | Half-done already: the Code Point Inspector shows what normalisation changes, and a separate tool that only calls `String.normalize` would be a button. |

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
