#!/usr/bin/env python3
"""Check (or rewrite) MANIFEST.json against the files it claims to describe.

The manifest exists so that a release can be verified: every file, its SHA-1,
and whether it is canonical (hand-written) or generated. It is worth nothing
if it silently drifts, which is what happens to a manifest nobody checks.

Usage:
  python3 tools/check-manifest.py          # verify, exit 1 on drift
  python3 tools/check-manifest.py --write  # regenerate
"""
import hashlib, io, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'MANIFEST.json')
CANONICAL = {
    'kitbox.html', 'index.html', 'test/smoke.js', '.github/workflows/test.yml',
    'tools/badges.py', 'tools/check-badges.js', 'tools/check-plan.py',
    'tools/check-manifest.py', 'tools/gen-all-tools.js', 'tools/build-docs.py',
    'tools/build-landing.py', 'tools/shots.py',
}


def tracked():
    # --cached plus --others: a file that is written but not yet staged still
    # belongs in the manifest, otherwise --write silently omits it and CI
    # fails on the next push. That is exactly what happened once.
    out = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard'],
                         cwd=ROOT, capture_output=True, text=True).stdout
    return sorted({f for f in out.split('\n') if f and f != 'MANIFEST.json'})


def sha(path):
    with open(os.path.join(ROOT, path), 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()


def build(now):
    files = {}
    for f in tracked():
        if not os.path.exists(os.path.join(ROOT, f)):
            continue
        files[f] = {
            'sha': sha(f),
            'producer': 'check-manifest@1',
            'class': 'canonical' if f in CANONICAL else 'generated',
            'at': now,
        }
    return {'schema': 1, 'locked': False, 'files': files, 'updated': now}


def main():
    write = '--write' in sys.argv
    existing = json.load(io.open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}
    now = existing.get('updated') or '1970-01-01T00:00:00Z'

    if write:
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        fresh = build(now)
        io.open(MANIFEST, 'w', encoding='utf-8').write(json.dumps(fresh, indent=2) + '\n')
        print('wrote MANIFEST.json — %d files' % len(fresh['files']))
        return

    claimed = existing.get('files', {})
    problems = []

    for f, meta in claimed.items():
        if not os.path.exists(os.path.join(ROOT, f)):
            problems.append('listed but missing: %s' % f)
        elif sha(f) != meta.get('sha'):
            problems.append('changed since the manifest: %s' % f)

    for f in tracked():
        if f not in claimed and os.path.exists(os.path.join(ROOT, f)):
            problems.append('tracked but not listed: %s' % f)

    for p in problems:
        print('FAIL  ' + p)
    if problems:
        print('\n%d problem(s) — run `python3 tools/check-manifest.py --write` and commit the result' % len(problems))
        sys.exit(1)
    print('PASS  MANIFEST.json matches %d tracked files' % len(claimed))


if __name__ == '__main__':
    main()
