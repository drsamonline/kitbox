/* ================================================================
   B30 — three image adjustments and two sound-level references.
   The image tools have presets; these are the individual controls, which is
   what you reach for when a preset is close but not right.
   ================================================================ */

/* ---------------- Image (3) ---------------- */

function imageAdjustTool(id, name, intro, controls, apply){
  imgtool(id, name, root=>{
    root.innerHTML = `
      ${FILES_HINT}
      <div class="field"><label>Image</label><input type="file" id="${id}File" accept="image/*"></div>
      <div class="row">${controls}</div>
      <div class="hint">${intro}</div>
      <div id="${id}Stage" style="margin-top:12px;text-align:center"></div>
      <div class="segrow" id="${id}Actions" style="display:none"><button class="btn primary" id="${id}Save">Download PNG</button></div>`;
    let image = null, canvas = null;
    const stage = root.querySelector('#' + id + 'Stage');
    const actions = root.querySelector('#' + id + 'Actions');
    root.querySelector('#' + id + 'File').addEventListener('change', e=>{
      const file = e.target.files[0];
      if(!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = ()=>{
        image = img;
        canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        stage.innerHTML = '';
        canvas.style.maxWidth = '100%';
        canvas.style.borderRadius = '8px';
        stage.appendChild(canvas);
        actions.style.display = 'flex';
        render();
      };
      img.onerror = ()=>{ stage.textContent = 'That file could not be decoded as an image.'; };
      img.src = url;
    });
    function render(){
      if(!image || !canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const values = {};
      root.querySelectorAll('[data-adj]').forEach(el=>{ values[el.dataset.adj] = Number(el.value); });
      apply(ctx, image, canvas, values, root);
    }
    root.querySelectorAll('[data-adj]').forEach(el=>{
      el.addEventListener('input', ()=>{
        const label = root.querySelector('[data-adj-out="' + el.dataset.adj + '"]');
        if(label) label.textContent = el.value;
        render();
      });
    });
    root.querySelector('#' + id + 'Save').addEventListener('click', ()=>{
      if(canvas) canvas.toBlob(b=>saveBlob(b, name.toLowerCase().replace(/[^a-z]+/g, '-') + '.png'));
    });
  });
}

imageAdjustTool('imghsl', 'Image HSL',
  'Hue rotation, saturation and lightness applied per pixel. Saturation 0 is a proper greyscale that keeps the alpha channel; the CSS filter of the same name does not touch the image data, so this is what you use when you need a file rather than a preview.',
  `<div class="field"><label>Hue <span data-adj-out="hue">0</span>°</label><input type="range" data-adj="hue" min="-180" max="180" value="0"></div>
   <div class="field"><label>Saturation <span data-adj-out="sat">100</span>%</label><input type="range" data-adj="sat" min="0" max="200" value="100"></div>
   <div class="field"><label>Lightness <span data-adj-out="light">100</span>%</label><input type="range" data-adj="light" min="0" max="200" value="100"></div>`,
  (ctx, img, canvas, v)=>{
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    const hueShift = v.hue / 360, sat = v.sat / 100, light = v.light / 100;
    for(let i=0;i<px.length;i+=4){
      const r = px[i]/255, g = px[i+1]/255, b = px[i+2]/255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0;
      const l = (max + min) / 2;
      const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
      if(max !== min){
        if(max === r) h = ((g - b) / (max - min)) / 6;
        else if(max === g) h = (2 + (b - r) / (max - min)) / 6;
        else h = (4 + (r - g) / (max - min)) / 6;
      }
      h = ((h + hueShift) % 1 + 1) % 1;
      const s2 = Math.min(1, s * sat), l2 = Math.min(1, l * light);
      const hue2rgb = (p, q, t)=>{
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      let nr, ng, nb;
      if(s2 === 0){ nr = ng = nb = l2; }
      else {
        const q = l2 < 0.5 ? l2 * (1 + s2) : l2 + s2 - l2 * s2;
        const p = 2 * l2 - q;
        nr = hue2rgb(p, q, h + 1/3); ng = hue2rgb(p, q, h); nb = hue2rgb(p, q, h - 1/3);
      }
      px[i] = Math.round(nr * 255); px[i+1] = Math.round(ng * 255); px[i+2] = Math.round(nb * 255);
    }
    ctx.putImageData(data, 0, 0);
  });

imageAdjustTool('imginvert', 'Invert Image',
  'The negative of the image, with the alpha channel untouched. Useful for checking a scanned document, and for turning a dark screenshot into one that prints without eating a cartridge.',
  `<div class="field"><label>Strength <span data-adj-out="amount">100</span>%</label><input type="range" data-adj="amount" min="0" max="100" value="100"></div>`,
  (ctx, img, canvas, v)=>{
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data, k = v.amount / 100;
    for(let i=0;i<px.length;i+=4){
      px[i] = px[i] + (255 - 2 * px[i]) * k;
      px[i+1] = px[i+1] + (255 - 2 * px[i+1]) * k;
      px[i+2] = px[i+2] + (255 - 2 * px[i+2]) * k;
    }
    ctx.putImageData(data, 0, 0);
  });

imageAdjustTool('imgopacity', 'Image Opacity',
  'Composites the image onto a solid background at an alpha you choose — which is what "make it transparent" usually means in practice, and what a PNG with real transparency should look like against white or a brand colour.',
  `<div class="field"><label>Opacity <span data-adj-out="alpha">100</span>%</label><input type="range" data-adj="alpha" min="0" max="100" value="100"></div>
   <div class="field"><label>Background</label><input type="color" data-adj="bg" value="#ffffff" style="height:34px"></div>`,
  (ctx, img, canvas, v, host)=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bg = host.querySelector('[data-adj="bg"]');
    ctx.fillStyle = bg ? bg.value : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = v.alpha / 100;
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = 1;
  });

/* ---------------- Science (2) ---------------- */

sci('decibel','Decibels & Sound Level', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Value</label><input type="number" id="dbVal" value="94" step="0.1"></div>
      <div class="field"><label>It is</label><select id="dbKind">
        <option value="spl">sound pressure level (dB SPL)</option>
        <option value="power">a power ratio in dB</option>
        <option value="voltage">a voltage ratio in dB</option>
        <option value="dbm">a power level in dBm</option>
      </select></div>
    </div>
    <div class="output" id="dbOut">—</div>
    <div class="hint">Three different things share the name "decibel": a sound level with a reference, a ratio of powers, and a ratio of voltages — and the ratio formulas differ by a factor of two because power goes as the square. dBm is a power relative to one milliwatt, which is where the negative numbers come from.</div>`;
  function draw(){
    const v = Number(root.querySelector('#dbVal').value) || 0;
    const kind = root.querySelector('#dbKind').value;
    const out = root.querySelector('#dbOut');
    let rows = [];
    if(kind === 'spl'){
      const p = 20e-6 * Math.pow(10, v / 20);       // pascals
      const w = 1e-12 * Math.pow(10, v / 10);       // watts per square metre
      rows = [
        ['Sound pressure', p.toFixed(6) + ' Pa'],
        ['Intensity', w.toExponential(3) + ' W/m²'],
        ['Pressure ratio to 20 µPa', Math.pow(10, v / 20).toExponential(3)],
        ['Familiar comparison', v < 30 ? 'a quiet room' : v < 50 ? 'a library' : v < 70 ? 'conversation' : v < 85 ? 'busy traffic' : v < 100 ? 'a power tool' : v < 120 ? 'a rock concert' : 'painful — hearing damage risk']
      ];
    } else if(kind === 'power'){
      const ratio = Math.pow(10, v / 10);
      rows = [['Power ratio', ratio.toExponential(4)], ['+3 dB is', (Math.pow(10, 0.3)).toFixed(3) + '× — the doubling everyone quotes'], ['Voltage ratio for the same dB', Math.pow(10, v / 20).toExponential(4)]];
    } else if(kind === 'voltage'){
      const ratio = Math.pow(10, v / 20);
      rows = [['Voltage ratio', ratio.toExponential(4)], ['+6 dB is', (Math.pow(10, 0.3)).toFixed(3) + '× — doubling the voltage'], ['Power ratio for the same dB', Math.pow(10, v / 10).toExponential(4)]];
    } else {
      const mw = Math.pow(10, v / 10);
      rows = [['Power', mw.toExponential(4) + ' mW'], ['In watts', (mw / 1000).toExponential(4) + ' W'], ['In dBW', (v - 30).toFixed(2) + ' dBW'], ['Note', v < 0 ? 'negative is below one milliwatt, which is normal for a receiver' : 'above one milliwatt']];
    }
    out.innerHTML = `<table class="mono">${rows.map(([k, val])=>`<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(String(val))}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

sci('rcfilter','RC Filter Response', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Resistance (Ω)</label><input type="number" id="rfR" value="1000"></div>
      <div class="field"><label>Capacitance (nF)</label><input type="number" id="rfC" value="100"></div>
      <div class="field"><label>Type</label><select id="rfType"><option value="low">low-pass</option><option value="high">high-pass</option></select></div>
    </div>
    <div class="output" id="rfOut">—</div>
    <div class="hint">The cut-off is where the output is 3 dB down — 70.7% of the input, not half. The table shows what happens an octave and a decade either side, which is the part people misremember: a single RC rolls off at 6 dB per octave, 20 dB per decade.</div>`;
  function draw(){
    const R = Number(root.querySelector('#rfR').value) || 0;
    const C = (Number(root.querySelector('#rfC').value) || 0) * 1e-9;
    const type = root.querySelector('#rfType').value;
    const out = root.querySelector('#rfOut');
    if(!R || !C){ out.textContent = 'Resistance and capacitance, both non-zero.'; return; }
    const fc = 1 / (2 * Math.PI * R * C);
    const gain = f => {
      const x = f / fc;
      return type === 'low' ? 1 / Math.sqrt(1 + x*x) : x / Math.sqrt(1 + x*x);
    };
    const db = f => 20 * Math.log10(gain(f));
    const fmt = f => f >= 1e6 ? (f/1e6).toFixed(2) + ' MHz' : f >= 1e3 ? (f/1e3).toFixed(2) + ' kHz' : f.toFixed(1) + ' Hz';
    const points = [fc/100, fc/10, fc/2, fc, fc*2, fc*10, fc*100];
    out.innerHTML = `<table class="mono">
      <tr><td>Cut-off (−3 dB)</td><td>${fmt(fc)}</td></tr>
      <tr><td>Time constant τ</td><td>${(R*C*1e3).toFixed(3)} ms</td></tr>
      ${points.map(f=>`<tr><td>${fmt(f)}</td><td>${gain(f).toFixed(3)} × · ${db(f).toFixed(1)} dB</td></tr>`).join('')}
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Almanac (1) ---------------- */

alm('moontable','Moon Table for a Month', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Year</label><input type="number" id="mtYear" value="2026" min="1900" max="2100"></div>
      <div class="field"><label>Month</label><select id="mtMonth">${['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i)=>`<option value="${i+1}"${i===10?' selected':''}>${m}</option>`).join('')}</select></div>
    </div>
    <div class="row">
      <div class="field"><label>Latitude</label><input type="number" id="mtLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="mtLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="mtOut">—</div>
    <div class="hint">Moonrise, moonset and the phase for each day. The phase is the elongation — 0° new, 180° full — computed from the same lunar position as the rise times, so the two cannot disagree.</div>`;
  function draw(){
    const year = Number(root.querySelector('#mtYear').value) || 2026;
    const month = Number(root.querySelector('#mtMonth').value);
    const lat = (Number(root.querySelector('#mtLat').value) || 0) * Math.PI / 180;
    const lon = Number(root.querySelector('#mtLon').value) || 0;
    const tz = -(new Date().getTimezoneOffset()) / 60;
    const D2R = Math.PI / 180, R2D = 180 / Math.PI;
    const obl = 23.4393 * D2R;
    function altAt(jd){
      const lam = ASTRO.moonLongitude(jd) * D2R;
      const ra = Math.atan2(Math.sin(lam) * Math.cos(obl), Math.cos(lam));
      const dec = Math.asin(Math.sin(lam) * Math.sin(obl));
      const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
      const H = (gmst + lon) * D2R - ra;
      return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)) * R2D;
    }
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const fmt = h => {
      const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.round((h - Math.floor(h)) * 60);
      return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    };
    const rows = [];
    for(let d=1; d<=days; d++){
      let rise = null, set = null;
      let prev = altAt(ASTRO.jd({ y: year, m: month, d, h: 0 }));
      for(let min=1; min<=1440; min++){
        const jd = ASTRO.jd({ y: year, m: month, d, h: min / 60 });
        const alt = altAt(jd);
        if(prev < 0 && alt >= 0 && rise === null) rise = min / 60 + tz;
        if(prev >= 0 && alt < 0 && set === null) set = min / 60 + tz;
        prev = alt;
      }
      const jdNoon = ASTRO.jd({ y: year, m: month, d, h: 12 - tz });
      const elong = ((ASTRO.moonLongitude(jdNoon) - ASTRO.sunLongitude(jdNoon)) % 360 + 360) % 360;
      const illum = Math.round((1 - Math.cos(elong * D2R)) / 2 * 100);
      const name = elong < 22.5 ? 'new' : elong < 67.5 ? 'waxing crescent' : elong < 112.5 ? 'first quarter'
        : elong < 157.5 ? 'waxing gibbous' : elong < 202.5 ? 'full' : elong < 247.5 ? 'waning gibbous'
        : elong < 292.5 ? 'last quarter' : elong < 337.5 ? 'waning crescent' : 'new';
      rows.push([d, rise === null ? '—' : fmt(rise), set === null ? '—' : fmt(set), name, illum + '%']);
    }
    root.querySelector('#mtOut').innerHTML = `<table class="mono">
      <tr><th style="text-align:left">Day</th><th>Rise</th><th>Set</th><th style="text-align:left">Phase</th><th>Lit</th></tr>
      ${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('')}
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});
