# Privacy

**Kitbox collects nothing.** No analytics, no telemetry, no crash reporting, no fingerprinting, no advertising identifier, no account, no email capture.

There is no server component. The app is one HTML file; opening it makes no network request at all, which you can verify in your browser's network panel — an empty list is the expected result.

## What is stored, and where

Some tools remember things between visits. They write to this browser's `localStorage` on this device, under the `tooly:` prefix:

- notes, flashcard decks and trivia quizzes
- scoreboard, habit tracker, packing list, checklists
- sketch pad palette, ruler calibration, currency rates
- the unit converter's last pair, the Panchang's last location
- pinned tools and your recently used list

None of it leaves the device. Clearing your browser data erases it. **Productivity → Backup & Restore** exports it all to one JSON file, and **System → Local Storage Usage** shows exactly what is being held, key by key.

## Files you open

Files you hash, zip, compress, encrypt, strip metadata from or convert are read by the page with the browser's `FileReader` and written back with a plain download. They are never transmitted — there is no code that could transmit them.

## Links that leave the app

Exactly one page has outbound links: **Support**, where Ko-fi, PayPal, the Amazon author store, the app index and the email address are links you may choose to click. The page loads none of them. Following one takes you to that service, which has its own privacy policy.

## For the record

This document describes the code as shipped. If a future version ever adds a network call, this file and the CI checks that forbid one would both have to change in the same commit — which is the point of writing the check down.
