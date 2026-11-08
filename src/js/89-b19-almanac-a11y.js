/* ================================================================
   B19 — the almanac's missing two, and four accessibility previews.
   ================================================================ */

/* ---------------- Almanac (2) ---------------- */

alm('choghadiya','Choghadiya', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="cgDate"></div>
      <div class="field"><label>Place</label><input type="text" id="cgPlace" value="Vadodara"></div>
    </div>
    <div class="row">
      <div class="field"><label>Latitude</label><input type="number" id="cgLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="cgLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="cgOut">—</div>
    <div class="hint">The day from sunrise to sunset is cut into eight equal parts, and the night into eight more. Which part gets which name depends on the weekday, so the table below is not the same on a Tuesday as on a Friday. Times are local and approximate — a part boundary is only as good as the sunrise it is measured from.</div>`;
  // Day sequences start at sunrise for each weekday (Sun..Sat), night at sunset.
  const DAY = {
    0: ['Udveg','Chal','Labh','Amrit','Kaal','Shubh','Rog','Udveg'],
    1: ['Amrit','Kaal','Shubh','Rog','Udveg','Chal','Labh','Amrit'],
    2: ['Rog','Udveg','Chal','Labh','Amrit','Kaal','Shubh','Rog'],
    3: ['Labh','Amrit','Kaal','Shubh','Rog','Udveg','Chal','Labh'],
    4: ['Shubh','Rog','Udveg','Chal','Labh','Amrit','Kaal','Shubh'],
    5: ['Chal','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Chal'],
    6: ['Kaal','Shubh','Rog','Udveg','Chal','Labh','Amrit','Kaal']
  };
  const NIGHT = {
    0: ['Shubh','Amrit','Chal','Rog','Kaal','Labh','Udveg','Shubh'],
    1: ['Chal','Rog','Kaal','Labh','Udveg','Shubh','Amrit','Chal'],
    2: ['Kaal','Labh','Udveg','Shubh','Amrit','Chal','Rog','Kaal'],
    3: ['Udveg','Shubh','Amrit','Chal','Rog','Kaal','Labh','Udveg'],
    4: ['Amrit','Chal','Rog','Kaal','Labh','Udveg','Shubh','Amrit'],
    5: ['Rog','Kaal','Labh','Udveg','Shubh','Amrit','Chal','Rog'],
    6: ['Labh','Udveg','Shubh','Amrit','Chal','Rog','Kaal','Labh']
  };
  const GOOD = new Set(['Amrit','Shubh','Labh','Chal']);
  function draw(){
    const dateEl = root.querySelector('#cgDate');
    if(!dateEl.value){ const now = new Date(); dateEl.value = now.toISOString().slice(0,10); }
    const [y, m, d] = dateEl.value.split('-').map(Number);
    const lat = Number(root.querySelector('#cgLat').value) || 0;
    const lon = Number(root.querySelector('#cgLon').value) || 0;
    const ss = ASTRO.sunriseSunset(new Date(Date.UTC(y, m-1, d, 12)), lat, lon);
    const out = root.querySelector('#cgOut');
    if(ss.polar){ out.textContent = 'At this latitude the sun does not rise or set on this date, so the day cannot be divided this way.'; return; }
    const tz = -(new Date().getTimezoneOffset()) / 60;
    const riseH = ss.sunrise + tz, setH = ss.sunset + tz;
    const nextSet = setH + 24;
    const weekday = new Date(Date.UTC(y, m-1, d)).getUTCDay();
    const fmt = h => {
      const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.round((h - Math.floor(h)) * 60);
      return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    };
    const dayParts = (setH - riseH) / 8, nightParts = (nextSet - setH) / 8;
    const rows = [];
    DAY[weekday].forEach((name, i)=>{
      const a = riseH + i*dayParts, b = a + dayParts;
      rows.push([name, fmt(a) + ' – ' + fmt(b), 'day']);
    });
    NIGHT[weekday].forEach((name, i)=>{
      const a = setH + i*nightParts, b = a + nightParts;
      rows.push([name, fmt(a) + ' – ' + fmt(b), 'night']);
    });
    out.innerHTML = `<table class="mono">
      <tr><td>Sunrise</td><td>${fmt(riseH)}</td></tr>
      <tr><td>Sunset</td><td>${fmt(setH)}</td></tr>
      <tr><td colspan="2" style="padding-top:10px"><b>${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekday]}</b></td></tr>
      ${rows.map(([name, span, part])=>`<tr><td>${part === 'day' ? '☀' : '☾'} ${name}</td><td>${span}${GOOD.has(name) ? '' : ' <span style="color:var(--muted)">— avoid</span>'}</td></tr>`).join('')}
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

alm('moonrise','Moonrise & Moonset', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="mrDate"></div>
      <div class="field"><label>Latitude</label><input type="number" id="mrLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="mrLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="mrOut">—</div>
    <div class="hint">Found by scanning the moon's altitude minute by minute and reporting where it crosses the horizon — the same method as the sun, with the moon's own position. Accurate to a few minutes; the moon moves about half a degree an hour, which is a minute of time, and this model is coarser than that.</div>`;
  function draw(){
    const dateEl = root.querySelector('#mrDate');
    if(!dateEl.value){ dateEl.value = new Date().toISOString().slice(0,10); }
    const [y, m, d] = dateEl.value.split('-').map(Number);
    const lat = (Number(root.querySelector('#mrLat').value) || 0) * Math.PI / 180;
    const lon = Number(root.querySelector('#mrLon').value) || 0;
    const tz = -(new Date().getTimezoneOffset()) / 60;
    const D2R = Math.PI / 180, R2D = 180 / Math.PI;
    const obliquity = 23.4393 * D2R;
    function altitude(hourUTC){
      const jd = ASTRO.jd({ y, m, d, h: hourUTC });
      const lam = ASTRO.moonLongitude(jd) * D2R;
      const ra = Math.atan2(Math.sin(lam) * Math.cos(obliquity), Math.cos(lam));
      const dec = Math.asin(Math.sin(lam) * Math.sin(obliquity));
      const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
      const lst = (gmst + lon) * D2R;
      const H = lst - ra;
      return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)) * R2D;
    }
    const events = [];
    let prev = altitude(0);
    for(let min=1; min<=24*60; min++){
      const h = min / 60;
      const alt = altitude(h);
      if((prev < 0 && alt >= 0) || (prev >= 0 && alt < 0)){
        // linear interpolation between the two minutes for a nicer time
        const frac = Math.abs(prev) / (Math.abs(prev) + Math.abs(alt) || 1);
        const at = (min - 1 + frac) / 60 + tz;
        events.push({ type: prev < 0 ? 'rise' : 'set', at });
      }
      prev = alt;
    }
    const fmt = h => {
      const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.round((h - Math.floor(h)) * 60);
      return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    };
    root.querySelector('#mrOut').innerHTML = `<table class="mono">
      ${events.length
        ? events.map(e=>`<tr><td>Moon${e.type}</td><td>${fmt(e.at)}</td></tr>`).join('')
        : '<tr><td colspan="2">No crossing in this 24 hours — the moon is up or down all day at this latitude.</td></tr>'}
      <tr><td>Note</td><td>Approximate; a moonrise can differ by minutes from an almanac</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Accessibility (4) ---------------- */

acc('srpreview','Screen Reader Preview', root=>{
  root.innerHTML = `
    <div class="field"><label>Markup</label><textarea id="srIn" style="min-height:120px"><h2>Discharge summary</h2><p>Seen in clinic on <strong>8 November</strong>. Blood pressure <em>138/86</em>.</p><ul><li>Continue amlodipine 5&nbsp;mg</li><li>Review in 4 weeks</li></ul></textarea></div>
    <div class="output" id="srOut" style="white-space:pre-wrap">—</div>
    <div class="hint">What a screen reader announces, roughly: tags gone, entities resolved, list items marked, and headings called out. It is a preview, not a simulation — real readers differ, and only a real one with a real user is a test.</div>`;
  function draw(){
    const raw = root.querySelector('#srIn').value;
    const doc = new DOMParser().parseFromString('<div>' + raw + '</div>', 'text/html');
    const body = doc.body.firstChild || doc.body;
    const lines = [];
    body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote').forEach(el=>{
      const tag = el.tagName.toLowerCase();
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      if(!text) return;
      if(/^h[1-6]$/.test(tag)) lines.push('Heading level ' + tag[1] + ': ' + text);
      else if(tag === 'li') lines.push('  • ' + text);
      else lines.push(text);
    });
    if(!lines.length) lines.push(body.textContent.replace(/\s+/g, ' ').trim());
    const words = lines.join(' ').split(/\s+/).filter(Boolean).length;
    root.querySelector('#srOut').textContent = lines.join('\n') + '\n\n— ' + words + ' words, about ' + Math.max(1, Math.round(words / 200)) + ' minute(s) of speech';
  }
  root.querySelector('#srIn').addEventListener('input', draw);
  draw();
});

acc('captions','Caption Length Checker', root=>{
  root.innerHTML = `
    <div class="field"><label>Caption line</label><textarea id="cpIn" style="min-height:80px">The sample was sent to the laboratory on Tuesday and the result is expected within four working days.</textarea></div>
    <div class="row">
      <div class="field"><label>Seconds on screen</label><input type="number" id="cpSec" value="4" step="0.5"></div>
      <div class="field"><label>Target characters per line</label><input type="number" id="cpMax" value="42"></div>
    </div>
    <div class="output" id="cpOut">—</div>
    <div class="hint">Two limits matter: characters per line (about 42 is the usual ceiling for subtitles) and characters per second (17 is a common maximum, 20 is pushing it). A caption can be short and still be too fast.</div>`;
  function draw(){
    const text = root.querySelector('#cpIn').value;
    const secs = Math.max(0.5, Number(root.querySelector('#cpSec').value) || 1);
    const maxChars = Number(root.querySelector('#cpMax').value) || 42;
    const longest = text.split('\n').reduce((a, l)=>Math.max(a, l.length), 0);
    const cps = text.replace(/\s+/g, ' ').length / secs;
    const issues = [];
    if(longest > maxChars) issues.push('A line is ' + longest + ' characters — split it at ' + maxChars + ' or fewer.');
    if(cps > 20) issues.push(cps.toFixed(1) + ' characters per second is too fast; give it ' + Math.ceil(text.length / 17) + ' seconds.');
    else if(cps > 17) issues.push(cps.toFixed(1) + ' characters per second is at the limit.');
    root.querySelector('#cpOut').innerHTML = `<table class="mono">
      <tr><td>Characters</td><td>${text.length}</td></tr>
      <tr><td>Longest line</td><td>${longest}${longest > maxChars ? ' — over' : ''}</td></tr>
      <tr><td>Characters per second</td><td>${cps.toFixed(1)}</td></tr>
      <tr><td>Suggested duration</td><td>${Math.max(1, Math.ceil(text.length / 17))} s at 17 cps</td></tr>
      <tr><td>Reading</td><td>${issues.length ? escapeHtml(issues.join(' ')) : 'within both limits'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

acc('cbpalette','Colour-Blind Safe Pair', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>First colour</label><input type="color" id="cbA" value="#2f86eb"></div>
      <div class="field"><label>Second colour</label><input type="color" id="cbB" value="#e31c7d"></div>
    </div>
    <div id="cbSwatches" style="display:flex;gap:12px;flex-wrap:wrap;margin:12px 0"></div>
    <div class="output" id="cbOut">—</div>
    <div class="hint">Simulates the three common forms of colour blindness with the standard matrices and reports whether the pair stays distinguishable. Distinguishable is not the same as accessible — contrast is checked separately by the WCAG Contrast tool.</div>`;
  const MATRIX = {
    normal: [1,0,0, 0,1,0, 0,0,1],
    protanopia: [0.567,0.433,0, 0.558,0.442,0, 0,0.242,0.758],
    deuteranopia: [0.625,0.375,0, 0.7,0.3,0, 0,0.3,0.7],
    tritanopia: [0.95,0.05,0, 0,0.433,0.567, 0,0.475,0.525]
  };
  const hex2rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const rgb2hex = ([r,g,b]) => '#' + [r,g,b].map(v=>Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('');
  function simulate(hex, kind){
    const m = MATRIX[kind], [r,g,b] = hex2rgb(hex);
    return rgb2hex([m[0]*r + m[1]*g + m[2]*b, m[3]*r + m[4]*g + m[5]*b, m[6]*r + m[7]*g + m[8]*b]);
  }
  function draw(){
    const a = root.querySelector('#cbA').value, b = root.querySelector('#cbB').value;
    const sw = root.querySelector('#cbSwatches');
    sw.innerHTML = Object.keys(MATRIX).map(kind=>`
      <div style="text-align:center">
        <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:4px">${kind}</div>
        <div style="display:flex">
          <div style="width:34px;height:34px;background:${simulate(a, kind)}"></div>
          <div style="width:34px;height:34px;background:${simulate(b, kind)}"></div>
        </div>
      </div>`).join('');
    const rows = Object.keys(MATRIX).map(kind=>{
      const ca = simulate(a, kind), cb = simulate(b, kind);
      const ratio = contrastWith(ca, cb);
      return [kind, ca, cb, ratio, ratio >= 1.5 ? 'distinguishable' : 'too close'];
    });
    root.querySelector('#cbOut').innerHTML = `<table class="mono">
      ${rows.map(([kind, ca, cb, ratio, verdict])=>`<tr><td>${kind}</td><td>${ca} / ${cb}</td><td>${ratio.toFixed(2)}:1</td><td style="color:${verdict === 'too close' ? '#c0392b' : '#1a7f37'}">${verdict}</td></tr>`).join('')}
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

acc('motionpreview','Reduced Motion Preview', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Distance (px)</label><input type="number" id="mpD" value="120"></div>
      <div class="field"><label>Duration (ms)</label><input type="number" id="mpT" value="700"></div>
      <div class="field"><label>Easing</label><select id="mpE"><option>ease-out</option><option>linear</option><option>ease-in-out</option><option>cubic-bezier(.2,.8,.2,1)</option></select></div>
    </div>
    <div id="mpStage" style="position:relative;height:90px;background:var(--panel);border:1px solid var(--line);overflow:hidden;margin:12px 0">
      <div id="mpBox" style="position:absolute;top:26px;left:0;width:38px;height:38px;background:var(--accent)"></div>
    </div>
    <div class="segrow">
      <button class="btn primary" id="mpGo">Play</button>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="mpReduce"> Simulate reduced motion</label>
    </div>
    <div class="hint">With reduced motion on, the element appears at its destination instead of travelling. If your animation carries meaning — "this moved here" — a fade or a highlight has to carry it instead, because a reader who asked for less motion will not see the journey.</div>`;
  function play(){
    const box = root.querySelector('#mpBox');
    const d = Number(root.querySelector('#mpD').value) || 100;
    const t = Number(root.querySelector('#mpT').value) || 500;
    const ease = root.querySelector('#mpE').value;
    const reduce = root.querySelector('#mpReduce').checked;
    box.style.transition = 'none';
    box.style.left = '0px';
    box.style.opacity = '1';
    void box.offsetWidth;
    if(reduce){
      box.style.left = d + 'px';
      box.style.opacity = '0.6';
      return;
    }
    box.style.transition = 'left ' + t + 'ms ' + ease + ', opacity ' + t + 'ms ' + ease;
    box.style.left = d + 'px';
  }
  root.querySelector('#mpGo').addEventListener('click', play);
  root.querySelector('#mpReduce').addEventListener('change', play);
  play();
});
