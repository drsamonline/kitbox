/* ================================================================
   B17 — clinical scores, added because a clinician asked for them.

   The roadmap had these under "deliberately not doing", with the reason: a
   score that drives a decision needs a clinician to own it. The owner of this
   app is a clinician, so the reason no longer holds — and each tool carries the
   same note, in the same place, saying what the score is and what it is not.

   Every one of these is a published instrument, implemented as written. None of
   them adds anything the score does not say.
   ================================================================ */

const SCORE_NOTE = '<div class="hint" style="border-left:2px solid #c0392b;padding-left:10px">A published score, implemented as written. It is a prompt for clinical judgement, not a substitute for it — the score was validated in a population, and your patient may not be in it.</div>';

function scoreTable(rows, total, interpretation){
  return `<table class="mono">
    ${rows.map(([label, value])=>`<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(String(value))}</td></tr>`).join('')}
    <tr><td><b>Total</b></td><td><b>${escapeHtml(String(total))}</b></td></tr>
    ${interpretation ? `<tr><td>Reading</td><td>${escapeHtml(interpretation)}</td></tr>` : ''}
  </table>`;
}

/* ---------------- Glasgow Coma Scale ---------------- */
clin('gcs','Glasgow Coma Scale', root=>{
  const EYE = [['Spontaneous',4],['To speech',3],['To pain',2],['None',1]];
  const VERBAL = [['Oriented',5],['Confused',4],['Inappropriate words',3],['Incomprehensible sounds',2],['None',1]];
  const MOTOR = [['Obeys commands',6],['Localises to pain',5],['Withdraws from pain',4],['Abnormal flexion',3],['Extension',2],['None',1]];
  const opts = list => list.map(([label, v])=>`<option value="${v}">${v} — ${label}</option>`).join('');
  root.innerHTML = `
    <div class="field"><label>Eye opening (E)</label><select id="gsE">${opts(EYE)}</select></div>
    <div class="field"><label>Verbal response (V)</label><select id="gsV">${opts(VERBAL)}</select></div>
    <div class="field"><label>Motor response (M)</label><select id="gsM">${opts(MOTOR)}</select></div>
    <div class="output" id="gsOut">—</div>
    <div class="hint">Report the three components as well as the total: E4 V5 M6 is 15, and E1 V1 M4 is 6 for a very different reason than E4 V1 M1.</div>
    ${SCORE_NOTE}`;
  function draw(){
    const e = Number(root.querySelector('#gsE').value), v = Number(root.querySelector('#gsV').value), m = Number(root.querySelector('#gsM').value);
    const total = e + v + m;
    const band = total >= 13 ? 'mild (13–15)' : total >= 9 ? 'moderate (9–12)' : 'severe (3–8)';
    root.querySelector('#gsOut').innerHTML = scoreTable([
      ['Eye', e], ['Verbal', v], ['Motor', m]
    ], total, band + ' — E' + e + ' V' + v + ' M' + m);
  }
  root.querySelectorAll('select').forEach(el=>el.addEventListener('change', draw));
  draw();
});

/* ---------------- CURB-65 ---------------- */
clin('curb65','CURB-65', root=>{
  const ITEMS = [
    ['Confusion (new onset)', 1],
    ['Urea > 7 mmol/L', 1],
    ['Respiratory rate ≥ 30/min', 1],
    ['Blood pressure: systolic < 90 or diastolic ≤ 60', 1],
    ['Age ≥ 65', 1]
  ];
  root.innerHTML = `
    <div id="cbItems"></div>
    <div class="output" id="cbOut">—</div>
    <div class="hint">For pneumonia severity in the community. Each item is one point; the score is used with, not instead of, an impression of the patient.</div>
    ${SCORE_NOTE}`;
  root.querySelector('#cbItems').innerHTML = ITEMS.map(([label], i)=>
    `<label style="display:flex;gap:8px;align-items:center;padding:6px 0"><input type="checkbox" data-cb="${i}"> ${escapeHtml(label)}</label>`).join('');
  function draw(){
    const rows = ITEMS.map(([label], i)=>({ label, on: root.querySelector(`[data-cb="${i}"]`).checked }));
    const total = rows.filter(r=>r.on).length;
    const reading = total <= 1 ? 'low risk — home treatment usually considered' :
                    total === 2 ? 'intermediate — consider hospital assessment' :
                    'high risk — hospital assessment, consider intensive care';
    root.querySelector('#cbOut').innerHTML = scoreTable(rows.map(r=>[r.label, r.on ? 1 : 0]), total, reading);
  }
  root.querySelectorAll('[data-cb]').forEach(cb=>cb.addEventListener('change', draw));
  draw();
});

/* ---------------- qSOFA ---------------- */
clin('qsofa','qSOFA', root=>{
  const ITEMS = [
    ['Respiratory rate ≥ 22/min', 1],
    ['Altered mentation (GCS < 15)', 1],
    ['Systolic blood pressure ≤ 100 mmHg', 1]
  ];
  root.innerHTML = `
    <div id="qsItems"></div>
    <div class="output" id="qsOut">—</div>
    <div class="hint">A prompt to consider organ dysfunction in suspected infection — not a definition of sepsis and not a triage tool on its own.</div>
    ${SCORE_NOTE}`;
  root.querySelector('#qsItems').innerHTML = ITEMS.map(([label], i)=>
    `<label style="display:flex;gap:8px;align-items:center;padding:6px 0"><input type="checkbox" data-qs="${i}"> ${escapeHtml(label)}</label>`).join('');
  function draw(){
    const rows = ITEMS.map(([label], i)=>({ label, on: root.querySelector(`[data-qs="${i}"]`).checked }));
    const total = rows.filter(r=>r.on).length;
    root.querySelector('#qsOut').innerHTML = scoreTable(rows.map(r=>[r.label, r.on ? 1 : 0]), total,
      total >= 2 ? 'at least two — assess for organ dysfunction' : 'fewer than two');
  }
  root.querySelectorAll('[data-qs]').forEach(cb=>cb.addEventListener('change', draw));
  draw();
});

/* ---------------- Wells: DVT ---------------- */
clin('wellsdvt','Wells Score — DVT', root=>{
  const ITEMS = [
    ['Active cancer (treatment within 6 months, or palliative)', 1],
    ['Paralysis, paresis or recent plaster immobilisation of the leg', 1],
    ['Recently bedridden ≥ 3 days, or major surgery within 12 weeks', 1],
    ['Localised tenderness along the deep venous system', 1],
    ['Entire leg swollen', 1],
    ['Calf swelling ≥ 3 cm compared with the other leg', 1],
    ['Pitting oedema confined to the symptomatic leg', 1],
    ['Collateral superficial veins (non-varicose)', 1],
    ['Previously documented DVT', 1],
    ['Alternative diagnosis at least as likely as DVT', -2]
  ];
  root.innerHTML = `
    <div id="wdItems"></div>
    <div class="output" id="wdOut">—</div>
    <div class="hint">The last item subtracts two, which is why the total can be negative. The three-tier reading is the one usually quoted; the two-tier is what most pathways use.</div>
    ${SCORE_NOTE}`;
  root.querySelector('#wdItems').innerHTML = ITEMS.map(([label, pts], i)=>
    `<label style="display:flex;gap:8px;align-items:center;padding:5px 0"><input type="checkbox" data-wd="${i}"> ${escapeHtml(label)} <span class="mono" style="color:var(--muted)">${pts > 0 ? '+' : ''}${pts}</span></label>`).join('');
  function draw(){
    const rows = ITEMS.map(([label, pts], i)=>({ label, pts, on: root.querySelector(`[data-wd="${i}"]`).checked }));
    const total = rows.filter(r=>r.on).reduce((a, r)=>a + r.pts, 0);
    const three = total >= 3 ? 'high probability' : total >= 1 ? 'moderate probability' : 'low probability';
    const two = total >= 2 ? 'DVT likely — imaging indicated' : 'DVT unlikely — D-dimer pathway';
    root.querySelector('#wdOut').innerHTML = scoreTable(rows.map(r=>[r.label, r.on ? r.pts : 0]), total, three + ' · ' + two);
  }
  root.querySelectorAll('[data-wd]').forEach(cb=>cb.addEventListener('change', draw));
  draw();
});

/* ---------------- Wells: PE ---------------- */
clin('wellspe','Wells Score — PE', root=>{
  const ITEMS = [
    ['Clinical signs of DVT', 3],
    ['PE is the most likely diagnosis (or as likely as any other)', 3],
    ['Heart rate > 100/min', 1.5],
    ['Immobilisation ≥ 3 days or surgery in the previous 4 weeks', 1.5],
    ['Previous DVT or PE', 1.5],
    ['Haemoptysis', 1],
    ['Malignancy (treated within 6 months, or palliative)', 1]
  ];
  root.innerHTML = `
    <div id="wpItems"></div>
    <div class="output" id="wpOut">—</div>
    <div class="hint">The two-tier reading (&gt;4 PE likely, ≤4 unlikely) is the one most pathways use; the three-tier is also shown because it is what the original paper reports.</div>
    ${SCORE_NOTE}`;
  root.querySelector('#wpItems').innerHTML = ITEMS.map(([label, pts], i)=>
    `<label style="display:flex;gap:8px;align-items:center;padding:5px 0"><input type="checkbox" data-wp="${i}"> ${escapeHtml(label)} <span class="mono" style="color:var(--muted)">+${pts}</span></label>`).join('');
  function draw(){
    const rows = ITEMS.map(([label, pts], i)=>({ label, pts, on: root.querySelector(`[data-wp="${i}"]`).checked }));
    const total = rows.filter(r=>r.on).reduce((a, r)=>a + r.pts, 0);
    const two = total > 4 ? 'PE likely — imaging' : 'PE unlikely — D-dimer pathway';
    const three = total > 6 ? 'high' : total >= 2 ? 'moderate' : 'low';
    root.querySelector('#wpOut').innerHTML = scoreTable(rows.map(r=>[r.label, r.on ? r.pts : 0]), total, two + ' · three-tier: ' + three);
  }
  root.querySelectorAll('[data-wp]').forEach(cb=>cb.addEventListener('change', draw));
  draw();
});

/* ---------------- CHA2DS2-VASc ---------------- */
clin('chads','CHA₂DS₂-VASc', root=>{
  const ITEMS = [
    ['Congestive heart failure / LV dysfunction', 1],
    ['Hypertension', 1],
    ['Age ≥ 75', 2],
    ['Diabetes mellitus', 1],
    ['Stroke / TIA / thromboembolism', 2],
    ['Vascular disease (MI, PAD, aortic plaque)', 1],
    ['Age 65–74', 1],
    ['Sex category: female', 1]
  ];
  root.innerHTML = `
    <div id="cdItems"></div>
    <div class="output" id="cdOut">—</div>
    <div class="hint">Age 65–74 and age ≥ 75 are separate rows because the score weights them differently — tick at most one. The sex point is there because the score was derived that way, not because sex is a risk factor on its own.</div>
    ${SCORE_NOTE}`;
  root.querySelector('#cdItems').innerHTML = ITEMS.map(([label, pts], i)=>
    `<label style="display:flex;gap:8px;align-items:center;padding:5px 0"><input type="checkbox" data-cd="${i}"> ${escapeHtml(label)} <span class="mono" style="color:var(--muted)">+${pts}</span></label>`).join('');
  function draw(){
    const rows = ITEMS.map(([label, pts], i)=>({ label, pts, on: root.querySelector(`[data-cd="${i}"]`).checked }));
    const total = rows.filter(r=>r.on).reduce((a, r)=>a + r.pts, 0);
    const reading = total === 0 ? 'no anticoagulation indicated on score alone' :
                    total === 1 ? 'consider anticoagulation — a score of 1 is a decision, not an answer' :
                    'anticoagulation recommended by guideline';
    root.querySelector('#cdOut').innerHTML = scoreTable(rows.map(r=>[r.label, r.on ? r.pts : 0]), total, reading);
  }
  root.querySelectorAll('[data-cd]').forEach(cb=>cb.addEventListener('change', draw));
  draw();
});

/* ---------------- HAS-BLED ---------------- */
clin('hasbled','HAS-BLED', root=>{
  const ITEMS = [
    ['Hypertension (uncontrolled, systolic > 160)', 1],
    ['Abnormal renal function', 1],
    ['Abnormal liver function', 1],
    ['Stroke', 1],
    ['Bleeding history or predisposition', 1],
    ['Labile INR (TTR < 60%)', 1],
    ['Elderly (age > 65)', 1],
    ['Drugs that predispose to bleeding', 1],
    ['Alcohol (≥ 8 units/week)', 1]
  ];
  root.innerHTML = `
    <div id="hbItems"></div>
    <div class="output" id="hbOut">—</div>
    <div class="hint">A bleeding-risk score is a prompt to fix modifiable factors — blood pressure, alcohol, interacting drugs — not a reason to withhold anticoagulation on its own.</div>
    ${SCORE_NOTE}`;
  root.querySelector('#hbItems').innerHTML = ITEMS.map(([label], i)=>
    `<label style="display:flex;gap:8px;align-items:center;padding:5px 0"><input type="checkbox" data-hb="${i}"> ${escapeHtml(label)}</label>`).join('');
  function draw(){
    const rows = ITEMS.map(([label], i)=>({ label, on: root.querySelector(`[data-hb="${i}"]`).checked }));
    const total = rows.filter(r=>r.on).length;
    root.querySelector('#hbOut').innerHTML = scoreTable(rows.map(r=>[r.label, r.on ? 1 : 0]), total,
      total >= 3 ? 'high bleeding risk — address the modifiable factors' : 'lower bleeding risk');
  }
  root.querySelectorAll('[data-hb]').forEach(cb=>cb.addEventListener('change', draw));
  draw();
});

/* ---------------- Child-Pugh ---------------- */
clin('childpugh','Child-Pugh', root=>{
  const OPTS = {
    bili: [['< 2 mg/dL', 1], ['2–3 mg/dL', 2], ['> 3 mg/dL', 3]],
    alb: [['> 3.5 g/dL', 1], ['2.8–3.5 g/dL', 2], ['< 2.8 g/dL', 3]],
    inr: [['< 1.7', 1], ['1.7–2.3', 2], ['> 2.3', 3]],
    asc: [['None', 1], ['Mild (controlled with diuretics)', 2], ['Moderate–severe (refractory)', 3]],
    enc: [['None', 1], ['Mild', 2], ['Moderate–severe', 3]]
  };
  const opts = list => list.map(([label, v])=>`<option value="${v}">${v} — ${label}</option>`).join('');
  root.innerHTML = `
    <div class="field"><label>Bilirubin</label><select id="cpBili">${opts(OPTS.bili)}</select></div>
    <div class="field"><label>Albumin</label><select id="cpAlb">${opts(OPTS.alb)}</select></div>
    <div class="field"><label>INR (or PT prolongation)</label><select id="cpInr">${opts(OPTS.inr)}</select></div>
    <div class="field"><label>Ascites</label><select id="cpAsc">${opts(OPTS.asc)}</select></div>
    <div class="field"><label>Encephalopathy</label><select id="cpEnc">${opts(OPTS.enc)}</select></div>
    <div class="output" id="cpOut">—</div>
    <div class="hint">Each of the five items scores 1–3, so the total runs 5–15. Class B and C change what can be offered; the number on its own does not.</div>
    ${SCORE_NOTE}`;
  function draw(){
    const ids = ['cpBili','cpAlb','cpInr','cpAsc','cpEnc'];
    const labels = ['Bilirubin','Albumin','INR','Ascites','Encephalopathy'];
    const vals = ids.map(id=>Number(root.querySelector('#' + id).value));
    const total = vals.reduce((a, b)=>a + b, 0);
    const cls = total <= 6 ? 'Class A (5–6)' : total <= 9 ? 'Class B (7–9)' : 'Class C (10–15)';
    root.querySelector('#cpOut').innerHTML = scoreTable(labels.map((l, i)=>[l, vals[i]]), total, cls);
  }
  root.querySelectorAll('select').forEach(el=>el.addEventListener('change', draw));
  draw();
});
