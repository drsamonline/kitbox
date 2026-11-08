#!/usr/bin/env python3
"""Build the distribution artefacts: a gzipped copy of the app and a checksum.

Why bother when the file is already one file: 690 KB of commented, readable
HTML is about 100 KB over the wire, and a checksum is the only way for someone
to check that the copy they downloaded is the copy this repository built. The
release workflow (PLAN.md B11) will attach both; CI uploads them as an
artefact on every push so they can be inspected before that exists.

Usage: python3 tools/dist.py
"""
import gzip, hashlib, io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
FILES = ['kitbox.html', 'index.html']


def main():
    os.makedirs(DIST, exist_ok=True)
    sums = []
    for name in FILES:
        src = os.path.join(ROOT, name)
        raw = io.open(src, 'rb').read()
        # mtime=0 so the gzip is byte-identical for identical input — otherwise
        # every build produces a different checksum for the same file.
        gz = gzip.compress(raw, compresslevel=9, mtime=0)
        out = os.path.join(DIST, name + '.gz')
        io.open(out, 'wb').write(gz)
        sums.append('%s  %s' % (hashlib.sha256(raw).hexdigest(), name))
        sums.append('%s  %s' % (hashlib.sha256(gz).hexdigest(), name + '.gz'))
        print('%-16s %7d B → %6d B gzipped (%.0f%%)' % (name, len(raw), len(gz), 100 * len(gz) / len(raw)))

    io.open(os.path.join(DIST, 'SHA256SUMS'), 'w', encoding='utf-8').write('\n'.join(sums) + '\n')
    print('wrote dist/SHA256SUMS (%d lines)' % len(sums))


if __name__ == '__main__':
    main()
