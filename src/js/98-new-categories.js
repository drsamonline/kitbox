/* ================================================================
   B13 — four categories that were missing
   Accessibility, Education, Clinical, Money (India).

   Each tool here answers a question someone actually asks: does my text
   survive WCAG spacing, what does an eGFR of 45 mean, how much of my HRA is
   exempt. The clinical ones carry a disclaimer and always will — a calculator
   is not a clinician.
   ================================================================ */

/* ---------------- Accessibility (5) ---------------- */
TOOLS.accessibility = TOOLS.accessibility || [];  // idempotent: a part that sorts earlier may have registered already
function acc(id, name, render){ register({cat:'accessibility', id, name, render}); }

acc('readingruler','Reading Ruler', root=>{
  root.innerHTML = `
    <div class="field"><label>Your text</label>
      <textarea id="rrText" style="min-height:170px" placeholder="Paste the paragraph you are reading.">Reading a long line is hard because the eye loses its place on the return sweep. A ruler fixes that by making one line at a time the only line that matters.</textarea></div>
    <div class="row">
      <div class="field"><label>Band height (px)</label><input type="number" id="rrH" value="34" min="16" max="120"></div>
      <div class="field"><label>Dim the rest?</label><select id="rrDim"><option value="0.15">Slightly</option><option value="0.4">A lot</option><option value="0">Not at all</option></select></div>
    </div>
    <div id="rrStage" style="position:relative;margin-top:12px">
      <div id="rrBand" style="position:absolute;left:0;right:0;height:34px;background:rgba(47,134,235,0.18);border-top:1px solid #2f86eb;border-bottom:1px solid #2f86eb;pointer-events:none;display:none"></div>
      <div id="rrOut" style="font-size:16px;line-height:34px;padding:8px 0"></div>
    </div>
    <div class="hint">Move the pointer over the text. The band follows the line you are on; everything else fades.</div>`;
  const out = root.querySelector('#rrOut'), band = root.querySelector('#rrBand'), stage = root.querySelector('#rrStage');
  function draw(){
    out.textContent = root.querySelector('#rrText').value;
    band.style.height = root.querySelector('#rrH').value + 'px';
    out.style.lineHeight = root.querySelector('#rrH').value + 'px';
  }
  stage.addEventListener('pointermove', e=>{
    const r = stage.getBoundingClientRect();
    const h = Number(root.querySelector('#rrH').value);
    const top = Math.floor((e.clientY - r.top) / h) * h;
    band.style.top = top + 'px';
    band.style.display = 'block';
    out.style.opacity = String(1 - Number(root.querySelector('#rrDim').value) * 0.35);
  });
  stage.addEventListener('pointerleave', ()=>{ band.style.display = 'none'; out.style.opacity = '1'; });
  root.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

acc('dyslexiapreview','Dyslexia-Friendly Preview', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="dpIn" style="min-height:120px">The quick brown fox jumps over the lazy dog. Dense paragraphs with tight spacing are harder to read for roughly one person in ten.</textarea></div>
    <div class="row">
      <div class="field"><label>Letter spacing (em)</label><input type="number" id="dpLetter" value="0.12" step="0.02" min="0" max="0.4"></div>
      <div class="field"><label>Word spacing (em)</label><input type="number" id="dpWord" value="0.16" step="0.02" min="0" max="0.6"></div>
      <div class="field"><label>Line height</label><input type="number" id="dpLine" value="1.8" step="0.1" min="1" max="3"></div>
    </div>
    <div class="output" id="dpOut" style="font-size:17px;white-space:pre-wrap"></div>
    <div class="hint">WCAG 1.4.12 asks for at least 0.12em letter spacing, 0.16em word spacing and 1.5 line height — the defaults here. This shows the effect; it cannot tell you which font your reader finds easiest.</div>`;
  function draw(){
    const out = root.querySelector('#dpOut');
    out.textContent = root.querySelector('#dpIn').value;
    out.style.letterSpacing = root.querySelector('#dpLetter').value + 'em';
    out.style.wordSpacing = root.querySelector('#dpWord').value + 'em';
    out.style.lineHeight = root.querySelector('#dpLine').value;
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

acc('textspacing','Text Spacing Checker', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="tsIn" style="min-height:110px">Spacing settings must not clip content. If your layout breaks when a reader applies their own spacing, the layout is the problem.</textarea></div>
    <div class="field"><label>Container width (px)</label><input type="number" id="tsW" value="320"></div>
    <div class="output" id="tsOut"></div>
    <div class="hint">Applies the WCAG 1.4.12 spacing to your text in a fixed-width box and reports whether it overflows. Overflow means a reader who needs more spacing would lose content.</div>`;
  function draw(){
    const box = root.querySelector('#tsOut');
    const w = Number(root.querySelector('#tsW').value) || 320;
    box.style.width = w + 'px';
    box.style.letterSpacing = '0.12em';
    box.style.wordSpacing = '0.16em';
    box.style.lineHeight = '1.5';
    box.textContent = root.querySelector('#tsIn').value;
    const overflow = box.scrollHeight > box.clientHeight + 2 || box.scrollWidth > box.clientWidth + 2;
    box.style.maxHeight = 'none';
    const msg = document.createElement('div');
    msg.className = 'hint';
    msg.style.marginTop = '10px';
    msg.textContent = overflow
      ? 'The text needs ' + box.scrollWidth + ' px but the box is ' + w + ' px: a reader applying WCAG spacing would lose content.'
      : 'The text fits at WCAG spacing in a ' + w + ' px box.';
    box.appendChild(msg);
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

acc('altcheck','Alt Text Checker', root=>{
  root.innerHTML = `
    <div class="field"><label>Alt text</label><textarea id="acIn" style="min-height:80px" placeholder="A radiograph of the right knee showing a healed tibial plateau fracture."></textarea></div>
    <div class="output" id="acOut">—</div>
    <div class="hint">Checks the things that make alt text useless: it is missing, it starts with "image of", it is a filename, it is longer than a screen reader will read before the listener gives up.</div>`;
  root.querySelector('#acIn').addEventListener('input', e=>{
    const t = e.target.value.trim();
    const issues = [];
    if(!t) issues.push('Empty. A decorative image should be marked decorative rather than given no text; an informative one needs a description.');
    if(/^(image|photo|picture|screenshot|graphic) of/i.test(t)) issues.push('Starts with "image of" — the screen reader already says it is an image.');
    if(/\.(png|jpe?g|gif|webp|svg)$/i.test(t)) issues.push('That looks like a filename, not a description.');
    if(t.length > 250) issues.push('Longer than 250 characters — consider a short alt plus a longer description nearby.');
    if(/^[A-Z0-9 _-]{8,}$/.test(t)) issues.push('All capitals or all symbols — screen readers may spell it out letter by letter.');
    root.querySelector('#acOut').innerHTML = (issues.length
      ? '<div style="color:#c0392b">' + issues.map(escapeHtml).join('<br>') + '</div>'
      : '<div style="color:#1a7f37">Reads as a description. ' + t.length + ' characters.</div>');
  });
});

acc('focuspreview','Focus Ring Preview', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Outline width (px)</label><input type="number" id="fpW" value="2" min="1" max="8"></div>
      <div class="field"><label>Offset (px)</label><input type="number" id="fpO" value="2" min="0" max="8"></div>
      <div class="field"><label>Colour</label><input type="color" id="fpC" value="#2f86eb" aria-label="Focus ring colour"></div>
    </div>
    <div class="segrow" id="fpDemo">
      <button class="btn" id="fpBtn1">A button</button>
      <a class="btn" href="#/tool/accessibility/focuspreview" id="fpBtn2" style="text-decoration:none">A link</a>
    </div>
    <div class="hint">Tab to the two controls to see the ring. WCAG 2.4.11 wants at least 2 px of visible indicator; 3:1 against the background is the other half of the rule.</div>`;
  function draw(){
    const w = root.querySelector('#fpW').value, o = root.querySelector('#fpO').value, c = root.querySelector('#fpC').value;
    root.querySelectorAll('#fpBtn1, #fpBtn2').forEach(el=>{
      el.style.outline = w + 'px solid ' + c;
      el.style.outlineOffset = o + 'px';
    });
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Education (4) ---------------- */
TOOLS.education = TOOLS.education || [];  // idempotent: a part that sorts earlier may have registered already
function edu(id, name, render){ register({cat:'education', id, name, render}); }

edu('timestable','Multiplication Table', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Size</label><input type="number" id="mtN" value="12" min="2" max="30"></div>
      <div class="field"><label>Highlight multiples of</label><input type="number" id="mtH" value="7" min="1" max="30"></div>
    </div>
    <div id="mtOut" style="overflow:auto"></div>
    <div class="hint">Hover a cell to see the two numbers it multiplies.</div>`;
  function draw(){
    const n = Math.min(30, Math.max(2, Number(root.querySelector('#mtN').value) || 12));
    const h = Number(root.querySelector('#mtH').value) || 0;
    let html = '<table class="mono" style="border-collapse:collapse"><tr><th scope="col" aria-label="Multiplicand">×</th>';
    for(let j=1;j<=n;j++) html += `<th style="padding:4px 8px;color:var(--muted)">${j}</th>`;
    html += '</tr>';
    for(let i=1;i<=n;i++){
      html += `<tr><th style="padding:4px 8px;color:var(--muted);text-align:right">${i}</th>`;
      for(let j=1;j<=n;j++){
        const v = i*j;
        const on = h && v % h === 0;
        html += `<td title="${i} × ${j} = ${v}" style="padding:4px 8px;text-align:right;${on?'background:rgba(47,134,235,0.16);font-weight:600':''}">${v}</td>`;
      }
      html += '</tr>';
    }
    root.querySelector('#mtOut').innerHTML = html + '</table>';
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

edu('timesquiz','Times Table Quiz', root=>{
  root.innerHTML = `
    <div class="output" id="tqQ" style="font-size:26px;text-align:center;padding:24px">Press Start</div>
    <div class="row">
      <input type="number" id="tqA" placeholder="answer" style="flex:1" aria-label="Your answer">
      <button class="btn primary" id="tqGo">Start</button>
    </div>
    <div class="hint" id="tqS">Ten questions, up to 12 × 12.</div>`;
  let a=0,b=0,score=0,asked=0,playing=false;
  const q = root.querySelector('#tqQ'), ans = root.querySelector('#tqA'), go = root.querySelector('#tqGo'), st = root.querySelector('#tqS');
  function next(){
    a = 2 + Math.floor(Math.random()*11);
    b = 2 + Math.floor(Math.random()*11);
    q.textContent = a + ' × ' + b + ' = ?';
    ans.value = '';
    ans.focus();
    st.textContent = 'Question ' + (asked+1) + ' of 10 · score ' + score;
  }
  function start(){ playing = true; score = 0; asked = 0; go.textContent = 'Start'; next(); }
  function submit(){
    if(!playing || ans.value === '') return;
    if(Number(ans.value) === a*b) score++;
    asked++;
    if(asked >= 10){
      playing = false;
      q.textContent = score + ' / 10';
      st.textContent = score >= 8 ? 'Solid.' : 'Worth another round.';
      go.textContent = 'Again';
      return;
    }
    next();
  }
  go.addEventListener('click', ()=>{ if(!playing) start(); else submit(); });
  ans.addEventListener('keydown', e=>{ if(e.key === 'Enter') submit(); });
});

edu('unitcircle','Unit Circle', root=>{
  root.innerHTML = `
    <div class="field"><label>Angle</label><input type="number" id="ucDeg" value="30" step="15"></div>
    <div class="output" id="ucOut">—</div>
    <div class="hint">The six functions at that angle, plus the exact values at the angles everyone is asked about.</div>
    <table class="mono" id="ucTable"></table>`;
  const KEY = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330];
  function draw(){
    const deg = Number(root.querySelector('#ucDeg').value) || 0;
    const r = deg * Math.PI / 180;
    const f = x => Math.abs(x) < 1e-12 ? '0' : (Math.abs(Math.abs(x)-1) < 1e-12 ? (x>0?'1':'−1') : x.toFixed(4));
    root.querySelector('#ucOut').innerHTML = `<table class="mono">
      <tr><td>Degrees</td><td>${deg}°</td></tr>
      <tr><td>Radians</td><td>${(r).toFixed(4)} (${['0','π/6','π/4','π/3','π/2'][KEY.indexOf(deg)] || '—'})</td></tr>
      <tr><td>sin</td><td>${f(Math.sin(r))}</td></tr>
      <tr><td>cos</td><td>${f(Math.cos(r))}</td></tr>
      <tr><td>tan</td><td>${Math.abs(Math.cos(r)) < 1e-12 ? 'undefined' : f(Math.tan(r))}</td></tr>
    </table>`;
  }
  root.querySelector('#ucTable').innerHTML = '<tr><th style="text-align:left">°</th><th>sin</th><th>cos</th><th>tan</th></tr>'
    + KEY.map(d=>{
        const r = d*Math.PI/180, c = Math.cos(r);
        const fmt = v => Math.abs(v)<1e-12?'0':(Math.abs(v-1)<1e-12?'1':(Math.abs(v+1)<1e-12?'−1':v.toFixed(3)));
        return `<tr><td>${d}</td><td>${fmt(Math.sin(r))}</td><td>${fmt(c)}</td><td>${Math.abs(c)<1e-12?'—':fmt(Math.tan(r))}</td></tr>`;
      }).join('');
  root.querySelector('#ucDeg').addEventListener('input', draw);
  draw();
});

edu('formulasheet','Formula Sheet', root=>{
  const GROUPS = {
    'Area': [['Circle','πr²'],['Triangle','½ × base × height'],['Trapezium','½(a+b)h'],['Sector','½r²θ (θ in radians)']],
    'Volume': [['Sphere','4/3 πr³'],['Cylinder','πr²h'],['Cone','⅓πr²h'],['Cuboid','l × w × h']],
    'Algebra': [['Quadratic roots','x = (−b ± √(b²−4ac)) / 2a'],['Difference of squares','a² − b² = (a+b)(a−b)'],['Binomial','(a+b)² = a² + 2ab + b²']],
    'Physics': [['Speed','v = d / t'],['Force','F = ma'],['Ohm','V = IR'],['Energy','E = ½mv²']],
    'Finance': [['Compound interest','A = P(1 + r/n)^(nt)'],['EMI','P·r(1+r)^n / ((1+r)^n − 1)']]
  };
  root.innerHTML = `<div class="hint">Reference only — the constants and forms most often needed, grouped so you can find one without a search.</div>`
    + Object.entries(GROUPS).map(([g, rows])=>`
      <div class="section-label" style="margin-top:16px">${escapeHtml(g)}</div>
      <table class="mono">${rows.map(([n,f])=>`<tr><td>${escapeHtml(n)}</td><td>${escapeHtml(f)}</td></tr>`).join('')}</table>`).join('');
});

/* ---------------- Clinical (4) ---------------- */
TOOLS.clinical = TOOLS.clinical || [];  // idempotent: a part that sorts earlier may have registered already
function clin(id, name, render){ register({cat:'clinical', id, name, render}); }

const CLINICAL_NOTE = '<div class="hint" style="border-left:2px solid #c0392b;padding-left:10px">A calculator, not a clinician. Every number here depends on assumptions a patient may not fit — check it against the protocol you work to, and against the patient in front of you.</div>';

clin('paeddose','Paediatric Dose', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Weight (kg)</label><input type="number" id="pdW" value="14" step="0.1"></div>
      <div class="field"><label>Dose (mg/kg)</label><input type="number" id="pdD" value="15" step="0.5"></div>
      <div class="field"><label>Doses per day</label><input type="number" id="pdN" value="3" min="1" max="6"></div>
    </div>
    <div class="row">
      <div class="field"><label>Concentration (mg/mL)</label><input type="number" id="pdC" value="250" step="1"></div>
      <div class="field"><label>Max daily dose (mg, optional)</label><input type="number" id="pdMax" placeholder="leave blank if none"></div>
    </div>
    <div class="output" id="pdOut">—</div>
    ${CLINICAL_NOTE}`;
  function draw(){
    const w = Number(root.querySelector('#pdW').value) || 0;
    const d = Number(root.querySelector('#pdD').value) || 0;
    const n = Number(root.querySelector('#pdN').value) || 1;
    const c = Number(root.querySelector('#pdC').value) || 0;
    const max = Number(root.querySelector('#pdMax').value) || 0;
    const perDose = w * d;
    const perDay = perDose * n;
    const ml = c ? perDose / c : 0;
    const capped = max && perDay > max;
    root.querySelector('#pdOut').innerHTML = `<table class="mono">
      <tr><td>Per dose</td><td>${perDose.toFixed(1)} mg</td></tr>
      <tr><td>Per day (${n} doses)</td><td>${perDay.toFixed(1)} mg</td></tr>
      <tr><td>Volume per dose</td><td>${c ? ml.toFixed(2) + ' mL' : 'enter a concentration'}</td></tr>
      ${max ? `<tr><td>Against the stated maximum</td><td style="color:${capped ? '#c0392b' : '#1a7f37'}">${capped ? 'OVER — ' + perDay.toFixed(0) + ' mg vs ' + max + ' mg' : 'within ' + max + ' mg'}</td></tr>` : ''}
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

clin('drip','IV Drip Rate', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Volume (mL)</label><input type="number" id="drV" value="500"></div>
      <div class="field"><label>Over hours</label><input type="number" id="drH" value="4" step="0.5"></div>
      <div class="field"><label>Drop factor (drops/mL)</label><select id="drF"><option value="20">20 (macrodrip)</option><option value="15">15</option><option value="10">10 (blood set)</option><option value="60">60 (microdrip)</option></select></div>
    </div>
    <div class="output" id="drOut">—</div>
    ${CLINICAL_NOTE}`;
  function draw(){
    const v = Number(root.querySelector('#drV').value) || 0;
    const h = Number(root.querySelector('#drH').value) || 0;
    const f = Number(root.querySelector('#drF').value) || 20;
    if(!h){ root.querySelector('#drOut').textContent = 'Enter a duration.'; return; }
    const mlhr = v / h;
    const dpm = (v * f) / (h * 60);
    root.querySelector('#drOut').innerHTML = `<table class="mono">
      <tr><td>Rate</td><td>${mlhr.toFixed(0)} mL/hour</td></tr>
      <tr><td>Drops</td><td>${dpm.toFixed(0)} per minute</td></tr>
      <tr><td>Seconds per drop</td><td>${dpm ? (60 / dpm).toFixed(1) : '—'} s</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

clin('egfr','eGFR (CKD-EPI 2021)', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Creatinine (mg/dL)</label><input type="number" id="egC" value="1.0" step="0.01"></div>
      <div class="field"><label>Age (years)</label><input type="number" id="egA" value="50"></div>
      <div class="field"><label>Sex</label><select id="egS"><option value="f">Female</option><option value="m">Male</option></select></div>
    </div>
    <div class="output" id="egOut">—</div>
    <div class="hint">CKD-EPI 2021, creatinine-based, no race coefficient. Staging follows KDIGO. Values are reported as mL/min/1.73 m².</div>
    ${CLINICAL_NOTE}`;
  function draw(){
    const cr = Number(root.querySelector('#egC').value) || 0;
    const age = Number(root.querySelector('#egA').value) || 0;
    const female = root.querySelector('#egS').value === 'f';
    if(!cr || !age){ root.querySelector('#egOut').textContent = 'Enter creatinine and age.'; return; }
    const k = female ? 0.7 : 0.9, a = female ? -0.241 : -0.302;
    const e = 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.200)
      * Math.pow(0.9938, age) * (female ? 1.012 : 1);
    const stage = e >= 90 ? 'G1 — normal or high' : e >= 60 ? 'G2 — mildly decreased'
      : e >= 45 ? 'G3a — mild to moderate' : e >= 30 ? 'G3b — moderate to severe'
      : e >= 15 ? 'G4 — severely decreased' : 'G5 — kidney failure';
    root.querySelector('#egOut').innerHTML = `<table class="mono">
      <tr><td>eGFR</td><td>${e.toFixed(0)} mL/min/1.73 m²</td></tr>
      <tr><td>KDIGO stage</td><td>${escapeHtml(stage)}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

clin('electrolytes','Corrected Calcium & Anion Gap', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Total calcium (mg/dL)</label><input type="number" id="ecCa" value="8.0" step="0.1"></div>
      <div class="field"><label>Albumin (g/dL)</label><input type="number" id="ecAlb" value="3.0" step="0.1"></div>
    </div>
    <div class="row">
      <div class="field"><label>Sodium (mmol/L)</label><input type="number" id="ecNa" value="140"></div>
      <div class="field"><label>Chloride (mmol/L)</label><input type="number" id="ecCl" value="104"></div>
      <div class="field"><label>Bicarbonate (mmol/L)</label><input type="number" id="ecHco3" value="24"></div>
    </div>
    <div class="output" id="ecOut">—</div>
    <div class="hint">Corrected calcium uses the conventional 0.8 mg/dL per 1 g/dL of albumin below 4.0. Anion gap is Na − (Cl + HCO₃); add ~2.5 if your lab reports potassium-inclusive values.</div>
    ${CLINICAL_NOTE}`;
  function draw(){
    const ca = Number(root.querySelector('#ecCa').value) || 0;
    const alb = Number(root.querySelector('#ecAlb').value) || 0;
    const na = Number(root.querySelector('#ecNa').value) || 0;
    const cl = Number(root.querySelector('#ecCl').value) || 0;
    const hco3 = Number(root.querySelector('#ecHco3').value) || 0;
    const corrected = ca + 0.8 * (4.0 - alb);
    const gap = na - (cl + hco3);
    root.querySelector('#ecOut').innerHTML = `<table class="mono">
      <tr><td>Corrected calcium</td><td>${corrected.toFixed(1)} mg/dL</td></tr>
      <tr><td>Anion gap</td><td>${gap.toFixed(0)} mmol/L</td></tr>
      <tr><td>Reading</td><td>${gap > 12 ? 'raised — consider a cause' : 'within the usual range'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Money (India) (4) ---------------- */
TOOLS.money = TOOLS.money || [];  // idempotent: a part that sorts earlier may have registered already
function money(id, name, render){ register({cat:'money', id, name, render}); }

money('hra','HRA Exemption', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Basic + DA (₹ per year)</label><input type="number" id="hraB" value="600000"></div>
      <div class="field"><label>HRA received (₹ per year)</label><input type="number" id="hraR" value="300000"></div>
    </div>
    <div class="row">
      <div class="field"><label>Rent paid (₹ per year)</label><input type="number" id="hraP" value="240000"></div>
      <div class="field"><label>Metro city?</label><select id="hraM"><option value="0.5">Yes — Delhi, Mumbai, Kolkata, Chennai</option><option value="0.4">No — anywhere else</option></select></div>
    </div>
    <div class="output" id="hraOut">—</div>
    <div class="hint">The exemption is the least of three: HRA received, rent minus 10% of basic, or 50%/40% of basic. Old regime only — the new regime does not allow it.</div>`;
  function draw(){
    const b = Number(root.querySelector('#hraB').value) || 0;
    const r = Number(root.querySelector('#hraR').value) || 0;
    const p = Number(root.querySelector('#hraP').value) || 0;
    const pct = Number(root.querySelector('#hraM').value);
    const a = r, bb = Math.max(0, p - 0.1 * b), c = b * pct;
    const exempt = Math.min(a, bb, c);
    const f = n => '₹' + Math.round(n).toLocaleString(numLocale());
    root.querySelector('#hraOut').innerHTML = `<table class="mono">
      <tr><td>HRA received</td><td>${f(a)}</td></tr>
      <tr><td>Rent − 10% of basic</td><td>${f(bb)}</td></tr>
      <tr><td>${pct === 0.5 ? '50' : '40'}% of basic</td><td>${f(c)}</td></tr>
      <tr><td><b>Exempt</b></td><td><b>${f(exempt)}</b></td></tr>
      <tr><td>Taxable HRA</td><td>${f(Math.max(0, a - exempt))}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

money('epf','EPF Corpus', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Monthly basic + DA (₹)</label><input type="number" id="epB" value="40000"></div>
      <div class="field"><label>Years of service</label><input type="number" id="epY" value="25"></div>
      <div class="field"><label>Interest (% per year)</label><input type="number" id="epR" value="8.25" step="0.05"></div>
    </div>
    <div class="output" id="epOut">—</div>
    <div class="hint">Employee 12% plus employer 12% (3.67% to EPF, 8.33% to EPS), on basic + DA, with the interest compounded annually on the balance. Actual returns depend on the rate declared each year and on whether you contribute on a higher wage.</div>`;
  function draw(){
    const b = Number(root.querySelector('#epB').value) || 0;
    const y = Number(root.querySelector('#epY').value) || 0;
    const r = (Number(root.querySelector('#epR').value) || 0) / 100;
    const monthly = b * 0.12 + b * 0.0367;
    let bal = 0;
    for(let m=0;m<y*12;m++) bal = bal * (1 + r/12) + monthly;
    const contributed = monthly * y * 12;
    const f = n => '₹' + Math.round(n).toLocaleString(numLocale());
    root.querySelector('#epOut').innerHTML = `<table class="mono">
      <tr><td>Monthly contribution to EPF</td><td>${f(monthly)}</td></tr>
      <tr><td>Contributed over ${y} years</td><td>${f(contributed)}</td></tr>
      <tr><td>Interest earned</td><td>${f(bal - contributed)}</td></tr>
      <tr><td><b>Corpus at retirement</b></td><td><b>${f(bal)}</b></td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

money('gratuity','Gratuity', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Last drawn basic + DA (₹ per month)</label><input type="number" id="grB" value="50000"></div>
      <div class="field"><label>Years of service</label><input type="number" id="grY" value="10" step="0.5"></div>
    </div>
    <div class="output" id="grOut">—</div>
    <div class="hint">15/26 × last drawn basic + DA × years of service, for employers covered by the Payment of Gratuity Act. Service beyond six months rounds up to the next year. The statutory ceiling is ₹20 lakh.</div>`;
  function draw(){
    const b = Number(root.querySelector('#grB').value) || 0;
    const y = Number(root.querySelector('#grY').value) || 0;
    const years = Math.floor(y) + ((y % 1) >= 0.5 ? 1 : 0);
    const g = (15 / 26) * b * years;
    const f = n => '₹' + Math.round(n).toLocaleString(numLocale());
    root.querySelector('#grOut').innerHTML = `<table class="mono">
      <tr><td>Years counted</td><td>${years}</td></tr>
      <tr><td>Gratuity</td><td>${f(g)}</td></tr>
      <tr><td>Above the ceiling?</td><td>${g > 2000000 ? 'yes — the excess is taxable' : 'no'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

money('ppf','PPF / FD Maturity', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Amount (₹)</label><input type="number" id="pfA" value="150000"></div>
      <div class="field"><label>Rate (% per year)</label><input type="number" id="pfR" value="7.1" step="0.05"></div>
      <div class="field"><label>Years</label><input type="number" id="pfY" value="15"></div>
    </div>
    <div class="field"><label>Compounding</label><select id="pfC">
      <option value="1">Yearly — PPF, most FDs</option>
      <option value="4">Quarterly — many bank FDs</option>
      <option value="2">Half-yearly</option>
    </select></div>
    <div class="output" id="pfOut">—</div>
    <div class="hint">A lump sum, compounded. For a yearly contribution use the SIP calculator instead — the two are different questions.</div>`;
  function draw(){
    const p = Number(root.querySelector('#pfA').value) || 0;
    const r = (Number(root.querySelector('#pfR').value) || 0) / 100;
    const y = Number(root.querySelector('#pfY').value) || 0;
    const n = Number(root.querySelector('#pfC').value) || 1;
    const a = p * Math.pow(1 + r/n, n*y);
    const f = v => '₹' + Math.round(v).toLocaleString(numLocale());
    root.querySelector('#pfOut').innerHTML = `<table class="mono">
      <tr><td>Invested</td><td>${f(p)}</td></tr>
      <tr><td>Interest</td><td>${f(a - p)}</td></tr>
      <tr><td><b>Maturity value</b></td><td><b>${f(a)}</b></td></tr>
      <tr><td>Effective annual return</td><td>${((Math.pow(a/p, 1/y) - 1) * 100).toFixed(2)}%</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});
