/* ================================================================
   Borrowed ideas — five tools from it-tools, four from CyberChef,
   one improvement from compressorjs.

   None of their code is here. it-tools is GPL-3.0, which cannot be
   relicensed into this project; CyberChef is Apache-2.0 and compressorjs is
   MIT, both of which would require attribution of copied source. What travels
   between projects freely is the idea — "a chmod calculator", "XOR brute
   force", "Shannon entropy" — and each of these is written from the definition
   rather than adapted from their implementation.

   Credit where it is due: the tools below exist because those projects
   showed they were worth having.
   ================================================================ */

/* ---------------- Development (7) ---------------- */

dev('chmod','chmod Calculator', root=>{
  const PERMS = [
    ['Owner', 'u'], ['Group', 'g'], ['Other', 'o']
  ];
  root.innerHTML = `
    <div id="cmGrid"></div>
    <div class="row" style="margin-top:12px">
      <div class="field"><label>Octal</label><input type="text" id="cmOctal" value="755" maxlength="4"></div>
      <div class="field"><label>Symbolic</label><input type="text" id="cmSym" value="rwxr-xr-x"></div>
    </div>
    <div class="output" id="cmOut">—</div>
    <div class="hint">Type octal or symbolic in either box and the other follows. The leading digit, when there is one, is setuid/setgid/sticky.</div>`;
  const grid = root.querySelector('#cmGrid');
  grid.innerHTML = `<table class="mono"><tr><th></th><th>read</th><th>write</th><th>execute</th></tr>`
    + PERMS.map(([label, who])=>`<tr><td>${label}</td>`
      + ['r','w','x'].map(p=>`<td><label style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" data-who="${who}" data-p="${p}"></label></td>`).join('')
      + '</tr>').join('') + '</table>';

  const octalEl = root.querySelector('#cmOctal'), symEl = root.querySelector('#cmSym'), out = root.querySelector('#cmOut');
  function fromOctal(v){
    const digits = v.replace(/[^0-7]/g, '').slice(-4).padStart(3, '0');
    const bits = digits.slice(-3).split('').map(d=>Number(d).toString(2).padStart(3, '0')).join('');
    root.querySelectorAll('[data-who]').forEach((cb, i)=>{
      const who = cb.dataset.who, p = cb.dataset.p;
      const idx = PERMS.findIndex(x=>x[1] === who) * 3 + 'rwx'.indexOf(p);
      cb.checked = bits[idx] === '1';
    });
    const sym = bits.match(/.{3}/g).map(b=>
      (b[0]==='1'?'r':'-') + (b[1]==='1'?'w':'-') + (b[2]==='1'?'x':'-')).join('');
    symEl.value = sym;
    const special = digits.length === 4 ? digits[0] : '0';
    out.innerHTML = `<table class="mono">
      <tr><td>Octal</td><td>${digits}</td></tr>
      <tr><td>Symbolic</td><td>${sym}</td></tr>
      <tr><td>chmod command</td><td>chmod ${digits} file</td></tr>
      <tr><td>Special bits</td><td>${special === '0' ? 'none' : (Number(special) & 4 ? 'setuid ' : '') + (Number(special) & 2 ? 'setgid ' : '') + (Number(special) & 1 ? 'sticky' : '')}</td></tr>
    </table>`;
  }
  function fromChecks(){
    let bits = '';
    PERMS.forEach(([, who])=>{
      ['r','w','x'].forEach(p=>{
        const cb = root.querySelector(`[data-who="${who}"][data-p="${p}"]`);
        bits += cb.checked ? '1' : '0';
      });
    });
    const octal = bits.match(/.{3}/g).map(b=>parseInt(b, 2)).join('');
    octalEl.value = octal;
    fromOctal(octal);
  }
  octalEl.addEventListener('input', ()=>fromOctal(octalEl.value));
  symEl.addEventListener('input', ()=>{
    const sym = symEl.value.padEnd(9, '-');
    root.querySelectorAll('[data-who]').forEach(cb=>{
      const i = PERMS.findIndex(x=>x[1] === cb.dataset.who) * 3 + 'rwx'.indexOf(cb.dataset.p);
      cb.checked = sym[i] === cb.dataset.p;
    });
    fromChecks();
  });
  root.querySelectorAll('[data-who]').forEach(cb=>cb.addEventListener('change', fromChecks));
  fromOctal('755');
});

dev('basicauth','Basic Auth Header', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Username</label><input type="text" id="baU" value="admin"></div>
      <div class="field"><label>Password</label><input type="text" id="baP" value="hunter2"></div>
    </div>
    <div class="output" id="baOut">—</div>
    <div class="hint">Base64 of <span class="mono">user:password</span>, which is what an Authorization header carries. It is encoding, not encryption — anything on the wire can read it, so it belongs only over TLS.</div>`;
  function draw(){
    const pair = root.querySelector('#baU').value + ':' + root.querySelector('#baP').value;
    const b64 = btoa(unescape(encodeURIComponent(pair)));
    root.querySelector('#baOut').innerHTML = `<table class="mono">
      <tr><td>Header</td><td>Authorization: Basic ${escapeHtml(b64)}</td></tr>
      <tr><td>Encoded pair</td><td>${escapeHtml(b64)}</td></tr>
      <tr><td>Decoded</td><td>${escapeHtml(pair)}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('macaddr','MAC Address Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>How many</label><input type="number" id="maN" value="5" min="1" max="50"></div>
      <div class="field"><label>Separator</label><select id="maSep"><option value=":">colon</option><option value="-">hyphen</option><option value="">none</option></select></div>
    </div>
    <div class="output" id="maOut">—</div>
    <div class="hint">Locally administered unicast addresses: the second nibble is 2, 6, A or E, which is what a virtual machine or a test fixture should use rather than a real vendor prefix.</div>`;
  function draw(){
    const n = Math.min(50, Math.max(1, Number(root.querySelector('#maN').value) || 1));
    const sep = root.querySelector('#maSep').value;
    const out = [];
    for(let i=0;i<n;i++){
      const b = crypto.getRandomValues(new Uint8Array(6));
      b[0] = (b[0] & 0xFC) | 0x02;
      out.push(Array.from(b).map(x=>x.toString(16).padStart(2, '0')).join(sep).toUpperCase());
    }
    root.querySelector('#maOut').textContent = out.join('\n');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('iprange','IPv4 Range Expander', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Range or CIDR</label><input type="text" id="irIn" value="192.168.1.10 - 192.168.1.14" style="min-width:260px"></div>
    </div>
    <div class="output" id="irOut">—</div>
    <div class="hint">Accepts <span class="mono">a - b</span> or a CIDR. Shows the range, the count and whether the two ends are in the same /24 — the question a firewall rule actually asks. The Subnet Calculator is the other half: that one gives the mask and host count.</div>`;
  function ip2n(ip){
    const p = ip.trim().split('.').map(Number);
    if(p.length !== 4 || p.some(x=>!Number.isInteger(x) || x < 0 || x > 255)) return null;
    return ((p[0]<<24) | (p[1]<<16) | (p[2]<<8) | p[3]) >>> 0;
  }
  function n2ip(n){ return [n>>>24, (n>>>16)&255, (n>>>8)&255, n&255].join('.'); }
  function draw(){
    const v = root.querySelector('#irIn').value.trim();
    const out = root.querySelector('#irOut');
    let start = null, end = null;
    if(v.includes('/')){
      const [ip, bitsRaw] = v.split('/');
      const bits = Number(bitsRaw);
      const n = ip2n(ip);
      if(n === null || !(bits >= 0 && bits <= 32)){ out.textContent = 'That is not a CIDR I can read.'; return; }
      const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
      start = (n & mask) >>> 0;
      end = (start | (~mask >>> 0)) >>> 0;
    } else {
      const [a, b] = v.split(/\s*-\s*/);
      start = ip2n(a || ''); end = ip2n(b || a || '');
      if(start === null || end === null){ out.textContent = 'Two addresses, like 10.0.0.1 - 10.0.0.9.'; return; }
      if(start > end){ const t = start; start = end; end = t; }
    }
    const count = end - start + 1;
    out.innerHTML = `<table class="mono">
      <tr><td>From</td><td>${n2ip(start)}</td></tr>
      <tr><td>To</td><td>${n2ip(end)}</td></tr>
      <tr><td>Addresses</td><td>${count.toLocaleString(numLocale())}</td></tr>
      <tr><td>Same /24?</td><td>${(start >>> 8) === (end >>> 8) ? 'yes' : 'no'}</td></tr>
      <tr><td>Same /16?</td><td>${(start >>> 16) === (end >>> 16) ? 'yes' : 'no'}</td></tr>
    </table>`;
  }
  root.querySelector('#irIn').addEventListener('input', draw);
  draw();
});

dev('metatags','Meta Tag Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Title</label><input type="text" id="mtTitle" value="Kitbox — every tool, one offline app"></div>
      <div class="field"><label>URL</label><input type="text" id="mtUrl" value="https://example.com/"></div>
    </div>
    <div class="field"><label>Description</label><textarea id="mtDesc" style="min-height:70px">356 tools across 27 categories in one offline file.</textarea></div>
    <div class="row">
      <div class="field"><label>Image URL</label><input type="text" id="mtImg" placeholder="https://example.com/card.png"></div>
      <div class="field"><label>Theme colour</label><input type="text" id="mtColor" value="#0b0e14"></div>
    </div>
    <div class="output" id="mtOut" style="white-space:pre-wrap;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">The tags that make a link unfurl properly. Double-click the result to copy it.</div>`;
  function draw(){
    const t = root.querySelector('#mtTitle').value, u = root.querySelector('#mtUrl').value;
    const d = root.querySelector('#mtDesc').value, i = root.querySelector('#mtImg').value;
    const c = root.querySelector('#mtColor').value;
    const esc = s => String(s).replace(/"/g, '&quot;');
    const lines = [
      `<title>${t.replace(/[<>]/g, '')}</title>`,
      `<meta name="description" content="${esc(d)}">`,
      `<link rel="canonical" href="${esc(u)}">`,
      `<meta name="theme-color" content="${esc(c)}">`,
      '',
      `<meta property="og:type" content="website">`,
      `<meta property="og:title" content="${esc(t)}">`,
      `<meta property="og:description" content="${esc(d)}">`,
      `<meta property="og:url" content="${esc(u)}">`,
      i ? `<meta property="og:image" content="${esc(i)}">` : '<!-- og:image is what makes the card render; add one -->',
      '',
      `<meta name="twitter:card" content="${i ? 'summary_large_image' : 'summary'}">`,
      `<meta name="twitter:title" content="${esc(t)}">`,
      `<meta name="twitter:description" content="${esc(d)}">`
    ];
    root.querySelector('#mtOut').textContent = lines.join('\n');
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('sqlpretty','SQL Prettifier', root=>{
  root.innerHTML = `
    <div class="field"><label>SQL</label><textarea id="spIn" style="min-height:120px">select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 and o.created_at > '2026-01-01' group by u.id, u.name order by orders desc</textarea></div>
    <div class="output" id="spOut" style="white-space:pre;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">A formatter, not a parser: it breaks on the keywords that start a clause and indents the rest. It will not catch a syntax error, and it will not reformat a subquery you wanted inline.</div>`;
  const KEYWORDS = ['select','from','where','group by','having','order by','limit','offset','union all','union','left join','right join','inner join','full join','join','values','set','insert into','update','delete from'];
  function draw(){
    let s = root.querySelector('#spIn').value.replace(/\s+/g, ' ').trim();
    if(!s){ root.querySelector('#spOut').textContent = '—'; return; }
    const re = new RegExp('\\b(' + KEYWORDS.map(k=>k.replace(/ /g,'\\s+')).join('|') + ')\\b', 'gi');
    s = s.replace(re, m=>'\n' + m.toUpperCase());
    s = s.replace(/\n(LEFT|RIGHT|INNER|FULL)?\s*JOIN/g, '\n  $1 JOIN').replace(/\n{2,}/g, '\n');
    const lines = s.split('\n').map(l=>l.trim()).filter(Boolean);
    root.querySelector('#spOut').textContent = lines.map((l, i)=> i === 0 ? l : '  ' + l).join('\n');
  }
  root.querySelector('#spIn').addEventListener('input', draw);
  draw();
});

dev('totp','TOTP Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>Base32 secret</label><input type="text" id="tpSecret" value="JBSWY3DPEHPK3PXP" style="font-family:var(--mono)"></div>
    <div class="row">
      <div class="field"><label>Digits</label><select id="tpDigits"><option value="6">6</option><option value="8">8</option></select></div>
      <div class="field"><label>Period (seconds)</label><input type="number" id="tpPeriod" value="30"></div>
      <div class="field"><label>Time to check (optional)</label><input type="text" id="tpAt" placeholder="leave blank for now"></div>
    </div>
    <div class="output" id="tpOut">—</div>
    <div class="hint">RFC 6238, HMAC-SHA1 — what an authenticator app shows. Nothing leaves the page: the secret is not stored and not sent. Use this to check that a server and a phone agree, not as your password manager.</div>`;
  let timer = null;
  async function draw(){
    const out = root.querySelector('#tpOut');
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    const secret = root.querySelector('#tpSecret').value.trim().toUpperCase().replace(/\s/g, '');
    const digits = Number(root.querySelector('#tpDigits').value);
    const period = Math.max(1, Number(root.querySelector('#tpPeriod').value) || 30);
    const at = root.querySelector('#tpAt').value.trim();
    const when = at ? new Date(at) : new Date();
    if(isNaN(when.getTime())){ out.textContent = 'That is not a date I can read.'; return; }
    let key;
    try{ key = fromBase32(secret); }catch(e){ out.textContent = 'That is not valid Base32: ' + e.message; return; }
    const counter = Math.floor(when.getTime() / 1000 / period);
    const msg = new Uint8Array(8);
    let c = counter;
    for(let i=7;i>=0;i--){ msg[i] = c & 0xFF; c = Math.floor(c / 256); }
    const k = await crypto.subtle.importKey('raw', key, { name:'HMAC', hash:'SHA-1' }, false, ['sign']);
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, msg));
    const off = sig[sig.length - 1] & 0x0F;
    const bin = ((sig[off] & 0x7F) << 24) | (sig[off+1] << 16) | (sig[off+2] << 8) | sig[off+3];
    const code = String(bin % Math.pow(10, digits)).padStart(digits, '0');
    const left = period - Math.floor(when.getTime() / 1000) % period;
    out.innerHTML = `<table class="mono">
      <tr><td>Code</td><td style="font-size:20px;letter-spacing:2px">${code}</td></tr>
      <tr><td>Valid for</td><td>${at ? 'a fixed moment' : left + ' s'}</td></tr>
      <tr><td>Counter</td><td>${counter}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', ()=>{ draw(); }));
  timer = setInterval(()=>{ if(!root.querySelector('#tpAt').value) draw(); }, 1000);
  setCleanup(()=>clearInterval(timer));
  draw();
});

dev('rsakeys','RSA Key Pair', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Modulus (bits)</label><select id="rkBits"><option>2048</option><option>3072</option><option>4096</option></select></div>
      <button class="btn primary" id="rkGo">Generate</button>
    </div>
    <div class="output" id="rkOut">Press Generate. This can take a second for 4096.</div>
    <div class="hint">RSASSA-PKCS1-v1_5, SPKI public key and PKCS#8 private key, in PEM. Generated in the page with Web Crypto and never stored — if you need it later, copy it now.</div>`;
  root.querySelector('#rkGo').addEventListener('click', async ()=>{
    const out = root.querySelector('#rkOut');
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    out.textContent = 'Generating…';
    try{
      const bits = Number(root.querySelector('#rkBits').value);
      const pair = await crypto.subtle.generateKey(
        { name:'RSASSA-PKCS1-v1_5', modulusLength: bits, publicExponent: new Uint8Array([1,0,1]), hash:'SHA-256' },
        true, ['sign','verify']);
      const pub = new Uint8Array(await crypto.subtle.exportKey('spki', pair.publicKey));
      const priv = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
      const pem = (bytes, label)=>{
        const b64 = btoa(String.fromCharCode(...bytes));
        const lines = b64.match(/.{1,64}/g).join('\n');
        return '-----BEGIN ' + label + '-----\n' + lines + '\n-----END ' + label + '-----';
      };
      out.textContent = pem(pub, 'PUBLIC KEY') + '\n\n' + pem(priv, 'PRIVATE KEY');
    }catch(e){
      out.textContent = 'Could not generate a key: ' + (e.message || e);
    }
  });
});

/* ---------------- Text (5) ---------------- */

txt('Ciphers & Encoding','xor','XOR Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Text or hex</label><textarea id="xrIn" style="min-height:90px">Hello, Kitbox</textarea></div>
    <div class="row">
      <div class="field"><label>Key (text or hex like 0x2a)</label><input type="text" id="xrKey" value="key"></div>
      <div class="field"><label>Output</label><select id="xrOut"><option value="hex">Hex</option><option value="text">Text</option><option value="b64">Base64</option></select></div>
    </div>
    <div class="output" id="xrOutBox">—</div>
    <div class="hint">XOR is its own inverse: the same key that hides the text brings it back. The Brute Force below tries every single-byte key and ranks the results by how much they look like English.</div>
    <div class="section-label" style="margin-top:16px">Single-byte brute force</div>
    <div class="segrow"><button class="btn" id="xrBrute">Try all 256</button></div>
    <div class="output" id="xrRank" style="display:none"></div>`;
  function keyBytes(){
    const k = root.querySelector('#xrKey').value;
    if(/^(0x)?[0-9a-fA-F]+$/.test(k) && (k.startsWith('0x') || k.length % 2 === 0)) {
      const h = k.replace(/^0x/, '');
      return Uint8Array.from(h.match(/.{2}/g).map(b=>parseInt(b, 16)));
    }
    return bytesFromText(k);
  }
  function xor(bytes, key){
    const out = new Uint8Array(bytes.length);
    for(let i=0;i<bytes.length;i++) out[i] = bytes[i] ^ key[i % key.length];
    return out;
  }
  function draw(){
    const key = keyBytes();
    if(!key.length){ root.querySelector('#xrOutBox').textContent = 'Give me a key.'; return; }
    const bytes = xor(bytesFromText(root.querySelector('#xrIn').value), key);
    const mode = root.querySelector('#xrOut').value;
    root.querySelector('#xrOutBox').textContent = mode === 'hex'
      ? Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join(' ')
      : mode === 'b64' ? btoa(String.fromCharCode(...bytes)) : textFromBytes(bytes);
  }
  root.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#xrBrute').addEventListener('click', ()=>{
    const bytes = bytesFromText(root.querySelector('#xrIn').value);
    const scored = [];
    for(let k=1;k<256;k++){
      const dec = xor(bytes, Uint8Array.of(k));
      let score = 0;
      for(const b of dec){
        if(b === 32) score += 3;
        else if(b >= 65 && b <= 90 || b >= 97 && b <= 122) score += 2;
        else if(b >= 32 && b < 127) score += 1;
      }
      scored.push([score / bytes.length, k, textFromBytes(dec)]);
    }
    scored.sort((a,b)=>b[0]-a[0]);
    const box = root.querySelector('#xrRank');
    box.style.display = 'block';
    box.innerHTML = `<table class="mono">${scored.slice(0,5).map(([s,k,t])=>
      `<tr><td>0x${k.toString(16).padStart(2,'0')}</td><td>${s.toFixed(2)}</td><td style="word-break:break-word">${escapeHtml(t.slice(0,60))}</td></tr>`).join('')}</table>`;
  });
  draw();
});

txt('Ciphers & Encoding','vigenere','Vigenère Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="vgIn" style="min-height:90px">Meet me at the library</textarea></div>
    <div class="field"><label>Key (letters only)</label><input type="text" id="vgKey" value="lemon"></div>
    <div class="segrow"><button class="btn primary" id="vgEnc">Encrypt</button><button class="btn" id="vgDec">Decrypt</button></div>
    <div class="output" id="vgOut">—</div>
    <div class="hint">Each letter is shifted by the key letter above it; case and punctuation are kept. It is a 16th-century cipher and breaks to frequency analysis — the Caesar tool beside it is the same idea with a key of one letter.</div>`;
  function run(dir){
    const text = root.querySelector('#vgIn').value;
    const key = root.querySelector('#vgKey').value.toLowerCase().replace(/[^a-z]/g, '');
    if(!key){ root.querySelector('#vgOut').textContent = 'The key needs at least one letter.'; return; }
    let ki = 0, out = '';
    for(const ch of text){
      const lower = ch.toLowerCase();
      if(lower >= 'a' && lower <= 'z'){
        const shift = key.charCodeAt(ki % key.length) - 97;
        ki++;
        const base = ch === lower ? 97 : 65;
        const idx = (ch.charCodeAt(0) - base + dir * shift + 26 * 26) % 26;
        out += String.fromCharCode(base + idx);
      } else out += ch;
    }
    root.querySelector('#vgOut').textContent = out;
  }
  root.querySelector('#vgEnc').addEventListener('click', ()=>run(1));
  root.querySelector('#vgDec').addEventListener('click', ()=>run(-1));
  run(1);
});

txt('Analysis Tools','entropy','Shannon Entropy', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="enIn" style="min-height:100px">correct horse battery staple</textarea></div>
    <div class="output" id="enOut">—</div>
    <div class="hint">Bits of entropy per byte, and the total. Text near 4.5 bits/byte is prose; near 8 is random or compressed; a constant is 0. The reading is about the bytes, not about whether the password is good.</div>`;
  function draw(){
    const bytes = bytesFromText(root.querySelector('#enIn').value);
    if(!bytes.length){ root.querySelector('#enOut').textContent = '—'; return; }
    const counts = new Map();
    for(const b of bytes) counts.set(b, (counts.get(b) || 0) + 1);
    let h = 0;
    for(const n of counts.values()){ const p = n / bytes.length; h -= p * Math.log2(p); }
    const total = h * bytes.length;
    root.querySelector('#enOut').innerHTML = `<table class="mono">
      <tr><td>Bytes</td><td>${bytes.length}</td></tr>
      <tr><td>Distinct byte values</td><td>${counts.size}</td></tr>
      <tr><td>Entropy per byte</td><td>${h.toFixed(3)} bits</td></tr>
      <tr><td>Entropy of this text</td><td>${total.toFixed(1)} bits</td></tr>
      <tr><td>Reading</td><td>${h < 1 ? 'very repetitive' : h < 4 ? 'structured' : h < 6 ? 'prose-like' : h < 7.5 ? 'dense' : 'random or compressed'}</td></tr>
    </table>`;
  }
  root.querySelector('#enIn').addEventListener('input', draw);
  draw();
});

txt('Ciphers & Encoding','ascii85','Ascii85', root=>{
  root.innerHTML = `
    <div class="field"><label>Text or Ascii85</label><textarea id="a85In" style="min-height:90px">Hello, Kitbox</textarea></div>
    <div class="segrow"><button class="btn primary" id="a85Enc">Encode</button><button class="btn" id="a85Dec">Decode</button></div>
    <div class="output" id="a85Out" style="word-break:break-all">—</div>
    <div class="hint">Base85 packs four bytes into five characters, so it is about a quarter smaller than Base64. Adobe wraps it in &lt;~ ~&gt;; that form is accepted on decode.</div>`;
  function enc(bytes){
    let out = '', i = 0;
    for(; i + 4 <= bytes.length; i += 4){
      let n = ((bytes[i]<<24) | (bytes[i+1]<<16) | (bytes[i+2]<<8) | bytes[i+3]) >>> 0;
      if(n === 0){ out += 'z'; continue; }
      let chunk = '';
      for(let j=0;j<5;j++){ chunk = String.fromCharCode(33 + n % 85) + chunk; n = Math.floor(n / 85); }
      out += chunk;
    }
    const rest = bytes.length - i;
    if(rest){
      const buf = new Uint8Array(4);
      buf.set(bytes.slice(i));
      let n = ((buf[0]<<24) | (buf[1]<<16) | (buf[2]<<8) | buf[3]) >>> 0;
      let chunk = '';
      for(let j=0;j<5;j++){ chunk = String.fromCharCode(33 + n % 85) + chunk; n = Math.floor(n / 85); }
      out += chunk.slice(0, rest + 1);
    }
    return out;
  }
  function dec(text){
    let s = text.replace(/\s/g, '').replace(/^<~/, '').replace(/~>$/, '');
    const out = [];
    let group = [];
    for(const ch of s){
      if(ch === 'z' && group.length === 0){ out.push(0,0,0,0); continue; }
      const v = ch.charCodeAt(0) - 33;
      if(v < 0 || v > 84) throw new Error('not an Ascii85 character: ' + ch);
      group.push(v);
      if(group.length === 5){
        let n = 0;
        for(const g of group) n = n * 85 + g;
        out.push((n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255);
        group = [];
      }
    }
    if(group.length){
      const pad = 5 - group.length;
      while(group.length < 5) group.push(84);
      let n = 0;
      for(const g of group) n = n * 85 + g;
      const bytes = [(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255];
      out.push(...bytes.slice(0, 4 - pad));
    }
    return new Uint8Array(out);
  }
  root.querySelector('#a85Enc').addEventListener('click', ()=>{
    root.querySelector('#a85Out').textContent = enc(bytesFromText(root.querySelector('#a85In').value));
  });
  root.querySelector('#a85Dec').addEventListener('click', ()=>{
    try{ root.querySelector('#a85Out').textContent = textFromBytes(dec(root.querySelector('#a85In').value)); }
    catch(e){ root.querySelector('#a85Out').textContent = 'Not valid Ascii85: ' + e.message; }
  });
  root.querySelector('#a85Enc').click();
});

txt('Ciphers & Encoding','unicodeescape','Unicode Escapes', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="ueIn" style="min-height:90px">naïve — 你好 — 🧰</textarea></div>
    <div class="segrow">
      <button class="btn" data-ue="u">Escape \\uXXXX</button>
      <button class="btn" data-ue="x">Escape \\xXX</button>
      <button class="btn" data-ue="html">HTML entities</button>
      <button class="btn primary" data-ue="unescape">Unescape all</button>
    </div>
    <div class="output" id="ueOut" style="word-break:break-word">—</div>
    <div class="hint">Astral characters become surrogate pairs in \\u form, which is what a JavaScript string actually holds. Unescape reads \\uXXXX, \\xXX, &#NN; and &#xNN; together.</div>`;
  root.querySelectorAll('[data-ue]').forEach(b=>b.addEventListener('click', ()=>{
    const v = root.querySelector('#ueIn').value;
    const out = root.querySelector('#ueOut');
    const mode = b.dataset.ue;
    if(mode === 'unescape'){
      out.textContent = v
        .replace(/\\u\{([0-9a-fA-F]+)\}/g, (m,h)=>String.fromCodePoint(parseInt(h,16)))
        .replace(/\\u([0-9a-fA-F]{4})/g, (m,h)=>String.fromCharCode(parseInt(h,16)))
        .replace(/\\x([0-9a-fA-F]{2})/g, (m,h)=>String.fromCharCode(parseInt(h,16)))
        .replace(/&#x([0-9a-fA-F]+);/g, (m,h)=>String.fromCodePoint(parseInt(h,16)))
        .replace(/&#(\d+);/g, (m,d)=>String.fromCodePoint(Number(d)));
      return;
    }
    if(mode === 'html'){ out.textContent = [...v].map(ch=>'&#' + ch.codePointAt(0) + ';').join(''); return; }
    if(mode === 'u'){
      out.textContent = [...v].map(ch=>{
        const cp = ch.codePointAt(0);
        if(cp > 0xFFFF){
          const hi = 0xD800 + ((cp - 0x10000) >> 10), lo = 0xDC00 + ((cp - 0x10000) & 0x3FF);
          return '\\u' + hi.toString(16).padStart(4,'0') + '\\u' + lo.toString(16).padStart(4,'0');
        }
        return cp < 128 ? ch : '\\u' + cp.toString(16).padStart(4,'0');
      }).join('');
      return;
    }
    out.textContent = [...v].map(ch=>{
      const cp = ch.codePointAt(0);
      return cp < 128 ? ch : Array.from(bytesFromText(ch)).map(b=>'\\x' + b.toString(16).padStart(2,'0')).join('');
    }).join('');
  }));
  root.querySelector('[data-ue="u"]').click();
});

/* ---------------- Generator (1) ---------------- */

gen('placeholder','SVG Placeholder', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Width</label><input type="number" id="phW" value="1200"></div>
      <div class="field"><label>Height</label><input type="number" id="phH" value="630"></div>
      <div class="field"><label>Background</label><input type="color" id="phBg" value="#0b0e14"></div>
      <div class="field"><label>Text colour</label><input type="color" id="phFg" value="#e8eaee"></div>
    </div>
    <div class="field"><label>Label</label><input type="text" id="phText" value="1200 × 630"></div>
    <div id="phPreview" style="margin:12px 0;border:1px solid var(--line);background:#fff;padding:8px"></div>
    <div class="segrow"><button class="btn primary" id="phGo">Download SVG</button></div>
    <div class="hint">A placeholder that weighs bytes instead of megabytes — useful for a design that is not ready, and it scales to any size without going soft.</div>`;
  function svg(){
    const w = Math.max(8, Number(root.querySelector('#phW').value) || 800);
    const h = Math.max(8, Number(root.querySelector('#phH').value) || 600);
    const bg = root.querySelector('#phBg').value, fg = root.querySelector('#phFg').value;
    const text = escapeHtml(root.querySelector('#phText').value || (w + ' × ' + h));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${text}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <text x="50%" y="50%" fill="${fg}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="${Math.max(12, Math.round(Math.min(w,h)/10))}" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
  }
  function draw(){ root.querySelector('#phPreview').innerHTML = svg().replace('<svg ', '<svg style="max-width:100%;height:auto" '); }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#phGo').addEventListener('click', ()=>{
    const blob = new Blob([svg()], { type:'image/svg+xml' });
    saveBlob(blob, 'placeholder-' + root.querySelector('#phW').value + 'x' + root.querySelector('#phH').value + '.svg');
  });
  draw();
});
