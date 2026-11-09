/* ================================================================
   B37 — the last two from the backlog, and the RL variant of the RC tool.
   ================================================================ */

/* ---------------- Text (1) ---------------- */

txt('Analysis Tools','chisquare','Chi-Square & Index of Coincidence', root=>{
  root.innerHTML = `
    <div class="field"><label>Ciphertext or text</label><textarea id="csIn" style="min-height:110px">WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ</textarea></div>
    <div class="output" id="csOut">—</div>
    <div class="hint">The two numbers a cryptanalyst starts with. Index of coincidence near 0.066 means natural language (letters repeat as they do in English); near 0.038 means a polyalphabetic cipher or random text. Chi-square measures the same thing against English letter frequency, and the shift row tells you which Caesar shift scores best.</div>`;
  const ENGLISH = [8.167,1.492,2.782,4.253,12.702,2.228,2.015,6.094,6.966,0.153,0.772,4.025,2.406,
                   6.749,7.507,1.929,0.095,5.987,6.327,9.056,2.758,0.978,2.360,0.150,1.974,0.074];
  function analyse(text){
    const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
    const counts = new Array(26).fill(0);
    for(const ch of letters) counts[ch.charCodeAt(0) - 65]++;
    const n = letters.length;
    if(!n) return null;
    let ic = 0;
    for(const c of counts) ic += c * (c - 1);
    ic = ic / (n * (n - 1) || 1);
    let chi = 0;
    for(let i=0;i<26;i++){
      const expected = n * ENGLISH[i] / 100;
      if(expected > 0) chi += Math.pow(counts[i] - expected, 2) / expected;
    }
    // best Caesar shift, so the chi-square number has something to act on
    let best = { shift: 0, chi: Infinity };
    for(let shift=0;shift<26;shift++){
      let c2 = 0;
      for(let i=0;i<26;i++){
        const shifted = counts[(i + shift) % 26];
        const expected = n * ENGLISH[i] / 100;
        if(expected > 0) c2 += Math.pow(shifted - expected, 2) / expected;
      }
      if(c2 < best.chi) best = { shift, chi: c2 };
    }
    return { n, ic, chi, best, counts };
  }
  function draw(){
    const out = root.querySelector('#csOut');
    const stats = analyse(root.querySelector('#csIn').value);
    if(!stats){ out.textContent = 'No letters to analyse.'; return; }
    const ic = stats.ic;
    const reading = ic > 0.062 ? 'natural language — letters repeat the English way'
      : ic > 0.05 ? 'ambiguous — could be short English or a simple substitution'
      : ic > 0.042 ? 'polyalphabetic, or a language with a flatter distribution'
      : 'close to random';
    out.innerHTML = `<table class="mono">
      <tr><td>Letters</td><td>${stats.n}</td></tr>
      <tr><td>Index of coincidence</td><td>${ic.toFixed(4)} — ${escapeHtml(reading)}</td></tr>
      <tr><td>Chi-square vs English</td><td>${stats.chi.toFixed(1)} (lower fits English better; 25 is the degrees of freedom)</td></tr>
      <tr><td>Best Caesar shift</td><td>${stats.best.shift} — chi-square ${stats.best.chi.toFixed(1)}</td></tr>
      <tr><td>Reading at that shift</td><td style="word-break:break-word">${escapeHtml([...root.querySelector('#csIn').value.toUpperCase()].map(ch=>{
        const c = ch.charCodeAt(0);
        return c >= 65 && c <= 90 ? String.fromCharCode(65 + (c - 65 - stats.best.shift + 26) % 26) : ch;
      }).join('').slice(0, 90))}</td></tr>
    </table>`;
  }
  root.querySelector('#csIn').addEventListener('input', draw);
  draw();
});

/* ---------------- Almanac (1) ---------------- */

alm('muhurat','Muhurat Windows', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="muDate"></div>
      <div class="field"><label>Latitude</label><input type="number" id="muLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="muLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="muOut">—</div>
    <div class="hint">The windows that are pure arithmetic from sunrise and sunset: <b>Brahma muhurta</b> (the two 48-minute muhurtas before sunrise), <b>Abhijit</b> (the eighth of the fifteen day-muhurtas, centred on solar noon) and <b>Godhuli</b> (the half hour around sunset). Which of them suits which occasion is a tradition, not a calculation — the Choghadiya tool has the day and night parts for that.</div>`;
  function draw(){
    const dateEl = root.querySelector('#muDate');
    if(!dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
    const [y, m, d] = dateEl.value.split('-').map(Number);
    const lat = Number(root.querySelector('#muLat').value) || 0;
    const lon = Number(root.querySelector('#muLon').value) || 0;
    const tz = -(new Date().getTimezoneOffset()) / 60;
    const ss = ASTRO.sunriseSunset(new Date(Date.UTC(y, m - 1, d, 12)), lat, lon);
    const out = root.querySelector('#muOut');
    if(ss.polar){ out.textContent = 'At this latitude the sun does not rise or set on this date, so the day cannot be divided.'; return; }
    const rise = ss.sunrise + tz, set = ss.sunset + tz;
    const dayLength = set - rise;
    const muhurta = dayLength / 15;
    const fmt = h => {
      const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.round((h - Math.floor(h)) * 60);
      return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    };
    const windows = [
      ['Brahma muhurta', rise - 96 / 60, rise - 48 / 60, 'the two muhurtas before sunrise'],
      ['Abhijit', rise + 7 * muhurta, rise + 8 * muhurta, 'the eighth of fifteen day-muhurtas'],
      ['Godhuli', set - 0.5, set + 0.5, 'the half hour around sunset'],
      ['Vijaya', rise + 11 * muhurta, rise + 12 * muhurta, 'the twelfth day-muhurta']
    ];
    out.innerHTML = `<table class="mono">
      <tr><td>Sunrise</td><td>${fmt(rise)}</td></tr>
      <tr><td>Sunset</td><td>${fmt(set)}</td></tr>
      <tr><td>Day length</td><td>${Math.floor(dayLength)}h ${Math.round((dayLength % 1) * 60)}m · one muhurta ${muhurta.toFixed(1)} min</td></tr>
      ${windows.map(([name, a, b, why])=>
        `<tr><td>${name}</td><td>${fmt(a)} – ${fmt(b)} <span style="color:var(--muted)">· ${why}</span></td></tr>`).join('')}
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});
