/* ================================================================
   B28 — packet headers and RSA with a pasted key.
   ================================================================ */

/* ---------------- Development (2) ---------------- */

dev('packet','Packet Header Parser', root=>{
  root.innerHTML = `
    <div class="field"><label>Header bytes (hex)</label><textarea id="pkIn" style="min-height:100px;font-family:var(--mono)">45 00 00 3c 1c 46 40 00 40 06 b1 e6 c0 a8 01 01 c0 a8 01 02
1f 90 00 50 00 00 00 01 00 00 00 00 50 02 20 00 00 00 00 00</textarea></div>
    <div class="row">
      <div class="field"><label>Start at</label><select id="pkLayer"><option value="ip">IPv4 header</option><option value="tcp">TCP header</option><option value="udp">UDP header</option><option value="icmp">ICMP header</option></select></div>
      <div class="field"><label>Also parse the payload as</label><select id="pkNext"><option value="">nothing</option><option value="tcp">TCP</option><option value="udp">UDP</option><option value="icmp">ICMP</option></select></div>
    </div>
    <div class="output" id="pkOut">—</div>
    <div class="hint">Paste the hex a packet capture gave you. The IP header tells you where the payload starts, so choosing "also parse as TCP" reads the transport header from the right offset rather than making you count bytes.</div>`;
  const PROTO = { 1:'ICMP', 2:'IGMP', 6:'TCP', 17:'UDP', 47:'GRE', 50:'ESP', 51:'AH', 58:'ICMPv6' };
  const FLAGS = [['URG', 0x20], ['ACK', 0x10], ['PSH', 0x08], ['RST', 0x04], ['SYN', 0x02], ['FIN', 0x01]];
  function hexToBytes(text){
    const hex = text.replace(/[^0-9a-fA-F]/g, '');
    if(hex.length % 2) throw new Error('an odd number of hex digits');
    return Uint8Array.from(hex.match(/.{2}/g).map(h=>parseInt(h, 16)));
  }
  function ip(b, off){
    if(b.length < off + 20) throw new Error('fewer than 20 bytes — that is not a full IPv4 header');
    const ihl = (b[off] & 0x0f) * 4;
    const dv = new DataView(b.buffer, b.byteOffset);
    const src = [b[off+12], b[off+13], b[off+14], b[off+15]].join('.');
    const dst = [b[off+16], b[off+17], b[off+18], b[off+19]].join('.');
    const flagsFrag = dv.getUint16(off + 6);
    return {
      rows: [
        ['Version', (b[off] >> 4)],
        ['Header length', ihl + ' bytes'],
        ['DSCP / ECN', ((b[off+1] >> 2)) + ' / ' + (b[off+1] & 3)],
        ['Total length', dv.getUint16(off + 2) + ' bytes'],
        ['Identification', '0x' + dv.getUint16(off + 4).toString(16)],
        ['Flags', ['reserved', (flagsFrag & 0x4000) ? 'DF' : '', (flagsFrag & 0x2000) ? 'MF' : ''].filter(Boolean).join(' ') || 'none'],
        ['Fragment offset', (flagsFrag & 0x1fff) * 8 + ' bytes'],
        ['TTL', b[off+8]],
        ['Protocol', (PROTO[b[off+9]] || b[off+9])],
        ['Checksum', '0x' + dv.getUint16(off + 10).toString(16)],
        ['Source', src],
        ['Destination', dst],
        ['Options', ihl > 20 ? (ihl - 20) + ' bytes present' : 'none']
      ],
      next: off + ihl,
      protocol: b[off+9]
    };
  }
  function tcp(b, off){
    if(b.length < off + 20) throw new Error('fewer than 20 bytes — that is not a full TCP header');
    const dv = new DataView(b.buffer, b.byteOffset);
    const dataOff = (b[off+12] >> 4) * 4;
    const flags = b[off+13];
    return {
      rows: [
        ['Source port', dv.getUint16(off)],
        ['Destination port', dv.getUint16(off + 2)],
        ['Sequence', dv.getUint32(off + 4)],
        ['Acknowledgement', dv.getUint32(off + 8)],
        ['Header length', dataOff + ' bytes'],
        ['Flags', FLAGS.filter(([, bit])=>flags & bit).map(([n])=>n).join(' ') || 'none'],
        ['Window', dv.getUint16(off + 14)],
        ['Checksum', '0x' + dv.getUint16(off + 16).toString(16)],
        ['Urgent pointer', dv.getUint16(off + 18)],
        ['Payload', Math.max(0, b.length - off - dataOff) + ' bytes in this capture']
      ],
      next: off + dataOff
    };
  }
  function udp(b, off){
    if(b.length < off + 8) throw new Error('fewer than 8 bytes — that is not a full UDP header');
    const dv = new DataView(b.buffer, b.byteOffset);
    return {
      rows: [
        ['Source port', dv.getUint16(off)],
        ['Destination port', dv.getUint16(off + 2)],
        ['Length', dv.getUint16(off + 4) + ' bytes (header + payload)'],
        ['Checksum', '0x' + dv.getUint16(off + 6).toString(16)],
        ['Payload', Math.max(0, dv.getUint16(off + 4) - 8) + ' bytes by the length field']
      ],
      next: off + 8
    };
  }
  function icmp(b, off){
    if(b.length < off + 8) throw new Error('fewer than 8 bytes — that is not a full ICMP header');
    const TYPES = { 0:'echo reply', 3:'destination unreachable', 5:'redirect', 8:'echo request', 11:'time exceeded' };
    const dv = new DataView(b.buffer, b.byteOffset);
    return {
      rows: [
        ['Type', b[off] + ' — ' + (TYPES[b[off]] || 'other')],
        ['Code', b[off+1]],
        ['Checksum', '0x' + dv.getUint16(off + 2).toString(16)],
        ['Rest of header', '0x' + dv.getUint32(off + 4).toString(16)]
      ],
      next: off + 8
    };
  }
  const PARSERS = { ip, tcp, udp, icmp };
  function draw(){
    const out = root.querySelector('#pkOut');
    let b;
    try{ b = hexToBytes(root.querySelector('#pkIn').value); }
    catch(e){ out.textContent = 'Could not read that hex: ' + e.message; return; }
    if(!b.length){ out.textContent = '—'; return; }
    try{
      const layer = root.querySelector('#pkLayer').value;
      const first = PARSERS[layer](b, 0);
      let html = `<table class="mono">${first.rows.map(([k, v])=>`<tr><td>${escapeHtml(String(k))}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
      const nextWanted = root.querySelector('#pkNext').value;
      if(nextWanted && first.next < b.length){
        const second = PARSERS[nextWanted](b, first.next);
        html += `<div class="section-label" style="margin-top:14px">${nextWanted.toUpperCase()} header, from byte ${first.next}</div>
          <table class="mono">${second.rows.map(([k, v])=>`<tr><td>${escapeHtml(String(k))}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
      }
      out.innerHTML = html;
    }catch(e){ out.textContent = 'Could not parse: ' + e.message; }
  }
  root.querySelectorAll('textarea,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('rsacrypt','RSA Encrypt / Decrypt', root=>{
  root.innerHTML = `
    <div class="segrow" id="rsMode">
      <button class="btn" data-rs="enc">Encrypt with a public key</button>
      <button class="btn" data-rs="dec">Decrypt with a private key</button>
    </div>
    <div class="field"><label id="rsKeyLabel">Public key (PEM)</label><textarea id="rsKey" style="min-height:100px;font-family:var(--mono)" placeholder="-----BEGIN PUBLIC KEY-----"></textarea></div>
    <div class="field"><label>Message</label><textarea id="rsMsg" style="min-height:80px">The result is normal.</textarea></div>
    <div class="segrow"><button class="btn primary" id="rsGo">Run</button></div>
    <div class="output" id="rsOut" style="word-break:break-all;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">RSA-OAEP with SHA-256, which is what you want and not the older PKCS#1 v1.5. The key tools beside this one make the pair if you need one. A 2048-bit key can carry at most 190 bytes in one go — that is a property of RSA, not of this page.</div>`;
  let mode = 'enc';
  const pemToDer = pem => {
    const m = pem.match(/-----BEGIN [^-]+-----([\s\S]*?)-----END [^-]+-----/);
    if(!m) throw new Error('that does not look like a PEM block');
    return Uint8Array.from(atob(m[1].replace(/\s+/g, '')), c=>c.charCodeAt(0));
  };
  root.querySelectorAll('[data-rs]').forEach(b=>b.addEventListener('click', ()=>{
    mode = b.dataset.rs;
    root.querySelector('#rsKeyLabel').textContent = mode === 'enc' ? 'Public key (PEM)' : 'Private key (PEM)';
    root.querySelector('#rsKey').placeholder = mode === 'enc' ? '-----BEGIN PUBLIC KEY-----' : '-----BEGIN PRIVATE KEY-----';
    root.querySelector('#rsOut').textContent = '—';
  }));
  root.querySelector('#rsGo').addEventListener('click', async ()=>{
    const out = root.querySelector('#rsOut');
    if(!cryptoAvailable()){ out.textContent = CRYPTO_MSG; return; }
    const keyText = root.querySelector('#rsKey').value;
    const msg = root.querySelector('#rsMsg').value;
    if(!keyText.trim()){ out.textContent = 'Paste a key.'; return; }
    try{
      if(mode === 'enc'){
        const key = await crypto.subtle.importKey('spki', pemToDer(keyText), { name:'RSA-OAEP', hash:'SHA-256' }, false, ['encrypt']);
        const bytes = bytesFromText(msg);
        if(bytes.length > 190){ out.textContent = 'That message is ' + bytes.length + ' bytes; a 2048-bit RSA-OAEP key carries at most 190. Encrypt a symmetric key with RSA and the message with that instead — which is what every real system does.'; return; }
        const cipher = new Uint8Array(await crypto.subtle.encrypt({ name:'RSA-OAEP' }, key, bytes));
        out.innerHTML = `<table class="mono">
          <tr><td>Ciphertext (base64)</td><td>${btoa(String.fromCharCode(...cipher))}</td></tr>
          <tr><td>Length</td><td>${cipher.length} bytes — the key size, always</td></tr>
        </table>`;
      } else {
        const key = await crypto.subtle.importKey('pkcs8', pemToDer(keyText), { name:'RSA-OAEP', hash:'SHA-256' }, false, ['decrypt']);
        const cipher = Uint8Array.from(atob(msg.replace(/\s+/g, '')), c=>c.charCodeAt(0));
        const plain = new Uint8Array(await crypto.subtle.decrypt({ name:'RSA-OAEP' }, key, cipher));
        out.innerHTML = `<table class="mono">
          <tr><td>Plaintext</td><td>${escapeHtml(textFromBytes(plain))}</td></tr>
          <tr><td>Bytes</td><td>${plain.length}</td></tr>
        </table>`;
      }
    }catch(e){
      out.textContent = 'That did not work: ' + (e.message || e) + ' — a decryption failure here usually means the wrong key, not a wrong ciphertext.';
    }
  });
});

/* ---------------- Games (2) ---------------- */

game('pong','Pong', root=>{
  root.innerHTML = `
    <div class="row" style="align-items:center">
      <div class="output" id="pgScore" style="margin:0;flex:1">You 0 · Computer 0 · first to 7</div>
      <button class="btn primary" id="pgGo">Start</button>
    </div>
    <canvas id="pgCanvas" width="480" height="320" style="width:100%;max-width:480px;background:#0b0e14;border:1px solid var(--line);border-radius:8px;margin-top:12px;display:block;touch-action:none"></canvas>
    <div class="hint">Move the mouse or your finger over the board, or use the up and down arrows. The computer's paddle is deliberately imperfect — it chases the ball with a lag, which is what makes the game winnable.</div>`;
  const canvas = root.querySelector('#pgCanvas'), ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const PADDLE_H = 56, PADDLE_W = 8;
  let player, cpu, ball, running = false, raf = null, score = { you: 0, cpu: 0 };
  function reset(serve = 1){
    player = { y: H/2 - PADDLE_H/2 };
    cpu = { y: H/2 - PADDLE_H/2 };
    ball = { x: W/2, y: H/2, vx: 4 * serve, vy: (Math.random() * 3 - 1.5) };
  }
  function draw(){
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.fillStyle = '#2f86eb';
    ctx.fillRect(12, player.y, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#e31c7d';
    ctx.fillRect(W - 12 - PADDLE_W, cpu.y, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#e8eaee';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2); ctx.fill();
  }
  function step(){
    if(!running) return;
    ball.x += ball.vx; ball.y += ball.vy;
    if(ball.y < 5 || ball.y > H - 5){ ball.vy = -ball.vy; ball.y = Math.max(5, Math.min(H - 5, ball.y)); }
    // player paddle
    if(ball.x - 5 < 12 + PADDLE_W && ball.x > 12 && ball.y > player.y && ball.y < player.y + PADDLE_H && ball.vx < 0){
      ball.vx = -ball.vx * 1.04;
      ball.vy += ((ball.y - (player.y + PADDLE_H/2)) / (PADDLE_H/2)) * 1.6;
    }
    // computer paddle — lags on purpose
    const targetY = ball.vx > 0 ? ball.y : H/2;
    cpu.y += (targetY - (cpu.y + PADDLE_H/2)) * 0.06;
    cpu.y = Math.max(0, Math.min(H - PADDLE_H, cpu.y));
    if(ball.x + 5 > W - 12 - PADDLE_W && ball.x < W - 12 && ball.y > cpu.y && ball.y < cpu.y + PADDLE_H && ball.vx > 0){
      ball.vx = -ball.vx * 1.04;
      ball.vy += ((ball.y - (cpu.y + PADDLE_H/2)) / (PADDLE_H/2)) * 1.2;
    }
    if(ball.x < 0){ score.cpu++; point(-1); return; }
    if(ball.x > W){ score.you++; point(1); return; }
    draw();
    raf = requestAnimationFrame(step);
  }
  function point(serve){
    root.querySelector('#pgScore').textContent = 'You ' + score.you + ' · Computer ' + score.cpu + (score.you >= 7 || score.cpu >= 7 ? (score.you >= 7 ? ' — you won' : ' — computer won') : ' · first to 7');
    if(score.you >= 7 || score.cpu >= 7){
      running = false; score = { you: 0, cpu: 0 };
      root.querySelector('#pgGo').textContent = 'Start';
      reset(1); draw(); return;
    }
    reset(serve);
    draw();
    setTimeout(()=>{ if(running) raf = requestAnimationFrame(step); }, 500);
  }
  function toggle(){
    running = !running;
    root.querySelector('#pgGo').textContent = running ? 'Pause' : 'Start';
    if(running){ if(!ball) reset(1); raf = requestAnimationFrame(step); }
    else if(raf) cancelAnimationFrame(raf);
  }
  setCleanup(()=>{ if(raf) cancelAnimationFrame(raf); });
  const move = clientY => {
    const rect = canvas.getBoundingClientRect();
    const y = (clientY - rect.top) / rect.height * H;
    player.y = Math.max(0, Math.min(H - PADDLE_H, y - PADDLE_H/2));
  };
  canvas.addEventListener('pointermove', e=>{ move(e.clientY); if(!running) draw(); });
  canvas.addEventListener('pointerdown', e=>{ move(e.clientY); if(!running) toggle(); });
  const onKey = e => {
    if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){
      e.preventDefault();
      player.y = Math.max(0, Math.min(H - PADDLE_H, player.y + (e.key === 'ArrowUp' ? -18 : 18)));
      if(!running) draw();
    }
  };
  root.addEventListener('keydown', onKey);
  root.tabIndex = 0;
  root.querySelector('#pgGo').addEventListener('click', toggle);
  reset(1); draw();
});

game('breakout','Breakout', root=>{
  root.innerHTML = `
    <div class="row" style="align-items:center">
      <div class="output" id="bkScore" style="margin:0;flex:1">Score 0 · best 0 · lives 3</div>
      <button class="btn primary" id="bkGo">Start</button>
    </div>
    <canvas id="bkCanvas" width="480" height="360" style="width:100%;max-width:480px;background:#0b0e14;border:1px solid var(--line);border-radius:8px;margin-top:12px;display:block;touch-action:none"></canvas>
    <div class="hint">Mouse or arrows to move the paddle, click to start. The angle off the paddle depends on where the ball hits it — the edges send it wide, which is the only control you have.</div>`;
  const canvas = root.querySelector('#bkCanvas'), ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const ROWS = 5, COLS = 8, BW = 52, BH = 16, PAD_TOP = 40;
  let paddle, ball, bricks, running = false, raf = null, score = 0, lives = 3, best = store.get('breakout-best', 0);
  function reset(){
    paddle = { x: W/2 - 34, w: 68, h: 8, y: H - 22 };
    ball = { x: W/2, y: H - 40, vx: 3, vy: -3, r: 5 };
    bricks = [];
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) bricks.push({ x: 20 + c*(BW+4), y: PAD_TOP + r*(BH+6), alive: true, row: r });
    draw();
  }
  function draw(){
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, W, H);
    const COLORS = ['#e31c7d', '#f2871a', '#edc53f', '#3fcb6b', '#2f86eb'];
    bricks.forEach(b=>{
      if(!b.alive) return;
      ctx.fillStyle = COLORS[b.row % COLORS.length];
      ctx.fillRect(b.x, b.y, BW, BH);
    });
    ctx.fillStyle = '#e8eaee';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
  }
  function label(){
    root.querySelector('#bkScore').textContent = 'Score ' + score + ' · best ' + best + ' · lives ' + lives;
  }
  function loseLife(){
    lives--;
    label();
    if(lives <= 0){
      running = false;
      root.querySelector('#bkGo').textContent = 'Start';
      score = 0; lives = 3;
      reset(); label();
      return;
    }
    ball = { x: W/2, y: H - 40, vx: 3 * (Math.random() < 0.5 ? 1 : -1), vy: -3, r: 5 };
    draw();
    raf = requestAnimationFrame(step);
  }
  function step(){
    if(!running) return;
    ball.x += ball.vx; ball.y += ball.vy;
    if(ball.x < ball.r || ball.x > W - ball.r) ball.vx = -ball.vx;
    if(ball.y < ball.r) ball.vy = -ball.vy;
    if(ball.y > H){ loseLife(); return; }
    if(ball.y + ball.r > paddle.y && ball.y < paddle.y + paddle.h && ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.vy > 0){
      ball.vy = -Math.abs(ball.vy);
      ball.vx += ((ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2)) * 2.2;
      ball.vx = Math.max(-6, Math.min(6, ball.vx));
    }
    for(const b of bricks){
      if(!b.alive) continue;
      if(ball.x > b.x - ball.r && ball.x < b.x + BW + ball.r && ball.y > b.y - ball.r && ball.y < b.y + BH + ball.r){
        b.alive = false;
        score += (ROWS - b.row) * 10;
        if(score > best){ best = score; store.set('breakout-best', best); }
        ball.vy = -ball.vy;
        label();
        break;
      }
    }
    if(!bricks.some(b=>b.alive)){
      running = false;
      root.querySelector('#bkGo').textContent = 'Start';
      score = 0; lives = 3;
      reset(); label();
      return;
    }
    draw();
    raf = requestAnimationFrame(step);
  }
  function toggle(){
    running = !running;
    root.querySelector('#bkGo').textContent = running ? 'Pause' : 'Start';
    if(running) raf = requestAnimationFrame(step);
    else if(raf) cancelAnimationFrame(raf);
  }
  setCleanup(()=>{ if(raf) cancelAnimationFrame(raf); });
  const move = clientX => {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width * W;
    paddle.x = Math.max(0, Math.min(W - paddle.w, x - paddle.w/2));
    if(!running) draw();
  };
  canvas.addEventListener('pointermove', e=>move(e.clientX));
  canvas.addEventListener('pointerdown', e=>{ move(e.clientX); if(!running) toggle(); });
  const onKey = e => {
    if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
      e.preventDefault();
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x + (e.key === 'ArrowLeft' ? -22 : 22)));
      if(!running) draw();
    }
  };
  root.addEventListener('keydown', onKey);
  root.tabIndex = 0;
  root.querySelector('#bkGo').addEventListener('click', toggle);
  reset(); label();
});
