/* ================================================================
   B18 — key derivation, ASN.1, and three physics calculators.
   ================================================================ */

/* ---------------- Development (3) ---------------- */

dev('pbkdf2','PBKDF2 Derive', root=>{
  root.innerHTML = `
    <div class="field"><label>Passphrase</label><input type="text" id="pbPass" value="correct horse battery staple"></div>
    <div class="row">
      <div class="field"><label>Salt (text or hex 0x…)</label><input type="text" id="pbSalt" value="kitbox-salt"></div>
      <div class="field"><label>Iterations</label><input type="number" id="pbIter" value="250000" step="1000"></div>
    </div>
    <div class="row">
      <div class="field"><label>Hash</label><select id="pbHash"><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option><option>SHA-1</option></select></div>
      <div class="field"><label>Output bytes</label><input type="number" id="pbLen" value="32" min="1" max="64"></div>
    </div>
    <div class="segrow"><button class="btn primary" id="pbGo">Derive</button></div>
    <div class="output" id="pbOut" style="word-break:break-all">—</div>
    <div class="hint">The KDF behind most password storage and many file formats. 250,000 iterations is the current floor for a password; a random key needs none of this. The salt is shown as bytes so you can paste the same one back.</div>`;
  root.querySelector('#pbGo').addEventListener('click', async ()=>{
    const out = root.querySelector('#pbOut');
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    const saltRaw = root.querySelector('#pbSalt').value;
    const salt = /^0x[0-9a-fA-F]+$/.test(saltRaw)
      ? Uint8Array.from(saltRaw.slice(2).match(/.{2}/g).map(h=>parseInt(h, 16)))
      : bytesFromText(saltRaw);
    const iter = Math.max(1, Number(root.querySelector('#pbIter').value) || 100000);
    const len = Math.min(64, Math.max(1, Number(root.querySelector('#pbLen').value) || 32));
    out.textContent = 'Deriving…';
    try{
      const base = await crypto.subtle.importKey('raw', bytesFromText(root.querySelector('#pbPass').value), 'PBKDF2', false, ['deriveBits']);
      const bits = new Uint8Array(await crypto.subtle.deriveBits(
        { name:'PBKDF2', salt, iterations: iter, hash: root.querySelector('#pbHash').value },
        base, len * 8));
      out.innerHTML = `<table class="mono">
        <tr><td>Salt (hex)</td><td>0x${Array.from(salt).map(b=>b.toString(16).padStart(2,'0')).join('')}</td></tr>
        <tr><td>Key (hex)</td><td>${Array.from(bits).map(b=>b.toString(16).padStart(2,'0')).join('')}</td></tr>
        <tr><td>Key (base64)</td><td>${btoa(String.fromCharCode(...bits))}</td></tr>
        <tr><td>Work</td><td>${iter.toLocaleString(numLocale())} iterations of ${root.querySelector('#pbHash').value}</td></tr>
      </table>`;
    }catch(e){ out.textContent = 'Could not derive: ' + (e.message || e); }
  });
});

dev('hkdf','HKDF Derive', root=>{
  root.innerHTML = `
    <div class="field"><label>Input key material</label><input type="text" id="hkIkm" value="a shared secret"></div>
    <div class="row">
      <div class="field"><label>Salt (optional)</label><input type="text" id="hkSalt" value=""></div>
      <div class="field"><label>Info (optional)</label><input type="text" id="hkInfo" value="context"></div>
    </div>
    <div class="row">
      <div class="field"><label>Hash</label><select id="hkHash"><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></div>
      <div class="field"><label>Output bytes</label><input type="number" id="hkLen" value="32" min="1" max="64"></div>
    </div>
    <div class="segrow"><button class="btn primary" id="hkGo">Derive</button></div>
    <div class="output" id="hkOut" style="word-break:break-all">—</div>
    <div class="hint">HKDF is for turning a key that already has entropy into one or more keys for a purpose — the <span class="mono">info</span> field is what separates two keys from the same secret. It is not a password hash; use PBKDF2 or Argon2 for that.</div>`;
  root.querySelector('#hkGo').addEventListener('click', async ()=>{
    const out = root.querySelector('#hkOut');
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    const len = Math.min(64, Math.max(1, Number(root.querySelector('#hkLen').value) || 32));
    out.textContent = 'Deriving…';
    try{
      const key = await crypto.subtle.importKey('raw', bytesFromText(root.querySelector('#hkIkm').value), 'HKDF', false, ['deriveBits']);
      const bits = new Uint8Array(await crypto.subtle.deriveBits({
        name:'HKDF',
        hash: root.querySelector('#hkHash').value,
        salt: bytesFromText(root.querySelector('#hkSalt').value),
        info: bytesFromText(root.querySelector('#hkInfo').value)
      }, key, len * 8));
      out.innerHTML = `<table class="mono">
        <tr><td>Key (hex)</td><td>${Array.from(bits).map(b=>b.toString(16).padStart(2,'0')).join('')}</td></tr>
        <tr><td>Key (base64)</td><td>${btoa(String.fromCharCode(...bits))}</td></tr>
      </table>`;
    }catch(e){ out.textContent = 'Could not derive: ' + (e.message || e); }
  });
});

dev('asn1','ASN.1 Parser', root=>{
  root.innerHTML = `
    <div class="field"><label>DER, hex</label><textarea id="asIn" style="min-height:110px">30 1a 02 01 01 06 09 2a 86 48 86 f7 0d 01 01 0b 04 0a 6b 69 74 62 6f 78 2d 6b 65 79</textarea></div>
    <div class="output" id="asOut">—</div>
    <div class="hint">DER only, which is what a certificate or a key file actually contains. Every byte of a certificate is inside one of these structures, so this is the tool you reach for when a PEM has to be understood rather than trusted.</div>`;
  function draw(){
    const out = root.querySelector('#asOut');
    const hex = root.querySelector('#asIn').value.replace(/[^0-9a-fA-F]/g, '');
    if(!hex){ out.textContent = 'Paste some DER bytes in hex.'; return; }
    if(hex.length % 2){ out.textContent = 'An odd number of hex digits — one byte is incomplete.'; return; }
    const bytes = Uint8Array.from(hex.match(/.{2}/g).map(h=>parseInt(h, 16)));
    try{
      const nodes = parseASN1(bytes, 0, bytes.length, 0);
      const rows = asn1Rows(nodes, []).map(([type, len, value, depth])=>
        `<tr><td style="white-space:nowrap">${'&nbsp;&nbsp;'.repeat(depth)}${escapeHtml(type)}</td><td>${len}</td><td style="word-break:break-all">${escapeHtml(String(value))}</td></tr>`);
      out.innerHTML = `<table class="mono"><tr><th style="text-align:left">Type</th><th>Len</th><th style="text-align:left">Value</th></tr>${rows.join('')}</table>`;
    }catch(e){
      out.innerHTML = `<div class="hint">${escapeHtml(e.message)}</div>`;
    }
  }
  root.querySelector('#asIn').addEventListener('input', draw);
  draw();
});

/* ---------------- Science (3) ---------------- */

sci('rc','RC Time Constant', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Circuit</label><select id="rcKind"><option value="rc">RC — resistor and capacitor</option><option value="rl">RL — resistor and inductor</option></select></div>
      <div class="field"><label>Resistance (Ω)</label><input type="number" id="rcR" value="10000"></div>
      <div class="field"><label id="rcCLabel">Capacitance (µF)</label><input type="number" id="rcC" value="100" step="0.1"></div>
      <div class="field"><label>Supply (V)</label><input type="number" id="rcV" value="5"></div>
    </div>
    <div class="output" id="rcOut">—</div>
    <div class="hint">τ = RC, or L/R for an inductor — the same curve with a different constant. One τ reaches 63.2% of the supply, five τ is 99.3% and is what "fully charged" means in practice.</div>`;
  function draw(){
    const kind = root.querySelector('#rcKind') ? root.querySelector('#rcKind').value : 'rc';
    const isRL = kind === 'rl';
    const cLabel = root.querySelector('#rcCLabel');
    if(cLabel) cLabel.textContent = isRL ? 'Inductance (mH)' : 'Capacitance (µF)';
    const R = Number(root.querySelector('#rcR').value) || 0;
    const C = (Number(root.querySelector('#rcC').value) || 0) * (isRL ? 1e-3 : 1e-6);
    const V = Number(root.querySelector('#rcV').value) || 0;
    if(!R || !C){ root.querySelector('#rcOut').textContent = 'Both values need to be non-zero.'; return; }
    // RC is R·C; an inductor's time constant is L/R, not R·L — the units only
    // work out one way round, and R·L gives seconds-squared over ohms.
    const tau = isRL ? C / R : R * C;
    const rows = [1,2,3,4,5].map(n=>{
      const t = n * tau;
      const v = V * (1 - Math.exp(-n));
      return `<tr><td>${n}τ · ${(t*1000).toFixed(2)} ms</td><td>${v.toFixed(3)} V</td><td>${(100 * (1 - Math.exp(-n))).toFixed(1)}%</td></tr>`;
    }).join('');
    root.querySelector('#rcOut').innerHTML = `<table class="mono">
      <tr><td>τ = ${isRL ? 'L/R' : 'RC'}</td><td>${(tau*1000).toFixed(3)} ms</td></tr>
      <tr><td>Cut-off frequency</td><td>${(1/(2*Math.PI*tau)).toFixed(1)} Hz</td></tr>
      ${rows}
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

sci('lens','Lens Equation', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Focal length (mm)</label><input type="number" id="lnF" value="50"></div>
      <div class="field"><label>Object distance (mm)</label><input type="number" id="lnDo" value="500"></div>
    </div>
    <div class="output" id="lnOut">—</div>
    <div class="hint">1/f = 1/do + 1/di, with distances measured from the lens. A negative image distance means a virtual image on the same side as the object — what a magnifying glass makes.</div>`;
  function draw(){
    const f = Number(root.querySelector('#lnF').value) || 0;
    const dObj = Number(root.querySelector('#lnDo').value) || 0;
    const out = root.querySelector('#lnOut');
    if(!f || !dObj){ out.textContent = 'Focal length and object distance, both non-zero.'; return; }
    const inv = 1/f - 1/dObj;
    if(Math.abs(inv) < 1e-9){ out.textContent = 'The object is at the focal point — the image is at infinity.'; return; }
    const dImg = 1 / inv;
    const mag = -dImg / dObj;
    out.innerHTML = `<table class="mono">
      <tr><td>Image distance</td><td>${dImg.toFixed(1)} mm ${dImg > 0 ? '(real, opposite side)' : '(virtual, same side)'}</td></tr>
      <tr><td>Magnification</td><td>${mag.toFixed(2)}× ${Math.abs(mag) > 1 ? '(enlarged)' : '(reduced)'}${mag < 0 ? ', inverted' : ', upright'}</td></tr>
      <tr><td>Power</td><td>${(1000/f).toFixed(1)} dioptres</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

sci('doppler','Doppler Shift', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Source frequency (Hz)</label><input type="number" id="dpF" value="440"></div>
      <div class="field"><label>Speed of sound (m/s)</label><input type="number" id="dpC" value="343"></div>
    </div>
    <div class="row">
      <div class="field"><label>Source speed (m/s)</label><input type="number" id="dpVs" value="30"></div>
      <div class="field"><label>Observer speed (m/s)</label><input type="number" id="dpVo" value="0"></div>
    </div>
    <div class="field"><label>Direction</label><select id="dpDir">
      <option value="approach">Approaching each other</option>
      <option value="recede">Moving apart</option>
    </select></div>
    <div class="output" id="dpOut">—</div>
    <div class="hint">f′ = f (c ± v₀) / (c ∓ vₛ). Positive speeds are toward the other party when approaching. Past the speed of sound the formula stops meaning anything, which the tool says rather than returning a number.</div>`;
  function draw(){
    const f = Number(root.querySelector('#dpF').value) || 0;
    const c = Number(root.querySelector('#dpC').value) || 343;
    const vs = Number(root.querySelector('#dpVs').value) || 0;
    const vo = Number(root.querySelector('#dpVo').value) || 0;
    const approach = root.querySelector('#dpDir').value === 'approach';
    const out = root.querySelector('#dpOut');
    if(Math.abs(vs) >= c){ out.textContent = 'The source is at or past the speed of sound — a shock wave, not a shift. Use the Mach angle instead.'; return; }
    const sign = approach ? 1 : -1;
    const observed = f * (c + sign * vo) / (c - sign * vs);
    const cents = 1200 * Math.log2(observed / f);
    out.innerHTML = `<table class="mono">
      <tr><td>Observed frequency</td><td>${observed.toFixed(2)} Hz</td></tr>
      <tr><td>Shift</td><td>${(observed - f).toFixed(2)} Hz (${cents.toFixed(0)} cents)</td></tr>
      <tr><td>Ratio</td><td>${(observed / f).toFixed(4)}</td></tr>
      <tr><td>Mach number of the source</td><td>${(Math.abs(vs) / c).toFixed(3)}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});
