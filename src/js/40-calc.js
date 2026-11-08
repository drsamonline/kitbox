/* ================================================================
   CALCULATION TOOLS
   ================================================================ */
TOOLS.calc = [];
let CALC_N = 0;
function calc(group, id, name, render){ register({cat:'calc', group, id, name, render}); }
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
function fmtNum(n, dp=4){ if(!Number.isFinite(n)) return '—'; const r = Math.round(n*Math.pow(10,dp))/Math.pow(10,dp); return r.toString(); }

/* -- Common -- */
calc('Common','simplecalc','Simple Calculator', root=>{
  root.innerHTML = `
    <div class="field"><label>Expression (+ − × ÷ and parentheses)</label><input type="text" id="scIn" placeholder="e.g. (12 + 8) * 3 / 2"></div>
    <div class="segrow"><button class="btn primary" id="scGo">Calculate</button></div>
    <div class="output" id="scOut">Result will appear here.</div>`;
  function go(){
    let expr = root.querySelector('#scIn').value.replace(/×/g,'*').replace(/÷/g,'/').replace(/,/g,'');
    const out = root.querySelector('#scOut');
    if(!/^[0-9+\-*/().\s%]*$/.test(expr) || expr.trim()===''){ out.textContent = expr.trim()===''? 'Result will appear here.' : 'Only numbers and + − × ÷ ( ) % are allowed.'; return; }
    try{
      const val = Function('"use strict"; return ('+expr.replace(/%/g,'/100')+')')();
      out.innerHTML = `<span class="big">${fmtNum(val,8)}</span>`;
    }catch(e){ out.textContent = 'Invalid expression.'; }
  }
  root.querySelector('#scGo').addEventListener('click', go);
  root.querySelector('#scIn').addEventListener('keydown', e=>{ if(e.key==='Enter') go(); });
});

/* -- Algebra -- */
calc('Algebra','percentage','Percentage', root=>{
  root.innerHTML = `
    <div class="field"><label>What % of Y is X?</label></div>
    <div class="row"><input type="number" id="pX" placeholder="X"><input type="number" id="pY" placeholder="Y"></div>
    <div class="output" id="pOut1">—</div>
    <div class="divider"></div>
    <div class="field"><label>X% of Y = ?</label></div>
    <div class="row"><input type="number" id="pPct" placeholder="X %"><input type="number" id="pY2" placeholder="Y"></div>
    <div class="output" id="pOut2">—</div>
    <div class="divider"></div>
    <div class="field"><label>% change from A to B</label></div>
    <div class="row"><input type="number" id="pA" placeholder="A"><input type="number" id="pB" placeholder="B"></div>
    <div class="output" id="pOut3">—</div>`;
  const u=(sel,fn)=>root.querySelectorAll(sel).forEach(el=>el.addEventListener('input', fn));
  u('#pX,#pY', ()=>{ const x=+root.querySelector('#pX').value, y=+root.querySelector('#pY').value; root.querySelector('#pOut1').textContent = y? fmtNum(x/y*100)+'%' : '—'; });
  u('#pPct,#pY2', ()=>{ const p=+root.querySelector('#pPct').value, y=+root.querySelector('#pY2').value; root.querySelector('#pOut2').textContent = fmtNum(p/100*y); });
  u('#pA,#pB', ()=>{ const a=+root.querySelector('#pA').value, b=+root.querySelector('#pB').value; root.querySelector('#pOut3').textContent = a? fmtNum((b-a)/Math.abs(a)*100)+'%' : '—'; });
});

calc('Algebra','average','Average', root=>{
  root.innerHTML = `
    <div class="field"><label>Numbers (comma or newline separated)</label><textarea id="avIn" placeholder="4, 8, 15, 16, 23, 42"></textarea></div>
    <table class="mono" id="avOut">
      <tr><td>Count</td><td id="a1">—</td></tr><tr><td>Sum</td><td id="a2">—</td></tr>
      <tr><td>Mean</td><td id="a3">—</td></tr><tr><td>Median</td><td id="a4">—</td></tr>
      <tr><td>Mode</td><td id="a5">—</td></tr><tr><td>Min</td><td id="a6">—</td></tr><tr><td>Max</td><td id="a7">—</td></tr>
    </table>`;
  root.querySelector('#avIn').addEventListener('input', e=>{
    const nums = e.target.value.split(/[,\n]+/).map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n));
    if(!nums.length){ ['a1','a2','a3','a4','a5','a6','a7'].forEach(id=>root.querySelector('#'+id).textContent='—'); return; }
    const sorted=[...nums].sort((a,b)=>a-b);
    const sum=nums.reduce((a,b)=>a+b,0);
    const mean=sum/nums.length;
    const mid=Math.floor(sorted.length/2);
    const median = sorted.length%2? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
    const freq={}; nums.forEach(n=>freq[n]=(freq[n]||0)+1);
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(k=>freq[k]===maxFreq);
    root.querySelector('#a1').textContent=nums.length;
    root.querySelector('#a2').textContent=fmtNum(sum);
    root.querySelector('#a3').textContent=fmtNum(mean);
    root.querySelector('#a4').textContent=fmtNum(median);
    root.querySelector('#a5').textContent= maxFreq>1 ? modes.join(', ') : 'none';
    root.querySelector('#a6').textContent=fmtNum(sorted[0]);
    root.querySelector('#a7').textContent=fmtNum(sorted[sorted.length-1]);
  });
});

calc('Algebra','proportional','Proportional', root=>{
  root.innerHTML = `
    <div class="hint">Solve A / B = C / D — leave exactly one field empty.</div>
    <div class="row"><input type="number" id="rA" placeholder="A"><input type="number" id="rB" placeholder="B"></div>
    <div class="row"><input type="number" id="rC" placeholder="C"><input type="number" id="rD" placeholder="D"></div>
    <div class="output" id="rOut">—</div>`;
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', ()=>{
    const A=root.querySelector('#rA').value, B=root.querySelector('#rB').value, C=root.querySelector('#rC').value, D=root.querySelector('#rD').value;
    const vals=[A,B,C,D]; const empties = vals.filter(v=>v==='').length;
    const out = root.querySelector('#rOut');
    if(empties!==1){ out.textContent='Leave exactly one field empty.'; return; }
    const a=+A,b=+B,c=+C,d=+D;
    if(A==='') out.textContent = 'A = '+fmtNum(b*c/d);
    else if(B==='') out.textContent = 'B = '+fmtNum(a*d/c);
    else if(C==='') out.textContent = 'C = '+fmtNum(a*d/b);
    else out.textContent = 'D = '+fmtNum(b*c/a);
  }));
});

calc('Algebra','aspectratio','Aspect Ratio', root=>{
  root.innerHTML = `
    <div class="row"><div class="field"><label>Width</label><input type="number" id="arW" value="1920"></div><div class="field"><label>Height</label><input type="number" id="arH" value="1080"></div></div>
    <div class="output" id="arOut">—</div>
    <div class="divider"></div>
    <div class="hint">Scale to a new width using this ratio:</div>
    <div class="row"><div class="field"><label>New width</label><input type="number" id="arNewW" value="1280"></div><div class="field"><label>Computed height</label><input type="text" id="arNewH" readonly></div></div>`;
  function update(){
    const w=+root.querySelector('#arW').value, h=+root.querySelector('#arH').value;
    if(w>0&&h>0){
      const g=gcd(w,h);
      root.querySelector('#arOut').innerHTML = `<span class="big">${w/g} : ${h/g}</span>`;
      const nw = +root.querySelector('#arNewW').value;
      root.querySelector('#arNewH').value = nw>0 ? fmtNum(nw*h/w,2) : '';
    }
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

calc('Algebra','fractionsimplify','Fractions Simplifier', root=>{
  root.innerHTML = `
    <div class="row"><input type="number" id="fsN" placeholder="Numerator"><input type="number" id="fsD" placeholder="Denominator"></div>
    <div class="output" id="fsOut">—</div>`;
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', ()=>{
    const n=+root.querySelector('#fsN').value, d=+root.querySelector('#fsD').value;
    const out = root.querySelector('#fsOut');
    if(!d){ out.textContent='—'; return; }
    const g=gcd(n,d);
    const sign = (d<0)? -1:1;
    out.innerHTML = `<span class="big">${(n/g*sign)} / ${(d/g*sign)}</span> = ${fmtNum(n/d,6)}`;
  }));
});

calc('Algebra','decimaltofraction','Decimal To Fraction', root=>{
  root.innerHTML = `<div class="field"><label>Decimal number</label><input type="text" id="dfIn" placeholder="e.g. 0.375"></div>
    <div class="output" id="dfOut">—</div>`;
  root.querySelector('#dfIn').addEventListener('input', e=>{
    const out = root.querySelector('#dfOut');
    const v = e.target.value.trim();
    if(v===''||isNaN(+v)){ out.textContent='—'; return; }
    const neg = parseFloat(v)<0;
    const s = Math.abs(parseFloat(v)).toString();
    const dot = s.indexOf('.');
    if(dot===-1){ out.innerHTML = `<span class="big">${(neg?'-':'')+s} / 1</span>`; return; }
    const decimals = s.length-dot-1;
    let denom = Math.pow(10, decimals);
    let numer = Math.round(parseFloat(s)*denom);
    const g = gcd(numer, denom);
    out.innerHTML = `<span class="big">${neg?'-':''}${numer/g} / ${denom/g}</span>`;
  });
});

calc('Algebra','primenumber','Prime Number', root=>{
  root.innerHTML = `<div class="field"><label>Number</label><input type="number" id="pnIn" min="1"></div>
    <div class="output" id="pnOut">—</div>`;
  function isPrime(n){ if(n<2) return false; for(let i=2;i*i<=n;i++) if(n%i===0) return false; return true; }
  function factors(n){ const f=[]; let d=2; while(n>1){ while(n%d===0){ f.push(d); n/=d; } d++; if(d*d>n && n>1){ f.push(n); break; } } return f; }
  root.querySelector('#pnIn').addEventListener('input', e=>{
    const n = parseInt(e.target.value);
    const out = root.querySelector('#pnOut');
    if(!n || n<1){ out.textContent='—'; return; }
    out.textContent = `${n} is ${isPrime(n)?'a PRIME':'NOT a prime'} number.\nPrime factors: ${factors(n).join(' × ')||'—'}`;
  });
});

calc('Algebra','exponent','Exponent', root=>{
  root.innerHTML = `
    <div class="row"><div class="field"><label>Base</label><input type="number" id="exB" value="2"></div><div class="field"><label>Exponent</label><input type="number" id="exE" value="10"></div></div>
    <div class="output" id="exOut">—</div>`;
  function update(){
    const b=+root.querySelector('#exB').value, e=+root.querySelector('#exE').value;
    root.querySelector('#exOut').innerHTML = `<span class="big">${fmtNum(Math.pow(b,e),8)}</span>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

calc('Algebra','factorial','Factorial', root=>{
  root.innerHTML = `<div class="field"><label>n</label><input type="number" id="faIn" value="10" min="0" max="5000"></div>
    <div class="output" id="faOut">—</div>`;
  root.querySelector('#faIn').addEventListener('input', e=>{
    const n = parseInt(e.target.value);
    const out = root.querySelector('#faOut');
    if(n<0 || isNaN(n)){ out.textContent = 'Enter a non-negative integer.'; return; }
    if(n>5000){ out.textContent = 'Please use a smaller number (≤5000).'; return; }
    let r = 1n; for(let i=2n;i<=BigInt(n);i++) r*=i;
    const s = r.toString();
    out.textContent = s.length>400 ? s.slice(0,400)+`… (${s.length} digits total)` : s;
  });
});

/* -- Time -- */
calc('Time','agecalc','Age Calculator', root=>{
  root.innerHTML = `<div class="field"><label>Date of birth</label><input type="date" id="ageDob"></div>
    <div class="output" id="ageOut">Pick a date of birth.</div>`;
  root.querySelector('#ageDob').addEventListener('input', e=>{
    const out = root.querySelector('#ageOut');
    if(!e.target.value){ out.textContent='Pick a date of birth.'; return; }
    const dob = new Date(e.target.value+'T00:00:00');
    const now = new Date();
    if(dob>now){ out.textContent='That date is in the future.'; return; }
    let y = now.getFullYear()-dob.getFullYear();
    let m = now.getMonth()-dob.getMonth();
    let d = now.getDate()-dob.getDate();
    if(d<0){ m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if(m<0){ y--; m+=12; }
    const totalDays = Math.floor((now-dob)/86400000);
    out.textContent = `${y} years, ${m} months, ${d} days\nTotal days lived: ${totalDays.toLocaleString()}`;
  });
});

calc('Time','timecalc','Time Calculator', root=>{
  root.innerHTML = `
    <div class="hint">Add or subtract a duration from a time.</div>
    <div class="field"><label>Start time</label><input type="time" id="tcStart" value="09:00" step="1"></div>
    <div class="row">
      <div class="field"><label>Hours</label><input type="number" id="tcH" value="1"></div>
      <div class="field"><label>Minutes</label><input type="number" id="tcM" value="30"></div>
      <div class="field"><label>Seconds</label><input type="number" id="tcS" value="0"></div>
    </div>
    <div class="segrow"><button class="btn primary" id="tcAdd">Add</button><button class="btn" id="tcSub">Subtract</button></div>
    <div class="output" id="tcOut">—</div>`;
  function calcTime(sign){
    const [h,m,s] = root.querySelector('#tcStart').value.split(':').map(Number);
    let total = (h*3600+m*60+(s||0)) + sign*((+root.querySelector('#tcH').value*3600)+(+root.querySelector('#tcM').value*60)+(+root.querySelector('#tcS').value));
    total = ((total % 86400)+86400)%86400;
    const hh=Math.floor(total/3600), mm=Math.floor((total%3600)/60), ss=total%60;
    root.querySelector('#tcOut').innerHTML = `<span class="big">${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}</span>`;
  }
  root.querySelector('#tcAdd').addEventListener('click', ()=>calcTime(1));
  root.querySelector('#tcSub').addEventListener('click', ()=>calcTime(-1));
});

calc('Time','multitimecalc','Multiple Time Calculator', root=>{
  root.innerHTML = `<div class="field"><label>Durations, one per line (HH:MM:SS or MM:SS)</label><textarea id="mtIn" placeholder="01:20:00\n00:45:30\n02:10:15"></textarea></div>
    <div class="output" id="mtOut">Total will appear here.</div>`;
  root.querySelector('#mtIn').addEventListener('input', e=>{
    const lines = e.target.value.split('\n').map(l=>l.trim()).filter(Boolean);
    let total=0; let bad=0;
    lines.forEach(l=>{
      const parts = l.split(':').map(Number);
      if(parts.some(isNaN)){ bad++; return; }
      let secs=0;
      if(parts.length===3) secs = parts[0]*3600+parts[1]*60+parts[2];
      else if(parts.length===2) secs = parts[0]*60+parts[1];
      else { bad++; return; }
      total+=secs;
    });
    const hh=Math.floor(total/3600), mm=Math.floor((total%3600)/60), ss=total%60;
    root.querySelector('#mtOut').textContent = `Total: ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}${bad?`  (${bad} line(s) ignored — unrecognized format)`:''}`;
  });
});

calc('Time','daysuntilnewyear','Days Until New Year', root=>{
  const now = new Date();
  const nextYear = new Date(now.getFullYear()+1, 0, 1);
  const days = Math.ceil((nextYear-now)/86400000);
  root.innerHTML = `<div class="counter-display">${days}</div><div class="hint" style="text-align:center">days until ${nextYear.getFullYear()}</div>`;
});

/* -- 2D Geometry -- */
function shapeCalc(id, name, fields, computeFn){
  calc('2D Geometry', id, name, root=>{
    root.innerHTML = `<div class="row">${fields.map(f=>`<div class="field"><label>${f.label}</label><input type="number" id="${f.id}" placeholder="${f.ph||''}"></div>`).join('')}</div>
      <table class="mono" id="shOut"></table>`;
    function update(){
      const vals = {}; let ok=true;
      fields.forEach(f=>{ const v=parseFloat(root.querySelector('#'+f.id).value); vals[f.id]=v; if(isNaN(v) || v<=0) ok=false; });
      const out = root.querySelector('#shOut');
      if(!ok){ out.innerHTML = root.querySelectorAll('input').length && [...root.querySelectorAll('input')].some(i=>i.value!=='') ? '<tr><td colspan="2">All dimensions must be positive numbers.</td></tr>' : ''; return; }
      const results = computeFn(vals);
      out.innerHTML = Object.entries(results).map(([k,v])=>`<tr><td>${k}</td><td>${fmtNum(v,4)}</td></tr>`).join('');
    }
    root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  });
}
shapeCalc('square','Square', [{id:'s',label:'Side'}], ({s})=>({Area:s*s, Perimeter:4*s, Diagonal:s*Math.SQRT2}));
shapeCalc('circle','Circle', [{id:'r',label:'Radius'}], ({r})=>({Area:Math.PI*r*r, Circumference:2*Math.PI*r, Diameter:2*r}));
shapeCalc('rectangle','Rectangle', [{id:'l',label:'Length'},{id:'w',label:'Width'}], ({l,w})=>({Area:l*w, Perimeter:2*(l+w), Diagonal:Math.sqrt(l*l+w*w)}));
shapeCalc('rhombus','Rhombus', [{id:'d1',label:'Diagonal 1'},{id:'d2',label:'Diagonal 2'}], ({d1,d2})=>({Area:d1*d2/2, Side:Math.sqrt((d1/2)**2+(d2/2)**2), Perimeter:4*Math.sqrt((d1/2)**2+(d2/2)**2)}));
shapeCalc('triangle','Triangle', [{id:'b',label:'Base'},{id:'h',label:'Height'}], ({b,h})=>({Area:0.5*b*h}));
shapeCalc('righttriangle','Right Triangle', [{id:'a',label:'Leg A'},{id:'b',label:'Leg B'}], ({a,b})=>{ const hyp=Math.sqrt(a*a+b*b); return {Hypotenuse:hyp, Area:0.5*a*b, Perimeter:a+b+hyp}; });
shapeCalc('trapezoid','Trapezoid', [{id:'a',label:'Side A (parallel)'},{id:'b',label:'Side B (parallel)'},{id:'h',label:'Height'}], ({a,b,h})=>({Area:(a+b)/2*h}));
shapeCalc('pentagon','Pentagon (regular)', [{id:'s',label:'Side'}], ({s})=>({Area:0.25*Math.sqrt(5*(5+2*Math.sqrt(5)))*s*s, Perimeter:5*s}));
shapeCalc('hexagon','Hexagon (regular)', [{id:'s',label:'Side'}], ({s})=>({Area:(3*Math.sqrt(3)/2)*s*s, Perimeter:6*s}));
shapeCalc('circleact','Circular Sector', [{id:'r',label:'Radius'},{id:'a',label:'Angle (degrees)'}], ({r,a})=>{ const rad=a*Math.PI/180; return {'Arc length':r*rad, Area:0.5*r*r*rad, 'Chord length':2*r*Math.sin(rad/2)}; });

/* -- 3D Geometry -- */
shapeCalc('cube','Cube', [{id:'s',label:'Side'}], ({s})=>({Volume:s**3, 'Surface area':6*s*s, Diagonal:s*Math.sqrt(3)}));
shapeCalc('sphere','Sphere', [{id:'r',label:'Radius'}], ({r})=>({Volume:(4/3)*Math.PI*r**3, 'Surface area':4*Math.PI*r*r}));
shapeCalc('pyramid','Pyramid (square base)', [{id:'s',label:'Base side'},{id:'h',label:'Height'}], ({s,h})=>{
  const slant = Math.sqrt(h*h+(s/2)**2);
  return { Volume:(1/3)*s*s*h, 'Base area':s*s, 'Surface area': s*s + 2*s*slant };
});
shapeCalc('prism','Rectangular Prism', [{id:'l',label:'Length'},{id:'w',label:'Width'},{id:'h',label:'Height'}], ({l,w,h})=>({Volume:l*w*h, 'Surface area':2*(l*w+l*h+w*h)}));
shapeCalc('cone','Cone', [{id:'r',label:'Radius'},{id:'h',label:'Height'}], ({r,h})=>{ const slant=Math.sqrt(r*r+h*h); return {Volume:(1/3)*Math.PI*r*r*h, 'Slant height':slant, 'Surface area':Math.PI*r*(slant+r)}; });
shapeCalc('ellipsoid','Ellipsoid', [{id:'a',label:'Radius A'},{id:'b',label:'Radius B'},{id:'c',label:'Radius C'}], ({a,b,c})=>{
  const p=1.6075;
  const surf = 4*Math.PI*Math.pow(((a*b)**p+(a*c)**p+(b*c)**p)/3, 1/p);
  return { Volume:(4/3)*Math.PI*a*b*c, 'Surface area (approx)':surf };
});
shapeCalc('pyramidfrustum','Pyramid Frustum', [{id:'a',label:'Top side'},{id:'b',label:'Bottom side'},{id:'h',label:'Height'}], ({a,b,h})=>{
  const A1=a*a, A2=b*b;
  return { Volume:(h/3)*(A1+A2+Math.sqrt(A1*A2)) };
});
shapeCalc('conefrustum','Cone Frustum', [{id:'r1',label:'Top radius'},{id:'r2',label:'Bottom radius'},{id:'h',label:'Height'}], ({r1,r2,h})=>{
  const slant = Math.sqrt(h*h+(r1-r2)**2);
  return { Volume:(Math.PI*h/3)*(r1*r1+r1*r2+r2*r2), 'Lateral surface': Math.PI*(r1+r2)*slant };
});
shapeCalc('cylinder','Cylinder', [{id:'r',label:'Radius'},{id:'h',label:'Height'}], ({r,h})=>({Volume:Math.PI*r*r*h, 'Surface area':2*Math.PI*r*(h+r)}));
shapeCalc('spherecap','Sphere Cap', [{id:'R',label:'Sphere radius'},{id:'h',label:'Cap height'}], ({R,h})=>({
  Volume:(Math.PI*h*h/3)*(3*R-h), 'Curved surface area': 2*Math.PI*R*h
}));
shapeCalc('spheresegment','Sphere Segment (zone)', [{id:'r1',label:'Top radius'},{id:'r2',label:'Bottom radius'},{id:'h',label:'Height'}], ({r1,r2,h})=>({
  Volume:(Math.PI*h/6)*(3*r1*r1+3*r2*r2+h*h)
}));

/* -- Advanced Math -- */
calc('Advanced Math','graphplotter','Graph Plotter', root=>{
  root.innerHTML = `
    <div class="field"><label>Function y = f(x)</label><input type="text" id="gpFn" value="sin(x)"></div>
    <div class="row">
      <div class="field"><label>X min</label><input type="number" id="gpXmin" value="-10"></div>
      <div class="field"><label>X max</label><input type="number" id="gpXmax" value="10"></div>
    </div>
    <canvas id="gpCanvas" width="600" height="320" style="max-width:100%;border:1px solid var(--line);border-radius:10px;margin-top:10px"></canvas>
    <div class="output" id="gpOut" style="display:none"></div>`;
  const canvas = root.querySelector('#gpCanvas'), ctx = canvas.getContext('2d');
  function safeFn(expr){
    const cleaned = expr.replace(/\^/g,'**');
    if(!/^[0-9a-zA-Z+\-*/().,\s]*$/.test(cleaned)) throw new Error('Invalid characters');
    const fn = Function('x','with(Math){ return '+cleaned+'; }');
    return fn;
  }
  function draw(){
    const w=canvas.width, h=canvas.height;
    ctx.clearRect(0,0,w,h);
    const xmin=+root.querySelector('#gpXmin').value, xmax=+root.querySelector('#gpXmax').value;
    const out = root.querySelector('#gpOut');
    if(xmax<=xmin){ out.style.display='block'; out.textContent='X max must be greater than X min.'; return; }
    let fn;
    try{ fn = safeFn(root.querySelector('#gpFn').value); out.style.display='none'; }
    catch(e){ out.style.display='block'; out.textContent='Invalid function.'; return; }
    const pts = [];
    let ymin=Infinity, ymax=-Infinity;
    for(let i=0;i<=400;i++){
      const x = xmin+(xmax-xmin)*i/400;
      let y; try{ y=fn(x); }catch(e){ y=NaN; }
      if(Number.isFinite(y)){ ymin=Math.min(ymin,y); ymax=Math.max(ymax,y); }
      pts.push([x,y]);
    }
    if(!Number.isFinite(ymin)){ out.style.display='block'; out.textContent='Function did not produce plottable values.'; return; }
    if(ymin===ymax){ ymin-=1; ymax+=1; }
    const padY = (ymax-ymin)*0.1; ymin-=padY; ymax+=padY;
    function toPx(x,y){ return [ (x-xmin)/(xmax-xmin)*w, h-(y-ymin)/(ymax-ymin)*h ]; }
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line') || '#ddd';
    ctx.lineWidth=1;
    if(xmin<=0 && xmax>=0){ const [x0]=toPx(0,0); ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0,h); ctx.stroke(); }
    if(ymin<=0 && ymax>=0){ const [,y0]=toPx(0,0); ctx.beginPath(); ctx.moveTo(0,y0); ctx.lineTo(w,y0); ctx.stroke(); }
    const lineColor = (getComputedStyle(document.documentElement).getPropertyValue('--accent')||'#3fcb6b').trim() || '#3fcb6b';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth=2;
    ctx.beginPath();
    let started=false;
    pts.forEach(([x,y])=>{
      if(!Number.isFinite(y)){ started=false; return; }
      const [px,py] = toPx(x,y);
      if(!started){ ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
    });
    ctx.stroke();
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

calc('Advanced Math','fibonacci','Fibonacci Generator', root=>{
  root.innerHTML = `<div class="field"><label>Number of terms</label><input type="number" id="fibN" value="15" min="1" max="1000"></div>
    <div class="output" id="fibOut">—</div>`;
  root.querySelector('#fibN').addEventListener('input', e=>{
    const n = Math.min(1000, Math.max(1, parseInt(e.target.value)||1));
    let a=0n,b=1n; const out=[];
    for(let i=0;i<n;i++){ out.push(a.toString()); [a,b]=[b,a+b]; }
    root.querySelector('#fibOut').textContent = out.join(', ');
  });
  root.querySelector('#fibN').dispatchEvent(new Event('input'));
});

calc('Advanced Math','npr_ncr','nPr & nCr', root=>{
  root.innerHTML = `
    <div class="row"><div class="field"><label>n</label><input type="number" id="ncN" value="10" min="0"></div><div class="field"><label>r</label><input type="number" id="ncR" value="3" min="0"></div></div>
    <table class="mono" id="ncOut"></table>`;
  function fact(n){ let r=1n; for(let i=2n;i<=BigInt(n);i++) r*=i; return r; }
  function update(){
    const n=+root.querySelector('#ncN').value, r=+root.querySelector('#ncR').value;
    const out = root.querySelector('#ncOut');
    if(r>n || n<0 || r<0){ out.innerHTML = '<tr><td colspan="2">r cannot exceed n (and both must be ≥0).</td></tr>'; return; }
    if(n>5000){ out.innerHTML = '<tr><td colspan="2">Please use n ≤ 5000 (larger values would freeze the page).</td></tr>'; return; }
    const nPr = fact(n)/fact(n-r);
    const nCr = nPr/fact(r);
    out.innerHTML = `<tr><td>Permutations (nPr)</td><td>${nPr.toString()}</td></tr><tr><td>Combinations (nCr)</td><td>${nCr.toString()}</td></tr>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

calc('Advanced Math','gcdlcm','GCD & LCM', root=>{
  root.innerHTML = `<div class="field"><label>Numbers (comma separated)</label><input type="text" id="glIn" value="24, 36, 60"></div>
    <div class="output" id="glOut">—</div>`;
  function lcm2(a,b){ return Math.abs(a*b)/gcd(a,b); }
  root.querySelector('#glIn').addEventListener('input', e=>{
    const nums = e.target.value.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n!==0);
    const out = root.querySelector('#glOut');
    if(nums.length<2){ out.textContent='Enter at least two non-zero numbers.'; return; }
    const g = nums.reduce((a,b)=>gcd(a,b));
    const l = nums.reduce((a,b)=>lcm2(a,b));
    out.innerHTML = `GCD: <span class="big">${g}</span>\nLCM: <span class="big">${l}</span>`;
  });
  root.querySelector('#glIn').dispatchEvent(new Event('input'));
});

calc('Advanced Math','quadratic','Quadratic Solver', root=>{
  root.innerHTML = `
    <div class="hint">ax² + bx + c = 0</div>
    <div class="row">
      <div class="field"><label>a</label><input type="number" id="qA" value="1"></div>
      <div class="field"><label>b</label><input type="number" id="qB" value="-3"></div>
      <div class="field"><label>c</label><input type="number" id="qC" value="2"></div>
    </div>
    <div class="output" id="qOut">—</div>`;
  function update(){
    const a=+root.querySelector('#qA').value, b=+root.querySelector('#qB').value, c=+root.querySelector('#qC').value;
    const out = root.querySelector('#qOut');
    if(a===0){ out.textContent = b!==0 ? `Linear equation: x = ${fmtNum(-c/b,6)}` : 'Not a valid equation.'; return; }
    const disc = b*b-4*a*c;
    if(disc>0){
      const x1=(-b+Math.sqrt(disc))/(2*a), x2=(-b-Math.sqrt(disc))/(2*a);
      out.textContent = `Two real roots:\nx₁ = ${fmtNum(x1,6)}\nx₂ = ${fmtNum(x2,6)}`;
    } else if(disc===0){
      out.textContent = `One real root:\nx = ${fmtNum(-b/(2*a),6)}`;
    } else {
      const re=-b/(2*a), im=Math.sqrt(-disc)/(2*a);
      out.textContent = `Two complex roots:\nx₁ = ${fmtNum(re,6)} + ${fmtNum(im,6)}i\nx₂ = ${fmtNum(re,6)} − ${fmtNum(im,6)}i`;
    }
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

calc('Advanced Math','logarithm','Logarithm', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>x</label><input type="number" id="lgX" value="100" min="0.0000001"></div>
      <div class="field"><label>Base</label><input type="number" id="lgBase" value="10" min="0.0000001"></div>
    </div>
    <table class="mono" id="lgOut"></table>`;
  function update(){
    const x=+root.querySelector('#lgX').value, base=+root.querySelector('#lgBase').value;
    const out = root.querySelector('#lgOut');
    if(x<=0){ out.innerHTML='<tr><td colspan="2">x must be greater than 0.</td></tr>'; return; }
    out.innerHTML = [
      [`log base ${base}`, base>0&&base!==1? fmtNum(Math.log(x)/Math.log(base),6) : 'Base must be >0 and ≠1'],
      ['ln (natural log)', fmtNum(Math.log(x),6)],
      ['log₁₀', fmtNum(Math.log10(x),6)],
      ['log₂', fmtNum(Math.log2(x),6)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

