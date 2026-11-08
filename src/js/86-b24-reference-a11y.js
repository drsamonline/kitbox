/* ================================================================
   B24 — two reference pages that everyone looks up, and two accessibility
   checks that are actually about words on a screen.
   ================================================================ */

/* ---------------- Reference (2) ---------------- */

ref('siunits','SI Prefixes', root=>{
  const ROWS = [
    ['quetta','Q',1e30],['ronna','R',1e27],['yotta','Y',1e24],['zetta','Z',1e21],['exa','E',1e18],
    ['peta','P',1e15],['tera','T',1e12],['giga','G',1e9],['mega','M',1e6],['kilo','k',1e3],
    ['hecto','h',1e2],['deca','da',1e1],['—','—',1],['deci','d',1e-1],['centi','c',1e-2],
    ['milli','m',1e-3],['micro','µ',1e-6],['nano','n',1e-9],['pico','p',1e12 ? 1e-12 : 0],
    ['femto','f',1e-15],['atto','a',1e-18],['zepto','z',1e-21],['yocto','y',1e-24],
    ['ronto','r',1e-27],['quecto','q',1e-30]
  ];
  root.innerHTML = `
    <div class="field"><label>Value</label><input type="number" id="siVal" value="1500"></div>
    <div class="output" id="siOut">—</div>
    <div class="hint">The prefix table, and the same number written with each of them. The rows added in 2022 are at the ends — quetta, ronna, ronto and quecto — because data outgrew yotta and nobody could say "one yottabyte" with a straight face.</div>`;
  function draw(){
    const v = Number(root.querySelector('#siVal').value) || 0;
    root.querySelector('#siOut').innerHTML = `<table class="mono">
      <tr><th style="text-align:left">Prefix</th><th>Symbol</th><th>Factor</th><th style="text-align:left">This value</th></tr>
      ${ROWS.map(([name, sym, factor])=>{
        const scaled = v / factor;
        const show = Math.abs(scaled) >= 0.001 && Math.abs(scaled) < 1000 ? scaled.toPrecision(4) : (Math.abs(scaled) < 1e-6 || Math.abs(scaled) >= 1e9 ? scaled.toExponential(2) : scaled.toPrecision(3));
        return `<tr><td>${name}</td><td>${sym}</td><td>10^${Math.round(Math.log10(factor))}</td><td>${show} ${sym === '—' ? '' : sym}</td></tr>`;
      }).join('')}
    </table>`;
  }
  root.querySelector('#siVal').addEventListener('input', draw);
  draw();
});

ref('greek','Greek Alphabet', root=>{
  const ROWS = [
    ['Alpha','Α','α','a'],['Beta','Β','β','b'],['Gamma','Γ','γ','g'],['Delta','Δ','δ','d'],
    ['Epsilon','Ε','ε','e'],['Zeta','Ζ','ζ','z'],['Eta','Η','η','h'],['Theta','Θ','θ','th'],
    ['Iota','Ι','ι','i'],['Kappa','Κ','κ','k'],['Lambda','Λ','λ','l'],['Mu','Μ','μ','m'],
    ['Nu','Ν','ν','n'],['Xi','Ξ','ξ','x'],['Omicron','Ο','ο','o'],['Pi','Π','π','p'],
    ['Rho','Ρ','ρ','r'],['Sigma','Σ','σ','s'],['Tau','Τ','τ','t'],['Upsilon','Υ','υ','u'],
    ['Phi','Φ','φ','ph'],['Chi','Χ','χ','ch'],['Psi','Ψ','ψ','ps'],['Omega','Ω','ω','o']
  ];
  root.innerHTML = `
    <div class="field"><label>Filter</label><input type="text" id="gkIn" placeholder="name, letter or sound"></div>
    <div class="output" id="gkOut">—</div>
    <div class="hint">With the sound each letter makes, which is the part people actually need when they meet a symbol in a formula and have to say it out loud.</div>`;
  function draw(){
    const q = root.querySelector('#gkIn').value.trim().toLowerCase();
    const rows = ROWS.filter(r=>!q || r.join(' ').toLowerCase().includes(q));
    root.querySelector('#gkOut').innerHTML = rows.length
      ? `<table class="mono">${rows.map(([name, upper, lower, sound])=>
          `<tr><td style="font-size:20px">${upper} ${lower}</td><td>${name}</td><td>${sound}</td></tr>`).join('')}</table>`
      : '<div class="hint">No letter matches that.</div>';
  }
  root.querySelector('#gkIn').addEventListener('input', draw);
  draw();
});

/* ---------------- Accessibility (2) ---------------- */

acc('linktext','Link Text Checker', root=>{
  root.innerHTML = `
    <div class="field"><label>Links, one per line</label><textarea id="ltIn" style="min-height:120px">Read the guidelines
Click here to download the report
Full results
Download the 2026 annual report (PDF, 2.1 MB)
More
Read more</textarea></div>
    <div class="output" id="ltOut">—</div>
    <div class="hint">A screen reader can list every link on a page out of context, so "click here" and "read more" become six identical entries. The test is whether the link text makes sense on its own — the same rule as alt text.</div>`;
  function draw(){
    const lines = root.querySelector('#ltIn').value.split('\n').map(l=>l.trim()).filter(Boolean);
    if(!lines.length){ root.querySelector('#ltOut').textContent = 'Paste some link text.'; return; }
    const rows = lines.map(text=>{
      const issues = [];
      if(/^(click here|here|read more|more|learn more|this link|link)$/i.test(text)) issues.push('meaningless out of context');
      if(/^(download|read|view|see)\b/i.test(text) && text.split(/\s+/).length < 3) issues.push('does not say what');
      if(text.length > 80) issues.push('longer than 80 characters');
      if(text.length < 4) issues.push('too short to identify');
      if(/^https?:\/\//.test(text)) issues.push('a raw URL is read out character by character');
      return { text, issues };
    });
    const bad = rows.filter(r=>r.issues.length).length;
    root.querySelector('#ltOut').innerHTML = `<table class="mono">
      ${rows.map(r=>`<tr><td>${escapeHtml(r.text)}</td><td style="color:${r.issues.length ? '#c0392b' : '#1a7f37'}">${r.issues.length ? escapeHtml(r.issues.join('; ')) : 'stands alone'}</td></tr>`).join('')}
      <tr><td><b>${bad} of ${rows.length}</b></td><td>${bad ? 'need rewriting' : 'all fine'}</td></tr>
    </table>`;
  }
  root.querySelector('#ltIn').addEventListener('input', draw);
  draw();
});

acc('zoomsim','Reflow at 200%', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="zfIn" style="min-height:110px">A patient information leaflet should stay readable when the reader zooms to 200%. At that size the text column narrows and the layout has to reflow — if it clips, scrolls sideways or hides content, the reader has lost it.</textarea></div>
    <div class="row">
      <div class="field"><label>Simulated viewport width (px)</label><input type="number" id="zfW" value="320"></div>
      <div class="field"><label>Zoom</label><select id="zfZ"><option value="2">200%</option><option value="3">300%</option><option value="4">400%</option></select></div>
    </div>
    <div id="zfStage" style="border:1px solid var(--line);padding:8px;overflow:auto;background:var(--panel)">
      <div id="zfView" style="background:var(--bg);padding:10px">
        <div id="zfText" style="font-size:16px;line-height:1.5"></div>
      </div>
    </div>
    <div class="output" id="zfOut" style="margin-top:10px">—</div>
    <div class="hint">WCAG 1.4.10 asks that content reflow to a 320 CSS-pixel viewport at 400% zoom without two-dimensional scrolling. This shows the text at that width; the reading below is about whether it fits, not about whether your site's CSS is right.</div>`;
  function draw(){
    const w = Math.max(200, Number(root.querySelector('#zfW').value) || 320);
    const zoom = Number(root.querySelector('#zfZ').value) || 2;
    const view = root.querySelector('#zfView'), text = root.querySelector('#zfText');
    view.style.width = w + 'px';
    text.style.fontSize = (16 * zoom / 2) + 'px';
    text.textContent = root.querySelector('#zfIn').value;
    const overflow = view.scrollWidth > w + 2;
    const lines = Math.round(text.scrollHeight / (16 * zoom / 2 * 1.5));
    root.querySelector('#zfOut').innerHTML = `<table class="mono">
      <tr><td>Effective text size</td><td>${(16 * zoom / 2).toFixed(0)} px</td></tr>
      <tr><td>Viewport</td><td>${w} px wide</td></tr>
      <tr><td>Horizontal overflow</td><td style="color:${overflow ? '#c0392b' : '#1a7f37'}">${overflow ? 'yes — content is wider than the viewport' : 'none'}</td></tr>
      <tr><td>Lines of text</td><td>about ${lines}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input', draw));
  draw();
});
