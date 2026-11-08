# Contributing

Kitbox is a personal toolbox that happens to be public. Contributions are welcome, and the bar is one thing: **does it still work offline, in one file, with no dependencies?**

## The five rules

1. **One file.** Everything ships inside `kitbox.html`. No CDN, no `<script src>`, no font request, no import. If a tool needs a library, the library has to be rewritten inside the file or the tool does not ship.
2. **No network calls.** Not for updates, not for fonts, not for analytics. CI fails on `fetch`, `XMLHttpRequest`, `WebSocket` and `EventSource`, and on any external `src`, `href` (in a `<link>`), or `<img>`.
3. **Nothing uploaded.** Files are read with `FileReader` and written with `Blob` and `a[download]`. There is no endpoint to send them to and there never will be.
4. **One tool, one job.** Do not fold a new capability into an existing tool to avoid adding an entry. A tool that does two things is two tools.
5. **Say what it cannot do.** Every calculator that approximates says so. Every tool that needs a secure context, a camera or a permission says so before you tap it.

## Adding a tool

A tool is about ten lines of registration plus its render function:

```js
dev('my-tool', 'My Tool', root => {
  root.innerHTML = `
    <div class="field"><label>Input</label><input type="text" id="mtIn"></div>
    <div class="output" id="mtOut">—</div>
    <div class="hint">What this does, and what it does not.</div>`;
  root.querySelector('#mtIn').addEventListener('input', e => {
    root.querySelector('#mtOut').textContent = e.target.value.toUpperCase();
  });
});
```

Then:

- pick the existing helper for the category (`txt`, `gen`, `calc`, `fin`, `rnd`, `health`, `dev`, `clr`, `sci`, `geo`, `aud`, `game`, `trv`, `nat`, `prod`, `imgtool`, `fil`, `alm`, `com`, `ref`, `sys`, or `unitTool` for a unit-shaped tool);
- **escape any user text** you put into `innerHTML` with `escapeHtml(...)` — this is the one bug that has actually shipped once;
- if you start a timer, a stream, a sensor watch or an audio node, call `setCleanup(...)` with something that stops it;
- if you persist anything, use `store.get` / `store.set`, and add the key to the allow-list in the Backup tool;
- add a line to `CHANGELOG.md` and run `python3 tools/badges.py` if a count changed.

## Before you open a pull request

```bash
npm ci
npm test                        # 27 checks, jsdom
node tools/check-badges.js      # badge numbers match the app
node tools/gen-all-tools.js --check
python3 tools/check-plan.py
python3 tools/check-manifest.py
```

If you changed the app: `node tools/gen-all-tools.js`, `python3 tools/badges.py`, `python3 tools/check-manifest.py --write`, and `python3 tools/build-landing.py` if a category changed.

## What gets rejected

- A tool that needs a network call, an API key or an account.
- A "wrapper" that shells out to a hosted service.
- Anything that uploads a file, even to "your own" server.
- A dependency, however small.
- Combining two existing tools to save a tile.

## Licence

Contributions are accepted under the same PolyForm Noncommercial 1.0.0 licence as the project. See [LICENSE](LICENSE).
