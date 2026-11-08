/* ================================================================
   B23 — keys, files and data.

   The interesting piece here is the DER *encoder*: the app has been able to
   read ASN.1 since B18, and a JWK has to be written back out as the same
   structures. Writing them means the reader and the writer can be tested
   against each other, which is the cheapest kind of proof that both are right.
   ================================================================ */

/* ---------------- DER writing (shared by the key tool) ---------------- */
function derLen(n){
  if(n < 0x80) return [n];
  const bytes = [];
  let v = n;
  while(v > 0){ bytes.unshift(v & 0xff); v = Math.floor(v / 256); }
  return [0x80 | bytes.length, ...bytes];
}
function der(tag, content){ return [tag, ...derLen(content.length), ...content]; }
function derInt(magnitude){
  // magnitude: Uint8Array, big-endian, may carry leading zeros
  let i = 0;
  while(i < magnitude.length - 1 && magnitude[i] === 0) i++;
  let body = Array.from(magnitude.slice(i));
  if(body[0] & 0x80) body = [0, ...body];      // DER integers are signed
  return der(0x02, body);
}
function derSeq(items){ return der(0x30, items.flat()); }
function derOid(dotted){
  const parts = dotted.split('.').map(Number);
  const out = [parts[0] * 40 + parts[1]];
  for(const p of parts.slice(2)){
    const chunk = [];
    let v = p;
    do { chunk.unshift(v & 0x7f); v = Math.floor(v / 128); } while(v > 0);
    for(let i=0;i<chunk.length-1;i++) chunk[i] |= 0x80;
    out.push(...chunk);
  }
  return der(0x06, out);
}
function derB64urlToBytes(s){
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
}
function bytesToB64url(bytes){
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function pemWrap(bytes, label){
  const b64 = btoa(String.fromCharCode(...bytes));
  return '-----BEGIN ' + label + '-----\n' + (b64.match(/.{1,64}/g) || []).join('\n') + '\n-----END ' + label + '-----';
}

/* ---------------- Development (3) ---------------- */

dev('jwkpem','JWK ↔ PEM', root=>{
  root.innerHTML = `
    <div class="segrow" id="jkMode">
      <button class="btn" data-jk="toPem">JWK → PEM</button>
      <button class="btn" data-jk="toJwk">PEM → JWK</button>
    </div>
    <div class="field"><label id="jkLabel">JWK (JSON)</label><textarea id="jkIn" style="min-height:150px" placeholder='{"kty":"RSA","n":"…","e":"AQAB"}'></textarea></div>
    <div class="output" id="jkOut" style="white-space:pre-wrap;word-break:break-all;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">RSA only, public and private. A JWK is the same key as a PEM with the bytes base64url'd and the structure named in JSON; going one way means writing the DER, and going the other means reading it, which this app can now do in both directions.</div>`;
  let mode = 'toPem';
  root.querySelectorAll('[data-jk]').forEach(b=>b.addEventListener('click', ()=>{
    mode = b.dataset.jk;
    root.querySelector('#jkLabel').textContent = mode === 'toPem' ? 'JWK (JSON)' : 'PEM (or DER hex)';
    root.querySelector('#jkIn').placeholder = mode === 'toPem' ? '{"kty":"RSA","n":"…","e":"AQAB"}' : '-----BEGIN PUBLIC KEY-----';
    root.querySelector('#jkOut').textContent = '—';
  }));
  const ALG = '1.2.840.113549.1.1.1';   // rsaEncryption
  function toPem(jwk){
    if(jwk.kty !== 'RSA') throw new Error('only RSA keys are supported here');
    const n = derB64urlToBytes(jwk.n), e = derB64urlToBytes(jwk.e);
    const algId = derSeq([derOid(ALG), der(0x05, [])]);
    if(jwk.d){
      const need = ['n','e','d','p','q','dp','dq','qi'];
      const missing = need.filter(k=>!jwk[k]);
      if(missing.length) throw new Error('a private RSA key needs ' + missing.join(', '));
      const rsaPrivate = derSeq([
        derInt(Uint8Array.of(0)),
        derInt(n), derInt(e), derInt(derB64urlToBytes(jwk.d)),
        derInt(derB64urlToBytes(jwk.p)), derInt(derB64urlToBytes(jwk.q)),
        derInt(derB64urlToBytes(jwk.dp)), derInt(derB64urlToBytes(jwk.dq)),
        derInt(derB64urlToBytes(jwk.qi))
      ]);
      const pki = derSeq([derInt(Uint8Array.of(0)), algId, der(0x04, rsaPrivate)]);
      return pemWrap(pki, 'PRIVATE KEY');
    }
    const spki = derSeq([algId, der(0x03, [0, ...derSeq([derInt(n), derInt(e)])])]);
    return pemWrap(spki, 'PUBLIC KEY');
  }
  function toJwk(text){
    let bytes;
    const m = text.match(/-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/);
    if(m){
      bytes = Uint8Array.from(atob(m[2].replace(/\s+/g, '')), c=>c.charCodeAt(0));
    } else {
      const hex = text.replace(/[^0-9a-fA-F]/g, '');
      if(hex.length < 40) throw new Error('that is neither PEM nor DER hex');
      bytes = Uint8Array.from(hex.match(/.{2}/g).map(h=>parseInt(h, 16)));
    }
    const tree = parseASN1(bytes, 0, bytes.length, 0);
    const top = tree[0];
    const findOid = nodes => {
      for(const n of nodes){
        if(n.tag === 0x06) return n.text;
        const inner = findOid(n.kids || []);
        if(inner) return inner;
      }
      return null;
    };
    const oid = findOid([top]);
    if(oid !== ALG) throw new Error('that is not an RSA key (algorithm OID ' + (oid || 'none') + ')');
    const isPrivate = /PRIVATE KEY/.test(text) || (top.kids[0] && top.kids[0].tag === 0x02);
    const b64u = raw => bytesToB64url(raw.length && raw[0] === 0 ? raw.slice(1) : raw);
    if(!isPrivate){
      const bits = top.kids.find(k=>k.tag === 0x03);
      const inner = parseASN1(bits.raw.slice(1), 0, bits.raw.length - 1, 0);
      const [n, e] = inner[0].kids;
      return { kty:'RSA', n: b64u(n.raw), e: b64u(e.raw), alg:'RS256', ext:true };
    }
    const octets = top.kids.find(k=>k.tag === 0x04);
    const inner = parseASN1(octets.raw, 0, octets.raw.length, 0);
    const ints = inner[0].kids.filter(k=>k.tag === 0x02);
    const [mod, exp, d, p, q, dp, dq, qi] = ints.slice(1);
    return { kty:'RSA', n: b64u(mod.raw), e: b64u(exp.raw), d: b64u(d.raw), p: b64u(p.raw), q: b64u(q.raw),
             dp: b64u(dp.raw), dq: b64u(dq.raw), qi: b64u(qi.raw), alg:'RS256', ext:true };
  }
  function draw(){
    const out = root.querySelector('#jkOut');
    const text = root.querySelector('#jkIn').value.trim();
    if(!text){ out.textContent = '—'; return; }
    try{
      if(mode === 'toPem') out.textContent = toPem(JSON.parse(text));
      else out.textContent = JSON.stringify(toJwk(text), null, 2);
    }catch(e){ out.textContent = 'Could not convert: ' + (e.message || e); }
  }
  root.querySelector('#jkIn').addEventListener('input', draw);
});

dev('filesplit','File Splitter & Joiner', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>File</label><input type="file" id="fsFile"></div>
    <div class="row">
      <div class="field"><label>Part size (MB)</label><input type="number" id="fsSize" value="5" min="0.1" step="0.1"></div>
      <button class="btn primary" id="fsSplit">Split</button>
    </div>
    <div class="output" id="fsOut">Choose a file to split.</div>
    <div class="divider"></div>
    <div class="field"><label>Join parts (select them all)</label><input type="file" id="fsParts" multiple></div>
    <div class="output" id="fsJoin">Choose the parts, in any order — they are sorted by name.</div>
    <div class="hint">A file too large for an attachment, split into pieces that fit. Parts are named <span class="mono">.part01</span>, <span class="mono">.part02</span> and rejoin in that order, so nothing is stored in the browser and nothing is uploaded.</div>`;
  root.querySelector('#fsSplit').addEventListener('click', async ()=>{
    const file = root.querySelector('#fsFile').files[0];
    const out = root.querySelector('#fsOut');
    if(!file){ out.textContent = 'Choose a file first.'; return; }
    const size = Math.max(0.1, Number(root.querySelector('#fsSize').value) || 5) * 1024 * 1024;
    if(file.size > 200 * 1024 * 1024){ out.textContent = 'That file is over 200 MB — too large to process in the page.'; return; }
    const count = Math.ceil(file.size / size) || 1;
    const rows = [];
    for(let i=0;i<count;i++){
      const slice = file.slice(i * size, Math.min(file.size, (i+1) * size));
      const name = file.name + '.part' + String(i+1).padStart(2, '0');
      rows.push(`<tr><td>${escapeHtml(name)}</td><td>${(slice.size/1024).toFixed(0)} KB</td><td><button class="btn ghost" data-fs="${i}" style="padding:2px 8px;font-size:12px">Save</button></td></tr>`);
    }
    out.innerHTML = `<table class="mono">${rows.join('')}</table>
      <div class="hint">${count} part(s). Save each one; the names carry the order.</div>`;
    out.querySelectorAll('[data-fs]').forEach(b=>b.addEventListener('click', ()=>{
      const i = Number(b.dataset.fs);
      const slice = file.slice(i * size, Math.min(file.size, (i+1) * size));
      saveBlob(slice, file.name + '.part' + String(i+1).padStart(2, '0'));
    }));
  });
  root.querySelector('#fsParts').addEventListener('change', async e=>{
    const files = [...e.target.files];
    const out = root.querySelector('#fsJoin');
    if(!files.length){ out.textContent = 'Choose the parts.'; return; }
    files.sort((a, b)=>a.name.localeCompare(b.name));
    const total = files.reduce((a, f)=>a + f.size, 0);
    const base = files[0].name.replace(/\.part\d+$/, '');
    const missing = [];
    files.forEach((f, i)=>{
      const m = f.name.match(/\.part(\d+)$/);
      if(m && Number(m[1]) !== i+1) missing.push(i+1);
    });
    out.innerHTML = `<table class="mono">
      ${files.map(f=>`<tr><td>${escapeHtml(f.name)}</td><td>${(f.size/1024).toFixed(0)} KB</td></tr>`).join('')}
      <tr><td><b>Total</b></td><td><b>${(total/1024).toFixed(0)} KB</b></td></tr>
      <tr><td>Join as</td><td>${escapeHtml(base)}</td></tr>
      ${missing.length ? `<tr><td>Missing part</td><td style="color:#c0392b">${missing.join(', ')}</td></tr>` : ''}
    </table>
    <div class="segrow"><button class="btn primary" id="fsDo">Join and save</button></div>`;
    out.querySelector('#fsDo').addEventListener('click', ()=>{
      saveBlob(new Blob(files, { type:'application/octet-stream' }), base);
    });
  });
});

dev('dupfinder','Duplicate Finder', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>Files (select many)</label><input type="file" id="dfFiles" multiple></div>
    <div class="row">
      <div class="field"><label>Compare by</label><select id="dfMode"><option value="hash">Content hash (SHA-256)</option><option value="size">Size only — fast, rough</option></select></div>
      <button class="btn primary" id="dfGo">Find duplicates</button>
    </div>
    <div class="output" id="dfOut">Choose files, then find duplicates.</div>
    <div class="hint">Hashing reads every byte of every file, in the page, with nothing uploaded. Size-only is a first pass — two files of the same size are not necessarily the same file, and the result says so.</div>`;
  root.querySelector('#dfGo').addEventListener('click', async ()=>{
    const files = [...root.querySelector('#dfFiles').files];
    const out = root.querySelector('#dfOut');
    if(files.length < 2){ out.textContent = 'Select at least two files.'; return; }
    const mode = root.querySelector('#dfMode').value;
    out.textContent = 'Reading ' + files.length + ' files…';
    const groups = new Map();
    for(const f of files){
      let key;
      if(mode === 'size') key = String(f.size);
      else {
        if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
        const buf = await f.arrayBuffer();
        const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
        key = Array.from(digest).map(b=>b.toString(16).padStart(2,'0')).join('');
      }
      if(!groups.has(key)) groups.set(key, []);
      groups.get(key).push(f);
    }
    const dupes = [...groups.entries()].filter(([, list])=>list.length > 1);
    if(!dupes.length){ out.innerHTML = `<div class="hint">No duplicates among ${files.length} files.</div>`; return; }
    const wasted = dupes.reduce((a, [, list])=>a + list.slice(1).reduce((b, f)=>b + f.size, 0), 0);
    out.innerHTML = `<table class="mono">
      ${dupes.map(([key, list])=>`<tr><td>${escapeHtml(list.map(f=>f.name).join(' = '))}</td><td>${(list[0].size/1024).toFixed(0)} KB each</td><td>${list.length}</td></tr>`).join('')}
      <tr><td><b>Groups</b></td><td>${dupes.length}</td><td>${wasted ? (wasted/1024/1024).toFixed(1) + ' MB wasted' : ''}</td></tr>
    </table>
    ${mode === 'size' ? '<div class="hint">Matched by size only — same size does not mean same content. Switch to the hash to be sure.</div>' : ''}`;
  });
});

/* ---------------- Files & Data (1) ---------------- */

fil('csvtosql','CSV to SQL', root=>{
  root.innerHTML = `
    <div class="field"><label>CSV</label><textarea id="csIn" style="min-height:120px">id,name,email
1,Sohil,sohil@example.com
2,O'Brien,ob@example.com</textarea></div>
    <div class="row">
      <div class="field"><label>Table</label><input type="text" id="csTable" value="people"></div>
      <div class="field"><label>Dialect</label><select id="csDialect"><option value="postgres">PostgreSQL</option><option value="mysql">MySQL</option><option value="sqlite">SQLite</option></select></div>
    </div>
    <div class="output" id="csOut" style="white-space:pre-wrap;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">Quotes an apostrophe correctly, which is the whole point — <span class="mono">O'Brien</span> is where a naive converter produces a broken statement. Column names become identifiers; empty cells become NULL.</div>`;
  function parseCSV(text){
    const rows = [];
    let row = [], field = '', quoted = false;
    for(let i=0;i<text.length;i++){
      const c = text[i];
      if(quoted){
        if(c === '"' && text[i+1] === '"'){ field += '"'; i++; }
        else if(c === '"') quoted = false;
        else field += c;
      } else {
        if(c === '"') quoted = true;
        else if(c === ','){ row.push(field); field = ''; }
        else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ''; }
        else if(c !== '\r') field += c;
      }
    }
    if(field.length || row.length){ row.push(field); rows.push(row); }
    return rows.filter(r=>r.length > 1 || (r.length === 1 && r[0] !== ''));
  }
  function draw(){
    const text = root.querySelector('#csIn').value;
    const out = root.querySelector('#csOut');
    const rows = parseCSV(text);
    if(rows.length < 2){ out.textContent = 'A header row and at least one data row.'; return; }
    const table = root.querySelector('#csTable').value.replace(/[^A-Za-z0-9_]/g, '') || 't';
    const dialect = root.querySelector('#csDialect').value;
    const quoteId = name => dialect === 'mysql' ? '`' + name + '`' : '"' + name + '"';
    const header = rows[0].map(h=>quoteId(h.trim()));
    const lit = v => {
      if(v === '' ) return 'NULL';
      if(/^-?\d+(\.\d+)?$/.test(v)) return v;
      return "'" + v.replace(/'/g, "''") + "'";
    };
    const stmts = rows.slice(1).map(r=>
      'INSERT INTO ' + quoteId(table) + ' (' + header.join(', ') + ') VALUES (' + r.map(lit).join(', ') + ');');
    out.textContent = stmts.join('\n');
  }
  root.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Calculation (1) ---------------- */

calc('Sets & Logic','modular','Modular Arithmetic', root=>{
  root.innerHTML = `
    <div class="segrow" id="mdMode">
      <button class="btn" data-md="pow">Power</button>
      <button class="btn" data-md="inv">Inverse</button>
      <button class="btn" data-md="gcd">Extended GCD</button>
      <button class="btn" data-md="crt">Chinese remainder</button>
    </div>
    <div id="mdFields"></div>
    <div class="output" id="mdOut">—</div>
    <div class="hint">The arithmetic behind RSA and every checksum: <span class="mono">a^b mod m</span> without computing a^b, an inverse that exists only when the numbers are coprime, and the Chinese remainder theorem that puts two congruences back together.</div>`;
  let mode = 'pow';
  const FIELDS = {
    pow: [['Base a', 'mdA', '7'], ['Exponent b', 'mdB', '560'], ['Modulus m', 'mdM', '561']],
    inv: [['a', 'mdA', '3'], ['Modulus m', 'mdM', '11']],
    gcd: [['a', 'mdA', '240'], ['b', 'mdB', '46']],
    crt: [['x ≡', 'mdA', '2'], ['mod', 'mdM', '3'], ['x ≡', 'mdB', '3'], ['mod', 'mdN', '5']]
  };
  function render(){
    root.querySelector('#mdFields').innerHTML = FIELDS[mode].map(([label, id, val])=>
      `<div class="field"><label>${label}</label><input type="number" id="${id}" value="${val}"></div>`).join('');
    root.querySelectorAll('#mdFields input').forEach(el=>el.addEventListener('input', draw));
    draw();
  }
  function bigPow(base, exp, mod){
    let result = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp);
    const m = BigInt(mod);
    while(e > 0n){
      if(e & 1n) result = (result * b) % m;
      b = (b * b) % m;
      e >>= 1n;
    }
    return result;
  }
  function egcd(a, b){
    let [oldR, r] = [a, b], [oldS, s] = [1n, 0n], [oldT, t] = [0n, 1n];
    while(r !== 0n){
      const q = oldR / r;
      [oldR, r] = [r, oldR - q * r];
      [oldS, s] = [s, oldS - q * s];
      [oldT, t] = [t, oldT - q * t];
    }
    return { gcd: oldR, x: oldS, y: oldT };
  }
  function draw(){
    const out = root.querySelector('#mdOut');
    const num = id => BigInt(root.querySelector('#' + id) ? root.querySelector('#' + id).value || 0 : 0);
    try{
      if(mode === 'pow'){
        const a = num('mdA'), b = num('mdB'), m = num('mdM');
        if(m === 0n) throw new Error('a modulus of zero has no meaning');
        const r = bigPow(a, b, m);
        out.innerHTML = `<table class="mono">
          <tr><td>${a}^${b} mod ${m}</td><td>${r}</td></tr>
          <tr><td>Digits in the full power</td><td>about ${Math.max(1, Math.round(Number(b) * Math.log10(Math.abs(Number(a)) || 1)))} — which is why this is done without computing it</td></tr>
        </table>`;
      } else if(mode === 'inv'){
        const a = num('mdA'), m = num('mdM');
        const { gcd, x } = egcd(((a % m) + m) % m, m);
        if(gcd !== 1n){ out.textContent = 'No inverse: gcd(' + a + ', ' + m + ') is ' + gcd + ', and an inverse exists only when that is 1.'; return; }
        out.innerHTML = `<table class="mono">
          <tr><td>Inverse of ${a} mod ${m}</td><td>${((x % m) + m) % m}</td></tr>
          <tr><td>Check</td><td>${a} × ${((x % m) + m) % m} mod ${m} = ${(a * (((x % m) + m) % m)) % m}</td></tr>
        </table>`;
      } else if(mode === 'gcd'){
        const a = num('mdA'), b = num('mdB');
        const { gcd, x, y } = egcd(a, b);
        out.innerHTML = `<table class="mono">
          <tr><td>gcd(${a}, ${b})</td><td>${gcd}</td></tr>
          <tr><td>Bézout</td><td>${a}×${x} + ${b}×${y} = ${gcd}</td></tr>
          <tr><td>Coprime?</td><td>${gcd === 1n ? 'yes — an inverse exists' : 'no'}</td></tr>
        </table>`;
      } else {
        const a1 = num('mdA'), m1 = num('mdM'), a2 = num('mdB'), m2 = num('mdN');
        const { gcd, x } = egcd(m1, m2);
        if(gcd !== 1n){
          const diff = ((a2 - a1) % gcd + gcd) % gcd;
          if(diff !== 0n){ out.textContent = 'No solution: the moduli share a factor (' + gcd + ') and the residues disagree by ' + diff + '.'; return; }
        }
        const M = m1 * m2;
        const t = ((a2 - a1) / gcd) * x % (m2 / gcd);
        const r = ((a1 + m1 * t) % M + M) % M;
        out.innerHTML = `<table class="mono">
          <tr><td>Solution</td><td>x ≡ ${r} (mod ${M})</td></tr>
          <tr><td>Check</td><td>${r} mod ${m1} = ${r % m1}, ${r} mod ${m2} = ${r % m2}</td></tr>
        </table>`;
      }
    }catch(e){ out.textContent = 'Could not compute: ' + (e.message || e); }
  }
  root.querySelectorAll('[data-md]').forEach(b=>b.addEventListener('click', ()=>{ mode = b.dataset.md; render(); }));
  render();
});
