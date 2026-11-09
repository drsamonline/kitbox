/* ================================================================
   B34 — money, a calendar question, and two pieces of physics.
   ================================================================ */

/* ---------------- Money, India (3) ---------------- */

money('stepupsip','Step-Up SIP', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Monthly SIP (₹)</label><input type="number" id="suAmt" value="10000"></div>
      <div class="field"><label>Annual step-up (%)</label><input type="number" id="suStep" value="10" step="1"></div>
      <div class="field"><label>Return (% per year)</label><input type="number" id="suRate" value="12" step="0.5"></div>
      <div class="field"><label>Years</label><input type="number" id="suYears" value="20"></div>
    </div>
    <div class="output" id="suOut">—</div>
    <div class="hint">A SIP that rises with your income. The comparison against a flat SIP of the same starting amount is the number that matters — the step-up is what most of the corpus comes from, and it is also the part people forget to keep doing.</div>`;
  function draw(){
    const start = Number(root.querySelector('#suAmt').value) || 0;
    const step = (Number(root.querySelector('#suStep').value) || 0) / 100;
    const rate = (Number(root.querySelector('#suRate').value) || 0) / 100;
    const years = Math.max(1, Number(root.querySelector('#suYears').value) || 1);
    const monthly = rate / 12;
    let balance = 0, flat = 0, invested = 0;
    for(let y=0;y<years;y++){
      const sip = start * Math.pow(1 + step, y);
      for(let m=0;m<12;m++){
        balance = (balance + sip) * (1 + monthly);
        invested += sip;
        flat = (flat + start) * (1 + monthly);
      }
    }
    const f = n => '₹' + Math.round(n).toLocaleString(numLocale());
    root.querySelector('#suOut').innerHTML = `<table class="mono">
      <tr><td>Final monthly SIP</td><td>${f(start * Math.pow(1 + step, years - 1))}</td></tr>
      <tr><td>Total invested</td><td>${f(invested)}</td></tr>
      <tr><td><b>Corpus with step-up</b></td><td><b>${f(balance)}</b></td></tr>
      <tr><td>Corpus without step-up</td><td>${f(flat)}</td></tr>
      <tr><td>Difference</td><td>${f(balance - flat)}</td></tr>
      <tr><td>Gain from stepping up</td><td>${flat ? ((balance / flat - 1) * 100).toFixed(1) + '%' : '—'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

money('fdladder','FD Ladder', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Amount (₹)</label><input type="number" id="flAmt" value="500000"></div>
      <div class="field"><label>Rungs</label><input type="number" id="flN" value="5" min="2" max="10"></div>
      <div class="field"><label>Years between rungs</label><input type="number" id="flGap" value="1" step="0.5" min="0.5"></div>
      <div class="field"><label>Rate (% per year)</label><input type="number" id="flRate" value="7.1" step="0.05"></div>
    </div>
    <div class="output" id="flOut">—</div>
    <div class="hint">A ladder splits a lump sum across maturities, so something comes due every year instead of everything at once — which is the point when rates might have moved by the time you need the money.</div>`;
  function draw(){
    const amount = Number(root.querySelector('#flAmt').value) || 0;
    const n = Math.min(10, Math.max(2, Number(root.querySelector('#flN').value) || 5));
    const gap = Math.max(0.5, Number(root.querySelector('#flGap').value) || 1);
    const rate = (Number(root.querySelector('#flRate').value) || 0) / 100;
    const each = amount / n;
    const rows = [];
    let total = 0;
    for(let i=0;i<n;i++){
      const years = gap * (i + 1);
      const maturity = each * Math.pow(1 + rate, years);
      total += maturity;
      rows.push([years, maturity]);
    }
    const f = v => '₹' + Math.round(v).toLocaleString(numLocale());
    root.querySelector('#flOut').innerHTML = `<table class="mono">
      <tr><th>Matures in</th><th>Value</th></tr>
      ${rows.map(([y, v])=>`<tr><td>${y} year${y === 1 ? '' : 's'}</td><td>${f(v)}</td></tr>`).join('')}
      <tr><td><b>Total</b></td><td><b>${f(total)}</b></td></tr>
      <tr><td>Each rung</td><td>${f(each)}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

money('nps','NPS Corpus', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Monthly contribution (₹)</label><input type="number" id="npAmt" value="10000"></div>
      <div class="field"><label>Years to 60</label><input type="number" id="npYears" value="25"></div>
      <div class="field"><label>Return (% per year)</label><input type="number" id="npRate" value="10" step="0.5"></div>
      <div class="field"><label>Annuity share (%)</label><input type="number" id="npAnn" value="40" min="0" max="100"></div>
    </div>
    <div class="output" id="npOut">—</div>
    <div class="hint">At 60, at least 40% must buy an annuity and the rest can be withdrawn. The annuity share is not lost — it becomes a pension — but it stops being a lump sum, and that distinction is the one people miss when they compare NPS to a mutual fund.</div>`;
  function draw(){
    const amount = Number(root.querySelector('#npAmt').value) || 0;
    const years = Math.max(1, Number(root.querySelector('#npYears').value) || 1);
    const rate = (Number(root.querySelector('#npRate').value) || 0) / 100;
    const annPct = Math.min(100, Math.max(0, Number(root.querySelector('#npAnn').value) || 0)) / 100;
    const monthly = rate / 12;
    let corpus = 0;
    for(let m=0;m<years*12;m++) corpus = (corpus + amount) * (1 + monthly);
    const invested = amount * years * 12;
    const annuity = corpus * annPct;
    const lump = corpus - annuity;
    const f = v => '₹' + Math.round(v).toLocaleString(numLocale());
    root.querySelector('#npOut').innerHTML = `<table class="mono">
      <tr><td>Invested</td><td>${f(invested)}</td></tr>
      <tr><td><b>Corpus at 60</b></td><td><b>${f(corpus)}</b></td></tr>
      <tr><td>Into an annuity (${Math.round(annPct * 100)}%)</td><td>${f(annuity)}</td></tr>
      <tr><td>Taxable lump sum</td><td>${f(lump)}</td></tr>
      <tr><td>Rough monthly pension at 6%</td><td>${f(annuity * 0.06 / 12)}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Calculation (1) ---------------- */

calc('Dates & Time','workingdays','Working Days', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>From</label><input type="date" id="wdFrom"></div>
      <div class="field"><label>To</label><input type="date" id="wdTo"></div>
    </div>
    <div class="field"><label>Public holidays to exclude (one per line, YYYY-MM-DD)</label><textarea id="wdHol" style="min-height:60px"></textarea></div>
    <div class="output" id="wdOut">—</div>
    <div class="hint">Counts Monday to Friday and excludes the holidays you list — nothing else. Saturday working weeks, regional holidays and the difference between "working days" and "business days" are yours to decide, which is why the list is here rather than assumed.</div>`;
  function draw(){
    const fromEl = root.querySelector('#wdFrom'), toEl = root.querySelector('#wdTo');
    if(!fromEl.value || !toEl.value){
      const now = new Date();
      fromEl.value = now.toISOString().slice(0, 10);
      const later = new Date(now.getTime() + 30 * 86400000);
      toEl.value = later.toISOString().slice(0, 10);
    }
    let from = new Date(fromEl.value + 'T00:00:00Z');
    let to = new Date(toEl.value + 'T00:00:00Z');
    if(from > to){ const t = from; from = to; to = t; }
    const holidays = new Set(root.querySelector('#wdHol').value.split('\n').map(l=>l.trim()).filter(l=>/^\d{4}-\d{2}-\d{2}$/.test(l)));
    let days = 0, weekend = 0, holidayHits = 0;
    for(let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)){
      const iso = d.toISOString().slice(0, 10);
      const dow = d.getUTCDay();
      if(dow === 0 || dow === 6){ weekend++; continue; }
      if(holidays.has(iso)){ holidayHits++; continue; }
      days++;
    }
    const total = Math.round((to - from) / 86400000) + 1;
    root.querySelector('#wdOut').innerHTML = `<table class="mono">
      <tr><td>Calendar days</td><td>${total}</td></tr>
      <tr><td>Weekend days</td><td>${weekend}</td></tr>
      <tr><td>Holidays in range</td><td>${holidayHits}</td></tr>
      <tr><td><b>Working days</b></td><td><b>${days}</b></td></tr>
      <tr><td>Weeks (working days ÷ 5)</td><td>${(days / 5).toFixed(1)}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Science (2) ---------------- */

sci('blackbody','Blackbody Peak', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Temperature (K)</label><input type="number" id="bbT" value="5800"></div>
      <div class="field"><label>or colour temperature (°C)</label><input type="number" id="bbC" value="5527"></div>
    </div>
    <div class="output" id="bbOut">—</div>
    <div class="hint">Wien's law: the peak wavelength is 2.898 × 10⁻³ divided by the temperature. The sun at 5800 K peaks at 500 nm, which is green — and the reason it looks white is that the tail through red and blue is wide enough to add up to it.</div>`;
  function draw(){
    const kelvin = Math.max(1, Number(root.querySelector('#bbT').value) || 5800);
    const out = root.querySelector('#bbOut');
    const peak = 2.897771955e-3 / kelvin;            // metres
    const nm = peak * 1e9;
    const band = nm < 10 ? 'X-ray' : nm < 380 ? 'ultraviolet' : nm < 450 ? 'violet' : nm < 495 ? 'blue'
      : nm < 570 ? 'green' : nm < 590 ? 'yellow' : nm < 620 ? 'orange' : nm < 750 ? 'red' : 'infrared';
    const total = 5.670374419e-8 * Math.pow(kelvin, 4);  // W/m²
    root.querySelector('#bbC').value = (kelvin - 273.15).toFixed(0);
    out.innerHTML = `<table class="mono">
      <tr><td>Temperature</td><td>${kelvin} K (${(kelvin - 273.15).toFixed(0)} °C)</td></tr>
      <tr><td>Peak wavelength</td><td>${nm.toFixed(0)} nm</td></tr>
      <tr><td>Band</td><td>${band}</td></tr>
      <tr><td>Peak frequency</td><td>${(2.998e8 / peak / 1e12).toFixed(1)} THz</td></tr>
      <tr><td>Radiated power</td><td>${total.toExponential(3)} W/m² — the Stefan–Boltzmann total</td></tr>
    </table>`;
  }
  root.querySelector('#bbT').addEventListener('input', draw);
  root.querySelector('#bbC').addEventListener('input', ()=>{
    const c = Number(root.querySelector('#bbC').value) || 0;
    root.querySelector('#bbT').value = (c + 273.15).toFixed(0);
    draw();
  });
  draw();
});

sci('titration','Titration', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Analyte volume (mL)</label><input type="number" id="ttV" value="25"></div>
      <div class="field"><label>Analyte concentration (M)</label><input type="number" id="ttC" value="0.1" step="0.01"></div>
      <div class="field"><label>Moles of titrant per mole of analyte</label><input type="number" id="ttN" value="1" step="0.5"></div>
    </div>
    <div class="row">
      <div class="field"><label>Titrant concentration (M)</label><input type="number" id="ttT" value="0.1" step="0.01"></div>
      <div class="field"><label>or find the titrant concentration</label><input type="number" id="ttUsed" placeholder="mL used" step="0.1"></div>
    </div>
    <div class="output" id="ttOut">—</div>
    <div class="hint">c₁v₁/n₁ = c₂v₂/n₂ — the whole of a titration calculation. The stoichiometry field is where people go wrong: carbonate needs two moles of acid, not one.</div>`;
  function draw(){
    const v = Number(root.querySelector('#ttV').value) || 0;
    const c = Number(root.querySelector('#ttC').value) || 0;
    const n = Number(root.querySelector('#ttN').value) || 1;
    const titrant = Number(root.querySelector('#ttT').value) || 0;
    const used = Number(root.querySelector('#ttUsed').value) || 0;
    const out = root.querySelector('#ttOut');
    const molesAnalyte = c * v / 1000;
    const molesTitrant = molesAnalyte * n;
    if(used > 0 && titrant === 0){
      out.innerHTML = `<table class="mono">
        <tr><td>Moles of analyte</td><td>${molesAnalyte.toExponential(3)} mol</td></tr>
        <tr><td>Moles of titrant needed</td><td>${molesTitrant.toExponential(3)} mol</td></tr>
        <tr><td><b>Titrant concentration</b></td><td><b>${(molesTitrant / (used / 1000)).toFixed(4)} M</b></td></tr>
      </table>`;
      return;
    }
    if(!titrant){ out.textContent = 'Give either a titrant concentration or the volume used.'; return; }
    const volumeNeeded = molesTitrant / titrant * 1000;
    out.innerHTML = `<table class="mono">
      <tr><td>Moles of analyte</td><td>${molesAnalyte.toExponential(3)} mol</td></tr>
      <tr><td>Moles of titrant needed</td><td>${molesTitrant.toExponential(3)} mol</td></tr>
      <tr><td><b>Titrant volume</b></td><td><b>${volumeNeeded.toFixed(2)} mL</b></td></tr>
      <tr><td>Check</td><td>${c} × ${v} = ${titrant} × ${volumeNeeded.toFixed(2)} ÷ ${n}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});
