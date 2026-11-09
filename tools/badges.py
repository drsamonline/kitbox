#!/usr/bin/env python3
"""Draw Kitbox's badges and banner as local SVG files.

Why not shields.io: an offline-first app that needs the network to say
"no network" has broken its own rule. These are generated, committed, and
served from the repository, so the README renders correctly on a machine
with the router switched off — which is the whole point of the app.

The numbers here are the source of truth for the README badges. If the tool
count or the test count changes, change it here in the same commit; the CI
job "Badge numbers match the app" fails if these drift from kitbox.html.

Usage:  python3 tools/badges.py
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'docs', 'assets')

# ---- the app's own palette, so the badges cannot drift from the theme ----
INK = '#0e121a'          # topbar / badge label background
PAPER = '#0b0e14'        # page background
LINE = 'rgba(255,255,255,0.14)'
WHITE = '#ffffff'
MUTED = '#a7adb9'

FONT = "Verdana,DejaVu Sans,Helvetica,Arial,sans-serif"
MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

BADGES = [
    ('version',    '2.13.0',                                '#2f86eb'),
    ('tools',      '491',                                  '#2F86EB'),
    ('categories', '27',                                   '#E31C7D'),
    ('checks',     '237',                           '#3FCB6B'),
    ('licence',    'PolyForm Noncommercial 1.0.0',         '#A93CF5'),
    ('runtime',    '0 dependencies',                       '#12A99A'),
    ('network',    'none',                                 '#495057'),
    ('file',       '1 HTML',                               '#F2871A'),
    # size is filled in at build time from the real file — see main()
    ('size',       '',                                     '#E6A400'),
]


def text_width(s, size):
    """Rough advance width. Wide enough that nothing is ever clipped."""
    return int(len(s) * size * 0.62)


def badge(label, value, colour, label_bg=INK):
    pad = 10
    lw = text_width(label, 11) + pad * 2
    vw = text_width(value, 11) + pad * 2
    w = lw + vw
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="28" role="img" aria-label="{label}: {value}">
  <title>{label}: {value}</title>
  <rect width="{w}" height="28" fill="{label_bg}"/>
  <rect x="{lw}" width="{vw}" height="28" fill="{colour}"/>
  <g fill="{WHITE}" font-family="{FONT}" font-size="11" font-weight="600">
    <text x="{lw/2:.1f}" y="18" text-anchor="middle" fill="{MUTED}">{label}</text>
    <text x="{lw + vw/2:.1f}" y="18" text-anchor="middle">{value}</text>
  </g>
</svg>
'''


def banner():
    """A wide wordmark for the top of the README, in the app's palette."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="300" viewBox="0 0 1280 300" role="img" aria-label="Kitbox — every tool, one offline app">
  <title>Kitbox — every tool, one offline app</title>
  <rect width="1280" height="300" fill="{PAPER}"/>
  <rect x="0" y="0" width="1280" height="1" fill="{LINE}"/>
  <rect x="0" y="299" width="1280" height="1" fill="{LINE}"/>

  <!-- the app's tile mark: a square with a cut band -->
  <rect x="76" y="74" width="72" height="72" fill="#2F86EB"/>
  <rect x="76" y="98" width="72" height="11" fill="{PAPER}"/>

  <text x="172" y="122" font-family="{FONT}" font-size="54" font-weight="700" fill="{WHITE}" letter-spacing="-1.2">Kitbox</text>
  <text x="174" y="158" font-family="{MONO}" font-size="14" fill="{MUTED}" letter-spacing="1.6">EVERY TOOL, ONE OFFLINE APP</text>

  <text x="76" y="208" font-family="{FONT}" font-size="18" fill="{MUTED}">{badge_value('tools')} tools across {badge_value('categories')} categories in a single HTML file —</text>
  <text x="76" y="236" font-family="{FONT}" font-size="18" fill="{MUTED}">no install, no account, no network.</text>

  <!-- the category palette, as a quiet strip on the right -->
  <g opacity="0.9">
    <rect x="930" y="196" width="14" height="14" fill="#E31C7D"/>
    <rect x="950" y="196" width="14" height="14" fill="#E6A400"/>
    <rect x="970" y="196" width="14" height="14" fill="#9FCB1B"/>
    <rect x="990" y="196" width="14" height="14" fill="#F4483D"/>
    <rect x="1010" y="196" width="14" height="14" fill="#2F86EB"/>
    <rect x="1030" y="196" width="14" height="14" fill="#A93CF5"/>
    <rect x="1050" y="196" width="14" height="14" fill="#3FCB6B"/>
    <rect x="1070" y="196" width="14" height="14" fill="#22D9D9"/>
    <rect x="1090" y="196" width="14" height="14" fill="#1FCE9C"/>
    <rect x="1110" y="196" width="14" height="14" fill="#12A99A"/>
    <rect x="1130" y="196" width="14" height="14" fill="#F2871A"/>
  </g>
  <text x="1204" y="234" text-anchor="end" font-family="{MONO}" font-size="13" fill="#6f7787">dr s. momin · vadodara</text>
</svg>
'''


def badge_value(name):
    for key, val, _ in BADGES:
        if key == name:
            return val
    raise SystemExit('no badge called ' + name)


def main():
    os.makedirs(ASSETS, exist_ok=True)
    app_path = os.path.join(ROOT, 'kitbox.html')
    kb = round(os.path.getsize(app_path) / 1024)
    for i, (label, value, colour) in enumerate(BADGES):
        if label == 'size':
            BADGES[i] = (label, '%d KB' % kb, colour)
    for label, value, colour in BADGES:
        name = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')
        path = os.path.join(ASSETS, 'badge-%s.svg' % name)
        io.open(path, 'w', encoding='utf-8').write(badge(label, value, colour))
        print('wrote', os.path.relpath(path, ROOT))
    path = os.path.join(ASSETS, 'banner.svg')
    io.open(path, 'w', encoding='utf-8').write(banner())
    print('wrote', os.path.relpath(path, ROOT))

    print('\nbadge says %s tools; run `node tools/check-badges.js` to prove it' % badge_value('tools'))


if __name__ == '__main__':
    main()
