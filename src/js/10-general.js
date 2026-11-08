/* ================================================================
   GENERAL TOOLS
   ================================================================ */
TOOLS.general = [];

/* 1. Ruler */
TOOLS.general.push({id:'ruler', code:'GEN-01', name:'Ruler', render(root){
  const saved = store.get('ruler-scale', 37.8); // px per cm baseline guess
  root.innerHTML = `
    <div class="field">
      <label>Calibrate — adjust until the bar below matches a real 8.56 cm card (e.g. a bank card) held to your screen</label>
      <input type="range" id="cal" min="20" max="60" step="0.1" value="${saved}">
      <div class="hint">Current scale: <span id="calVal">${saved}</span> px/cm</div>
    </div>
    <div class="ruler-wrap"><div class="ruler" id="rulerBox"></div></div>
    <div class="row" style="margin-top:14px">
      <button class="btn" id="unitCm">Show cm</button>
      <button class="btn" id="unitIn">Show inches</button>
    </div>
  `;
  let unit = 'cm';
  const box = root.querySelector('#rulerBox');
  const cal = root.querySelector('#cal');
  const calVal = root.querySelector('#calVal');
  function draw(){
    const pxPerCm = parseFloat(cal.value);
    box.innerHTML='';
    const totalCm = 22;
    const width = unit==='cm' ? pxPerCm*totalCm : pxPerCm*2.54*Math.floor(totalCm/2.54);
    box.style.width = width+'px';
    if(unit==='cm'){
      for(let mm=0; mm<=totalCm*10; mm+=1){
        const cm = mm/10;
        const x = cm*pxPerCm;
        const isCm = mm%10===0, isHalf = mm%5===0;
        const t=document.createElement('div');
        t.className='tick';
        t.style.left=x+'px';
        t.style.height = isCm? '28px' : (isHalf? '18px':'10px');
        box.appendChild(t);
        if(isCm){ const l=document.createElement('div'); l.className='lbl'; l.style.left=x+'px'; l.textContent=cm; box.appendChild(l); }
      }
    } else {
      const pxPerIn = pxPerCm*2.54;
      const totalIn = Math.floor(totalCm/2.54);
      for(let i8=0;i8<=totalIn*8;i8++){
        const inch = i8/8;
        const x = inch*pxPerIn;
        const isIn = i8%8===0, isHalf=i8%4===0, isQuarter=i8%2===0;
        const t=document.createElement('div');
        t.className='tick'; t.style.left=x+'px';
        t.style.height = isIn?'28px':(isHalf?'20px':(isQuarter?'14px':'8px'));
        box.appendChild(t);
        if(isIn){ const l=document.createElement('div'); l.className='lbl'; l.style.left=x+'px'; l.textContent=inch; box.appendChild(l);}
      }
    }
  }
  cal.addEventListener('input', ()=>{ calVal.textContent=cal.value; store.set('ruler-scale', parseFloat(cal.value)); draw(); });
  root.querySelector('#unitCm').addEventListener('click', ()=>{unit='cm'; draw();});
  root.querySelector('#unitIn').addEventListener('click', ()=>{unit='in'; draw();});
  draw();
}});

/* 2. Simple Counter */
TOOLS.general.push({id:'counter', code:'GEN-02', name:'Simple Counter', render(root){
  let n = store.get('simple-counter', 0);
  root.innerHTML = `
    <div class="counter-display" id="cVal">${n}</div>
    <div class="segrow">
      <button class="btn" id="cMinus">− 1</button>
      <button class="btn primary" id="cPlus">+ 1</button>
      <button class="btn ghost" id="cReset">Reset</button>
    </div>
    <div class="field" style="margin-top:20px">
      <label>Step size</label>
      <input type="number" id="cStep" value="1" min="1">
    </div>
  `;
  const val = root.querySelector('#cVal');
  const step = root.querySelector('#cStep');
  function update(){ val.textContent=n; store.set('simple-counter', n); }
  root.querySelector('#cPlus').addEventListener('click', ()=>{ n+= (parseInt(step.value)||1); update(); });
  root.querySelector('#cMinus').addEventListener('click', ()=>{ n-= (parseInt(step.value)||1); update(); });
  root.querySelector('#cReset').addEventListener('click', ()=>{ n=0; update(); });
}});

/* 3. Scoreboard */
TOOLS.general.push({id:'scoreboard', code:'GEN-03', name:'Scoreboard', render(root){
  let teams = store.get('scoreboard', [{name:'Team A', score:0},{name:'Team B', score:0}]);
  root.innerHTML = `<div class="team-grid" id="teamGrid"></div>
    <div class="row" style="margin-top:14px">
      <button class="btn" id="addTeam">+ Add team</button>
      <button class="btn ghost" id="resetAll">Reset scores</button>
    </div>
    <div class="divider"></div>
    <div id="sbExport"></div>`;
  exportImportRow(root.querySelector('#sbExport'), 'scoreboard', 'kitbox-scoreboard.json', data=>{ teams = data||teams; draw(); });
  const grid = root.querySelector('#teamGrid');
  function persist(){ store.set('scoreboard', teams); }
  function draw(){
    grid.innerHTML='';
    teams.forEach((t,i)=>{
      const el = document.createElement('div');
      el.className='score-card';
      el.innerHTML = `
        <input type="text" value="${escapeHtml(t.name)}" data-i="${i}" class="teamName">
        <div class="num">${t.score}</div>
        <div class="segrow">
          <button class="btn" data-act="minus" data-i="${i}">−</button>
          <button class="btn primary" data-act="plus" data-i="${i}">+</button>
        </div>`;
      grid.appendChild(el);
    });
    grid.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click', e=>{
      const i=+b.dataset.i; teams[i].score += (b.dataset.act==='plus'?1:-1); persist(); draw();
    }));
    grid.querySelectorAll('.teamName').forEach(inp=>inp.addEventListener('input', e=>{
      teams[+inp.dataset.i].name = inp.value; persist();
    }));
  }
  root.querySelector('#addTeam').addEventListener('click', ()=>{ teams.push({name:'Team '+(teams.length+1), score:0}); persist(); draw(); });
  root.querySelector('#resetAll').addEventListener('click', ()=>{ teams.forEach(t=>t.score=0); persist(); draw(); });
  draw();
}});

/* 4. Countdown */
TOOLS.general.push({id:'countdown', code:'GEN-04', name:'Countdown', render(root){
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Minutes</label><input type="number" id="cdMin" value="5" min="0"></div>
      <div class="field"><label>Seconds</label><input type="number" id="cdSec" value="0" min="0" max="59"></div>
    </div>
    <div class="counter-display" id="cdDisplay">05:00</div>
    <div class="segrow">
      <button class="btn primary" id="cdStart">Start</button>
      <button class="btn" id="cdPause">Pause</button>
      <button class="btn ghost" id="cdReset">Reset</button>
    </div>
    <div class="output" id="cdMsg" style="display:none;text-align:center">⏰ Time's up!</div>
  `;
  let total=300, remaining=300, timer=null;
  setCleanup(()=>{ if(timer) clearInterval(timer); });
  const disp = root.querySelector('#cdDisplay');
  const msg = root.querySelector('#cdMsg');
  function fmt(s){ const m=Math.floor(s/60), sec=s%60; return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); }
  function render(){ disp.textContent = fmt(Math.max(remaining,0)); }
  root.querySelector('#cdStart').addEventListener('click', ()=>{
    if(timer) return;
    if(remaining<=0){
      total = (parseInt(root.querySelector('#cdMin').value)||0)*60 + (parseInt(root.querySelector('#cdSec').value)||0);
      remaining = total;
    }
    msg.style.display='none';
    timer = setInterval(()=>{
      remaining--;
      if(remaining<=0){ clearInterval(timer); timer=null; remaining=0; msg.style.display='block'; }
      render();
    },1000);
  });
  root.querySelector('#cdPause').addEventListener('click', ()=>{ clearInterval(timer); timer=null; });
  root.querySelector('#cdReset').addEventListener('click', ()=>{
    clearInterval(timer); timer=null;
    total = (parseInt(root.querySelector('#cdMin').value)||0)*60 + (parseInt(root.querySelector('#cdSec').value)||0);
    remaining = total; msg.style.display='none'; render();
  });
  render();
}});

/* 5. Stopwatch */
TOOLS.general.push({id:'stopwatch', code:'GEN-05', name:'Stopwatch', render(root){
  root.innerHTML = `
    <div class="counter-display" id="swDisplay">00:00.0</div>
    <div class="segrow">
      <button class="btn primary" id="swStart">Start</button>
      <button class="btn" id="swLap">Lap</button>
      <button class="btn ghost" id="swReset">Reset</button>
    </div>
    <table class="mono" id="swLaps" style="margin-top:16px"></table>
  `;
  let running=false, startTs=0, elapsed=0, timer=null, laps=[];
  setCleanup(()=>{ if(timer) clearInterval(timer); });
  const disp = root.querySelector('#swDisplay');
  const btn = root.querySelector('#swStart');
  const lapsEl = root.querySelector('#swLaps');
  function fmt(ms){
    const m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000), d=Math.floor((ms%1000)/100);
    return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+d;
  }
  function tick(){ disp.textContent = fmt(elapsed + (Date.now()-startTs)); }
  btn.addEventListener('click', ()=>{
    if(!running){ running=true; startTs=Date.now(); timer=setInterval(tick,80); btn.textContent='Stop'; }
    else{ running=false; elapsed += Date.now()-startTs; clearInterval(timer); btn.textContent='Start'; }
  });
  root.querySelector('#swLap').addEventListener('click', ()=>{
    const cur = elapsed + (running?(Date.now()-startTs):0);
    laps.unshift(cur);
    lapsEl.innerHTML = laps.map((l,i)=>`<tr><td>Lap ${laps.length-i}</td><td>${fmt(l)}</td></tr>`).join('');
  });
  root.querySelector('#swReset').addEventListener('click', ()=>{
    running=false; clearInterval(timer); elapsed=0; laps=[]; btn.textContent='Start'; lapsEl.innerHTML=''; disp.textContent='00:00.0';
  });
}});

/* 6. Morse Code */
const MORSE = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..',"'":'.----.','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.'};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));
TOOLS.general.push({id:'morse', code:'GEN-06', name:'Morse Code', render(root){
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="mText" placeholder="Type text here..."></textarea></div>
    <div class="segrow"><button class="btn primary" id="mToMorse">Text → Morse</button><button class="btn" id="mToText">Morse → Text</button></div>
    <div class="output" id="mOut">Output will appear here.</div>
  `;
  const inp = root.querySelector('#mText'), out = root.querySelector('#mOut');
  root.querySelector('#mToMorse').addEventListener('click', ()=>{
    out.textContent = inp.value.toUpperCase().split(' ').map(word=>
      word.split('').map(ch=>MORSE[ch]||'').filter(Boolean).join(' ')
    ).join('  /  ') || '—';
  });
  root.querySelector('#mToText').addEventListener('click', ()=>{
    out.textContent = inp.value.split('/').map(word=>
      word.trim().split(/\s+/).map(code=>MORSE_REV[code]||'').join('')
    ).join(' ') || '—';
  });
}});

/* 7. Roman Numerals */
function toRoman(num){
  if(!num || num<=0 || num>3999) return '—';
  const vals=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let res='', n=num;
  for(const [v,s] of vals){ while(n>=v){res+=s; n-=v;} }
  return res;
}
function fromRoman(str){
  const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  str=str.toUpperCase().trim();
  if(!/^[IVXLCDM]+$/.test(str)) return null;
  let total=0;
  for(let i=0;i<str.length;i++){
    const cur=map[str[i]], next=map[str[i+1]];
    if(next>cur) total-=cur; else total+=cur;
  }
  return total;
}
TOOLS.general.push({id:'roman', code:'GEN-07', name:'Roman Numerals', render(root){
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Number (1–3999)</label><input type="number" id="rNum" min="1" max="3999" placeholder="e.g. 1994"></div>
      <div class="field"><label>Roman numeral</label><input type="text" id="rRom" placeholder="e.g. MCMXCIV"></div>
    </div>
    <div class="output" id="rOut">Enter a value on either side.</div>
  `;
  const num = root.querySelector('#rNum'), rom = root.querySelector('#rRom'), out = root.querySelector('#rOut');
  num.addEventListener('input', ()=>{ rom.value=''; out.innerHTML = `<span class="big">${toRoman(parseInt(num.value))}</span>`; });
  rom.addEventListener('input', ()=>{ num.value=''; const v=fromRoman(rom.value); out.innerHTML = v===null? 'Not a valid Roman numeral.' : `<span class="big">${v}</span>`; });
}});

/* 8. Number To Word */
const ONES=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function threeDigits(n){
  let s='';
  if(n>=100){ s+=ONES[Math.floor(n/100)]+' hundred '; n%=100; }
  if(n>=20){ s+=TENS[Math.floor(n/10)]+' '; n%=10; }
  if(n>0) s+=ONES[n]+' ';
  return s;
}
function numberToWords(num){
  if(num===0) return 'zero';
  if(num<0) return 'negative '+numberToWords(-num);
  const scales=['','thousand','million','billion','trillion'];
  let groups=[]; let n=Math.floor(num);
  if(n===0) groups=[0];
  while(n>0){ groups.push(n%1000); n=Math.floor(n/1000); }
  let words='';
  for(let i=groups.length-1;i>=0;i--){
    if(groups[i]>0){ words += threeDigits(groups[i]) + scales[i] + ' '; }
  }
  return words.trim().replace(/\s+/g,' ');
}
TOOLS.general.push({id:'num2word', code:'GEN-08', name:'Number To Word', render(root){
  root.innerHTML = `
    <div class="field"><label>Number</label><input type="number" id="nwIn" placeholder="e.g. 20260726"></div>
    <div class="output" id="nwOut">—</div>
  `;
  const inp = root.querySelector('#nwIn'), out = root.querySelector('#nwOut');
  inp.addEventListener('input', ()=>{
    if(inp.value===''){ out.textContent='—'; return; }
    const v = Number(inp.value);
    out.textContent = Number.isFinite(v) ? numberToWords(v) : 'Enter a valid number.';
  });
}});

/* 9. Compass */
TOOLS.general.push({id:'compass', code:'GEN-09', name:'Compass', render(root){
  root.innerHTML = `
    <div style="text-align:center">
      <div style="width:180px;height:180px;border-radius:50%;border:2px solid var(--line);margin:10px auto;position:relative;display:flex;align-items:center;justify-content:center;">
        <div id="needle" style="width:4px;height:75px;background:var(--accent);border-radius:4px;transform-origin:bottom center;position:absolute;bottom:50%;transition:transform .15s linear;"></div>
        <div style="position:absolute;top:6px;font-family:var(--mono);font-size:11px;color:var(--muted);">N</div>
      </div>
      <div class="output" id="compassOut" style="display:inline-block">Tap "Enable" to start.</div>
      <div><button class="btn primary" id="compassBtn" style="margin-top:12px">Enable compass</button></div>
      <div class="hint">Uses your device's orientation sensor. Requires HTTPS and a mobile browser with motion sensors; on iOS you'll be asked for permission.</div>
    </div>
  `;
  const needle = root.querySelector('#needle');
  const out = root.querySelector('#compassOut');
  function handler(e){
    let heading = e.webkitCompassHeading!==undefined ? e.webkitCompassHeading : (e.alpha!==null? 360-e.alpha : null);
    if(heading===null){ out.textContent='No heading data from this device.'; return; }
    needle.style.transform = `rotate(${heading}deg)`;
    const dirs=['N','NE','E','SE','S','SW','W','NW'];
    const dir = dirs[Math.round(heading/45)%8];
    out.textContent = `${heading.toFixed(0)}° ${dir}`;
  }
  setCleanup(()=>{ window.removeEventListener('deviceorientationabsolute', handler, true); window.removeEventListener('deviceorientation', handler, true); });
  root.querySelector('#compassBtn').addEventListener('click', async ()=>{
    if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
      try{ const p = await DeviceOrientationEvent.requestPermission(); if(p!=='granted'){ out.textContent='Permission denied.'; return; } }catch(e){ out.textContent='Permission request failed.'; return; }
    }
    if(window.DeviceOrientationEvent){ window.addEventListener('deviceorientationabsolute', handler, true); window.addEventListener('deviceorientation', handler, true); out.textContent='Listening…'; }
    else { out.textContent='Device orientation not supported on this device/browser.'; }
  });
}});

/* 10. String To Byte */
TOOLS.general.push({id:'str2byte', code:'GEN-10', name:'String To Byte', render(root){
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="sbText" placeholder="Type text..."></textarea></div>
    <div class="segrow"><button class="btn primary" id="sbEncode">Text → Bytes</button><button class="btn" id="sbDecode">Bytes → Text</button></div>
    <div class="output" id="sbOut">—</div>
  `;
  const inp = root.querySelector('#sbText'), out = root.querySelector('#sbOut');
  root.querySelector('#sbEncode').addEventListener('click', ()=>{
    const bytes = new TextEncoder().encode(inp.value);
    out.textContent = `Byte length: ${bytes.length}\nHex: ${[...bytes].map(b=>b.toString(16).padStart(2,'0')).join(' ')}\nDecimal: ${[...bytes].join(', ')}`;
  });
  root.querySelector('#sbDecode').addEventListener('click', ()=>{
    try{
      const clean = inp.value.trim().split(/[\s,]+/).map(x=>{
        if(/^(0x)?[0-9a-fA-F]{2}$/.test(x) && !/^\d+$/.test(x)) return parseInt(x.replace('0x',''),16);
        return parseInt(x,10);
      });
      const bytes = new Uint8Array(clean.filter(n=>!isNaN(n)));
      out.textContent = new TextDecoder().decode(bytes) || 'Enter byte values (decimal or hex) separated by spaces.';
    }catch(e){ out.textContent='Could not decode — check the byte values.'; }
  });
}});

/* 11. Timezone Converter */
function getTzOffsetMs(timeZone, date){
  const dtf = new Intl.DateTimeFormat('en-US', {timeZone, hour12:false, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const parts = dtf.formatToParts(date).reduce((acc,p)=>{ if(p.type!=='literal') acc[p.type]=p.value; return acc; },{});
  const hour = parts.hour==='24' ? '00' : parts.hour;
  const asUTC = Date.UTC(+parts.year, +parts.month-1, +parts.day, +hour, +parts.minute, +parts.second);
  return asUTC - date.getTime();
}
function convertBetweenZones(dateTimeLocalStr, fromTz, toTz){
  const guess = new Date(dateTimeLocalStr+':00Z');
  const offsetFrom = getTzOffsetMs(fromTz, guess);
  const actualInstant = new Date(guess.getTime() - offsetFrom);
  return new Intl.DateTimeFormat('en-US', {timeZone:toTz, dateStyle:'medium', timeStyle:'long'}).format(actualInstant);
}
let TZ_LIST=null;
function getTzList(){
  if(TZ_LIST) return TZ_LIST;
  try{ TZ_LIST = Intl.supportedValuesOf('timeZone'); }catch(e){
    TZ_LIST = ['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Sao_Paulo','Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow','Africa/Cairo','Asia/Dubai','Asia/Kolkata','Asia/Kathmandu','Asia/Dhaka','Asia/Bangkok','Asia/Shanghai','Asia/Tokyo','Asia/Seoul','Australia/Sydney','Pacific/Auckland'];
  }
  return TZ_LIST;
}
TOOLS.general.push({id:'tzconv', code:'GEN-11', name:'Timezone Converter', render(root){
  const zones = getTzList();
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // 400+ <option> elements cost 80 ms to build — a fifth of the whole app's
  // render time, for a list nobody scrolls. A filter plus the first 80 matches
  // is faster to open and faster to use.
  function optionsFor(query, selected){
    const q = (query || '').toLowerCase();
    const hits = q ? zones.filter(z=>z.toLowerCase().includes(q)) : zones;
    const list = hits.slice(0, 80);
    // Whatever is currently chosen stays in the list, even if the cap or the
    // filter would have dropped it — otherwise the select silently empties and
    // the converter loses its timezone.
    if(selected && !list.includes(selected)) list.unshift(selected);
    if(!list.length && selected) list.push(selected);
    return list.map(z=>`<option value="${z}"${z === selected ? ' selected' : ''}>${z}</option>`).join('');
  }
  root.innerHTML = `
    <div class="field"><label>Date & time</label><input type="datetime-local" id="tzDate"></div>
    <div class="row">
      <div class="field"><label>Filter zones</label><input type="text" id="tzFilter" placeholder="asia, europe/london…" autocomplete="off"></div>
    </div>
    <div class="row">
      <div class="field"><label>From timezone</label><select id="tzFrom">${optionsFor('', localTz)}</select></div>
      <div class="field"><label>To timezone</label><select id="tzTo">${optionsFor('', 'Asia/Tokyo')}</select></div>
    </div>
    <div class="output" id="tzOut">Pick a date/time and two timezones.</div>
  `;
  root.querySelector('#tzFilter').addEventListener('input', e=>{
    const q = e.target.value;
    const keepFrom = root.querySelector('#tzFrom').value, keepTo = root.querySelector('#tzTo').value;
    root.querySelector('#tzFrom').innerHTML = optionsFor(q, keepFrom);
    root.querySelector('#tzTo').innerHTML = optionsFor(q, keepTo);
    root.querySelector('#tzFrom').dispatchEvent(new Event('input', { bubbles: true }));
  });
  const dateEl = root.querySelector('#tzDate');
  const from = root.querySelector('#tzFrom'), to = root.querySelector('#tzTo');
  const now = new Date(); now.setMinutes(now.getMinutes()-now.getTimezoneOffset());
  dateEl.value = now.toISOString().slice(0,16);
  to.value = zones.includes('Asia/Tokyo') ? 'Asia/Tokyo' : zones[0];
  function update(){
    if(!dateEl.value) return;
    root.querySelector('#tzOut').textContent = convertBetweenZones(dateEl.value, from.value, to.value);
  }
  [dateEl,from,to].forEach(el=>el.addEventListener('input', update));
  update();
}});

/* 12. Level Tool */
TOOLS.general.push({id:'level', code:'GEN-12', name:'Level Tool', render(root){
  root.innerHTML = `
    <div style="text-align:center">
      <div style="width:200px;height:200px;border-radius:50%;border:2px solid var(--line);margin:10px auto;position:relative;overflow:hidden;">
        <div style="position:absolute;top:50%;left:50%;width:1px;height:100%;background:var(--line);transform:translateX(-50%);"></div>
        <div style="position:absolute;left:50%;top:50%;width:100%;height:1px;background:var(--line);transform:translateY(-50%);"></div>
        <div id="bubble" style="width:34px;height:34px;border-radius:50%;background:var(--accent);position:absolute;left:calc(50% - 17px);top:calc(50% - 17px);transition:transform .1s linear;"></div>
      </div>
      <div class="output" id="levelOut" style="display:inline-block">Tap "Enable" to start.</div>
      <div><button class="btn primary" id="levelBtn" style="margin-top:12px">Enable level</button></div>
      <div class="hint">Lay your device flat — the dot centers when level. Requires a device with a motion sensor.</div>
    </div>
  `;
  const bubble = root.querySelector('#bubble');
  const out = root.querySelector('#levelOut');
  function handler(e){
    const beta = Math.max(-45, Math.min(45, e.beta||0));
    const gamma = Math.max(-45, Math.min(45, e.gamma||0));
    bubble.style.transform = `translate(${gamma*1.6}px, ${beta*1.6}px)`;
    out.textContent = `X: ${gamma.toFixed(1)}°  Y: ${beta.toFixed(1)}°`;
  }
  setCleanup(()=>{ window.removeEventListener('deviceorientation', handler, true); });
  root.querySelector('#levelBtn').addEventListener('click', async ()=>{
    if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
      try{ const p = await DeviceOrientationEvent.requestPermission(); if(p!=='granted'){ out.textContent='Permission denied.'; return; } }catch(e){ out.textContent='Permission request failed.'; return; }
    }
    if(window.DeviceOrientationEvent){ window.addEventListener('deviceorientation', handler, true); out.textContent='Listening…'; }
    else { out.textContent='Device orientation not supported on this device/browser.'; }
  });
}});

TOOLS.general.push({id:'worldclock', code:'GEN-13', name:'World Clock', render(root){
  let cities = store.get('worldclock-cities', ['America/New_York','Europe/London','Asia/Kolkata','Asia/Tokyo']);
  const zones = getTzList();
  root.innerHTML = `
    <div class="row">
      <input type="text" id="wcFilter" placeholder="Filter zones…" autocomplete="off" style="flex:1">
      <select id="wcAdd" style="flex:1"><option value="">Add a city timezone…</option>${zones.slice(0, 80).map(z=>`<option value="${z}">${z}</option>`).join('')}</select>
    </div>
    <div id="wcList" style="margin-top:14px"></div>`;
  function persist(){ store.set('worldclock-cities', cities); }
  function draw(){
    const now = new Date();
    root.querySelector('#wcList').innerHTML = cities.map((tz,i)=>{
      const time = new Intl.DateTimeFormat('en-US',{timeZone:tz, hour:'2-digit', minute:'2-digit', hour12:true}).format(now);
      const date = new Intl.DateTimeFormat('en-US',{timeZone:tz, weekday:'short', month:'short', day:'numeric'}).format(now);
      const there = new Intl.DateTimeFormat('en-CA',{timeZone:tz, year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
      const here = localDateStr(now);
      const dayLabel = there === here ? '' : (there > here ? ' · tomorrow' : ' · yesterday');
      return `<div class="score-card" style="text-align:left;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
        <div><b>${tz.split('/').pop().replace(/_/g,' ')}</b><div class="hint" style="margin:2px 0 0">${date}${dayLabel}</div></div>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-family:var(--mono);font-size:20px;font-weight:600">${time}</span>
          <button class="btn ghost" data-rm="${i}" style="padding:4px 8px" aria-label="Remove">✕</button>
        </div>
      </div>`;
    }).join('') || '<div class="hint">Add a city above to see its current time.</div>';
    root.querySelectorAll('[data-rm]').forEach(b=>b.addEventListener('click', ()=>{ cities.splice(+b.dataset.rm,1); persist(); draw(); }));
  }
  root.querySelector('#wcFilter').addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    const hits = q ? zones.filter(z=>z.toLowerCase().includes(q)) : zones;
    root.querySelector('#wcAdd').innerHTML = '<option value="">Add a city timezone…</option>'
      + hits.slice(0, 80).map(z=>`<option value="${z}">${z}</option>`).join('');
  });
  root.querySelector('#wcAdd').addEventListener('change', e=>{
    if(e.target.value && !cities.includes(e.target.value)){ cities.push(e.target.value); persist(); draw(); }
    e.target.value='';
  });
  draw();
  const wcTimer = setInterval(draw, 30000);
  setCleanup(()=>clearInterval(wcTimer));
}});

