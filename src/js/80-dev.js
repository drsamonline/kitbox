/* ================================================================
   DEVELOPMENT TOOLS
   ================================================================ */
TOOLS.dev = [];
let DEV_N = 0;
function dev(id, name, render){ register({cat:'dev', id, name, render}); }

dev('baseconverter','Base Converter', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Value</label><input type="text" id="bcVal" placeholder="e.g. 255"></div>
      <div class="field"><label>From base</label><select id="bcFrom">
        <option value="2">Binary (2)</option><option value="8">Octal (8)</option><option value="10" selected>Decimal (10)</option><option value="16">Hex (16)</option><option value="36">Base 36</option>
      </select></div>
    </div>
    <table class="mono" id="bcOut"></table>`;
  function update(){
    const val = root.querySelector('#bcVal').value.trim();
    const from = parseInt(root.querySelector('#bcFrom').value);
    const out = root.querySelector('#bcOut');
    if(!val){ out.innerHTML=''; return; }
    const n = parseInt(val, from);
    if(isNaN(n)){ out.innerHTML = `<tr><td colspan="2">Not a valid base-${from} number.</td></tr>`; return; }
    out.innerHTML = [2,8,10,16,36].map(b=>`<tr><td>Base ${b}${b===2?' (Binary)':b===8?' (Octal)':b===16?' (Hex)':''}</td><td>${n.toString(b).toUpperCase()}</td></tr>`).join('');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
});

dev('beautifyjson','Beautify JSON', root=>{
  root.innerHTML = `
    <div class="field"><label>JSON</label><textarea id="bjIn" placeholder='{"name":"example","values":[1,2,3]}'></textarea></div>
    <div class="segrow"><button class="btn primary" id="bjGo">Beautify</button><button class="btn" id="bjMin">Minify</button></div>
    <div class="output" id="bjOut">Result will appear here.</div>`;
  function go(minify){
    const out = root.querySelector('#bjOut');
    try{
      const obj = JSON.parse(root.querySelector('#bjIn').value);
      out.textContent = minify ? JSON.stringify(obj) : JSON.stringify(obj, null, 2);
    }catch(e){ out.textContent = 'Invalid JSON: '+e.message; }
  }
  root.querySelector('#bjGo').addEventListener('click', ()=>go(false));
  root.querySelector('#bjMin').addEventListener('click', ()=>go(true));
});

function beautifyCSS(css){
  css = css.replace(/\s+/g,' ').trim();
  let out=''; let indent=0;
  for(let i=0;i<css.length;i++){
    const c = css[i];
    if(c==='{'){ out=out.replace(/\s+$/,''); out+=' {\n'+'  '.repeat(indent+1); indent++; }
    else if(c==='}'){ out=out.replace(/[ ]+$/,''); indent=Math.max(0,indent-1); out+='\n'+'  '.repeat(indent)+'}\n'+'  '.repeat(indent); }
    else if(c===';'){ out+=';\n'+'  '.repeat(indent); }
    else out+=c;
  }
  out = out.split('\n').map(l=>{
    l = l.trimEnd();
    const m = l.match(/^(\s*)([a-zA-Z-]+)\s*:\s*(.+)$/);
    if(m && !l.includes('{')) return m[1]+m[2]+': '+m[3];
    return l;
  }).join('\n').replace(/\n{2,}/g,'\n').trim();
  return out;
}
dev('beautifycss','Beautify CSS', root=>{
  root.innerHTML = `
    <div class="field"><label>CSS</label><textarea id="bcssIn" placeholder=".card{color:red;padding:10px}"></textarea></div>
    <div class="segrow"><button class="btn primary" id="bcssGo">Beautify</button></div>
    <div class="output" id="bcssOut">Result will appear here.</div>`;
  root.querySelector('#bcssGo').addEventListener('click', ()=>{
    try{ root.querySelector('#bcssOut').textContent = beautifyCSS(root.querySelector('#bcssIn').value); }
    catch(e){ root.querySelector('#bcssOut').textContent = 'Could not format: '+e.message; }
  });
});

function beautifyMarkup(input, isHtml){
  const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  let xml = input.replace(/>\s*</g,'><').trim();
  const parts = xml.split(/(<[^>]+>)/g).filter(p=>p!=='');
  let pad=0; let out=[];
  parts.forEach(part=>{
    if(part.startsWith('<')){
      const tagMatch = part.match(/^<\/?([a-zA-Z0-9:_-]+)/);
      const tagName = tagMatch? tagMatch[1].toLowerCase() : '';
      const isClosing = part.startsWith('</');
      const isSelfClosing = /\/>$/.test(part) || (isHtml && VOID.has(tagName));
      const isDecl = part.startsWith('<?') || part.startsWith('<!');
      if(isClosing){
        pad = Math.max(0,pad-1);
        out.push('  '.repeat(pad)+part);
      } else {
        out.push('  '.repeat(pad)+part);
        if(!isSelfClosing && !isDecl) pad++;
      }
    } else {
      const text = part.trim();
      if(text) out.push('  '.repeat(pad)+text);
    }
  });
  return out.join('\n');
}
dev('beautifyxml','Beautify XML', root=>{
  root.innerHTML = `
    <div class="field"><label>XML</label><textarea id="bxIn" placeholder="<root><item>value</item></root>"></textarea></div>
    <div class="segrow"><button class="btn primary" id="bxGo">Beautify</button></div>
    <div class="output" id="bxOut">Result will appear here.</div>`;
  root.querySelector('#bxGo').addEventListener('click', ()=>{
    try{ root.querySelector('#bxOut').textContent = beautifyMarkup(root.querySelector('#bxIn').value, false); }
    catch(e){ root.querySelector('#bxOut').textContent = 'Could not format: '+e.message; }
  });
});

dev('beautifyhtml','Beautify HTML', root=>{
  root.innerHTML = `
    <div class="field"><label>HTML</label><textarea id="bhIn" placeholder="<div><p>Hello</p><img src='x.png'></div>"></textarea></div>
    <div class="segrow"><button class="btn primary" id="bhGo">Beautify</button></div>
    <div class="output" id="bhOut">Result will appear here.</div>
    <div class="hint">Formats tag structure and indentation. Content inside &lt;script&gt;/&lt;style&gt; is left as-is rather than reformatted.</div>`;
  root.querySelector('#bhGo').addEventListener('click', ()=>{
    try{ root.querySelector('#bhOut').textContent = beautifyMarkup(root.querySelector('#bhIn').value, true); }
    catch(e){ root.querySelector('#bhOut').textContent = 'Could not format: '+e.message; }
  });
});

dev('base64','Base64 Codec', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="b64In"></textarea></div>
    <div class="segrow"><button class="btn primary" id="b64Enc">Encode</button><button class="btn" id="b64Dec">Decode</button></div>
    <div class="output" id="b64Out">Result will appear here.</div>`;
  root.querySelector('#b64Enc').addEventListener('click', ()=>{
    try{ root.querySelector('#b64Out').textContent = btoa(unescape(encodeURIComponent(root.querySelector('#b64In').value))); }
    catch(e){ root.querySelector('#b64Out').textContent = 'Could not encode: '+e.message; }
  });
  root.querySelector('#b64Dec').addEventListener('click', ()=>{
    try{ root.querySelector('#b64Out').textContent = decodeURIComponent(escape(atob(root.querySelector('#b64In').value))); }
    catch(e){ root.querySelector('#b64Out').textContent = 'Not valid Base64.'; }
  });
});

dev('urlencode','URL Encoder/Decoder', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="ueIn"></textarea></div>
    <div class="segrow"><button class="btn primary" id="ueEnc">Encode</button><button class="btn" id="ueDec">Decode</button></div>
    <div class="output" id="ueOut">Result will appear here.</div>`;
  root.querySelector('#ueEnc').addEventListener('click', ()=>{ root.querySelector('#ueOut').textContent = encodeURIComponent(root.querySelector('#ueIn').value); });
  root.querySelector('#ueDec').addEventListener('click', ()=>{
    try{ root.querySelector('#ueOut').textContent = decodeURIComponent(root.querySelector('#ueIn').value); }
    catch(e){ root.querySelector('#ueOut').textContent = 'Not valid URL-encoded text.'; }
  });
});

dev('uuid','UUID Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>How many</label><input type="number" id="uuCount" value="5" min="1" max="100"></div>
    <div class="segrow"><button class="btn primary" id="uuGo">Generate</button></div>
    <div class="output" id="uuOut">Result will appear here.</div>`;
  function uuidv4(){
    if(crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(b=>b.toString(16).padStart(2,'0'));
    return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}`;
  }
  root.querySelector('#uuGo').addEventListener('click', ()=>{
    const n = +root.querySelector('#uuCount').value||1;
    root.querySelector('#uuOut').textContent = Array.from({length:n}, uuidv4).join('\n');
  });
});

dev('hashgen','Hash Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="hgIn"></textarea></div>
    <div class="field"><label>Algorithm</label><select id="hgAlgo"><option value="SHA-1">SHA-1</option><option value="SHA-256" selected>SHA-256</option><option value="SHA-384">SHA-384</option><option value="SHA-512">SHA-512</option></select></div>
    <div class="segrow"><button class="btn primary" id="hgGo">Compute hash</button></div>
    <div class="output" id="hgOut">Result will appear here.</div>
    <div class="hint">Uses the browser's built-in Web Crypto API. MD5 isn't offered since it isn't cryptographically supported natively and is considered broken for security use.</div>`;
  root.querySelector('#hgGo').addEventListener('click', async ()=>{
    const text = root.querySelector('#hgIn').value;
    const algo = root.querySelector('#hgAlgo').value;
    const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
    const hex = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
    root.querySelector('#hgOut').textContent = hex;
  });
});

dev('textdiff','Text Diff', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Text A</label><textarea id="tdA"></textarea></div>
      <div class="field"><label>Text B</label><textarea id="tdB"></textarea></div>
    </div>
    <div class="segrow"><button class="btn primary" id="tdGo">Compare</button></div>
    <div class="output" id="tdOut">Result will appear here.</div>`;
  function lcsDiff(a,b){
    const la=a.length, lb=b.length;
    const dp = Array.from({length:la+1},()=>new Array(lb+1).fill(0));
    for(let i=la-1;i>=0;i--) for(let j=lb-1;j>=0;j--) dp[i][j] = a[i]===b[j] ? dp[i+1][j+1]+1 : Math.max(dp[i+1][j],dp[i][j+1]);
    let i=0,j=0; const out=[];
    while(i<la && j<lb){
      if(a[i]===b[j]){ out.push({t:'=',v:a[i]}); i++; j++; }
      else if(dp[i+1][j]>=dp[i][j+1]){ out.push({t:'-',v:a[i]}); i++; }
      else { out.push({t:'+',v:b[j]}); j++; }
    }
    while(i<la){ out.push({t:'-',v:a[i]}); i++; }
    while(j<lb){ out.push({t:'+',v:b[j]}); j++; }
    return out;
  }
  root.querySelector('#tdGo').addEventListener('click', ()=>{
    const a = root.querySelector('#tdA').value.split('\n'), b = root.querySelector('#tdB').value.split('\n');
    const out = root.querySelector('#tdOut');
    if(a.length*b.length > 4000000){ out.textContent = `That's too much text to diff line-by-line in the browser (${a.length}×${b.length} lines would freeze the page) — try comparing smaller sections.`; return; }
    const diff = lcsDiff(a,b);
    out.innerHTML = diff.map(d=>{
      const color = d.t==='='? 'var(--ink-soft)' : d.t==='-'? '#c0392b' : '#1e8449';
      const prefix = d.t==='='?'  ':d.t==='-'?'− ':'+ ';
      return `<div style="color:${color}">${prefix}${escapeHtml(d.v)}</div>`;
    }).join('');
  });
});

dev('htmlentity','HTML Entity Codec', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="heIn"></textarea></div>
    <div class="segrow"><button class="btn primary" id="heEnc">Encode</button><button class="btn" id="heDec">Decode</button></div>
    <div class="output" id="heOut">Result will appear here.</div>`;
  root.querySelector('#heEnc').addEventListener('click', ()=>{
    const div = document.createElement('div');
    div.textContent = root.querySelector('#heIn').value;
    root.querySelector('#heOut').textContent = div.innerHTML;
  });
  root.querySelector('#heDec').addEventListener('click', ()=>{
    const div = document.createElement('div');
    div.innerHTML = root.querySelector('#heIn').value;
    root.querySelector('#heOut').textContent = div.textContent;
  });
});

dev('datauri','Data URI Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>Upload a file</label><input type="file" id="duFile"></div>
    <div class="output" id="duOut">Result will appear here.</div>
    <div class="segrow" id="duCopyRow" style="display:none"><button class="btn" id="duCopy">Copy to clipboard</button></div>`;
  root.querySelector('#duFile').addEventListener('change', e=>{
    const file = e.target.files[0]; if(!file) return;
    e.target.value='';
    const reader = new FileReader();
    reader.onload = ()=>{
      root.querySelector('#duOut').textContent = reader.result;
      root.querySelector('#duCopyRow').style.display='flex';
    };
    reader.readAsDataURL(file);
  });
  root.querySelector('#duCopy').addEventListener('click', ()=>{
    navigator.clipboard && navigator.clipboard.writeText(root.querySelector('#duOut').textContent).catch(()=>{});
  });
});

dev('pwstrength','Password Strength', root=>{
  root.innerHTML = `
    <div class="field"><label>Password</label><input type="text" id="psIn" placeholder="Type a password to check..."></div>
    <table class="mono" id="psOut"></table>`;
  root.querySelector('#psIn').addEventListener('input', e=>{
    const p = e.target.value;
    const out = root.querySelector('#psOut');
    if(!p){ out.innerHTML=''; return; }
    const checks = [
      ['Length ≥ 12', p.length>=12], ['Length ≥ 8', p.length>=8 && p.length<12],
      ['Has uppercase', /[A-Z]/.test(p)], ['Has lowercase', /[a-z]/.test(p)],
      ['Has number', /[0-9]/.test(p)], ['Has symbol', /[^A-Za-z0-9]/.test(p)]
    ];
    const charsetSize = (/[a-z]/.test(p)?26:0)+(/[A-Z]/.test(p)?26:0)+(/[0-9]/.test(p)?10:0)+(/[^A-Za-z0-9]/.test(p)?32:0);
    const entropy = p.length * Math.log2(Math.max(charsetSize,1));
    let verdict = entropy<28?'Very weak': entropy<36?'Weak': entropy<60?'Reasonable': entropy<80?'Strong':'Very strong';
    out.innerHTML = `<tr><td>Estimated entropy</td><td>${fmtNum(entropy,1)} bits</td></tr><tr><td>Verdict</td><td>${verdict}</td></tr>` +
      checks.map(([k,v])=>`<tr><td>${k}</td><td>${v?'✓':'✗'}</td></tr>`).join('');
  });
});

dev('pwgen','Password Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>Length</label><input type="number" id="pgLen" value="16" min="4" max="128"></div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:6px"><input type="checkbox" id="pgUpper" checked> Uppercase (A-Z)</label>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:6px"><input type="checkbox" id="pgLower" checked> Lowercase (a-z)</label>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:6px"><input type="checkbox" id="pgNum" checked> Numbers (0-9)</label>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="pgSym" checked> Symbols (!@#...)</label>
    <div class="segrow"><button class="btn primary" id="pgGo">Generate</button></div>
    <div class="output" id="pgOut">Result will appear here.</div>`;
  root.querySelector('#pgGo').addEventListener('click', ()=>{
    const len = +root.querySelector('#pgLen').value||16;
    let chars = '';
    if(root.querySelector('#pgUpper').checked) chars+='ABCDEFGHJKLMNPQRSTUVWXYZ';
    if(root.querySelector('#pgLower').checked) chars+='abcdefghijkmnpqrstuvwxyz';
    if(root.querySelector('#pgNum').checked) chars+='23456789';
    if(root.querySelector('#pgSym').checked) chars+='!@#$%^&*()-_=+[]{}';
    const out = root.querySelector('#pgOut');
    if(!chars){ out.textContent='Select at least one character type.'; return; }
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    out.textContent = Array.from(arr, n=>chars[n%chars.length]).join('');
  });
});

dev('regextester','Regex Tester', root=>{
  root.innerHTML = `
    <div class="field"><label>Pattern</label><input type="text" id="rtPattern" placeholder="e.g. \\\\d+"></div>
    <div class="row">
      <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft)"><input type="checkbox" id="rtG" checked> g</label>
      <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft)"><input type="checkbox" id="rtI"> i</label>
      <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft)"><input type="checkbox" id="rtM"> m</label>
    </div>
    <div class="field"><label>Test string</label><textarea id="rtText"></textarea></div>
    <div class="output" id="rtOut">Matches will appear here.</div>`;
  function update(){
    const pat = root.querySelector('#rtPattern').value;
    const flags = (root.querySelector('#rtG').checked?'g':'')+(root.querySelector('#rtI').checked?'i':'')+(root.querySelector('#rtM').checked?'m':'');
    const text = root.querySelector('#rtText').value;
    const out = root.querySelector('#rtOut');
    if(!pat){ out.textContent='Matches will appear here.'; return; }
    try{
      const matches = [...text.matchAll(new RegExp(pat, flags.includes('g')?flags:flags+'g'))];
      out.textContent = matches.length ? matches.map((m,i)=>`Match ${i+1}: "${m[0]}" at index ${m.index}${m.length>1?'\n  Groups: '+m.slice(1).map(g=>g===undefined?'—':`"${g}"`).join(', '):''}`).join('\n') : 'No matches.';
    }catch(e){ out.textContent = 'Invalid regex: '+e.message; }
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', update));
});

dev('jwtdebug','JWT Debugger', root=>{
  root.innerHTML = `
    <div class="field"><label>JWT token</label><textarea id="jwIn" placeholder="eyJhbGciOi..."></textarea></div>
    <table class="mono" id="jwOut"></table>
    <div class="hint">Decodes the header and payload only — it does not verify the signature (that requires the secret/private key).</div>`;
  root.querySelector('#jwIn').addEventListener('input', e=>{
    const out = root.querySelector('#jwOut');
    const parts = e.target.value.trim().split('.');
    if(parts.length<2){ out.innerHTML=''; return; }
    function b64urlDecode(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return decodeURIComponent(escape(atob(s))); }
    try{
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      out.innerHTML = `<tr><td colspan="2"><b>Header</b></td></tr>${Object.entries(header).map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(JSON.stringify(v))}</td></tr>`).join('')}<tr><td colspan="2"><b>Payload</b></td></tr>${Object.entries(payload).map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(JSON.stringify(v))}</td></tr>`).join('')}`;
    }catch(e){ out.innerHTML = `<tr><td colspan="2">Could not decode — not a valid JWT.</td></tr>`; }
  });
});

dev('cronparser','Cron Parser', root=>{
  root.innerHTML = `
    <div class="field"><label>Cron expression</label><input type="text" id="cxIn" value="*/15 9-17 * * 1-5" placeholder="min hour day month weekday"></div>
    <div class="output" id="cxOut">Result will appear here.</div>`;
  const NAMES_DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const NAMES_MON = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
  function describeField(f, unit, names){
    if(f==='*') return 'every '+unit;
    if(f.startsWith('*/')) return `every ${f.slice(2)} ${unit}(s)`;
    if(f.includes(',')) return f.split(',').map(x=>names?names[+x]:x).join(', ');
    if(f.includes('-')){ const [a,b]=f.split('-'); return names? `${names[+a]}–${names[+b]}` : `${a}–${b}`; }
    return names? names[+f] : f;
  }
  root.querySelector('#cxIn').addEventListener('input', e=>{
    const parts = e.target.value.trim().split(/\s+/);
    const out = root.querySelector('#cxOut');
    if(parts.length!==5){ out.textContent='A cron expression needs 5 fields: minute hour day month weekday.'; return; }
    const [min,hour,day,month,dow] = parts;
    out.innerHTML = `At minute: ${describeField(min,'minute')}\nHour: ${describeField(hour,'hour')}\nDay of month: ${describeField(day,'day')}\nMonth: ${describeField(month,'month',NAMES_MON)}\nWeekday: ${describeField(dow,'weekday',NAMES_DOW)}`;
  });
});

dev('httpstatus','HTTP Status Codes', root=>{
  const CODES = {
    '100':'Continue','101':'Switching Protocols','200':'OK','201':'Created','202':'Accepted','204':'No Content',
    '301':'Moved Permanently','302':'Found','304':'Not Modified','307':'Temporary Redirect','308':'Permanent Redirect',
    '400':'Bad Request','401':'Unauthorized','402':'Payment Required','403':'Forbidden','404':'Not Found','405':'Method Not Allowed',
    '408':'Request Timeout','409':'Conflict','410':'Gone','413':'Payload Too Large','415':'Unsupported Media Type',
    '418':"I'm a teapot",'422':'Unprocessable Entity','429':'Too Many Requests',
    '500':'Internal Server Error','501':'Not Implemented','502':'Bad Gateway','503':'Service Unavailable','504':'Gateway Timeout'
  };
  root.innerHTML = `
    <div class="field"><label>Search code or keyword</label><input type="text" id="hsSearch" placeholder="e.g. 404 or 'not found'"></div>
    <table class="mono" id="hsOut"></table>`;
  function draw(filter){
    const out = root.querySelector('#hsOut');
    const f = (filter||'').toLowerCase();
    out.innerHTML = Object.entries(CODES).filter(([c,n])=>!f || c.includes(f) || n.toLowerCase().includes(f))
      .map(([c,n])=>`<tr><td>${c}</td><td>${n}</td></tr>`).join('');
  }
  root.querySelector('#hsSearch').addEventListener('input', e=>draw(e.target.value));
  draw('');
});

dev('cssgradient','CSS Gradient Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Color A</label><input type="color" id="cgA" value="#3fcb6b" style="width:100%;height:44px;border:none;border-radius:8px"></div>
      <div class="field"><label>Color B</label><input type="color" id="cgB" value="#2f86eb" style="width:100%;height:44px;border:none;border-radius:8px"></div>
    </div>
    <div class="row">
      <div class="field"><label>Type</label><select id="cgType"><option value="linear">Linear</option><option value="radial">Radial</option></select></div>
      <div class="field"><label>Angle (linear only)</label><input type="range" id="cgAngle" min="0" max="360" value="90"></div>
    </div>
    <div id="cgPreview" style="height:120px;border-radius:12px;border:1px solid var(--line);margin:14px 0"></div>
    <div class="output" id="cgOut"></div>`;
  function update(){
    const a=root.querySelector('#cgA').value, b=root.querySelector('#cgB').value;
    const type=root.querySelector('#cgType').value, angle=root.querySelector('#cgAngle').value;
    const css = type==='linear' ? `linear-gradient(${angle}deg, ${a}, ${b})` : `radial-gradient(circle, ${a}, ${b})`;
    root.querySelector('#cgPreview').style.background = css;
    root.querySelector('#cgOut').textContent = `background: ${css};`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
});

dev('uaparser','User Agent Parser', root=>{
  root.innerHTML = `
    <div class="field"><label>User agent string</label><textarea id="uaIn"></textarea></div>
    <div class="segrow"><button class="btn" id="uaMine">Use my browser's UA</button></div>
    <table class="mono" id="uaOut" style="margin-top:14px"></table>`;
  function parse(ua){
    const browser = /Edg\//.test(ua)?'Edge': /Chrome\//.test(ua)?'Chrome': /Firefox\//.test(ua)?'Firefox': /Safari\//.test(ua) && !/Chrome/.test(ua)?'Safari': /OPR\//.test(ua)?'Opera':'Unknown';
    const os = /Windows/.test(ua)?'Windows': /Mac OS X/.test(ua)?'macOS': /Android/.test(ua)?'Android': /iPhone|iPad/.test(ua)?'iOS': /Linux/.test(ua)?'Linux':'Unknown';
    const mobile = /Mobile|Android|iPhone/.test(ua) ? 'Yes':'No';
    return {browser, os, mobile};
  }
  root.querySelector('#uaIn').addEventListener('input', e=>{
    const r = parse(e.target.value);
    root.querySelector('#uaOut').innerHTML = `<tr><td>Browser</td><td>${r.browser}</td></tr><tr><td>OS</td><td>${r.os}</td></tr><tr><td>Mobile</td><td>${r.mobile}</td></tr>`;
  });
  root.querySelector('#uaMine').addEventListener('click', ()=>{
    root.querySelector('#uaIn').value = navigator.userAgent;
    root.querySelector('#uaIn').dispatchEvent(new Event('input'));
  });
});

dev('jsonyaml','JSON ↔ YAML', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="jyIn" placeholder='{"name":"example","tags":["a","b"]}'></textarea></div>
    <div class="segrow"><button class="btn primary" id="jyToYaml">JSON → YAML</button><button class="btn" id="jyToJson">YAML → JSON</button></div>
    <div class="output" id="jyOut">Result will appear here.</div>
    <div class="hint">Supports common structures (objects, arrays, strings, numbers, booleans, null) — not the full YAML spec (anchors, multi-doc, etc.).</div>`;
  function toYaml(obj, indent=0){
    const pad = '  '.repeat(indent);
    if(Array.isArray(obj)){
      if(!obj.length) return '[]';
      return obj.map(v=> typeof v==='object' && v!==null ? `${pad}-\n${toYaml(v,indent+1)}` : `${pad}- ${scalarYaml(v)}`).join('\n');
    }
    if(obj && typeof obj==='object'){
      const keys = Object.keys(obj);
      if(!keys.length) return '{}';
      return keys.map(k=>{
        const v = obj[k];
        if(v && typeof v==='object') return `${pad}${k}:\n${toYaml(v,indent+1)}`;
        return `${pad}${k}: ${scalarYaml(v)}`;
      }).join('\n');
    }
    return pad+scalarYaml(obj);
  }
  function scalarYaml(v){
    if(v===null) return 'null';
    if(typeof v==='string') return /[:#\-\[\]{}]/.test(v) ? `"${v.replace(/"/g,'\\"')}"` : v;
    return String(v);
  }
  function parseYaml(text){
    const lines = text.split('\n').filter(l=>l.trim()!=='' && !l.trim().startsWith('#'));
    let idx=0;
    function indentOf(l){ return l.match(/^\s*/)[0].length; }
    function parseBlock(baseIndent){
      const firstLine = lines[idx];
      if(firstLine && /^\s*-/.test(firstLine) && indentOf(firstLine)===baseIndent){
        const arr=[];
        while(idx<lines.length && indentOf(lines[idx])===baseIndent && /^\s*-/.test(lines[idx])){
          const rest = lines[idx].replace(/^\s*-\s?/,'');
          if(rest.trim()===''){ idx++; arr.push(parseBlock(baseIndent+2)); }
          else if(/^[^:]+:\s*.*/.test(rest) || (idx+1<lines.length && indentOf(lines[idx+1])>baseIndent)){
            idx++; arr.push(parseValue(rest)); // simplistic
          } else { arr.push(parseScalar(rest)); idx++; }
        }
        return arr;
      }
      const obj={};
      while(idx<lines.length && indentOf(lines[idx])===baseIndent){
        const line = lines[idx];
        const m = line.match(/^\s*([^:]+):\s*(.*)$/);
        if(!m) break;
        const key = m[1].trim(); const val = m[2];
        idx++;
        if(val.trim()===''){
          if(idx<lines.length && indentOf(lines[idx])>baseIndent) obj[key] = parseBlock(indentOf(lines[idx]));
          else obj[key] = null;
        } else obj[key] = parseScalar(val);
      }
      return obj;
    }
    function parseValue(str){ return parseScalar(str); }
    function parseScalar(s){
      s=s.trim();
      if(s==='null'||s==='~'||s==='') return null;
      if(s==='true') return true; if(s==='false') return false;
      if(/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
      if(/^".*"$/.test(s)) return s.slice(1,-1).replace(/\\"/g,'"');
      return s;
    }
    return parseBlock(0);
  }
  root.querySelector('#jyToYaml').addEventListener('click', ()=>{
    const out = root.querySelector('#jyOut');
    try{ out.textContent = toYaml(JSON.parse(root.querySelector('#jyIn').value)); }
    catch(e){ out.textContent = 'Invalid JSON: '+e.message; }
  });
  root.querySelector('#jyToJson').addEventListener('click', ()=>{
    const out = root.querySelector('#jyOut');
    try{ out.textContent = JSON.stringify(parseYaml(root.querySelector('#jyIn').value), null, 2); }
    catch(e){ out.textContent = 'Could not parse YAML: '+e.message; }
  });
});

dev('unixtime','Unix Timestamp Converter', root=>{
  root.innerHTML = `
    <div class="field"><label>Unix timestamp (seconds)</label><input type="number" id="utTs"></div>
    <div class="segrow"><button class="btn" id="utNow">Use current time</button></div>
    <div class="output" id="utOut1">—</div>
    <div class="divider"></div>
    <div class="field"><label>Date & time</label><input type="datetime-local" id="utDate"></div>
    <div class="output" id="utOut2">—</div>`;
  root.querySelector('#utTs').addEventListener('input', e=>{
    const ts = +e.target.value;
    const out = root.querySelector('#utOut1');
    if(!e.target.value){ out.textContent='—'; return; }
    out.textContent = new Date(ts*1000).toString();
  });
  root.querySelector('#utNow').addEventListener('click', ()=>{
    root.querySelector('#utTs').value = Math.floor(Date.now()/1000);
    root.querySelector('#utTs').dispatchEvent(new Event('input'));
  });
  root.querySelector('#utDate').addEventListener('input', e=>{
    const out = root.querySelector('#utOut2');
    if(!e.target.value){ out.textContent='—'; return; }
    out.textContent = Math.floor(new Date(e.target.value).getTime()/1000) + ' (Unix seconds)';
  });
});

dev('jsondiff','JSON Diff', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>JSON A</label><textarea id="jdA" placeholder='{"name":"old","version":1}'></textarea></div>
      <div class="field"><label>JSON B</label><textarea id="jdB" placeholder='{"name":"new","version":2}'></textarea></div>
    </div>
    <div class="segrow"><button class="btn primary" id="jdGo">Compare</button></div>
    <div class="output" id="jdOut">Result will appear here.</div>`;
  function diff(a, b, path=''){
    const out = [];
    const keys = new Set([...(a&&typeof a==='object'?Object.keys(a):[]), ...(b&&typeof b==='object'?Object.keys(b):[])]);
    if(a===null || b===null || typeof a!=='object' || typeof b!=='object' || Array.isArray(a)!==Array.isArray(b)){
      if(JSON.stringify(a)!==JSON.stringify(b)) out.push({path:path||'(root)', a, b});
      return out;
    }
    keys.forEach(k=>{
      const p = path ? `${path}.${k}` : k;
      const av = a?.[k], bv = b?.[k];
      if(!(k in (a||{}))) out.push({path:p, a:'(missing)', b:bv});
      else if(!(k in (b||{}))) out.push({path:p, a:av, b:'(missing)'});
      else if(typeof av==='object' && typeof bv==='object' && av!==null && bv!==null) out.push(...diff(av,bv,p));
      else if(JSON.stringify(av)!==JSON.stringify(bv)) out.push({path:p, a:av, b:bv});
    });
    return out;
  }
  root.querySelector('#jdGo').addEventListener('click', ()=>{
    const out = root.querySelector('#jdOut');
    try{
      const a = JSON.parse(root.querySelector('#jdA').value);
      const b = JSON.parse(root.querySelector('#jdB').value);
      const changes = diff(a,b);
      out.innerHTML = changes.length
        ? changes.map(c=>`<div><b>${escapeHtml(c.path)}</b>: <span style="color:#c0392b">${escapeHtml(JSON.stringify(c.a))}</span> → <span style="color:#1e8449">${escapeHtml(JSON.stringify(c.b))}</span></div>`).join('')
        : 'No differences — the two JSON values are equivalent.';
    }catch(e){ out.textContent = 'Invalid JSON in one or both fields: '+e.message; }
  });
});

/* ================================================================
   COLORS TOOLS

   ================================================================ */
TOOLS.colors = [];
let CLR_N = 0;
function clr(id, name, render){ register({cat:'colors', id, name, render}); }
function hexToRgb(hex){ hex=hex.replace('#',''); if(hex.length===3) hex=hex.split('').map(c=>c+c).join(''); const n=parseInt(hex,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }
function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join(''); }
function rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s,l=(max+min)/2;
  if(max===min){ h=s=0; } else {
    const d=max-min; s = l>0.5? d/(2-max-min) : d/(max+min);
    if(max===r) h=(g-b)/d+(g<b?6:0); else if(max===g) h=(b-r)/d+2; else h=(r-g)/d+4;
    h/=6;
  }
  return {h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100)};
}
function relLuminance(r,g,b){
  const f = v=>{ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
}

clr('colorpicker','Color Picker', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <input type="color" id="cpPick" value="#3fcb6b" aria-label="Colour to inspect" style="width:100px;height:100px;border:none;border-radius:16px;cursor:pointer">
    </div>
    <table class="mono" id="cpOut" style="margin-top:16px"></table>`;
  function update(){
    const hex = root.querySelector('#cpPick').value;
    const {r,g,b} = hexToRgb(hex);
    const {h,s,l} = rgbToHsl(r,g,b);
    root.querySelector('#cpOut').innerHTML = [
      ['HEX', hex.toUpperCase()], ['RGB', `rgb(${r}, ${g}, ${b})`], ['HSL', `hsl(${h}, ${s}%, ${l}%)`]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelector('#cpPick').addEventListener('input', update);
  update();
});

clr('imagecolorpicker','Image Color Picker', root=>{
  root.innerHTML = `
    <div class="field"><label>Upload an image</label><input type="file" id="icpFile" accept="image/*"></div>
    <div style="text-align:center"><canvas id="icpCanvas" style="max-width:100%;border-radius:10px;border:1px solid var(--line);cursor:crosshair;display:none"></canvas></div>
    <div class="hint">Click anywhere on the image to sample that pixel's color.</div>
    <table class="mono" id="icpOut"></table>`;
  const canvas = root.querySelector('#icpCanvas');
  const ctx = canvas.getContext('2d');
  root.querySelector('#icpFile').addEventListener('change', e=>{
    const file = e.target.files[0]; if(!file) return;
    const img = new Image();
    img.onload = ()=>{
      const maxW = 500; const scale = Math.min(1, maxW/img.width);
      canvas.width = img.width*scale; canvas.height = img.height*scale;
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      canvas.style.display='block';
    };
    img.src = URL.createObjectURL(file);
  });
  canvas.addEventListener('click', e=>{
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX-rect.left) * (canvas.width/rect.width));
    const y = Math.floor((e.clientY-rect.top) * (canvas.height/rect.height));
    const [r,g,b] = ctx.getImageData(x,y,1,1).data;
    const hex = rgbToHex(r,g,b);
    root.querySelector('#icpOut').innerHTML = `<tr><td><span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${hex};vertical-align:-2px;margin-right:6px"></span>HEX</td><td>${hex.toUpperCase()}</td></tr><tr><td>RGB</td><td>rgb(${r}, ${g}, ${b})</td></tr>`;
  });
});

clr('blendcolors','Blend Colors', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Color A</label><input type="color" id="bcA" value="#3fcb6b" style="width:100%;height:50px;border:none;border-radius:8px"></div>
      <div class="field"><label>Color B</label><input type="color" id="bcB" value="#2f86eb" style="width:100%;height:50px;border:none;border-radius:8px"></div>
    </div>
    <div class="field"><label>Blend ratio (% of Color B)</label><input type="range" id="bcRatio" min="0" max="100" value="50"></div>
    <div style="text-align:center;padding:10px 0">
      <div id="bcSwatch" style="width:100px;height:100px;border-radius:16px;margin:0 auto;border:1px solid var(--line)"></div>
    </div>
    <div class="output" id="bcOut">—</div>`;
  function update(){
    const a = hexToRgb(root.querySelector('#bcA').value);
    const b = hexToRgb(root.querySelector('#bcB').value);
    const t = root.querySelector('#bcRatio').value/100;
    const r = a.r+(b.r-a.r)*t, g = a.g+(b.g-a.g)*t, bl = a.b+(b.b-a.b)*t;
    const hex = rgbToHex(r,g,bl);
    root.querySelector('#bcSwatch').style.background = hex;
    root.querySelector('#bcOut').innerHTML = `<span class="big">${hex.toUpperCase()}</span>  rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(bl)})`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

clr('isdarkened','Is Color Darkened', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <input type="color" id="idPick" value="#222222" style="width:100px;height:100px;border:none;border-radius:16px;cursor:pointer">
    </div>
    <table class="mono" id="idOut" style="margin-top:16px"></table>`;
  function update(){
    const hex = root.querySelector('#idPick').value;
    const {r,g,b} = hexToRgb(hex);
    const lum = relLuminance(r,g,b);
    const isDark = lum < 0.5;
    root.querySelector('#idOut').innerHTML = [
      ['Color', hex.toUpperCase()],
      ['Relative luminance', fmtNum(lum,4)],
      ['Classification', isDark ? 'Dark' : 'Light'],
      ['Recommended text color', isDark ? 'White' : 'Black']
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelector('#idPick').addEventListener('input', update);
  update();
});

