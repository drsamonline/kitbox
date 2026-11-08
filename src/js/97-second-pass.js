/* ================================================================
   DEVELOPMENT TOOLS — 9 additions, from drsamonline/TTB
   ================================================================ */

/* 17. ULID & NanoID */
dev('ulid','ULID & NanoID', root=>{
  const CROCK = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const NANO = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  function ulid(){
    let ts = Date.now(), time = '';
    for(let i=0;i<10;i++){ time = CROCK[ts % 32] + time; ts = Math.floor(ts/32); }
    const rnd = crypto.getRandomValues(new Uint8Array(16));
    let out = '';
    for(let i=0;i<16;i++) out += CROCK[rnd[i] % 32];
    return time + out;
  }
  function nanoid(n, alphabet){
    const rnd = crypto.getRandomValues(new Uint8Array(n));
    let s = '';
    for(let i=0;i<n;i++) s += alphabet[rnd[i] % alphabet.length];
    return s;
  }
  root.innerHTML = `
    <div class="field"><label>How many</label><input type="number" id="ulCount" value="5" min="1" max="50"></div>
    <div class="row">
      <div class="field"><label>NanoID length</label><input type="number" id="ulLen" value="21" min="4" max="64"></div>
      <div class="field"><label>NanoID alphabet</label><select id="ulAlpha">
        <option value="url">URL-safe</option><option value="alnum">Letters and digits</option><option value="digits">Digits only</option>
      </select></div>
    </div>
    <div class="row"><button class="btn primary" id="ulGen">Generate</button></div>
    <div class="output" id="ulOut">—</div>
    <div class="hint">ULID is 26 characters: a 48-bit millisecond timestamp followed by 80 random bits, so it sorts by creation time. NanoID is a flat random identifier — shorter, no ordering.</div>`;
  root.querySelector('#ulGen').addEventListener('click', ()=>{
    const n = Math.min(50, Math.max(1, +root.querySelector('#ulCount').value || 5));
    const len = Math.min(64, Math.max(4, +root.querySelector('#ulLen').value || 21));
    const alphaKey = root.querySelector('#ulAlpha').value;
    const alpha = alphaKey === 'digits' ? '0123456789'
      : alphaKey === 'alnum' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      : NANO;
    const rows = [];
    for(let i=0;i<n;i++) rows.push([ulid(), nanoid(len, alpha)]);
    root.querySelector('#ulOut').innerHTML = `<table class="mono"><tr><th style="text-align:left">ULID</th><th style="text-align:left">NanoID</th></tr>${rows.map(([u,nn])=>`<tr><td>${u}</td><td>${nn}</td></tr>`).join('')}</table>`;
  });
});

/* 18. Base32 / Base58 */
dev('base32','Base32 / Base58 Codec', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="b58In" placeholder="Type text to encode"></textarea></div>
    <div class="row">
      <button class="btn primary" data-b="32enc">Base32 encode</button>
      <button class="btn" data-b="32dec">Base32 decode</button>
      <button class="btn" data-b="58enc">Base58 encode</button>
      <button class="btn" data-b="58dec">Base58 decode</button>
    </div>
    <div class="field"><label>Result</label><textarea id="b58Out"></textarea></div>
    <div class="hint">Base32 uses the RFC 4648 alphabet with padding; Base58 is the Bitcoin alphabet, which drops the characters that look alike (0, O, I, l).</div>`;
  const inp = root.querySelector('#b58In'), out = root.querySelector('#b58Out');
  root.querySelectorAll('[data-b]').forEach(b=>b.addEventListener('click', ()=>{
    try{
      const v = inp.value;
      if(b.dataset.b === '32enc') out.value = toBase32(bytesFromText(v));
      else if(b.dataset.b === '32dec') out.value = textFromBytes(fromBase32(v));
      else if(b.dataset.b === '58enc') out.value = toBase58(bytesFromText(v));
      else out.value = textFromBytes(fromBase58(v.trim()));
    }catch(e){ out.value = 'That input could not be decoded — '+e.message; }
  }));
});

/* 19. HMAC */
dev('hmac','HMAC Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>Message</label><textarea id="hmMsg" placeholder="message to sign"></textarea></div>
    <div class="field"><label>Secret key</label><input type="text" id="hmKey" placeholder="shared secret"></div>
    <div class="field"><label>Hash</label><select id="hmAlgo"><option>SHA-256</option><option>SHA-1</option><option>SHA-384</option><option>SHA-512</option></select></div>
    <div class="row"><button class="btn primary" id="hmGo">Sign</button></div>
    <div class="output" id="hmOut">—</div>
    <div class="hint">HMAC-SHA256 is what most webhooks use to prove a payload came from the sender. Compare signatures with a constant-time check in real code, not with a plain string comparison.</div>`;
  root.querySelector('#hmGo').addEventListener('click', async ()=>{
    const out = root.querySelector('#hmOut');
    try{
      const key = await crypto.subtle.importKey('raw', bytesFromText(root.querySelector('#hmKey').value), {name:'HMAC', hash:root.querySelector('#hmAlgo').value}, false, ['sign']);
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, bytesFromText(root.querySelector('#hmMsg').value)));
      const hex = Array.from(sig).map(b=>b.toString(16).padStart(2,'0')).join('');
      const b64 = btoa(String.fromCharCode(...sig));
      out.innerHTML = `<table class="mono"><tr><td>hex</td><td style="word-break:break-all">${hex}</td></tr><tr><td>base64</td><td style="word-break:break-all">${b64}</td></tr></table>`;
    }catch(e){ out.textContent = 'Signing failed: '+(e.message||e); }
  });
});

/* 20. MD5 */
dev('md5','MD5 Hash', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="md5In" placeholder="text to hash"></textarea></div>
    <div class="output" id="md5Out">—</div>
    <div class="hint">MD5 is here for legacy checksums (download lists, old APIs) — it is not collision-resistant and must never be used for passwords. For anything security-related use SHA-256 or a real password hash.</div>`;
  const inp = root.querySelector('#md5In'), out = root.querySelector('#md5Out');
  function run(){ out.innerHTML = inp.value ? `<div class="mono" style="word-break:break-all">${md5(bytesFromText(inp.value))}</div>` : '—'; }
  inp.addEventListener('input', run);
  run();
});

/* 21. CIDR / Subnet Calculator */
dev('subnet','CIDR / Subnet Calculator', root=>{
  root.innerHTML = `
    <div class="field"><label>CIDR or address with mask</label><input type="text" id="snCidr" value="192.168.1.0/24"></div>
    <div class="row"><button class="btn primary" id="snGo">Calculate</button></div>
    <div class="output" id="snOut">—</div>
    <div class="hint">IPv4 only. The host count excludes the network and broadcast addresses, which is what you can actually assign on a normal subnet.</div>`;
  function ipToInt(ip){
    const p = ip.split('.').map(Number);
    if(p.length !== 4 || p.some(x=>isNaN(x)||x<0||x>255)) return null;
    return ((p[0]<<24) | (p[1]<<16) | (p[2]<<8) | p[3]) >>> 0;
  }
  function intToIp(n){ return [(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255].join('.'); }
  root.querySelector('#snGo').addEventListener('click', ()=>{
    const out = root.querySelector('#snOut');
    const raw = root.querySelector('#snCidr').value.trim();
    const [ipPart, maskPart] = raw.split('/');
    const ip = ipToInt(ipPart);
    const bits = maskPart === undefined ? 32 : Number(maskPart);
    if(ip === null || isNaN(bits) || bits < 0 || bits > 32){ out.textContent = 'Enter an IPv4 address in CIDR form, for example 192.168.1.0/24.'; return; }
    const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32-bits)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const hosts = bits >= 31 ? (bits===32?1:2) : Math.pow(2, 32-bits) - 2;
    const rows = [
      ['Network', intToIp(network)],
      ['Broadcast', intToIp(broadcast)],
      ['Subnet mask', intToIp(mask)],
      ['Wildcard', intToIp(~mask >>> 0)],
      ['Prefix', '/'+bits],
      ['Address range', intToIp(network)+' – '+intToIp(broadcast)],
      ['Usable hosts', hosts.toLocaleString(numLocale())],
      ['First host', bits >= 31 ? intToIp(network) : intToIp(network+1)],
      ['Last host', bits >= 31 ? intToIp(broadcast) : intToIp(broadcast-1)],
      ['Class', ipPart.split('.')[0] < 128 ? 'A' : ipPart.split('.')[0] < 192 ? 'B' : ipPart.split('.')[0] < 224 ? 'C' : 'D/E'],
      ['Private', /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ipPart) ? 'yes (RFC 1918)' : 'no']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  });
});

/* 22. MIME Type Lookup */
dev('mime','MIME Type Lookup', root=>{
  const MIME = {
    'txt':'text/plain','html':'text/html','htm':'text/html','css':'text/css','js':'text/javascript','mjs':'text/javascript',
    'json':'application/json','xml':'application/xml','csv':'text/csv','tsv':'text/tab-separated-values','md':'text/markdown',
    'pdf':'application/pdf','zip':'application/zip','gz':'application/gzip','tar':'application/x-tar','7z':'application/x-7z-compressed',
    'png':'image/png','jpg':'image/jpeg','jpeg':'image/jpeg','gif':'image/gif','webp':'image/webp','svg':'image/svg+xml',
    'avif':'image/avif','ico':'image/x-icon','bmp':'image/bmp','tif':'image/tiff','tiff':'image/tiff','heic':'image/heic',
    'mp3':'audio/mpeg','wav':'audio/wav','ogg':'audio/ogg','flac':'audio/flac','m4a':'audio/mp4','opus':'audio/opus',
    'mp4':'video/mp4','webm':'video/webm','mov':'video/quicktime','avi':'video/x-msvideo','mkv':'video/x-matroska',
    'woff':'font/woff','woff2':'font/woff2','ttf':'font/ttf','otf':'font/otf',
    'doc':'application/msword','docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls':'application/vnd.ms-excel','xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt':'application/vnd.ms-powerpoint','pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'apk':'application/vnd.android.package-archive','exe':'application/vnd.microsoft.portable-executable',
    'epub':'application/epub+zip','ics':'text/calendar','vcf':'text/vcard','wasm':'application/wasm','php':'application/x-httpd-php'
  };
  root.innerHTML = `
    <div class="field"><label>Extension or MIME type</label><input type="text" id="miIn" placeholder=".webp  or  image/png"></div>
    <div class="output" id="miOut">—</div>
    <div class="hint">The table is deliberately small and common — this is a reference for everyday work, not the IANA registry.</div>`;
  const inp = root.querySelector('#miIn'), out = root.querySelector('#miOut');
  function run(){
    const q = inp.value.trim().toLowerCase().replace(/^\./,'');
    if(!q){ out.textContent = '—'; return; }
    const hits = [];
    if(q.includes('/')){
      Object.entries(MIME).forEach(([ext, type])=>{ if(type === q) hits.push([ext, type]); });
    } else {
      if(MIME[q]) hits.push([q, MIME[q]]);
      Object.entries(MIME).forEach(([ext, type])=>{ if(ext !== q && (ext.startsWith(q) || type.includes(q))) hits.push([ext, type]); });
    }
    out.innerHTML = hits.length
      ? `<table class="mono">${hits.slice(0,20).map(([e,t])=>`<tr><td>.${e}</td><td>${t}</td></tr>`).join('')}</table>`
      : 'No match in the table.';
  }
  inp.addEventListener('input', run);
  run();
});

/* 23. Markdown Preview */
dev('mdpreview','Markdown Preview', root=>{
  root.innerHTML = `
    <div class="field"><label>Markdown</label><textarea id="mpIn" style="min-height:180px"># Heading

Some **bold**, some *italic*, some \`code\`.

- a list item
- another

> a quote

[link](https://example.com)</textarea></div>
    <div class="section-label">Preview</div>
    <div class="output" id="mpOut" style="min-height:120px"></div>
    <div class="hint">A small renderer for headings, emphasis, inline code, links, lists, quotes and rules. HTML in the source is escaped, never executed — that is the point of previewing it here.</div>`;
  const inp = root.querySelector('#mpIn'), out = root.querySelector('#mpOut');
  function render(src){
    let s = escapeHtml(src);
    s = s.replace(/```([\s\S]*?)```/g, (m,code)=>`<pre style="background:#f6f6f4;padding:10px;overflow:auto"><code>${code.trim()}</code></pre>`);
    s = s.replace(/^###### (.*)$/gm,'<h6>$1</h6>').replace(/^##### (.*)$/gm,'<h5>$1</h5>')
         .replace(/^#### (.*)$/gm,'<h4>$1</h4>').replace(/^### (.*)$/gm,'<h3>$1</h3>')
         .replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1 style="font-size:22px;margin:14px 0 8px">$1</h1>');
    s = s.replace(/^\s*&gt; (.*)$/gm,'<blockquote style="border-left:3px solid #ddd;margin:8px 0;padding-left:12px;color:#5a5a62">$1</blockquote>');
    s = s.replace(/^\s*[-*] (.*)$/gm,'<li>$1</li>');
    s = s.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, m=>`<ul style="margin:8px 0 8px 18px">${m}</ul>`);
    s = s.replace(/^\s*(\d+)\. (.*)$/gm,'<li>$2</li>');
    s = s.replace(/^---$/gm,'<hr style="border:none;border-top:1px solid #e4e4e2;margin:14px 0">');
    s = s.replace(/`([^`]+)`/g,'<code style="background:#f1f1ef;padding:1px 5px;font-family:var(--mono);font-size:12.5px">$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">$1</a>');
    s = s.split(/\n{2,}/).map(p=>/^\s*<(h\d|ul|pre|blockquote|hr)/.test(p) ? p : `<p style="margin:8px 0;line-height:1.65">${p.replace(/\n/g,'<br>')}</p>`).join('');
    return s;
  }
  function run(){ out.innerHTML = render(inp.value); }
  inp.addEventListener('input', run);
  run();
});

/* 24. Config Parser — INI, .env and TOML in, JSON out */
dev('configparse','Config Parser (INI / .env / TOML)', root=>{
  root.innerHTML = `
    <div class="field"><label>Config text</label><textarea id="cpIn" style="min-height:170px" placeholder="[server]
host = 0.0.0.0
port = 8080

# .env style
API_KEY=abc123"></textarea></div>
    <div class="row">
      <div class="field"><label>Format</label><select id="cpFmt"><option value="auto">Detect</option><option value="ini">INI</option><option value="env">.env</option><option value="toml">TOML</option></select></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="cpGo" style="width:100%">Parse</button></div>
    </div>
    <div class="field"><label>JSON</label><textarea id="cpOut" style="min-height:170px"></textarea></div>
    <div class="hint">A tolerant reader: sections, key = value, quoted strings, numbers and booleans. It is for inspecting a config quickly, not for round-tripping one.</div>`;
  function parseIni(text){
    const out = {}; let cur = out;
    text.split(/\r?\n/).forEach(line=>{
      const l = line.trim();
      if(!l || l.startsWith('#') || l.startsWith(';')) return;
      const sec = l.match(/^\[(.+)\]$/);
      if(sec){ cur = out[sec[1].trim()] = out[sec[1].trim()] || {}; return; }
      const eq = l.indexOf('=');
      if(eq < 0) return;
      cur[l.slice(0,eq).trim()] = castVal(l.slice(eq+1).trim());
    });
    return out;
  }
  function parseEnv(text){
    const out = {};
    text.split(/\r?\n/).forEach(line=>{
      const l = line.trim();
      if(!l || l.startsWith('#')) return;
      const eq = l.indexOf('=');
      if(eq < 0) return;
      out[l.slice(0,eq).trim()] = castVal(l.slice(eq+1).trim().replace(/^["']|["']$/g,''));
    });
    return out;
  }
  function parseToml(text){
    const out = {}; let cur = out;
    text.split(/\r?\n/).forEach(line=>{
      const l = line.trim();
      if(!l || l.startsWith('#')) return;
      const sec = l.match(/^\[(.+)\]$/);
      if(sec){ cur = out[sec[1].trim()] = out[sec[1].trim()] || {}; return; }
      const eq = l.indexOf('=');
      if(eq < 0) return;
      cur[l.slice(0,eq).trim()] = castVal(l.slice(eq+1).trim().replace(/^["']|["']$/g,''));
    });
    return out;
  }
  function castVal(v){
    if(v === 'true') return true;
    if(v === 'false') return false;
    if(v !== '' && !isNaN(Number(v))) return Number(v);
    return v;
  }
  root.querySelector('#cpGo').addEventListener('click', ()=>{
    const text = root.querySelector('#cpIn').value;
    const fmt = root.querySelector('#cpFmt').value;
    const chosen = fmt === 'auto' ? (/\n\s*\[[^\]]+\]/.test(text) ? 'toml' : /^[A-Z0-9_]+\s*=/m.test(text) && !/=.*:/.test(text) ? 'env' : 'ini') : fmt;
    const out = root.querySelector('#cpOut');
    try{
      const parsed = chosen === 'env' ? parseEnv(text) : chosen === 'toml' ? parseToml(text) : parseIni(text);
      out.value = JSON.stringify(parsed, null, 2);
    }catch(e){ out.value = 'Could not parse: '+e.message; }
  });
});

/* 25. .gitignore Generator */
dev('gitignore','.gitignore Generator', root=>{
  const TPL = {
    'Node': ['node_modules/','npm-debug.log*','yarn-error.log*','.env','.env.local','dist/','coverage/','.DS_Store'],
    'Python': ['__pycache__/','*.py[cod]','.venv/','venv/','*.egg-info/','.pytest_cache/','.mypy_cache/','build/','dist/','.env'],
    'Rust': ['target/','**/*.rs.bk','Cargo.lock'],
    'Go': ['bin/','*.exe','*.test','*.out','vendor/'],
    'Java': ['*.class','target/','.gradle/','build/','*.jar','*.war'],
    'Android': ['*.apk','*.aab','build/','.gradle/','local.properties','.idea/','captures/'],
    'Flutter': ['.dart_tool/','build/','.flutter-plugins','*.iml','.idea/','ios/Pods/','android/.gradle/'],
    'Static site': ['.DS_Store','Thumbs.db','*.log','.cache/','dist/','node_modules/'],
    'Editor / OS': ['.DS_Store','Thumbs.db','.idea/','.vscode/','*.swp','*~','desktop.ini'],
    'Secrets': ['.env','.env.*','*.pem','*.key','secrets.json','credentials.json']
  };
  root.innerHTML = `
    <div class="section-label">Include</div>
    <div id="giBoxes" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
      ${Object.keys(TPL).map(k=>`<label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft)"><input type="checkbox" data-k="${escapeHtml(k)}" ${['Node','Editor / OS','Secrets'].includes(k)?'checked':''}> ${escapeHtml(k)}</label>`).join('')}
    </div>
    <div class="field"><label>Extra patterns (one per line)</label><textarea id="giExtra" placeholder="*.bak"></textarea></div>
    <div class="field"><label>.gitignore</label><textarea id="giOut" style="min-height:180px" readonly></textarea></div>
    <div class="row"><button class="btn" id="giCopy">Copy</button></div>`;
  function build(){
    const picked = Array.from(root.querySelectorAll('[data-k]')).filter(b=>b.checked).map(b=>b.dataset.k);
    const lines = [];
    picked.forEach(k=>{ lines.push('# '+k); TPL[k].forEach(p=>lines.push(p)); lines.push(''); });
    const extra = root.querySelector('#giExtra').value.split('\n').map(s=>s.trim()).filter(Boolean);
    if(extra.length){ lines.push('# Custom'); extra.forEach(p=>lines.push(p)); }
    root.querySelector('#giOut').value = lines.join('\n').trim()+'\n';
  }
  root.querySelectorAll('[data-k], #giExtra').forEach(el=>el.addEventListener('input', build));
  root.querySelectorAll('[data-k]').forEach(el=>el.addEventListener('change', build));
  root.querySelector('#giCopy').addEventListener('click', ()=>{
    const t = root.querySelector('#giOut');
    if(navigator.clipboard) navigator.clipboard.writeText(t.value); else { t.select(); document.execCommand('copy'); }
  });
  build();
});

/* ================================================================
   CALCULATION TOOLS — 6 additions, from drsamonline/TTB
   ================================================================ */

/* 26. Statistics */
calc('Statistics','statistics','Statistics', root=>{
  root.innerHTML = `
    <div class="field"><label>Numbers (comma, space or newline separated)</label><textarea id="stIn" placeholder="12, 15, 15, 18, 21, 22, 40"></textarea></div>
    <div class="output" id="stOut">—</div>
    <div class="hint">Sample standard deviation (n−1) is used, which is what you want for a set of measurements. Quartiles use the median-of-halves method. Outliers are flagged by the 1.5 × IQR rule.</div>`;
  const inp = root.querySelector('#stIn'), out = root.querySelector('#stOut');
  function quantile(sorted, q){
    const pos = (sorted.length-1)*q, base = Math.floor(pos), rest = pos-base;
    return sorted[base+1] !== undefined ? sorted[base] + rest*(sorted[base+1]-sorted[base]) : sorted[base];
  }
  function run(){
    const nums = (inp.value.match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g)||[]).map(Number).filter(n=>!isNaN(n));
    if(nums.length < 2){ out.textContent = 'Enter at least two numbers.'; return; }
    const sorted = [...nums].sort((a,b)=>a-b);
    const n = nums.length;
    const sum = nums.reduce((a,b)=>a+b,0), mean = sum/n;
    const median = quantile(sorted, 0.5);
    const counts = {}; nums.forEach(v=>counts[v]=(counts[v]||0)+1);
    const maxCount = Math.max(...Object.values(counts));
    const mode = maxCount > 1 ? Object.keys(counts).filter(k=>counts[k]===maxCount).map(Number) : null;
    const variance = nums.reduce((a,b)=>a+(b-mean)**2, 0)/(n-1);
    const sd = Math.sqrt(variance);
    const q1 = quantile(sorted, 0.25), q3 = quantile(sorted, 0.75), iqr = q3-q1;
    const lo = q1-1.5*iqr, hi = q3+1.5*iqr;
    const outliers = sorted.filter(v=>v<lo||v>hi);
    const rows = [
      ['Count', n], ['Sum', +sum.toFixed(6)], ['Mean', +mean.toFixed(6)],
      ['Median', +median.toFixed(6)], ['Mode', mode ? mode.join(', ') : 'none'],
      ['Min / Max', sorted[0]+' / '+sorted[n-1]],
      ['Range', +(sorted[n-1]-sorted[0]).toFixed(6)],
      ['Variance (sample)', +variance.toFixed(6)],
      ['Std deviation (sample)', +sd.toFixed(6)],
      ['Q1 / Q3', +q1.toFixed(6)+' / '+q3.toFixed(6)],
      ['IQR', +iqr.toFixed(6)],
      ['Outliers', outliers.length ? outliers.join(', ') : 'none'],
      ['Mean ± 1 SD', +(mean-sd).toFixed(3)+' … '+(mean+sd).toFixed(3)]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
  }
  inp.addEventListener('input', run);
  run();
});

/* 27. Correlation & Linear Regression */
calc('Statistics','regression','Correlation & Regression', root=>{
  root.innerHTML = `
    <div class="field"><label>Pairs (x,y — one per line, or x,y; x,y)</label><textarea id="rgIn" placeholder="1,2
2,4.1
3,5.9
4,8.2
5,9.8"></textarea></div>
    <div class="output" id="rgOut">—</div>
    <div class="hint">Ordinary least squares on the points you enter, plus Pearson's r. Correlation is not causation, and with five points it is barely evidence of anything — the tool reports the fit, not a verdict.</div>`;
  const inp = root.querySelector('#rgIn'), out = root.querySelector('#rgOut');
  function run(){
    const pairs = inp.value.trim().split(/\n|;/).map(l=>l.split(/[,\s\t]+/).map(Number)).filter(p=>p.length>=2 && !isNaN(p[0]) && !isNaN(p[1]));
    if(pairs.length < 2){ out.textContent = 'Enter at least two x,y pairs.'; return; }
    const n = pairs.length;
    const mx = pairs.reduce((a,p)=>a+p[0],0)/n, my = pairs.reduce((a,p)=>a+p[1],0)/n;
    let sxx=0, syy=0, sxy=0;
    pairs.forEach(([x,y])=>{ sxx += (x-mx)**2; syy += (y-my)**2; sxy += (x-mx)*(y-my); });
    const slope = sxx ? sxy/sxx : NaN, intercept = my - slope*mx;
    const r = (sxx && syy) ? sxy/Math.sqrt(sxx*syy) : NaN;
    const r2 = r*r;
    const rows = [
      ['Points', n],
      ['Slope (m)', +slope.toFixed(6)],
      ['Intercept (b)', +intercept.toFixed(6)],
      ['Equation', `y = ${slope.toFixed(4)}x ${intercept<0?'−':'+'} ${Math.abs(intercept).toFixed(4)}`],
      ['Pearson r', +r.toFixed(6)],
      ['R²', +r2.toFixed(6)],
      ['Mean x / y', +mx.toFixed(4)+' / '+my.toFixed(4)]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>
      <div class="hint">${r2 >= 0.9 ? 'The line explains most of the variation in these points.' : r2 >= 0.5 ? 'The line explains part of the variation — look at the points before trusting it.' : 'The line explains little of the variation. A straight line may be the wrong model.'}</div>`;
  }
  inp.addEventListener('input', run);
  run();
});

/* 28. Scientific Notation & Significant Figures */
calc('Algebra','sigfig','Scientific Notation & Sig Figs', root=>{
  root.innerHTML = `
    <div class="field"><label>Number</label><input type="text" id="sfIn" placeholder="0.004560"></div>
    <div class="row">
      <div class="field"><label>Round to significant figures</label><input type="number" id="sfN" value="3" min="1" max="15"></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="sfGo" style="width:100%">Convert</button></div>
    </div>
    <div class="output" id="sfOut">—</div>
    <div class="hint">Trailing zeros after a decimal point are significant; leading zeros never are. The count is reported from the number as you typed it, not from its numeric value.</div>`;
  root.querySelector('#sfGo').addEventListener('click', ()=>{
    const raw = root.querySelector('#sfIn').value.trim();
    const out = root.querySelector('#sfOut');
    const num = Number(raw);
    if(raw === '' || isNaN(num)){ out.textContent = 'Enter a number.'; return; }
    const mantissaDigits = raw.replace(/^[+-]/,'').replace(/^0+\./,'').replace(/\./,'').replace(/^0+/,'').replace(/0+$/,'');
    let sig = mantissaDigits.length;
    if(/\.\d*0+$/.test(raw)) sig = raw.replace(/^[+-]/,'').replace(/\./,'').replace(/^0+/,'').length;
    if(sig === 0) sig = 1;
    const n = Math.min(15, Math.max(1, +root.querySelector('#sfN').value || 3));
    const sci = num === 0 ? '0 × 10⁰' : (()=>{
      const exp = Math.floor(Math.log10(Math.abs(num)));
      const mant = num / Math.pow(10, exp);
      return `${mant.toFixed(Math.max(0, n-1))} × 10^${exp}`;
    })();
    const rounded = num === 0 ? 0 : Number(num.toPrecision(n));
    const rows = [
      ['As typed', raw], ['Significant figures', sig], ['Scientific notation', sci],
      [`Rounded to ${n} s.f.`, rounded.toLocaleString('en-US', {maximumSignificantDigits: 21})],
      ['Standard form', num === 0 ? '0' : num.toExponential(n-1)],
      ['Is an integer', Number.isInteger(num) ? 'yes' : 'no']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
  });
});

/* 29. Fuel Economy & Trip Cost */
calc('Everyday','fueleconomy','Fuel Economy & Trip Cost', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Distance (km)</label><input type="number" id="feDist" value="100"></div>
      <div class="field"><label>Fuel used (litres)</label><input type="number" id="feFuel" value="7.5" step="0.1"></div>
      <div class="field"><label>Fuel price (₹/litre)</label><input type="number" id="fePrice" value="105" step="0.5"></div>
    </div>
    <div class="output" id="feOut">—</div>
    <div class="hint">Indian convention is km per litre; most of Europe quotes litres per 100 km; the US quotes miles per gallon. All three are shown because the same car looks very different in each.</div>`;
  function run(){
    const d = +root.querySelector('#feDist').value, f = +root.querySelector('#feFuel').value, p = +root.querySelector('#fePrice').value;
    const out = root.querySelector('#feOut');
    if(!d || !f){ out.textContent = 'Enter a distance and the fuel used.'; return; }
    const kmpl = d/f, l100 = (f/d)*100, mpg = kmpl*2.35215;
    const cost = f*p, perKm = cost/d;
    const rows = [
      ['km per litre', kmpl.toFixed(2)],
      ['Litres per 100 km', l100.toFixed(2)],
      ['Miles per gallon (US)', mpg.toFixed(2)],
      ['Fuel for this trip', '₹'+cost.toFixed(0)],
      ['Cost per km', '₹'+perKm.toFixed(2)],
      ['Cost for 1,000 km', '₹'+(perKm*1000).toFixed(0)]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

/* 30. Electricity Cost */
calc('Everyday','electricity','Electricity Cost', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Power (watts)</label><input type="number" id="elW" value="1500"></div>
      <div class="field"><label>Hours per day</label><input type="number" id="elH" value="2" step="0.25"></div>
      <div class="field"><label>Rate (₹/kWh)</label><input type="number" id="elR" value="8" step="0.1"></div>
    </div>
    <div class="output" id="elOut">—</div>
    <div class="hint">Watts × hours ÷ 1000 gives kilowatt-hours. Check your bill for the real per-unit rate — it usually includes fixed charges and slabs that a single number cannot capture.</div>`;
  function run(){
    const w = +root.querySelector('#elW').value, h = +root.querySelector('#elH').value, r = +root.querySelector('#elR').value;
    const out = root.querySelector('#elOut');
    if(!w || !h){ out.textContent = 'Enter watts and hours.'; return; }
    const kwhDay = w*h/1000;
    const rows = [
      ['Per day', kwhDay.toFixed(3)+' kWh · ₹'+(kwhDay*r).toFixed(2)],
      ['Per month (30 d)', (kwhDay*30).toFixed(1)+' kWh · ₹'+(kwhDay*30*r).toFixed(0)],
      ['Per year', (kwhDay*365).toFixed(0)+' kWh · ₹'+(kwhDay*365*r).toFixed(0)],
      ['Units per hour', (w/1000).toFixed(2)+' kWh']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

/* 31. Markup / Margin / Break-even */
calc('Business','pricing','Markup, Margin & Break-even', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Cost per unit (₹)</label><input type="number" id="prCost" value="100"></div>
      <div class="field"><label>Selling price (₹)</label><input type="number" id="prPrice" value="150"></div>
      <div class="field"><label>Fixed costs (₹)</label><input type="number" id="prFixed" value="50000"></div>
    </div>
    <div class="output" id="prOut">—</div>
    <div class="hint">Markup is on cost; margin is on price. The same sale is a 50% markup and a 33% margin — mixing them up is the most common pricing mistake in small business.</div>`;
  function run(){
    const cost = +root.querySelector('#prCost').value, price = +root.querySelector('#prPrice').value, fixed = +root.querySelector('#prFixed').value;
    const out = root.querySelector('#prOut');
    if(!cost || !price){ out.textContent = 'Enter a cost and a selling price.'; return; }
    const profit = price-cost;
    const markup = profit/cost*100, margin = profit/price*100;
    const beUnits = profit > 0 ? Math.ceil(fixed/profit) : Infinity;
    const rows = [
      ['Profit per unit', '₹'+profit.toFixed(2)],
      ['Markup on cost', markup.toFixed(1)+'%'],
      ['Margin on price', margin.toFixed(1)+'%'],
      ['Break-even units', isFinite(beUnits) ? beUnits.toLocaleString(numLocale()) : 'never at this price'],
      ['Break-even revenue', isFinite(beUnits) ? '₹'+(beUnits*price).toLocaleString(numLocale()) : '—'],
      ['Price for a 40% margin', '₹'+(cost/0.6).toFixed(2)]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

/* ================================================================
   FINANCE TOOLS — 2 additions, from drsamonline/TTB
   ================================================================ */

/* 32. Savings Goal */
fin('savingsgoal','Savings Goal', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Target (₹)</label><input type="number" id="sgTarget" value="500000"></div>
      <div class="field"><label>Already saved (₹)</label><input type="number" id="sgNow" value="50000"></div>
    </div>
    <div class="row">
      <div class="field"><label>Monthly contribution (₹)</label><input type="number" id="sgMonthly" value="15000"></div>
      <div class="field"><label>Annual return (%)</label><input type="number" id="sgRate" value="7" step="0.1"></div>
    </div>
    <div class="output" id="sgOut">—</div>
    <div class="hint">Compounds monthly on the balance, with the contribution added at the end of each month. Returns are an assumption, not a promise — try 0% to see the honest baseline.</div>`;
  function run(){
    const target = +root.querySelector('#sgTarget').value, now = +root.querySelector('#sgNow').value;
    const monthly = +root.querySelector('#sgMonthly').value, rate = +root.querySelector('#sgRate').value/100/12;
    const out = root.querySelector('#sgOut');
    if(!target || !monthly){ out.textContent = 'Enter a target and a monthly contribution.'; return; }
    let bal = now, months = 0;
    while(bal < target && months < 1200){ bal = bal*(1+rate) + monthly; months++; }
    const years = Math.floor(months/12), rem = months%12;
    const rows = [
      ['Time to target', months >= 1200 ? 'more than 100 years' : `${years ? years+' yr ' : ''}${rem} mo`],
      ['Months', months >= 1200 ? '—' : months],
      ['Total contributed', '₹'+Math.round(now + monthly*months).toLocaleString(numLocale())],
      ['Balance at target', '₹'+Math.round(bal).toLocaleString(numLocale())],
      ['Growth earned', '₹'+Math.round(bal - now - monthly*months).toLocaleString(numLocale())]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

/* 33. Debt Payoff — snowball and avalanche side by side */
fin('debtpayoff','Debt Payoff Planner', root=>{
  root.innerHTML = `
    <div class="hint">One debt per line: name, balance, annual rate %, minimum payment.</div>
    <div class="field"><label>Debts</label><textarea id="dpIn" style="min-height:110px">Card, 60000, 36, 3000
Personal loan, 150000, 14, 6000
Home loan, 1200000, 8.5, 18000</textarea></div>
    <div class="field"><label>Extra payment each month (₹)</label><input type="number" id="dpExtra" value="5000"></div>
    <div class="row"><button class="btn primary" id="dpGo">Compare snowball and avalanche</button></div>
    <div class="output" id="dpOut">—</div>
    <div class="hint">Snowball clears the smallest balance first (momentum); avalanche clears the highest rate first (least interest). Both pay every minimum every month and throw the extra at one target.</div>`;
  function parse(){
    return root.querySelector('#dpIn').value.split('\n').map(l=>{
      const p = l.split(',').map(s=>s.trim());
      if(p.length < 4) return null;
      const balance = Number(p[1]), rate = Number(p[2]), min = Number(p[3]);
      if(isNaN(balance) || isNaN(rate) || isNaN(min) || balance <= 0) return null;
      return { name: p[0] || 'Debt', balance, rate: rate/100/12, min };
    }).filter(Boolean);
  }
  function simulate(debts, extra, strategy){
    let list = debts.map(d=>({...d}));
    let months = 0, interest = 0;
    const order = [];
    while(list.some(d=>d.balance > 0) && months < 720){
      months++;
      list.forEach(d=>{
        if(d.balance <= 0) return;
        const i = d.balance*d.rate;
        interest += i; d.balance += i;
      });
      let pool = extra;
      list.forEach(d=>{
        if(d.balance <= 0) return;
        const pay = Math.min(d.min, d.balance);
        d.balance -= pay;
      });
      const active = list.filter(d=>d.balance > 0);
      if(!active.length) break;
      active.sort(strategy === 'snowball' ? (a,b)=>a.balance-b.balance : (a,b)=>b.rate-a.rate);
      const target = active[0];
      if(!order.includes(target.name)) order.push(target.name);
      const pay = Math.min(pool, target.balance);
      target.balance -= pay; pool -= pay;
      while(pool > 0){
        const next = list.filter(d=>d.balance > 0).sort((a,b)=>b.rate-a.rate)[0];
        if(!next) break;
        const p2 = Math.min(pool, next.balance);
        next.balance -= p2; pool -= p2;
      }
    }
    return { months, interest, order };
  }
  root.querySelector('#dpGo').addEventListener('click', ()=>{
    const debts = parse();
    const out = root.querySelector('#dpOut');
    if(!debts.length){ out.textContent = 'Add at least one debt as: name, balance, rate, minimum.'; return; }
    const extra = +root.querySelector('#dpExtra').value || 0;
    const s = simulate(debts, extra, 'snowball');
    const a = simulate(debts, extra, 'avalanche');
    const fmt = m=>Math.floor(m/12)+' yr '+(m%12)+' mo';
    out.innerHTML = `
      <table class="mono">
        <tr><th style="text-align:left">Method</th><th style="text-align:left">Time</th><th style="text-align:left">Interest paid</th></tr>
        <tr><td>Snowball</td><td>${fmt(s.months)}</td><td>₹${Math.round(s.interest).toLocaleString(numLocale())}</td></tr>
        <tr><td>Avalanche</td><td>${fmt(a.months)}</td><td>₹${Math.round(a.interest).toLocaleString(numLocale())}</td></tr>
      </table>
      <div class="hint">Snowball order: ${escapeHtml(s.order.join(' → ') || '—')}. Avalanche order: ${escapeHtml(a.order.join(' → ') || '—')}.
      Difference in interest: ₹${Math.round(Math.abs(s.interest-a.interest)).toLocaleString(numLocale())}.</div>`;
  });
});

/* ================================================================
   HEALTH TOOLS — 1 addition, from
   drsamonline/bmi-bmr-tdee-macros-fluid-calculator
   ================================================================ */
health('tdeemacros','TDEE, Macros & Body Fat', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Sex</label><select id="tdSex"><option value="m">Male</option><option value="f">Female</option></select></div>
      <div class="field"><label>Age</label><input type="number" id="tdAge" value="35"></div>
      <div class="field"><label>Height (cm)</label><input type="number" id="tdHt" value="170"></div>
      <div class="field"><label>Weight (kg)</label><input type="number" id="tdWt" value="70" step="0.1"></div>
    </div>
    <div class="field"><label>Activity</label><select id="tdAct">
      <option value="1.2">Sedentary — desk work, little exercise</option>
      <option value="1.375">Lightly active — 1–3 days a week</option>
      <option value="1.55" selected>Moderately active — 3–5 days a week</option>
      <option value="1.725">Very active — 6–7 days a week</option>
      <option value="1.9">Extra active — physical job or twice daily</option>
    </select></div>
    <div class="row">
      <div class="field"><label>Waist (cm, optional)</label><input type="number" id="tdWaist" step="0.1"></div>
      <div class="field"><label>Neck (cm, optional)</label><input type="number" id="tdNeck" step="0.1"></div>
      <div class="field"><label>Hip (cm, women, optional)</label><input type="number" id="tdHip" step="0.1"></div>
    </div>
    <div class="output" id="tdOut">—</div>
    <div class="hint">BMR by Mifflin–St Jeor; body fat by the US Navy circumference formula, which needs the waist (and hip, for women) measurements. These are estimates for planning, not a diagnosis — a clinician's assessment beats any calculator.</div>`;
  function run(){
    const sex = root.querySelector('#tdSex').value;
    const age = +root.querySelector('#tdAge').value, ht = +root.querySelector('#tdHt').value, wt = +root.querySelector('#tdWt').value;
    const act = +root.querySelector('#tdAct').value;
    const out = root.querySelector('#tdOut');
    if(!age || !ht || !wt){ out.textContent = 'Fill in age, height and weight.'; return; }
    const bmr = sex === 'm' ? 10*wt + 6.25*ht - 5*age + 5 : 10*wt + 6.25*ht - 5*age - 161;
    const tdee = bmr*act;
    const bmi = wt/Math.pow(ht/100, 2);
    const waist = +root.querySelector('#tdWaist').value, neck = +root.querySelector('#tdNeck').value, hip = +root.querySelector('#tdHip').value;
    let bf = null;
    if(waist && neck){
      if(sex === 'm') bf = 495/(1.0324 - 0.19077*Math.log10(waist-neck) + 0.15456*Math.log10(ht)) - 450;
      else if(hip) bf = 495/(1.29579 - 0.35004*Math.log10(waist+hip-neck) + 0.22100*Math.log10(ht)) - 450;
    }
    const protein = wt*1.6, fat = tdee*0.25/9, carbs = (tdee - protein*4 - fat*9)/4;
    const rows = [
      ['BMR', Math.round(bmr)+' kcal/day'],
      ['Maintenance (TDEE)', Math.round(tdee)+' kcal/day'],
      ['Fat loss (−20%)', Math.round(tdee*0.8)+' kcal/day'],
      ['Lean gain (+10%)', Math.round(tdee*1.1)+' kcal/day'],
      ['BMI', bmi.toFixed(1) + (bmi < 18.5 ? ' · underweight' : bmi < 23 ? ' · normal (Asian cut-off)' : bmi < 25 ? ' · overweight (Asian cut-off)' : ' · obese (Asian cut-off)')],
      ['Body fat (Navy)', bf && isFinite(bf) && bf > 0 ? bf.toFixed(1)+'%' : 'add waist and neck measurements'],
      ['Protein', Math.round(protein)+' g/day (1.6 g/kg)'],
      ['Fat', Math.round(fat)+' g/day (25% of calories)'],
      ['Carbs', Math.round(Math.max(0,carbs))+' g/day (remainder)']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

/* ================================================================
   TEXT TOOLS — 2 additions, from drsamonline/ml-kit and TTB
   ================================================================ */

/* 34. Keywords & Similarity — tf-idf, no model, no network */
txt('Analysis Tools','keywords','Keywords & Text Similarity', root=>{
  const STOP = new Set(('a an the and or but if then than that this these those of in on at to for from by with without into over under '
    + 'is are was were be been being am do does did done have has had having it its as not no nor so such too very can could should would '
    + 'may might must will shall about above after again against all any because before below between both each few more most other some '
    + 'only own same up down out off further once here there when where why how what which who whom you your yours we our ours they them '
    + 'their theirs he him his she her hers i me my mine us also just like get got make made use used using one two').split(/\s+/));
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="kwIn" style="min-height:130px" placeholder="Paste a paragraph, an abstract, or a set of notes."></textarea></div>
    <div class="field"><label>Compare with (optional — a second text)</label><textarea id="kwIn2" placeholder="Paste another text to measure similarity"></textarea></div>
    <div class="row"><button class="btn primary" id="kwGo">Analyse</button></div>
    <div class="output" id="kwOut">—</div>
    <div class="hint">Keywords are ranked by tf-idf against the two texts you provide — a word is important when it appears often here and rarely in the comparison. Nothing is sent anywhere and there is no model involved.</div>`;
  function tokens(text){
    return (text.toLowerCase().match(/[a-z][a-z'’-]{1,}|\d+(?:\.\d+)?/g)||[]).filter(w=>w.length > 2 && !STOP.has(w));
  }
  root.querySelector('#kwGo').addEventListener('click', ()=>{
    const a = root.querySelector('#kwIn').value;
    const b = root.querySelector('#kwIn2').value;
    const out = root.querySelector('#kwOut');
    if(!a.trim()){ out.textContent = 'Paste some text first.'; return; }
    const docs = [tokens(a), b.trim() ? tokens(b) : []];
    const df = {};
    docs.forEach(t=>{ new Set(t).forEach(w=>df[w]=(df[w]||0)+1); });
    const nDocs = b.trim() ? 2 : 1;
    const tf = {};
    docs[0].forEach(w=>tf[w]=(tf[w]||0)+1);
    const scored = Object.entries(tf).map(([w,c])=>{
      const idf = Math.log((nDocs+1)/((df[w]||0)+1)) + 1;
      return [w, c*idf];
    }).sort((x,y)=>y[1]-x[1]).slice(0,18);
    let sim = null;
    if(b.trim() && docs[1].length){
      const vocab = [...new Set([...docs[0], ...docs[1]])];
      const vec = doc=>{
        const f = {}; doc.forEach(w=>f[w]=(f[w]||0)+1);
        return vocab.map(w=>{
          const idf = Math.log((nDocs+1)/((df[w]||0)+1)) + 1;
          return (f[w]||0)*idf;
        });
      };
      const va = vec(docs[0]), vb = vec(docs[1]);
      let dot=0, na=0, nb=0;
      for(let i=0;i<va.length;i++){ dot += va[i]*vb[i]; na += va[i]*va[i]; nb += vb[i]*vb[i]; }
      sim = (na && nb) ? dot/Math.sqrt(na*nb) : 0;
    }
    out.innerHTML = `<table class="mono">
      <tr><td>Words</td><td>${docs[0].length}</td></tr>
      <tr><td>Unique words</td><td>${new Set(docs[0]).size}</td></tr>
      ${sim !== null ? `<tr><td>Cosine similarity</td><td>${(sim*100).toFixed(1)}%</td></tr>` : ''}
      </table>
      <div class="section-label" style="margin-top:14px">Top keywords</div>
      <div class="mono" style="line-height:2">${scored.map(([w,s])=>`<span style="display:inline-block;border:1px solid #e4e4e2;padding:2px 8px;margin:0 6px 6px 0">${escapeHtml(w)} <span style="color:#9a9a9f">${s.toFixed(1)}</span></span>`).join('')}</div>`;
  });
});

/* 35. Readability & Reading Time */
txt('Analysis Tools','readability','Readability & Reading Time', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="rdIn" style="min-height:150px" placeholder="Paste the text you are about to publish."></textarea></div>
    <div class="output" id="rdOut">—</div>
    <div class="hint">Flesch Reading Ease and Flesch–Kincaid grade level, computed from words, sentences and estimated syllables. Both formulas were built for English prose; treat them as a rough guide for anything else.</div>`;
  const inp = root.querySelector('#rdIn'), out = root.querySelector('#rdOut');
  function syllables(word){
    const w = word.toLowerCase().replace(/[^a-z]/g,'');
    if(!w) return 0;
    if(w.length <= 3) return 1;
    let s = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'').match(/[aeiouy]{1,2}/g);
    return s ? s.length : 1;
  }
  function run(){
    const text = inp.value.trim();
    if(!text){ out.textContent = '—'; return; }
    const words = (text.match(/[A-Za-z0-9'’-]+/g)||[]);
    const sentences = text.split(/[.!?]+/).filter(s=>s.trim().length).length || 1;
    const syl = words.reduce((a,w)=>a+syllables(w), 0);
    const wps = words.length/sentences, spw = syl/Math.max(1,words.length);
    const ease = 206.835 - 1.015*wps - 84.6*spw;
    const grade = 0.39*wps + 11.8*spw - 15.59;
    const minutes = words.length/220;
    const verdict = ease >= 70 ? 'Easy — plain English, good for a general audience.'
      : ease >= 50 ? 'Fairly difficult — a motivated general reader will manage.'
      : 'Difficult — expect it to be read by people who already care about the subject.';
    const rows = [
      ['Words', words.length], ['Sentences', sentences],
      ['Words per sentence', wps.toFixed(1)],
      ['Syllables per word', spw.toFixed(2)],
      ['Flesch Reading Ease', ease.toFixed(1)],
      ['Flesch–Kincaid grade', grade.toFixed(1)],
      ['Reading time', minutes < 1 ? 'under a minute' : Math.round(minutes)+' min at 220 wpm'],
      ['Speaking time', Math.round(words.length/130)+' min at 130 wpm']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table><div class="hint">${escapeHtml(verdict)}</div>`;
  }
  inp.addEventListener('input', run);
  run();
});

/* ================================================================
   COLOURS TOOLS — 3 additions, from drsamonline/TTB and
   drsamonline/app-image-toolkit
   ================================================================ */

/* 36. WCAG Contrast Checker */
clr('contrast','WCAG Contrast Checker', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Foreground</label><input type="text" id="ctFg" value="#17171d"></div>
      <div class="field"><label>Background</label><input type="text" id="ctBg" value="#ffffff"></div>
    </div>
    <div id="ctPreview" style="padding:22px;border:1px solid #e4e4e2;margin:6px 0 14px">
      <div style="font-size:22px;font-weight:600" id="ctBig">Large text 18.66px bold</div>
      <div style="font-size:14.5px;margin-top:8px" id="ctSmall">Body text at 14.5px — the size most of a page is set in.</div>
    </div>
    <div class="output" id="ctOut">—</div>
    <div class="hint">WCAG 2.1: 4.5:1 for body text (AA), 3:1 for large text (18.66px bold or 24px regular), 7:1 for AAA. Ratios are symmetric — swapping foreground and background changes nothing.</div>`;
  function hexToRgb(h){
    h = h.trim().replace('#','');
    if(h.length === 3) h = h.split('').map(c=>c+c).join('');
    if(!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function lum(rgb){
    const f = c=>{ c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
    return 0.2126*f(rgb[0]) + 0.7152*f(rgb[1]) + 0.0722*f(rgb[2]);
  }
  function run(){
    const fg = hexToRgb(root.querySelector('#ctFg').value), bg = hexToRgb(root.querySelector('#ctBg').value);
    const out = root.querySelector('#ctOut');
    if(!fg || !bg){ out.textContent = 'Use hex colours, for example #17171d.'; return; }
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const prev = root.querySelector('#ctPreview');
    prev.style.color = root.querySelector('#ctFg').value;
    prev.style.background = root.querySelector('#ctBg').value;
    const rows = [
      ['Contrast ratio', ratio.toFixed(2)+':1'],
      ['AA body text (4.5:1)', ratio >= 4.5 ? 'pass' : 'fail'],
      ['AA large text (3:1)', ratio >= 3 ? 'pass' : 'fail'],
      ['AAA body text (7:1)', ratio >= 7 ? 'pass' : 'fail'],
      ['AAA large text (4.5:1)', ratio >= 4.5 ? 'pass' : 'fail'],
      ['UI component (3:1)', ratio >= 3 ? 'pass' : 'fail']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

/* 37. Colour Blindness Simulator */
clr('colorblind','Colour Blindness Simulator', root=>{
  root.innerHTML = `
    <div class="field"><label>Colour</label><input type="text" id="cbHex" value="#2f86eb"></div>
    <div class="output" id="cbOut">—</div>
    <div class="hint">Brettel/Viénot-style matrix approximations of the three common types of colour vision deficiency. Roughly one in twelve men sees red and green this differently — never carry meaning in colour alone.</div>`;
  const MAT = {
    'Deuteranopia (green)': [[0.367,0.861,-0.228],[0.280,0.673,0.047],[-0.012,0.043,0.969]],
    'Protanopia (red)': [[0.152,1.053,-0.205],[0.115,0.786,0.099],[-0.004,-0.048,1.052]],
    'Tritanopia (blue)': [[1.256,-0.077,-0.179],[-0.078,0.931,0.148],[0.005,0.691,0.304]],
    'Achromatopsia (no colour)': [[0.299,0.587,0.114],[0.299,0.587,0.114],[0.299,0.587,0.114]]
  };
  function hexToRgb(h){
    h = (h||'').trim().replace('#','');
    if(h.length === 3) h = h.split('').map(c=>c+c).join('');
    if(!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function run(){
    const rgb = hexToRgb(root.querySelector('#cbHex').value);
    const out = root.querySelector('#cbOut');
    if(!rgb){ out.textContent = 'Use a hex colour, for example #2f86eb.'; return; }
    const swatches = Object.entries(MAT).map(([name,m])=>{
      const conv = m.map(row=>Math.max(0, Math.min(255, Math.round(row[0]*rgb[0] + row[1]*rgb[1] + row[2]*rgb[2]))));
      const hex = '#'+conv.map(c=>c.toString(16).padStart(2,'0')).join('');
      return {name, hex};
    });
    out.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px">
        <div style="width:110px"><div style="height:64px;background:${escapeHtml(root.querySelector('#cbHex').value)};border:1px solid #e4e4e2"></div><div class="mono" style="font-size:12px;margin-top:4px">original<br>${escapeHtml(root.querySelector('#cbHex').value)}</div></div>
        ${swatches.map(s=>`<div style="width:110px"><div style="height:64px;background:${s.hex};border:1px solid #e4e4e2"></div><div class="mono" style="font-size:12px;margin-top:4px">${escapeHtml(s.name.split(' ')[0].toLowerCase())}<br>${s.hex}</div></div>`).join('')}
      </div>
      <table class="mono">${swatches.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td>${s.hex}</td></tr>`).join('')}</table>`;
  }
  root.querySelector('#cbHex').addEventListener('input', run);
  run();
});

/* 38. Palette from Image */
clr('paletteimg','Palette from Image', root=>{
  root.innerHTML = `
    <div class="hint">The image is read here in the page — it is never uploaded.</div>
    <div class="field"><label>Image</label><input type="file" id="plFile" accept="image/*"></div>
    <div class="row">
      <div class="field"><label>Colours</label><input type="number" id="plN" value="6" min="3" max="12"></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="plGo" style="width:100%">Extract</button></div>
    </div>
    <div class="output" id="plOut">Choose an image, then extract a palette.</div>`;
  let img = null;
  root.querySelector('#plFile').addEventListener('change', e=>{
    const f = e.target.files[0]; if(!f) return;
    const im = new Image();
    im.onload = ()=>{ img = im; root.querySelector('#plOut').innerHTML = `<img src="${im.src}" alt="" style="max-width:100%;border:1px solid #e4e4e2">`; };
    im.src = URL.createObjectURL(f);
  });
  root.querySelector('#plGo').addEventListener('click', ()=>{
    const out = root.querySelector('#plOut');
    if(!img){ out.textContent = 'Choose an image first.'; return; }
    const n = Math.min(12, Math.max(3, +root.querySelector('#plN').value || 6));
    const c = document.createElement('canvas');
    const scale = Math.min(1, 220/Math.max(img.width, img.height));
    c.width = Math.max(1, Math.round(img.width*scale));
    c.height = Math.max(1, Math.round(img.height*scale));
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0,0,c.width,c.height).data;
    const buckets = new Map();
    for(let i=0;i<data.length;i+=4){
      if(data[i+3] < 128) continue;
      const key = (data[i]>>4)+','+(data[i+1]>>4)+','+(data[i+2]>>4);
      const b = buckets.get(key) || {r:0,g:0,b:0,n:0};
      b.r += data[i]; b.g += data[i+1]; b.b += data[i+2]; b.n++;
      buckets.set(key, b);
    }
    const list = [...buckets.values()].sort((a,b)=>b.n-a.n).slice(0, n*4);
    const picked = [];
    list.forEach(b=>{
      if(picked.length >= n) return;
      const col = [b.r/b.n, b.g/b.n, b.b/b.n];
      if(picked.every(p=>Math.abs(p[0]-col[0])+Math.abs(p[1]-col[1])+Math.abs(p[2]-col[2]) > 60)) picked.push(col);
    });
    const hexes = picked.map(([r,g,bl])=>'#'+[r,g,bl].map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''));
    out.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">${hexes.map(h=>`<div style="width:90px"><div style="height:60px;background:${h};border:1px solid #e4e4e2"></div><div class="mono" style="font-size:12px;margin-top:4px">${h}</div></div>`).join('')}</div>
      <div class="mono" style="line-height:1.9">${hexes.join('  ')}</div>
      <div class="hint">Bucketed to a 4-bit channel grid, then de-duplicated — good enough for a mood board, not for brand colour matching.</div>`;
  });
});

/* ================================================================
   RANDOMIZER TOOLS — 2 additions, from drsamonline/TTB
   ================================================================ */

/* 39. Random from List */
rnd('randomlist','Random from List', root=>{
  root.innerHTML = `
    <div class="field"><label>Items (one per line)</label><textarea id="rlIn" style="min-height:140px" placeholder="Asha
Ravi
Meera
Kabir"></textarea></div>
    <div class="row">
      <div class="field"><label>How many</label><input type="number" id="rlN" value="1" min="1"></div>
      <div class="field"><label>&nbsp;</label><label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);padding-top:6px"><input type="checkbox" id="rlUnique" checked> No repeats</label></div>
    </div>
    <div class="row"><button class="btn primary" id="rlGo">Pick</button></div>
    <div class="output" id="rlOut">—</div>
    <div class="hint">Uses crypto.getRandomValues, not Math.random — a fairer draw if the pick actually matters.</div>`;
  function rand(n){
    const buf = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    return Math.floor(buf*n);
  }
  root.querySelector('#rlGo').addEventListener('click', ()=>{
    let items = root.querySelector('#rlIn').value.split('\n').map(s=>s.trim()).filter(Boolean);
    const out = root.querySelector('#rlOut');
    if(!items.length){ out.textContent = 'Add some items first.'; return; }
    const unique = root.querySelector('#rlUnique').checked;
    let n = Math.max(1, +root.querySelector('#rlN').value || 1);
    if(unique && n > items.length) n = items.length;
    const picked = [];
    if(unique){
      const pool = [...items];
      for(let i=0;i<n;i++) picked.push(pool.splice(rand(pool.length),1)[0]);
    } else {
      for(let i=0;i<n;i++) picked.push(items[rand(items.length)]);
    }
    out.innerHTML = `<div class="mono" style="font-size:15px;line-height:2">${picked.map(p=>escapeHtml(p)).join('<br>')}</div>`;
  });
});

/* 40. PIN Generator */
rnd('pin','PIN Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Length</label><input type="number" id="pinLen" value="6" min="4" max="12"></div>
      <div class="field"><label>How many</label><input type="number" id="pinCount" value="5" min="1" max="50"></div>
    </div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="pinNoRepeat"> Avoid repeated and sequential digits</label>
    <div class="row"><button class="btn primary" id="pinGo">Generate</button></div>
    <div class="output" id="pinOut">—</div>
    <div class="hint">Generated with crypto.getRandomValues. A 6-digit PIN has a million combinations — fine for a phone, not for a bank card.</div>`;
  function ok(p){
    for(let i=2;i<p.length;i++) if(p[i] === p[i-1] && p[i-1] === p[i-2]) return false;
    for(let i=1;i<p.length;i++) if(+p[i] === +p[i-1] + 1) return false;
    return true;
  }
  root.querySelector('#pinGo').addEventListener('click', ()=>{
    const len = Math.min(12, Math.max(4, +root.querySelector('#pinLen').value || 6));
    const count = Math.min(50, Math.max(1, +root.querySelector('#pinCount').value || 5));
    const strict = root.querySelector('#pinNoRepeat').checked;
    const pins = [];
    let guard = 0;
    while(pins.length < count && guard++ < 5000){
      const buf = crypto.getRandomValues(new Uint8Array(len));
      const p = Array.from(buf).map(b=>b % 10).join('');
      if(strict && !ok(p)) continue;
      pins.push(p);
    }
    root.querySelector('#pinOut').innerHTML = `<div class="mono" style="font-size:16px;line-height:2;letter-spacing:0.15em">${pins.join('<br>')}</div>`;
  });
});

/* ================================================================
   Registration helpers for the second pass.
   The existing helpers (txt/gen/calc/fin/rnd/health/dev/clr/sci/geo/
   aud/game/trv/nat/prod/imgtool/fil/alm/com) all keep working; these
   are the three shapes the second pass needed on top of them.
   ================================================================ */

/* A tool that lives in the Unit Converter category but is not a simple
   factor conversion (paper sizes are two-dimensional, shoe sizes are not
   linear), so it gets its own render instead of the uconv helper. */
function unitTool(group, id, name, render){
  UNIT_N++;
  TOOLS.unit.push({id, code:'UNI-'+String(UNIT_N).padStart(2,'0'), name, group, render});
}

/* Reference — tables and cheat sheets. Static, instant, no input. */
TOOLS.reference = TOOLS.reference || [];   // idempotent: a part that sorts earlier may have registered already
let REF_N = 0;
function ref(id, name, render){ register({cat:'reference', id, name, render}); }

/* System — what this browser and this device can actually do. */
TOOLS.system = TOOLS.system || [];   // idempotent: a part that sorts earlier may have registered already
let SYS_N = 0;
function sys(id, name, render){ register({cat:'system', id, name, render}); }

/* ================================================================
   SECOND PASS — small, fast tools, added category by category.
   One tool per job: nothing here merges two existing tools, and
   nothing here duplicates one that already exists.
   ================================================================ */

/* ---------------- General (2) ---------------- */

gen('tts','Speak Text', root=>{
  root.innerHTML = `
    <div class="field"><label>Text to speak</label><textarea id="tsIn" placeholder="Type or paste the text you want read aloud.">Kitbox runs entirely on your device.</textarea></div>
    <div class="row">
      <div class="field"><label>Voice</label><select id="tsVoice"></select></div>
      <div class="field"><label>Rate</label><input type="range" id="tsRate" min="0.5" max="2" step="0.1" value="1"></div>
      <div class="field"><label>Pitch</label><input type="range" id="tsPitch" min="0" max="2" step="0.1" value="1"></div>
    </div>
    <div class="row"><button class="btn primary" id="tsGo">Speak</button><button class="btn" id="tsStop">Stop</button></div>
    <div class="hint" id="tsMsg">Uses the voices your operating system already has installed — nothing is sent to a server, and it works with the network switched off.</div>`;
  const voiceSel = root.querySelector('#tsVoice');
  function loadVoices(){
    const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    voiceSel.innerHTML = voices.length
      ? voices.map((v,i)=>`<option value="${i}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join('')
      : '<option value="">No voices available</option>';
  }
  if(!window.speechSynthesis){ root.querySelector('#tsMsg').textContent = 'This browser does not expose the speech synthesis API.'; }
  else { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  root.querySelector('#tsGo').addEventListener('click', ()=>{
    if(!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(root.querySelector('#tsIn').value);
    const voices = speechSynthesis.getVoices();
    if(voices[+voiceSel.value]) u.voice = voices[+voiceSel.value];
    u.rate = +root.querySelector('#tsRate').value;
    u.pitch = +root.querySelector('#tsPitch').value;
    speechSynthesis.speak(u);
  });
  root.querySelector('#tsStop').addEventListener('click', ()=>{ if(window.speechSynthesis) speechSynthesis.cancel(); });
  setCleanup(()=>{ try{ speechSynthesis.cancel(); }catch(e){} });
});

gen('bigclock','Big Clock', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Format</label><select id="bcFmt"><option value="24">24-hour</option><option value="12">12-hour</option></select></div>
      <div class="field"><label>Show</label><select id="bcShow"><option value="both">Time and date</option><option value="time">Time only</option></select></div>
    </div>
    <div class="output" style="text-align:center;padding:38px 12px">
      <div id="bcTime" style="font-family:var(--mono);font-size:64px;font-weight:700;letter-spacing:0.02em;color:var(--ink);line-height:1">--:--</div>
      <div id="bcDate" style="margin-top:12px;font-size:14px;color:var(--ink-soft)"></div>
    </div>
    <div class="hint">The digits use the monospace face so they do not jitter as they change.</div>`;
  function tick(){
    const now = new Date();
    const twelve = root.querySelector('#bcFmt').value === '12';
    let h = now.getHours(), suffix = '';
    if(twelve){ suffix = h >= 12 ? ' pm' : ' am'; h = h % 12 || 12; }
    const pad = n=>String(n).padStart(2,'0');
    root.querySelector('#bcTime').textContent = (twelve ? h : pad(h))+':'+pad(now.getMinutes())+':'+pad(now.getSeconds())+suffix;
    const showDate = root.querySelector('#bcShow').value === 'both';
    root.querySelector('#bcDate').textContent = showDate ? now.toLocaleDateString(undefined, {weekday:'long', day:'numeric', month:'long', year:'numeric'}) : '';
  }
  root.querySelectorAll('select').forEach(el=>el.addEventListener('change', tick));
  const t = setInterval(tick, 1000);
  setCleanup(()=>clearInterval(t));
  tick();
});

/* ---------------- Text (5) ---------------- */

txt('Cleanup Tools','accents','Remove Accents', root=>{
  root.innerHTML = `
    <div class="field"><label>Text with diacritics</label><textarea id="acIn" placeholder="Crème brûlée, jalapeño, naïve, façade, señor, Ærø"></textarea></div>
    <div class="row"><button class="btn primary" id="acGo">Strip accents</button><button class="btn" id="acCopy">Copy</button></div>
    <div class="field"><label>Plain ASCII</label><textarea id="acOut"></textarea></div>
    <div class="hint">Decomposes each character and drops the combining marks, with a small table for letters that do not decompose (æ, ø, ß, ł, đ). Useful before putting names into a system that only accepts ASCII.</div>`;
  const MAP = {'æ':'ae','Æ':'AE','ø':'o','Ø':'O','ß':'ss','ł':'l','Ł':'L','đ':'d','Đ':'D','ð':'d','Ð':'D','þ':'th','Þ':'Th','œ':'oe','Œ':'OE'};
  root.querySelector('#acGo').addEventListener('click', ()=>{
    const src = root.querySelector('#acIn').value;
    root.querySelector('#acOut').value = src
      .replace(/[æÆøØßłŁđĐðÐþÞœŒ]/g, c=>MAP[c])
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  });
  root.querySelector('#acCopy').addEventListener('click', ()=>{
    const out = root.querySelector('#acOut');
    if(navigator.clipboard) navigator.clipboard.writeText(out.value); else { out.select(); document.execCommand('copy'); }
  });
});

txt('Cleanup Tools','smartquotes','Smart Quotes Fixer', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="sqIn" placeholder="“Paste text from Word or a website here — the quotes and dashes get normalised.”"></textarea></div>
    <div class="segrow">
      <button class="btn primary" data-sq="straight">Make straight (" ' --)</button>
      <button class="btn" data-sq="curly">Make typographic (“ ” ’ –)</button>
    </div>
    <div class="field"><label>Result</label><textarea id="sqOut"></textarea></div>
    <div class="hint">Also fixes the non-breaking space, the ellipsis character and the en/em dashes — the four things that most often break a copy-paste into code, a CSV or a database.</div>`;
  const inp = root.querySelector('#sqIn'), out = root.querySelector('#sqOut');
  root.querySelectorAll('[data-sq]').forEach(b=>b.addEventListener('click', ()=>{
    let t = inp.value.replace(/[\u00a0\u2007\u202f]/g,' ');
    if(b.dataset.sq === 'straight'){
      t = t.replace(/[\u2018\u2019\u201a\u201b]/g,"'").replace(/[\u201c\u201d\u201e\u201f]/g,'"')
           .replace(/[\u2013\u2014\u2212]/g,'-').replace(/\u2026/g,'...');
    } else {
      t = t.replace(/(^|[\s(\[{])"/g,'$1\u201c').replace(/"/g,'\u201d')
           .replace(/(^|[\s(\[{])'/g,'$1\u2018').replace(/'/g,'\u2019')
           .replace(/ -- /g,' \u2014 ').replace(/ - /g,' \u2013 ').replace(/\.\.\./g,'\u2026');
    }
    out.value = t;
  }));
});

txt('Analysis Tools','wordfreq','Word Frequency', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="wfIn" style="min-height:120px" placeholder="Paste a chapter, an article, a set of notes."></textarea></div>
    <div class="row">
      <div class="field"><label>Ignore common words</label><select id="wfStop"><option value="yes">Yes — skip the, and, of…</option><option value="no">No — count every word</option></select></div>
      <div class="field"><label>Show top</label><input type="number" id="wfN" value="30" min="5" max="200"></div>
    </div>
    <div class="output" id="wfOut">—</div>
    <div class="hint">Case is folded and punctuation dropped. Character frequency is a separate tool; this one counts whole words.</div>`;
  const STOP = new Set('a an the and or but if then than that this these those of in on at to for from by with is are was were be been being it its as not no so too very can could should would may might must will shall about above after again against all any because before below between both each few more most other some only own same up down out off further once here there when where why how what which who whom you your we our they them their he him his she her i me my us also just'.split(' '));
  function run(){
    const useStop = root.querySelector('#wfStop').value === 'yes';
    const words = (root.querySelector('#wfIn').value.toLowerCase().match(/[a-z0-9'’-]{2,}/g)||[]).filter(w=>!useStop || !STOP.has(w));
    const out = root.querySelector('#wfOut');
    if(!words.length){ out.textContent = '—'; return; }
    const counts = new Map();
    words.forEach(w=>counts.set(w, (counts.get(w)||0)+1));
    const sorted = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0, +root.querySelector('#wfN').value || 30);
    const max = sorted[0][1];
    out.innerHTML = `<div class="hint">${words.length} words · ${counts.size} distinct</div>
      <table class="mono">${sorted.map(([w,c])=>`<tr><td>${escapeHtml(w)}</td><td style="width:60%"><span style="display:inline-block;height:10px;width:${Math.round(c/max*100)}%;background:var(--accent);vertical-align:middle"></span> ${c}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  root.querySelector('#wfIn').addEventListener('input', run);
  run();
});

txt('Edit Tools','wrapwidth','Hard Wrap at Width', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="hwIn" style="min-height:140px" placeholder="Paste a long paragraph to wrap it at a fixed column width."></textarea></div>
    <div class="row">
      <div class="field"><label>Wrap at (characters)</label><input type="number" id="hwN" value="72" min="20" max="200"></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="hwGo" style="width:100%">Wrap</button></div>
    </div>
    <div class="field"><label>Result</label><textarea id="hwOut"></textarea></div>
    <div class="hint">For email at 72 columns, a commit message at 72, or code comments at 80. Long words are not broken.</div>`;
  root.querySelector('#hwGo').addEventListener('click', ()=>{
    const width = Math.min(200, Math.max(20, +root.querySelector('#hwN').value || 72));
    root.querySelector('#hwOut').value = root.querySelector('#hwIn').value.split('\n').map(line=>{
      if(line.length <= width) return line;
      const out = []; let cur = '';
      line.split(/\s+/).forEach(word=>{
        if(!cur) cur = word;
        else if((cur+' '+word).length <= width) cur += ' '+word;
        else { out.push(cur); cur = word; }
      });
      if(cur) out.push(cur);
      return out.join('\n');
    }).join('\n');
  });
});

txt('Cleanup Tools','invisible','Invisible Character Detector', root=>{
  root.innerHTML = `
    <div class="field"><label>Text to inspect</label><textarea id="ivIn" placeholder="Paste text that looks fine but will not compare, compile or import."></textarea></div>
    <div class="output" id="ivOut">Paste some text.</div>
    <div class="hint">Finds the characters that break copy-paste: non-breaking spaces, zero-width spaces and joiners, the byte-order mark, soft hyphens, bidi marks, tabs and stray CRs. Each is named with its code point.</div>`;
  const NAMES = {
    '\u00a0':'non-breaking space', '\u2007':'figure space', '\u202f':'narrow no-break space',
    '\u200b':'zero-width space', '\u200c':'zero-width non-joiner', '\u200d':'zero-width joiner',
    '\u2060':'word joiner', '\ufeff':'byte-order mark', '\u00ad':'soft hyphen',
    '\u202a':'left-to-right embedding', '\u202b':'right-to-left embedding', '\u202c':'pop directional',
    '\u202d':'left-to-right override', '\u202e':'right-to-left override',
    '\u200e':'left-to-right mark', '\u200f':'right-to-left mark', '\t':'tab', '\r':'carriage return',
    '\u2028':'line separator', '\u2029':'paragraph separator'
  };
  function run(){
    const t = root.querySelector('#ivIn').value;
    const out = root.querySelector('#ivOut');
    if(!t){ out.textContent = 'Paste some text.'; return; }
    const found = new Map();
    for(const ch of t){
      if(NAMES[ch]) found.set(ch, (found.get(ch)||0)+1);
    }
    if(!found.size){ out.innerHTML = `<div class="hint">Clean — no invisible characters found in ${t.length} characters.</div>`; return; }
    out.innerHTML = `<table class="mono">${[...found.entries()].map(([ch,n])=>
      `<tr><td>${escapeHtml(NAMES[ch])}</td><td>U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}</td><td>${n}</td></tr>`).join('')}</table>
      <div class="hint">Use Text → Remove White Spaces, or the Cleanup tools, to strip them.</div>`;
  }
  root.querySelector('#ivIn').addEventListener('input', run);
  run();
});

/* ---------------- Generator (2) ---------------- */

gen('passphrase','Passphrase Generator', root=>{
  const WORDS = ('able anchor apple arrow autumn badge baker basket beacon berry bishop blanket blossom border bottle branch brave breeze brick bridge broom butter cabin cactus candle canvas canyon carpet castle cedar chalk cherry cider circle clever cliff cloud clover copper coral cotton crayon creek cricket crown crystal daisy dancer desert diamond dolphin donkey dragon drift eagle ember engine falcon feather ferry fiddle field firefly flint forest fossil fountain fox garden ginger glacier glass grape gravel guitar hammer harbor harvest hazel heron hill honey horizon hunter island ivory jacket jasmine jigsaw jungle kettle kitten ladder lantern lemon lilac linen lizard lobster lunar magnet mango maple marble meadow melon metal mirror monkey moss mountain nectar needle nickel noodle north nutmeg oak ocean olive onion orbit orchard otter oven paddle paper parrot pebble pepper piano pigeon pillow pilot planet plum pocket polar pony potato prairie prism pumpkin puzzle quartz quill rabbit radar raven ribbon river robin rocket rope ruby saddle saffron sailor salmon sandal sapphire scarlet school shadow shell silver sketch sky sled slipper smoke snow sparrow spice spider spring spruce squash squirrel star stone storm sugar summer sunset swallow sword table tangle teapot thicket thunder tiger timber toast tomato torch tower tulip tunnel turtle valley velvet violet walnut wave wheat whistle willow window winter wizard wolf wonder wood yarn yellow zebra zephyr').split(' ');
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Words</label><input type="number" id="ppN" value="5" min="3" max="10"></div>
      <div class="field"><label>Separator</label><select id="ppSep"><option value="-">hyphen</option><option value=".">dot</option><option value=" ">space</option><option value="_">underscore</option></select></div>
      <div class="field"><label>Add a number</label><select id="ppNum"><option value="yes">Yes</option><option value="no">No</option></select></div>
    </div>
    <div class="row"><button class="btn primary" id="ppGo">Generate</button></div>
    <div class="output" id="ppOut" style="text-align:center"><span class="big">—</span></div>
    <div class="hint">A passphrase is easier to remember and longer than a password of the same strength: five words from this ${WORDS.length}-word list is about 39 bits of entropy, seven is about 55. Use a random password instead for anything a machine has to guess fast.</div>`;
  function pick(n){
    const buf = crypto.getRandomValues(new Uint32Array(n));
    return Array.from(buf).map(x=>WORDS[x % WORDS.length]);
  }
  root.querySelector('#ppGo').addEventListener('click', ()=>{
    const n = Math.min(10, Math.max(3, +root.querySelector('#ppN').value || 5));
    const sep = root.querySelector('#ppSep').value;
    let words = pick(n);
    if(root.querySelector('#ppNum').value === 'yes'){
      const d = crypto.getRandomValues(new Uint32Array(1))[0] % 100;
      words = words.concat(String(d).padStart(2,'0'));
    }
    root.querySelector('#ppOut').innerHTML = `<span class="big" style="word-break:break-all">${escapeHtml(words.join(sep))}</span>`;
  });
});

gen('usernames','Username Generator', root=>{
  const A = ['quiet','swift','clever','brave','silent','bright','ancient','modern','humble','bold','lunar','solar','amber','cobalt','scarlet','jade','iron','paper','velvet','glass','north','south','wild','still','early','late','deep','high','soft','sharp'];
  const B = ['falcon','otter','heron','badger','crane','lynx','moth','pike','raven','wren','cipher','atlas','ember','quartz','willow','harbor','compass','lantern','anchor','meadow','prism','thicket','current','summit','vellum','orchard','monsoon','kite','tide','grove'];
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>How many</label><input type="number" id="unN" value="8" min="1" max="40"></div>
      <div class="field"><label>Style</label><select id="unStyle"><option value="dot">quiet.falcon</option><option value="under">quiet_falcon</option><option value="joined">quietfalcon</option><option value="num">quietfalcon42</option></select></div>
    </div>
    <div class="row"><button class="btn primary" id="unGo">Generate</button></div>
    <div class="output" id="unOut">—</div>
    <div class="hint">For handles that will not already be taken. Nothing is checked against any service — Kitbox makes no network call, so it cannot know.</div>`;
  function r(n){ const b = crypto.getRandomValues(new Uint32Array(1))[0]; return b % n; }
  root.querySelector('#unGo').addEventListener('click', ()=>{
    const n = Math.min(40, Math.max(1, +root.querySelector('#unN').value || 8));
    const style = root.querySelector('#unStyle').value;
    const rows = [];
    for(let i=0;i<n;i++){
      const a = A[r(A.length)], b = B[r(B.length)];
      let name = style === 'dot' ? a+'.'+b : style === 'under' ? a+'_'+b : style === 'num' ? a+b+String(r(90)+10) : a+b;
      rows.push(name);
    }
    root.querySelector('#unOut').innerHTML = `<div class="mono" style="line-height:2">${rows.map(x=>escapeHtml(x)).join('<br>')}</div>`;
  });
});

/* ---------------- Calculation (4) ---------------- */

calc('Time','datediff','Date Difference', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>From</label><input type="date" id="ddFrom"></div>
      <div class="field"><label>To</label><input type="date" id="ddTo"></div>
    </div>
    <div class="output" id="ddOut">—</div>
    <div class="hint">Calendar days, weeks and months between two dates, plus business days (Monday to Friday, ignoring public holidays — the tool cannot know your state's list). Age is a separate tool; this one measures any two dates.</div>`;
  const from = root.querySelector('#ddFrom'), to = root.querySelector('#ddTo');
  const today = new Date();
  from.value = localDateStr(new Date(today.getFullYear(), 0, 1));
  to.value = localDateStr(today);
  function run(){
    const a = new Date(from.value+'T00:00:00'), b = new Date(to.value+'T00:00:00');
    const out = root.querySelector('#ddOut');
    if(isNaN(a) || isNaN(b)){ out.textContent = 'Choose both dates.'; return; }
    const ms = b - a;
    const days = Math.round(ms/86400000);
    let business = 0;
    const step = days >= 0 ? 1 : -1;
    const cur = new Date(a);
    for(let i=0;i<Math.abs(days);i++){
      cur.setDate(cur.getDate()+step);
      const d = cur.getDay();
      if(d !== 0 && d !== 6) business++;
    }
    const months = (b.getFullYear()-a.getFullYear())*12 + (b.getMonth()-a.getMonth()) - (b.getDate() < a.getDate() ? 1 : 0);
    const rows = [
      ['Days', days.toLocaleString(numLocale())],
      ['Weeks', (days/7).toFixed(1)],
      ['Months (whole)', months],
      ['Business days', business.toLocaleString(numLocale())],
      ['Hours', (days*24).toLocaleString(numLocale())],
      ['Weekday of "to"', b.toLocaleDateString(undefined, {weekday:'long'})]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  from.addEventListener('change', run);
  to.addEventListener('change', run);
  run();
});

calc('Algebra','percentchange','Percentage Change', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Original value</label><input type="number" id="pcA" value="100"></div>
      <div class="field"><label>New value</label><input type="number" id="pcB" value="125"></div>
    </div>
    <div class="output" id="pcOut">—</div>
    <div class="hint">The change as a percentage of the original, plus the reverse reading — because a 20% rise and a 20% fall do not cancel out, and most arguments about a "25% drop" are really about which direction is on the bottom.</div>`;
  function run(){
    const a = +root.querySelector('#pcA').value, b = +root.querySelector('#pcB').value;
    const out = root.querySelector('#pcOut');
    if(!a){ out.textContent = 'The original value cannot be zero.'; return; }
    const change = (b-a)/a*100;
    const back = a ? (b-a)/b*100 : 0;
    const rows = [
      ['Difference', (b-a).toLocaleString(numLocale())],
      ['Change', (change>0?'+':'')+change.toFixed(2)+'%'],
      ['Direction', change>0 ? 'increase' : change<0 ? 'decrease' : 'unchanged'],
      ['Multiplier', (b/a).toFixed(4)+'×'],
      ['To get back to the original', (back>0?'+':'')+back.toFixed(2)+'%']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

calc('Time','sleepcalc','Sleep Cycle Calculator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>I want to wake at</label><input type="time" id="slWake" value="06:30"></div>
      <div class="field"><label>Fall asleep takes (minutes)</label><input type="number" id="slFall" value="15" min="0" max="60"></div>
    </div>
    <div class="output" id="slOut">—</div>
    <div class="hint">Sleep runs in cycles of about 90 minutes; waking at the end of one feels different from waking in the middle. Bedtimes below are counted backwards from your alarm. The 90-minute figure is an average — your own cycle may be 80 or 100.</div>`;
  function run(){
    const [h,m] = (root.querySelector('#slWake').value||'06:30').split(':').map(Number);
    const fall = Math.min(60, Math.max(0, +root.querySelector('#slFall').value || 0));
    const out = root.querySelector('#slOut');
    const wake = h*60 + m;
    const rows = [];
    for(let cycles = 6; cycles >= 4; cycles--){
      let t = wake - cycles*90 - fall;
      while(t < 0) t += 1440;
      const hh = Math.floor(t/60) % 24, mm = t % 60;
      rows.push([cycles+' cycles ('+(cycles*1.5).toFixed(1)+' h)', String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')]);
    }
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      <div class="hint">Go to bed at one of those times to wake at ${escapeHtml(root.querySelector('#slWake').value)}.</div>`;
  }
  root.querySelectorAll('input').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

calc('Algebra','rounding','Rounding', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Number</label><input type="number" id="rdNum" value="1234.5678" step="any"></div>
      <div class="field"><label>Round to nearest</label><select id="rdStep">
        <option value="0.01">0.01</option><option value="0.1">0.1</option><option value="1">1</option>
        <option value="5">5</option><option value="10">10</option><option value="25">25</option>
        <option value="50">50</option><option value="100">100</option><option value="1000">1000</option>
      </select></div>
    </div>
    <div class="output" id="rdOut">—</div>
    <div class="hint">Nearest, up and down together, because "round to the nearest 25" means three different answers depending on which way you go. Significant figures are a separate tool.</div>`;
  function run(){
    const n = +root.querySelector('#rdNum').value;
    const step = +root.querySelector('#rdStep').value;
    const out = root.querySelector('#rdOut');
    if(isNaN(n)){ out.textContent = 'Enter a number.'; return; }
    const nearest = Math.round(n/step)*step;
    const rows = [
      ['Nearest '+step, +nearest.toFixed(6)],
      ['Round up', +((Math.ceil(n/step)*step).toFixed(6))],
      ['Round down', +((Math.floor(n/step)*step).toFixed(6))],
      ['Remainder', +(n - nearest).toFixed(6)]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v.toLocaleString(numLocale())}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

/* ---------------- Unit converter (2) ---------------- */

unitTool('Other','papersize','Paper Sizes', root=>{
  const SIZES = [
    ['A0',841,1189],['A1',594,841],['A2',420,594],['A3',297,420],['A4',210,297],['A5',148,210],['A6',105,148],
    ['B5',176,250],['Letter',216,279],['Legal',216,356]
  ];
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Size</label><select id="psKey">${SIZES.map(([k])=>`<option value="${k}" ${k==='A4'?'selected':''}>${k}</option>`).join('')}</select></div>
      <div class="field"><label>Resolution (DPI)</label><input type="number" id="psDpi" value="300" min="72" max="1200"></div>
    </div>
    <div class="output" id="psOut">—</div>
    <div class="hint">Millimetres, inches and the pixel size at your resolution — the last one is what a print shop or an image export actually needs. DPI changes pixels, never the physical size.</div>`;
  function run(){
    const key = root.querySelector('#psKey').value;
    const dpi = Math.max(72, Math.min(1200, +root.querySelector('#psDpi').value || 300));
    const [, w, h] = SIZES.find(s=>s[0]===key);
    const rows = [
      ['Millimetres', w+' × '+h+' mm'],
      ['Centimetres', (w/10).toFixed(1)+' × '+(h/10).toFixed(1)+' cm'],
      ['Inches', (w/25.4).toFixed(2)+' × '+(h/25.4).toFixed(2)+' in'],
      ['Pixels at '+dpi+' DPI', Math.round(w/25.4*dpi)+' × '+Math.round(h/25.4*dpi)+' px'],
      ['Area', (w*h/100).toFixed(1)+' cm²'],
      ['Landscape', h+' × '+w+' mm']
    ];
    root.querySelector('#psOut').innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

unitTool('Other','shoesize','Shoe Size', root=>{
  // UK/India sizes run in half steps; EU is the same scale shifted by 33,
  // US men is UK + 1, US women is UK + 2. US children follows UK up to 13.
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>System</label><select id="shSys">
        <option value="uk">India / UK</option><option value="us-m">US men</option>
        <option value="us-w">US women</option><option value="eu">EU</option><option value="cm">Foot length (cm)</option>
      </select></div>
      <div class="field"><label>Size</label><input type="number" id="shVal" value="8" step="0.5"></div>
    </div>
    <div class="output" id="shOut">—</div>
    <div class="hint">Converted through UK sizing as the common base. Indian sizes follow UK. Fit varies by brand and last — this is a starting point for an order, not a guarantee.</div>`;
  function run(){
    const sys = root.querySelector('#shSys').value;
    const v = +root.querySelector('#shVal').value;
    const out = root.querySelector('#shOut');
    if(isNaN(v)){ out.textContent = 'Enter a size.'; return; }
    let uk;
    if(sys === 'uk') uk = v;
    else if(sys === 'us-m') uk = v - 1;
    else if(sys === 'us-w') uk = v - 2;
    else if(sys === 'eu') uk = v - 33;
    else uk = (v - 23) * 1.5 + 1;   // foot length in cm to UK, roughly
    const rows = [
      ['India / UK', uk.toFixed(1)],
      ['US men', (uk+1).toFixed(1)],
      ['US women', (uk+2).toFixed(1)],
      ['EU', (uk+33).toFixed(0)],
      ['Foot length', ((uk-1)/1.5 + 23).toFixed(1)+' cm']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,x])=>`<tr><td>${k}</td><td>${x}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

/* ---------------- Finance (3) ---------------- */

fin('simpleinterest','Simple Interest', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Principal (₹)</label><input type="number" id="siP" value="100000"></div>
      <div class="field"><label>Rate (% per year)</label><input type="number" id="siR" value="8" step="0.1"></div>
      <div class="field"><label>Years</label><input type="number" id="siT" value="3" step="0.5"></div>
    </div>
    <div class="output" id="siOut">—</div>
    <div class="hint">Interest on the original principal only — the flat-interest maths a moneylender, a chit or a simple loan note actually uses. Compounding is the Investment Calculator, and the two give different answers on purpose.</div>`;
  function run(){
    const p = +root.querySelector('#siP').value, r = +root.querySelector('#siR').value, t = +root.querySelector('#siT').value;
    const out = root.querySelector('#siOut');
    if(!p || isNaN(r) || isNaN(t)){ out.textContent = 'Fill in all three fields.'; return; }
    const interest = p*r*t/100;
    const rows = [
      ['Interest', '₹'+Math.round(interest).toLocaleString(numLocale())],
      ['Total payable', '₹'+Math.round(p+interest).toLocaleString(numLocale())],
      ['Interest per year', '₹'+Math.round(p*r/100).toLocaleString(numLocale())],
      ['Interest per month', '₹'+Math.round(p*r/1200).toLocaleString(numLocale())],
      ['As a share of principal', (interest/p*100).toFixed(1)+'%']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

fin('sip','SIP Calculator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Monthly investment (₹)</label><input type="number" id="spAmt" value="10000"></div>
      <div class="field"><label>Expected return (% per year)</label><input type="number" id="spRate" value="12" step="0.5"></div>
      <div class="field"><label>Years</label><input type="number" id="spYears" value="15" step="1"></div>
    </div>
    <div class="output" id="spOut">—</div>
    <div class="hint">A monthly systematic investment plan, compounded monthly, contribution at the start of each month. Returns are an assumption, not a promise — try 0% to see the honest baseline, and 8% to see what a bad decade looks like.</div>`;
  function run(){
    const amt = +root.querySelector('#spAmt').value, rate = +root.querySelector('#spRate').value/1200, years = +root.querySelector('#spYears').value;
    const out = root.querySelector('#spOut');
    if(!amt || !years){ out.textContent = 'Enter an amount and a duration.'; return; }
    const n = Math.round(years*12);
    let bal = 0;
    for(let i=0;i<n;i++) bal = (bal + amt)*(1+rate);
    const invested = amt*n;
    const rows = [
      ['Invested', '₹'+Math.round(invested).toLocaleString(numLocale())],
      ['Value at the end', '₹'+Math.round(bal).toLocaleString(numLocale())],
      ['Gain', '₹'+Math.round(bal-invested).toLocaleString(numLocale())],
      ['Gain as a share', ((bal-invested)/invested*100).toFixed(1)+'%'],
      ['Months', n.toLocaleString(numLocale())],
      ['Value if the return were 0%', '₹'+Math.round(invested).toLocaleString(numLocale())]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

fin('gstsplit','GST Split', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Amount (₹)</label><input type="number" id="gsAmt" value="10000"></div>
      <div class="field"><label>Rate</label><select id="gsRate">
        <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option>
        <option value="18" selected>18%</option><option value="28">28%</option>
      </select></div>
    </div>
    <div class="segrow">
      <button class="btn primary" data-gs="add">Add GST (amount is pre-tax)</button>
      <button class="btn" data-gs="remove">Remove GST (amount includes tax)</button>
    </div>
    <div class="output" id="gsOut">—</div>
    <div class="hint">Intra-state supply splits the tax into CGST and SGST, each half the rate; inter-state is a single IGST at the full rate. The arithmetic is the same, the invoice is not — show the right one.</div>`;
  function run(mode){
    const amt = +root.querySelector('#gsAmt').value, rate = +root.querySelector('#gsRate').value;
    const out = root.querySelector('#gsOut');
    if(!amt){ out.textContent = 'Enter an amount.'; return; }
    const base = mode === 'add' ? amt : amt/(1+rate/100);
    const tax = mode === 'add' ? amt*rate/100 : amt - base;
    const rows = [
      ['Taxable value', '₹'+base.toFixed(2)],
      ['GST at '+rate+'%', '₹'+tax.toFixed(2)],
      ['CGST ('+(rate/2)+'%)', '₹'+(tax/2).toFixed(2)],
      ['SGST ('+(rate/2)+'%)', '₹'+(tax/2).toFixed(2)],
      ['IGST ('+rate+'%)', '₹'+tax.toFixed(2)],
      ['Invoice total', '₹'+(base+tax).toFixed(2)]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('[data-gs]').forEach(b=>b.addEventListener('click', ()=>{
    root.querySelectorAll('[data-gs]').forEach(x=>x.classList.remove('primary'));
    b.classList.add('primary');
    run(b.dataset.gs);
  }));
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', ()=>run(root.querySelector('[data-gs].primary').dataset.gs)));
  run('add');
});

/* ---------------- Randomizer (2) ---------------- */

rnd('teamshuffler','Team Shuffler', root=>{
  root.innerHTML = `
    <div class="field"><label>Names (one per line)</label><textarea id="tmIn" style="min-height:130px" placeholder="Asha
Ravi
Meera
Kabir
Nita
Imran"></textarea></div>
    <div class="row">
      <div class="field"><label>Number of teams</label><input type="number" id="tmN" value="2" min="2" max="12"></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="tmGo" style="width:100%">Shuffle into teams</button></div>
    </div>
    <div class="output" id="tmOut">—</div>
    <div class="hint">Shuffles the whole list with a crypto-random Fisher–Yates, then deals the names out so team sizes differ by at most one. For picking one name, use Random from List.</div>`;
  function rndInt(n){ return crypto.getRandomValues(new Uint32Array(1))[0] % n; }
  root.querySelector('#tmGo').addEventListener('click', ()=>{
    const names = root.querySelector('#tmIn').value.split('\n').map(s=>s.trim()).filter(Boolean);
    const teams = Math.min(12, Math.max(2, +root.querySelector('#tmN').value || 2));
    const out = root.querySelector('#tmOut');
    if(names.length < teams){ out.textContent = 'Add at least one name per team.'; return; }
    const pool = [...names];
    for(let i=pool.length-1;i>0;i--){ const j = rndInt(i+1); [pool[i],pool[j]] = [pool[j],pool[i]]; }
    const groups = Array.from({length:teams}, ()=>[]);
    pool.forEach((n,i)=>groups[i % teams].push(n));
    out.innerHTML = groups.map((g,i)=>`<div class="section-label" style="margin:12px 0 6px">Team ${i+1} · ${g.length}</div>
      <div class="mono" style="line-height:1.9">${g.map(n=>escapeHtml(n)).join(' · ')}</div>`).join('');
  });
});

rnd('eightball','Magic 8-Ball', root=>{
  const ANSWERS = [
    ['Yes', 1], ['It is certain', 1], ['Without a doubt', 1], ['Definitely', 1],
    ['Most likely', 1], ['Signs point to yes', 1], ['Yes — but later', 1],
    ['Reply hazy, ask again', 0], ['Cannot predict now', 0], ['Better not tell you now', 0],
    ["Don't count on it", -1], ['My reply is no', -1], ['Very doubtful', -1], ['Outlook not so good', -1]
  ];
  root.innerHTML = `
    <div class="field"><label>Your question</label><input type="text" id="ebQ" placeholder="Should I ship it on Friday?"></div>
    <div class="row"><button class="btn primary" id="ebGo">Ask</button></div>
    <div class="output" id="ebOut" style="text-align:center;padding:30px 12px"><span class="big">Ask a question.</span></div>
    <div class="hint">A coin with fourteen faces and a sense of humour. It is not advice, and it is not a random number generator you should audit — it uses crypto.getRandomValues all the same.</div>`;
  root.querySelector('#ebGo').addEventListener('click', ()=>{
    const q = root.querySelector('#ebQ').value.trim();
    const a = ANSWERS[crypto.getRandomValues(new Uint32Array(1))[0] % ANSWERS.length];
    root.querySelector('#ebOut').innerHTML =
      (q ? `<div class="hint" style="margin-bottom:10px">${escapeHtml(q)}</div>` : '') +
      `<span class="big">${escapeHtml(a[0])}</span>`;
  });
});

/* ---------------- Health (2) ---------------- */

health('heartzones','Heart Rate Zones', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Age</label><input type="number" id="hzAge" value="35"></div>
      <div class="field"><label>Resting heart rate</label><input type="number" id="hzRest" value="65"></div>
      <div class="field"><label>Method</label><select id="hzMethod">
        <option value="karvonen">Karvonen (uses resting rate)</option>
        <option value="percent">Percent of max (simpler)</option>
      </select></div>
    </div>
    <div class="output" id="hzOut">—</div>
    <div class="hint">Max heart rate is estimated as 220 − age, which is a population average and can be off by ten beats either way. Karvonen uses your resting rate, so it tracks fitness better. If you have a heart condition or take rate-limiting medication, ask a clinician before training to these numbers.</div>`;
  function run(){
    const age = +root.querySelector('#hzAge').value, rest = +root.querySelector('#hzRest').value;
    const method = root.querySelector('#hzMethod').value;
    const out = root.querySelector('#hzOut');
    if(!age || !rest){ out.textContent = 'Enter your age and resting heart rate.'; return; }
    const max = 220 - age;
    const zones = [
      ['Zone 1 · recovery', 0.50, 0.60], ['Zone 2 · easy', 0.60, 0.70],
      ['Zone 3 · tempo', 0.70, 0.80], ['Zone 4 · threshold', 0.80, 0.90],
      ['Zone 5 · max', 0.90, 1.00]
    ];
    const rows = zones.map(([name, lo, hi])=>{
      const a = method === 'karvonen' ? rest + (max-rest)*lo : max*lo;
      const b = method === 'karvonen' ? rest + (max-rest)*hi : max*hi;
      return [name, Math.round(a)+'–'+Math.round(b)+' bpm'];
    });
    out.innerHTML = `<div class="hint">Estimated max: ${max} bpm · method: ${method === 'karvonen' ? 'Karvonen' : 'percent of max'}</div>
      <table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

health('duedate','Pregnancy Due Date', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>First day of last period</label><input type="date" id="pdLmp"></div>
      <div class="field"><label>Cycle length (days)</label><input type="number" id="pdCycle" value="28" min="20" max="45"></div>
    </div>
    <div class="output" id="pdOut">—</div>
    <div class="hint">Naegele's rule: add 280 days to the first day of the last menstrual period, adjusted for cycle length against a 28-day cycle. An early ultrasound dating scan beats any calculation — this is for orientation, and it is not a diagnosis.</div>`;
  const lmp = root.querySelector('#pdLmp');
  const d = new Date(); d.setDate(d.getDate()-60); lmp.value = localDateStr(d);
  function run(){
    const base = new Date(lmp.value+'T00:00:00');
    const cycle = Math.min(45, Math.max(20, +root.querySelector('#pdCycle').value || 28));
    const out = root.querySelector('#pdOut');
    if(isNaN(base)){ out.textContent = 'Choose a date.'; return; }
    const due = new Date(base.getTime());
    due.setDate(due.getDate() + 280 + (cycle-28));
    const today = new Date(); today.setHours(0,0,0,0);
    const daysPreg = Math.round((today - base)/86400000) - (cycle-28);
    const weeks = Math.floor(daysPreg/7), rem = ((daysPreg%7)+7)%7;
    const fmt = x=>x.toLocaleDateString(undefined, {day:'numeric', month:'short', year:'numeric'});
    const rows = [
      ['Estimated due date', fmt(due)],
      ['Gestation today', daysPreg >= 0 ? weeks+' weeks '+rem+' days' : 'not yet'],
      ['Trimester today', daysPreg < 0 ? '—' : daysPreg < 98 ? 'first' : daysPreg < 196 ? 'second' : 'third'],
      ['Weeks remaining', Math.max(0, Math.round((due - today)/86400000/7))],
      ['Second trimester starts', fmt(new Date(base.getTime() + (98 + cycle-28)*86400000))],
      ['Third trimester starts', fmt(new Date(base.getTime() + (196 + cycle-28)*86400000))]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  lmp.addEventListener('change', run);
  root.querySelector('#pdCycle').addEventListener('input', run);
  run();
});

/* ---------------- Development (4) ---------------- */

dev('jsontots','JSON → TypeScript', root=>{
  root.innerHTML = `
    <div class="field"><label>JSON sample</label><textarea id="jtIn" style="min-height:150px" placeholder='{"id":1,"name":"Asha","tags":["a"],"active":true}'></textarea></div>
    <div class="row"><button class="btn primary" id="jtGo">Generate interfaces</button></div>
    <div class="field"><label>TypeScript</label><textarea id="jtOut" style="min-height:150px"></textarea></div>
    <div class="hint">Walks the sample and writes interfaces, with nested objects pulled out into their own named types. Optional keys are marked when a key is missing from any element of an array — feed it a representative sample, not one record.</div>`;
  function cap(s){ return s.replace(/[^a-zA-Z0-9]/g,' ').split(' ').filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join('') || 'Item'; }
  function typeOf(v, name, out){
    if(v === null) return 'null';
    if(Array.isArray(v)){
      if(!v.length) return 'unknown[]';
      const inner = typeOf(v[0], name, out);
      return inner.includes('|') || inner.includes('{') ? '('+inner+')[]' : inner+'[]';
    }
    if(typeof v === 'object'){
      const iface = cap(name);
      const keys = Object.keys(v);
      out.push('export interface '+iface+' {\n' + keys.map(k=>'  '+k+': '+typeOf(v[k], iface+k, out)+';').join('\n') + '\n}');
      return iface;
    }
    return typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : 'string';
  }
  root.querySelector('#jtGo').addEventListener('click', ()=>{
    const out = root.querySelector('#jtOut');
    let data;
    try{ data = JSON.parse(root.querySelector('#jtIn').value); }
    catch(e){ out.value = 'That is not valid JSON — '+e.message; return; }
    const blocks = [];
    const rootType = typeOf(data, 'Root', blocks);
    out.value = (blocks.length ? blocks.reverse().join('\n\n')+'\n\n' : '') + 'export type RootType = ' + rootType + ';\n';
  });
});

dev('querystring','Query String Parser', root=>{
  root.innerHTML = `
    <div class="field"><label>URL or query string</label><textarea id="qsIn" placeholder="https://example.com/search?q=kitbox&page=2&tags=a,b"></textarea></div>
    <div class="output" id="qsOut">—</div>
    <div class="hint">Shows the path, each parameter decoded, and repeats kept as separate rows — a=1&a=2 is two values, not one, and most hand-rolled parsers get that wrong. The URL Encoder is a different tool: that one builds, this one reads.</div>`;
  function run(){
    const raw = root.querySelector('#qsIn').value.trim();
    const out = root.querySelector('#qsOut');
    if(!raw){ out.textContent = '—'; return; }
    let path = '', query = raw;
    try{
      const u = new URL(raw, 'https://example.invalid');
      path = u.pathname; query = u.search.replace(/^\?/,'');
      out.dataset.host = u.host === 'example.invalid' ? '' : u.host;
    }catch(e){ out.dataset.host = ''; }
    const params = new URLSearchParams(query);
    const rows = [...params.entries()];
    out.innerHTML = `${path ? `<div class="hint">Path: <b>${escapeHtml(path)}</b>${out.dataset.host ? ' · host: '+escapeHtml(out.dataset.host) : ''}</div>` : ''}
      ${rows.length ? `<table class="mono">${rows.map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td style="word-break:break-all">${escapeHtml(v)}</td></tr>`).join('')}</table>` : '<div class="hint">No parameters.</div>'}
      <div class="hint">${rows.length} parameter${rows.length===1?'':'s'}.</div>`;
  }
  root.querySelector('#qsIn').addEventListener('input', run);
  run();
});

dev('cronnext','Cron Next Runs', root=>{
  root.innerHTML = `
    <div class="field"><label>Cron expression (minute hour day month weekday)</label><input type="text" id="cnIn" value="*/15 9-17 * * 1-5"></div>
    <div class="output" id="cnOut">—</div>
    <div class="hint">Steps forward a minute at a time from now for up to a year of wall-clock time and reports the next five matches, in this device's timezone. The Cron Parser explains what an expression means; this one shows when it will actually fire.</div>`;
  function fieldMatch(expr, value, min, max){
    if(expr === '*') return true;
    return expr.split(',').some(part=>{
      const [range, stepRaw] = part.split('/');
      const step = stepRaw ? +stepRaw : 1;
      if(range === '*') return (value - min) % step === 0;
      const [a, b] = range.split('-').map(Number);
      if(b === undefined) return value === a;
      return value >= a && value <= b && (value - a) % step === 0;
    });
  }
  function run(){
    const out = root.querySelector('#cnOut');
    const parts = root.querySelector('#cnIn').value.trim().split(/\s+/);
    if(parts.length !== 5){ out.textContent = 'A cron expression has five fields: minute hour day month weekday.'; return; }
    const hits = [];
    const d = new Date();
    d.setSeconds(0, 0);
    for(let i=0;i<527040 && hits.length<5;i++){   // up to 366 days of minutes
      if(fieldMatch(parts[0], d.getMinutes(), 0, 59) &&
         fieldMatch(parts[1], d.getHours(), 0, 23) &&
         fieldMatch(parts[2], d.getDate(), 1, 31) &&
         fieldMatch(parts[3], d.getMonth()+1, 1, 12) &&
         fieldMatch(parts[4], d.getDay(), 0, 6)) hits.push(new Date(d));
      d.setMinutes(d.getMinutes()+1);
    }
    out.innerHTML = hits.length
      ? `<table class="mono">${hits.map(h=>`<tr><td>${h.toLocaleString(undefined, {weekday:'short', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td></tr>`).join('')}</table>`
      : 'No run within the next year — check the expression.';
  }
  root.querySelector('#cnIn').addEventListener('input', run);
  run();
});

dev('sqlin','SQL IN List Builder', root=>{
  root.innerHTML = `
    <div class="field"><label>Values (one per line, or comma separated)</label><textarea id="sqIn" style="min-height:130px" placeholder="1
2
3
O'Brien"></textarea></div>
    <div class="row">
      <div class="field"><label>Quote as</label><select id="sqType"><option value="auto">Detect numbers and strings</option><option value="string">Always strings</option><option value="number">Always numbers</option></select></div>
      <div class="field"><label>Style</label><select id="sqStyle"><option value="in">IN ( … )</option><option value="values">VALUES rows</option></select></div>
    </div>
    <div class="output" id="sqOut">—</div>
    <div class="hint">Doubles single quotes so the list survives names like O'Brien. It builds text for you to read and paste — it does not connect to any database, and a generated list is still yours to check.</div>`;
  function run(){
    const items = root.querySelector('#sqIn').value.split(/[\n,]/).map(s=>s.trim()).filter(Boolean);
    const mode = root.querySelector('#sqType').value;
    const style = root.querySelector('#sqStyle').value;
    const out = root.querySelector('#sqOut');
    if(!items.length){ out.textContent = '—'; return; }
    const val = s=>{
      const isNum = /^-?\d+(\.\d+)?$/.test(s);
      if(mode === 'number' || (mode === 'auto' && isNum)) return s;
      return "'" + s.replace(/'/g,"''") + "'";
    };
    const body = style === 'in' ? items.map(val).join(', ') : items.map(v=>'('+val(v)+')').join(',\n');
    out.innerHTML = `<div class="mono" style="white-space:pre-wrap;word-break:break-word;background:#f6f6f4;padding:12px">${escapeHtml(style === 'in' ? 'IN ('+body+')' : 'VALUES\n'+body)}</div>
      <div class="hint">${items.length} value${items.length===1?'':'s'}.</div>`;
  }
  root.querySelectorAll('input,select,textarea').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

/* ---------------- Colours (3) ---------------- */

clr('harmony','Colour Harmony', root=>{
  root.innerHTML = `
    <div class="field"><label>Base colour</label><input type="text" id="hmHex" value="#2f86eb"></div>
    <div class="output" id="hmOut">—</div>
    <div class="hint">Complementary, split-complementary, analogous, triadic and tetradic sets, rotated in HSL so lightness is preserved. Blend Colours mixes two colours; this one derives a set from one.</div>`;
  function hexToHsl(hex){
    hex = (hex||'').trim().replace('#','');
    if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    if(!/^[0-9a-f]{6}$/i.test(hex)) return null;
    const r = parseInt(hex.slice(0,2),16)/255, g = parseInt(hex.slice(2,4),16)/255, b = parseInt(hex.slice(4,6),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b), l = (max+min)/2;
    let h = 0, s = 0;
    if(max !== min){
      const d = max-min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      h = max === r ? ((g-b)/d + (g<b?6:0)) : max === g ? ((b-r)/d + 2) : ((r-g)/d + 4);
      h *= 60;
    }
    return [h, s*100, l*100];
  }
  function hslToHex(h, s, l){
    h = ((h%360)+360)%360; s = Math.max(0, Math.min(100, s))/100; l = Math.max(0, Math.min(100, l))/100;
    const c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2;
    let rgb;
    if(h < 60) rgb = [c,x,0]; else if(h < 120) rgb = [x,c,0]; else if(h < 180) rgb = [0,c,x];
    else if(h < 240) rgb = [0,x,c]; else if(h < 300) rgb = [x,0,c]; else rgb = [c,0,x];
    return '#'+rgb.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
  }
  function run(){
    const hsl = hexToHsl(root.querySelector('#hmHex').value);
    const out = root.querySelector('#hmOut');
    if(!hsl){ out.textContent = 'Use a hex colour, for example #2f86eb.'; return; }
    const [h,s,l] = hsl;
    const sets = [
      ['Complementary', [0,180]],
      ['Split complementary', [0,150,210]],
      ['Analogous', [-30,0,30]],
      ['Triadic', [0,120,240]],
      ['Tetradic', [0,90,180,270]],
      ['Monochrome', [0,0,0,0,0]]
    ];
    out.innerHTML = sets.map(([name, rots])=>{
      const cols = rots.map((r,i)=>hslToHex(h+r, name === 'Monochrome' ? s : s, name === 'Monochrome' ? Math.max(8, Math.min(94, l + (i-2)*18)) : l));
      return `<div class="section-label" style="margin:12px 0 6px">${name}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${cols.map(c=>`<div style="width:76px"><div style="height:52px;background:${c};border:1px solid #e4e4e2"></div><div class="mono" style="font-size:11px;margin-top:3px">${c}</div></div>`).join('')}</div>`;
    }).join('');
  }
  root.querySelector('#hmHex').addEventListener('input', run);
  run();
});

clr('tintshade','Tints & Shades', root=>{
  root.innerHTML = `
    <div class="field"><label>Base colour</label><input type="text" id="tsHex" value="#2f86eb"></div>
    <div class="row">
      <div class="field"><label>Steps each way</label><input type="number" id="tsN" value="5" min="2" max="10"></div>
      <div class="field"><label>Step size (%)</label><input type="number" id="tsStep" value="8" min="2" max="20"></div>
    </div>
    <div class="output" id="tsOut">—</div>
    <div class="hint">A usable ramp for a UI: darker shades on the left, the base in the middle, lighter tints on the right. A design system wants five steps, not fifty.</div>`;
  function hexToRgb(h){
    h = (h||'').trim().replace('#','');
    if(h.length === 3) h = h.split('').map(c=>c+c).join('');
    if(!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }
  function mix(rgb, target, amt){
    return '#'+rgb.map(c=>Math.round(c + (target-c)*amt).toString(16).padStart(2,'0')).join('');
  }
  function run(){
    const rgb = hexToRgb(root.querySelector('#tsHex').value);
    const out = root.querySelector('#tsOut');
    if(!rgb){ out.textContent = 'Use a hex colour, for example #2f86eb.'; return; }
    const n = Math.min(10, Math.max(2, +root.querySelector('#tsN').value || 5));
    const step = Math.min(20, Math.max(2, +root.querySelector('#tsStep').value || 8))/100;
    const shades = [];
    for(let i=n;i>=1;i--) shades.push(mix(rgb, 0, i*step));
    shades.push('#'+rgb.map(c=>c.toString(16).padStart(2,'0')).join(''));
    for(let i=1;i<=n;i++) shades.push(mix(rgb, 255, i*step));
    out.innerHTML = `<div style="display:flex;gap:4px;flex-wrap:wrap">${shades.map(c=>
      `<div style="flex:1;min-width:56px"><div style="height:64px;background:${c};border:1px solid #e4e4e2"></div>
       <div class="mono" style="font-size:10.5px;margin-top:3px;text-align:center">${c}</div></div>`).join('')}</div>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

clr('randomcolor','Random Colour', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>How many</label><input type="number" id="rcN" value="6" min="1" max="24"></div>
      <div class="field"><label>Keep them</label><select id="rcMood">
        <option value="any">Any hue</option><option value="light">Light backgrounds</option>
        <option value="dark">Dark text-safe</option><option value="pastel">Pastel</option><option value="vivid">Vivid</option>
      </select></div>
    </div>
    <div class="row"><button class="btn primary" id="rcGo">Roll</button></div>
    <div class="output" id="rcOut">—</div>
    <div class="hint">Generates in HSL so the result is always a usable colour rather than mud — "random hex" produces far too many near-blacks. Click any swatch to copy its hex.</div>`;
  function hslToHex(h,s,l){
    s/=100; l/=100;
    const c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m = l-c/2;
    let rgb;
    if(h < 60) rgb=[c,x,0]; else if(h<120) rgb=[x,c,0]; else if(h<180) rgb=[0,c,x];
    else if(h<240) rgb=[0,x,c]; else if(h<300) rgb=[x,0,c]; else rgb=[c,0,x];
    return '#'+rgb.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
  }
  root.querySelector('#rcGo').addEventListener('click', ()=>{
    const n = Math.min(24, Math.max(1, +root.querySelector('#rcN').value || 6));
    const mood = root.querySelector('#rcMood').value;
    const buf = crypto.getRandomValues(new Uint32Array(n*3));
    const cols = [];
    for(let i=0;i<n;i++){
      const h = buf[i*3] % 360;
      let s = 55 + buf[i*3+1] % 35, l = 45 + buf[i*3+2] % 15;
      if(mood === 'light'){ s = 40 + buf[i*3+1] % 40; l = 82 + buf[i*3+2] % 10; }
      else if(mood === 'dark'){ s = 40 + buf[i*3+1] % 40; l = 18 + buf[i*3+2] % 12; }
      else if(mood === 'pastel'){ s = 55 + buf[i*3+1] % 25; l = 76 + buf[i*3+2] % 12; }
      else if(mood === 'vivid'){ s = 78 + buf[i*3+1] % 20; l = 48 + buf[i*3+2] % 10; }
      cols.push(hslToHex(h, s, l));
    }
    root.querySelector('#rcOut').innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap">${cols.map(c=>
      `<button data-c="${c}" style="width:88px;border:none;background:none;cursor:pointer;padding:0;text-align:left">
        <div style="height:56px;background:${c};border:1px solid #e4e4e2"></div>
        <div class="mono" style="font-size:11px;margin-top:3px">${c}</div></button>`).join('')}</div>`;
    root.querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click', ()=>{
      if(navigator.clipboard) navigator.clipboard.writeText(b.dataset.c);
    }));
  });
});

/* ---------------- Science (3) ---------------- */

sci('idealgas','Ideal Gas Law', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Pressure (kPa)</label><input type="number" id="igP" value="101.325" step="any"></div>
      <div class="field"><label>Volume (L)</label><input type="number" id="igV" value="22.4" step="any"></div>
      <div class="field"><label>Temperature (°C)</label><input type="number" id="igT" value="0" step="any"></div>
    </div>
    <div class="output" id="igOut">—</div>
    <div class="hint">PV = nRT with R = 8.314 J·mol⁻¹·K⁻¹. At 0 °C and 101.325 kPa, 22.4 L is one mole — the molar volume every chemistry textbook opens with, and a quick way to check the calculator agrees.</div>`;
  function run(){
    const P = +root.querySelector('#igP').value*1000, V = +root.querySelector('#igV').value/1000, T = +root.querySelector('#igT').value + 273.15;
    const out = root.querySelector('#igOut');
    if(!P || !V || !T){ out.textContent = 'Fill in all three values.'; return; }
    const n = P*V/(8.314*T);
    const rows = [
      ['Moles', n.toFixed(4)+' mol'],
      ['Particles', (n*6.02214076e23).toExponential(3)],
      ['Mass if it were air', (n*28.97).toFixed(2)+' g'],
      ['Molar volume', (V/n*1000).toFixed(2)+' L/mol'],
      ['Density if it were air', (n*28.97/1000/(V*1000)).toFixed(4)+' g/L']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

sci('projectile','Projectile Range', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Speed (m/s)</label><input type="number" id="pjV" value="20" step="any"></div>
      <div class="field"><label>Angle (degrees)</label><input type="number" id="pjA" value="45" step="any"></div>
      <div class="field"><label>Launch height (m)</label><input type="number" id="pjH" value="0" step="any"></div>
    </div>
    <div class="output" id="pjOut">—</div>
    <div class="hint">Ideal projectile: no air resistance, g = 9.81 m/s². A cricket ball or a thrown stone will fall short of these numbers — drag takes a third off at these speeds.</div>`;
  function run(){
    const v = +root.querySelector('#pjV').value, a = +root.querySelector('#pjA').value*Math.PI/180, h0 = +root.querySelector('#pjH').value;
    const out = root.querySelector('#pjOut');
    if(!v){ out.textContent = 'Enter a speed.'; return; }
    const g = 9.81;
    const vx = v*Math.cos(a), vy = v*Math.sin(a);
    const t = (vy + Math.sqrt(vy*vy + 2*g*h0))/g;
    const range = vx*t;
    const peak = h0 + vy*vy/(2*g);
    const rows = [
      ['Flight time', t.toFixed(2)+' s'],
      ['Range', range.toFixed(2)+' m'],
      ['Peak height', peak.toFixed(2)+' m'],
      ['Horizontal speed', vx.toFixed(2)+' m/s'],
      ['Impact speed', Math.sqrt(vx*vx + (vy - g*t)*(vy - g*t)).toFixed(2)+' m/s'],
      ['Best angle for this speed', h0 > 0 ? 'slightly under 45°' : '45°']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v2])=>`<tr><td>${k}</td><td>${v2}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

sci('molarity','Molarity & Dilution', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Stock concentration (M)</label><input type="number" id="moC1" value="1" step="any"></div>
      <div class="field"><label>Stock volume (mL)</label><input type="number" id="moV1" value="10" step="any"></div>
      <div class="field"><label>Final volume (mL)</label><input type="number" id="moV2" value="100" step="any"></div>
    </div>
    <div class="output" id="moOut">—</div>
    <div class="hint">C₁V₁ = C₂V₂ for a dilution. Also reports the dilution factor and how much solvent to add — the volume to add, not the volume to end up with, which is where bench mistakes come from.</div>`;
  function run(){
    const c1 = +root.querySelector('#moC1').value, v1 = +root.querySelector('#moV1').value, v2 = +root.querySelector('#moV2').value;
    const out = root.querySelector('#moOut');
    if(!c1 || !v1 || !v2 || v2 < v1){ out.textContent = 'Final volume must be at least the stock volume.'; return; }
    const c2 = c1*v1/v2;
    const rows = [
      ['Final concentration', c2.toFixed(5)+' M'],
      ['Dilution factor', (v2/v1).toFixed(2)+'×'],
      ['Solvent to add', (v2-v1).toFixed(2)+' mL'],
      ['Millimoles taken', (c1*v1).toFixed(3)+' mmol'],
      ['Final millimolar', (c2*1000).toFixed(3)+' mM']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

/* ---------------- Geo (3) ---------------- */

geo('antipode','Antipode Finder', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Latitude</label><input type="number" id="apLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="apLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="apOut">—</div>
    <div class="hint">The point on the other side of the Earth: latitude flipped, longitude shifted by 180°. Almost all of it lands in an ocean — the antipode of Vadodara is empty South Pacific, which is true of most land.</div>`;
  function run(){
    const lat = +root.querySelector('#apLat').value, lon = +root.querySelector('#apLon').value;
    const out = root.querySelector('#apOut');
    if(isNaN(lat) || isNaN(lon)){ out.textContent = 'Enter both coordinates.'; return; }
    const alat = -lat;
    let alon = lon + 180;
    if(alon > 180) alon -= 360;
    const rows = [
      ['Antipode latitude', alat.toFixed(4)+'° '+(alat>=0?'N':'S')],
      ['Antipode longitude', Math.abs(alon).toFixed(4)+'° '+(alon>=0?'E':'W')],
      ['Open in a map', `https://www.openstreetmap.org/?mlat=${alat.toFixed(4)}&mlon=${alon.toFixed(4)}#map=6/${alat.toFixed(3)}/${alon.toFixed(3)}`],
      ['Distance (half circumference)', '20,015 km'],
      ['Same time zone?', Math.abs(alon-lon) === 180 ? 'opposite side of the clock' : '—']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td style="word-break:break-all">${k === 'Open in a map' ? `<a href="${v}" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">open map</a>` : escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

geo('cardinal','Bearing → Cardinal', root=>{
  root.innerHTML = `
    <div class="field"><label>Bearing (degrees from north, clockwise)</label><input type="number" id="cdDeg" value="45" min="0" max="360" step="any"></div>
    <div class="output" id="cdOut">—</div>
    <div class="hint">The 16-point compass name for a bearing, with the back bearing — the direction you would face to look the other way. Bearing between two points is the separate tool that computes the number in the first place.</div>`;
  const NAMES = ['north','north-northeast','northeast','east-northeast','east','east-southeast','southeast','south-southeast',
    'south','south-southwest','southwest','west-southwest','west','west-northwest','northwest','north-northwest'];
  function run(){
    const d = ((+root.querySelector('#cdDeg').value % 360) + 360) % 360;
    const out = root.querySelector('#cdOut');
    if(isNaN(d)){ out.textContent = 'Enter a bearing.'; return; }
    const idx = Math.round(d/22.5) % 16;
    const back = (d + 180) % 360;
    const rows = [
      ['Cardinal', NAMES[idx]],
      ['Bearing', d.toFixed(1)+'°'],
      ['Back bearing', back.toFixed(1)+'° ('+NAMES[Math.round(back/22.5) % 16]+')'],
      ['Nearest 8-point', NAMES[(Math.round(d/45)*2) % 16]]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelector('#cdDeg').addEventListener('input', run);
  run();
});

geo('coordround','Coordinate Rounder', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Latitude</label><input type="text" id="crLat" value="22.30720" ></div>
      <div class="field"><label>Longitude</label><input type="text" id="crLon" value="73.18120"></div>
    </div>
    <div class="row">
      <div class="field"><label>Decimals</label><select id="crN"><option>1</option><option>2</option><option>3</option><option selected>4</option><option>5</option><option>6</option></select></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="crGo" style="width:100%">Round</button></div>
    </div>
    <div class="output" id="crOut">—</div>
    <div class="hint">Six decimals is about 11 cm on the ground; four is about 11 m; two is about 1.1 km. Round before publishing a location — the extra digits identify a doorstep, not a city.</div>`;
  root.querySelector('#crGo').addEventListener('click', ()=>{
    const lat = parseFloat(root.querySelector('#crLat').value), lon = parseFloat(root.querySelector('#crLon').value);
    const n = +root.querySelector('#crN').value;
    const out = root.querySelector('#crOut');
    if(isNaN(lat) || isNaN(lon)){ out.textContent = 'Enter both coordinates as decimal degrees.'; return; }
    const prec = [111000, 11100, 1110, 111, 11.1, 1.11, 0.111][n] || 11;
    out.innerHTML = `<table class="mono">
      <tr><td>Rounded</td><td>${lat.toFixed(n)}, ${lon.toFixed(n)}</td></tr>
      <tr><td>Precision on the ground</td><td>about ${prec >= 1000 ? (prec/1000).toFixed(1)+' km' : prec.toFixed(prec < 10 ? 2 : 0)+' m'}</td></tr>
      <tr><td>DMS</td><td>${dms(lat,'lat')} ${dms(lon,'lon')}</td></tr>
    </table>`;
  });
  function dms(v, axis){
    const dir = axis === 'lat' ? (v >= 0 ? 'N' : 'S') : (v >= 0 ? 'E' : 'W');
    const abs = Math.abs(v), d = Math.floor(abs), m = Math.floor((abs-d)*60), s = (((abs-d)*60)-m)*60;
    return d+'°'+String(m).padStart(2,'0')+"'"+s.toFixed(1)+'"'+dir;
  }
  root.querySelector('#crGo').click();
});

/* ---------------- Audio (2) ---------------- */

aud('taptempo','Tap Tempo', root=>{
  root.innerHTML = `
    <div class="output" style="text-align:center;padding:26px 12px">
      <div id="ttBpm" style="font-family:var(--mono);font-size:56px;font-weight:700;line-height:1;color:var(--ink)">—</div>
      <div class="hint" id="ttInfo" style="margin-top:8px">Tap the button, or the space bar, in time with the music.</div>
    </div>
    <div class="row"><button class="btn primary" id="ttTap" style="padding:20px">Tap</button><button class="btn" id="ttReset">Reset</button></div>
    <div class="hint">Averages the intervals between your last eight taps and ignores gaps over two seconds, so a pause does not wreck the reading. Resets itself after three seconds of silence.</div>`;
  let taps = [];
  let timer = null;
  function tap(){
    const now = performance.now();
    if(taps.length && now - taps[taps.length-1] > 2000) taps = [];
    taps.push(now);
    if(taps.length > 9) taps.shift();
    if(taps.length >= 2){
      const gaps = [];
      for(let i=1;i<taps.length;i++) gaps.push(taps[i]-taps[i-1]);
      const avg = gaps.reduce((a,b)=>a+b,0)/gaps.length;
      const bpm = 60000/avg;
      root.querySelector('#ttBpm').textContent = bpm.toFixed(0);
      root.querySelector('#ttInfo').textContent = `${bpm.toFixed(1)} BPM · ${taps.length} taps · ${(avg/1000).toFixed(2)} s apart`;
    }
    clearTimeout(timer);
    timer = setTimeout(reset, 3000);
  }
  function reset(){
    taps = [];
    root.querySelector('#ttBpm').textContent = '—';
    root.querySelector('#ttInfo').textContent = 'Tap the button, or the space bar, in time with the music.';
  }
  root.querySelector('#ttTap').addEventListener('click', tap);
  root.querySelector('#ttReset').addEventListener('click', reset);
  const key = e=>{ if(e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){ e.preventDefault(); tap(); } };
  window.addEventListener('keydown', key);
  setCleanup(()=>{ clearTimeout(timer); window.removeEventListener('keydown', key); });
});

aud('hznote','Frequency → Note', root=>{
  root.innerHTML = `
    <div class="field"><label>Frequency (Hz)</label><input type="number" id="hnHz" value="440" step="0.1"></div>
    <div class="output" id="hnOut">—</div>
    <div class="hint">Equal-temperament note name, octave, cents off, and the nearest whole note's frequency. 440 Hz is A4 by convention; an orchestra may tune to 442 or 443, which is why the cents reading matters.</div>`;
  const NAMES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
  function run(){
    const f = +root.querySelector('#hnHz').value;
    const out = root.querySelector('#hnOut');
    if(!f || f <= 0){ out.textContent = 'Enter a frequency above zero.'; return; }
    const midi = 69 + 12*Math.log2(f/440);
    const nearest = Math.round(midi);
    const cents = (midi - nearest)*100;
    const name = NAMES[((nearest % 12) + 12) % 12];
    const octave = Math.floor(nearest/12) - 1;
    const rows = [
      ['Note', name + octave],
      ['Cents off', (cents >= 0 ? '+' : '') + cents.toFixed(1) + ' cents'],
      ['Exact frequency of that note', (440*Math.pow(2,(nearest-69)/12)).toFixed(2)+' Hz'],
      ['MIDI number', nearest],
      ['Period', (1000/f).toFixed(3)+' ms'],
      ['Wavelength in air', (343/f*100).toFixed(1)+' cm']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelector('#hnHz').addEventListener('input', run);
  run();
});

/* ---------------- Games (2) ---------------- */

game('reaction','Reaction Time Test', root=>{
  root.innerHTML = `
    <div id="rxPad" style="height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--ink);color:#fff;font-family:var(--sans);font-size:16px;font-weight:600;user-select:none">Click to start</div>
    <div class="output" id="rxOut" style="text-align:center"><span class="hint">Five rounds. Click as soon as the panel turns green — clicking early costs you the round.</span></div>
    <div class="hint">Measures the round trip through your screen, your browser and your hand, so treat the number as yours on this device, not a score to compare. Typical human reaction is 200–250 ms.</div>`;
  const pad = root.querySelector('#rxPad'), out = root.querySelector('#rxOut');
  let state = 'idle', start = 0, times = [], timer = null;
  function setPad(text, bg){ pad.textContent = text; pad.style.background = bg; }
  function next(){
    state = 'waiting';
    setPad('Wait for green…', 'var(--ink)');
    timer = setTimeout(()=>{ state = 'go'; start = performance.now(); setPad('Click!', '#1FCE9C'); },
      900 + Math.random()*2200);
  }
  pad.addEventListener('click', ()=>{
    if(state === 'idle'){ times = []; next(); return; }
    if(state === 'waiting'){ clearTimeout(timer); setPad('Too early — click to retry', '#c0392b'); state = 'idle'; return; }
    if(state === 'go'){
      times.push(performance.now() - start);
      if(times.length >= 5){
        const avg = times.reduce((a,b)=>a+b,0)/times.length;
        const best = Math.min(...times);
        setPad('Done', 'var(--ink)');
        out.innerHTML = `<div class="hint">Average <b>${avg.toFixed(0)} ms</b> · best ${best.toFixed(0)} ms</div>
          <table class="mono">${times.map((t,i)=>`<tr><td>Round ${i+1}</td><td>${t.toFixed(0)} ms</td></tr>`).join('')}</table>`;
        state = 'idle';
      } else {
        out.innerHTML = `<span class="hint">${times[times.length-1].toFixed(0)} ms · ${5-times.length} to go</span>`;
        next();
      }
    }
  });
  setCleanup(()=>clearTimeout(timer));
});

game('typingtest','Typing Speed', root=>{
  const PASSAGES = [
    'The quick brown fox jumps over the lazy dog while the patient waits for a remedy that will not arrive today.',
    'A good tool does one thing completely, tells you when it cannot, and never asks for your email address first.',
    'Rain on a tin roof in a small town is the sound of an afternoon that has decided to stay where it is.',
    'Every repertory is a library of other people\u2019s careful observations, arranged so that a stranger can find them.'
  ];
  root.innerHTML = `
    <div class="panel" style="border:1px solid var(--line);padding:16px;margin-bottom:14px">
      <div id="tyText" style="font-family:var(--mono);font-size:14.5px;line-height:1.8;color:var(--ink-soft)"></div>
    </div>
    <div class="field"><label>Type it here</label><textarea id="tyIn" style="min-height:90px" placeholder="Start typing — the clock starts on the first keystroke."></textarea></div>
    <div class="output" id="tyOut"><span class="hint">60 seconds, or finish the passage.</span></div>
    <div class="hint">Words per minute uses the standard five-characters-per-word convention; accuracy counts correct characters against what you typed. Backspace is allowed — this measures typing, not honesty.</div>`;
  const target = PASSAGES[Math.floor(Math.random()*PASSAGES.length)];
  root.querySelector('#tyText').textContent = target;
  const inp = root.querySelector('#tyIn'), out = root.querySelector('#tyOut');
  let started = 0, timer = null, done = false;
  function paint(){
    const typed = inp.value;
    root.querySelector('#tyText').innerHTML = target.split('').map((ch,i)=>{
      if(i >= typed.length) return escapeHtml(ch);
      return typed[i] === ch
        ? `<span style="color:var(--ink)">${escapeHtml(ch)}</span>`
        : `<span style="background:#fde8e8;color:#c0392b">${escapeHtml(ch)}</span>`;
    }).join('');
  }
  function finish(){
    if(done) return;
    done = true;
    clearInterval(timer);
    const typed = inp.value;
    const seconds = Math.max(1, (performance.now() - started)/1000);
    let correct = 0;
    for(let i=0;i<Math.min(typed.length, target.length);i++) if(typed[i] === target[i]) correct++;
    const wpm = (correct/5)/(seconds/60);
    const accuracy = typed.length ? correct/typed.length*100 : 0;
    out.innerHTML = `<div class="hint">${wpm.toFixed(0)} wpm · ${accuracy.toFixed(0)}% accurate · ${seconds.toFixed(0)} s</div>
      <table class="mono"><tr><td>Characters correct</td><td>${correct} / ${target.length}</td></tr>
      <tr><td>Typed</td><td>${typed.length}</td></tr></table>`;
  }
  inp.addEventListener('input', ()=>{
    if(!started){ started = performance.now(); timer = setInterval(()=>{ if(performance.now()-started > 60000) finish(); }, 500); }
    paint();
    if(inp.value.length >= target.length) finish();
  });
  setCleanup(()=>clearInterval(timer));
  paint();
});

/* ---------------- Travel (1) ---------------- */

trv('carbon','Flight Carbon', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Distance one way (km)</label><input type="number" id="cbKm" value="1200"></div>
      <div class="field"><label>Cabin</label><select id="cbClass">
        <option value="0.15">Economy</option><option value="0.24">Premium economy</option>
        <option value="0.43">Business</option><option value="0.60">First</option>
      </select></div>
      <div class="field"><label>Return trip</label><select id="cbReturn"><option value="yes">Yes</option><option value="no">No</option></select></div>
    </div>
    <div class="output" id="cbOut">—</div>
    <div class="hint">Rough per-passenger estimates using a radiative-forcing multiplier of about 1.9 on fuel burn. A short-haul flight is worse per kilometre than a long-haul one because take-off dominates — treat this as a comparison between choices, not an audit of an airline.</div>`;
  function run(){
    const km = +root.querySelector('#cbKm').value;
    const factor = +root.querySelector('#cbClass').value;
    const ret = root.querySelector('#cbReturn').value === 'yes';
    const out = root.querySelector('#cbOut');
    if(!km){ out.textContent = 'Enter a distance.'; return; }
    const total = km*(ret?2:1);
    const kg = total*factor;
    const rows = [
      ['Distance flown', total.toLocaleString(numLocale())+' km'],
      ['CO₂e', Math.round(kg).toLocaleString(numLocale())+' kg'],
      ['Per passenger-km', factor.toFixed(2)+' kg'],
      ['Equivalent trees for a year', Math.ceil(kg/21)+' trees'],
      ['Equivalent car km', Math.round(kg/0.17).toLocaleString(numLocale())+' km'],
      ['Compared with train (India)', Math.round(kg/0.012/1000)+'× a typical train seat']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

/* ---------------- Nature (2) ---------------- */

nat('goldenhour','Golden & Blue Hour', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="ghDate"></div>
      <div class="field"><label>Latitude</label><input type="number" id="ghLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="ghLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="ghOut">—</div>
    <div class="hint">Times when the sun sits between 6° and −4° above the horizon: golden hour at each end of the day, blue hour between −4° and −6°. Computed from your coordinates, not from a city table.</div>`;
  const dateEl = root.querySelector('#ghDate');
  dateEl.value = localDateStr(new Date());
  // Altitude crossings via the standard sunrise equation, generalised.
  function crossing(dateUTC, lat, lon, alt){
    const J = ASTRO.jd(dateUTC);
    const jd0 = Math.floor(J + 0.5) - 0.5;
    const n = Math.ceil(J - 2451545.0 + 0.0008);
    const Jstar = n - lon/360;
    const M = ((357.5291 + 0.98560028*Jstar) % 360 + 360) % 360;
    const D2R = Math.PI/180;
    const C = 1.9148*Math.sin(M*D2R) + 0.02*Math.sin(2*M*D2R) + 0.0003*Math.sin(3*M*D2R);
    const lambda = ((M + C + 180 + 102.9372) % 360 + 360) % 360;
    const Jtransit = 2451545.0 + Jstar + 0.0053*Math.sin(M*D2R) - 0.0069*Math.sin(2*lambda*D2R);
    const delta = Math.asin(Math.sin(lambda*D2R)*Math.sin(23.44*D2R))/D2R;
    const cosOmega = (Math.sin(alt*D2R) - Math.sin(lat*D2R)*Math.sin(delta*D2R)) / (Math.cos(lat*D2R)*Math.cos(delta*D2R));
    if(cosOmega > 1 || cosOmega < -1) return null;
    const omega = Math.acos(cosOmega)/D2R;
    return {
      rise: (Jtransit - omega/360 - jd0)*24,
      set: (Jtransit + omega/360 - jd0)*24,
      noon: (Jtransit - jd0)*24
    };
  }
  function run(){
    const [y,m,d] = (dateEl.value||localDateStr(new Date())).split('-').map(Number);
    const lat = parseFloat(root.querySelector('#ghLat').value), lon = parseFloat(root.querySelector('#ghLon').value);
    const out = root.querySelector('#ghOut');
    const tz = -(new Date().getTimezoneOffset())/60;
    const day = new Date(Date.UTC(y, m-1, d, 12));
    const at = alt => crossing(day, lat, lon, alt);
    const horizon = at(-0.833), gold = at(6), blue = at(-6);
    if(!horizon){ out.textContent = 'No sunrise or sunset at this latitude on this date.'; return; }
    const rows = [];
    if(gold && blue){
      rows.push(['Morning blue hour', fmtHM(blue.rise + tz)+' – '+fmtHM(gold.rise + tz)]);
      rows.push(['Morning golden hour', fmtHM(gold.rise + tz)+' – '+fmtHM(horizon.rise + tz)]);
      rows.push(['Sunrise', fmtHM(horizon.rise + tz)]);
      rows.push(['Solar noon', fmtHM(horizon.noon + tz)]);
      rows.push(['Sunset', fmtHM(horizon.set + tz)]);
      rows.push(['Evening golden hour', fmtHM(horizon.set + tz)+' – '+fmtHM(gold.set + tz)]);
      rows.push(['Evening blue hour', fmtHM(gold.set + tz)+' – '+fmtHM(blue.set + tz)]);
    } else {
      rows.push(['Sunrise', fmtHM(horizon.rise + tz)]);
      rows.push(['Sunset', fmtHM(horizon.set + tz)]);
      rows.push(['Golden hour', 'the sun stays below 6° all day at this latitude']);
    }
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

nat('daylength','Day Length Calendar', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Month</label><input type="month" id="dlMonth"></div>
      <div class="field"><label>Latitude</label><input type="number" id="dlLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="dlLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="dlOut">—</div>
    <div class="hint">Sunrise, sunset and day length for every day of the month, so you can see how fast the light is changing — the steepest change is around the equinoxes, and almost nothing happens near the solstices.</div>`;
  const now = new Date();
  root.querySelector('#dlMonth').value = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  function run(){
    const val = root.querySelector('#dlMonth').value || (now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0'));
    const [y,m] = val.split('-').map(Number);
    const lat = parseFloat(root.querySelector('#dlLat').value), lon = parseFloat(root.querySelector('#dlLon').value);
    const tz = -(new Date().getTimezoneOffset())/60;
    const days = new Date(y, m, 0).getDate();
    const rows = [];
    for(let d=1; d<=days; d++){
      const ss = ASTRO.sunriseSunset(new Date(Date.UTC(y, m-1, d, 12)), lat, lon);
      if(ss.polar){ rows.push([d, ss.polar === 'day' ? 'sun up all day' : 'sun down all day', '—']); continue; }
      rows.push([d, fmtHM(ss.sunrise + tz)+' / '+fmtHM(ss.sunset + tz), fmtHM(ss.sunset - ss.sunrise)]);
    }
    root.querySelector('#dlOut').innerHTML = `<table class="mono"><tr><th style="text-align:left">Day</th><th style="text-align:left">Sunrise / sunset</th><th style="text-align:left">Length</th></tr>
      ${rows.map(([d,a,b])=>`<tr><td>${d}</td><td>${a}</td><td>${b}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

/* ---------------- Productivity (2) ---------------- */

prod('checklist','Checklist', root=>{
  let lists = store.get('checklists', [{id:'default', name:'Today', items:[]}]);
  let current = 0;
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>List</label><select id="clSel"></select></div>
      <div class="field"><label>&nbsp;</label><button class="btn" id="clNew" style="width:100%">+ New list</button></div>
    </div>
    <div class="row"><input type="text" id="clItem" placeholder="Add an item"><button class="btn primary" id="clAdd">Add</button></div>
    <div id="clBody" style="margin-top:14px"></div>
    <div class="divider"></div>
    <div id="clExport"></div>`;
  function persist(){ store.set('checklists', lists); }
  function draw(){
    root.querySelector('#clSel').innerHTML = lists.map((l,i)=>`<option value="${i}" ${i===current?'selected':''}>${escapeHtml(l.name)} (${l.items.filter(x=>x.done).length}/${l.items.length})</option>`).join('');
    const list = lists[current];
    root.querySelector('#clBody').innerHTML = list.items.length ? list.items.map((it,i)=>`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)">
        <input type="checkbox" data-tick="${i}" ${it.done?'checked':''}>
        <span style="flex:1;font-size:14px;${it.done?'text-decoration:line-through;color:var(--muted)':''}">${escapeHtml(it.text)}</span>
        <button class="btn ghost" data-del="${i}" style="padding:2px 8px" aria-label="Remove">✕</button>
      </div>`).join('') : '<div class="hint">Nothing on this list yet.</div>';
    root.querySelectorAll('[data-tick]').forEach(b=>b.addEventListener('change', ()=>{
      lists[current].items[+b.dataset.tick].done = b.checked; persist(); draw();
    }));
    root.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', ()=>{
      lists[current].items.splice(+b.dataset.del,1); persist(); draw();
    }));
  }
  root.querySelector('#clSel').addEventListener('change', e=>{ current = +e.target.value; draw(); });
  root.querySelector('#clNew').addEventListener('click', ()=>{
    const name = prompt('Name for the new list?');
    if(!name) return;
    lists.push({id:'l'+Date.now(), name, items:[]}); current = lists.length-1; persist(); draw();
  });
  root.querySelector('#clAdd').addEventListener('click', ()=>{
    const text = root.querySelector('#clItem').value.trim();
    if(!text) return;
    lists[current].items.push({text, done:false});
    root.querySelector('#clItem').value = ''; persist(); draw();
  });
  root.querySelector('#clItem').addEventListener('keydown', e=>{ if(e.key === 'Enter') root.querySelector('#clAdd').click(); });
  exportImportRow(root.querySelector('#clExport'), 'checklists', 'kitbox-checklists.json', data=>{ lists = data || lists; current = 0; draw(); });
  draw();
});

prod('meetingcost','Meeting Cost', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>People</label><input type="number" id="mcPeople" value="6"></div>
      <div class="field"><label>Minutes</label><input type="number" id="mcMins" value="45"></div>
      <div class="field"><label>Average cost per hour (₹)</label><input type="number" id="mcRate" value="1500"></div>
    </div>
    <div class="output" id="mcOut">—</div>
    <div class="hint">What the room costs in salary time. It is a deliberate provocation: a 45-minute meeting of six people at ₹1,500 an hour is ₹6,750, which buys a lot of written notes.</div>`;
  function run(){
    const p = +root.querySelector('#mcPeople').value, m = +root.querySelector('#mcMins').value, r = +root.querySelector('#mcRate').value;
    const out = root.querySelector('#mcOut');
    if(!p || !m || !r){ out.textContent = 'Fill in all three fields.'; return; }
    const cost = p*(m/60)*r;
    const rows = [
      ['Cost', '₹'+Math.round(cost).toLocaleString(numLocale())],
      ['Person-minutes', (p*m).toLocaleString(numLocale())],
      ['Person-hours', (p*m/60).toFixed(1)],
      ['Cost of the same meeting weekly', '₹'+Math.round(cost*52).toLocaleString(numLocale())+' a year'],
      ['Cost per person', '₹'+Math.round(cost/p).toLocaleString(numLocale())]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', run));
  run();
});

/* ---------------- Files & Data (2) ---------------- */

fil('filetype','File Type Detector', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>File</label><input type="file" id="ftFile"></div>
    <div class="output" id="ftOut">Pick a file to read its first bytes.</div>
    <div class="hint">Identifies a file by its magic number, not by its extension — which is how you catch a .jpg that is really a .zip, or a file someone renamed to get past a filter.</div>`;
  const SIGS = [
    [[0x89,0x50,0x4E,0x47],'PNG image','image/png'],
    [[0xFF,0xD8,0xFF],'JPEG image','image/jpeg'],
    [[0x47,0x49,0x46,0x38],'GIF image','image/gif'],
    [[0x52,0x49,0x46,0x46],'RIFF container (WebP, WAV, AVI)','application/octet-stream'],
    [[0x25,0x50,0x44,0x46],'PDF document','application/pdf'],
    [[0x50,0x4B,0x03,0x04],'ZIP archive (or .docx/.xlsx/.apk)','application/zip'],
    [[0x1F,0x8B],'GZIP archive','application/gzip'],
    [[0x42,0x5A,0x68],'BZIP2 archive','application/x-bzip2'],
    [[0x37,0x7A,0xBC,0xAF],'7-Zip archive','application/x-7z-compressed'],
    [[0x7F,0x45,0x4C,0x46],'ELF binary (Linux/Android)','application/x-elf'],
    [[0x4D,0x5A],'Windows executable (MZ)','application/vnd.microsoft.portable-executable'],
    [[0x49,0x44,0x33],'MP3 audio (ID3)','audio/mpeg'],
    [[0x4F,0x67,0x67,0x53],'OGG container','audio/ogg'],
    [[0x66,0x4C,0x61,0x43],'FLAC audio','audio/flac'],
    [[0x00,0x61,0x73,0x6D],'WebAssembly module','application/wasm'],
    [[0x53,0x51,0x4C,0x69],'SQLite database','application/vnd.sqlite3'],
    [[0x00,0x00,0x00],'MP4 / ISO base media','video/mp4']
  ];
  root.querySelector('#ftFile').addEventListener('change', async e=>{
    const f = e.target.files[0]; if(!f) return;
    const head = new Uint8Array(await f.slice(0, 16).arrayBuffer());
    const hex = Array.from(head).map(b=>b.toString(16).padStart(2,'0')).join(' ');
    let match = null;
    for(const [sig, name, mime] of SIGS){
      if(sig.every((b,i)=>head[i] === b)){ match = [name, mime]; break; }
    }
    const ext = (f.name.split('.').pop()||'').toLowerCase();
    const out = root.querySelector('#ftOut');
    out.innerHTML = `<table class="mono">
      <tr><td>Name</td><td>${escapeHtml(f.name)}</td></tr>
      <tr><td>Size</td><td>${fmtBytes(f.size)}</td></tr>
      <tr><td>Type reported by browser</td><td>${escapeHtml(f.type || 'unknown')}</td></tr>
      <tr><td>Detected from bytes</td><td>${match ? escapeHtml(match[0]) : 'no known signature'}</td></tr>
      <tr><td>Implied MIME</td><td>${match ? escapeHtml(match[1]) : '—'}</td></tr>
      <tr><td>Extension</td><td>.${escapeHtml(ext||'none')}</td></tr>
      <tr><td>First bytes</td><td>${hex}</td></tr>
    </table>
    ${match && f.type && match[1].split('/')[0] !== f.type.split('/')[0] ? '<div class="hint">The extension and the bytes disagree — that file is not what it claims to be.</div>' : ''}`;
  });
});

fil('b64file','Base64 → File', root=>{
  root.innerHTML = `
    <div class="field"><label>Base64 text (a data URI works too)</label><textarea id="bfIn" style="min-height:130px" placeholder="SGVsbG8sIHRoaXMgaXMgYSBmaWxlLg=="></textarea></div>
    <div class="field"><label>Save as</label><input type="text" id="bfName" value="decoded.bin"></div>
    <div class="row"><button class="btn primary" id="bfGo">Decode and download</button></div>
    <div class="output" id="bfOut">—</div>
    <div class="hint">The other direction from Image → Base64: this one turns a block of text back into a file you can save. Data URIs are accepted, and the mime type is used to guess a filename if you leave it as-is.</div>`;
  root.querySelector('#bfGo').addEventListener('click', ()=>{
    let raw = root.querySelector('#bfIn').value.trim();
    const out = root.querySelector('#bfOut');
    if(!raw){ out.textContent = 'Paste some base64 first.'; return; }
    let mime = 'application/octet-stream';
    const uri = raw.match(/^data:([^;]+);base64,(.*)$/s);
    if(uri){ mime = uri[1]; raw = uri[2]; }
    try{
      const bin = atob(raw.replace(/\s/g,''));
      const bytes = Uint8Array.from(bin, c=>c.charCodeAt(0));
      const nameEl = root.querySelector('#bfName');
      if(nameEl.value === 'decoded.bin' && mime !== 'application/octet-stream'){
        const ext = { 'image/png':'png','image/jpeg':'jpg','image/gif':'gif','image/webp':'webp','application/pdf':'pdf','text/plain':'txt','text/html':'html','application/zip':'zip' }[mime];
        if(ext) nameEl.value = 'decoded.'+ext;
      }
      saveBlob(new Blob([bytes], {type:mime}), nameEl.value || 'decoded.bin');
      out.innerHTML = `<div class="hint">Decoded ${bytes.length.toLocaleString(numLocale())} bytes · ${escapeHtml(mime)}</div>`;
    }catch(e){
      out.innerHTML = '<div class="hint">That is not valid base64 — check for missing padding or a truncated paste.</div>';
    }
  });
});

/* ---------------- Almanac (2) ---------------- */

alm('horas','Planetary Hours', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="hrDate"></div>
      <div class="field"><label>Latitude</label><input type="number" id="hrLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="hrLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="hrOut">—</div>
    <div class="hint">The day is split into twelve equal hours from sunrise to sunset and the night into twelve from sunset to sunrise, each ruled by a planet in Chaldean order. The day's first hour belongs to the planet of the weekday, which is where the names come from.</div>`;
  const dateEl = root.querySelector('#hrDate');
  dateEl.value = localDateStr(new Date());
  const ORDER = ['Saturn','Jupiter','Mars','Sun','Venus','Mercury','Moon'];
  const DAYLORD = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']; // Sunday..Saturday
  function run(){
    const [y,m,d] = (dateEl.value||localDateStr(new Date())).split('-').map(Number);
    const lat = parseFloat(root.querySelector('#hrLat').value), lon = parseFloat(root.querySelector('#hrLon').value);
    const tz = -(new Date().getTimezoneOffset())/60;
    const ss = ASTRO.sunriseSunset(new Date(Date.UTC(y, m-1, d, 12)), lat, lon);
    const out = root.querySelector('#hrOut');
    if(ss.polar){ out.textContent = 'No sunrise or sunset at this latitude on this date.'; return; }
    const rise = ss.sunrise + tz, set = ss.sunset + tz;
    const nextRise = rise + 24;
    const dayLen = (set - rise)/12, nightLen = (nextRise - set)/12;
    const wd = new Date(y, m-1, d).getDay();
    const start = ORDER.indexOf(DAYLORD[wd]);
    const rows = [];
    for(let i=0;i<12;i++){
      rows.push([fmtHM(rise + i*dayLen)+' – '+fmtHM(rise + (i+1)*dayLen), ORDER[(start+i) % 7], 'day']);
    }
    for(let i=0;i<12;i++){
      rows.push([fmtHM(set + i*nightLen)+' – '+fmtHM(set + (i+1)*nightLen), ORDER[(start+12+i) % 7], 'night']);
    }
    out.innerHTML = `<div class="hint">Day ruled by ${DAYLORD[wd]} · sunrise ${fmtHM(rise)} · sunset ${fmtHM(set)}</div>
      <table class="mono"><tr><th style="text-align:left">Hour</th><th style="text-align:left">Planet</th></tr>
      ${rows.map(([t,p,kind])=>`<tr><td>${t}</td><td>${p}${kind==='day'?'':' <span style="color:#9a9a9f">(night)</span>'}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

alm('tithical','Tithi Calendar', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Month</label><input type="month" id="tcMonth"></div>
      <div class="field"><label>Nakshatra too?</label><select id="tcNak"><option value="no">Tithi only</option><option value="yes">Tithi and nakshatra</option></select></div>
    </div>
    <div class="output" id="tcOut">—</div>
    <div class="hint">The tithi at sunrise for each day of the month — the way a printed panchang lists it, since the day's ritual reading is fixed at sunrise. Approximate to about a minute, and local tradition may differ.</div>`;
  const now = new Date();
  root.querySelector('#tcMonth').value = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  function run(){
    const val = root.querySelector('#tcMonth').value || (now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0'));
    const [y,m] = val.split('-').map(Number);
    const withNak = root.querySelector('#tcNak').value === 'yes';
    const days = new Date(y, m, 0).getDate();
    const rows = [];
    for(let d=1; d<=days; d++){
      const jd = ASTRO.jd({y, m, d, h: 6});   // 06:00 local, near sunrise in India
      const p = ASTRO.panchang(jd);
      rows.push([d, p.tithi.paksha+' '+p.tithi.name, withNak ? p.nakshatra.name+' · '+p.nakshatra.pada : '']);
    }
    root.querySelector('#tcOut').innerHTML = `<table class="mono"><tr><th style="text-align:left">Day</th><th style="text-align:left">Tithi at 06:00</th>${withNak?'<th style="text-align:left">Nakshatra</th>':''}</tr>
      ${rows.map(r=>`<tr><td>${r[0]}</td><td>${escapeHtml(r[1])}</td>${withNak?`<td>${escapeHtml(r[2])}</td>`:''}</tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>{ el.addEventListener('input', run); el.addEventListener('change', run); });
  run();
});

/* ---------------- Communication (2) ---------------- */

com('smscount','SMS Character Counter', root=>{
  root.innerHTML = `
    <div class="field"><label>Message</label><textarea id="smIn" placeholder="Type the message you are about to send."></textarea></div>
    <div class="output" id="smOut">—</div>
    <div class="hint">GSM-7 covers plain English at 160 characters per SMS, but a single ₹, a curly quote or a Devanagari character forces UCS-2 and drops the limit to 70 — which is why one emoji can triple the cost of a campaign.</div>`;
  const GSM = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
  function run(){
    const t = root.querySelector('#smIn').value;
    const out = root.querySelector('#smOut');
    if(!t){ out.textContent = '—'; return; }
    const isGsm = [...t].every(c=>GSM.includes(c));
    const len = t.length;
    const single = isGsm ? 160 : 70;
    const multi = isGsm ? 153 : 67;
    const parts = len <= single ? 1 : Math.ceil(len/multi);
    const rows = [
      ['Characters', len],
      ['Encoding', isGsm ? 'GSM-7' : 'UCS-2'],
      ['SMS parts', parts],
      ['Per-part limit', len <= single ? single : multi],
      ['Characters left in this part', len <= single ? single-len : multi - (len % multi || multi)],
      ['UTF-8 bytes', new TextEncoder().encode(t).length]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      ${isGsm ? '' : '<div class="hint">Something in this message is outside GSM-7 — a smart quote, an emoji or a non-Latin character.</div>'}`;
  }
  root.querySelector('#smIn').addEventListener('input', run);
  run();
});

com('phoneformat','Phone Number Formatter', root=>{
  root.innerHTML = `
    <div class="field"><label>Number</label><input type="text" id="pfIn" value="9825012345"></div>
    <div class="row">
      <div class="field"><label>Default country code</label><input type="text" id="pfCC" value="91"></div>
      <div class="field"><label>&nbsp;</label><button class="btn primary" id="pfGo" style="width:100%">Format</button></div>
    </div>
    <div class="output" id="pfOut">—</div>
    <div class="hint">E.164, the international display form, and a wa.me link. It cannot validate that a number exists — only that its length is plausible for the country code you gave.</div>`;
  root.querySelector('#pfGo').addEventListener('click', ()=>{
    const raw = root.querySelector('#pfIn').value.trim();
    const cc = (root.querySelector('#pfCC').value || '91').replace(/\D/g,'');
    const out = root.querySelector('#pfOut');
    let digits = raw.replace(/[^\d+]/g,'');
    if(digits.startsWith('+')) digits = digits.slice(1);
    else if(digits.startsWith('0')) digits = cc + digits.replace(/^0+/,'');
    else if(!digits.startsWith(cc) && digits.length <= 10) digits = cc + digits;
    if(digits.length < 8 || digits.length > 15){ out.textContent = 'That does not look like a phone number — E.164 allows 8 to 15 digits.'; return; }
    const national = digits.slice(cc.length);
    const rows = [
      ['E.164', '+'+digits],
      ['National', national],
      ['Spaced (India style)', cc === '91' && national.length === 10 ? '+91 '+national.slice(0,5)+' '+national.slice(5) : '—'],
      ['WhatsApp link', `https://wa.me/${digits}`],
      ['tel: link', 'tel:+'+digits]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td style="word-break:break-all">${escapeHtml(v)}</td></tr>`).join('')}</table>`;
  });
});

/* ---------------- Reference (5) ---------------- */

ref('asciitable','ASCII Table', root=>{
  const CTRL = {0:'NUL',1:'SOH',2:'STX',3:'ETX',4:'EOT',5:'ENQ',6:'ACK',7:'BEL',8:'BS',9:'TAB',10:'LF',11:'VT',12:'FF',13:'CR',
    14:'SO',15:'SI',16:'DLE',17:'DC1',18:'DC2',19:'DC3',20:'DC4',21:'NAK',22:'SYN',23:'ETB',24:'CAN',25:'EM',26:'SUB',27:'ESC',
    28:'FS',29:'GS',30:'RS',31:'US',32:'SPACE',127:'DEL'};
  root.innerHTML = `
    <div class="field"><label>Filter</label><input type="search" id="atFilter" placeholder="e.g. A, 65, 0x41" autocomplete="off"></div>
    <div class="hint">Decimal, hex, octal, binary and the character. Control characters are named, because a raw BEL is invisible and confusing.</div>
    <div style="max-height:520px;overflow:auto"><table class="mono" id="atTable"></table></div>`;
  function draw(filter){
    const f = (filter||'').trim().toLowerCase();
    const rows = [];
    for(let i=0;i<128;i++){
      const ch = CTRL[i] || String.fromCharCode(i);
      const hex = '0x'+i.toString(16).toUpperCase().padStart(2,'0');
      if(f && !(String(i) === f || hex.toLowerCase() === f || (CTRL[i]||'').toLowerCase().includes(f) || (CTRL[i] ? false : ch.toLowerCase() === f))) continue;
      rows.push([i, hex, '0o'+i.toString(8), i.toString(2).padStart(7,'0'), CTRL[i] ? '· '+CTRL[i] : ch]);
    }
    root.querySelector('#atTable').innerHTML = `<tr><th style="text-align:left">Dec</th><th style="text-align:left">Hex</th><th style="text-align:left">Oct</th><th style="text-align:left">Binary</th><th style="text-align:left">Char</th></tr>`
      + rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${escapeHtml(r[4])}</td></tr>`).join('');
  }
  root.querySelector('#atFilter').addEventListener('input', e=>draw(e.target.value));
  draw('');
});

ref('bigo','Big-O Cheatsheet', root=>{
  const ROWS = [
    ['O(1)','constant','array index, hash lookup','1','1','1','1','1','1'],
    ['O(log n)','logarithmic','binary search, balanced tree','1','2','3','4','5','6'],
    ['O(n)','linear','one pass over a list','1','10','100','1,000','10,000','100,000'],
    ['O(n log n)','linearithmic','good sorting (merge, heap)','1','33','664','9,966','132,877','1,660,964'],
    ['O(n²)','quadratic','nested loops, bubble sort','1','100','10,000','1,000,000','100,000,000','10,000,000,000'],
    ['O(2ⁿ)','exponential','subsets, naive recursion','2','1,024','1.3e30','—','—','—'],
    ['O(n!)','factorial','every permutation','1','3.6e6','—','—','—','—']
  ];
  root.innerHTML = `
    <div class="hint">Steps for n = 1, 10, 100, 1,000, 10,000, 100,000. The point of the table is the last three columns: at 100,000 items a quadratic algorithm is 10¹⁰ steps and the exponential ones are not going to finish at all.</div>
    <table class="mono"><tr><th style="text-align:left">Class</th><th style="text-align:left">Name</th><th style="text-align:left">Typical</th><th style="text-align:left">n=1</th><th style="text-align:left">10</th><th style="text-align:left">100</th><th style="text-align:left">1k</th><th style="text-align:left">10k</th><th style="text-align:left">100k</th></tr>
      ${ROWS.map(r=>`<tr>${r.map((c,i)=>`<td${i<3?' style="white-space:nowrap"':''}>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</table>
    <div class="hint">A step is not a fixed unit of time — cache misses and constant factors decide real speed. This is about shape, not stopwatch.</div>`;
});

ref('regexcheat','Regex Cheatsheet', root=>{
  const GROUPS = [
    ['Characters', [
      ['.', 'any character except a newline'],
      ['\\d \\D', 'a digit / not a digit'],
      ['\\w \\W', 'word character (letter, digit, underscore) / not'],
      ['\\s \\S', 'whitespace / not whitespace'],
      ['[abc] [^abc]', 'one of a, b, c / anything but'],
      ['[a-z]', 'a range']
    ]],
    ['Quantifiers', [
      ['*', 'zero or more'], ['+', 'one or more'], ['?', 'zero or one'],
      ['{3}', 'exactly three'], ['{2,5}', 'two to five'], ['{2,}', 'two or more'],
      ['*? +?', 'lazy — match as little as possible']
    ]],
    ['Anchors', [
      ['^ $', 'start and end of the string (or line, with the m flag)'],
      ['\\b', 'word boundary'], ['\\B', 'not a word boundary']
    ]],
    ['Groups', [
      ['( … )', 'capturing group'], ['(?: … )', 'non-capturing group'],
      ['(?<name> … )', 'named capture'], ['(?= … )', 'lookahead'],
      ['(?! … )', 'negative lookahead'], ['(?<= … )', 'lookbehind'], ['(?<! … )', 'negative lookbehind'],
      ['\\1', 'backreference to group 1']
    ]],
    ['Common patterns', [
      ['^[\\w.+-]+@[\\w-]+\\.[\\w.]+$', 'an email, roughly'],
      ['^\\+?[0-9]{8,15}$', 'an E.164 phone number'],
      ['^\\d{4}-\\d{2}-\\d{2}$', 'an ISO date'],
      ['^#[0-9a-fA-F]{3,8}$', 'a hex colour'],
      ['^\\s*$', 'a blank line'],
      ['<[^>]+>', 'an HTML tag']
    ]],
    ['Flags', [
      ['g', 'global — find every match'], ['i', 'case-insensitive'], ['m', 'multiline ^ and $'],
      ['s', 'dot matches newline'], ['u', 'unicode mode'], ['y', 'sticky — match from lastIndex']
    ]]
  ];
  root.innerHTML = `
    <div class="hint">Click any pattern to copy it. The Regex Tester is where you try one against your own text; this is the reference you keep open beside it.</div>
    ${GROUPS.map(([name, rows])=>`<div class="section-label" style="margin:16px 0 8px">${name}</div>
      <table class="mono">${rows.map(([p, d])=>`<tr><td><button data-p="${escapeHtml(p)}" style="background:none;border:none;font-family:var(--mono);font-size:12.5px;color:var(--accent);cursor:pointer;padding:0;text-align:left">${escapeHtml(p)}</button></td><td>${escapeHtml(d)}</td></tr>`).join('')}</table>`).join('')}`;
  root.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click', ()=>{
    if(navigator.clipboard) navigator.clipboard.writeText(b.dataset.p);
    const old = b.textContent; b.textContent = 'copied'; setTimeout(()=>{ b.textContent = old; }, 800);
  }));
});

ref('dialcodes','Country Dial Codes', root=>{
  const DATA = [
    ['India','+91'],['Pakistan','+92'],['Bangladesh','+880'],['Sri Lanka','+94'],['Nepal','+977'],['Bhutan','+975'],
    ['Maldives','+960'],['Afghanistan','+93'],['China','+86'],['Japan','+81'],['South Korea','+82'],['Singapore','+65'],
    ['Malaysia','+60'],['Indonesia','+62'],['Thailand','+66'],['Vietnam','+84'],['Philippines','+63'],['Hong Kong','+852'],
    ['UAE','+971'],['Saudi Arabia','+966'],['Qatar','+974'],['Kuwait','+965'],['Oman','+968'],['Bahrain','+973'],
    ['Israel','+972'],['Turkey','+90'],['Iran','+98'],['Iraq','+964'],['Egypt','+20'],['South Africa','+27'],
    ['Nigeria','+234'],['Kenya','+254'],['Ethiopia','+251'],['Ghana','+233'],['Morocco','+212'],['Tanzania','+255'],
    ['United Kingdom','+44'],['Ireland','+353'],['Germany','+49'],['France','+33'],['Spain','+34'],['Italy','+39'],
    ['Netherlands','+31'],['Belgium','+32'],['Switzerland','+41'],['Austria','+43'],['Sweden','+46'],['Norway','+47'],
    ['Denmark','+45'],['Finland','+358'],['Poland','+48'],['Portugal','+351'],['Greece','+30'],['Russia','+7'],
    ['Ukraine','+380'],['Czechia','+420'],['Romania','+40'],['Hungary','+36'],['United States','+1'],['Canada','+1'],
    ['Mexico','+52'],['Brazil','+55'],['Argentina','+54'],['Chile','+56'],['Colombia','+57'],['Peru','+51'],
    ['Australia','+61'],['New Zealand','+64'],['Fiji','+679']
  ];
  root.innerHTML = `
    <div class="field"><label>Search</label><input type="search" id="dcFilter" placeholder="country or code" autocomplete="off"></div>
    <table class="mono" id="dcTable"></table>
    <div class="hint">Country calling codes only. The emergency number is different again, and it is not always 112 — check before you travel, not after.</div>`;
  function draw(f){
    const q = (f||'').toLowerCase();
    root.querySelector('#dcTable').innerHTML = DATA.filter(([c,n])=>c.toLowerCase().includes(q) || n.includes(q))
      .map(([c,n])=>`<tr><td>${escapeHtml(c)}</td><td>${n}</td></tr>`).join('');
  }
  root.querySelector('#dcFilter').addEventListener('input', e=>draw(e.target.value));
  draw('');
});

ref('shortcuts','Keyboard Shortcuts', root=>{
  const SETS = {
    'Windows': [['Win + .', 'emoji picker'], ['Win + V', 'clipboard history'], ['Win + Shift + S', 'screenshot region'],
      ['Win + D', 'show desktop'], ['Win + E', 'file explorer'], ['Win + L', 'lock'], ['Win + ←/→', 'snap window'],
      ['Alt + Tab', 'switch windows'], ['Ctrl + Shift + Esc', 'task manager'], ['Ctrl + Shift + T', 'reopen closed tab']],
    'macOS': [['⌘ Space', 'Spotlight'], ['⌘ Tab', 'switch apps'], ['⌘ ⇧ 4', 'screenshot region'],
      ['⌘ ⇧ 5', 'screenshot options'], ['⌘ ⌥ Esc', 'force quit'], ['⌘ ⇧ T', 'reopen closed tab'],
      ['⌘ ←/→', 'line start / end'], ['⌘ ⇧ V', 'paste without formatting'], ['⌃ ⌘ Space', 'emoji picker']],
    'Browser': [['Ctrl/⌘ + T', 'new tab'], ['Ctrl/⌘ + W', 'close tab'], ['Ctrl/⌘ + ⇧ + T', 'reopen closed tab'],
      ['Ctrl/⌘ + L', 'focus address bar'], ['Ctrl/⌘ + F', 'find on page'], ['Ctrl/⌘ + ⇧ + F', 'find in all files (devtools)'],
      ['F12 / ⌘ ⌥ I', 'devtools'], ['Ctrl/⌘ + 0', 'reset zoom'], ['Ctrl/⌘ + P', 'print']],
    'Kitbox': [['Ctrl / ⌘ + K', 'search every tool'], ['/', 'search every tool'], ['↑ ↓', 'move through results'],
      ['↵', 'open the highlighted tool'], ['Esc', 'close the search, then go back a page']]
  };
  root.innerHTML = `
    <div class="segrow" id="scTabs">${Object.keys(SETS).map((k,i)=>`<button class="btn ${i===0?'primary':''}" data-set="${k}">${k}</button>`).join('')}</div>
    <div class="output" id="scOut">—</div>
    <div class="hint">The Kitbox set is the one that matters here; the rest are for the machine it runs on.</div>`;
  function show(name){
    root.querySelector('#scOut').innerHTML = `<table class="mono">${SETS[name].map(([k,v])=>`<tr><td style="white-space:nowrap">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('[data-set]').forEach(b=>b.addEventListener('click', ()=>{
    root.querySelectorAll('[data-set]').forEach(x=>x.classList.remove('primary'));
    b.classList.add('primary');
    show(b.dataset.set);
  }));
  show('Windows');
});

/* ---------------- System (3) ---------------- */

sys('deviceinfo','Device & Screen Info', root=>{
  root.innerHTML = `
    <div class="output" id="diOut">—</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="diCopy">Copy as text</button></div>
    <div class="hint">What this page can see about the machine it is running on. Useful when someone reports "it looks wrong on my phone" — ask them for this, not for a screenshot.</div>`;
  function matches(q){
    try{ return !!(window.matchMedia && window.matchMedia(q).matches); }catch(e){ return false; }
  }
  function collect(){
    const n = navigator;
    const rows = [
      ['Viewport', window.innerWidth+' × '+window.innerHeight+' px'],
      ['Screen', screen.width+' × '+screen.height+' px'],
      ['Available screen', screen.availWidth+' × '+screen.availHeight+' px'],
      ['Device pixel ratio', window.devicePixelRatio+'×'],
      ['Colour depth', screen.colorDepth+' bit'],
      ['Platform', n.platform || '—'],
      ['Language', n.language + (n.languages ? ' ('+n.languages.join(', ')+')' : '')],
      ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
      ['UTC offset', 'UTC' + (new Date().getTimezoneOffset() > 0 ? '-' : '+') + Math.abs(new Date().getTimezoneOffset()/60)],
      ['CPU cores', n.hardwareConcurrency || 'not reported'],
      ['Device memory', n.deviceMemory ? n.deviceMemory+' GB' : 'not reported'],
      ['Touch points', n.maxTouchPoints || 0],
      ['Online', n.onLine ? 'yes' : 'no'],
      ['Connection', n.connection ? (n.connection.effectiveType || 'unknown') + (n.connection.downlink ? ' · '+n.connection.downlink+' Mb/s' : '') : 'not reported'],
      ['Reduced motion', matches('(prefers-reduced-motion: reduce)') ? 'preferred' : 'not set'],
      ['Dark mode', matches('(prefers-color-scheme: dark)') ? 'preferred' : 'not set'],
      ['User agent', n.userAgent]
    ];
    return rows;
  }
  root.querySelector('#diOut').innerHTML = `<table class="mono">${collect().map(([k,v])=>`<tr><td style="white-space:nowrap">${escapeHtml(k)}</td><td style="word-break:break-word">${escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
  root.querySelector('#diCopy').addEventListener('click', ()=>{
    const text = collect().map(([k,v])=>k+': '+v).join('\n');
    if(navigator.clipboard) navigator.clipboard.writeText(text);
  });
});

sys('errorlog','Error Log', root=>{
  root.innerHTML = `
    <div class="output" id="elOut">—</div>
    <div class="row" style="margin-top:12px">
      <button class="btn" id="elCopy">Copy</button>
      <button class="btn" id="elClear">Clear</button>
    </div>
    <div class="hint">Errors thrown by a tool, kept on this device only — the last twenty, newest first. Nothing is reported anywhere. If you are filing a bug, this is the block the issue template asks for.</div>`;
  function draw(){
    const log = store.get('error-log', []);
    root.querySelector('#elOut').innerHTML = log.length
      ? `<table class="mono">${log.map(e=>`<tr><td style="white-space:nowrap">${escapeHtml(String(e.at).replace('T',' ').slice(0,16))}</td><td>${escapeHtml(e.where)}</td><td style="word-break:break-word">${escapeHtml(e.message)}</td></tr>`).join('')}</table>`
      : '<div class="hint">No errors recorded on this device.</div>';
  }
  root.querySelector('#elCopy').addEventListener('click', ()=>{
    const text = store.get('error-log', []).map(e=>e.at+' '+e.where+' :: '+e.message+'\n'+(e.stack||'')).join('\n\n');
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text || 'no errors').then(()=>toast('Copied'), ()=>{});
  });
  root.querySelector('#elClear').addEventListener('click', ()=>{
    store.set('error-log', []);
    draw();
    toast('Error log cleared');
  });
  draw();
});

sys('features','Browser Feature Check', root=>{
  const CHECKS = [
    ['Canvas', ()=>!!document.createElement('canvas').getContext],
    ['WebGL', ()=>{ try{ return !!document.createElement('canvas').getContext('webgl'); }catch(e){ return false; } }],
    ['Web Crypto', ()=>!!(window.crypto && crypto.subtle)],
    ['Compression Streams', ()=>typeof CompressionStream !== 'undefined'],
    ['Web Audio', ()=>!!(window.AudioContext || window.webkitAudioContext)],
    ['Speech synthesis', ()=>!!window.speechSynthesis],
    ['Speech recognition', ()=>!!(window.SpeechRecognition || window.webkitSpeechRecognition)],
    ['Geolocation', ()=>!!navigator.geolocation],
    ['Device orientation', ()=>'DeviceOrientationEvent' in window],
    ['Camera / microphone', ()=>!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)],
    ['Clipboard write', ()=>!!(navigator.clipboard && navigator.clipboard.writeText)],
    ['Notifications', ()=>'Notification' in window],
    ['Service worker', ()=>'serviceWorker' in navigator],
    ['IndexedDB', ()=>!!window.indexedDB],
    ['localStorage', ()=>{ try{ localStorage.setItem('kitbox:test','1'); localStorage.removeItem('kitbox:test'); return true; }catch(e){ return false; } }],
    ['File System Access', ()=>'showSaveFilePicker' in window],
    ['Share', ()=>!!navigator.share],
    ['Web Share files', ()=>!!(navigator.canShare)],
    ['Bluetooth', ()=>'bluetooth' in navigator],
    ['USB', ()=>'usb' in navigator],
    ['Wake lock', ()=>'wakeLock' in navigator],
    ['Picture in picture', ()=>'pictureInPictureEnabled' in document]
  ];
  root.innerHTML = `
    <div class="output" id="fcOut">—</div>
    <div class="hint">Green means this browser exposes the API. It does not mean the tool will succeed — a camera still needs permission, and a secure context (https or localhost) for most of these.</div>`;
  const rows = CHECKS.map(([name, fn])=>{
    let ok = false;
    try{ ok = !!fn(); }catch(e){ ok = false; }
    return [name, ok];
  });
  const good = rows.filter(r=>r[1]).length;
  root.querySelector('#fcOut').innerHTML = `<div class="hint">${good} of ${rows.length} available</div>
    <table class="mono">${rows.map(([n,ok])=>`<tr><td>${escapeHtml(n)}</td><td style="color:${ok?'#1e8449':'#c0392b'}">${ok?'✓ yes':'✗ no'}</td></tr>`).join('')}</table>`;
});

sys('storage','Local Storage Usage', root=>{
  root.innerHTML = `
    <div class="output" id="sgOut">—</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="sgRefresh">Refresh</button></div>
    <div class="hint">What Kitbox has written to this browser, key by key. Browsers allow roughly 5 MB of localStorage; the percentage is against that ceiling. Backup &amp; Restore is where you export or erase it.</div>`;
  function draw(){
    let total = 0;
    const rows = [];
    store.allKeys().forEach(k=>{
      let size = 0;
      try{ size = (localStorage.getItem('tooly:'+k)||'').length; }catch(e){}
      total += size;
      rows.push([k, size]);
    });
    rows.sort((a,b)=>b[1]-a[1]);
    root.querySelector('#sgOut').innerHTML = rows.length
      ? `<div class="hint">${rows.length} keys · ${fmtBytes(total)} used of roughly 5 MB (${(total/5242880*100).toFixed(2)}%)</div>
         <table class="mono">${rows.map(([k,s])=>`<tr><td>${escapeHtml(k)}</td><td>${fmtBytes(s)}</td></tr>`).join('')}</table>`
      : '<div class="hint">Nothing stored yet on this device.</div>';
  }
  root.querySelector('#sgRefresh').addEventListener('click', draw);
  draw();
});

