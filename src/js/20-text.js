/* ================================================================
   TEXT TOOLS, grouped into Basic / Remove / Edit / Stylish
   ================================================================ */
TOOLS.text = TOOLS.text || [];   // idempotent: a part that sorts earlier may have registered already
let TXT_N = 0;
function txt(group, id, name, render){ register({cat:'text', group, id, name, render}); }

/* -- Basic Tools -- */
txt('Basic Tools','cases','Text Cases', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="tcIn" placeholder="Type or paste text..."></textarea></div>
    <div class="segrow" id="tcBtns">
      ${['UPPERCASE','lowercase','Title Case','Sentence case','camelCase','PascalCase','snake_case','kebab-case','aLtErNaTiNg'].map(l=>`<button class="btn" data-case="${l}">${l}</button>`).join('')}
    </div>
    <div class="output" id="tcOut">Result will appear here.</div>`;
  const inp = root.querySelector('#tcIn'), out = root.querySelector('#tcOut');
  function toTitle(s){ return s.replace(/\w\S*/g, w=>w[0].toUpperCase()+w.slice(1).toLowerCase()); }
  function toSentence(s){ return s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c=>c.toUpperCase()); }
  function toCamel(s){ return s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m,c)=>c.toUpperCase()); }
  function toPascal(s){ const c=toCamel(s); return c.charAt(0).toUpperCase()+c.slice(1); }
  function toSnake(s){ return s.trim().replace(/\W+/g,' ').trim().split(/\s+/).join('_').toLowerCase(); }
  function toKebab(s){ return s.trim().replace(/\W+/g,' ').trim().split(/\s+/).join('-').toLowerCase(); }
  function toAlt(s){ return s.split('').map((c,i)=> i%2? c.toLowerCase() : c.toUpperCase()).join(''); }
  root.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click', ()=>{
    const s = inp.value; const t = b.dataset.case;
    out.textContent = ({
      'UPPERCASE': s.toUpperCase(), 'lowercase': s.toLowerCase(), 'Title Case': toTitle(s),
      'Sentence case': toSentence(s), 'camelCase': toCamel(s), 'PascalCase': toPascal(s),
      'snake_case': toSnake(s), 'kebab-case': toKebab(s), 'aLtErNaTiNg': toAlt(s)
    })[t] || '';
  }));
});

txt('Basic Tools','findreplace','Find & Replace', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="frIn"></textarea></div>
    <div class="row">
      <div class="field"><label>Find</label><input type="text" id="frFind"></div>
      <div class="field"><label>Replace with</label><input type="text" id="frRep"></div>
    </div>
    <div class="row" style="align-items:center">
      <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft)"><input type="checkbox" id="frCase"> Case sensitive</label>
      <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft)"><input type="checkbox" id="frRegex"> Treat find as regex</label>
    </div>
    <div class="segrow"><button class="btn primary" id="frGo">Replace all</button></div>
    <div class="output" id="frOut">Result will appear here.</div>`;
  root.querySelector('#frGo').addEventListener('click', ()=>{
    const s = root.querySelector('#frIn').value;
    const find = root.querySelector('#frFind').value;
    const rep = root.querySelector('#frRep').value;
    const cs = root.querySelector('#frCase').checked;
    const isRegex = root.querySelector('#frRegex').checked;
    const out = root.querySelector('#frOut');
    if(!find){ out.textContent = 'Enter something to find first.'; return; }
    try{
      let re;
      if(isRegex) re = new RegExp(find, 'g'+(cs?'':'i'));
      else re = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g'+(cs?'':'i'));
      out.textContent = s.replace(re, rep);
    }catch(e){ out.textContent = 'Invalid pattern: '+e.message; }
  });
});

txt('Basic Tools','sortlines','Sort Lines', root=>{
  root.innerHTML = `
    <div class="field"><label>Text (one item per line)</label><textarea id="slIn"></textarea></div>
    <div class="segrow">
      <button class="btn" data-s="az">A → Z</button>
      <button class="btn" data-s="za">Z → A</button>
      <button class="btn" data-s="len">By length</button>
      <button class="btn" data-s="shuffle">Shuffle</button>
      <button class="btn" data-s="dedupe">Remove duplicates</button>
    </div>
    <div class="output" id="slOut">Result will appear here.</div>`;
  root.querySelectorAll('[data-s]').forEach(b=>b.addEventListener('click', ()=>{
    let lines = root.querySelector('#slIn').value.split('\n');
    const t = b.dataset.s;
    if(t==='az') lines.sort((a,b2)=>a.localeCompare(b2));
    else if(t==='za') lines.sort((a,b2)=>b2.localeCompare(a));
    else if(t==='len') lines.sort((a,b2)=>a.length-b2.length);
    else if(t==='shuffle'){ for(let i=lines.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [lines[i],lines[j]]=[lines[j],lines[i]]; } }
    else if(t==='dedupe') lines = [...new Set(lines)];
    root.querySelector('#slOut').textContent = lines.join('\n');
  }));
});

txt('Basic Tools','textcounter','Text Counter', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="tctIn" placeholder="Start typing to see live counts..."></textarea></div>
    <table class="mono" id="tctOut">
      <tr><td>Characters (with spaces)</td><td id="c1">0</td></tr>
      <tr><td>Characters (no spaces)</td><td id="c2">0</td></tr>
      <tr><td>Words</td><td id="c3">0</td></tr>
      <tr><td>Sentences</td><td id="c4">0</td></tr>
      <tr><td>Lines</td><td id="c5">0</td></tr>
      <tr><td>Paragraphs</td><td id="c6">0</td></tr>
      <tr><td>Reading time (~200 wpm)</td><td id="c7">0 sec</td></tr>
    </table>`;
  const inp = root.querySelector('#tctIn');
  inp.addEventListener('input', ()=>{
    const s = inp.value;
    const words = (s.match(/\S+/g)||[]).length;
    root.querySelector('#c1').textContent = s.length;
    root.querySelector('#c2').textContent = s.replace(/\s/g,'').length;
    root.querySelector('#c3').textContent = words;
    root.querySelector('#c4').textContent = (s.match(/[.!?]+(?=\s|$)/g)||[]).length;
    root.querySelector('#c5').textContent = s===''?0:s.split('\n').length;
    root.querySelector('#c6').textContent = (s.split(/\n\s*\n/).filter(p=>p.trim())).length;
    const secs = Math.round(words/200*60);
    root.querySelector('#c7').textContent = secs<60? secs+' sec' : Math.floor(secs/60)+' min '+(secs%60)+' sec';
  });
});

txt('Basic Tools','repeattext','Repeat Text', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="rtIn"></textarea></div>
    <div class="row">
      <div class="field"><label>Repeat count</label><input type="number" id="rtCount" value="3" min="1" max="1000"></div>
      <div class="field"><label>Separator</label><select id="rtSep"><option value="\\n">New line</option><option value=" ">Space</option><option value=",">Comma</option><option value="">None</option></select></div>
    </div>
    <div class="segrow"><button class="btn primary" id="rtGo">Repeat</button></div>
    <div class="output" id="rtOut">Result will appear here.</div>`;
  root.querySelector('#rtGo').addEventListener('click', ()=>{
    const s = root.querySelector('#rtIn').value;
    const n = parseInt(root.querySelector('#rtCount').value)||1;
    const sepRaw = root.querySelector('#rtSep').value;
    const sep = sepRaw==='\\n' ? '\n' : sepRaw;
    root.querySelector('#rtOut').textContent = Array(n).fill(s).join(sep);
  });
});

/* -- Remove Tools -- */
txt('Remove Tools','rmspaces','Remove White Spaces', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="wsIn"></textarea></div>
    <div class="segrow">
      <button class="btn" data-w="trim">Trim ends only</button>
      <button class="btn" data-w="collapse">Collapse multiple → single</button>
      <button class="btn" data-w="all">Remove all spaces</button>
    </div>
    <div class="output" id="wsOut">Result will appear here.</div>`;
  root.querySelectorAll('[data-w]').forEach(b=>b.addEventListener('click', ()=>{
    const s = root.querySelector('#wsIn').value;
    const t = b.dataset.w;
    let r = t==='trim'? s.trim() : t==='collapse'? s.replace(/[ \t]+/g,' ') : s.replace(/\s+/g,'');
    root.querySelector('#wsOut').textContent = r;
  }));
});

txt('Remove Tools','rmempty','Remove Empty Lines', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="reIn"></textarea></div>
    <div class="segrow"><button class="btn primary" id="reGo">Remove empty lines</button></div>
    <div class="output" id="reOut">Result will appear here.</div>`;
  root.querySelector('#reGo').addEventListener('click', ()=>{
    root.querySelector('#reOut').textContent = root.querySelector('#reIn').value.split('\n').filter(l=>l.trim()!=='').join('\n');
  });
});

txt('Remove Tools','rmduplines','Remove Duplicate Lines', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="rdIn"></textarea></div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="rdCase" checked> Case sensitive</label>
    <div class="segrow"><button class="btn primary" id="rdGo">Remove duplicate lines</button></div>
    <div class="output" id="rdOut">Result will appear here.</div>`;
  root.querySelector('#rdGo').addEventListener('click', ()=>{
    const cs = root.querySelector('#rdCase').checked;
    const lines = root.querySelector('#rdIn').value.split('\n');
    const seen = new Set(); const res=[];
    lines.forEach(l=>{ const key = cs? l : l.toLowerCase(); if(!seen.has(key)){ seen.add(key); res.push(l);} });
    root.querySelector('#rdOut').textContent = res.join('\n');
  });
});

txt('Remove Tools','rmdupwords','Remove Duplicate Words', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="rwIn"></textarea></div>
    <div class="segrow"><button class="btn primary" id="rwGo">Remove duplicate words</button></div>
    <div class="output" id="rwOut">Result will appear here.</div>`;
  root.querySelector('#rwGo').addEventListener('click', ()=>{
    const out = root.querySelector('#rwIn').value.split('\n').map(line=>{
      const seen = new Set();
      return line.split(/\s+/).filter(w=>{
        if(w==='') return false;
        const k = w.toLowerCase();
        if(seen.has(k)) return false;
        seen.add(k); return true;
      }).join(' ');
    }).join('\n');
    root.querySelector('#rwOut').textContent = out;
  });
});

txt('Remove Tools','rmbreaklines','Remove Break Lines', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="rbIn"></textarea></div>
    <div class="field"><label>Replace line breaks with</label><input type="text" id="rbSep" value=" "></div>
    <div class="segrow"><button class="btn primary" id="rbGo">Remove line breaks</button></div>
    <div class="output" id="rbOut">Result will appear here.</div>`;
  root.querySelector('#rbGo').addEventListener('click', ()=>{
    root.querySelector('#rbOut').textContent = root.querySelector('#rbIn').value.split('\n').join(root.querySelector('#rbSep').value);
  });
});

/* -- Edit Tools -- */
txt('Edit Tools','affix','Suffix/Prefix', root=>{
  root.innerHTML = `
    <div class="field"><label>Text (one item per line)</label><textarea id="afIn"></textarea></div>
    <div class="row">
      <div class="field"><label>Prefix</label><input type="text" id="afPre" placeholder="e.g. - "></div>
      <div class="field"><label>Suffix</label><input type="text" id="afSuf" placeholder="e.g. ;"></div>
    </div>
    <div class="segrow"><button class="btn primary" id="afGo">Apply</button></div>
    <div class="output" id="afOut">Result will appear here.</div>`;
  root.querySelector('#afGo').addEventListener('click', ()=>{
    const pre = root.querySelector('#afPre').value, suf = root.querySelector('#afSuf').value;
    root.querySelector('#afOut').textContent = root.querySelector('#afIn').value.split('\n').map(l=>pre+l+suf).join('\n');
  });
});

txt('Edit Tools','numberlines','Add Numbers To Lines', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="nlIn"></textarea></div>
    <div class="row">
      <div class="field"><label>Start at</label><input type="number" id="nlStart" value="1"></div>
      <div class="field"><label>Format</label><select id="nlFmt"><option value="1.">1.</option><option value="1)">1)</option><option value="[1]">[1]</option><option value="1 -">1 -</option></select></div>
    </div>
    <div class="segrow"><button class="btn primary" id="nlGo">Add numbers</button></div>
    <div class="output" id="nlOut">Result will appear here.</div>`;
  root.querySelector('#nlGo').addEventListener('click', ()=>{
    let n = parseInt(root.querySelector('#nlStart').value)||1;
    const fmt = root.querySelector('#nlFmt').value;
    root.querySelector('#nlOut').textContent = root.querySelector('#nlIn').value.split('\n').map(l=>{
      const label = fmt==='1.'? n+'.' : fmt==='1)'? n+')' : fmt==='[1]'? '['+n+']' : n+' -';
      n++; return label+' '+l;
    }).join('\n');
  });
});

txt('Edit Tools','reversetext','Reverse Text', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="rtxIn"></textarea></div>
    <div class="output" id="rtxOut">Result will appear here.</div>`;
  root.querySelector('#rtxIn').addEventListener('input', e=>{ root.querySelector('#rtxOut').textContent = e.target.value.split('').reverse().join(''); });
});

txt('Edit Tools','reverselines','Reverse Lines', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="rlIn"></textarea></div>
    <div class="output" id="rlOut">Result will appear here.</div>`;
  root.querySelector('#rlIn').addEventListener('input', e=>{ root.querySelector('#rlOut').textContent = e.target.value.split('\n').reverse().join('\n'); });
});

txt('Edit Tools','reversewords','Reverse Words', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="rwdIn"></textarea></div>
    <div class="output" id="rwdOut">Result will appear here.</div>`;
  root.querySelector('#rwdIn').addEventListener('input', e=>{ root.querySelector('#rwdOut').textContent = e.target.value.split(/\s+/).reverse().join(' '); });
});

txt('Edit Tools','addbreaklines','Add Break Lines', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="abIn"></textarea></div>
    <div class="field"><label>Break after every N characters</label><input type="number" id="abN" value="40" min="1"></div>
    <div class="segrow"><button class="btn primary" id="abGo">Add breaks</button></div>
    <div class="output" id="abOut">Result will appear here.</div>`;
  root.querySelector('#abGo').addEventListener('click', ()=>{
    const s = root.querySelector('#abIn').value; const n = parseInt(root.querySelector('#abN').value)||40;
    const out=[]; for(let i=0;i<s.length;i+=n) out.push(s.slice(i,i+n));
    root.querySelector('#abOut').textContent = out.join('\n');
  });
});

/* -- Stylish Tools -- */
const UNI_STYLES = {
  'Bold': mapUnicode(0x1D400,0x1D41A,0x1D7CE),
  'Italic': mapUnicode(0x1D434,0x1D44E,null,{'h':'\u210E'}),
  'Bold Italic': mapUnicode(0x1D468,0x1D482,null),
  'Script': mapUnicode(0x1D49C,0x1D4B6,null,{},{B:'\u212C',E:'\u2130',F:'\u2131',H:'\u210B',I:'\u2110',L:'\u2112',M:'\u2133',R:'\u211B',e:'\u212F',g:'\u210A',o:'\u2134'}),
  'Double-Struck': mapUnicode(0x1D538,0x1D552,0x1D7D8,{},{C:'\u2102',H:'\u210D',N:'\u2115',P:'\u2119',Q:'\u211A',R:'\u211D',Z:'\u2124'}),
  'Monospace': mapUnicode(0x1D670,0x1D68A,0x1D7F6),
  'Sans Bold': mapUnicode(0x1D5D4,0x1D5EE,0x1D7EC),
  'Circled': mapUnicode(0x24B6,0x24D0,null,{},{},'circled'),
  'Fullwidth': mapUnicode(null,null,null,{},{},'fullwidth'),
};
function mapUnicode(upBase, lowBase, digBase, exSpecific, exMap, special){
  return function(ch){
    if(special==='circled'){
      if(/[A-Z]/.test(ch)) return String.fromCodePoint(0x24B6 + ch.charCodeAt(0)-65);
      if(/[a-z]/.test(ch)) return String.fromCodePoint(0x24D0 + ch.charCodeAt(0)-97);
      if(ch==='0') return '\u24EA';
      if(/[1-9]/.test(ch)) return String.fromCodePoint(0x2460 + ch.charCodeAt(0)-49);
      return ch;
    }
    if(special==='fullwidth'){
      if(ch===' ') return '\u3000';
      const c = ch.charCodeAt(0);
      if(c>=0x21 && c<=0x7E) return String.fromCodePoint(c+0xFEE0);
      return ch;
    }
    if(exMap && exMap[ch]) return exMap[ch];
    if(/[A-Z]/.test(ch) && upBase!==null) return String.fromCodePoint(upBase + ch.charCodeAt(0)-65);
    if(/[a-z]/.test(ch) && lowBase!==null) return String.fromCodePoint(lowBase + ch.charCodeAt(0)-97);
    if(/[0-9]/.test(ch) && digBase!==null) return String.fromCodePoint(digBase + ch.charCodeAt(0)-48);
    return ch;
  };
}
txt('Stylish Tools','stylishfont','Stylish Font', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="sfIn" placeholder="Type text..."></textarea></div>
    <div id="sfOutputs"></div>`;
  const box = root.querySelector('#sfOutputs');
  function render(){
    const s = root.querySelector('#sfIn').value;
    box.innerHTML = Object.keys(UNI_STYLES).map(name=>{
      const styled = s.split('').map(UNI_STYLES[name]).join('');
      return `<div class="field"><label>${name}</label><div class="output" style="margin-top:0;cursor:pointer" data-copy="${encodeURIComponent(styled)}">${styled||'—'}</div></div>`;
    }).join('');
    box.querySelectorAll('[data-copy]').forEach(el=>el.addEventListener('click', ()=>{
      navigator.clipboard && navigator.clipboard.writeText(decodeURIComponent(el.dataset.copy)).catch(()=>{});
    }));
  }
  root.querySelector('#sfIn').addEventListener('input', render);
  render();
});

txt('Stylish Tools','textdecoration','Text Decoration', root=>{
  const templates = ['★ {t} ★','✦ {t} ✦','『{t}』','「{t}」','▬▬▬ {t} ▬▬▬','~*~ {t} ~*~','◤{t}◢','☆⌒{t}⌒☆','◈{t}◈','▁▂▃ {t} ▃▂▁','x═══════ {t} ═══════x','•.¸¸.•´´¯`••.¸¸.•\u2192{t}'];
  root.innerHTML = `<div class="field"><label>Text</label><input type="text" id="tdIn" placeholder="Your text"></div><div id="tdOut"></div>`;
  const box = root.querySelector('#tdOut');
  function render(){
    const s = root.querySelector('#tdIn').value || 'your text';
    box.innerHTML = templates.map(t=>`<div class="output" style="cursor:pointer" data-copy="${encodeURIComponent(t.replace('{t}',s))}">${escapeHtml(t.replace('{t}',s))}</div>`).join('');
    box.querySelectorAll('[data-copy]').forEach(el=>el.addEventListener('click', ()=>{
      navigator.clipboard && navigator.clipboard.writeText(decodeURIComponent(el.dataset.copy)).catch(()=>{});
    }));
  }
  root.querySelector('#tdIn').addEventListener('input', render);
  render();
});

txt('Stylish Tools','kaomoji','Japanese Emotion', root=>{
  const groups = {
    'Happy': ['(^_^)','(^o^)','＼(^o^)／','(≧▽≦)','(*^▽^*)','ヽ(=^･ω･^=)丿'],
    'Sad': ['(T_T)','(;_;)','(╥﹏╥)','(っ˘̩╭╮˘̩)っ'],
    'Love': ['(♡°▽°♡)','(●♡∀♡)','♡(˘▽˘)♡'],
    'Angry': ['(≧д≦)','(╬ Ò﹏Ó)','ヽ(`Д´)ﾉ'],
    'Shrug': ['¯\\_(ツ)_/¯','(・_・)ヾ'],
    'Confused': ['(◎_◎;)','(・・?)'],
    'Surprise': ['(ﾟoﾟ)','Σ(ﾟДﾟ)'],
    'Table flip': ['(╯°□°）╯︵ ┻━┻','┬─┬ ノ( ゜-゜ノ)'],
  };
  root.innerHTML = Object.entries(groups).map(([name,list])=>`
    <div class="section-label" style="margin:22px 2px 10px">${name}</div>
    <div class="grid">${list.map(k=>`<button class="tag" style="--c:var(--accent)" data-copy="${encodeURIComponent(k)}"><div class="hole"></div><div style="font-size:18px;text-align:center;width:100%">${k}</div></button>`).join('')}</div>
  `).join('');
  root.querySelectorAll('[data-copy]').forEach(el=>el.addEventListener('click', ()=>{
    navigator.clipboard && navigator.clipboard.writeText(decodeURIComponent(el.dataset.copy)).catch(()=>{});
  }));
});

txt('Stylish Tools','bigtext','Big Text', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><input type="text" id="btIn" placeholder="Type text..."></div>
    <div class="output" id="btOut" style="font-size:22px;letter-spacing:2px">—</div>
    <div class="hint">Uses fullwidth Unicode characters — renders larger in most fonts, no image needed.</div>`;
  const map = UNI_STYLES['Fullwidth'];
  root.querySelector('#btIn').addEventListener('input', e=>{
    root.querySelector('#btOut').textContent = e.target.value.split('').map(map).join('') || '—';
  });
});

txt('Stylish Tools','texttoemoji','Text To Emoji', root=>{
  const dict = {love:'❤️',happy:'😄',sad:'😢',cat:'🐱',dog:'🐶',sun:'☀️',moon:'🌙',star:'⭐',fire:'🔥',food:'🍽️',coffee:'☕',pizza:'🍕',music:'🎵',heart:'❤️',smile:'😊',laugh:'😂',cry:'😭',angry:'😠',cool:'😎',party:'🎉',birthday:'🎂',gift:'🎁',money:'💰',book:'📚',car:'🚗',phone:'📱',computer:'💻',rain:'🌧️',snow:'❄️',tree:'🌳',flower:'🌸',baby:'👶',king:'👑',queen:'👑',rocket:'🚀',earth:'🌍',water:'💧',time:'⏰',idea:'💡',ok:'👍',no:'👎',win:'🏆',run:'🏃',sleep:'😴',hot:'🥵',cold:'🥶',ghost:'👻',skull:'💀',eye:'👁️',thanks:'🙏'};
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="teIn" placeholder="e.g. I love coffee and music"></textarea></div>
    <div class="output" id="teOut">Result will appear here.</div>
    <div class="hint">Replaces recognized keywords (love, happy, cat, coffee, fire, party...) with emoji.</div>`;
  root.querySelector('#teIn').addEventListener('input', e=>{
    const out = e.target.value.replace(/[a-zA-Z']+/g, w=>{
      const k = w.toLowerCase();
      return dict[k] ? w+dict[k] : w;
    });
    root.querySelector('#teOut').textContent = out || '—';
  });
});

/* -- Ciphers & Encoding -- */
txt('Ciphers & Encoding','caesar','Caesar Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="caIn"></textarea></div>
    <div class="field"><label>Shift</label><input type="number" id="caShift" value="3"></div>
    <div class="segrow"><button class="btn primary" id="caEnc">Encode</button><button class="btn" id="caDec">Decode</button><button class="btn" id="caBrute">Try all shifts</button></div>
    <div class="output" id="caOut">Result will appear here.</div>`;
  function shiftText(s, n){
    n = ((n%26)+26)%26;
    return s.replace(/[a-zA-Z]/g, c=>{
      const base = c<='Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0)-base+n)%26+base);
    });
  }
  root.querySelector('#caEnc').addEventListener('click', ()=>{ root.querySelector('#caOut').textContent = shiftText(root.querySelector('#caIn').value, +root.querySelector('#caShift').value); });
  root.querySelector('#caDec').addEventListener('click', ()=>{ root.querySelector('#caOut').textContent = shiftText(root.querySelector('#caIn').value, -root.querySelector('#caShift').value); });
  root.querySelector('#caBrute').addEventListener('click', ()=>{
    const s = root.querySelector('#caIn').value;
    root.querySelector('#caOut').textContent = Array.from({length:26},(_,n)=>`${n}: ${shiftText(s,n)}`).join('\n');
  });
});

txt('Ciphers & Encoding','slugify','Slugify', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><input type="text" id="slIn2" placeholder="My Blog Post Title!"></div>
    <div class="output" id="slOut2">—</div>`;
  root.querySelector('#slIn2').addEventListener('input', e=>{
    const slug = e.target.value.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
    root.querySelector('#slOut2').textContent = slug || '—';
  });
});

txt('Ciphers & Encoding','natophonetic','NATO Phonetic Alphabet', root=>{
  const NATO = {A:'Alfa',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliett',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu'};
  root.innerHTML = `<div class="field"><label>Text</label><input type="text" id="npIn" placeholder="e.g. SOS"></div>
    <div class="output" id="npOut">—</div>`;
  root.querySelector('#npIn').addEventListener('input', e=>{
    const out = e.target.value.toUpperCase().split('').map(c=> NATO[c] || (c===' '?'/':c)).join(' ');
    root.querySelector('#npOut').textContent = out || '—';
  });
});

txt('Ciphers & Encoding','leetspeak','Leet Speak', root=>{
  const MAP = {a:'4',e:'3',i:'1',o:'0',s:'5',t:'7',l:'1',g:'9',b:'8'};
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="lsIn"></textarea></div>
    <div class="output" id="lsOut">Result will appear here.</div>`;
  root.querySelector('#lsIn').addEventListener('input', e=>{
    root.querySelector('#lsOut').textContent = e.target.value.toLowerCase().split('').map(c=>MAP[c]||c).join('') || '—';
  });
});

txt('Ciphers & Encoding','texthex','Text ↔ Hex', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="thIn"></textarea></div>
    <div class="segrow"><button class="btn primary" id="thEnc">Text → Hex</button><button class="btn" id="thDec">Hex → Text</button></div>
    <div class="output" id="thOut">Result will appear here.</div>`;
  root.querySelector('#thEnc').addEventListener('click', ()=>{
    const bytes = new TextEncoder().encode(root.querySelector('#thIn').value);
    root.querySelector('#thOut').textContent = [...bytes].map(b=>b.toString(16).padStart(2,'0')).join(' ');
  });
  root.querySelector('#thDec').addEventListener('click', ()=>{
    try{
      const bytes = root.querySelector('#thIn').value.trim().split(/\s+/).map(h=>parseInt(h,16));
      root.querySelector('#thOut').textContent = new TextDecoder().decode(new Uint8Array(bytes));
    }catch(e){ root.querySelector('#thOut').textContent = 'Invalid hex.'; }
  });
});

txt('Ciphers & Encoding','textbinary','Text ↔ Binary', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="tbIn"></textarea></div>
    <div class="segrow"><button class="btn primary" id="tbEnc">Text → Binary</button><button class="btn" id="tbDec">Binary → Text</button></div>
    <div class="output" id="tbOut">Result will appear here.</div>`;
  root.querySelector('#tbEnc').addEventListener('click', ()=>{
    const bytes = new TextEncoder().encode(root.querySelector('#tbIn').value);
    root.querySelector('#tbOut').textContent = [...bytes].map(b=>b.toString(2).padStart(8,'0')).join(' ');
  });
  root.querySelector('#tbDec').addEventListener('click', ()=>{
    try{
      const bytes = root.querySelector('#tbIn').value.trim().split(/\s+/).map(b=>parseInt(b,2));
      root.querySelector('#tbOut').textContent = new TextDecoder().decode(new Uint8Array(bytes));
    }catch(e){ root.querySelector('#tbOut').textContent = 'Invalid binary.'; }
  });
});

txt('Ciphers & Encoding','randomstring','Random String Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>Length</label><input type="number" id="rsLen" value="12" min="1" max="500"></div>
    <div class="field"><label>Character set</label><input type="text" id="rsSet" value="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"></div>
    <div class="segrow"><button class="btn primary" id="rsGo">Generate</button></div>
    <div class="output" id="rsOut">Result will appear here.</div>`;
  root.querySelector('#rsGo').addEventListener('click', ()=>{
    const len = +root.querySelector('#rsLen').value||12;
    const set = root.querySelector('#rsSet').value || 'abc';
    const arr = new Uint32Array(len); crypto.getRandomValues(arr);
    root.querySelector('#rsOut').textContent = Array.from(arr, n=>set[n%set.length]).join('');
  });
});

txt('Ciphers & Encoding','striphtml','Strip HTML Tags', root=>{
  root.innerHTML = `<div class="field"><label>HTML</label><textarea id="shIn" placeholder="<p>Hello <b>world</b></p>"></textarea></div>
    <div class="output" id="shOut">Result will appear here.</div>`;
  root.querySelector('#shIn').addEventListener('input', e=>{
    const div = document.createElement('div');
    div.innerHTML = e.target.value;
    root.querySelector('#shOut').textContent = div.textContent || '—';
  });
});

txt('Ciphers & Encoding','charfreq','Char Frequency', root=>{
  root.innerHTML = `<div class="field"><label>Text</label><textarea id="cfIn"></textarea></div>
    <table class="mono" id="cfOut"></table>`;
  root.querySelector('#cfIn').addEventListener('input', e=>{
    const s = e.target.value;
    const freq = {};
    for(const c of s){ if(c.trim()==='') continue; freq[c]=(freq[c]||0)+1; }
    const rows = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,30);
    root.querySelector('#cfOut').innerHTML = rows.map(([c,n])=>`<tr><td>${escapeHtml(c)}</td><td>${n}</td></tr>`).join('');
  });
});

txt('Ciphers & Encoding','textsplitter','Text Splitter', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="tsIn"></textarea></div>
    <div class="field"><label>Delimiter</label><input type="text" id="tsDelim" value=","></div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="tsTrim" checked> Trim whitespace from each item</label>
    <div class="segrow"><button class="btn primary" id="tsGo">Split</button></div>
    <div class="output" id="tsOut">Result will appear here.</div>`;
  root.querySelector('#tsGo').addEventListener('click', ()=>{
    const delim = root.querySelector('#tsDelim').value || ',';
    let parts = root.querySelector('#tsIn').value.split(delim);
    if(root.querySelector('#tsTrim').checked) parts = parts.map(p=>p.trim());
    root.querySelector('#tsOut').textContent = parts.map((p,i)=>`${i+1}. ${p}`).join('\n');
  });
});

const ASCII_FONT = {
' ':['     ','     ','     ','     ','     '],
'A':[' ### ','#   #','#####','#   #','#   #'],'B':['#### ','#   #','#### ','#   #','#### '],
'C':[' ####','#    ','#    ','#    ',' ####'],'D':['#### ','#   #','#   #','#   #','#### '],
'E':['#####','#    ','#### ','#    ','#####'],'F':['#####','#    ','#### ','#    ','#    '],
'G':[' ####','#    ','#  ##','#   #',' ####'],'H':['#   #','#   #','#####','#   #','#   #'],
'I':['#####','  #  ','  #  ','  #  ','#####'],'J':['   ##','    #','    #','#   #',' ### '],
'K':['#   #','#  # ','###  ','#  # ','#   #'],'L':['#    ','#    ','#    ','#    ','#####'],
'M':['#   #','## ##','# # #','#   #','#   #'],'N':['#   #','##  #','# # #','#  ##','#   #'],
'O':[' ### ','#   #','#   #','#   #',' ### '],'P':['#### ','#   #','#### ','#    ','#    '],
'Q':[' ### ','#   #','# # #','#  # ',' ## #'],'R':['#### ','#   #','#### ','#  # ','#   #'],
'S':[' ####','#    ',' ### ','    #','#### '],'T':['#####','  #  ','  #  ','  #  ','  #  '],
'U':['#   #','#   #','#   #','#   #',' ### '],'V':['#   #','#   #','#   #',' # # ','  #  '],
'W':['#   #','#   #','# # #','## ##','#   #'],'X':['#   #',' # # ','  #  ',' # # ','#   #'],
'Y':['#   #',' # # ','  #  ','  #  ','  #  '],'Z':['#####','   # ','  #  ',' #   ','#####'],
'0':[' ### ','#  ##','# # #','##  #',' ### '],'1':['  #  ',' ##  ','  #  ','  #  ','#####'],
'2':[' ### ','#   #','   # ','  #  ','#####'],'3':['#####','   # ','  ## ','   # ','#####'],
'4':['#  # ','#  # ','#####','   # ','   # '],'5':['#####','#    ','#### ','    #','#### '],
'6':[' ####','#    ','#### ','#   #',' ### '],'7':['#####','    #','   # ','  #  ','  #  '],
'8':[' ### ','#   #',' ### ','#   #',' ### '],'9':[' ### ','#   #',' ####','    #',' ### '],
'!':['  #  ','  #  ','  #  ','     ','  #  '],'?':[' ### ','#   #','   ##','     ','  #  '],
'.':['     ','     ','     ','     ','  ## '],',':['     ','     ','     ','  ## ','  #  '],
};
txt('Ciphers & Encoding','asciibanner','ASCII Art Banner', root=>{
  root.innerHTML = `<div class="field"><label>Text (A-Z, 0-9, basic punctuation)</label><input type="text" id="abIn2" value="HELLO" maxlength="20"></div>
    <div class="output" id="abOut2" style="white-space:pre;overflow-x:auto">—</div>`;
  root.querySelector('#abIn2').addEventListener('input', e=>{
    const chars = e.target.value.toUpperCase().split('').map(c=>ASCII_FONT[c]||ASCII_FONT[' ']);
    if(!chars.length){ root.querySelector('#abOut2').textContent='—'; return; }
    const rows = [0,1,2,3,4].map(r=> chars.map(c=>c[r]).join(' '));
    root.querySelector('#abOut2').textContent = rows.join('\n');
  });
  root.querySelector('#abIn2').dispatchEvent(new Event('input'));
});

const BRAILLE_MAP = {
  a:'\u2801',b:'\u2803',c:'\u2809',d:'\u2819',e:'\u2811',f:'\u280B',g:'\u281B',h:'\u2813',i:'\u280A',j:'\u281A',
  k:'\u2805',l:'\u2807',m:'\u280D',n:'\u281D',o:'\u2815',p:'\u280F',q:'\u281F',r:'\u2817',s:'\u280E',t:'\u281E',
  u:'\u2825',v:'\u2827',w:'\u283A',x:'\u282D',y:'\u283D',z:'\u2835',' ':'\u2800',
  '.':'\u2832',',':'\u2802','?':'\u2826','!':'\u2816',"'":'\u2804','-':'\u2824'
};
const BRAILLE_DIGIT_SIGN = '\u283C';
const BRAILLE_DIGITS = {1:'a',2:'b',3:'c',4:'d',5:'e',6:'f',7:'g',8:'h',9:'i',0:'j'};
const BRAILLE_REV = Object.fromEntries(Object.entries(BRAILLE_MAP).map(([k,v])=>[v,k]));
txt('Ciphers & Encoding','braille','Braille Translator', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="brIn" placeholder="Type text, lowercase letters, digits, basic punctuation..."></textarea></div>
    <div class="segrow"><button class="btn primary" id="brEnc">Text → Braille</button><button class="btn" id="brDec">Braille → Text</button></div>
    <div class="output" id="brOut2" style="font-size:22px">Result will appear here.</div>
    <div class="hint">Grade 1 (uncontracted) English Braille — one cell per letter, no contractions.</div>`;
  root.querySelector('#brEnc').addEventListener('click', ()=>{
    let out = '';
    for(const ch of root.querySelector('#brIn').value.toLowerCase()){
      if(/[0-9]/.test(ch)){ out += BRAILLE_DIGIT_SIGN + BRAILLE_MAP[BRAILLE_DIGITS[ch]]; }
      else out += BRAILLE_MAP[ch] || ch;
    }
    root.querySelector('#brOut2').textContent = out || '—';
  });
  root.querySelector('#brDec').addEventListener('click', ()=>{
    let out = ''; let digitMode=false;
    for(const ch of root.querySelector('#brIn').value){
      if(ch===BRAILLE_DIGIT_SIGN){ digitMode=true; continue; }
      const letter = BRAILLE_REV[ch];
      if(letter===undefined){ out+=ch; digitMode=false; continue; }
      if(digitMode && /[a-j]/.test(letter)){
        const digit = Object.entries(BRAILLE_DIGITS).find(([d,l])=>l===letter)[0];
        out += digit; digitMode=false;
      } else { out += letter; digitMode=false; }
    }
    root.querySelector('#brOut2').textContent = out || '—';
  });
});

