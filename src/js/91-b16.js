/* ================================================================
   B16 — the medium ones: word-level diff, text extractors, ZIP extract, tuner.
   ================================================================ */

/* ---------------- Text (2) ---------------- */

txt('Analysis Tools','worddiff','Word-Level Diff', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Before</label><textarea id="wdA" style="min-height:100px">The report was written by the clinician and reviewed twice.</textarea></div>
      <div class="field"><label>After</label><textarea id="wdB" style="min-height:100px">The report was written by the physician and reviewed three times.</textarea></div>
    </div>
    <div class="output" id="wdOut" style="white-space:pre-wrap;line-height:1.8">—</div>
    <div class="hint">Line diff is the wrong grain for prose: one changed word marks the whole line. This compares words, so the two words that changed are the two words shown.</div>`;
  function tokens(s){ return s.match(/\s+|[\w'’-]+|[^\s\w]/g) || []; }
  function draw(){
    const A = tokens(root.querySelector('#wdA').value);
    const B = tokens(root.querySelector('#wdB').value);
    const n = A.length, m = B.length;
    // LCS table — 2000 × 2000 is 4 million cells, which is fine for a paragraph
    if(n * m > 4000000){ root.querySelector('#wdOut').textContent = 'Too long to compare word by word — try a shorter passage.'; return; }
    const dp = Array.from({length: n+1}, ()=>new Uint16Array(m+1));
    for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--){
      dp[i][j] = A[i] === B[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
    }
    let i = 0, j = 0, html = '';
    const esc = escapeHtml;
    while(i < n && j < m){
      if(A[i] === B[j]){ html += esc(A[i]); i++; j++; }
      else if(dp[i+1][j] >= dp[i][j+1]){ html += '<span style="background:#fde2e1;text-decoration:line-through">' + esc(A[i]) + '</span>'; i++; }
      else { html += '<span style="background:#e2f5e6">' + esc(B[j]) + '</span>'; j++; }
    }
    while(i < n){ html += '<span style="background:#fde2e1;text-decoration:line-through">' + esc(A[i++]) + '</span>'; }
    while(j < m){ html += '<span style="background:#e2f5e6">' + esc(B[j++]) + '</span>'; }
    root.querySelector('#wdOut').innerHTML = html;
  }
  root.querySelectorAll('textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

txt('Analysis Tools','extract','Extract From Text', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="exIn" style="min-height:130px" placeholder="Paste a log, an email, a config file…"></textarea></div>
    <div class="segrow" id="exKinds">
      <label><input type="checkbox" data-kind="url" checked> URLs</label>
      <label><input type="checkbox" data-kind="email" checked> Emails</label>
      <label><input type="checkbox" data-kind="ip" checked> IPv4</label>
      <label><input type="checkbox" data-kind="mac"> MAC</label>
      <label><input type="checkbox" data-kind="domain"> Domains</label>
      <label><input type="checkbox" data-kind="hash"> Hashes</label>
    </div>
    <div class="output" id="exOut">—</div>
    <div class="hint">Five regexes over the same text, deduplicated and in the order they appear. Double-click the result to copy it. Nothing is fetched, so a URL here is just a string.</div>`;
  const PATTERNS = {
    url: /\bhttps?:\/\/[^\s<>"')\]]+/gi,
    email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    ip: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
    mac: /\b(?:[0-9A-F]{2}[:-]){5}[0-9A-F]{2}\b/gi,
    domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|dev|in|co|uk|de|ai|app|gov|edu)\b/gi,
    hash: /\b[0-9a-f]{32}\b|\b[0-9a-f]{40}\b|\b[0-9a-f]{64}\b/gi
  };
  function draw(){
    const text = root.querySelector('#exIn').value;
    const on = [...root.querySelectorAll('[data-kind]')].filter(cb=>cb.checked).map(cb=>cb.dataset.kind);
    const found = [];
    on.forEach(kind=>{
      const hits = text.match(PATTERNS[kind]) || [];
      hits.forEach(h=>{
        const value = kind === 'url' ? h.replace(/[.,;:]+$/, '') : h;
        if(!found.some(f=>f.value === value)) found.push({ kind, value });
      });
    });
    const out = root.querySelector('#exOut');
    out.innerHTML = found.length
      ? `<table class="mono">${found.map(f=>`<tr><td>${f.kind}</td><td style="word-break:break-all">${escapeHtml(f.value)}</td></tr>`).join('')}</table>
         <div class="hint">${found.length} distinct value(s)</div>`
      : '<div class="hint">Nothing matched yet — paste some text above.</div>';
  }
  root.querySelector('#exIn').addEventListener('input', draw);
  root.querySelectorAll('[data-kind]').forEach(cb=>cb.addEventListener('change', draw));
  draw();
});

/* ---------------- Files (1) ---------------- */

fil('zipextract','ZIP Extract', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>Archive</label><input type="file" id="zxFile" accept=".zip,application/zip"></div>
    <div class="output" id="zxOut">Choose a .zip to list what is inside.</div>
    <div class="hint">Reads the central directory and inflates each entry with the browser's own <span class="mono">DecompressionStream('deflate-raw')</span> — no library, which is why this only became possible recently. Store and deflate methods are supported; encrypted archives are refused rather than half-read.</div>`;
  const u16 = (b, o) => b[o] | (b[o+1] << 8);
  const u32 = (b, o) => (b[o] | (b[o+1] << 8) | (b[o+2] << 16) | (b[o+3] << 24)) >>> 0;
  function findEOCD(b){
    for(let i = b.length - 22; i >= 0 && i > b.length - 65558; i--){
      if(b[i] === 0x50 && b[i+1] === 0x4b && b[i+2] === 5 && b[i+3] === 6) return i;
    }
    return -1;
  }
  function entries(b){
    const eocd = findEOCD(b);
    if(eocd < 0) throw new Error('No end-of-central-directory record — is this a ZIP?');
    const count = u16(b, eocd + 10);
    let p = u32(b, eocd + 16);
    const list = [];
    for(let i=0;i<count;i++){
      if(u32(b, p) !== 0x02014b50) throw new Error('Central directory entry ' + i + ' is malformed');
      const method = u16(b, p + 10);
      const flags = u16(b, p + 8);
      const csize = u32(b, p + 20);
      const usize = u32(b, p + 24);
      const nameLen = u16(b, p + 28), extraLen = u16(b, p + 30), commentLen = u16(b, p + 32);
      const localOff = u32(b, p + 42);
      const name = textFromBytes(b.slice(p + 46, p + 46 + nameLen));
      list.push({ name, method, flags, csize, usize, localOff });
      p += 46 + nameLen + extraLen + commentLen;
    }
    return list;
  }
  async function readEntry(b, entry){
    const lh = entry.localOff;
    if(u32(b, lh) !== 0x04034b50) throw new Error('Bad local header for ' + entry.name);
    const nameLen = u16(b, lh + 26), extraLen = u16(b, lh + 28);
    const start = lh + 30 + nameLen + extraLen;
    const raw = b.slice(start, start + entry.csize);
    if(entry.method === 0) return raw;
    if(entry.method !== 8) throw new Error('method ' + entry.method + ' is not supported (store and deflate only)');
    const ds = new DecompressionStream('deflate-raw');
    const stream = new Blob([raw]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  let archive = null, list = [];
  root.querySelector('#zxFile').addEventListener('change', async e=>{
    const f = e.target.files[0];
    const out = root.querySelector('#zxOut');
    if(!f) return;
    if(!f.size){ out.textContent = 'That file is empty.'; return; }
    try{
      archive = new Uint8Array(await f.arrayBuffer());
      list = entries(archive);
      const enc = list.filter(x=>x.flags & 1);
      out.innerHTML = `<table class="mono">${list.map((x, i)=>
        `<tr><td>${i}</td><td style="word-break:break-all">${escapeHtml(x.name)}</td><td>${x.usize.toLocaleString(numLocale())} B</td>
         <td><button class="btn ghost" data-zx="${i}" style="padding:2px 8px;font-size:12px">Save</button></td></tr>`).join('')}</table>
        <div class="hint">${list.length} entries${enc.length ? ' — ' + enc.length + ' encrypted, which this cannot open' : ''}</div>`;
      out.querySelectorAll('[data-zx]').forEach(b=>b.addEventListener('click', async ()=>{
        const i = Number(b.dataset.zx);
        try{
          const data = await readEntry(archive, list[i]);
          saveBlob(new Blob([data]), list[i].name.split('/').pop() || 'file');
        }catch(err){ toast('Could not extract: ' + err.message); }
      }));
    }catch(err){
      out.textContent = 'That archive could not be read: ' + err.message;
    }
  });
});

/* ---------------- Audio (1) ---------------- */

aud('tuner','Tuner', root=>{
  root.innerHTML = `
    <div class="output" style="text-align:center;padding:22px 10px">
      <div id="tnNote" style="font-family:var(--mono);font-size:52px;font-weight:700;line-height:1">—</div>
      <div id="tnCents" class="hint" style="margin-top:8px">Start the microphone and play a note.</div>
      <div id="tnBar" style="position:relative;height:8px;background:var(--line);margin:16px auto;max-width:320px">
        <div id="tnDot" style="position:absolute;top:-4px;width:16px;height:16px;background:var(--accent);left:50%;transform:translateX(-50%)"></div>
      </div>
    </div>
    <div class="segrow"><button class="btn primary" id="tnGo">Start microphone</button></div>
    <div class="hint">Autocorrelation on the microphone signal — no server, no upload, nothing recorded. Works best on a single sustained note; a chord gives you nonsense.</div>`;
  let stream = null, ctx = null, raf = null;
  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  function stop(){
    if(raf) cancelAnimationFrame(raf);
    raf = null;
    if(stream) stream.getTracks().forEach(t=>t.stop());
    stream = null;
    if(ctx){ ctx.close(); ctx = null; }
  }
  setCleanup(stop);
  root.querySelector('#tnGo').addEventListener('click', async ()=>{
    const msg = root.querySelector('#tnCents');
    if(stream){ stop(); root.querySelector('#tnGo').textContent = 'Start microphone'; msg.textContent = 'Stopped.'; return; }
    try{
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation:false, autoGainControl:false, noiseSuppression:false } });
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      root.querySelector('#tnGo').textContent = 'Stop';
      msg.textContent = 'Listening…';
      const tick = ()=>{
        analyser.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, ctx.sampleRate);
        if(freq > 0){
          const midi = 69 + 12 * Math.log2(freq / 440);
          const nearest = Math.round(midi);
          const cents = Math.round((midi - nearest) * 100);
          root.querySelector('#tnNote').textContent = NOTE_NAMES[((nearest % 12) + 12) % 12] + (Math.floor(nearest / 12) - 1);
          msg.textContent = (cents === 0 ? 'in tune' : (cents > 0 ? '+' + cents : cents) + ' cents · ' + freq.toFixed(1) + ' Hz');
          const dot = root.querySelector('#tnDot');
          dot.style.left = Math.max(2, Math.min(98, 50 + cents)) + '%';
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
    }catch(e){
      msg.textContent = 'The microphone was not available: ' + (e.message || e);
    }
  });
});

/* Autocorrelation, as used in every tuner that works: find the lag where the
   signal best matches itself, and invert it to get the frequency. */
function autoCorrelate(buf, sampleRate){
  const SIZE = buf.length;
  let rms = 0;
  for(let i=0;i<SIZE;i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if(rms < 0.01) return -1;
  let start = 0, end = SIZE - 1;
  const threshold = 0.2;
  for(let i=0;i<SIZE/2;i++) if(Math.abs(buf[i]) < threshold){ start = i; break; }
  for(let i=1;i<SIZE/2;i++) if(Math.abs(buf[SIZE-i]) < threshold){ end = SIZE-i; break; }
  const slice = buf.slice(start, end);
  const c = new Float32Array(slice.length).fill(0);
  for(let lag=0; lag<slice.length; lag++){
    for(let i=0;i<slice.length - lag;i++) c[lag] += slice[i] * slice[i+lag];
  }
  let d = 0;
  while(d < c.length - 1 && c[d] > c[d+1]) d++;
  let maxval = -1, maxpos = -1;
  for(let i=d;i<c.length;i++) if(c[i] > maxval){ maxval = c[i]; maxpos = i; }
  let T0 = maxpos;
  const x1 = c[T0-1] || 0, x2 = c[T0], x3 = c[T0+1] || 0;
  const a = (x1 + x3 - 2*x2) / 2, b = (x3 - x1) / 2;
  if(a) T0 = T0 - b / (2*a);
  return sampleRate / T0;
}
