#!/usr/bin/env python3
"""Render the markdown documents as a small static site under docs/.

Why: the README is the front door on GitHub, but GitHub Pages serves docs/,
and a visitor who arrives through the landing page should be able to read the
changelog, the roadmap and the plan without being bounced back to GitHub.
Rendering them from the same markdown means one source, two audiences.

Needs: pip install markdown
Usage: python3 tools/build-docs.py [--check]
"""
import io, os, re, sys

try:
    import markdown
except ImportError:
    sys.exit('This needs the markdown package: pip install markdown')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'docs')

PAGES = [
    ('README.md', 'index.html', 'Kitbox — every tool, one offline app'),
    ('CHANGELOG.md', 'changelog.html', 'Kitbox — changelog'),
    ('ROADMAP.md', 'roadmap.html', 'Kitbox — roadmap'),
    ('PLAN.md', 'plan.html', 'Kitbox — plan'),
]
GENERATED_MD = {src[:-3].lower(): dst for src, dst, _ in PAGES}

CSS = """
:root{--paper:#0b0e14;--panel:#0d1117;--ink:#e6edf3;--soft:#a7adb9;--line:#30363d;--accent:#2f86eb}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65;font-size:16px}
.bar{position:sticky;top:0;background:#0e121a;border-bottom:1px solid rgba(255,255,255,.08);padding:14px 22px;display:flex;gap:16px;align-items:center;z-index:10}
.bar a{color:var(--soft);text-decoration:none;font-size:13px}
.bar a:hover{color:#fff}
.bar .brand{color:#fff;font-weight:600;font-size:15px;display:flex;align-items:center;gap:9px}
.bar .dot{width:12px;height:12px;background:var(--accent);display:inline-block}
.bar .cta{margin-left:auto;background:var(--accent);color:#fff;padding:8px 14px;font-weight:600}
main{max-width:900px;margin:0 auto;padding:36px 22px 90px}
h1,h2,h3{line-height:1.25}
h1{font-size:30px}
h2{font-size:21px;border-bottom:1px solid var(--line);padding-bottom:.3em;margin-top:38px}
h3{font-size:17px;margin-top:26px}
a{color:#7ab7ff}
img{max-width:100%;height:auto}
table{border-collapse:collapse;width:100%;margin:18px 0;display:block;overflow:auto}
th,td{border:1px solid var(--line);padding:7px 12px;text-align:left;vertical-align:top}
th{background:#161b22}
tr:nth-child(even) td{background:rgba(255,255,255,.02)}
code{background:#161b22;padding:.15em .4em;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:85%}
pre{background:#161b22;padding:14px 16px;overflow:auto;border:1px solid var(--line)}
pre code{background:none;padding:0}
kbd{border:1px solid var(--line);border-radius:4px;padding:1px 5px;background:#161b22;font-size:12px;font-family:ui-monospace,monospace}
blockquote{border-left:3px solid var(--line);margin:16px 0;padding:2px 16px;color:var(--soft)}
sub{color:var(--soft)}
hr{border:none;border-top:1px solid var(--line);margin:34px 0}
footer{border-top:1px solid rgba(255,255,255,.08);padding:20px 22px;color:#6f7787;font-size:12.5px;text-align:center}
@media (prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;transition-duration:.001ms!important}}
"""


def rewrite(html):
    """Point links at where the files actually are once rendered into docs/."""
    def sub(m):
        attr, url = m.group(1), m.group(2)
        if re.match(r'^(https?:|mailto:|#|data:)', url):
            return m.group(0)
        if url.startswith('docs/'):
            return '%s="%s"' % (attr, url[5:])
        base = url.split('#')[0]
        frag = '#' + url.split('#', 1)[1] if '#' in url else ''
        stem = base[:-3].lower() if base.endswith('.md') else None
        if stem and stem in GENERATED_MD:
            return '%s="%s%s"' % (attr, GENERATED_MD[stem], frag)
        return '%s="../%s%s"' % (attr, base, frag)
    return re.sub(r'(href|src)="([^"]+)"', sub, html)


def page(title, body, here):
    label = lambda dst: 'Home' if dst == 'index.html' else dst.replace('.html', '').title()
    nav = ''.join(
        '<a href="%s"%s>%s</a>' % (dst, ' style="color:#fff"' if dst == here else '', label(dst))
        for _, dst, _ in PAGES
    )
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%s</title>
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0b0e14">
<style>%s</style>
</head>
<body>
<div class="bar">
  <a class="brand" href="index.html"><span class="dot"></span>Kitbox</a>
  %s
  <a class="cta" href="../kitbox.html">Open the app →</a>
</div>
<main>
%s
</main>
<footer>Kitbox — crafted by Dr. Sohil Momin, BHMS · Vadodara, Gujarat, India</footer>
</body>
</html>
''' % (title, CSS, nav, body)


def main():
    check = '--check' in sys.argv
    stale = []
    for src, dst, title in PAGES:
        md = io.open(os.path.join(ROOT, src), encoding='utf-8').read()
        body = markdown.markdown(md, extensions=['tables', 'fenced_code', 'attr_list', 'md_in_html'])
        html = page(title, rewrite(body), dst)
        out = os.path.join(DOCS, dst)
        if check:
            if not os.path.exists(out) or io.open(out, encoding='utf-8').read() != html:
                stale.append(dst)
        else:
            io.open(out, 'w', encoding='utf-8').write(html)
            print('wrote docs/%s (%d bytes)' % (dst, len(html)))
    if check:
        if stale:
            print('FAIL  out of date: %s — run `python3 tools/build-docs.py`' % ', '.join(stale))
            sys.exit(1)
        print('PASS  docs/ matches the markdown (%d pages)' % len(PAGES))


if __name__ == '__main__':
    main()
