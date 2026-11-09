/* ================================================================
   B35 — four more image adjustments (same harness as HSL/Invert/Opacity)
   and three development tools.
   ================================================================ */

/* ---------------- Image (4) ---------------- */

imageAdjustTool('imsharpen', 'Sharpen Image',
  'An unsharp mask: blur a copy, subtract it, add the difference back scaled by the amount. Radius controls how wide the edge has to be before it is sharpened, so a large radius sharpens structure and a small one sharpens texture — and amplifies noise with it.',
  `<div class="field"><label>Amount <span data-adj-out="amount">100</span>%</label><input type="range" data-adj="amount" min="0" max="300" value="100"></div>
   <div class="field"><label>Radius <span data-adj-out="radius">1</span>px</label><input type="range" data-adj="radius" min="1" max="6" value="1"></div>
   <div class="field"><label>Threshold <span data-adj-out="threshold">0</span></label><input type="range" data-adj="threshold" min="0" max="40" value="0"></div>`,
  (ctx, img, canvas, v)=>{
    const w = canvas.width, h = canvas.height;
    ctx.drawImage(img, 0, 0);
    const src = ctx.getImageData(0, 0, w, h);
    const radius = Math.max(1, Math.round(v.radius));
    // box blur of the original, then the classic unsharp mask
    const blurred = new Uint8ClampedArray(src.data);
    const tmp = new Uint8ClampedArray(src.data);
    const pass = (input, output, horizontal)=>{
      const len = horizontal ? w : h, outer = horizontal ? h : w;
      for(let o=0;o<outer;o++){
        for(let i=0;i<len;i++){
          let r = 0, g = 0, b = 0, n = 0;
          for(let k=-radius;k<=radius;k++){
            const j = i + k;
            if(j < 0 || j >= len) continue;
            const idx = ((horizontal ? o * w + j : j * w + o) * 4);
            r += input[idx]; g += input[idx+1]; b += input[idx+2]; n++;
          }
          const out = (horizontal ? o * w + i : i * w + o) * 4;
          output[out] = r / n; output[out+1] = g / n; output[out+2] = b / n;
        }
      }
    };
    pass(blurred, tmp, true);
    pass(tmp, blurred, false);
    const amount = v.amount / 100, threshold = v.threshold;
    for(let i=0;i<src.data.length;i+=4){
      for(let c=0;c<3;c++){
        const diff = src.data[i+c] - blurred[i+c];
        if(Math.abs(diff) < threshold) continue;
        src.data[i+c] = src.data[i+c] + diff * amount;
      }
    }
    ctx.putImageData(src, 0, 0);
  });

imageAdjustTool('imdither', 'Dither Image',
  'Floyd–Steinberg error diffusion to one bit per channel — the look of an old newspaper or a 1-bit e-reader. The error from each pixel is pushed into its neighbours so gradients become patterns of dots instead of bands.',
  `<div class="field"><label>Levels <span data-adj-out="levels">2</span></label><input type="range" data-adj="levels" min="2" max="8" value="2"></div>
   <div class="field"><label>Threshold <span data-adj-out="threshold">128</span></label><input type="range" data-adj="threshold" min="32" max="224" value="128"></div>`,
  (ctx, img, canvas, v)=>{
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data, w = canvas.width, h = canvas.height;
    const levels = Math.max(2, Math.round(v.levels));
    const step = 255 / (levels - 1);
    const at = (x, y) => (y * w + x) * 4;
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        const i = at(x, y);
        const old = (px[i] + px[i+1] + px[i+2]) / 3;
        const q = Math.round(old / step) * step;
        const err = old - q;
        px[i] = px[i+1] = px[i+2] = q;
        const spread = (dx, dy, factor)=>{
          if(x + dx < 0 || x + dx >= w || y + dy < 0 || y + dy >= h) return;
          const j = at(x + dx, y + dy);
          const value = px[j] + err * factor;
          px[j] = px[j+1] = px[j+2] = Math.max(0, Math.min(255, value));
        };
        spread(1, 0, 7/16); spread(-1, 1, 3/16); spread(0, 1, 5/16); spread(1, 1, 1/16);
      }
    }
    ctx.putImageData(data, 0, 0);
  });

imageAdjustTool('imautolevels', 'Auto Levels',
  'Stretches each channel so the darkest pixel becomes black and the brightest becomes white — the fix for a scan or a phone photo that looks grey. The clip percentage ignores the extreme pixels, so one speck of dust does not flatten the whole image.',
  `<div class="field"><label>Clip <span data-adj-out="clip">0.5</span>%</label><input type="range" data-adj="clip" min="0" max="5" step="0.1" value="0.5"></div>`,
  (ctx, img, canvas, v)=>{
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    const clip = v.clip / 100;
    for(let c=0;c<3;c++){
      const hist = new Uint32Array(256);
      for(let i=c;i<px.length;i+=4) hist[px[i]]++;
      const total = px.length / 4;
      const limit = Math.floor(total * clip);
      let low = 0, high = 255, acc = 0;
      for(let i=0;i<256;i++){ acc += hist[i]; if(acc > limit){ low = i; break; } }
      acc = 0;
      for(let i=255;i>=0;i--){ acc += hist[i]; if(acc > limit){ high = i; break; } }
      if(high <= low) continue;
      const scale = 255 / (high - low);
      for(let i=c;i<px.length;i+=4) px[i] = (px[i] - low) * scale;
    }
    ctx.putImageData(data, 0, 0);
  });

imageAdjustTool('imcontrast', 'Contrast Stretch',
  'A straight line through the tonal range: pivot, slope, clamp. Below 100% the image flattens toward grey; above it, darks get darker and lights get lighter until the ends clip. The histogram below the sliders shows what is being thrown away.',
  `<div class="field"><label>Contrast <span data-adj-out="contrast">120</span>%</label><input type="range" data-adj="contrast" min="0" max="250" value="120"></div>
   <div class="field"><label>Pivot <span data-adj-out="pivot">128</span></label><input type="range" data-adj="pivot" min="0" max="255" value="128"></div>`,
  (ctx, img, canvas, v)=>{
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data, k = v.contrast / 100, pivot = v.pivot;
    for(let i=0;i<px.length;i+=4){
      px[i] = (px[i] - pivot) * k + pivot;
      px[i+1] = (px[i+1] - pivot) * k + pivot;
      px[i+2] = (px[i+2] - pivot) * k + pivot;
    }
    ctx.putImageData(data, 0, 0);
  });

/* ---------------- Development (3) ---------------- */

dev('dockercompose','docker run → Compose', root=>{
  root.innerHTML = `
    <div class="field"><label>docker run command</label><textarea id="dcIn" style="min-height:100px;font-family:var(--mono)">docker run -d --name kitbox -p 8080:80 -v /data:/var/lib/kitbox -e TZ=Asia/Kolkata --restart unless-stopped kitbox:2.12</textarea></div>
    <div class="output" id="dcOut" style="white-space:pre;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">Handles the flags people actually use: <span class="mono">-d</span>, <span class="mono">--name</span>, <span class="mono">-p</span>, <span class="mono">-v</span>, <span class="mono">-e</span>, <span class="mono">--restart</span>, <span class="mono">--network</span> and the command at the end. Anything it does not recognise is listed rather than silently dropped.</div>`;
  function draw(){
    const text = root.querySelector('#dcIn').value.replace(/\\\n/g, ' ').trim();
    const out = root.querySelector('#dcOut');
    const tokens = text.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    if(tokens[0] !== 'docker' || tokens[1] !== 'run'){ out.textContent = 'That is not a docker run command.'; return; }
    const service = { image: '', ports: [], volumes: [], environment: [], restart: '', container_name: '', network_mode: '', command: [] };
    const unknown = [];
    const clean = s => (s || '').replace(/^["']|["']$/g, '');
    let i = 2;
    while(i < tokens.length){
      const t = tokens[i];
      const val = () => tokens[++i];
      if(t === '-d' || t === '--detach'){ i++; }
      else if(t === '--name'){ service.container_name = clean(val()); i++; }
      else if(t === '-p' || t === '--publish'){ service.ports.push(clean(val())); i++; }
      else if(t === '-v' || t === '--volume'){ service.volumes.push(clean(val())); i++; }
      else if(t === '-e' || t === '--env'){ service.environment.push(clean(val())); i++; }
      else if(t === '--restart'){ service.restart = clean(val()); i++; }
      else if(t === '--network'){ service.network_mode = clean(val()); i++; }
      else if(t.startsWith('-')){ unknown.push(t); i++; if(i < tokens.length && !tokens[i].startsWith('-')) i++; }
      else { service.command = tokens.slice(i).map(clean); break; }
    }
    // the image is the last non-flag token before the command
    const imageIdx = tokens.findIndex((t, idx)=>idx > 1 && !t.startsWith('-') && !/^-/.test(tokens[idx-1] || '') && !['--name','-p','--publish','-v','--volume','-e','--env','--restart','--network'].includes(tokens[idx-1]));
    if(imageIdx > 0) service.image = clean(tokens[imageIdx]);
    const lines = ['services:', '  app:'];
    if(service.image) lines.push('    image: ' + service.image);
    if(service.container_name) lines.push('    container_name: ' + service.container_name);
    if(service.restart) lines.push('    restart: ' + service.restart);
    if(service.network_mode) lines.push('    network_mode: ' + service.network_mode);
    if(service.ports.length){ lines.push('    ports:'); service.ports.forEach(p=>lines.push('      - "' + p + '"')); }
    if(service.volumes.length){ lines.push('    volumes:'); service.volumes.forEach(v=>lines.push('      - "' + v + '"')); }
    if(service.environment.length){ lines.push('    environment:'); service.environment.forEach(e=>{
      const [k, ...rest] = e.split('=');
      lines.push('      ' + k + ': "' + rest.join('=') + '"');
    }); }
    if(service.command.length){ lines.push('    command: ' + JSON.stringify(service.command)); }
    out.textContent = lines.join('\n') + (unknown.length ? '\n\n# not translated: ' + unknown.join(' ') : '');
  }
  root.querySelector('#dcIn').addEventListener('input', draw);
  draw();
});

dev('dockerfile','Dockerfile Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Language</label><select id="dfLang"><option value="node">Node</option><option value="python">Python</option><option value="go">Go</option><option value="static">Static files (nginx)</option></select></div>
      <div class="field"><label>Port</label><input type="number" id="dfPort" value="8080"></div>
    </div>
    <label style="display:flex;gap:8px;align-items:center;padding:6px 0"><input type="checkbox" id="dfMulti" checked> multi-stage build</label>
    <div class="output" id="dfOut" style="white-space:pre;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">A multi-stage build is the difference between a 900 MB image and a 90 MB one: the compiler and the dependency tree stay in the first stage, and only the artefacts move forward. Non-root by default, because the alternative is a container that runs as root by accident.</div>`;
  function draw(){
    const lang = root.querySelector('#dfLang').value;
    const port = Number(root.querySelector('#dfPort').value) || 8080;
    const multi = root.querySelector('#dfMulti').checked;
    const templates = {
      node: multi
        ? ['# build stage', 'FROM node:20-alpine AS build', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci', 'COPY . .', 'RUN npm run build --if-present', '',
           '# runtime stage', 'FROM node:20-alpine', 'WORKDIR /app', 'ENV NODE_ENV=production', 'COPY --from=build /app/package*.json ./', 'COPY --from=build /app/node_modules ./node_modules', 'COPY --from=build /app .', 'USER node', 'EXPOSE ' + port, 'CMD ["node", "index.js"]']
        : ['FROM node:20-alpine', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci --omit=dev', 'COPY . .', 'USER node', 'EXPOSE ' + port, 'CMD ["node", "index.js"]'],
      python: multi
        ? ['FROM python:3.12-slim AS build', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install --no-cache-dir --prefix=/install -r requirements.txt', '',
           'FROM python:3.12-slim', 'WORKDIR /app', 'COPY --from=build /install /usr/local', 'COPY . .', 'RUN useradd -m app && chown -R app /app', 'USER app', 'EXPOSE ' + port, 'CMD ["python", "main.py"]']
        : ['FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install --no-cache-dir -r requirements.txt', 'COPY . .', 'RUN useradd -m app && chown -R app /app', 'USER app', 'EXPOSE ' + port, 'CMD ["python", "main.py"]'],
      go: ['FROM golang:1.22-alpine AS build', 'WORKDIR /src', 'COPY go.* ./', 'RUN go mod download', 'COPY . .', 'RUN CGO_ENABLED=0 go build -o /out/app ./...', '',
           'FROM gcr.io/distroless/static', 'COPY --from=build /out/app /app', 'USER nonroot:nonroot', 'EXPOSE ' + port, 'ENTRYPOINT ["/app"]'],
      static: ['FROM nginx:alpine', 'COPY . /usr/share/nginx/html', 'RUN chown -R nginx:nginx /usr/share/nginx/html', 'USER nginx', 'EXPOSE ' + port]
    };
    root.querySelector('#dfOut').textContent = templates[lang].join('\n');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#dfMulti').addEventListener('change', draw);
  draw();
});

dev('csr','CSR Reader', root=>{
  root.innerHTML = `
    <div class="field"><label>Certificate signing request (PEM or DER hex)</label><textarea id="crIn" style="min-height:110px;font-family:var(--mono)" placeholder="-----BEGIN CERTIFICATE REQUEST-----"></textarea></div>
    <div class="output" id="crOut">Paste a CSR above.</div>
    <div class="hint">What a CSR actually asks for: the subject, the public key, and the signature that proves the requester holds the private key. It is a request — nothing in it is a certificate, and no authority has agreed to anything yet.</div>`;
  const OID = { '2.5.4.3':'CN', '2.5.4.6':'C', '2.5.4.7':'L', '2.5.4.8':'ST', '2.5.4.10':'O', '2.5.4.11':'OU',
    '1.2.840.113549.1.9.14':'extensionRequest', '1.2.840.113549.1.1.11':'sha256WithRSAEncryption',
    '1.2.840.113549.1.1.1':'rsaEncryption', '1.2.840.10045.2.1':'ecPublicKey' };
  function draw(){
    const out = root.querySelector('#crOut');
    const raw = root.querySelector('#crIn').value.trim();
    if(!raw){ out.textContent = 'Paste a CSR above.'; return; }
    let bytes;
    const m = raw.match(/-----BEGIN [^-]+-----([\s\S]*?)-----END [^-]+-----/);
    if(m) bytes = Uint8Array.from(atob(m[1].replace(/\s+/g, '')), c=>c.charCodeAt(0));
    else {
      const hex = raw.replace(/[^0-9a-fA-F]/g, '');
      if(hex.length < 40){ out.textContent = 'That is neither PEM nor DER hex.'; return; }
      bytes = Uint8Array.from(hex.match(/.{2}/g).map(h=>parseInt(h, 16)));
    }
    try{
      const tree = parseASN1(bytes, 0, bytes.length, 0);
      const top = tree[0];
      if(!top || top.tag !== 0x30) throw new Error('the outer structure is not a SEQUENCE');
      const all = [];
      (function walk(nodes){ for(const n of nodes){ all.push(n); if(n.kids.length) walk(n.kids); } })(tree);
      const names = all.filter(n=>n.tag === 0x30 && n.kids.length && n.kids.every(k=>k.tag === 0x31));
      const parts = [];
      if(names[0]){
        (function collect(n){
          for(const k of n.kids || []){
            if(k.tag === 0x30 && k.kids.length === 2 && k.kids[0].tag === 0x06) parts.push((OID[k.kids[0].text] || k.kids[0].text) + '=' + k.kids[1].text);
            else collect(k);
          }
        })(names[0]);
      }
      const spki = all.find(n=>n.tag === 0x30 && n.kids.length === 2 && n.kids[1] && n.kids[1].tag === 0x03 && n.kids[0].tag === 0x30);
      let keyInfo = '—';
      if(spki){
        const algOid = spki.kids[0].kids[0] && spki.kids[0].kids[0].text;
        let bits = 0;
        try{
          const inner = parseASN1(spki.kids[1].raw.slice(1), 0, spki.kids[1].raw.length - 1, 0);
          const first = inner[0] && inner[0].kids[0];
          if(first){ const b = first.raw[0] === 0 ? first.raw.slice(1) : first.raw; bits = b.length * 8; }
        }catch(e){}
        keyInfo = (OID[algOid] || algOid) + (bits ? ' · ' + bits + ' bits' : '');
      }
      const sigAlg = all.find(n=>n.tag === 0x06 && n.text === '1.2.840.113549.1.1.11');
      const oids = [...new Set(all.filter(n=>n.tag === 0x06).map(n=>n.text))];
      out.innerHTML = `<table class="mono">
        <tr><td>Subject</td><td>${escapeHtml(parts.join(', ') || 'empty — a CSR with no subject is not valid')}</td></tr>
        <tr><td>Public key</td><td>${escapeHtml(keyInfo)}</td></tr>
        <tr><td>Signature</td><td>${escapeHtml(OID[sigAlg ? sigAlg.text : ''] || (sigAlg ? sigAlg.text : 'not found'))}</td></tr>
        <tr><td>Size</td><td>${bytes.length} bytes</td></tr>
        <tr><td>Extensions</td><td style="word-break:break-all">${escapeHtml(oids.filter(o=>o.startsWith('2.5.29') || o.startsWith('1.3.6.1.4.1')).join(', ') || 'none')}</td></tr>
      </table>
      <div class="hint">A CSR is a request. Nothing here says any authority has agreed to it.</div>`;
    }catch(e){
      out.innerHTML = `<div class="hint">Could not read that CSR: ${escapeHtml(e.message)}</div>`;
    }
  }
  root.querySelector('#crIn').addEventListener('input', draw);
});
