/* ================================================================
   B26 — what is inside a file: an ELF header, a MIME body, a carved image,
   and a Sudoku grid.
   ================================================================ */

/* ---------------- Files & Data (2) ---------------- */

fil('elf','ELF Header Reader', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>Binary</label><input type="file" id="elFile"></div>
    <div class="output" id="elOut">Choose an ELF binary — a Linux executable, a shared library, an object file.</div>
    <div class="hint">Reads the header and the section table, which is enough to answer "what is this, for which machine, and is it stripped". It does not disassemble anything and it will not tell you whether a binary is safe — nothing in a browser can.</div>`;
  const MACHINES = { 3:'x86', 8:'MIPS', 20:'PowerPC', 40:'ARM', 62:'x86-64', 183:'AArch64', 243:'RISC-V' };
  const TYPES = { 1:'relocatable object', 2:'executable', 3:'shared object', 4:'core dump' };
  root.querySelector('#elFile').addEventListener('change', async e=>{
    const file = e.target.files[0];
    const out = root.querySelector('#elOut');
    if(!file) return;
    const b = new Uint8Array(await file.arrayBuffer());
    if(b.length < 52 || b[0] !== 0x7f || b[1] !== 0x45 || b[2] !== 0x4c || b[3] !== 0x46){
      out.textContent = 'Not an ELF file — the first four bytes should be 7F 45 4C 46.';
      return;
    }
    const is64 = b[4] === 2;
    const little = b[5] === 1;
    const dv = new DataView(b.buffer);
    const u16 = o => dv.getUint16(o, little);
    const u32 = o => dv.getUint32(o, little);
    const type = u16(16), machine = u16(18);
    const entry = is64 ? Number(dv.getBigUint64(24, little)) : u32(24);
    const shoff = is64 ? Number(dv.getBigUint64(40, little)) : u32(32);
    const shentsize = u16(is64 ? 58 : 46);
    const shnum = u16(is64 ? 60 : 48);
    const shstrndx = u16(is64 ? 62 : 50);
    // section names live in the section named by shstrndx
    let sections = [];
    try{
      const readSection = i => {
        const o = shoff + i * shentsize;
        return {
          nameOff: u32(o),
          type: u32(o + 4),
          offset: is64 ? Number(dv.getBigUint64(o + 24, little)) : u32(o + 16),
          size: is64 ? Number(dv.getBigUint64(o + 32, little)) : u32(o + 20)
        };
      };
      const strSec = readSection(shstrndx);
      const strTab = b.slice(strSec.offset, strSec.offset + strSec.size);
      sections = Array.from({ length: Math.min(shnum, 64) }, (_, i)=>{
        const s = readSection(i);
        let name = '';
        for(let p = s.nameOff; p < strTab.length && strTab[p] !== 0; p++) name += String.fromCharCode(strTab[p]);
        return { name, size: s.size };
      });
    }catch(err){ sections = []; }
    const hasSymtab = sections.some(s=>s.name === '.symtab');
    out.innerHTML = `<table class="mono">
      <tr><td>Class</td><td>${is64 ? '64-bit' : '32-bit'}, ${little ? 'little' : 'big'}-endian</td></tr>
      <tr><td>Type</td><td>${TYPES[type] || 'type ' + type}</td></tr>
      <tr><td>Machine</td><td>${MACHINES[machine] || 'machine ' + machine}</td></tr>
      <tr><td>Entry point</td><td>0x${entry.toString(16)}</td></tr>
      <tr><td>Size</td><td>${file.size.toLocaleString(numLocale())} bytes</td></tr>
      <tr><td>Sections</td><td>${shnum}</td></tr>
      <tr><td>Stripped?</td><td>${hasSymtab ? 'no — .symtab is present' : 'likely yes — no .symtab'}</td></tr>
      ${sections.length ? `<tr><td>Named sections</td><td style="word-break:break-all">${escapeHtml(sections.filter(s=>s.name).slice(0, 24).map(s=>s.name).join(', '))}</td></tr>` : ''}
    </table>`;
  });
});

fil('filecarve','File Carver', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>File to search</label><input type="file" id="fcFile"></div>
    <div class="row">
      <div class="field"><label>Look for</label><select id="fcType">
        <option value="png">PNG images</option><option value="jpg">JPEG images</option>
        <option value="pdf">PDF documents</option><option value="zip">ZIP archives</option>
        <option value="gif">GIF images</option><option value="all">All of the above</option>
      </select></div>
      <button class="btn primary" id="fcGo">Search</button>
    </div>
    <div class="output" id="fcOut">Choose a file and search.</div>
    <div class="hint">Carving finds files by their signature and their end marker, which is how a file hidden inside another file is recovered — or how you check whether one was. It works on the bytes as they are; a compressed container will not give anything up.</div>`;
  const SIGS = {
    png: { start: [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a], end: [0x49,0x45,0x4e,0x44,0xae,0x42,0x60,0x82], ext: 'png', mime: 'image/png' },
    jpg: { start: [0xff,0xd8,0xff], end: [0xff,0xd9], ext: 'jpg', mime: 'image/jpeg' },
    pdf: { start: [0x25,0x50,0x44,0x46], endText: '%%EOF', ext: 'pdf', mime: 'application/pdf' },
    zip: { start: [0x50,0x4b,0x03,0x04], end: [0x50,0x4b,0x05,0x06], ext: 'zip', mime: 'application/zip', trailer: 22 },
    gif: { start: [0x47,0x49,0x46,0x38], end: [0x3b], ext: 'gif', mime: 'image/gif' }
  };
  const matchesAt = (b, i, sig) => sig.every((v, k)=>b[i+k] === v);
  root.querySelector('#fcGo').addEventListener('click', async ()=>{
    const file = root.querySelector('#fcFile').files[0];
    const out = root.querySelector('#fcOut');
    if(!file){ out.textContent = 'Choose a file first.'; return; }
    if(file.size > 100 * 1024 * 1024){ out.textContent = 'Over 100 MB — too large to scan in the page.'; return; }
    const b = new Uint8Array(await file.arrayBuffer());
    const wanted = root.querySelector('#fcType').value === 'all' ? Object.keys(SIGS) : [root.querySelector('#fcType').value];
    const found = [];
    for(const kind of wanted){
      const sig = SIGS[kind];
      for(let i=0;i<b.length - sig.start.length;i++){
        if(!matchesAt(b, i, sig.start)) continue;
        let end = -1;
        if(sig.endText){
          const needle = bytesFromText(sig.endText);
          for(let j=i;j<b.length - needle.length;j++){
            if(matchesAt(b, j, needle)){ end = j + needle.length; break; }
          }
        } else {
          for(let j=i + sig.start.length; j < b.length - sig.end.length; j++){
            if(matchesAt(b, j, sig.end)){ end = j + sig.end.length + (sig.trailer || 0); break; }
          }
        }
        if(end > i) found.push({ kind, start: i, end, size: end - i });
        i += 3;   // do not scan inside a hit twice
      }
    }
    if(!found.length){ out.innerHTML = `<div class="hint">No ${wanted.join('/')} signatures in ${file.size.toLocaleString(numLocale())} bytes.</div>`; return; }
    out.innerHTML = `<table class="mono">
      ${found.map((f, i)=>`<tr><td>${i+1}</td><td>${f.kind}</td><td>0x${f.start.toString(16)}</td><td>${f.size.toLocaleString(numLocale())} B</td>
        <td><button class="btn ghost" data-fc="${i}" style="padding:2px 8px;font-size:12px">Save</button></td></tr>`).join('')}
    </table>
    <div class="hint">${found.length} candidate(s). A signature can appear by chance inside compressed data, so a carved file may be broken — the size and the fact it opens are the check.</div>`;
    out.querySelectorAll('[data-fc]').forEach(btn=>btn.addEventListener('click', ()=>{
      const f = found[Number(btn.dataset.fc)];
      saveBlob(new Blob([b.slice(f.start, f.end)], { type: SIGS[f.kind].mime }), 'carved-' + (Number(btn.dataset.fc)+1) + '.' + SIGS[f.kind].ext);
    }));
  });
});

/* ---------------- Development (1) ---------------- */

dev('mimeparse','MIME Decoder', root=>{
  root.innerHTML = `
    <div class="field"><label>Raw message</label><textarea id="mpIn" style="min-height:170px">From: "Dr Sohil Momin" &lt;sohil@example.com&gt;
To: you@example.com
Subject: =?UTF-8?B?VGVzdCDigJQgZW1haWw=?=
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="b1"

--b1
Content-Type: text/plain; charset=utf-8
Content-Transfer-Encoding: quoted-printable

Hello =E2=80=94 this is the plain part.
--b1
Content-Type: text/html; charset=utf-8
Content-Transfer-Encoding: base64

PHA+SGVsbG8g4oCUIHRoaXMgaXMgdGhlIEhUTUwgcGFydC48L3A+
--b1--
</textarea></div>
    <div class="output" id="mpOut">—</div>
    <div class="hint">Splits a multipart body, decodes quoted-printable and base64, resolves the encoded-word subject, and shows each part's headers. Enough to read what an email actually says without opening it in a client.</div>`;
  function decodeQP(s){
    return s.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (m, h)=>String.fromCharCode(parseInt(h, 16)));
  }
  function decodeWord(s){
    return s.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (m, charset, enc, data)=>{
      try{
        if(enc.toUpperCase() === 'B') return new TextDecoder(charset.toLowerCase()).decode(Uint8Array.from(atob(data), c=>c.charCodeAt(0)));
        return new TextDecoder(charset.toLowerCase()).decode(Uint8Array.from(decodeQP(data.replace(/_/g, ' ')), c=>c.charCodeAt(0)));
      }catch(e){ return m; }
    });
  }
  function parseHeaders(text){
    const out = {};
    let last = null;
    for(const line of text.split(/\r?\n/)){
      if(/^\s/.test(line) && last){ out[last] += ' ' + line.trim(); continue; }
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if(m){ last = m[1].toLowerCase(); out[last] = m[2]; }
    }
    return out;
  }
  function draw(){
    const raw = root.querySelector('#mpIn').value;
    const out = root.querySelector('#mpOut');
    if(!raw.trim()){ out.textContent = '—'; return; }
    const splitAt = raw.indexOf('\n\n') >= 0 ? raw.indexOf('\n\n') : raw.indexOf('\r\n\r\n');
    const headText = splitAt >= 0 ? raw.slice(0, splitAt) : raw;
    const body = splitAt >= 0 ? raw.slice(splitAt).replace(/^\r?\n\r?\n/, '') : '';
    const headers = parseHeaders(headText);
    const ctype = headers['content-type'] || 'text/plain';
    const bm = ctype.match(/boundary="?([^";]+)"?/i);
    const parts = [];
    if(bm && body){
      const pieces = body.split('--' + bm[1]);
      pieces.slice(1).forEach(piece=>{
        if(piece.startsWith('--')) return;
        const bodyStart = piece.search(/\r?\n\r?\n/);
        if(bodyStart < 0) return;
        const ph = parseHeaders(piece.slice(0, bodyStart));
        let content = piece.slice(bodyStart).replace(/^\r?\n\r?\n/, '').replace(/\r?\n$/, '');
        const enc = (ph['content-transfer-encoding'] || '').toLowerCase();
        if(enc === 'base64'){ try{ content = new TextDecoder('utf-8').decode(Uint8Array.from(atob(content.replace(/\s/g, '')), c=>c.charCodeAt(0))); }catch(e){ content = '[base64 could not be decoded]'; } }
        else if(enc === 'quoted-printable') content = decodeQP(content);
        parts.push({ headers: ph, content });
      });
    }
    const html = (s)=>escapeHtml(s).slice(0, 1200);
    out.innerHTML = `<table class="mono">
      <tr><td>Subject</td><td>${escapeHtml(decodeWord(headers['subject'] || '—'))}</td></tr>
      <tr><td>From</td><td>${escapeHtml(decodeWord(headers['from'] || '—'))}</td></tr>
      <tr><td>To</td><td>${escapeHtml(headers['to'] || '—')}</td></tr>
      <tr><td>Date</td><td>${escapeHtml(headers['date'] || '—')}</td></tr>
      <tr><td>Content type</td><td>${escapeHtml(ctype)}</td></tr>
      <tr><td>Parts</td><td>${parts.length || '1 (single part)'}</td></tr>
    </table>
    ${parts.length ? parts.map((p, i)=>`
      <div class="section-label" style="margin-top:14px">Part ${i+1} · ${escapeHtml(p.headers['content-type'] || 'unknown type')}</div>
      <pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;background:var(--panel);padding:10px;border-radius:8px">${html(p.content)}</pre>`).join('')
      : `<pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;background:var(--panel);padding:10px;border-radius:8px;margin-top:12px">${html(body)}</pre>`}`;
  }
  root.querySelector('#mpIn').addEventListener('input', draw);
  draw();
});

/* ---------------- Games (1) ---------------- */

game('sudoku','Sudoku Solver', root=>{
  root.innerHTML = `
    <div class="field"><label>Grid — 81 characters, 0 or . for empty</label>
      <textarea id="sdIn" style="font-family:var(--mono);min-height:60px">530070000600195000098000060800060003400803001700020006060000280000419005000080079</textarea></div>
    <div class="segrow"><button class="btn primary" id="sdGo">Solve</button><button class="btn" id="sdClear">Clear</button><button class="btn" id="sdSample">Sample</button></div>
    <div id="sdBoard" style="display:grid;grid-template-columns:repeat(9,1fr);gap:1px;background:var(--line);border:2px solid var(--text);max-width:360px;margin:12px 0"></div>
    <div class="output" id="sdOut">—</div>
    <div class="hint">Backtracking with a constraint check — it solves anything that has a solution, and says so when a grid has none or more than one. Paste from anywhere: spaces, dots and zeros all mean empty.</div>`;
  function grid(text){
    const digits = text.replace(/[^0-9.]/g, '').replace(/\./g, '0').split('').map(Number);
    return digits.length === 81 ? digits : null;
  }
  function valid(g, i, v){
    const r = Math.floor(i / 9), c = i % 9;
    for(let k=0;k<9;k++){
      if(g[r*9+k] === v && r*9+k !== i) return false;
      if(g[k*9+c] === v && k*9+c !== i) return false;
    }
    const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
    for(let dr=0;dr<3;dr++) for(let dc=0;dc<3;dc++){
      const j = (br+dr)*9 + bc+dc;
      if(g[j] === v && j !== i) return false;
    }
    return true;
  }
  let solution = null;
  function solve(g, count){
    const i = g.indexOf(0);
    // The grid is restored on the way back up, so the finished board has to be
    // copied at the moment it is complete — otherwise every cell is reset and
    // the "solved" grid is the one you started with.
    if(i < 0){ if(!solution) solution = g.slice(); return 1; }
    let solutions = 0;
    for(let v=1;v<=9;v++){
      if(!valid(g, i, v)) continue;
      g[i] = v;
      solutions += solve(g, count);
      g[i] = 0;
      if(solutions > 1 && count) break;
    }
    return solutions;
  }
  function draw(g, note){
    const board = root.querySelector('#sdBoard');
    board.innerHTML = g.map((v, i)=>{
      const given = grid(root.querySelector('#sdIn').value)[i] !== 0;
      const br = Math.floor(i/9), bc = i%9;
      const border = 'border:' + (bc % 3 === 2 && bc < 8 ? '2px' : '1px') + ' solid var(--line);' +
                     (br % 3 === 2 && br < 8 ? 'border-bottom:2px solid var(--text);' : '');
      return `<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:16px;background:var(--bg);color:${given ? 'var(--text)' : 'var(--accent)'};font-weight:${given ? 700 : 400};${border}">${v || ''}</div>`;
    }).join('');
    root.querySelector('#sdOut').textContent = note;
  }
  root.querySelector('#sdGo').addEventListener('click', ()=>{
    const original = grid(root.querySelector('#sdIn').value);
    if(!original){ root.querySelector('#sdOut').textContent = 'A grid needs exactly 81 cells.'; return; }
    for(let i=0;i<81;i++){
      if(original[i] && !valid(original, i, original[i])){ root.querySelector('#sdOut').textContent = 'That grid is already contradictory at row ' + (Math.floor(i/9)+1) + ', column ' + (i%9+1) + '.'; return; }
    }
    const work = original.slice();
    solution = null;
    const before = Date.now();
    const count = solve(work, false);
    const ms = Date.now() - before;
    if(count === 0 || !solution){ draw(original, 'No solution — the given numbers contradict each other.'); return; }
    draw(solution, count > 1 ? 'Solved, but ' + count + ' solutions exist — the grid is ambiguous.' : 'Solved in ' + ms + ' ms.');
  });
  root.querySelector('#sdClear').addEventListener('click', ()=>{
    root.querySelector('#sdIn').value = '';
    root.querySelector('#sdBoard').innerHTML = '';
    root.querySelector('#sdOut').textContent = '—';
  });
  root.querySelector('#sdSample').addEventListener('click', ()=>{
    root.querySelector('#sdIn').value = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
    root.querySelector('#sdGo').click();
  });
  const g = grid(root.querySelector('#sdIn').value);
  if(g) draw(g, 'Press Solve.');
});
