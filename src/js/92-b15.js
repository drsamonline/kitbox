/* ================================================================
   B15 — the small ones from BACKLOG-TOOLS.md
   IP format, hash identifier, UUID analyser, cron generator, JWT signer,
   set operations, edit distance, word-level diff, text extractors, ZIP
   extract, tuner.

   One deliberate deviation from "one tool per job": the extractors are a
   single tool with checkboxes. Five tools with the same textarea and five
   different regexes would be five copies of one tool, which is the opposite
   of the rule's intent.
   ================================================================ */

/* ---------------- Development (5) ---------------- */

dev('ipformat','IP Format Converter', root=>{
  root.innerHTML = `
    <div class="field"><label>IPv4 address</label><input type="text" id="ifIn" value="192.168.1.10" style="font-family:var(--mono)"></div>
    <div class="output" id="ifOut">—</div>
    <div class="hint">The same address in the forms a log, a config file or a packed header might hold it. The integer form is what a firewall or a database column usually stores.</div>`;
  function draw(){
    const v = root.querySelector('#ifIn').value.trim();
    const parts = v.split('.').map(Number);
    const out = root.querySelector('#ifOut');
    if(parts.length !== 4 || parts.some(x=>!Number.isInteger(x) || x < 0 || x > 255)){
      out.textContent = 'Four numbers, 0–255, separated by dots.';
      return;
    }
    const n = ((parts[0]<<24) | (parts[1]<<16) | (parts[2]<<8) | parts[3]) >>> 0;
    const pad = (s, len) => s.padStart(len, '0');
    out.innerHTML = `<table class="mono">
      <tr><td>Dotted</td><td>${parts.join('.')}</td></tr>
      <tr><td>Integer</td><td>${n}</td></tr>
      <tr><td>Hex</td><td>0x${pad(n.toString(16), 8)}</td></tr>
      <tr><td>Octal</td><td>0${n.toString(8)}</td></tr>
      <tr><td>Binary</td><td>${pad(n.toString(2), 32).replace(/(.{8})(?=.)/g, '$1.')}</td></tr>
      <tr><td>Class</td><td>${parts[0] < 128 ? 'A' : parts[0] < 192 ? 'B' : parts[0] < 224 ? 'C' : parts[0] < 240 ? 'D (multicast)' : 'E (reserved)'}</td></tr>
      <tr><td>Private?</td><td>${(parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168)) ? 'yes — RFC 1918' : (parts[0] === 127 ? 'loopback' : 'no')}</td></tr>
    </table>`;
  }
  root.querySelector('#ifIn').addEventListener('input', draw);
  draw();
});

dev('hashid','Hash Identifier', root=>{
  root.innerHTML = `
    <div class="field"><label>Hash</label><input type="text" id="hiIn" value="5d41402abc4b2a76b9719d911017c592" style="font-family:var(--mono)"></div>
    <div class="output" id="hiOut">—</div>
    <div class="hint">Guesses from length and alphabet, which is all anyone can do without trying. A 32-character hex string is MD5 or NTLM or MD4; only the source tells you which.</div>`;
  function draw(){
    const h = root.querySelector('#hiIn').value.trim();
    const out = root.querySelector('#hiOut');
    if(!h){ out.textContent = '—'; return; }
    const hex = /^[0-9a-fA-F]+$/.test(h);
    const b64 = /^[A-Za-z0-9+/]+={0,2}$/.test(h);
    const guesses = [];
    if(hex){
      const byLen = { 8: ['CRC-32', 'Adler-32'], 16: ['MySQL323', 'DES(8)'], 32: ['MD5', 'MD4', 'NTLM', 'LM'],
        40: ['SHA-1', 'RIPEMD-160', 'MySQL5'], 56: ['SHA-224', 'SHA3-224'], 64: ['SHA-256', 'SHA3-256', 'BLAKE2s'],
        96: ['SHA-384', 'SHA3-384'], 128: ['SHA-512', 'SHA3-512', 'BLAKE2b', 'Whirlpool'] };
      (byLen[h.length] || []).forEach(g=>guesses.push(g));
    }
    if(b64 && !hex) guesses.push('Base64 — not a hash until you decode it');
    if(/^\$2[aby]\$/.test(h)) guesses.push('bcrypt');
    if(/^\$argon2/.test(h)) guesses.push('Argon2');
    if(/^\$6\$/.test(h)) guesses.push('SHA-512 crypt');
    if(/^\$1\$/.test(h)) guesses.push('MD5 crypt');
    if(/^[0-9a-f]{32}:[0-9a-f]{32}$/.test(h)) guesses.push('LM:NTLM pair');
    out.innerHTML = `<table class="mono">
      <tr><td>Length</td><td>${h.length}</td></tr>
      <tr><td>Alphabet</td><td>${hex ? 'hex' : b64 ? 'base64-ish' : 'other'}</td></tr>
      <tr><td>Could be</td><td>${guesses.length ? escapeHtml(guesses.join(', ')) : 'nothing I recognise'}</td></tr>
    </table>`;
  }
  root.querySelector('#hiIn').addEventListener('input', draw);
  draw();
});

dev('uuidanalyse','UUID Analyser', root=>{
  root.innerHTML = `
    <div class="field"><label>UUID</label><input type="text" id="uaIn" value="550e8400-e29b-41d4-a716-446655440000" style="font-family:var(--mono)"></div>
    <div class="output" id="uaOut">—</div>
    <div class="hint">Version 4 is random; version 7 is time-ordered and therefore leaks when it was made. That distinction matters when an identifier ends up in a URL.</div>`;
  function draw(){
    const v = root.querySelector('#uaIn').value.trim().toLowerCase();
    const out = root.querySelector('#uaOut');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v)){
      out.textContent = 'That is not a UUID in the 8-4-4-4-12 form.';
      return;
    }
    const version = parseInt(v[14], 16);
    const variant = parseInt(v[19], 16);
    const variantName = (variant & 0x8) === 0 ? 'NCS (reserved)' : (variant & 0xc) === 0x8 ? 'RFC 4122' : (variant & 0xe) === 0xc ? 'Microsoft' : 'future';
    let when = '';
    if(version === 1){
      const t = v.replace(/-/g, '');
      const ticks = BigInt('0x' + t.slice(13, 16) + t.slice(8, 12) + t.slice(0, 8));
      const unix = Number(ticks / 10000n) - 12219292800;
      when = new Date(unix * 1000).toISOString();
    }
    if(version === 7){
      const t = v.replace(/-/g, '');
      when = new Date(Number(BigInt('0x' + t.slice(0, 12)))).toISOString();
    }
    out.innerHTML = `<table class="mono">
      <tr><td>Version</td><td>${version} ${version === 4 ? '(random)' : version === 7 ? '(time-ordered)' : version === 1 ? '(time + MAC)' : ''}</td></tr>
      <tr><td>Variant</td><td>${variantName}</td></tr>
      <tr><td>Generated at</td><td>${when || 'not recoverable from this version'}</td></tr>
      <tr><td>Leaks a timestamp?</td><td>${when ? 'yes — do not put it in a public URL if that matters' : 'no'}</td></tr>
    </table>`;
  }
  root.querySelector('#uaIn').addEventListener('input', draw);
  draw();
});

dev('crongen','Cron Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Minute</label><input type="text" id="cgMin" value="0"></div>
      <div class="field"><label>Hour</label><input type="text" id="cgHour" value="3"></div>
      <div class="field"><label>Day of month</label><input type="text" id="cgDom" value="*"></div>
      <div class="field"><label>Month</label><input type="text" id="cgMon" value="*"></div>
      <div class="field"><label>Day of week</label><input type="text" id="cgDow" value="*"></div>
    </div>
    <div class="segrow" id="cgPresets">
      <button class="btn" data-cron="0 * * * *">Every hour</button>
      <button class="btn" data-cron="0 3 * * *">Daily 03:00</button>
      <button class="btn" data-cron="*/15 * * * *">Every 15 min</button>
      <button class="btn" data-cron="0 9 * * 1-5">Weekdays 09:00</button>
      <button class="btn" data-cron="0 0 1 * *">First of month</button>
    </div>
    <div class="output" id="cgOut">—</div>
    <div class="hint">Fields accept <span class="mono">*</span>, a number, a list <span class="mono">1,15</span>, a range <span class="mono">1-5</span> and a step <span class="mono">*/15</span>. The Cron Parser is the other direction: paste a line, get English.</div>`;
  function draw(){
    const f = ['cgMin','cgHour','cgDom','cgMon','cgDow'].map(id=>root.querySelector('#' + id).value.trim() || '*');
    const line = f.join(' ');
    const valid = f.every(x=>/^[0-9*,\/-]+$/.test(x));
    const dow = f[4], dom = f[2];
    let note = '';
    if(dow !== '*' && dom !== '*') note = 'Both day-of-month and day-of-week are set: cron runs when <b>either</b> matches, which is rarely what people mean.';
    root.querySelector('#cgOut').innerHTML = `<table class="mono">
      <tr><td>Line</td><td>${escapeHtml(line)}</td></tr>
      <tr><td>Shape</td><td>${valid ? 'valid characters' : 'unexpected characters in a field'}</td></tr>
      ${note ? `<tr><td>Careful</td><td>${note}</td></tr>` : ''}
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  root.querySelectorAll('[data-cron]').forEach(b=>b.addEventListener('click', ()=>{
    const parts = b.dataset.cron.split(' ');
    ['cgMin','cgHour','cgDom','cgMon','cgDow'].forEach((id, i)=>{ root.querySelector('#' + id).value = parts[i]; });
    draw();
  }));
  draw();
});

dev('jwtsign','JWT Signer', root=>{
  root.innerHTML = `
    <div class="field"><label>Payload (JSON)</label><textarea id="jsPayload" style="min-height:110px">{"sub":"1234567890","name":"Dr Sohil Momin","iat":1735689600}</textarea></div>
    <div class="row">
      <div class="field"><label>Algorithm</label><select id="jsAlg"><option>HS256</option><option>HS384</option><option>HS512</option></select></div>
      <div class="field"><label>Secret</label><input type="text" id="jsSecret" value="a-shared-secret"></div>
    </div>
    <div class="segrow"><button class="btn primary" id="jsGo">Sign</button></div>
    <div class="output" id="jsOut" style="word-break:break-all">—</div>
    <div class="hint">HMAC only, with a shared secret — the same thing a server does with a symmetric key. Asymmetric signing needs a private key and belongs in the RSA tool. The Debugger beside this verifies nothing; this one produces a token you can actually test with.</div>`;
  const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  root.querySelector('#jsGo').addEventListener('click', async ()=>{
    const out = root.querySelector('#jsOut');
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    let payload;
    try{ payload = JSON.parse(root.querySelector('#jsPayload').value); }
    catch(e){ out.textContent = 'The payload is not valid JSON: ' + e.message; return; }
    const alg = root.querySelector('#jsAlg').value;
    const hash = { HS256:'SHA-256', HS384:'SHA-384', HS512:'SHA-512' }[alg];
    const header = { alg, typ:'JWT' };
    const enc = new TextEncoder();
    const signingInput = b64url(enc.encode(JSON.stringify(header))) + '.' + b64url(enc.encode(JSON.stringify(payload)));
    try{
      const key = await crypto.subtle.importKey('raw', enc.encode(root.querySelector('#jsSecret').value), { name:'HMAC', hash }, false, ['sign']);
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(signingInput)));
      const token = signingInput + '.' + b64url(sig);
      out.innerHTML = `<table class="mono">
        <tr><td>Token</td><td>${escapeHtml(token)}</td></tr>
        <tr><td>Header</td><td>${escapeHtml(JSON.stringify(header))}</td></tr>
      </table>`;
    }catch(e){ out.textContent = 'Could not sign: ' + (e.message || e); }
  });
});

/* ---------------- Calculation (3) ---------------- */

calc('Sets & Logic','setops','Set Operations', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Set A</label><textarea id="soA" style="min-height:70px">1, 2, 3, 4</textarea></div>
      <div class="field"><label>Set B</label><textarea id="soB" style="min-height:70px">3, 4, 5</textarea></div>
    </div>
    <div class="segrow" id="soModes">
      <button class="btn" data-set="union">Union</button>
      <button class="btn" data-set="inter">Intersection</button>
      <button class="btn" data-set="diff">A − B</button>
      <button class="btn" data-set="sym">Symmetric difference</button>
      <button class="btn" data-set="power">Power set of A</button>
      <button class="btn" data-set="cart">Cartesian product</button>
    </div>
    <div class="output" id="soOut">—</div>
    <div class="hint">Comma or newline separated; order is preserved and duplicates are removed. The power set doubles in size with every element, so it stops at 16 elements.</div>`;
  const parse = v => [...new Set(v.split(/[\n,]/).map(s=>s.trim()).filter(Boolean))];
  function run(mode){
    const A = parse(root.querySelector('#soA').value);
    const B = parse(root.querySelector('#soB').value);
    const out = root.querySelector('#soOut');
    let result = [], note = '';
    if(mode === 'union') result = [...new Set([...A, ...B])];
    else if(mode === 'inter') result = A.filter(x=>B.includes(x));
    else if(mode === 'diff') result = A.filter(x=>!B.includes(x));
    else if(mode === 'sym') result = [...A.filter(x=>!B.includes(x)), ...B.filter(x=>!A.includes(x))];
    else if(mode === 'power'){
      if(A.length > 16){ out.textContent = 'That is ' + Math.pow(2, A.length) + ' subsets. Trim A to 16 or fewer.'; return; }
      const sets = [];
      for(let mask=0; mask<(1<<A.length); mask++){
        sets.push(A.filter((_, i)=>mask & (1<<i)));
      }
      out.innerHTML = `<table class="mono">${sets.map((s, i)=>`<tr><td>${i}</td><td>{ ${escapeHtml(s.join(', '))} }</td></tr>`).join('')}</table>
        <div class="hint">${sets.length} subsets</div>`;
      return;
    } else {
      A.forEach(a=>B.forEach(b=>result.push(a + b)));
      note = A.length + ' × ' + B.length + ' = ' + result.length;
    }
    out.innerHTML = `<table class="mono">
      <tr><td>Result</td><td>{ ${escapeHtml(result.join(', '))} }</td></tr>
      <tr><td>Size</td><td>${result.length}${note ? ' — ' + note : ''}</td></tr>
    </table>`;
  }
  root.querySelectorAll('[data-set]').forEach(b=>b.addEventListener('click', ()=>run(b.dataset.set)));
  root.querySelectorAll('textarea').forEach(el=>el.addEventListener('input', ()=>run('union')));
  run('union');
});

calc('Sets & Logic','levenshtein','Edit Distance', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>First</label><input type="text" id="lvA" value="kitten"></div>
      <div class="field"><label>Second</label><input type="text" id="lvB" value="sitting"></div>
    </div>
    <div class="output" id="lvOut">—</div>
    <div class="hint">Levenshtein distance: the fewest single-character insertions, deletions and substitutions that turn one into the other. The alignment below shows which operations those are.</div>`;
  function draw(){
    const a = [...root.querySelector('#lvA').value], b = [...root.querySelector('#lvB').value];
    const m = a.length, n = b.length;
    const d = Array.from({length: m+1}, ()=>new Array(n+1).fill(0));
    for(let i=0;i<=m;i++) d[i][0] = i;
    for(let j=0;j<=n;j++) d[0][j] = j;
    for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    }
    let i = m, j = n, ops = [];
    while(i > 0 || j > 0){
      if(i > 0 && j > 0 && a[i-1] === b[j-1]){ i--; j--; }
      else if(i > 0 && j > 0 && d[i][j] === d[i-1][j-1] + 1){ ops.unshift('substitute ' + a[i-1] + ' → ' + b[j-1]); i--; j--; }
      else if(i > 0 && d[i][j] === d[i-1][j] + 1){ ops.unshift('delete ' + a[i-1]); i--; }
      else { ops.unshift('insert ' + b[j-1]); j--; }
    }
    const pct = Math.max(m, n) ? (1 - d[m][n] / Math.max(m, n)) * 100 : 100;
    root.querySelector('#lvOut').innerHTML = `<table class="mono">
      <tr><td>Distance</td><td>${d[m][n]}</td></tr>
      <tr><td>Similarity</td><td>${pct.toFixed(0)}%</td></tr>
      <tr><td>Operations</td><td>${ops.length ? escapeHtml(ops.join('; ')) : 'identical'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

calc('Sets & Logic','hamming','Hamming Distance', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>First (text or hex)</label><input type="text" id="hmA" value="karolin" style="font-family:var(--mono)"></div>
      <div class="field"><label>Second</label><input type="text" id="hmB" value="kathrin" style="font-family:var(--mono)"></div>
    </div>
    <div class="output" id="hmOut">—</div>
    <div class="hint">Counts the bits that differ. Equal-length strings are compared byte by byte; different lengths are compared up to the shorter one and the rest is reported as unaligned rather than silently ignored.</div>`;
  function toBytes(v){
    if(/^(0x)?[0-9a-fA-F]+$/.test(v) && v.replace(/^0x/, '').length % 2 === 0 && !/^\d+$/.test(v)){
      return Uint8Array.from(v.replace(/^0x/, '').match(/.{2}/g).map(h=>parseInt(h, 16)));
    }
    return bytesFromText(v);
  }
  function draw(){
    const a = toBytes(root.querySelector('#hmA').value), b = toBytes(root.querySelector('#hmB').value);
    const len = Math.min(a.length, b.length);
    let bits = 0;
    for(let i=0;i<len;i++){
      let x = a[i] ^ b[i];
      while(x){ bits += x & 1; x >>= 1; }
    }
    root.querySelector('#hmOut').innerHTML = `<table class="mono">
      <tr><td>Bits different</td><td>${bits}</td></tr>
      <tr><td>Bytes compared</td><td>${len}</td></tr>
      <tr><td>Unaligned</td><td>${a.length === b.length ? 'none' : Math.abs(a.length - b.length) + ' byte(s) longer on one side'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});
