/* ================================================================
   B33 — three reference pages people look up, and three ear-training tools.

   The audio ones share one oscillator helper rather than each opening its own
   AudioContext — a browser allows only a handful, and a tool that leaks one
   per render is a tool that stops making sound after five visits.
   ================================================================ */

/* ---------------- Audio helper ---------------- */

const audioKit = (()=>{
  let ctx = null;
  function context(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, seconds, type = 'sine', gainValue = 0.2){
    const c = context();
    if(!c) return false;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(gainValue, c.currentTime + 0.01);
    gain.gain.setValueAtTime(gainValue, c.currentTime + seconds - 0.05);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + seconds);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + seconds);
    return true;
  }
  function close(){
    if(ctx){ try{ ctx.close(); }catch(e){} ctx = null; }
  }
  return { context, tone, close, get ready(){ return !!context(); } };
})();

/* ---------------- Reference (3) ---------------- */

ref('htmlentities','HTML Entities', root=>{
  const ROWS = [
    ['&amp;','&','ampersand'], ['&lt;','<','less than'], ['&gt;','>','greater than'], ['&quot;','"','quotation mark'],
    ['&apos;',"'",'apostrophe'], ['&nbsp;','\u00a0','non-breaking space'], ['&copy;','©','copyright'],
    ['&reg;','®','registered'], ['&trade;','™','trade mark'], ['&deg;','°','degree'], ['&plusmn;','±','plus-minus'],
    ['&times;','×','multiplication'], ['&divide;','÷','division'], ['&frac12;','½','one half'], ['&frac14;','¼','one quarter'],
    ['&sup2;','²','squared'], ['&sup3;','³','cubed'], ['&micro;','µ','micro'], ['&para;','¶','pilcrow'],
    ['&sect;','§','section'], ['&dagger;','†','dagger'], ['&bull;','•','bullet'], ['&hellip;','…','ellipsis'],
    ['&mdash;','—','em dash'], ['&ndash;','–','en dash'], ['&lsquo;','‘','left single quote'],
    ['&rsquo;','’','right single quote'], ['&ldquo;','“','left double quote'], ['&rdquo;','”','right double quote'],
    ['&laquo;','«','left guillemet'], ['&raquo;','»','right guillemet'], ['&larr;','←','left arrow'],
    ['&rarr;','→','right arrow'], ['&uarr;','↑','up arrow'], ['&darr;','↓','down arrow'], ['&harr;','↔','left-right arrow'],
    ['&euro;','€','euro'], ['&pound;','£','pound'], ['&yen;','¥','yen'], ['&cent;','¢','cent'], ['&rupee;','₹','rupee sign'],
    ['&alpha;','α','alpha'], ['&beta;','β','beta'], ['&gamma;','γ','gamma'], ['&delta;','δ','delta'],
    ['&pi;','π','pi'], ['&sigma;','σ','sigma'], ['&omega;','ω','omega'], ['&infin;','∞','infinity'],
    ['&ne;','≠','not equal'], ['&le;','≤','less or equal'], ['&ge;','≥','greater or equal'], ['&asymp;','≈','approximately'],
    ['&sum;','∑','sum'], ['&prod;','∏','product'], ['&radic;','√','square root'], ['&int;','∫','integral'],
    ['&there4;','∴','therefore'], ['&spades;','♠','spade'], ['&hearts;','♥','heart'], ['&diams;','♦','diamond'],
    ['&clubs;','♣','club'], ['&check;','✓','check mark'], ['&star;','☆','star']
  ];
  root.innerHTML = `
    <div class="field"><label>Filter</label><input type="text" id="heIn" placeholder="name, character or description"></div>
    <div class="output" id="heOut">—</div>
    <div class="hint">The sixty entities worth knowing, with the character each one produces. Anything outside Latin-1, punctuation and maths is better written as the character itself — UTF-8 has been the default for long enough that <span class="mono">&amp;alpha;</span> is usually a habit, not a requirement.</div>`;
  function draw(){
    // compare without spaces or punctuation, so "emdash" finds "em dash" —
    // the search box is the only way through sixty rows.
    const norm = t => t.toLowerCase().replace(/[^a-z0-9]/g, '');
    const q = norm(root.querySelector('#heIn').value);
    const rows = ROWS.filter(r=>!q || norm(r.join(' ')).includes(q));
    root.querySelector('#heOut').innerHTML = rows.length
      ? `<table class="mono">${rows.map(([code, ch, name])=>
          `<tr><td>${escapeHtml(code)}</td><td style="font-size:18px">${escapeHtml(ch)}</td><td>${escapeHtml(name)}</td></tr>`).join('')}</table>`
      : '<div class="hint">No entity matches that.</div>';
  }
  root.querySelector('#heIn').addEventListener('input', draw);
  draw();
});

ref('gitref','Git Command Reference', root=>{
  const GROUPS = {
    'Everyday': [
      ['git status -sb', 'what changed, in one line per file'],
      ['git diff --stat', 'what changed, counted'],
      ['git add -p', 'stage hunk by hunk — the single most useful flag in git'],
      ['git commit -m "msg"', 'commit what is staged'],
      ['git log --oneline --graph -20', 'history as a graph'],
      ['git switch -c branch', 'create and switch in one step']
    ],
    'Undo': [
      ['git restore file', 'throw away unstaged changes to a file'],
      ['git restore --staged file', 'unstage, keep the edit'],
      ['git commit --amend', 'fix the last commit, before pushing'],
      ['git reset --soft HEAD~1', 'undo the commit, keep the changes staged'],
      ['git revert <sha>', 'undo a pushed commit by making a new one'],
      ['git reflog', 'everything HEAD has pointed at — the safety net']
    ],
    'Branches': [
      ['git branch -vv', 'local branches and their upstreams'],
      ['git switch main && git pull --ff-only', 'the safe way to update'],
      ['git rebase -i main', 'rewrite your own branch before a PR'],
      ['git cherry-pick <sha>', 'take one commit from somewhere else'],
      ['git branch -d branch', 'delete a merged branch']
    ],
    'Finding things': [
      ['git log -S "text" -p', 'commits that added or removed a string'],
      ['git log --author="name" --since="2 weeks ago"', 'filtered history'],
      ['git blame -L 10,20 file', 'who last touched these lines'],
      ['git show <sha>:path', 'a file as it was at a commit'],
      ['git bisect start', 'binary search for the commit that broke it']
    ]
  };
  root.innerHTML = `
    <div class="field"><label>Filter</label><input type="text" id="grIn" placeholder="rebase, undo, stash…"></div>
    <div id="grOut">—</div>
    <div class="hint">The twenty-odd commands people actually look up, grouped by the question being asked rather than alphabetically. Destructive commands are not listed without their safe counterpart.</div>`;
  function draw(){
    const q = root.querySelector('#grIn').value.trim().toLowerCase();
    root.querySelector('#grOut').innerHTML = Object.entries(GROUPS).map(([group, rows])=>{
      const shown = rows.filter(([cmd, what])=>!q || (cmd + ' ' + what).toLowerCase().includes(q));
      if(!shown.length) return '';
      return `<div class="section-label" style="margin-top:14px">${escapeHtml(group)}</div>
        <table class="mono">${shown.map(([cmd, what])=>
          `<tr><td style="white-space:nowrap">${escapeHtml(cmd)}</td><td>${escapeHtml(what)}</td></tr>`).join('')}</table>`;
    }).join('') || '<div class="hint">Nothing matches that.</div>';
  }
  root.querySelector('#grIn').addEventListener('input', draw);
  draw();
});

ref('keycode','Key Inspector', root=>{
  root.innerHTML = `
    <div class="output" id="kcOut" style="text-align:center;padding:28px;border:1px dashed var(--line);border-radius:10px">
      Press any key
    </div>
    <div class="hint">What the browser reports for the key you pressed: <span class="mono">key</span> is what it means, <span class="mono">code</span> is where it sits on the keyboard, and <span class="mono">keyCode</span> is the deprecated number half the internet still uses. A layout change moves the first and not the second.</div>`;
  const out = root.querySelector('#kcOut');
  const onKey = e => {
    const rows = [
      ['key', JSON.stringify(e.key)],
      ['code', e.code],
      ['keyCode', e.keyCode],
      ['which', e.which],
      ['location', ['standard', 'left', 'right', 'numpad'][e.location] || e.location],
      ['modifiers', [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Meta'].filter(Boolean).join(' + ') || 'none'],
      ['repeat', String(e.repeat)]
    ];
    out.innerHTML = `<table class="mono" style="text-align:left;display:inline-table">
      ${rows.map(([k, v])=>`<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}
    </table>`;
  };
  root.addEventListener('keydown', e=>{ e.preventDefault(); onKey(e); });
  root.tabIndex = 0;
  root.querySelector('#kcOut').addEventListener('click', ()=>{ root.focus(); out.innerHTML = 'Listening — press a key.'; });
});

/* ---------------- Audio (3) ---------------- */

aud('chords','Chord Builder', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Root</label><select id="chRoot">${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map((n, i)=>`<option value="${i}"${i===0?' selected':''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>Quality</label><select id="chQuality">
        <option value="maj">major</option><option value="min">minor</option><option value="dim">diminished</option>
        <option value="aug">augmented</option><option value="sus4">sus4</option><option value="dom7">dominant 7th</option>
        <option value="maj7">major 7th</option><option value="min7">minor 7th</option>
      </select></div>
    </div>
    <div class="output" id="chOut">—</div>
    <div class="segrow"><button class="btn primary" id="chPlay">Play it</button></div>
    <div class="hint">The notes of the chord and the frequency of each, so you can see why a major third is 4 semitones and a minor third is 3. Playing them together is the fastest way to hear the difference.</div>`;
  const SHAPES = { maj:[0,4,7], min:[0,3,7], dim:[0,3,6], aug:[0,4,8], sus4:[0,5,7], dom7:[0,4,7,10], maj7:[0,4,7,11], min7:[0,3,7,10] };
  const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const freq = midi => 440 * Math.pow(2, (midi - 69) / 12);
  function notes(){
    const rootNote = Number(root.querySelector('#chRoot').value);
    const shape = SHAPES[root.querySelector('#chQuality').value];
    return shape.map(step=>{
      const midi = 60 + rootNote + step;
      return { name: NAMES[midi % 12] + (Math.floor(midi / 12) - 1), midi, hz: freq(midi) };
    });
  }
  function draw(){
    const list = notes();
    root.querySelector('#chOut').innerHTML = `<table class="mono">
      ${list.map(n=>`<tr><td>${n.name}</td><td>${n.hz.toFixed(2)} Hz</td><td>MIDI ${n.midi}</td></tr>`).join('')}
      <tr><td><b>Chord</b></td><td colspan="2"><b>${list.map(n=>n.name).join(' – ')}</b></td></tr>
    </table>`;
  }
  root.querySelector('#chPlay').addEventListener('click', ()=>{
    for(const n of notes()) audioKit.tone(n.hz, 1.1, 'sine', 0.12);
  });
  setCleanup(()=>audioKit.close());
  root.querySelectorAll('select').forEach(el=>el.addEventListener('change', draw));
  draw();
});

aud('intervals','Interval Trainer', root=>{
  root.innerHTML = `
    <div class="output" id="ivQ" style="text-align:center;padding:24px;font-size:22px">Press Start</div>
    <div class="segrow" id="ivAnswers"></div>
    <div class="row" style="margin-top:10px">
      <button class="btn" id="ivReplay">Play again</button>
      <button class="btn primary" id="ivStart">Start</button>
    </div>
    <div class="hint" id="ivScore">Ten intervals, played one after the other. A wide interval sounds wider than a wide-sounding narrow one only if you practise — that is the whole exercise.</div>`;
  const INTERVALS = [
    ['minor 2nd', 1], ['major 2nd', 2], ['minor 3rd', 3], ['major 3rd', 4], ['perfect 4th', 5],
    ['tritone', 6], ['perfect 5th', 7], ['minor 6th', 8], ['major 6th', 9], ['minor 7th', 10], ['major 7th', 11], ['octave', 12]
  ];
  let current = null, asked = 0, score = 0, playing = false;
  const answers = root.querySelector('#ivAnswers');
  function play(){
    if(!current) return;
    const base = 60 + Math.floor(Math.random() * 12);
    audioKit.tone(freqOf(base), 0.6, 'sine', 0.2);
    setTimeout(()=>audioKit.tone(freqOf(base + current[1]), 0.6, 'sine', 0.2), 700);
  }
  const freqOf = midi => 440 * Math.pow(2, (midi - 69) / 12);
  function next(){
    current = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    root.querySelector('#ivQ').textContent = 'Which interval?';
    play();
  }
  answers.innerHTML = INTERVALS.map(([name], i)=>`<button class="btn" data-iv="${i}" style="font-size:12px">${name}</button>`).join('');
  answers.querySelectorAll('[data-iv]').forEach(b=>b.addEventListener('click', ()=>{
    if(!playing || !current) return;
    const chosen = INTERVALS[Number(b.dataset.iv)];
    asked++;
    const right = chosen[1] === current[1];
    if(right) score++;
    root.querySelector('#ivQ').textContent = (right ? '✓ ' : '✗ ') + current[0] + (right ? '' : ' — you said ' + chosen[0]);
    root.querySelector('#ivScore').textContent = score + ' / ' + asked;
    if(asked >= 10){
      playing = false;
      root.querySelector('#ivStart').textContent = 'Again';
      root.querySelector('#ivQ').textContent = score + ' / 10 — ' + (score >= 8 ? 'a good ear' : 'keep going');
      return;
    }
    setTimeout(next, 900);
  }));
  root.querySelector('#ivStart').addEventListener('click', ()=>{
    playing = true; asked = 0; score = 0;
    root.querySelector('#ivStart').textContent = 'Start';
    root.querySelector('#ivScore').textContent = '0 / 0';
    next();
  });
  root.querySelector('#ivReplay').addEventListener('click', play);
  setCleanup(()=>audioKit.close());
});

aud('piano','Note Player', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Octave</label><select id="pnOct">${[2,3,4,5,6].map(o=>`<option value="${o}"${o===4?' selected':''}>${o}</option>`).join('')}</select></div>
      <div class="field"><label>Waveform</label><select id="pnWave"><option>sine</option><option>triangle</option><option>square</option><option>sawtooth</option></select></div>
    </div>
    <div id="pnKeys" style="position:relative;height:140px;margin:12px 0;user-select:none"></div>
    <div class="hint">Click a key, or use the letters A–K on your keyboard. Equal temperament: every semitone is the twelfth root of two, which is why the frequencies are not round numbers.</div>`;
  const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const WHITE = [0,2,4,5,7,9,11];
  const LETTERS = 'ASDFGHJKL';
  function draw(){
    const octave = Number(root.querySelector('#pnOct').value);
    const holder = root.querySelector('#pnKeys');
    const whiteCount = 7;
    let html = '';
    WHITE.forEach((semitone, i)=>{
      html += `<button data-midi="${(octave + 1) * 12 + semitone}" style="position:absolute;left:${i * (100 / whiteCount)}%;width:${100 / whiteCount}%;top:0;bottom:0;background:#f7f7f5;color:#222;border:1px solid #bbb;border-radius:0 0 6px 6px;font-size:11px">${NAMES[semitone]}</button>`;
    });
    [1,3,6,8,10].forEach((semitone, i)=>{
      const whiteBefore = WHITE.filter(s=>s < semitone).length;
      html += `<button data-midi="${(octave + 1) * 12 + semitone}" style="position:absolute;left:calc(${whiteBefore * (100 / whiteCount)}% - 3.4%);width:6.8%;top:0;height:62%;background:#1b1b1b;color:#eee;border:1px solid #000;border-radius:0 0 4px 4px;font-size:9px">${NAMES[semitone]}</button>`;
    });
    holder.innerHTML = html;
    holder.querySelectorAll('[data-midi]').forEach(b=>{
      b.addEventListener('pointerdown', ()=>{
        const midi = Number(b.dataset.midi);
        audioKit.tone(440 * Math.pow(2, (midi - 69) / 12), 0.8, root.querySelector('#pnWave').value, 0.18);
        b.style.filter = 'brightness(0.8)';
        setTimeout(()=>{ b.style.filter = ''; }, 120);
      });
    });
  }
  const onKey = e => {
    if(e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const i = LETTERS.indexOf(e.key.toUpperCase());
    if(i < 0) return;
    const octave = Number(root.querySelector('#pnOct').value);
    const midi = (octave + 1) * 12 + WHITE[i];
    audioKit.tone(440 * Math.pow(2, (midi - 69) / 12), 0.8, root.querySelector('#pnWave').value, 0.18);
  };
  root.addEventListener('keydown', onKey);
  root.tabIndex = 0;
  root.querySelector('#pnOct').addEventListener('change', draw);
  setCleanup(()=>audioKit.close());
  draw();
});
