#!/usr/bin/env python3
"""Build the landing page (index.html) in exactly the app's theme.

The stylesheet is lifted from kitbox.html rather than copied, and the
category grid is read out of the app's registry, so the landing page cannot
drift from the app it advertises. Needs jsdom (dev dependency).

Usage: python3 tools/build-landing.py [--check]
"""
import io, json, re, sys

import os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, 'kitbox.html')
OUT = os.path.join(ROOT, 'index.html')
QR = os.path.join(ROOT, 'docs', 'assets', 'upi-qr.svg')

app = io.open(APP, encoding='utf-8').read()
style = re.search(r'<style>(.*?)</style>', app, re.S).group(1)

# The category list is read out of the app, never typed here, so the landing
# page cannot advertise a tool count the app does not have.
dump = subprocess.run(
    ['node', '-e', """
const fs=require('fs');const {JSDOM}=require('jsdom');
const d=new JSDOM(fs.readFileSync(process.argv[1],'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://l.test/'});
setTimeout(()=>{const T=d.window.eval('TOOLS'),C=d.window.eval('CATS');
console.log(JSON.stringify(C.filter(c=>(T[c.id]||[]).length).map(c=>({id:c.id,name:c.name,code:c.code,color:c.color,desc:c.desc,count:T[c.id].length}))));
process.exit(0);},600);""", APP],
    capture_output=True, text=True, cwd=ROOT)
if dump.returncode != 0:
    raise SystemExit('could not read the registry from kitbox.html:\n' + dump.stderr[-600:])
cats = json.loads(dump.stdout.strip().split('\n')[-1])
qr = io.open(QR, encoding='utf-8').read()
qr = re.sub(r'^<\?xml[^>]*\?>\s*', '', qr).strip().replace('width="222" height="222"', 'width="176" height="176"')

total = sum(c['count'] for c in cats)

def rel_lum(hexc):
    h = hexc.replace('#', '')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    ch = []
    for i in (0, 2, 4):
        v = int(h[i:i+2], 16) / 255
        ch.append(v/12.92 if v <= 0.03928 else ((v+0.055)/1.055) ** 2.4)
    return 0.2126*ch[0] + 0.7152*ch[1] + 0.0722*ch[2]


def contrast(a, b):
    la, lb = rel_lum(a), rel_lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def ink_for(colour):
    """Same rule as the app: whichever of white or ink has more contrast."""
    return '#ffffff' if contrast(colour, '#ffffff') >= contrast(colour, '#17171d') else '#17171d'


def tile(c):
    return f'''      <a class="tag" href="kitbox.html#/category/{c['id']}" style="--c:{c['color']};--ci:{ink_for(c['color'])};text-decoration:none">
        <div class="hole"></div>
        <div class="icon">{ICON(c['id'])}</div>
        <div class="name">{c['name']}</div>
        <div class="code">{c['code']} · {c['count']} tools</div>
      </a>'''

ICONS = {
 'general':'<path d="M3 8h18v11H3z"/><path d="M3 12h18"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
 'text':'<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h7"/>',
 'generator':'<rect x="4" y="4" width="16" height="4"/><path d="M4 12h16M4 16h10M4 20h6"/>',
 'calc':'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
 'image':'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-4 4-3-3-6 6"/>',
 'unit':'<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
 'finance':'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
 'random':'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3"/><circle cx="16" cy="8" r="1.3"/><circle cx="8" cy="16" r="1.3"/><circle cx="16" cy="16" r="1.3"/><circle cx="12" cy="12" r="1.3"/>',
 'health':'<path d="M12 21s-7-4.35-9.5-8.5C.7 8.6 2.9 5 6.5 5c2 0 3.3 1 5.5 3 2.2-2 3.5-3 5.5-3 3.6 0 5.8 3.6 4 7.5C19 16.65 12 21 12 21z"/>',
 'dev':'<polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/>',
 'colors':'<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r="1.2"/><circle cx="12" cy="8" r="1.2"/><circle cx="15.5" cy="10.5" r="1.2"/><circle cx="9.5" cy="14.5" r="1.2"/>',
 'science':'<path d="M9 2v6L4 18a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2"/><path d="M9 2h6"/><path d="M8 14h8"/>',
 'geo':'<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
 'audio':'<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
 'games':'<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="10.5" r="1"/><circle cx="18" cy="13.5" r="1"/>',
 'travel':'<path d="M3 12l18-8-8 18-2-8-8-2z"/>',
 'nature':'<path d="M12 3a9 9 0 1 0 9 9c0-.5-.04-1-.1-1.5A6 6 0 0 1 12 3z"/>',
 'productivity':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
 'files':'<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 11h16"/>',
 'almanac':'<circle cx="12" cy="12" r="9"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/><path d="M12 7l3 5-3 5-3-5z"/>',
 'comms':'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 'reference':'<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-4a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h5z"/>',
 'system':'<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>',
}
def ICON(cid):
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS.get(cid, ICONS['general']) + '</svg>'

tiles = '\n'.join(tile(c) for c in cats)

LANDING_CSS = '''
  /* ---------- landing-only rules, on top of the app theme ---------- */
  .topnav{margin-left:auto;display:flex;gap:6px;align-items:center}
  .topnav a{color:var(--shell-muted);text-decoration:none;font-size:13px;padding:8px 12px;border:1px solid transparent}
  .topnav a:hover{color:#fff;border-color:rgba(255,255,255,0.14)}
  .topnav a.cta{background:#E31C7D;color:#fff;font-weight:600}
  .topnav a.cta:hover{filter:brightness(1.08);border-color:transparent}
  .wrap{max-width:1040px;margin:0 auto;padding:56px 22px 90px}
  .lede{font-size:17px;line-height:1.7;color:var(--shell-muted);max-width:70ch;margin:0 0 26px}
  .hero > div:last-child{flex:1;min-width:0}
  .hero p.lede{max-width:70ch}
  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:rgba(255,255,255,0.09);margin:0 0 54px}
  .stat{background:var(--paper);padding:18px 16px}
  .stat b{display:block;font-family:var(--mono);font-size:26px;font-weight:700;color:#fff;line-height:1.1}
  .stat span{display:block;font-size:12px;color:var(--shell-muted);margin-top:6px}
  .cta-row{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 12px}
  .cta-row a{text-decoration:none;font-size:14px;font-weight:600;padding:14px 22px;border:1px solid rgba(255,255,255,0.18);color:#fff}
  .cta-row a.primary{background:#2f86eb;border-color:transparent}
  .cta-row a:hover{filter:brightness(1.1)}
  .cta-note{font-size:12.5px;color:#6f7787;font-family:var(--mono)}
  h2.band{font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:var(--shell-muted);font-weight:600;margin:0 0 16px}
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.08);margin-bottom:54px}
  .card{background:var(--paper);padding:22px 20px}
  .card h3{margin:0 0 8px;font-size:15px;color:#fff;font-weight:600}
  .grid .tag .name, .grid .tag .code{color:var(--ci,#fff);}
  .card p{margin:0;font-size:13.5px;line-height:1.65;color:var(--shell-muted)}
  .card .n{font-family:var(--mono);font-size:11px;color:#6f7787;margin-bottom:10px;display:block}
  .light{background:#fff;color:var(--ink);padding:34px 30px;margin-bottom:54px}
  .light h2{margin:0 0 12px;font-size:22px;font-weight:600;color:var(--ink)}
  .light p{color:var(--ink-soft);line-height:1.7;margin:0 0 12px;font-size:14.5px}
  .light p:last-child{margin-bottom:0}
  .support{display:flex;gap:28px;flex-wrap:wrap;align-items:flex-start}
  .qrbox{background:#fff;padding:10px;border:1px solid var(--line);width:196px;flex:none}
  .foot{display:flex;gap:18px;flex-wrap:wrap;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.09);padding-top:22px;margin-top:60px;font-size:12.5px;color:#6f7787}
  .foot a{color:var(--shell-muted);text-decoration:none}
  .foot a:hover{color:#fff}
  @media (max-width:820px){
    .stats{grid-template-columns:repeat(2,1fr)}
    .cards{grid-template-columns:1fr}
    .grid{grid-template-columns:repeat(2,1fr)}
    .topnav a:not(.cta){display:none}
  }
'''

HTML = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kitbox — every tool, one offline app</title>
<meta name="description" content="Kitbox is a single HTML file holding {total} tools across {len(cats)} categories — files, text, calculators, almanac, colour, code. No install, no account, no network.">
<meta name="theme-color" content="#0b0e14">
<meta name="color-scheme" content="dark light">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230b0e14'/%3E%3Crect x='6' y='10' width='20' height='14' fill='%232f86eb'/%3E%3Crect x='6' y='14' width='20' height='2.5' fill='%230b0e14'/%3E%3C/svg%3E">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kitbox">
<meta property="og:title" content="Kitbox — every tool, one offline app">
<meta property="og:description" content="{total} tools across {len(cats)} categories in a single HTML file. No install, no account, no network — files you hash, zip or encrypt never leave your device.">
<meta property="og:url" content="https://drsamonline.github.io/kitbox/">
<meta property="og:image" content="https://drsamonline.github.io/kitbox/docs/shot-home.png">
<meta property="og:image:width" content="1440">
<meta property="og:image:height" content="1180">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Kitbox — every tool, one offline app">
<meta name="twitter:description" content="{total} tools, one HTML file, no network, no account.">
<meta name="twitter:image" content="https://drsamonline.github.io/kitbox/docs/shot-home.png">
<style>{style}{LANDING_CSS}</style>
</head>
<body>

<div class="topbar">
  <div class="brand"><span class="dot" style="background:#2f86eb"></span>Kitbox</div>
  <div class="crumb" style="margin-left:10px">offline toolbox</div>
  <nav class="topnav">
    <a href="#inside">What is inside</a>
    <a href="#why">Why it is built this way</a>
    <a href="#support">Support</a>
    <a class="cta" href="kitbox.html">Open the app →</a>
  </nav>
</div>

<div class="wrap">

  <div class="hero" style="padding:6px 2px 30px">
    <div class="badge">KIT</div>
    <div>
      <h1 style="font-size:34px;line-height:1.15">Every tool, one offline app</h1>
      <p class="lede">{total} tools across {len(cats)} categories in a single HTML file. No install, no build step, no dependencies, no account — and no network call, ever. Open the file and it works, on a laptop in a clinic with the router switched off.</p>
      <div class="cta-row">
        <a class="primary" href="kitbox.html">Open Kitbox</a>
        <a href="#support">Support this</a>
      </div>
      <div class="cta-note">one file · 0 dependencies · 0 network requests · works from a USB stick</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><b>{total}</b><span>tools</span></div>
    <div class="stat"><b>{len(cats)}</b><span>categories</span></div>
    <div class="stat"><b>1</b><span>HTML file</span></div>
    <div class="stat"><b>0</b><span>dependencies</span></div>
    <div class="stat"><b>0</b><span>network calls</span></div>
  </div>

  <h2 class="band" id="inside">What is inside</h2>
  <div class="grid" style="margin-bottom:54px">
{tiles}
  </div>

  <h2 class="band" id="why">Why it is built this way</h2>
  <div class="cards">
    <div class="card"><span class="n">01</span><h3>Your files never leave the device</h3><p>Hashing, zipping, compressing, encrypting, stripping EXIF — all of it runs in the page. There is no server to upload to, which is the only privacy guarantee worth trusting.</p></div>
    <div class="card"><span class="n">02</span><h3>One file, no supply chain</h3><p>No CDN, no npm install, no font request, no analytics tag. The ZIP writer, MD5, CRC32, the panchang and the AES envelope are written out inside the file rather than pulled in.</p></div>
    <div class="card"><span class="n">03</span><h3>Works where the internet does not</h3><p>Clinics, classrooms, a train, an old laptop kept offline on purpose. Save the file once and it keeps working, forever, on anything with a modern browser.</p></div>
    <div class="card"><span class="n">04</span><h3>Fast to find things</h3><p>Press Ctrl K and search all {total} tools at once, ranked so the obvious match comes first. Pin what you use often; recents are one tap away.</p></div>
    <div class="card"><span class="n">05</span><h3>Checked, not assumed</h3><p>A jsdom suite loads the real file, renders every tool, walks every route, and pins the ported astronomy and crypto to published reference values. It runs on every push.</p></div>
    <div class="card"><span class="n">06</span><h3>Honest about limits</h3><p>The panchang says it is approximate. MD5 says it is for legacy checksums only. The calculators say they are not medical, financial or legal advice. Nothing pretends.</p></div>
  </div>

  <div class="light">
    <h2>What it refuses to do</h2>
    <p><b>No network calls.</b> Not for updates, not for fonts, not for analytics. The test suite fails if a fetch, XHR, WebSocket or EventSource appears anywhere in the file, or if any external src or href is added.</p>
    <p><b>No silent uploads.</b> Files are read with the browser's own FileReader and written back with a download — there is no endpoint to send them to.</p>
    <p><b>No account, no telemetry.</b> There is nothing to sign into and nothing being counted. Whatever a tool remembers lives in this browser's local storage and can be exported or erased from Productivity → Backup &amp; Restore.</p>
  </div>

  <h2 class="band" id="support">Support</h2>
  <div class="support" style="margin-bottom:54px">
    <div>
      <div class="qrbox">{qr}</div>
      <div class="mono" style="font-size:11.5px;color:var(--shell-muted);margin-top:8px;text-align:center">Scan with any UPI app</div>
    </div>
    <div style="flex:1;min-width:260px">
      <p class="lede" style="margin-bottom:16px">Free, offline, accountless — and staying that way. If it earned its keep:</p>
      <table class="mono" style="width:100%">
        <tr><td style="padding:6px 16px 6px 0;white-space:nowrap;color:var(--shell-muted)">UPI (India)</td><td style="color:#fff"><b>drsohilboi@ybl</b><div style="font-size:12px;color:#6f7787">payee Dr. Sohil Momin · any amount</div></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:var(--shell-muted)">Ko-fi</td><td><a href="https://ko-fi.com/matneo" style="color:#7ab7ff;text-decoration:none">ko-fi.com/matneo</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:var(--shell-muted)">PayPal</td><td><a href="https://paypal.me/drsohilmomin" style="color:#7ab7ff;text-decoration:none">paypal.me/drsohilmomin</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:var(--shell-muted)">My books</td><td><a href="https://www.amazon.com/stores/author/B08ZT331LY/allbooks" style="color:#7ab7ff;text-decoration:none">Amazon author store</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:var(--shell-muted)">More apps</td><td><a href="https://drsamonline.github.io/" style="color:#7ab7ff;text-decoration:none">drsamonline.github.io</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:var(--shell-muted)">Email</td><td><a href="mailto:sohilmomin2000@gmail.com" style="color:#7ab7ff;text-decoration:none">sohilmomin2000@gmail.com</a></td></tr>
      </table>
      <p style="font-size:13.5px;line-height:1.7;color:#6f7787;margin:18px 0 0">Nothing is gated behind it: no paid tier, no account, no tracking. Supporting it buys the next version, not a feature.</p>
    </div>
  </div>

  <div class="foot">
    <div>Kitbox — crafted by <b style="color:#a7adb9">Dr. Sohil Momin, BHMS</b> · Vadodara, Gujarat, India</div>
    <div style="display:flex;gap:16px">
      <a href="kitbox.html">App</a>
      <a href="kitbox.html#/all">All tools A–Z</a>
      <a href="kitbox.html#/about">About</a>
      <a href="kitbox.html#/support">Support</a>
      <a href="https://github.com/drsamonline/kitbox">GitHub</a>
    </div>
  </div>

</div>
</body>
</html>
'''

if '--check' in sys.argv:
    current = io.open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
    if current != HTML:
        raise SystemExit('FAIL  index.html is out of date — run `python3 tools/build-landing.py`')
    print('PASS  index.html matches the app (%d tools, %d categories)' % (total, len(cats)))
    raise SystemExit(0)

io.open(OUT, 'w', encoding='utf-8').write(HTML)
print('landing written: %d bytes, %d categories, %d tools' % (len(HTML), len(cats), total))
