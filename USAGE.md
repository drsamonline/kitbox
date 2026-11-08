# Using Kitbox

## Getting it

**One file.** Download `kitbox.html` from a release, or clone the repository. Open it in any modern browser — double-click works, no server needed. Save it to a USB stick, a phone, a shared drive; it travels as a single file and needs nothing beside it.

If you would rather serve it: `python3 -m http.server` in the repository, then visit `http://localhost:8000/kitbox.html`.

## Finding a tool

| | |
|---|---|
| <kbd>Ctrl</kbd> <kbd>K</kbd> / <kbd>⌘</kbd> <kbd>K</kbd> | Search all 338 tools |
| <kbd>/</kbd> | The same search, when not typing in a field |
| <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↵</kbd> | Move through results, open one |
| <kbd>Esc</kbd> | Close the search, then step back a page |

Ranking is exact name, then prefix, then word start, then substring, then an ordered-letters fallback, so `panchng` still finds Panchang. **Pin** a tool with the star on its page; pinned and recent tools appear at the top of the home screen. **All tools A–Z** is there for browsing.

## Working with files

Files & Data tools read your file in the page and hand it back — ZIP, gzip, hashing, AES encryption, EXIF stripping, CSV, base64. Nothing is uploaded. Very large files (over ~200 MB) are refused with a message rather than locking the tab.

## Keeping your data

Whatever a tool remembers lives in this browser only. Back it up with **Productivity → Backup & Restore**; move it to another device by exporting there and importing here. **System → Local Storage Usage** shows what is being held and how much of the browser's ~5 MB allowance it uses.

## When something does not work

- **A tool needs permission** — camera, microphone, location, motion. Each asks and each says so when refused.
- **A tool needs https** — Web Crypto (encryption, hashing, sealed notes) requires a secure context. From `file://` some browsers refuse it. Serve the file over `http://localhost` if that happens.
- **A tool needs a newer browser** — GZIP and ZIP need Compression Streams (Chrome 80+, Firefox 113+, Safari 16.4+). The tool says so rather than failing silently.
- **Something looks wrong** — **System → Device & Screen Info** gives the details worth quoting in a bug report.

## Printing

Calculator and reference results print with the browser's own print dialog. The app's dark chrome is on screen only.

## Uninstalling

There is nothing to uninstall. Delete the file, and clear the site's data in your browser settings if you want the stored notes and decks gone too — or use **Backup & Restore → Erase all Kitbox data** first.
