/* ================================================================
   B27 — text at the level of code points and bits.
   ================================================================ */

/* ---------------- Text (3) ---------------- */

txt('Encoding','punycode','Punycode / IDN', root=>{
  root.innerHTML = `
    <div class="segrow" id="pnMode">
      <button class="btn" data-pn="enc">Text → Punycode</button>
      <button class="btn" data-pn="dec">Punycode → Text</button>
    </div>
    <div class="field"><label>Input</label><input type="text" id="pnIn" value="münchen.de" style="font-family:var(--mono)"></div>
    <div class="output" id="pnOut">—</div>
    <div class="hint">The encoding that lets a domain name hold non-ASCII characters: RFC 3492, applied per label. <span class="mono">münchen.de</span> and <span class="mono">xn--mnchen-3ya.de</span> are the same name — which is exactly why a browser shows you the Unicode form and a certificate shows the ASCII one.</div>`;
  const BASE = 36, TMIN = 1, TMAX = 26, SKEW = 38, DAMP = 700, INITIAL_BIAS = 72, INITIAL_N = 128;
  const adapt = (deltaIn, points, first) => {
    let delta = first ? Math.floor(deltaIn / DAMP) : deltaIn >> 1;
    delta += Math.floor(delta / points);
    let k = 0;
    while(delta > ((BASE - TMIN) * TMAX) >> 1){ delta = Math.floor(delta / (BASE - TMIN)); k += BASE; }
    return Math.floor(k + (BASE - TMIN + 1) * delta / (delta + SKEW));
  };
  const digitToChar = d => d < 26 ? String.fromCharCode(97 + d) : String.fromCharCode(22 + d);
  const charToDigit = c => {
    const code = c.charCodeAt(0);
    if(code >= 48 && code <= 57) return code - 22;
    if(code >= 97 && code <= 122) return code - 97;
    if(code >= 65 && code <= 90) return code - 65;
    return BASE;
  };
  function encodeLabel(input){
    const cps = [...input].map(c=>c.codePointAt(0));
    const out = [];
    cps.forEach(cp=>{ if(cp < 128) out.push(String.fromCharCode(cp)); });
    let h = out.length, b = out.length;
    if(b) out.push('-');
    let n = INITIAL_N, delta = 0, bias = INITIAL_BIAS;
    while(h < cps.length){
      let m = Infinity;
      for(const cp of cps) if(cp >= n && cp < m) m = cp;
      if(!isFinite(m)) break;
      delta += (m - n) * (h + 1);
      n = m;
      for(const cp of cps){
        if(cp < n) delta++;
        if(cp === n){
          let q = delta;
          for(let k = BASE;; k += BASE){
            const t = k <= bias ? TMIN : (k >= bias + TMAX ? TMAX : k - bias);
            if(q < t) break;
            out.push(digitToChar(t + (q - t) % (BASE - t)));
            q = Math.floor((q - t) / (BASE - t));
          }
          out.push(digitToChar(q));
          bias = adapt(delta, h + 1, h === b);
          delta = 0; h++;
        }
      }
      delta++; n++;
    }
    return out.join('');
  }
  function decodeLabel(input){
    const out = [];
    let b = input.lastIndexOf('-');
    if(b > 0){
      for(let j=0;j<b;j++) out.push(input.charCodeAt(j));
    } else b = 0;
    let i = 0, n = INITIAL_N, bias = INITIAL_BIAS;
    let idx = b > 0 ? b + 1 : 0;
    while(idx < input.length){
      const oldi = i;
      let w = 1;
      for(let k = BASE;; k += BASE){
        if(idx >= input.length) throw new Error('the encoded string ends in the middle of a character');
        const digit = charToDigit(input[idx++]);
        if(digit >= BASE) throw new Error('not a punycode digit: ' + input[idx-1]);
        i += digit * w;
        const t = k <= bias ? TMIN : (k >= bias + TMAX ? TMAX : k - bias);
        if(digit < t) break;
        w *= BASE - t;
      }
      bias = adapt(i - oldi, out.length + 1, oldi === 0);
      n += Math.floor(i / (out.length + 1));
      i = i % (out.length + 1);
      out.splice(i, 0, n);
      i++;
    }
    return out.map(cp=>String.fromCodePoint(cp)).join('');
  }
  let mode = 'enc';
  function draw(){
    const out = root.querySelector('#pnOut');
    const v = root.querySelector('#pnIn').value.trim();
    if(!v){ out.textContent = '—'; return; }
    try{
      if(mode === 'enc'){
        const labels = v.replace(/^https?:\/\//, '').split('.');
        const encoded = labels.map(l => /[^\x00-\x7f]/.test(l) ? 'xn--' + encodeLabel(l) : l).join('.');
        out.innerHTML = `<table class="mono">
          <tr><td>Unicode</td><td>${escapeHtml(v)}</td></tr>
          <tr><td>ASCII form</td><td>${escapeHtml(encoded)}</td></tr>
          <tr><td>Labels</td><td>${labels.map((l, i)=>escapeHtml(l) + ' → ' + escapeHtml(encoded.split('.')[i])).join('<br>')}</td></tr>
        </table>`;
      } else {
        const labels = v.replace(/^https?:\/\//, '').split('.');
        const decoded = labels.map(l => l.startsWith('xn--') ? decodeLabel(l.slice(4)) : l).join('.');
        out.innerHTML = `<table class="mono">
          <tr><td>ASCII form</td><td>${escapeHtml(v)}</td></tr>
          <tr><td>Unicode</td><td>${escapeHtml(decoded)}</td></tr>
        </table>`;
      }
    }catch(e){ out.textContent = 'Could not convert: ' + (e.message || e); }
  }
  root.querySelectorAll('[data-pn]').forEach(b=>b.addEventListener('click', ()=>{ mode = b.dataset.pn; draw(); }));
  root.querySelector('#pnIn').addEventListener('input', draw);
  draw();
});

txt('Encoding','codepoints','Code Point Inspector', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="cpIn" style="min-height:90px">naïve — 你好 — 🧰</textarea></div>
    <div class="output" id="cpOut">—</div>
    <div class="hint">Each character as the machine sees it: one code point, but up to four UTF-8 bytes and one or two UTF-16 units. The 🧰 is a surrogate pair in JavaScript and a single code point in Unicode — that gap is where string length bugs come from.</div>`;
  function draw(){
    const text = root.querySelector('#cpIn').value;
    const out = root.querySelector('#cpOut');
    if(!text){ out.textContent = '—'; return; }
    const rows = [];
    for(const ch of text){
      if(ch === '\n'){ rows.push(['\\n', 'U+000A', '0a', '—', 'newline']); continue; }
      const cp = ch.codePointAt(0);
      const utf8 = Array.from(new TextEncoder().encode(ch)).map(b=>b.toString(16).padStart(2, '0')).join(' ');
      const utf16 = Array.from({ length: ch.length }, (_, i)=>ch.charCodeAt(i).toString(16).padStart(4, '0')).join(' ');
      rows.push([ch === ' ' ? '␣' : ch, 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'), utf8, utf16, cp > 0xFFFF ? 'astral — surrogate pair in JS' : '']);
    }
    const bytes = new TextEncoder().encode(text).length;
    out.innerHTML = `<table class="mono">
      <tr><th style="text-align:left">Char</th><th>Code point</th><th>UTF-8</th><th>UTF-16</th><th style="text-align:left">Note</th></tr>
      ${rows.map(r=>`<tr><td style="font-size:16px">${escapeHtml(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${escapeHtml(r[4])}</td></tr>`).join('')}
      <tr><td colspan="5" style="padding-top:8px">${[...text].length} code points · ${text.length} UTF-16 units · ${bytes} UTF-8 bytes</td></tr>
    </table>`;
  }
  root.querySelector('#cpIn').addEventListener('input', draw);
  draw();
});

txt('Encoding','huffman','Huffman Coding', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="hfIn" style="min-height:90px">this is an example of a huffman tree</textarea></div>
    <div class="output" id="hfOut">—</div>
    <div class="hint">The codes below are what a real Huffman compressor would emit for this text — frequent characters get short codes, rare ones get long. The saving is only real for text with a skewed distribution, and the table shows when it is not.</div>`;
  function draw(){
    const text = root.querySelector('#hfIn').value;
    const out = root.querySelector('#hfOut');
    if(!text){ out.textContent = '—'; return; }
    const freq = new Map();
    for(const ch of text) freq.set(ch, (freq.get(ch) || 0) + 1);
    if(freq.size === 1){ out.textContent = 'One distinct character — there is nothing to compress.'; return; }
    // build the tree with a simple sorted queue
    let nodes = [...freq.entries()].map(([ch, f])=>({ ch, f }));
    while(nodes.length > 1){
      nodes.sort((a, b)=>a.f - b.f);
      const [a, b] = nodes.splice(0, 2);
      nodes.push({ f: a.f + b.f, left: a, right: b });
    }
    const codes = new Map();
    (function walk(node, prefix){
      if(node.ch !== undefined){ codes.set(node.ch, prefix || '0'); return; }
      walk(node.left, prefix + '0');
      walk(node.right, prefix + '1');
    })(nodes[0], '');
    const sorted = [...codes.entries()].sort((a, b)=>a[1].length - b[1].length);
    const bits = [...text].reduce((a, ch)=>a + codes.get(ch).length, 0);
    const original = new TextEncoder().encode(text).length * 8;
    out.innerHTML = `<table class="mono">
      <tr><th style="text-align:left">Char</th><th>Freq</th><th style="text-align:left">Code</th></tr>
      ${sorted.map(([ch, code])=>`<tr><td>${ch === ' ' ? '␣' : escapeHtml(ch)}</td><td>${freq.get(ch)}</td><td>${code}</td></tr>`).join('')}
      <tr><td colspan="3" style="padding-top:8px">
        ${bits} bits encoded vs ${original} bits raw — ${(100 - bits / original * 100).toFixed(1)}% smaller${bits >= original ? ' (no saving: the text is too flat)' : ''}
      </td></tr>
    </table>
    <div class="hint">The code table itself has to travel with the data, so a short text can grow. That is why the ratio is measured against the raw bytes, not against the ideal.</div>`;
  }
  root.querySelector('#hfIn').addEventListener('input', draw);
  draw();
});
