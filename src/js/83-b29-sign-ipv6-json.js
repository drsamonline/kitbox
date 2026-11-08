/* ================================================================
   B29 — signing, IPv6, and querying JSON by path.
   ================================================================ */

/* ---------------- Development (3) ---------------- */

dev('rsasign','RSA Sign / Verify', root=>{
  root.innerHTML = `
    <div class="segrow" id="sgMode">
      <button class="btn" data-sg="sign">Sign with a private key</button>
      <button class="btn" data-sg="verify">Verify with a public key</button>
    </div>
    <div class="field"><label id="sgKeyLabel">Private key (PEM)</label><textarea id="sgKey" style="min-height:90px;font-family:var(--mono)" placeholder="-----BEGIN PRIVATE KEY-----"></textarea></div>
    <div class="field"><label id="sgMsgLabel">Message</label><textarea id="sgMsg" style="min-height:70px">The result is normal.</textarea></div>
    <div class="field" id="sgSigRow" style="display:none"><label>Signature (base64)</label><textarea id="sgSig" style="min-height:60px;font-family:var(--mono)"></textarea></div>
    <div class="row">
      <div class="field"><label>Algorithm</label><select id="sgAlg"><option value="RSASSA-PKCS1-v1_5">RSASSA-PKCS1-v1_5</option><option value="RSA-PSS">RSA-PSS</option></select></div>
      <div class="field"><label>Hash</label><select id="sgHash"><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></div>
    </div>
    <div class="segrow"><button class="btn primary" id="sgGo">Run</button></div>
    <div class="output" id="sgOut">—</div>
    <div class="hint">Signing proves the message came from whoever holds the private key; encryption hides it from everyone else. Different jobs, and this is the first one. The signature is over the bytes you paste, not over a hash of them — the algorithm hashes internally.</div>`;
  let mode = 'sign';
  const pemToDer = pem => {
    const m = pem.match(/-----BEGIN [^-]+-----([\s\S]*?)-----END [^-]+-----/);
    if(!m) throw new Error('that does not look like a PEM block');
    return Uint8Array.from(atob(m[1].replace(/\s+/g, '')), c=>c.charCodeAt(0));
  };
  root.querySelectorAll('[data-sg]').forEach(b=>b.addEventListener('click', ()=>{
    mode = b.dataset.sg;
    root.querySelector('#sgKeyLabel').textContent = mode === 'sign' ? 'Private key (PEM)' : 'Public key (PEM)';
    root.querySelector('#sgKey').placeholder = mode === 'sign' ? '-----BEGIN PRIVATE KEY-----' : '-----BEGIN PUBLIC KEY-----';
    root.querySelector('#sgSigRow').style.display = mode === 'verify' ? 'block' : 'none';
    root.querySelector('#sgMsgLabel').textContent = mode === 'sign' ? 'Message' : 'Message that was signed';
    root.querySelector('#sgOut').textContent = '—';
  }));
  root.querySelector('#sgGo').addEventListener('click', async ()=>{
    const out = root.querySelector('#sgOut');
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    const alg = root.querySelector('#sgAlg').value;
    const hash = root.querySelector('#sgHash').value;
    const keyText = root.querySelector('#sgKey').value;
    const msg = bytesFromText(root.querySelector('#sgMsg').value);
    if(!keyText.trim()){ out.textContent = 'Paste a key.'; return; }
    try{
      if(mode === 'sign'){
        const params = alg === 'RSA-PSS'
          ? { name:'RSA-PSS', hash, saltLength: hash === 'SHA-256' ? 32 : hash === 'SHA-384' ? 48 : 64 }
          : { name:'RSASSA-PKCS1-v1_5', hash };
        const key = await crypto.subtle.importKey('pkcs8', pemToDer(keyText), params, false, ['sign']);
        const sig = new Uint8Array(await crypto.subtle.sign(params, key, msg));
        out.innerHTML = `<table class="mono">
          <tr><td>Signature (base64)</td><td style="word-break:break-all">${btoa(String.fromCharCode(...sig))}</td></tr>
          <tr><td>Length</td><td>${sig.length} bytes — the key size, always</td></tr>
          <tr><td>Algorithm</td><td>${alg} with ${hash}</td></tr>
        </table>`;
      } else {
        const sigText = root.querySelector('#sgSig').value.replace(/\s+/g, '');
        if(!sigText){ out.textContent = 'Paste the signature to verify.'; return; }
        const sig = Uint8Array.from(atob(sigText), c=>c.charCodeAt(0));
        const params = alg === 'RSA-PSS'
          ? { name:'RSA-PSS', hash, saltLength: hash === 'SHA-256' ? 32 : hash === 'SHA-384' ? 48 : 64 }
          : { name:'RSASSA-PKCS1-v1_5', hash };
        const key = await crypto.subtle.importKey('spki', pemToDer(keyText), params, false, ['verify']);
        const valid = await crypto.subtle.verify(params, key, sig, msg);
        out.innerHTML = `<table class="mono">
          <tr><td>Result</td><td style="color:${valid ? '#1a7f37' : '#c0392b'}"><b>${valid ? 'valid signature' : 'does not match'}</b></td></tr>
          <tr><td>Algorithm</td><td>${alg} with ${hash}</td></tr>
        </table>
        ${valid ? '' : '<div class="hint">A mismatch means the message, the key or the algorithm changed — check the hash first, because the wrong hash is the usual cause.</div>'}`;
      }
    }catch(e){ out.textContent = 'That did not work: ' + (e.message || e); }
  });
});

dev('ipv6','IPv6 Header & ICMPv6', root=>{
  root.innerHTML = `
    <div class="field"><label>Header bytes (hex)</label><textarea id="i6In" style="min-height:100px;font-family:var(--mono)">60 00 00 00 00 20 3a 40 20 01 0d b8 00 00 00 00 00 00 00 00 00 00 00 01 20 01 0d b8 00 00 00 00 00 00 00 00 00 00 00 02</textarea></div>
    <div class="output" id="i6Out">—</div>
    <div class="hint">The fixed 40-byte IPv6 header: traffic class, flow label, payload length, next header and the two addresses in full. There is no checksum in IPv6 — that is not a bug in this parser.</div>
    <div class="section-label" style="margin-top:16px">Address expander</div>
    <div class="field"><label>IPv6 address</label><input type="text" id="i6Addr" value="2001:db8::1" style="font-family:var(--mono)"></div>
    <div class="output" id="i6AddrOut">—</div>`;
  function parseHex(text){
    const hex = text.replace(/[^0-9a-fA-F]/g, '');
    if(hex.length % 2) throw new Error('an odd number of hex digits');
    return Uint8Array.from(hex.match(/.{2}/g).map(h=>parseInt(h, 16)));
  }
  function addr(b, off){
    const parts = [];
    for(let i=0;i<8;i++) parts.push(((b[off+i*2] << 8) | b[off+i*2+1]).toString(16).padStart(4, '0'));
    return parts.join(':');
  }
  const NEXT = { 0:'hop-by-hop options', 6:'TCP', 17:'UDP', 43:'routing', 44:'fragment', 50:'ESP', 51:'AH', 58:'ICMPv6', 59:'no next header', 60:'destination options' };
  function draw(){
    const out = root.querySelector('#i6Out');
    let b;
    try{ b = parseHex(root.querySelector('#i6In').value); }
    catch(e){ out.textContent = 'Could not read that hex: ' + e.message; return; }
    if(b.length < 40){ out.textContent = 'An IPv6 header is 40 bytes; that is ' + b.length + '.'; return; }
    const version = b[0] >> 4;
    const trafficClass = ((b[0] & 0x0f) << 4) | (b[1] >> 4);
    const flowLabel = ((b[1] & 0x0f) << 16) | (b[2] << 8) | b[3];
    const payloadLength = (b[4] << 8) | b[5];
    const nextHeader = b[6];
    const hopLimit = b[7];
    out.innerHTML = `<table class="mono">
      <tr><td>Version</td><td>${version}${version !== 6 ? ' — that is not IPv6' : ''}</td></tr>
      <tr><td>Traffic class</td><td>0x${trafficClass.toString(16).padStart(2, '0')}</td></tr>
      <tr><td>Flow label</td><td>0x${flowLabel.toString(16).padStart(5, '0')}</td></tr>
      <tr><td>Payload length</td><td>${payloadLength} bytes</td></tr>
      <tr><td>Next header</td><td>${nextHeader} — ${NEXT[nextHeader] || 'other'}</td></tr>
      <tr><td>Hop limit</td><td>${hopLimit}</td></tr>
      <tr><td>Source</td><td style="word-break:break-all">${addr(b, 8)}</td></tr>
      <tr><td>Destination</td><td style="word-break:break-all">${addr(b, 24)}</td></tr>
    </table>`;
  }
  function drawAddr(){
    const out = root.querySelector('#i6AddrOut');
    const v = root.querySelector('#i6Addr').value.trim();
    try{
      const halves = v.split('::');
      if(halves.length > 2) throw new Error('more than one :: in the address');
      const left = halves[0] ? halves[0].split(':') : [];
      const right = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
      const missing = 8 - left.length - right.length;
      if(halves.length === 2 && missing < 0) throw new Error('too many groups');
      const groups = halves.length === 2 ? [...left, ...Array(missing).fill('0'), ...right] : left;
      if(groups.length !== 8) throw new Error('an IPv6 address has eight groups of 16 bits');
      const nums = groups.map(g=>{
        if(!/^[0-9a-fA-F]{1,4}$/.test(g)) throw new Error('"' + g + '" is not a hex group');
        return parseInt(g, 16);
      });
      const full = nums.map(n=>n.toString(16).padStart(4, '0')).join(':');
      const bytes = nums.flatMap(n=>[(n >> 8) & 0xff, n & 0xff]);
      const first = nums[0];
      const kind = first === 0xfe80 ? 'link-local' : (first & 0xfe00) === 0xfc00 ? 'unique local (ULA)'
        : (first & 0xff00) === 0xff00 ? 'multicast' : first === 0x2001 && nums[1] === 0x0db8 ? 'documentation'
        : (first & 0xe000) === 0x2000 ? 'global unicast' : 'other';
      out.innerHTML = `<table class="mono">
        <tr><td>Full form</td><td style="word-break:break-all">${full}</td></tr>
        <tr><td>Compressed</td><td>${v}</td></tr>
        <tr><td>Type</td><td>${kind}</td></tr>
        <tr><td>Bytes</td><td style="word-break:break-all">${bytes.map(x=>x.toString(16).padStart(2,'0')).join(' ')}</td></tr>
        <tr><td>Interface ID</td><td>${nums.slice(4).map(n=>n.toString(16).padStart(4,'0')).join(':')}</td></tr>
      </table>`;
    }catch(e){ out.textContent = 'Not an IPv6 address: ' + e.message; }
  }
  root.querySelector('#i6In').addEventListener('input', draw);
  root.querySelector('#i6Addr').addEventListener('input', drawAddr);
  draw(); drawAddr();
});

dev('jsonpath','JSONPath Query', root=>{
  root.innerHTML = `
    <div class="field"><label>JSON</label><textarea id="jpIn" style="min-height:130px">{"store":{"book":[{"title":"A","price":8.95},{"title":"B","price":12.99}],"bicycle":{"color":"red","price":19.95}}}</textarea></div>
    <div class="row">
      <div class="field"><label>Path</label><input type="text" id="jpPath" value="$.store.book[*].title" style="font-family:var(--mono)"></div>
      <button class="btn primary" id="jpGo">Query</button>
    </div>
    <div class="output" id="jpOut">—</div>
    <div class="hint">A deliberate subset: <span class="mono">$</span>, <span class="mono">.key</span>, <span class="mono">[0]</span>, <span class="mono">[*]</span>, <span class="mono">..key</span> for a deep search, and <span class="mono">[?(@.price &gt; 10)]</span> for a filter. It says when it meets a path it does not implement rather than quietly returning nothing.</div>`;
  function query(data, path){
    if(!path.startsWith('$')) throw new Error('a path starts with $');
    let nodes = [data];
    let rest = path.slice(1);
    const tokenRe = /(\.\.[A-Za-z_$][\w$]*)|(\.\*)|(\.[A-Za-z_$][\w$]*)|(\[\*])|(\[\d+\])|(\[\?\([^\]]+\)\])|(\[['"][^'"]+['"]\])/g;
    let match;
    let consumed = 0;
    while((match = tokenRe.exec(rest))){
      if(match.index !== consumed) throw new Error('could not read "' + rest.slice(consumed, match.index) + '"');
      consumed = match.index + match[0].length;
      const tok = match[0];
      if(tok.startsWith('..')){                       // recursive descent
        const key = tok.slice(2);
        const found = [];
        (function walk(n){
          if(n && typeof n === 'object'){
            if(!Array.isArray(n) && Object.prototype.hasOwnProperty.call(n, key)) found.push(n[key]);
            Object.values(n).forEach(walk);
          }
        })(nodes.length === 1 ? nodes[0] : { root: nodes });
        nodes = found;
      } else if(tok === '.*' || tok === '[*]'){
        nodes = nodes.flatMap(n=> n && typeof n === 'object' ? Object.values(n) : []);
      } else if(tok.startsWith('[') && /^\[\d+\]$/.test(tok)){
        const i = Number(tok.slice(1, -1));
        nodes = nodes.map(n=> Array.isArray(n) ? n[i] : n && n[i]).filter(n=>n !== undefined);
      } else if(tok.startsWith("[?'") || tok.startsWith('[?')){
        // the token is [?(@.price > 10)] — strip the wrapper and the parentheses
        const expr = tok.slice(2, -1).replace(/^\(/, '').replace(/\)$/, '').trim();
        const m = expr.match(/^@\.([\w$]+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
        if(!m) throw new Error('only @.field <op> value filters are supported');
        const [, key, op, raw] = m;
        const want = /^['"].*['"]$/.test(raw) ? raw.slice(1, -1) : Number(raw);
        nodes = nodes.flatMap(n=> Array.isArray(n) ? n : [n]).filter(item=>{
          const v = item && item[key];
          switch(op){
            case '>': return v > want; case '<': return v < want;
            case '>=': return v >= want; case '<=': return v <= want;
            case '==': return v === want || String(v) === String(want);
            case '!=': return v !== want && String(v) !== String(want);
            default: return false;
          }
        });
      } else if(tok.startsWith("['") || tok.startsWith('["')){
        const key = tok.slice(2, -1);
        nodes = nodes.map(n=> n && n[key]).filter(n=>n !== undefined);
      } else {
        const key = tok.slice(1);
        nodes = nodes.map(n=> n && typeof n === 'object' ? n[key] : undefined).filter(n=>n !== undefined);
      }
    }
    if(consumed !== rest.length) throw new Error('could not read "' + rest.slice(consumed) + '"');
    return nodes;
  }
  function draw(){
    const out = root.querySelector('#jpOut');
    let data;
    try{ data = JSON.parse(root.querySelector('#jpIn').value); }
    catch(e){ out.textContent = 'That is not valid JSON: ' + e.message; return; }
    try{
      const results = query(data, root.querySelector('#jpPath').value.trim());
      out.innerHTML = results.length
        ? `<table class="mono"><tr><th>#</th><th style="text-align:left">Value</th></tr>
            ${results.slice(0, 50).map((r, i)=>`<tr><td>${i}</td><td style="word-break:break-all">${escapeHtml(typeof r === 'string' ? r : JSON.stringify(r))}</td></tr>`).join('')}
          </table>${results.length > 50 ? '<div class="hint">First 50 of ' + results.length + '.</div>' : '<div class="hint">' + results.length + ' match(es).</div>'}`
        : '<div class="hint">No matches. A missing key and a wrong path look the same here, so check the path before the data.</div>';
    }catch(e){ out.textContent = e.message; }
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#jpGo').addEventListener('click', draw);
  draw();
});
