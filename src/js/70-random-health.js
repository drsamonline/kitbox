/* ================================================================
   RANDOMIZER TOOLS
   ================================================================ */
TOOLS.random = [];
let RND_N = 0;
function rnd(id, name, render){ register({cat:'random', id, name, render}); }

rnd('luckywheel','Lucky Wheel', root=>{
  root.innerHTML = `
    <div class="field"><label>Options (one per line)</label><textarea id="lwOptions">Pizza\nBurger\nSushi\nTacos\nSalad\nPasta</textarea></div>
    <div style="text-align:center;margin:20px 0">
      <div style="position:relative;width:260px;height:260px;margin:0 auto">
        <div style="position:absolute;top:-6px;left:50%;transform:translateX(-50%);z-index:2;width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:20px solid var(--ink)"></div>
        <svg id="lwWheel" viewBox="0 0 200 200" style="width:100%;height:100%;transition:transform 4s cubic-bezier(0.15,0.8,0.15,1);transform:rotate(0deg)"></svg>
      </div>
      <button class="btn primary" id="lwSpin" style="margin-top:18px">Spin</button>
    </div>
    <div class="output" id="lwOut" style="text-align:center">Result will appear here.</div>`;
  const COLORS = ['#E31C7D','#E6A400','#9FCB1B','#F4483D','#2F86EB','#A93CF5','#3FCB6B','#22D9D9','#1FCE9C','#12A99A','#F2871A'];
  const wheel = root.querySelector('#lwWheel');
  const out = root.querySelector('#lwOut');
  let rotation = 0;
  function getOptions(){ return root.querySelector('#lwOptions').value.split('\n').map(s=>s.trim()).filter(Boolean); }
  function draw(){
    const opts = getOptions();
    const n = opts.length;
    if(n<2){ wheel.innerHTML = ''; return; }
    const segAngle = 360/n;
    let svg = '';
    for(let i=0;i<n;i++){
      const start = i*segAngle - 90, end = (i+1)*segAngle - 90;
      const x1 = 100+90*Math.cos(start*Math.PI/180), y1 = 100+90*Math.sin(start*Math.PI/180);
      const x2 = 100+90*Math.cos(end*Math.PI/180), y2 = 100+90*Math.sin(end*Math.PI/180);
      const large = segAngle>180?1:0;
      svg += `<path d="M100,100 L${x1},${y1} A90,90 0 ${large} 1 ${x2},${y2} Z" fill="${COLORS[i%COLORS.length]}"/>`;
      const mid = i*segAngle+segAngle/2-90;
      const tx = 100+58*Math.cos(mid*Math.PI/180), ty = 100+58*Math.sin(mid*Math.PI/180);
      svg += `<text x="${tx}" y="${ty}" fill="#fff" font-size="9" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" transform="rotate(${mid+90} ${tx} ${ty})">${escapeHtml(opts[i].length>12?opts[i].slice(0,11)+'…':opts[i])}</text>`;
    }
    svg += `<circle cx="100" cy="100" r="8" fill="var(--paper)" stroke="var(--line)" stroke-width="2"/>`;
    wheel.innerHTML = svg;
  }
  root.querySelector('#lwOptions').addEventListener('input', draw);
  let spinning = false;
  root.querySelector('#lwSpin').addEventListener('click', ()=>{
    if(spinning) return;
    const opts = getOptions();
    const n = opts.length;
    if(n<2){ out.textContent='Add at least 2 options.'; return; }
    spinning = true;
    const target = Math.floor(Math.random()*n);
    const segAngle = 360/n;
    const a = target*segAngle + segAngle/2 + (Math.random()-0.5)*segAngle*0.6;
    let R = ((-a)%360+360)%360;
    while(R <= rotation + 5*360) R += 360;
    rotation = R;
    wheel.style.transform = `rotate(${rotation}deg)`;
    out.textContent = 'Spinning…';
    setTimeout(()=>{ out.innerHTML = `<span class="big">${escapeHtml(opts[target])}</span>`; spinning=false; }, 4000);
  });
  draw();
});

rnd('multinumgen2','Lottery Number Picker', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Minimum</label><input type="number" id="rmMin" value="1"></div>
      <div class="field"><label>Maximum</label><input type="number" id="rmMax" value="49"></div>
    </div>
    <div class="field"><label>How many numbers</label><input type="number" id="rmCount" value="6" min="1"></div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="rmUnique" checked> No duplicates (e.g. lottery draw)</label>
    <div class="segrow"><button class="btn primary" id="rmGo">Generate</button></div>
    <div class="output" id="rmOut" style="text-align:center">Result will appear here.</div>`;
  root.querySelector('#rmGo').addEventListener('click', ()=>{
    const lo = Math.min(+root.querySelector('#rmMin').value, +root.querySelector('#rmMax').value);
    const hi = Math.max(+root.querySelector('#rmMin').value, +root.querySelector('#rmMax').value);
    const count = +root.querySelector('#rmCount').value;
    const unique = root.querySelector('#rmUnique').checked;
    const out = root.querySelector('#rmOut');
    if(unique && (hi-lo+1)<count){ out.textContent = `Range only has ${hi-lo+1} values.`; return; }
    let nums=[];
    if(unique){ const pool=[]; for(let i=lo;i<=hi;i++) pool.push(i); for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; } nums=pool.slice(0,count); }
    else { for(let i=0;i<count;i++) nums.push(Math.floor(Math.random()*(hi-lo+1))+lo); }
    nums.sort((a,b)=>a-b);
    out.innerHTML = nums.map(n=>`<span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--ink);color:#fff;font-family:var(--mono);font-weight:600;margin:4px">${n}</span>`).join('');
  });
});

rnd('flipcoin','Flip Coin', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <div id="coinFace" style="width:120px;height:120px;border-radius:50%;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;margin:10px auto;font-family:var(--mono);transition:transform .5s">?</div>
      <button class="btn primary" id="coinGo" style="margin-top:14px">Flip</button>
    </div>`;
  const face = root.querySelector('#coinFace');
  let spinId = null;
  setCleanup(()=>{ if(spinId) clearInterval(spinId); });
  root.querySelector('#coinGo').addEventListener('click', ()=>{
    if(spinId) return;
    face.style.transform = 'rotateY(0deg)';
    let n=0;
    spinId = setInterval(()=>{
      n++;
      face.textContent = n%2? 'TAILS':'HEADS';
      face.style.transform = `rotateY(${n*180}deg)`;
      if(n>=8){
        clearInterval(spinId); spinId=null;
        const result = Math.random()<0.5 ? 'HEADS':'TAILS';
        face.textContent = result;
      }
    }, 100);
  });
});

rnd('yesno','Yes/No', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <div class="counter-display" id="ynOut">?</div>
      <button class="btn primary" id="ynGo">Ask</button>
    </div>`;
  root.querySelector('#ynGo').addEventListener('click', ()=>{
    root.querySelector('#ynOut').textContent = Math.random()<0.5 ? 'Yes' : 'No';
  });
});

rnd('rps','Rock Paper Scissors', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <div class="segrow">
        <button class="btn" data-c="rock">🪨 Rock</button>
        <button class="btn" data-c="paper">📄 Paper</button>
        <button class="btn" data-c="scissors">✂️ Scissors</button>
      </div>
      <div class="output" id="rpsOut" style="margin-top:18px">Make your move.</div>
    </div>`;
  const beats = {rock:'scissors', paper:'rock', scissors:'paper'};
  const emoji = {rock:'🪨', paper:'📄', scissors:'✂️'};
  root.querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click', ()=>{
    const you = b.dataset.c;
    const opts = ['rock','paper','scissors'];
    const cpu = opts[Math.floor(Math.random()*3)];
    let result;
    if(you===cpu) result='Draw';
    else if(beats[you]===cpu) result='You win!';
    else result='Computer wins!';
    root.querySelector('#rpsOut').innerHTML = `You: ${emoji[you]} ${you}  vs  Computer: ${emoji[cpu]} ${cpu}\n\n<span class="big">${result}</span>`;
  }));
});

rnd('spinbottle','Spin Bottle', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <div style="position:relative;width:220px;height:220px;margin:10px auto;border-radius:50%;border:1px solid var(--line)">
        <div id="bottle" style="position:absolute;top:50%;left:50%;width:8px;height:90px;background:var(--ink);border-radius:6px;transform-origin:bottom center;transform:translate(-50%,-100%) rotate(0deg);transition:transform 3.5s cubic-bezier(0.15,0.8,0.15,1)"></div>
        <div style="position:absolute;top:50%;left:50%;width:10px;height:10px;background:var(--ink);border-radius:50%;transform:translate(-50%,-50%)"></div>
      </div>
      <button class="btn primary" id="bottleGo" style="margin-top:14px">Spin the bottle</button>
      <div class="hint" style="margin-top:10px" id="bottleOut">Points to a random direction.</div>
    </div>`;
  const bottle = root.querySelector('#bottle');
  let rotation = 0;
  root.querySelector('#bottleGo').addEventListener('click', ()=>{
    const target = Math.random()*360;
    let R = target;
    while(R <= rotation + 5*360) R += 360;
    rotation = R;
    bottle.style.transform = `translate(-50%,-100%) rotate(${rotation}deg)`;
    root.querySelector('#bottleOut').textContent = 'Spinning…';
    setTimeout(()=>{ root.querySelector('#bottleOut').textContent = `Landed at ${Math.round(rotation%360)}°`; }, 3500);
  });
});

rnd('rolldice','Roll Dice', root=>{
  root.innerHTML = `
    <div class="field"><label>Number of dice</label><input type="number" id="rdCount" value="2" min="1" max="12"></div>
    <div class="segrow"><button class="btn primary" id="rdGo">Roll</button></div>
    <div id="rdDice" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:18px"></div>
    <div class="output" id="rdTotal" style="text-align:center;margin-top:14px">—</div>`;
  const DOTS = {1:[[50,50]],2:[[25,25],[75,75]],3:[[25,25],[50,50],[75,75]],4:[[25,25],[25,75],[75,25],[75,75]],5:[[25,25],[25,75],[50,50],[75,25],[75,75]],6:[[25,25],[25,50],[25,75],[75,25],[75,50],[75,75]]};
  function dieSvg(n){
    const dots = DOTS[n].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="#fff"/>`).join('');
    return `<svg viewBox="0 0 100 100" style="width:56px;height:56px;background:var(--ink);border-radius:12px">${dots}</svg>`;
  }
  root.querySelector('#rdGo').addEventListener('click', ()=>{
    const count = Math.min(12, Math.max(1, +root.querySelector('#rdCount').value||1));
    const rolls = Array.from({length:count}, ()=>1+Math.floor(Math.random()*6));
    root.querySelector('#rdDice').innerHTML = rolls.map(dieSvg).join('');
    root.querySelector('#rdTotal').innerHTML = `Total: <span class="big">${rolls.reduce((a,b)=>a+b,0)}</span>`;
  });
});

/* ================================================================
   HEALTH TOOLS
   ================================================================ */
TOOLS.health = [];
let HLT_N = 0;
function health(id, name, render){ register({cat:'health', id, name, render}); }
const HEALTH_DISCLAIMER = `<div class="hint">General estimate for informational purposes only — not a substitute for professional medical advice.</div>`;

health('bmi','BMI Calculator', root=>{
  root.innerHTML = `
    ${HEALTH_DISCLAIMER}
    <div class="row">
      <div class="field"><label>Weight (kg)</label><input type="number" id="bmiW" value="70"></div>
      <div class="field"><label>Height (cm)</label><input type="number" id="bmiH" value="175"></div>
    </div>
    <div class="output" id="bmiOut">—</div>`;
  function update(){
    const w=+root.querySelector('#bmiW').value, h=+root.querySelector('#bmiH').value/100;
    const out = root.querySelector('#bmiOut');
    if(!w||!h){ out.textContent='—'; return; }
    const bmi = w/(h*h);
    let cat;
    if(bmi<18.5) cat='Underweight';
    else if(bmi<25) cat='Normal weight';
    else if(bmi<30) cat='Overweight';
    else cat='Obese';
    out.innerHTML = `<span class="big">${fmtNum(bmi,1)}</span> — ${cat}\n\nUnderweight &lt;18.5 · Normal 18.5–24.9 · Overweight 25–29.9 · Obese ≥30`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

health('water','Water intake Calculator', root=>{
  root.innerHTML = `
    ${HEALTH_DISCLAIMER}
    <div class="field"><label>Weight (kg)</label><input type="number" id="wtW" value="70"></div>
    <div class="field"><label>Activity level</label><select id="wtA">
      <option value="0">Sedentary</option>
      <option value="350">Moderately active (+30 min exercise)</option>
      <option value="700">Very active (+1 hr+ exercise)</option>
    </select></div>
    <div class="field"><label>Climate</label><select id="wtC"><option value="0">Temperate</option><option value="500">Hot / humid</option></select></div>
    <div class="output" id="wtOut">—</div>`;
  function update(){
    const w=+root.querySelector('#wtW').value;
    const activity=+root.querySelector('#wtA').value, climate=+root.querySelector('#wtC').value;
    const out = root.querySelector('#wtOut');
    if(!w){ out.textContent='—'; return; }
    const ml = w*35 + activity + climate;
    out.innerHTML = `<span class="big">${fmtNum(ml/1000,2)} L</span> per day (~${Math.round(ml/250)} glasses of 250ml)`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
});

health('idealweight','Ideal Weight Calculator', root=>{
  root.innerHTML = `
    ${HEALTH_DISCLAIMER}
    <div class="row">
      <div class="field"><label>Height (cm)</label><input type="number" id="iwH" value="175"></div>
      <div class="field"><label>Gender</label><select id="iwG"><option value="m">Male</option><option value="f">Female</option></select></div>
    </div>
    <table class="mono" id="iwOut"></table>
    <div class="hint">Several classic formulas are shown side by side since none is universally "correct" — they're rough population-level estimates, not individual targets.</div>`;
  function update(){
    const cm=+root.querySelector('#iwH').value, gender=root.querySelector('#iwG').value;
    const out = root.querySelector('#iwOut');
    if(!cm || cm<100){ out.innerHTML=''; return; }
    const inches = cm/2.54;
    const overFt = Math.max(0, inches-60); // inches over 5 feet
    let devine, robinson, miller, hamwi;
    if(gender==='m'){
      devine = 50 + 2.3*overFt;
      robinson = 52 + 1.9*overFt;
      miller = 56.2 + 1.41*overFt;
      hamwi = 48 + 2.7*overFt;
    } else {
      devine = 45.5 + 2.3*overFt;
      robinson = 49 + 1.7*overFt;
      miller = 53.1 + 1.36*overFt;
      hamwi = 45.5 + 2.2*overFt;
    }
    out.innerHTML = [
      ['Devine formula', fmtNum(devine,1)+' kg'],
      ['Robinson formula', fmtNum(robinson,1)+' kg'],
      ['Miller formula', fmtNum(miller,1)+' kg'],
      ['Hamwi formula', fmtNum(hamwi,1)+' kg'],
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
});

health('bmr','BMR Calculator', root=>{
  root.innerHTML = `
    ${HEALTH_DISCLAIMER}
    <div class="row">
      <div class="field"><label>Weight (kg)</label><input type="number" id="brW" value="70"></div>
      <div class="field"><label>Height (cm)</label><input type="number" id="brH" value="175"></div>
    </div>
    <div class="row">
      <div class="field"><label>Age</label><input type="number" id="brA" value="30"></div>
      <div class="field"><label>Gender</label><select id="brG"><option value="m">Male</option><option value="f">Female</option></select></div>
    </div>
    <div class="field"><label>Activity level (for TDEE)</label><select id="brAct">
      <option value="1.2">Sedentary (little/no exercise)</option>
      <option value="1.375">Light (1–3 days/week)</option>
      <option value="1.55" selected>Moderate (3–5 days/week)</option>
      <option value="1.725">Active (6–7 days/week)</option>
      <option value="1.9">Very active (physical job / 2x training)</option>
    </select></div>
    <table class="mono" id="brOut"></table>
    <div class="hint">Uses the Mifflin–St Jeor equation. BMR = calories burned at complete rest; TDEE includes daily activity.</div>`;
  function update(){
    const w=+root.querySelector('#brW').value, h=+root.querySelector('#brH').value, age=+root.querySelector('#brA').value;
    const gender = root.querySelector('#brG').value, act=+root.querySelector('#brAct').value;
    const out = root.querySelector('#brOut');
    if(!w||!h||!age){ out.innerHTML=''; return; }
    const bmr = gender==='m' ? 10*w+6.25*h-5*age+5 : 10*w+6.25*h-5*age-161;
    out.innerHTML = [
      ['BMR (resting)', fmtNum(bmr,0)+' kcal/day'],
      ['TDEE (with activity)', fmtNum(bmr*act,0)+' kcal/day']
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
});

health('clinicalhealth','Clinical Health Calculator', root=>{
  root.innerHTML = `
    ${HEALTH_DISCLAIMER}
    <div class="row">
      <div class="field"><label>Age (years)</label><input type="number" id="chAge" value="30" min="1" max="120"></div>
      <div class="field"><label>Gender</label><select id="chGender"><option value="M">Male</option><option value="F">Female</option></select></div>
    </div>
    <div class="row">
      <div class="field"><label>Height unit</label><select id="chHUnit"><option value="cm">cm</option><option value="m">m</option><option value="ft">ft + in</option></select></div>
      <div class="field" id="chHCmField"><label>Height (cm)</label><input type="number" id="chHCm" value="175" step="0.1"></div>
      <div class="field" id="chHMField" style="display:none"><label>Height (m)</label><input type="number" id="chHM" step="0.01"></div>
    </div>
    <div class="row" id="chHFtField" style="display:none">
      <div class="field"><label>Feet</label><input type="number" id="chHFt" min="0" max="8"></div>
      <div class="field"><label>Inches</label><input type="number" id="chHIn" min="0" max="11"></div>
    </div>
    <div class="row">
      <div class="field"><label>Weight unit</label><select id="chWUnit"><option value="kg">kg</option><option value="lbs">lbs</option></select></div>
      <div class="field" id="chWKgField"><label>Weight (kg)</label><input type="number" id="chWKg" value="70" step="0.1"></div>
      <div class="field" id="chWLbsField" style="display:none"><label>Weight (lbs)</label><input type="number" id="chWLbs" step="0.1"></div>
    </div>
    <div class="field"><label>Activity level</label><select id="chAct">
      <option value="Sedentary">Sedentary</option>
      <option value="Lightly Active">Lightly Active</option>
      <option value="Active" selected>Active</option>
      <option value="Very Active">Very Active</option>
    </select></div>
    <table class="mono" id="chOut"></table>
    <div class="hint">Protein scales 0.8–2.0 g/kg by activity level (DRI/ACSM range). Fluid uses the standard adult 30 mL/kg/day baseline; adjust for renal, cardiac, febrile, or extreme-body-weight cases per clinical judgment.</div>
    <div class="divider"></div>
    <div class="section-label" style="margin:0 0 10px">Saved entries (this session's calculations)</div>
    <div id="chSavedList"></div>
    <div class="segrow" style="margin-top:12px">
      <button class="btn primary" id="chSave">Save entry</button>
      <button class="btn" id="chExportCsv">Export CSV</button>
      <button class="btn ghost" id="chClearEntries">Clear all</button>
    </div>
    <div class="divider"></div>
    <div id="chExportJson"></div>`;

  const ACTIVITY_MULT = {'Sedentary':1.2,'Lightly Active':1.375,'Active':1.55,'Very Active':1.725};
  const PROTEIN_FACTOR = {'Sedentary':0.8,'Lightly Active':1.2,'Active':1.6,'Very Active':2.0};
  let entries = store.get('clinical-health-entries', []);

  function persist(){ store.set('clinical-health-entries', entries); }
  exportImportRow(root.querySelector('#chExportJson'), 'clinical-health-entries', 'kitbox-clinical-health.json', data=>{ entries = data||[]; drawEntries(); });

  root.querySelector('#chHUnit').addEventListener('change', e=>{
    const v = e.target.value;
    root.querySelector('#chHCmField').style.display = v==='cm' ? 'block':'none';
    root.querySelector('#chHMField').style.display = v==='m' ? 'block':'none';
    root.querySelector('#chHFtField').style.display = v==='ft' ? 'flex':'none';
    update();
  });
  root.querySelector('#chWUnit').addEventListener('change', e=>{
    const v = e.target.value;
    root.querySelector('#chWKgField').style.display = v==='kg' ? 'block':'none';
    root.querySelector('#chWLbsField').style.display = v==='lbs' ? 'block':'none';
    update();
  });

  function getHeightCm(){
    const unit = root.querySelector('#chHUnit').value;
    if(unit==='cm') return +root.querySelector('#chHCm').value||0;
    if(unit==='m') return (+root.querySelector('#chHM').value||0)*100;
    const ft = +root.querySelector('#chHFt').value||0, inch = +root.querySelector('#chHIn').value||0;
    return (ft*12+inch)*2.54;
  }
  function getWeightKg(){
    const unit = root.querySelector('#chWUnit').value;
    if(unit==='kg') return +root.querySelector('#chWKg').value||0;
    return (+root.querySelector('#chWLbs').value||0)/2.20462;
  }
  function calc(){
    const age = +root.querySelector('#chAge').value||0;
    const gender = root.querySelector('#chGender').value;
    const heightCm = getHeightCm(), weightKg = getWeightKg();
    const activity = root.querySelector('#chAct').value;
    if(!age||!heightCm||!weightKg) return null;
    const heightM = heightCm/100;
    const bmi = weightKg/(heightM*heightM);
    const bmr = gender==='M' ? 10*weightKg+6.25*heightCm-5*age+5 : 10*weightKg+6.25*heightCm-5*age-161;
    const tdee = bmr*ACTIVITY_MULT[activity];
    const protein = PROTEIN_FACTOR[activity]*weightKg;
    const fat = (0.25*tdee)/9;
    const fiber = 14*(tdee/1000);
    const fluidMl = weightKg*30;
    return {age, gender, heightCm:heightCm.toFixed(1), weightKg:weightKg.toFixed(1), activity,
      bmi:bmi.toFixed(1), bmr:Math.round(bmr), tdee:Math.round(tdee),
      protein:protein.toFixed(1), fat:fat.toFixed(1), fiber:fiber.toFixed(1), fluidMl:Math.round(fluidMl)};
  }
  function update(){
    const r = calc();
    const out = root.querySelector('#chOut');
    if(!r){ out.innerHTML = '<tr><td colspan="2">Fill in age, height, and weight.</td></tr>'; return; }
    out.innerHTML = [
      ['BMI', r.bmi], ['BMR (kcal/day)', r.bmr], ['TDEE (kcal/day)', r.tdee],
      ['Protein', r.protein+' g'], ['Fat', r.fat+' g'], ['Fiber', r.fiber+' g'],
      ['Fluid', r.fluidMl+' mL ('+(r.fluidMl/1000).toFixed(2)+' L)']
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  function drawEntries(){
    const list = root.querySelector('#chSavedList');
    list.innerHTML = entries.length ? entries.map((en,i)=>
      `<div class="hint">#${i+1} — Age ${en.age}, ${en.gender} · BMI ${en.bmi} · BMR ${en.bmr} · TDEE ${en.tdee} · Protein ${en.protein}g, Fat ${en.fat}g, Fiber ${en.fiber}g · Fluid ${en.fluidMl}mL</div>`
    ).join('') : '<div class="hint">No entries saved yet.</div>';
  }
  root.querySelector('#chSave').addEventListener('click', ()=>{
    const r = calc();
    if(!r){ alert('Please complete age, height, and weight with valid positive values before saving.'); return; }
    entries.push(r); persist(); drawEntries();
  });
  root.querySelector('#chClearEntries').addEventListener('click', ()=>{
    if(!entries.length) return;
    if(!confirm('Clear all saved entries for this tool?')) return;
    entries = []; persist(); drawEntries();
  });
  root.querySelector('#chExportCsv').addEventListener('click', ()=>{
    if(!entries.length){ alert('No saved entries to export.'); return; }
    function q(v){ return '"'+String(v).replace(/"/g,'""')+'"'; }
    const headers = ['Age','Gender','HeightCm','WeightKg','Activity','BMI','BMR','TDEE','Protein_g','Fat_g','Fiber_g','Fluid_mL'];
    const rows = entries.map(en=>[en.age,en.gender,en.heightCm,en.weightKg,en.activity,en.bmi,en.bmr,en.tdee,en.protein,en.fat,en.fiber,en.fluidMl].map(q).join(','));
    const csv = '\uFEFF'+headers.map(q).join(',')+'\n'+rows.join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='clinical-health-export.csv'; a.click();
  });
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  drawEntries(); update();
});

