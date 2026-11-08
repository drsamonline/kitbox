#!/usr/bin/env python3
"""Build kitbox.html from src/.

The app is one file because that is what it promises to be — one file you can
save and open. That promise never required editing one 700 KB file by hand. The
build concatenates src/js/*.js in filename order into src/index.template.html,
inlines the generated blocks (the pinned codes), and writes kitbox.html.

CI runs this and fails if the committed kitbox.html differs, so the file that
ships is always the file the source describes.

Usage:
  python3 tools/build.py            # write kitbox.html
  python3 tools/build.py --check    # verify the committed file is current
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'kitbox.html')


def parts():
    js = os.path.join(SRC, 'js')
    return [os.path.join(js, f) for f in sorted(os.listdir(js)) if f.endswith('.js')]


def build():
    template = io.open(os.path.join(SRC, 'index.template.html'), encoding='utf-8').read()
    chunks = []
    for path in parts():
        body = io.open(path, encoding='utf-8').read()
        if not body.endswith('\n'):
            body += '\n'
        chunks.append(body)
    js = ''.join(chunks)
    return template.replace('{{JS}}', js)


def main():
    built = build()
    if '--check' in sys.argv:
        current = io.open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        if current != built:
            print('FAIL  kitbox.html is out of date — run python3 tools/build.py')
            # Say where it first differs, so the message is actionable.
            limit = min(len(current), len(built))
            for i in range(limit):
                if current[i] != built[i]:
                    line = current[:i].count('\n') + 1
                    print('      first difference at line %d' % line)
                    print('      committed: %r' % current[max(0, i - 40):i + 60])
                    print('      built    : %r' % built[max(0, i - 40):i + 60])
                    break
            sys.exit(1)
        print('PASS  kitbox.html matches src/ (%d KB, %d parts)' % (round(len(built) / 1024), len(parts())))
        sys.exit(0)

    io.open(OUT, 'w', encoding='utf-8').write(built)
    # The same JavaScript as a standalone file, so a linter can see the whole
    # script at once instead of 17 files that cannot see each other's names.
    dist = os.path.join(ROOT, 'dist')
    os.makedirs(dist, exist_ok=True)
    js = ''.join(io.open(p_, encoding='utf-8').read() for p_ in parts())
    io.open(os.path.join(dist, 'app.js'), 'w', encoding='utf-8').write(js)
    print('built kitbox.html — %d bytes from %d parts' % (len(built), len(parts())))


if __name__ == '__main__':
    main()
