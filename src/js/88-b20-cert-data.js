/* ================================================================
   B20 — the ASN.1 parser pays for itself: a certificate reader, plus three
   tools that turn a sample into something usable.

   B21 — resistor bands, buffer pH, ekadashi.
   B22 — three games, because a toolbox with no games is a toolbox nobody
   opens on a Sunday.
   ================================================================ */

/* ---------------- Development (4) ---------------- */

dev('x509','X.509 Certificate Reader', root=>{
  root.innerHTML = `
    <div class="field"><label>Certificate (PEM or DER hex)</label><textarea id="xcIn" style="min-height:120px" placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----"></textarea></div>
    <div class="output" id="xcOut">Paste a certificate above.</div>
    <div class="hint">Reads the certificate and shows what it says — subject, issuer, validity, key, and the names it is valid for. It does <b>not</b> verify the signature or check whether the certificate is trusted; that needs the issuer's key and a trust store, and a browser does it better than this page can.</div>`;
  function pemToBytes(text){
    const m = text.match(/-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/);
    const body = m ? m[1] : null;
    if(body){
      const b64 = body.replace(/\s+/g, '');
      return Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
    }
    const hex = text.replace(/[^0-9a-fA-F]/g, '');
    if(hex.length > 40 && hex.length % 2 === 0) return Uint8Array.from(hex.match(/.{2}/g).map(h=>parseInt(h, 16)));
    return null;
  }
  const OID_NAMES = {
    '2.5.4.3':'CN', '2.5.4.6':'C', '2.5.4.7':'L', '2.5.4.8':'ST', '2.5.4.10':'O', '2.5.4.11':'OU',
    '2.5.4.5':'serialNumber', '1.2.840.113549.1.9.1':'emailAddress'
  };
  function walk(node, out){
    for(const k of node.kids){ out.push(k); walk(k, out); }
    return out;
  }
  function draw(){
    const out = root.querySelector('#xcOut');
    const bytes = pemToBytes(root.querySelector('#xcIn').value);
    if(!bytes){ out.textContent = 'That is neither a PEM block nor DER hex.'; return; }
    try{
      const tree = parseASN1(bytes, 0, bytes.length, 0);
      const cert = tree[0];
      if(!cert || cert.tag !== 0x30) throw new Error('the outer structure is not a SEQUENCE');
      const tbs = cert.kids[0];
      const flat = walk(cert, []);
      // version [0] is optional; serial is the first INTEGER after it
      // The serial is the first INTEGER that is a direct child of the TBS
      // structure. Taking the first INTEGER anywhere finds the version number
      // inside the [0] wrapper instead, which is what a certificate prints as
      // "serial 0x02" if you are not careful.
      const tbsKids = tbs ? tbs.kids : [];
      const serial = tbsKids.find(n=>n.tag === 0x02);
      const sigAlg = cert.kids[1] && cert.kids[1].kids[0];
      // the validity is the SEQUENCE with two time values
      const times = flat.filter(n=>n.tag === 0x17 || n.tag === 0x18);
      const parseTime = n => {
        const t = n.text;
        if(n.tag === 0x17){
          const yy = Number(t.slice(0, 2));
          const year = yy < 50 ? 2000 + yy : 1900 + yy;
          return new Date(Date.UTC(year, Number(t.slice(2,4))-1, Number(t.slice(4,6)),
            Number(t.slice(6,8) || 0), Number(t.slice(8,10) || 0), Number(t.slice(10,12) || 0)));
        }
        return new Date(Date.UTC(Number(t.slice(0,4)), Number(t.slice(4,6))-1, Number(t.slice(6,8)),
          Number(t.slice(8,10) || 0), Number(t.slice(10,12) || 0), Number(t.slice(12,14) || 0)));
      };
      // name: SEQUENCE of SET of SEQUENCE{ OID, value }
      function readName(node){
        const parts = [];
        const collect = n => {
          for(const k of n.kids || []){
            if(k.tag === 0x30 && k.kids.length === 2 && k.kids[0].tag === 0x06){
              parts.push((OID_NAMES[k.kids[0].text] || k.kids[0].text) + '=' + k.kids[1].text);
            } else collect(k);
          }
        };
        if(node) collect(node);
        return parts;
      }
      const names = flat.filter(n=>n.tag === 0x30 && n.kids.length && n.kids.every(k=>k.tag === 0x31));
      const subjectParts = readName(names[0]);
      const issuerParts = readName(names[1]);
      // The public key is the BIT STRING that is a direct child of the TBS
      // structure. The first BIT STRING anywhere in the file is the signature
      // value at the end of the certificate.
      // subjectPublicKeyInfo is the SEQUENCE of { algorithm, BIT STRING }, so
      // the key is one level down — not a direct child of the TBS structure.
      const spkiNode = tbsKids.find(n=>n.tag === 0x30 && n.kids.length === 2 && n.kids[1] && n.kids[1].tag === 0x03);
      const keyBits = spkiNode ? spkiNode.kids[1] : null;
      let keyInfo = '';
      if(spkiNode){
        // The algorithm OID sits in the SEQUENCE's first child; the BIT STRING's
        // payload is the RSAPublicKey itself — SEQUENCE { modulus, exponent } —
        // so the modulus length is the key size.
        const algOid = spkiNode.kids[0] && spkiNode.kids[0].kids[0] && spkiNode.kids[0].kids[0].text;
        const name = algOid === '1.2.840.113549.1.1.1' ? 'RSA'
          : algOid === '1.2.840.10045.2.1' ? 'ECDSA'
          : algOid === '1.2.840.10040.4.1' ? 'DSA' : (algOid || 'unknown algorithm');
        let bits = 0;
        try{
          const inner = parseASN1(keyBits.raw.slice(1), 0, keyBits.raw.length - 1, 0);
          const first = inner[0] && inner[0].kids[0];
          // DER pads a positive INTEGER with a leading zero byte, which would
          // report a 2048-bit key as 2056.
          if(first){
            const raw = first.raw.length && first.raw[0] === 0 ? first.raw.slice(1) : first.raw;
            bits = raw.length * 8;
          }
        }catch(e){}
        keyInfo = name + (bits ? ' · ' + bits + ' bits' : '');
      }
      // SANs live in the extension with OID 2.5.29.17
      const san = [];
      flat.forEach(n=>{
        if(n.tag !== 0x04 || n.raw.length < 4) return;
        try{
          const inner = parseASN1(n.raw, 0, n.raw.length, 0);
          const seq = inner.find(x=>x.tag === 0x30);
          if(!seq) return;
          seq.kids.forEach(k=>{
            if(k.tag === 0x82) san.push(textFromBytes(k.raw));              // dNSName
            else if(k.tag === 0x87) san.push(Array.from(k.raw).join('.'));  // iPAddress
            else if(k.tag === 0x81) san.push('mailto:' + textFromBytes(k.raw));
          });
        }catch(e){}
      });
      const notBefore = times[0] ? parseTime(times[0]) : null;
      const notAfter = times[1] ? parseTime(times[1]) : null;
      const now = new Date();
      out.innerHTML = `<table class="mono">
        <tr><td>Subject</td><td>${escapeHtml(subjectParts.join(', '))}</td></tr>
        <tr><td>Issuer</td><td>${escapeHtml(issuerParts.join(', '))}</td></tr>
        <tr><td>Serial</td><td style="word-break:break-all">${escapeHtml(serial ? serial.text : '—')}</td></tr>
        <tr><td>Not before</td><td>${notBefore ? notBefore.toISOString().replace('T',' ').slice(0,19) + ' UTC' : '—'}</td></tr>
        <tr><td>Not after</td><td>${notAfter ? notAfter.toISOString().replace('T',' ').slice(0,19) + ' UTC' : '—'}</td></tr>
        <tr><td>Status</td><td>${notAfter && notBefore ? (now < notBefore ? 'not yet valid' : now > notAfter ? 'expired' : 'within its validity period') : 'unknown'}</td></tr>
        <tr><td>Signature algorithm</td><td>${escapeHtml(sigAlg ? sigAlg.text : '—')}</td></tr>
        <tr><td>Key</td><td>${escapeHtml(keyInfo || '—')}</td></tr>
        <tr><td>Names</td><td>${san.length ? escapeHtml(san.join(', ')) : 'none listed'}</td></tr>
        <tr><td>Self-signed?</td><td>${subjectParts.join() === issuerParts.join() ? 'yes — subject and issuer match' : 'no'}</td></tr>
      </table>
      <div class="hint">Validity and names are read from the certificate itself. Nothing here is verified — a certificate is a claim, and only the issuer's signature turns it into evidence.</div>`;
    }catch(e){
      out.innerHTML = `<div class="hint">Could not read that certificate: ${escapeHtml(e.message)}</div>`;
    }
  }
  root.querySelector('#xcIn').addEventListener('input', draw);
});

dev('jsonschema','JSON Schema From a Sample', root=>{
  root.innerHTML = `
    <div class="field"><label>Sample JSON</label><textarea id="jsSample" style="min-height:140px">{"id": 42, "name": "Kitbox", "tags": ["offline", "single-file"], "meta": {"stars": 12, "active": true}, "note": null}</textarea></div>
    <div class="row">
      <div class="field"><label>Draft</label><select id="jsDraft"><option value="2020-12">2020-12</option><option value="draft-07">draft-07</option></select></div>
      <div class="field"><label>Mark fields required?</label><select id="jsReq"><option value="1">Yes — everything present</option><option value="0">No</option></select></div>
    </div>
    <div class="output" id="jsOut" style="white-space:pre-wrap;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">Infers a schema from one example, which is exactly as trustworthy as one example: a field that is null here becomes "any type", and a field that is a string today could be a number tomorrow. Useful as a starting point, never as a specification.</div>`;
  function infer(v){
    if(v === null) return { type: ['null', 'string', 'number', 'boolean', 'object', 'array'] };
    if(Array.isArray(v)){
      const itemSchemas = v.map(infer);
      const uniq = new Map();
      itemSchemas.forEach(s=>uniq.set(JSON.stringify(s), s));
      return { type:'array', items: uniq.size === 1 ? [...uniq.values()][0] : { anyOf: [...uniq.values()] } };
    }
    if(typeof v === 'object'){
      const props = {}, required = [];
      for(const k of Object.keys(v)){ props[k] = infer(v[k]); required.push(k); }
      return { type:'object', properties: props, required };
    }
    if(typeof v === 'number') return Number.isInteger(v) ? { type:'integer' } : { type:'number' };
    if(typeof v === 'boolean') return { type:'boolean' };
    const s = { type:'string' };
    if(/^\d{4}-\d{2}-\d{2}$/.test(v)) s.format = 'date';
    else if(/^\d{4}-\d{2}-\d{2}T/.test(v)) s.format = 'date-time';
    else if(/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v)) s.format = 'email';
    else if(/^https?:\/\//.test(v)) s.format = 'uri';
    return s;
  }
  function draw(){
    const out = root.querySelector('#jsOut');
    let sample;
    try{ sample = JSON.parse(root.querySelector('#jsSample').value); }
    catch(e){ out.textContent = 'That is not valid JSON: ' + e.message; return; }
    const schema = infer(sample);
    const rootSchema = { $schema: 'https://json-schema.org/draft/' + root.querySelector('#jsDraft').value + '/schema', ...schema };
    if(root.querySelector('#jsReq').value === '0') delete rootSchema.required;
    out.textContent = JSON.stringify(rootSchema, null, 2);
  }
  root.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('regexexplain','Regex Explainer', root=>{
  root.innerHTML = `
    <div class="field"><label>Pattern</label><input type="text" id="rxIn" value="^(\\d{4})-(\\d{2})-(\\d{2})$" style="font-family:var(--mono)"></div>
    <div class="field"><label>Test string</label><input type="text" id="rxTest" value="2026-11-08"></div>
    <div class="output" id="rxOut">—</div>
    <div class="hint">A token-by-token reading, not a full engine: it explains the pieces that people get wrong — anchors, groups, quantifiers, character classes, lookarounds — and says when a token is something it does not recognise rather than guessing.</div>`;
  const NAMED = {
    '\\d':'any digit (0–9)', '\\D':'anything but a digit', '\\w':'a word character (letter, digit, underscore)',
    '\\W':'anything but a word character', '\\s':'whitespace', '\\S':'anything but whitespace',
    '\\b':'a word boundary', '\\B':'not a word boundary', '.':'any character except a newline',
    '^':'start of the string (or line, with m)', '$':'end of the string (or line, with m)',
    '\\n':'a newline', '\\t':'a tab', '|':'alternation — either side'
  };
  function explain(pattern){
    const out = [];
    let i = 0;
    while(i < pattern.length){
      const ch = pattern[i];
      let token = ch, note = '';
      if(ch === '\\'){
        token = pattern.slice(i, i+2); i += 2;
        note = NAMED[token] || ('an escape: a literal ' + token.slice(1));
        // \uXXXX, \xXX, \p{...}
        if(token[1] === 'u'){ token = pattern.slice(i-2, i+4); i += 4; note = 'the character U+' + token.slice(2).toUpperCase(); }
        else if(token[1] === 'x'){ token = pattern.slice(i-2, i+2); i += 2; note = 'the character 0x' + token.slice(2); }
        else if(token[1] === 'p'){ const close = pattern.indexOf('}', i); token = pattern.slice(i-2, close+1); i = close+1; note = 'a Unicode property: ' + token.slice(3, -1); }
      } else if(ch === '['){
        let j = i + 1;
        while(j < pattern.length && pattern[j] !== ']'){ if(pattern[j] === '\\') j++; j++; }
        token = pattern.slice(i, j+1); i = j + 1;
        const inner = token.slice(1, -1);
        note = inner.startsWith('^') ? 'one character that is NOT in: ' + inner.slice(1) : 'one character from: ' + inner;
      } else if(ch === '('){
        let kind = 'a capturing group';
        let skip = 1;
        if(pattern.startsWith('(?:', i)){ kind = 'a non-capturing group'; skip = 3; }
        else if(pattern.startsWith('(?=', i)){ kind = 'a lookahead — the text must match but is not consumed'; skip = 3; }
        else if(pattern.startsWith('(?!', i)){ kind = 'a negative lookahead — the text must not match here'; skip = 3; }
        else if(pattern.startsWith('(?<=', i)){ kind = 'a lookbehind — what precedes must match'; skip = 4; }
        else if(pattern.startsWith('(?<!', i)){ kind = 'a negative lookbehind'; skip = 4; }
        else if(pattern.startsWith('(?<', i)){ const close = pattern.indexOf('>', i); kind = 'a named group "' + pattern.slice(i+3, close) + '"'; skip = close - i + 1; }
        token = pattern.slice(i, i + skip); i += skip;
        note = kind + ' — its contents are explained below';
      } else if(ch === '{'){
        const close = pattern.indexOf('}', i);
        token = pattern.slice(i, close+1); i = close + 1;
        note = 'repeat the previous token ' + token.slice(1, -1).replace(/,/g, ' to ') + ' times';
      } else if(ch === '*' || ch === '+' || ch === '?'){ i++; note = ch === '*' ? 'zero or more of the previous token' : ch === '+' ? 'one or more' : 'zero or one (optional)'; }
      else { i++; note = /[A-Za-z0-9]/.test(ch) ? 'the literal "' + ch + '"' : 'the literal ' + JSON.stringify(ch); }
      // a quantifier after a group applies to the group
      if(i < pattern.length && '?*+{'.includes(pattern[i]) && !'?*+{'.includes(token.slice(-1))){ /* noted on the next pass */ }
      out.push([token, note]);
    }
    return out;
  }
  function draw(){
    const pattern = root.querySelector('#rxIn').value;
    const test = root.querySelector('#rxTest').value;
    const out = root.querySelector('#rxOut');
    const rows = explain(pattern);
    let matchNote = '';
    try{
      const m = new RegExp(pattern).exec(test);
      matchNote = m ? 'Matches' + (m.length > 1 ? ' · groups: ' + m.slice(1).map(g=>g === undefined ? '—' : '"' + g + '"').join(', ') : '')
                    : 'Does not match the test string';
    }catch(e){ matchNote = 'That pattern does not compile: ' + e.message; }
    out.innerHTML = `<table class="mono">
      ${rows.map(([token, note])=>`<tr><td style="white-space:nowrap">${escapeHtml(token)}</td><td>${escapeHtml(note)}</td></tr>`).join('')}
      <tr><td><b>Result</b></td><td><b>${escapeHtml(matchNote)}</b></td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('cssclamp','CSS Clamp Builder', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Property</label><select id="clProp"><option>font-size</option><option>padding</option><option>margin</option><option>gap</option><option>width</option></select></div>
      <div class="field"><label>Unit</label><select id="clUnit"><option>rem</option><option>px</option></select></div>
    </div>
    <div class="row">
      <div class="field"><label>Min</label><input type="number" id="clMin" value="1" step="0.1"></div>
      <div class="field"><label>Max</label><input type="number" id="clMax" value="2.2" step="0.1"></div>
    </div>
    <div class="row">
      <div class="field"><label>Small viewport (px)</label><input type="number" id="clSmall" value="360"></div>
      <div class="field"><label>Large viewport (px)</label><input type="number" id="clLarge" value="1440"></div>
    </div>
    <div class="output" id="clOut" style="font-family:var(--mono);white-space:pre-wrap">—</div>
    <div id="clPreview" style="margin-top:12px;padding:10px;border:1px solid var(--line);overflow:hidden">
      <div id="clDemo" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Fluid type, one line of CSS</div>
    </div>
    <div class="hint">A clamp between two viewport widths, which is what every fluid-type article is doing. The middle term is a slope and an intercept — shown below so you can see why the numbers are what they are.</div>`;
  function draw(){
    const unit = root.querySelector('#clUnit').value;
    const min = Number(root.querySelector('#clMin').value) || 0;
    const max = Number(root.querySelector('#clMax').value) || 0;
    const small = Number(root.querySelector('#clSmall').value) || 320;
    const large = Number(root.querySelector('#clLarge').value) || 1440;
    const prop = root.querySelector('#clProp').value;
    const minPx = unit === 'rem' ? min * 16 : min;
    const maxPx = unit === 'rem' ? max * 16 : max;
    const slope = (maxPx - minPx) / (large - small);
    const intercept = minPx - slope * small;
    const slopeVw = (slope * 100).toFixed(4);
    const interceptRem = (intercept / 16).toFixed(4);
    const middle = Math.abs(intercept) < 0.001 ? slopeVw + 'vw' : interceptRem + 'rem + ' + slopeVw + 'vw';
    const css = prop + ': clamp(' + min + unit + ', ' + middle + ', ' + max + unit + ');';
    root.querySelector('#clOut').textContent = css + '\n\n' +
      '/* ' + minPx.toFixed(1) + 'px at ' + small + 'px, ' + maxPx.toFixed(1) + 'px at ' + large + 'px */\n' +
      '/* slope ' + (slope * 1000).toFixed(2) + 'px per 1000px of viewport */';
    const demo = root.querySelector('#clDemo');
    demo.style.fontSize = 'clamp(' + min + unit + ', ' + middle + ', ' + max + unit + ')';
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Science (2) ---------------- */

sci('resistor','Resistor Colour Code', root=>{
  const BANDS = [['Black',0],['Brown',1],['Red',2],['Orange',3],['Yellow',4],['Green',5],['Blue',6],['Violet',7],['Grey',8],['White',9]];
  const MULT = ['×1','×10','×100','×1k','×10k','×100k','×1M','×10M','×100M','×1G'];
  const TOL = [['Brown','±1%'],['Red','±2%'],['Green','±0.5%'],['Blue','±0.25%'],['Violet','±0.1%'],['Grey','±0.05%'],['Gold','±5%'],['Silver','±10%']];
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Band 1</label><select id="rs1">${BANDS.map((b,i)=>`<option value="${i}"${i===1?' selected':''}>${b[0]}</option>`).join('')}</select></div>
      <div class="field"><label>Band 2</label><select id="rs2">${BANDS.map((b,i)=>`<option value="${i}"${i===0?' selected':''}>${b[0]}</option>`).join('')}</select></div>
      <div class="field"><label>Multiplier</label><select id="rs3">${MULT.map((m,i)=>`<option value="${i}"${i===2?' selected':''}>${m}</option>`).join('')}</select></div>
      <div class="field"><label>Tolerance</label><select id="rs4">${TOL.map((t,i)=>`<option value="${i}"${i===6?' selected':''}>${t[0]} ${t[1]}</option>`).join('')}</select></div>
    </div>
    <div id="rsBands" style="display:flex;gap:0;align-items:center;margin:14px 0">
      <div style="height:44px;width:18px;background:#c9a227;border-radius:4px 0 0 4px"></div>
      <div id="rsSwatches" style="display:flex;gap:8px;padding:0 14px;height:44px;background:#e8d8b0;align-items:center;flex:1"></div>
      <div style="height:44px;width:18px;background:#c9a227;border-radius:0 4px 4px 0"></div>
    </div>
    <div class="output" id="rsOut">—</div>
    <div class="hint">Four bands: two significant figures, a multiplier and a tolerance. Reading is the same in both directions — set the dropdowns and the value follows.</div>`;
  const COLORS = ['#000','#8b4513','#d32f2f','#f57c00','#fbc02d','#388e3c','#1976d2','#7b1fa2','#757575','#fafafa','#c9a227','#bdbdbd'];
  function draw(){
    const d1 = Number(root.querySelector('#rs1').value), d2 = Number(root.querySelector('#rs2').value);
    const mult = Number(root.querySelector('#rs3').value), tol = Number(root.querySelector('#rs4').value);
    const value = (d1 * 10 + d2) * Math.pow(10, mult);
    const fmt = v => v >= 1e6 ? (v/1e6).toFixed(2).replace(/\.?0+$/,'') + ' MΩ'
      : v >= 1e3 ? (v/1e3).toFixed(2).replace(/\.?0+$/,'') + ' kΩ' : v.toFixed(0) + ' Ω';
    const tolPct = parseFloat(TOL[tol][1].replace(/[±%]/g, ''));
    root.querySelector('#rsSwatches').innerHTML = [d1, d2, mult + 1, tol + 2]
      .map((idx, i)=>`<div style="width:20px;height:36px;background:${COLORS[idx] || '#888'};border:1px solid rgba(0,0,0,0.2)" title="${i < 2 ? BANDS[idx][0] : i === 2 ? MULT[idx] : TOL[tol][0]}"></div>`).join('');
    root.querySelector('#rsOut').innerHTML = `<table class="mono">
      <tr><td>Value</td><td>${fmt(value)}</td></tr>
      <tr><td>Tolerance</td><td>${TOL[tol][1]}</td></tr>
      <tr><td>Range</td><td>${fmt(value * (1 - tolPct/100))} – ${fmt(value * (1 + tolPct/100))}</td></tr>
      <tr><td>Four-band code</td><td>${BANDS[d1][0].toLowerCase()}, ${BANDS[d2][0].toLowerCase()}, ${MULT[mult].replace('×','×')}, ${TOL[tol][0].toLowerCase()}</td></tr>
    </table>`;
  }
  root.querySelectorAll('select').forEach(el=>el.addEventListener('change', draw));
  draw();
});

sci('bufferph','Buffer pH', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Weak acid pKa</label><input type="number" id="bpKa" value="4.76" step="0.01"></div>
      <div class="field"><label>Acid concentration (M)</label><input type="number" id="bpA" value="0.1" step="0.01"></div>
      <div class="field"><label>Conjugate base (M)</label><input type="number" id="bpB" value="0.1" step="0.01"></div>
    </div>
    <div class="output" id="bpOut">—</div>
    <div class="hint">Henderson–Hasselbalch: pH = pKa + log([base]/[acid]). It assumes the concentrations you type are the ones at equilibrium, which is true near the buffer's working range and not true far from it.</div>`;
  function draw(){
    const pKa = Number(root.querySelector('#bpKa').value) || 0;
    const a = Number(root.querySelector('#bpA').value) || 0;
    const b = Number(root.querySelector('#bpB').value) || 0;
    const out = root.querySelector('#bpOut');
    if(!a || !b){ out.textContent = 'Both concentrations need to be above zero — the ratio is the whole equation.'; return; }
    const pH = pKa + Math.log10(b / a);
    const ratio = b / a;
    out.innerHTML = `<table class="mono">
      <tr><td>pH</td><td>${pH.toFixed(2)}</td></tr>
      <tr><td>Base : acid</td><td>${ratio.toFixed(3)} : 1</td></tr>
      <tr><td>Buffer capacity</td><td>${(pH > pKa - 1 && pH < pKa + 1) ? 'good — within one pH unit of the pKa' : 'poor — more than one pH unit from the pKa, so it resists change badly here'}</td></tr>
      <tr><td>Ratio for pH = pKa</td><td>1 : 1</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Almanac (1) ---------------- */

alm('ekadashi','Ekadashi List', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Year</label><input type="number" id="ekYear" value="2026" min="1900" max="2100"></div>
      <div class="field"><label>Latitude</label><input type="number" id="ekLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="ekLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="ekOut">—</div>
    <div class="hint">Ekadashi is the eleventh tithi of each lunar fortnight, so it falls twice a month. Found by walking the year a day at a time and asking which tithi the sunrise carries — the same calculation the Panchang uses. Dates are for the location given; the tithi at sunrise is the one that names the day.</div>`;
  function draw(){
    const year = Number(root.querySelector('#ekYear').value) || new Date().getFullYear();
    const lat = Number(root.querySelector('#ekLat').value) || 0;
    const lon = Number(root.querySelector('#ekLon').value) || 0;
    const tz = -(new Date().getTimezoneOffset()) / 60;
    // Collect the tithi at sunrise for every day of the year, then keep the
    // first day of each run of ekadashi tithi. A tithi can last into a second
    // sunrise, so comparing against the previous *row* is not enough — the run
    // has to be measured.
    const days = [];
    for(let month=0; month<12; month++){
      for(let day=1; day<=31; day++){
        const d = new Date(Date.UTC(year, month, day));
        if(d.getUTCMonth() !== month) break;
        const ss = ASTRO.sunriseSunset(new Date(Date.UTC(year, month, day, 12)), lat, lon);
        if(ss.polar) continue;
        const jd = ASTRO.jd({ y: year, m: month + 1, d: day, h: ss.sunrise + tz });
        const p = ASTRO.panchang(jd);
        days.push({ date: d.toISOString().slice(0, 10), num: p.tithi.num, paksha: p.tithi.paksha, name: p.tithi.name });
      }
    }
    const rows = [];
    let runKey = null;
    for(const day of days){
      const isEkadashi = day.num === 11 || day.num === 26;
      const key = day.num + ':' + day.paksha;
      if(isEkadashi && key !== runKey){
        rows.push([day.date, day.paksha + ' Ekadashi', day.name]);
      }
      runKey = isEkadashi ? key : null;
    }
    root.querySelector('#ekOut').innerHTML = rows.length
      ? `<table class="mono">${rows.map(([date, label, tithi])=>`<tr><td>${date}</td><td>${escapeHtml(label)}</td><td style="color:var(--muted)">${escapeHtml(tithi)}</td></tr>`).join('')}</table>
         <div class="hint">${rows.length} in ${year}</div>`
      : '<div class="hint">No ekadashi found for that year and place — try a different location.</div>';
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});
