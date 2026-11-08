#!/usr/bin/env python3
"""Take the README screenshots with headless Chromium.

Reproducible on purpose: every image in docs/ is generated from the file in
this repository, never pasted from a machine that has since moved on. If the
UI changes, re-run this and commit the new PNGs in the same commit.

Requires: chromium (or chrome) on PATH.
Usage:    python3 tools/shots.py
"""
import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'docs')

CHROME = shutil.which('chromium') or shutil.which('chromium-browser') or shutil.which('google-chrome')
if not CHROME:
    sys.exit('No chromium/chrome on PATH — install one or take the screenshots by hand.')

SHOTS = [
    ('shot-home.png',    'kitbox.html', '',                             1440, 1180),
    ('shot-tool.png',    'kitbox.html', '#/tool/almanac/panchang',      1440, 840),
    ('shot-files.png',   'kitbox.html', '#/category/files',             1440, 700),
    ('shot-mobile.png',  'kitbox.html', '',                              420,  900),
    ('shot-landing.png', 'index.html',  '',                             1440, 1000),
]


def shoot(name, page, frag, w, h):
    out = os.path.join(DOCS, name)
    url = 'file://' + os.path.join(ROOT, page) + frag
    cmd = [CHROME, '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
           '--force-device-scale-factor=1', '--virtual-time-budget=2500',
           '--window-size=%d,%d' % (w, h), '--screenshot=' + out, url]
    # Pin the timezone so time-bearing screenshots show Indian times rather
    # than whatever the build machine happens to be set to.
    env = dict(os.environ, TZ='Asia/Kolkata')
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120, env=env)
    if not os.path.exists(out):
        sys.exit('screenshot failed for %s:\n%s\n%s' % (name, r.stdout[-800:], r.stderr[-800:]))
    print('wrote docs/%s  (%d bytes)' % (name, os.path.getsize(out)))


if __name__ == '__main__':
    os.makedirs(DOCS, exist_ok=True)
    for args in SHOTS:
        shoot(*args)
