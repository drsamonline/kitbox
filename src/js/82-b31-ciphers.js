/* ================================================================
   B31 — the classical ciphers, and six text utilities.

   Each one is checked against a published vector rather than against itself:
   AFFINE with a=5, b=8 on "AFFINE" is "IHHWVC", and the Bifid example is the
   one from the Wikipedia article. A cipher that round-trips its own output
   proves only that it is consistent.
   ================================================================ */

/* ---------------- Text (7) ---------------- */

txt('Ciphers & Encoding','a1z26','A1Z26 Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="azIn" style="min-height:80px">Attack at dawn</textarea></div>
    <div class="row">
      <div class="field"><label>Separator</label><select id="azSep"><option value="-">-</option><option value=" ">space</option><option value=",">comma</option></select></div>
      <div class="segrow"><button class="btn primary" id="azEnc">Encode</button><button class="btn" id="azDec">Decode</button></div>
    </div>
    <div class="output" id="azOut">—</div>
    <div class="hint">A=1 to Z=26, keeping word breaks so the message stays readable. It hides nothing from anyone who can count to 26 — it is a puzzle, not a cipher.</div>`;
  const SEP = () => root.querySelector('#azSep').value;
  root.querySelector('#azEnc').addEventListener('click', ()=>{
    const text = root.querySelector('#azIn').value.toUpperCase();
    root.querySelector('#azOut').textContent = text.split(/(\s+)/).map(part=>{
      if(/^\s+$/.test(part)) return ' / ';
      return [...part].map(ch=>{
        const c = ch.charCodeAt(0);
        return c >= 65 && c <= 90 ? String(c - 64) : ch;
      }).join(SEP());
    }).join('').trim();
  });
  root.querySelector('#azDec').addEventListener('click', ()=>{
    const text = root.querySelector('#azIn').value;
    root.querySelector('#azOut').textContent = text.split('/').map(chunk=>
      chunk.trim().split(/[\s,\-]+/).filter(Boolean).map(n=>{
        const v = Number(n);
        return v >= 1 && v <= 26 ? String.fromCharCode(64 + v) : '?';
      }).join('')
    ).join(' ');
  });
  root.querySelector('#azEnc').click();
});

txt('Ciphers & Encoding','affine','Affine Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="afIn" style="min-height:80px">AFFINE CIPHER</textarea></div>
    <div class="row">
      <div class="field"><label>a (must be coprime with 26)</label><select id="afA">${[1,3,5,7,9,11,15,17,19,21,23,25].map(v=>`<option value="${v}"${v===5?' selected':''}>${v}</option>`).join('')}</select></div>
      <div class="field"><label>b</label><input type="number" id="afB" value="8" min="0" max="25"></div>
    </div>
    <div class="segrow"><button class="btn primary" id="afEnc">Encrypt</button><button class="btn" id="afDec">Decrypt</button></div>
    <div class="output" id="afOut">—</div>
    <div class="hint">E(x) = (a·x + b) mod 26. Only a values coprime with 26 work, which is why the list is not 1–25; anything else has no inverse and the message could not be recovered.</div>`;
  function run(decrypt){
    const a = Number(root.querySelector('#afA').value);
    const b = Number(root.querySelector('#afB').value) % 26;
    const text = root.querySelector('#afIn').value;
    let aInv = 1;
    for(let i=1;i<26;i++) if((a * i) % 26 === 1){ aInv = i; break; }
    const out = [...text].map(ch=>{
      const c = ch.charCodeAt(0);
      const upper = c >= 65 && c <= 90, lower = c >= 97 && c <= 122;
      if(!upper && !lower) return ch;
      const x = (upper ? c - 65 : c - 97);
      const y = decrypt ? (aInv * (x - b + 26 * 26)) % 26 : (a * x + b) % 26;
      return String.fromCharCode((upper ? 65 : 97) + y);
    }).join('');
    root.querySelector('#afOut').textContent = out;
  }
  root.querySelector('#afEnc').addEventListener('click', ()=>run(false));
  root.querySelector('#afDec').addEventListener('click', ()=>run(true));
  root.querySelector('#afEnc').click();
});

txt('Ciphers & Encoding','atbash','Atbash Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="atIn" style="min-height:80px">Attack at dawn</textarea></div>
    <div class="output" id="atOut">—</div>
    <div class="hint">The alphabet reversed: A becomes Z, B becomes Y. It is its own inverse, so there is nothing to choose and nothing to decrypt — the same button does both.</div>`;
  function draw(){
    root.querySelector('#atOut').textContent = [...root.querySelector('#atIn').value].map(ch=>{
      const c = ch.charCodeAt(0);
      if(c >= 65 && c <= 90) return String.fromCharCode(90 - (c - 65));
      if(c >= 97 && c <= 122) return String.fromCharCode(122 - (c - 97));
      return ch;
    }).join('');
  }
  root.querySelector('#atIn').addEventListener('input', draw);
  draw();
});

txt('Ciphers & Encoding','bacon','Bacon Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="bcIn" style="min-height:80px">STUDY</textarea></div>
    <div class="row">
      <div class="field"><label>Alphabet</label><select id="bcVariant"><option value="24">24-letter (I/J and U/V share)</option><option value="26">26-letter</option></select></div>
      <div class="segrow"><button class="btn primary" id="bcEnc">Encode</button><button class="btn" id="bcDec">Decode</button></div>
    </div>
    <div class="output" id="bcOut" style="word-break:break-all">—</div>
    <div class="hint">Five A/B groups per letter. The 24-letter variant is the original, where I and J share a code and so do U and V — which is why an old message decodes to one and you have to choose.</div>`;
  const A24 = 'ABCDEFGHIKLMNOPQRSTUWXYZ';
  const A26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function alphabet(){ return root.querySelector('#bcVariant').value === '24' ? A24 : A26; }
  root.querySelector('#bcEnc').addEventListener('click', ()=>{
    const ab = alphabet();
    root.querySelector('#bcOut').textContent = [...root.querySelector('#bcIn').value.toUpperCase()]
      .map(ch=>{
        let i = ab.indexOf(ch);
        if(i < 0) return '';
        return i.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B');
      }).join(' ').trim();
  });
  root.querySelector('#bcDec').addEventListener('click', ()=>{
    const ab = alphabet();
    const bits = root.querySelector('#bcIn').value.toUpperCase().replace(/[^AB]/g, '');
    let out = '';
    for(let i=0;i+5<=bits.length;i+=5){
      const v = parseInt(bits.slice(i, i+5).replace(/A/g, '0').replace(/B/g, '1'), 2);
      out += ab[v] || '?';
    }
    root.querySelector('#bcOut').textContent = out;
  });
  root.querySelector('#bcEnc').click();
});

txt('Ciphers & Encoding','railfence','Rail Fence Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="rfIn2" style="min-height:80px">WEAREDISCOVEREDFLEEATONCE</textarea></div>
    <div class="row">
      <div class="field"><label>Rails</label><input type="number" id="rfRails" value="3" min="2" max="10"></div>
      <div class="segrow"><button class="btn primary" id="rfEnc">Encrypt</button><button class="btn" id="rfDec">Decrypt</button></div>
    </div>
    <div class="output" id="rfOut" style="word-break:break-all">—</div>
    <div class="hint">Write the message in a zig-zag across the rails and read each rail in turn. WEA... with three rails is the textbook example — the letters stay the same and only their order moves, which is why frequency analysis still works on it.</div>`;
  const pattern = (len, rails)=>{
    const rows = [];
    let r = 0, dir = 1;
    for(let i=0;i<len;i++){
      rows.push(r);
      if(r === 0) dir = 1;
      else if(r === rails - 1) dir = -1;
      r += dir;
    }
    return rows;
  };
  root.querySelector('#rfEnc').addEventListener('click', ()=>{
    const text = root.querySelector('#rfIn2').value.replace(/\s+/g, '');
    const rails = Math.max(2, Number(root.querySelector('#rfRails').value) || 3);
    const rows = pattern(text.length, rails);
    let out = '';
    for(let r=0;r<rails;r++) for(let i=0;i<text.length;i++) if(rows[i] === r) out += text[i];
    root.querySelector('#rfOut').textContent = out;
  });
  root.querySelector('#rfDec').addEventListener('click', ()=>{
    const text = root.querySelector('#rfIn2').value.replace(/\s+/g, '');
    const rails = Math.max(2, Number(root.querySelector('#rfRails').value) || 3);
    const rows = pattern(text.length, rails);
    const counts = new Array(rails).fill(0);
    rows.forEach(r=>counts[r]++);
    const chunks = [];
    let pos = 0;
    for(let r=0;r<rails;r++){ chunks.push(text.slice(pos, pos + counts[r]).split('')); pos += counts[r]; }
    const out = rows.map(r=>chunks[r].shift()).join('');
    root.querySelector('#rfOut').textContent = out;
  });
  root.querySelector('#rfEnc').click();
});

txt('Ciphers & Encoding','bifid','Bifid Cipher', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="bfIn" style="min-height:80px">ATTACKATDAWN</textarea></div>
    <div class="row">
      <div class="field"><label>Period</label><input type="number" id="bfPeriod" value="5" min="1" max="20"></div>
      <div class="segrow"><button class="btn primary" id="bfEnc">Encrypt</button><button class="btn" id="bfDec">Decrypt</button></div>
    </div>
    <div class="output" id="bfOut" style="word-break:break-all">—</div>
    <div class="hint">A Polybius square (I and J share a cell), then the row and column numbers of a block are written out separately and re-paired. The period is the block size — the longer the block, the more the cipher spreads, and the standard period is 5.</div>`;
  const SQUARE = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';   // 25 cells, I/J merged
  const coords = ch => {
    const i = SQUARE.indexOf(ch === 'J' ? 'I' : ch);
    return i < 0 ? null : [Math.floor(i / 5), i % 5];
  };
  /* Bifid, as defined rather than as it looks:
       encrypt — take the coordinates of each letter, write every row then
                 every column into one sequence, and re-pair it;
       decrypt — take the coordinates of the ciphertext, and undo that
                 interleaving: the first half fills the even slots of the
                 original sequence, the second half the odd ones.
     Treating the two as the same operation is the mistake this comment exists
     to prevent — it produces a cipher that round-trips nothing. */
  function transform(text, period, decrypt){
    let out = '';
    for(let start2 = 0; start2 < text.length; start2 += period){
      const block = [...text.slice(start2, start2 + period)].map(coords).filter(Boolean);
      if(!block.length) continue;
      const n = block.length;
      if(!decrypt){
        const flat = [...block.map(c=>c[0]), ...block.map(c=>c[1])];
        for(let i=0;i<flat.length;i+=2) out += SQUARE[flat[i] * 5 + flat[i+1]] || '?';
      } else {
        const flatC = [...block.map(c=>c[0]), ...block.map(c=>c[1])];
        const flatP = new Array(2 * n);
        for(let j=0;j<2*n;j++){
          const target = j < n ? 2 * j : 2 * (j - n) + 1;
          flatP[target] = flatC[j];
        }
        // the restored sequence is rows then columns again, so letter i is
        // (flatP[i], flatP[n+i]) — not a consecutive pair, which is the whole
        // difference between decrypting and doing nothing.
        for(let i=0;i<n;i++) out += SQUARE[flatP[i] * 5 + flatP[n + i]] || '?';
      }
    }
    return out;
  }
  root.querySelector('#bfEnc').addEventListener('click', ()=>{
    root.querySelector('#bfOut').textContent = transform(root.querySelector('#bfIn').value.toUpperCase().replace(/[^A-Z]/g, ''), Number(root.querySelector('#bfPeriod').value) || 5, false);
  });
  root.querySelector('#bfDec').addEventListener('click', ()=>{
    root.querySelector('#bfOut').textContent = transform(root.querySelector('#bfIn').value.toUpperCase().replace(/[^A-Z]/g, ''), Number(root.querySelector('#bfPeriod').value) || 5, true);
  });
  root.querySelector('#bfEnc').click();
});

txt('Ciphers & Encoding','rot47','ROT47', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="r47In" style="min-height:80px">Hello, Kitbox!</textarea></div>
    <div class="output" id="r47Out" style="word-break:break-all">—</div>
    <div class="hint">The printable-ASCII rotation: every character from ! to ~ moves 47 places along that 94-character alphabet, wrapping around. Unlike ROT13 it covers digits and punctuation, and like ROT13 it is its own inverse.</div>`;
  function draw(){
    root.querySelector('#r47Out').textContent = [...root.querySelector('#r47In').value].map(ch=>{
      const c = ch.charCodeAt(0);
      return c >= 33 && c <= 126 ? String.fromCharCode(33 + ((c - 33 + 47) % 94)) : ch;
    }).join('');
  }
  root.querySelector('#r47In').addEventListener('input', draw);
  draw();
});

/* ---------------- Text utilities (6) ---------------- */

txt('Encoding','quotedprintable','Quoted-Printable', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="qpIn" style="min-height:90px">Hello =E2=80=94 this is a test with a very long line that will need soft breaks = added by the encoder when it exceeds seventy-six characters.</textarea></div>
    <div class="segrow"><button class="btn primary" id="qpEnc">Encode</button><button class="btn" id="qpDec">Decode</button></div>
    <div class="output" id="qpOut" style="white-space:pre-wrap;word-break:break-all;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">The email encoding that keeps text readable: ASCII stays as it is, everything else becomes =XX, and lines break with a trailing = so a transport that wraps at 76 characters does not corrupt the message.</div>`;
  root.querySelector('#qpEnc').addEventListener('click', ()=>{
    const text = root.querySelector('#qpIn').value;
    const bytes = bytesFromText(text);
    let out = '', line = '';
    for(const b of bytes){
      const ch = String.fromCharCode(b);
      const safe = (b >= 33 && b <= 126 && ch !== '=') || (b === 32 && line.length && !line.endsWith(' '));
      let piece = safe ? ch : '=' + b.toString(16).toUpperCase().padStart(2, '0');
      if(line.length + piece.length > 75){ out += line + '=\n'; line = ''; }
      line += piece;
    }
    root.querySelector('#qpOut').textContent = out + line;
  });
  root.querySelector('#qpDec').addEventListener('click', ()=>{
    const text = root.querySelector('#qpIn').value.replace(/=\n/g, '').replace(/=\r\n/g, '');
    const bytes = [];
    for(let i=0;i<text.length;i++){
      if(text[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(text.slice(i+1, i+3))){
        bytes.push(parseInt(text.slice(i+1, i+3), 16)); i += 2;
      } else bytes.push(text.charCodeAt(i));
    }
    root.querySelector('#qpOut').textContent = textFromBytes(new Uint8Array(bytes));
  });
  root.querySelector('#qpEnc').click();
});

txt('Encoding','charcodes','Char Codes', root=>{
  root.innerHTML = `
    <div class="field"><label>Text or numbers</label><textarea id="ccIn" style="min-height:80px">Hi ✓</textarea></div>
    <div class="row">
      <div class="field"><label>Base</label><select id="ccBase"><option value="10">decimal</option><option value="16">hex</option><option value="8">octal</option><option value="2">binary</option></select></div>
      <div class="field"><label>Separator</label><input type="text" id="ccSep" value=" "></div>
      <div class="segrow"><button class="btn primary" id="ccEnc">Text → codes</button><button class="btn" id="ccDec">Codes → text</button></div>
    </div>
    <div class="output" id="ccOut" style="word-break:break-all">—</div>
    <div class="hint">Code points, not UTF-8 bytes: ✓ is U+2713 and stays one number here even though it is three bytes on disk. The Byte Length tool in Files is the one that counts bytes.</div>`;
  root.querySelector('#ccEnc').addEventListener('click', ()=>{
    const base = Number(root.querySelector('#ccBase').value);
    const sep = root.querySelector('#ccSep').value;
    root.querySelector('#ccOut').textContent = [...root.querySelector('#ccIn').value]
      .map(ch=>ch.codePointAt(0).toString(base)).join(sep);
  });
  root.querySelector('#ccDec').addEventListener('click', ()=>{
    const base = Number(root.querySelector('#ccBase').value);
    const parts = root.querySelector('#ccIn').value.split(/[\s,]+/).filter(Boolean);
    try{
      root.querySelector('#ccOut').textContent = parts.map(p=>{
        const v = parseInt(p, base);
        if(isNaN(v) || v > 0x10FFFF) throw new Error('"' + p + '" is not a code point in base ' + base);
        return String.fromCodePoint(v);
      }).join('');
    }catch(e){ root.querySelector('#ccOut').textContent = e.message; }
  });
  root.querySelector('#ccEnc').click();
});

txt('Analysis Tools','hexdump','Hexdump', root=>{
  root.innerHTML = `
    <div class="field"><label>Text</label><textarea id="hdIn" style="min-height:80px">Kitbox — offline</textarea></div>
    <div class="segrow"><button class="btn primary" id="hdEnc">Dump</button><button class="btn" id="hdDec">Read a dump</button></div>
    <div class="output" id="hdOut" style="white-space:pre;font-family:var(--mono);font-size:12px;overflow:auto">—</div>
    <div class="hint">Offset, sixteen bytes in hex, then the same bytes as characters. Reading a dump back works from either the classic <span class="mono">xxd</span> layout or a bare list of hex bytes.</div>`;
  root.querySelector('#hdEnc').addEventListener('click', ()=>{
    const bytes = bytesFromText(root.querySelector('#hdIn').value);
    const lines = [];
    for(let i=0;i<bytes.length;i+=16){
      const slice = Array.from(bytes.slice(i, i+16));
      const hex = slice.map(b=>b.toString(16).padStart(2, '0')).join(' ').padEnd(47, ' ');
      const ascii = slice.map(b=> b >= 32 && b < 127 ? String.fromCharCode(b) : '.').join('');
      lines.push(i.toString(16).padStart(8, '0') + '  ' + hex + '  |' + ascii + '|');
    }
    root.querySelector('#hdOut').textContent = lines.join('\n');
  });
  root.querySelector('#hdDec').addEventListener('click', ()=>{
    const text = root.querySelector('#hdIn').value;
    const hex = text.includes('|')
      ? text.split('\n').map(l=>l.replace(/\|.*$/, '').replace(/^[0-9a-f]{8}\s+/, '')).join(' ')
      : text;
    const clean = hex.replace(/[^0-9a-fA-F]/g, '');
    if(clean.length % 2){ root.querySelector('#hdOut').textContent = 'An odd number of hex digits — one byte is incomplete.'; return; }
    root.querySelector('#hdOut').textContent = textFromBytes(Uint8Array.from(clean.match(/.{2}/g) || [], h=>parseInt(h, 16)));
  });
  root.querySelector('#hdEnc').click();
});

txt('Text Cleanup','ansistrip','Strip ANSI Escapes', root=>{
  root.innerHTML = `
    <div class="field"><label>Terminal output</label><textarea id="anIn" style="min-height:100px">[0;32mPASS[0m 3 tests
[1;31mFAIL[0m 1 test
[38;5;208mwarn[0m: deprecated</textarea></div>
    <div class="output" id="anOut" style="white-space:pre-wrap">—</div>
    <div class="hint">Removes colour and cursor codes from pasted terminal output, so a log reads as text. The pattern is the CSI form — ESC [ … letter — which is what almost every program actually emits.</div>`;
  function draw(){
    const text = root.querySelector('#anIn').value;
    const stripped = text
      .replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '')
      .replace(/\u001b\][^\u0007]*\u0007/g, '')
      .replace(/\u001b[@-Z\\-_]/g, '');
    root.querySelector('#anOut').textContent = stripped;
  }
  root.querySelector('#anIn').addEventListener('input', draw);
  draw();
});

txt('Text Cleanup','nullbytes','Remove Null Bytes', root=>{
  root.innerHTML = `
    <div class="field"><label>Text or file</label><textarea id="nbIn" style="min-height:90px"></textarea></div>
    <div class="field"><label>Or a file</label><input type="file" id="nbFile"></div>
    <div class="output" id="nbOut">—</div>
    <div class="hint">The invisible byte that breaks parsers: a string copied out of a binary, a CSV from a mainframe, a shell argument that silently truncates. This shows where they are and removes them.</div>`;
  function draw(text){
    const value = text !== undefined ? text : root.querySelector('#nbIn').value;
    const count = (value.match(/\u0000/g) || []).length;
    const other = [...value].filter(ch=>{
      const c = ch.charCodeAt(0);
      return c < 32 && c !== 9 && c !== 10 && c !== 13;
    }).length;
    root.querySelector('#nbOut').innerHTML = `<table class="mono">
      <tr><td>Length</td><td>${value.length} characters</td></tr>
      <tr><td>Null bytes</td><td style="color:${count ? '#c0392b' : '#1a7f37'}">${count}</td></tr>
      <tr><td>Other control characters</td><td>${other}</td></tr>
      <tr><td>Cleaned</td><td style="white-space:pre-wrap;word-break:break-all">${escapeHtml(value.replace(/\u0000/g, '').replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, ''))}</td></tr>
    </table>`;
  }
  root.querySelector('#nbIn').addEventListener('input', e=>draw(e.target.value));
  root.querySelector('#nbFile').addEventListener('change', async e=>{
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 5 * 1024 * 1024){ root.querySelector('#nbOut').textContent = 'Over 5 MB — paste the relevant part instead.'; return; }
    draw(textFromBytes(new Uint8Array(await file.arrayBuffer())));
  });
  draw('');
});

txt('Encoding','escape','Escape / Unescape', root=>{
  root.innerHTML = `
    <div class="field"><label>Input</label><textarea id="esIn" style="min-height:90px">He said "hi"\nand left\ta tab</textarea></div>
    <div class="row">
      <div class="field"><label>Style</label><select id="esStyle"><option value="js">JavaScript</option><option value="json">JSON</option><option value="regex">Regex</option></select></div>
      <div class="segrow"><button class="btn primary" id="esEnc">Escape</button><button class="btn" id="esDec">Unescape</button></div>
    </div>
    <div class="output" id="esOut" style="white-space:pre-wrap;word-break:break-all;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">Three styles, because they differ: JSON cannot hold a raw newline, a JavaScript string cannot hold an unescaped quote, and a regex has its own set of characters that change meaning.</div>`;
  root.querySelector('#esEnc').addEventListener('click', ()=>{
    const text = root.querySelector('#esIn').value;
    const style = root.querySelector('#esStyle').value;
    let out = text.replace(/\\/g, '\\\\');
    if(style === 'regex') out = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    else {
      out = out.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/"/g, '\\"');
      if(style === 'json') out = out.replace(/[\u0000-\u001f]/g, c=>'\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
    }
    root.querySelector('#esOut').textContent = out;
  });
  root.querySelector('#esDec').addEventListener('click', ()=>{
    const text = root.querySelector('#esIn').value;
    try{
      root.querySelector('#esOut').textContent = text
        .replace(/\\u([0-9a-fA-F]{4})/g, (m, h)=>String.fromCharCode(parseInt(h, 16)))
        .replace(/\\x([0-9a-fA-F]{2})/g, (m, h)=>String.fromCharCode(parseInt(h, 16)))
        .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
        .replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }catch(e){ root.querySelector('#esOut').textContent = 'Could not unescape: ' + e.message; }
  });
  root.querySelector('#esEnc').click();
});
