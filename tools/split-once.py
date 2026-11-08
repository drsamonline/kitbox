#!/usr/bin/env python3
"""One-off: cut kitbox.html into src/ so the app can be built instead of edited.

Run once, kept in the repository as the record of how the split was made. After
this, edit files under src/ and run `python3 tools/build.py`.

The cut preserves byte order exactly: every line of the original lands in
exactly one part, in the same sequence, so `build(split(x)) == x` can be checked
and the migration cannot change behaviour by accident.

Usage: python3 tools/split-once.py
"""
import io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'kitbox.html')
OUT = os.path.join(ROOT, 'src')

# (file, first line, last line) — 1-based, inclusive, inside the <script> block.
PARTS = [
    ('js/00-core.js',                 294,   657),
    ('js/10-general.js',              658,  1155),
    ('js/20-text.js',                1156,  1743),
    ('js/30-generator.js',           1744,  2284),
    ('js/40-calc.js',                2285,  2751),
    ('js/50-unit.js',                2752,  3000),
    ('js/60-finance.js',             3001,  3424),
    ('js/70-random-health.js',       3425,  3873),
    ('js/80-dev.js',                 3874,  4569),
    ('js/85-image-science.js',       4570,  5438),
    ('js/88-geo-audio.js',           5439,  5899),
    ('js/90-games-travel-nature.js', 5900,  6486),
    ('js/95-productivity-files.js',  6487,  7818),
    ('js/96-almanac-comms.js',       7819,  8192),
    ('js/97-second-pass.js',         8193, 11286),
    ('js/99-shell.js',              11287, None),
]


def main():
    raw = io.open(SRC, encoding='utf-8').read()
    lines = raw.split('\n')

    script_open = raw.index('<script>')
    open_line = raw[:script_open].count('\n') + 1          # the line containing <script>
    script_close = raw.rindex('</script>')
    close_line = raw[:script_close].count('\n') + 1

    head = '\n'.join(lines[:open_line])                    # everything up to and including <script>
    tail = '\n'.join(lines[close_line - 1:])               # </script> onwards

    os.makedirs(os.path.join(OUT, 'js'), exist_ok=True)
    io.open(os.path.join(OUT, 'index.template.html'), 'w', encoding='utf-8').write(
        head + '\n{{JS}}' + tail)

    written = []
    for name, first, last in PARTS:
        chunk = lines[first - 1: (last if last else close_line - 1)]
        path = os.path.join(OUT, name)
        io.open(path, 'w', encoding='utf-8').write('\n'.join(chunk) + '\n')
        written.append((name, len(chunk)))

    for name, n in written:
        print('%-32s %5d lines' % (name, n))
    print('%d parts, %d lines of JavaScript' % (len(written), sum(n for _, n in written)))


if __name__ == '__main__':
    main()
