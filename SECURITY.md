# Security

## Reporting

Email **sohilmomin2000@gmail.com** with the tool name, what you did, and what happened. Please do not open a public issue for a vulnerability that could be used against someone before it is fixed. There is no bounty; there is a thank-you in the changelog if you would like one.

## The threat model, honestly

Kitbox is a single HTML file that runs entirely in your browser. That shape gives it a strong property and a weak one, and it is worth being precise about both.

**What it protects against**

- **Upload and retention.** There is no server, so a file you hash, zip, compress, encrypt or strip metadata from cannot be sent anywhere. This is not a policy — there is no code path that could.
- **Third-party code.** No CDN, no font host, no analytics tag, no dependency. Nothing runs in the page that was not written into the page.
- **Account compromise.** There is no account.
- **Network observation.** Nothing is transmitted, so there is nothing to observe in transit.

**What it does not protect against**

- **A compromised machine.** If malware is reading your screen or your clipboard, a local tool does not help.
- **A modified copy of the file.** Verify what you downloaded: every release publishes `SHA256SUMS`. A single HTML file is trivially editable — that is the same property that makes it portable.
- **Anyone with access to your browser profile.** `localStorage` is not encrypted. Notes, decks and checklists are readable by anything that can run script in that profile. Use the Encrypt tool for anything that matters, and Sealed Note for anything you would not want found.
- **A forgotten passphrase.** AES-256-GCM with PBKDF2 has no recovery path, by design. There is no reset, no hint, no backdoor.
- **JavaScript limitations on secrets.** The app wipes buffers best-effort after use, but a browser cannot guarantee that a string has been removed from memory.

## Deliberate choices that look like weaknesses

| Choice | Why |
|---|---|
| `unsafe-inline` is required for the app's own script and styles | It is one file. A CSP that banned inline code would ban the app. |
| `localStorage` is unencrypted | Encrypting it with a key stored beside it would be theatre. The Encrypt tool exists for data that needs it. |
| No integrity pinning of the file itself | There is no server to pin it against; `SHA256SUMS` per release is the honest equivalent. |
| MD5 is present | Legacy checksums only, and the tool says so. It is not used anywhere internally. |

## What the browser enforces

The page ships a Content-Security-Policy meta tag: `default-src 'none'`, no `connect-src`, no frames, no forms, and images and media only from `data:` and `blob:` URIs the app created itself. Inline script and style are allowed because the app *is* the inline script — a policy that banned them would ban the app. A network call added by a future commit would be blocked by the browser, which is a second lock on the same door as the CI check.

## What CI enforces

Every push runs: the jsdom suite (which includes an escaping test), a check that no external resource is loaded, a check for `eval`, `new Function`, `document.write` and `javascript:` URLs, a badge and manifest freshness check, and the plan coverage check. A fuzz pass over every text input is scheduled in batch B8 of [PLAN.md](PLAN.md).
