/* ================================================================
   B36 — text analysis, two file tools, and the last two money tools.
   ================================================================ */

/* ---------------- Text (3) ---------------- */

txt('Analysis Tools','syllables','Syllable Counter', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="syIn" style="min-height:100px">The report was written by the physician and reviewed three times.</textarea></div>
    <div class="output" id="syOut">—</div>
    <div class="hint">Vowel groups with the usual corrections — a silent final e does not count, and neither does the e in "es" or "ed" at the end of a word. It is a heuristic: English spelling does not contain the answer, which is why a dictionary is the only exact method.</div>`;
  function syllables(word){
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if(!w) return 0;
    if(w.length <= 3) return 1;
    let s = w
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '');
    const groups = s.match(/[aeiouy]{1,2}/g);
    return Math.max(1, groups ? groups.length : 1);
  }
  function draw(){
    const text = root.querySelector('#syIn').value;
    const words = text.match(/[A-Za-z][A-Za-z'-]*/g) || [];
    const out = root.querySelector('#syOut');
    if(!words.length){ out.textContent = '—'; return; }
    const counts = words.map(w=>({ w, s: syllables(w) }));
    const total = counts.reduce((a, c)=>a + c.s, 0);
    const long = counts.filter(c=>c.s >= 3).slice(0, 12);
    const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
    const flesch = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (total / words.length);
    out.innerHTML = `<table class="mono">
      <tr><td>Words</td><td>${words.length}</td></tr>
      <tr><td>Syllables</td><td>${total}</td></tr>
      <tr><td>Average per word</td><td>${(total / words.length).toFixed(2)}</td></tr>
      <tr><td>Sentences</td><td>${sentences}</td></tr>
      <tr><td>Flesch reading ease</td><td>${flesch.toFixed(0)} — ${flesch > 70 ? 'easy' : flesch > 50 ? 'fairly hard' : 'difficult'}</td></tr>
      <tr><td>Longest words</td><td>${long.map(c=>escapeHtml(c.w) + ' (' + c.s + ')').join(', ') || 'none over two syllables'}</td></tr>
    </table>`;
  }
  root.querySelector('#syIn').addEventListener('input', draw);
  draw();
});

txt('Analysis Tools','concordance','Concordance', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="coIn" style="min-height:110px">A buffer is a region of memory. The buffer holds data. Reading a buffer copies it.</textarea></div>
    <div class="row">
      <div class="field"><label>Word</label><input type="text" id="coWord" value="buffer"></div>
      <div class="field"><label>Context (characters)</label><input type="number" id="coCtx" value="32"></div>
    </div>
    <div class="output" id="coOut">—</div>
    <div class="hint">Every occurrence of a word with the text around it — the index a concordance has been since before printing. Whole words only, case-insensitive, and the word is marked so you can see where it fell.</div>`;
  function draw(){
    const text = root.querySelector('#coIn').value;
    const word = root.querySelector('#coWord').value.trim();
    const ctx = Math.max(4, Number(root.querySelector('#coCtx').value) || 30);
    const out = root.querySelector('#coOut');
    if(!word){ out.textContent = 'Give a word to look for.'; return; }
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    const hits = [];
    let m;
    while((m = re.exec(text))){
      const start = Math.max(0, m.index - ctx), end = Math.min(text.length, m.index + word.length + ctx);
      hits.push((start > 0 ? '…' : '') + text.slice(start, m.index) +
        '<mark>' + escapeHtml(m[0]) + '</mark>' +
        text.slice(m.index + word.length, end) + (end < text.length ? '…' : ''));
      if(hits.length > 200) break;
    }
    out.innerHTML = hits.length
      ? `<div class="hint">${hits.length} occurrence${hits.length === 1 ? '' : 's'}</div>
         <div style="font-family:var(--mono);font-size:12px;line-height:1.9">${hits.map(h=>escapeHtml(h).replace(/&lt;mark&gt;/g, '<mark>').replace(/&lt;\/mark&gt;/g, '</mark>')).join('<br>')}</div>`
      : '<div class="hint">That word does not appear.</div>';
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

txt('Text Cleanup','hyphenate','Hyphenation', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="hyIn" style="min-height:90px">Extraordinary circumstances require consideration of the consequences.</textarea></div>
    <div class="row">
      <div class="field"><label>Maximum line (characters)</label><input type="number" id="hyWidth" value="28"></div>
      <div class="field"><label>Show breaks as</label><select id="hyMark"><option value="-">-</option><option value="&#8203;">zero-width space</option></select></div>
    </div>
    <div class="output" id="hyOut" style="white-space:pre-wrap;font-family:var(--mono)">—</div>
    <div class="hint">A rule-based break: it splits between consonant pairs and around vowel groups, and never leaves one letter alone. Real hyphenation uses Liang's pattern tables per language — this is the 80% version, and it says so rather than pretending to be a dictionary.</div>`;
  const VOWELS = 'aeiouy';
  function breaks(word){
    const points = [];
    for(let i=2;i<word.length-2;i++){
      const a = word[i-1].toLowerCase(), b = word[i].toLowerCase();
      const before = word[i-2].toLowerCase(), after = word[i+1].toLowerCase();
      const vowelA = VOWELS.includes(a), vowelB = VOWELS.includes(b);
      if(!vowelA && vowelB) points.push(i);                       // before a vowel group
      else if(vowelA && !vowelB && !VOWELS.includes(after)) points.push(i); // between consonants
      else if(!vowelA && !vowelB && VOWELS.includes(before) && !VOWELS.includes(after)) points.push(i);
    }
    return points;
  }
  function draw(){
    const width = Math.max(10, Number(root.querySelector('#hyWidth').value) || 28);
    const mark = root.querySelector('#hyMark').value;
    const words = root.querySelector('#hyIn').value.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for(const word of words){
      let rest = word;
      let guard = 0;
      while(rest && guard++ < 200){
        const room = width - (line ? line.length + 1 : 0);
        if(rest.length <= room){ line = line ? line + ' ' + rest : rest; rest = ''; break; }
        const points = breaks(rest).filter(p=>p >= 2 && p <= room - 1 && p <= rest.length - 2);
        if(points.length){
          const cut = points[points.length - 1];
          lines.push((line ? line + ' ' : '') + rest.slice(0, cut) + mark);
          line = '';
          rest = rest.slice(cut);
        } else if(line){
          lines.push(line);          // this word will not break: start a fresh line
          line = '';
        } else {
          line = rest;               // longer than the width and unbreakable
          rest = '';
        }
      }
    }
    if(line) lines.push(line);
    root.querySelector('#hyOut').textContent = lines.join('\n');
  }
  root.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});

/* ---------------- Files & Data (2) ---------------- */

fil('batchrename','Batch Rename', root=>{
  root.innerHTML = `
    ${FILES_HINT}
    <div class="field"><label>Files</label><input type="file" id="brFiles" multiple></div>
    <div class="row">
      <div class="field"><label>Pattern</label><input type="text" id="brPattern" value="photo-{n}{ext}" style="font-family:var(--mono)"></div>
      <div class="field"><label>Start number</label><input type="number" id="brStart" value="1"></div>
    </div>
    <div class="output" id="brOut">Choose files to see the new names.</div>
    <div class="hint">Tokens: <span class="mono">{n}</span> the counter, <span class="mono">{name}</span> the original name without its extension, <span class="mono">{ext}</span> the extension with its dot, <span class="mono">{date}</span> today. Files are saved under the new names — a browser cannot rename in place, so this writes copies.</div>`;
  function plan(){
    const files = [...root.querySelector('#brFiles').files];
    const pattern = root.querySelector('#brPattern').value || '{name}{ext}';
    const start = Number(root.querySelector('#brStart').value) || 1;
    const pad = String(files.length + start - 1).length;
    const today = new Date().toISOString().slice(0, 10);
    return files.map((f, i)=>{
      const dot = f.name.lastIndexOf('.');
      const name = dot > 0 ? f.name.slice(0, dot) : f.name;
      const ext = dot > 0 ? f.name.slice(dot) : '';
      const newName = pattern
        .replace(/\{n\}/g, String(start + i).padStart(pad, '0'))
        .replace(/\{name\}/g, name)
        .replace(/\{ext\}/g, ext)
        .replace(/\{date\}/g, today);
      return { file: f, newName };
    });
  }
  function draw(){
    const rows = plan();
    const out = root.querySelector('#brOut');
    if(!rows.length){ out.textContent = 'Choose files to see the new names.'; return; }
    const clash = rows.map(r=>r.newName).filter((n, i, arr)=>arr.indexOf(n) !== i);
    out.innerHTML = `<table class="mono">
      ${rows.map(r=>`<tr><td>${escapeHtml(r.file.name)}</td><td>→</td><td>${escapeHtml(r.newName)}</td></tr>`).join('')}
    </table>
    ${clash.length ? `<div class="hint" style="color:#c0392b">Two files would be called ${escapeHtml(clash[0])} — adjust the pattern.</div>` : ''}
    <div class="segrow"><button class="btn primary" id="brGo">Save ${rows.length} file(s) under the new names</button></div>`;
    out.querySelector('#brGo').addEventListener('click', ()=>{
      rows.forEach(r=>saveBlob(r.file, r.newName));
      toast('Saving ' + rows.length + ' files');
    });
  }
  root.querySelector('#brFiles').addEventListener('change', draw);
  root.querySelectorAll('#brPattern, #brStart').forEach(el=>el.addEventListener('input', draw));
  draw();
});

fil('filetree','File Tree', root=>{
  root.innerHTML = `
    <div class="field"><label>Paths, one per line</label><textarea id="ftIn" style="min-height:130px">src/index.js
src/lib/parse.js
src/lib/render.js
test/parse.test.js
package.json
README.md</textarea></div>
    <div class="output" id="ftOut" style="white-space:pre;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">Paste a list of paths and get the tree back — the block you were about to write by hand in a README. Directories are created once even if they appear in ten paths, and the order is the order you would draw it.</div>`;
  function draw(){
    const paths = root.querySelector('#ftIn').value.split('\n').map(p=>p.trim()).filter(Boolean);
    const out = root.querySelector('#ftOut');
    if(!paths.length){ out.textContent = '—'; return; }
    const tree = { name: '', kids: new Map(), isFile: false };
    for(const p of paths){
      const parts = p.split('/').filter(Boolean);
      let node = tree;
      parts.forEach((part, i)=>{
        const last = i === parts.length - 1;
        if(!node.kids.has(part)) node.kids.set(part, { name: part, kids: new Map(), isFile: last });
        node = node.kids.get(part);
      });
    }
    const lines = [];
    (function walk(node, prefix){
      const entries = [...node.kids.values()].sort((a, b)=>{
        if(a.isFile !== b.isFile) return a.isFile ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
      entries.forEach((child, i)=>{
        const lastEntry = i === entries.length - 1;
        lines.push(prefix + (lastEntry ? '└── ' : '├── ') + child.name + (child.isFile ? '' : '/'));
        walk(child, prefix + (lastEntry ? '    ' : '│   '));
      });
    })(tree, '');
    out.textContent = lines.join('\n');
  }
  root.querySelector('#ftIn').addEventListener('input', draw);
  draw();
});

/* ---------------- Money, India (2) ---------------- */

money('leaveencashment','Leave Encashment', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Average monthly salary (₹)</label><input type="number" id="leSal" value="80000"></div>
      <div class="field"><label>Leave days encashed</label><input type="number" id="leDays" value="120"></div>
    </div>
    <div class="row">
      <div class="field"><label>Days of leave per year</label><input type="number" id="lePerYear" value="30"></div>
      <div class="field"><label>Years of service</label><input type="number" id="leYears" value="20"></div>
    </div>
    <div class="field"><label>On retirement or resignation?</label><select id="leType"><option value="retire">Retirement / superannuation</option><option value="resign">Resignation</option></select></div>
    <div class="output" id="leOut">—</div>
    <div class="hint">The exemption is the least of three figures: the cash equivalent of leave, ten months of average salary, and ₹25 lakh. Resignation is the case people forget — the relief for encashed leave at retirement does not apply in the same way, so check before assuming.</div>`;
  function draw(){
    const sal = Number(root.querySelector('#leSal').value) || 0;
    const days = Number(root.querySelector('#leDays').value) || 0;
    const perYear = Number(root.querySelector('#lePerYear').value) || 30;
    const years = Number(root.querySelector('#leYears').value) || 0;
    const type = root.querySelector('#leType').value;
    const cash = sal / 30 * days;
    const tenMonths = sal * 10;
    const cap = 2500000;
    const entitled = sal / 30 * Math.min(days, perYear * years);
    const exempt = type === 'retire' ? Math.min(cash, tenMonths, cap) : 0;
    const f = v => '₹' + Math.round(v).toLocaleString(numLocale());
    root.querySelector('#leOut').innerHTML = `<table class="mono">
      <tr><td>Cash equivalent</td><td>${f(cash)}</td></tr>
      <tr><td>Leave entitled to</td><td>${f(entitled)} — ${perYear} days × ${years} years</td></tr>
      <tr><td>Ten months' salary</td><td>${f(tenMonths)}</td></tr>
      <tr><td>Statutory cap</td><td>${f(cap)}</td></tr>
      <tr><td><b>Exempt</b></td><td><b>${f(exempt)}</b></td></tr>
      <tr><td>Taxable</td><td>${f(Math.max(0, cash - exempt))}</td></tr>
      <tr><td>Reading</td><td>${type === 'retire' ? 'the least of the three, capped' : 'no exemption on resignation under the default rules — the encashed leave is taxable'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

money('salarysplit','Salary Splitter', root=>{
  root.innerHTML = `
    <div class="field"><label>Annual CTC (₹)</label><input type="number" id="ssCtc" value="1200000"></div>
    <div class="row">
      <div class="field"><label>Basic as % of CTC</label><input type="number" id="ssBasic" value="40"></div>
      <div class="field"><label>HRA as % of basic</label><input type="number" id="ssHra" value="50"></div>
      <div class="field"><label>Employer PF included?</label><select id="ssPf"><option value="1">Yes — inside CTC</option><option value="0">No — on top</option></select></div>
    </div>
    <div class="output" id="ssOut">—</div>
    <div class="hint">A structure, not a payslip: basic, HRA, employer PF and the special allowance that absorbs the remainder. Basic at 40% and HRA at 50% of basic is the shape most Indian offers use — and the reason the basic percentage matters is that PF and gratuity are both computed from it.</div>`;
  function draw(){
    const ctc = Number(root.querySelector('#ssCtc').value) || 0;
    const basicPct = (Number(root.querySelector('#ssBasic').value) || 40) / 100;
    const hraPct = (Number(root.querySelector('#ssHra').value) || 50) / 100;
    const pfInside = root.querySelector('#ssPf').value === '1';
    const basic = ctc * basicPct;
    const hra = basic * hraPct;
    const employerPf = Math.min(basic, 180000) * 0.12;   // 12% of basic, capped at the PF wage ceiling
    const gross = ctc - (pfInside ? employerPf : 0);
    const special = Math.max(0, gross - basic - hra);
    const employeePf = Math.min(basic, 180000) * 0.12;
    const gratuity = basic * 0.0481;                     // 15/26 ÷ 12, the annual accrual
    const f = v => '₹' + Math.round(v).toLocaleString(numLocale());
    root.querySelector('#ssOut').innerHTML = `<table class="mono">
      <tr><td>Basic</td><td>${f(basic)} · ${(basic / 12).toFixed(0)}/month</td></tr>
      <tr><td>HRA</td><td>${f(hra)}</td></tr>
      <tr><td>Special allowance</td><td>${f(special)}</td></tr>
      <tr><td>Gross salary</td><td>${f(gross)}</td></tr>
      <tr><td>Employer PF</td><td>${f(employerPf)} ${pfInside ? '(inside CTC)' : '(on top of CTC)'}</td></tr>
      <tr><td>Gratuity accrual</td><td>${f(gratuity)} — 4.81% of basic, not paid monthly</td></tr>
      <tr><td>Employee PF deduction</td><td>${f(employeePf)}</td></tr>
      <tr><td>Monthly gross</td><td>${f(gross / 12)}</td></tr>
      <tr><td>Monthly before tax</td><td>${f((gross - employeePf) / 12)}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});
