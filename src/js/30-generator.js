/* ================================================================
   GENERATOR TOOLS
   ================================================================ */
/* Standalone QR encoder — versions 1-40, byte mode, EC levels L/M/Q/H. No dependencies. */
const QR = (function(){
  // ---- GF(256) tables ----
  const EXP = new Array(512), LOG = new Array(256);
  (function(){
    let x = 1;
    for(let i=0;i<255;i++){ EXP[i]=x; LOG[x]=i; x <<= 1; if(x & 0x100) x ^= 0x11D; }
    for(let i=255;i<512;i++) EXP[i]=EXP[i-255];
  })();
  function gfMul(a,b){ if(a===0||b===0) return 0; return EXP[LOG[a]+LOG[b]]; }

  function genPoly(ecLen){
    let poly = [1];
    for(let i=0;i<ecLen;i++){
      const next = new Array(poly.length+1).fill(0);
      for(let j=0;j<poly.length;j++){
        next[j] ^= gfMul(poly[j], 1); // placeholder, real mult below
      }
      poly = polyMulMonomial(poly, EXP[i]);
    }
    return poly;
  }
  // multiply poly by (x - EXP[i]) i.e. (x + EXP[i]) in GF2 arithmetic
  function polyMulMonomial(poly, root){
    const result = new Array(poly.length+1).fill(0);
    for(let i=0;i<poly.length;i++){
      result[i] ^= poly[i];
      if(poly[i]!==0) result[i+1] ^= gfMul(poly[i], root);
    }
    return result;
  }

  function rsEncode(dataBytes, ecLen){
    const gen = genPoly(ecLen);
    const buf = dataBytes.concat(new Array(ecLen).fill(0));
    for(let i=0;i<dataBytes.length;i++){
      const coef = buf[i];
      if(coef!==0){
        for(let j=0;j<gen.length;j++){
          buf[i+j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return buf.slice(dataBytes.length);
  }

  // ---- RS block table [version-1][L,M,Q,H] = [ecPerBlock,b1,dc1,b2,dc2] ----
  const RS = [
  {L:[7,1,19,0,0],M:[10,1,16,0,0],Q:[13,1,13,0,0],H:[17,1,9,0,0]},
  {L:[10,1,34,0,0],M:[16,1,28,0,0],Q:[22,1,22,0,0],H:[28,1,16,0,0]},
  {L:[15,1,55,0,0],M:[26,1,44,0,0],Q:[18,2,17,0,0],H:[22,2,13,0,0]},
  {L:[20,1,80,0,0],M:[18,2,32,0,0],Q:[26,2,24,0,0],H:[16,4,9,0,0]},
  {L:[26,1,108,0,0],M:[24,2,43,0,0],Q:[18,2,15,2,16],H:[22,2,11,2,12]},
  {L:[18,2,68,0,0],M:[16,4,27,0,0],Q:[24,4,19,0,0],H:[28,4,15,0,0]},
  {L:[20,2,78,0,0],M:[18,4,31,0,0],Q:[18,2,14,4,15],H:[26,4,13,1,14]},
  {L:[24,2,97,0,0],M:[22,2,38,2,39],Q:[22,4,18,2,19],H:[26,4,14,2,15]},
  {L:[30,2,116,0,0],M:[22,3,36,2,37],Q:[20,4,16,4,17],H:[24,4,12,4,13]},
  {L:[18,2,68,2,69],M:[26,4,43,1,44],Q:[24,6,19,2,20],H:[28,6,15,2,16]},
  {L:[20,4,81,0,0],M:[30,1,50,4,51],Q:[28,4,22,4,23],H:[24,3,12,8,13]},
  {L:[24,2,92,2,93],M:[22,6,36,2,37],Q:[26,4,20,6,21],H:[28,7,14,4,15]},
  {L:[26,4,107,0,0],M:[22,8,37,1,38],Q:[24,8,20,4,21],H:[22,12,11,4,12]},
  {L:[30,3,115,1,116],M:[24,4,40,5,41],Q:[20,11,16,5,17],H:[24,11,12,5,13]},
  {L:[22,5,87,1,88],M:[24,5,41,5,42],Q:[30,5,24,7,25],H:[24,11,12,7,13]},
  {L:[24,5,98,1,99],M:[28,7,45,3,46],Q:[24,15,19,2,20],H:[30,3,15,13,16]},
  {L:[28,1,107,5,108],M:[28,10,46,1,47],Q:[28,1,22,15,23],H:[28,2,14,17,15]},
  {L:[30,5,120,1,121],M:[26,9,43,4,44],Q:[28,17,22,1,23],H:[28,2,14,19,15]},
  {L:[28,3,113,4,114],M:[26,3,44,11,45],Q:[26,17,21,4,22],H:[26,9,13,16,14]},
  {L:[28,3,107,5,108],M:[26,3,41,13,42],Q:[30,15,24,5,25],H:[28,15,15,10,16]},
  {L:[28,4,116,4,117],M:[26,17,42,0,0],Q:[28,17,22,6,23],H:[30,19,16,6,17]},
  {L:[28,2,111,7,112],M:[28,17,46,0,0],Q:[30,7,24,16,25],H:[24,34,13,0,0]},
  {L:[30,4,121,5,122],M:[28,4,47,14,48],Q:[30,11,24,14,25],H:[30,16,15,14,16]},
  {L:[30,6,117,4,118],M:[28,6,45,14,46],Q:[30,11,24,16,25],H:[30,30,16,2,17]},
  {L:[26,8,106,4,107],M:[28,8,47,13,48],Q:[30,7,24,22,25],H:[30,22,15,13,16]},
  {L:[28,10,114,2,115],M:[28,19,46,4,47],Q:[28,28,22,6,23],H:[30,33,16,4,17]},
  {L:[30,8,122,4,123],M:[28,22,45,3,46],Q:[30,8,23,26,24],H:[30,12,15,28,16]},
  {L:[30,3,117,10,118],M:[28,3,45,23,46],Q:[30,4,24,31,25],H:[30,11,15,31,16]},
  {L:[30,7,116,7,117],M:[28,21,45,7,46],Q:[30,1,23,37,24],H:[30,19,15,26,16]},
  {L:[30,5,115,10,116],M:[28,19,47,10,48],Q:[30,15,24,25,25],H:[30,23,15,25,16]},
  {L:[30,13,115,3,116],M:[28,2,46,29,47],Q:[30,42,24,1,25],H:[30,23,15,28,16]},
  {L:[30,17,115,0,0],M:[28,10,46,23,47],Q:[30,10,24,35,25],H:[30,19,15,35,16]},
  {L:[30,17,115,1,116],M:[28,14,46,21,47],Q:[30,29,24,19,25],H:[30,11,15,46,16]},
  {L:[30,13,115,6,116],M:[28,14,46,23,47],Q:[30,44,24,7,25],H:[30,59,16,1,17]},
  {L:[30,12,121,7,122],M:[28,12,47,26,48],Q:[30,39,24,14,25],H:[30,22,15,41,16]},
  {L:[30,6,121,14,122],M:[28,6,47,34,48],Q:[30,46,24,10,25],H:[30,2,15,64,16]},
  {L:[30,17,122,4,123],M:[28,29,46,14,47],Q:[30,49,24,10,25],H:[30,24,15,46,16]},
  {L:[30,4,122,18,123],M:[28,13,46,32,47],Q:[30,48,24,14,25],H:[30,42,15,32,16]},
  {L:[30,20,117,4,118],M:[28,40,47,7,48],Q:[30,43,24,22,25],H:[30,10,15,67,16]},
  {L:[30,19,118,6,119],M:[28,18,47,31,48],Q:[30,34,24,34,25],H:[30,20,15,61,16]}
  ];

  const ALIGN = [null,
    [],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],
    [6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],
    [6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],
    [6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],
    [6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],
    [6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],
    [6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]
  ];
  const REMAINDER = [0,0,7,7,7,7,7,0,0,0,0,0,0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,3,3,3,3,3,3,3,0,0,0,0,0,0];
  const EC_BITS = {L:0b01, M:0b00, Q:0b11, H:0b10};

  function charCountBits(version, mode){
    if(mode==='byte') return version<10?8:16;
    if(mode==='numeric') return version<10?10:(version<27?12:14);
    if(mode==='alnum') return version<10?9:(version<27?11:13);
    return 8;
  }

  function bchFormat(data5){
    let d = data5 << 10;
    const gen = 0b10100110111;
    for(let i=4;i>=0;i--){ if(d & (1<<(i+10))) d ^= gen << i; }
    return ((data5<<10) | d) ^ 0b101010000010010;
  }
  function bchVersion(v6){
    let d = v6 << 12;
    const gen = 0b1111100100101;
    for(let i=5;i>=0;i--){ if(d & (1<<(i+12))) d ^= gen << i; }
    return (v6<<12) | d;
  }

  function chooseVersion(byteLen, level){
    for(let v=1; v<=40; v++){
      const cb = charCountBits(v,'byte');
      const headerBits = 4 + cb;
      const totalBits = headerBits + 8*byteLen;
      const r = RS[v-1][level];
      const capacityCodewords = r[1]*r[2] + r[3]*r[4];
      if(totalBits <= capacityCodewords*8) return v;
    }
    return null; // too big
  }

  function buildDataCodewords(bytes, version, level){
    const cb = charCountBits(version,'byte');
    const r = RS[version-1][level];
    const capacityBytes = r[1]*r[2] + r[3]*r[4];
    let bits = [];
    function push(val, len){ for(let i=len-1;i>=0;i--) bits.push((val>>i)&1); }
    push(0b0100, 4);
    push(bytes.length, cb);
    bytes.forEach(b=>push(b,8));
    // terminator
    const remain = capacityBytes*8 - bits.length;
    push(0, Math.min(4, Math.max(0,remain)));
    while(bits.length % 8 !== 0) bits.push(0);
    let codewords = [];
    for(let i=0;i<bits.length;i+=8){
      let v=0; for(let j=0;j<8;j++) v=(v<<1)|bits[i+j];
      codewords.push(v);
    }
    const pad = [0xEC,0x11];
    let pi=0;
    while(codewords.length < capacityBytes){ codewords.push(pad[pi%2]); pi++; }
    return codewords;
  }

  function interleave(dataCodewords, version, level){
    const r = RS[version-1][level];
    const [ec,b1,dc1,b2,dc2] = r;
    const blocks = [];
    let idx=0;
    for(let i=0;i<b1;i++){ blocks.push(dataCodewords.slice(idx, idx+dc1)); idx+=dc1; }
    for(let i=0;i<b2;i++){ blocks.push(dataCodewords.slice(idx, idx+dc2)); idx+=dc2; }
    const ecBlocks = blocks.map(bl=>rsEncode(bl.slice(), ec));
    const maxData = Math.max(dc1, b2?dc2:0);
    let dataOut = [];
    for(let i=0;i<maxData;i++){
      blocks.forEach(bl=>{ if(i<bl.length) dataOut.push(bl[i]); });
    }
    let ecOut = [];
    for(let i=0;i<ec;i++){
      ecBlocks.forEach(bl=>{ ecOut.push(bl[i]); });
    }
    const allBytes = dataOut.concat(ecOut);
    let bits=[];
    allBytes.forEach(b=>{ for(let i=7;i>=0;i--) bits.push((b>>i)&1); });
    for(let i=0;i<REMAINDER[version];i++) bits.push(0);
    return bits;
  }

  function encode(text, level){
    level = level || 'M';
    const bytes = Array.from(new TextEncoder().encode(text));
    const version = chooseVersion(bytes.length, level);
    if(!version) throw new Error('Data too long for QR code (max ~2900 bytes at L level).');
    const dataCodewords = buildDataCodewords(bytes, version, level);
    const finalBits = interleave(dataCodewords, version, level);
    const size = version*4 + 17;
    const matrix = Array.from({length:size},()=>new Array(size).fill(null));
    const reserved = Array.from({length:size},()=>new Array(size).fill(false));

    function setModule(r,c,val,res){ if(r<0||c<0||r>=size||c>=size) return; matrix[r][c]=val; if(res) reserved[r][c]=true; }
    function placeFinder(r,c){
      for(let i=-1;i<=7;i++) for(let j=-1;j<=7;j++){
        const rr=r+i, cc=c+j;
        if(rr<0||cc<0||rr>=size||cc>=size) continue;
        let dark;
        if(i>=0&&i<=6&&j>=0&&j<=6){
          dark = (i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4));
        } else dark=false; // separator
        setModule(rr,cc,dark,true);
      }
    }
    placeFinder(0,0); placeFinder(0,size-7); placeFinder(size-7,0);
    // timing patterns
    for(let i=8;i<size-8;i++){ setModule(6,i, i%2===0, true); setModule(i,6, i%2===0, true); }
    // alignment patterns
    const aps = ALIGN[version];
    if(aps && aps.length){
      aps.forEach(r=>aps.forEach(c=>{
        // skip if overlapping finder corners
        if((r<=8&&c<=8)||(r<=8&&c>=size-9)||(r>=size-9&&c<=8)) return;
        for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++){
          const dark = (i===-2||i===2||j===-2||j===2||(i===0&&j===0));
          setModule(r+i,c+j,dark,true);
        }
      }));
    }
    // dark module
    setModule(size-8,8,true,true);
    // format info reserved areas
    for(let i=0;i<9;i++){ setModule(8,i,false,true); setModule(i,8,false,true); }
    for(let i=0;i<8;i++){ setModule(8,size-1-i,false,true); setModule(size-1-i,8,false,true); }
    setModule(8,8,false,true);
    // version info reserved areas
    if(version>=7){
      for(let i=0;i<6;i++) for(let j=0;j<3;j++){ setModule(size-11+j,i,false,true); setModule(i,size-11+j,false,true); }
    }

    // place data bits in zig-zag
    let bitIdx=0;
    let dir=-1; let col=size-1;
    while(col>0){
      if(col===6) col--;
      for(let rowStep=0; rowStep<size; rowStep++){
        const row = dir===-1 ? size-1-rowStep : rowStep;
        for(let k=0;k<2;k++){
          const c = col-k;
          if(!reserved[row][c]){
            const bit = bitIdx<finalBits.length ? finalBits[bitIdx] : 0;
            matrix[row][c] = !!bit;
            bitIdx++;
          }
        }
      }
      dir = -dir;
      col -= 2;
    }

    // masking: try all 8, pick lowest penalty
    const maskFns = [
      (r,c)=> (r+c)%2===0,
      (r,c)=> r%2===0,
      (r,c)=> c%3===0,
      (r,c)=> (r+c)%3===0,
      (r,c)=> (Math.floor(r/2)+Math.floor(c/3))%2===0,
      (r,c)=> ((r*c)%2 + (r*c)%3)===0,
      (r,c)=> (((r*c)%2 + (r*c)%3)%2)===0,
      (r,c)=> (((r+c)%2 + (r*c)%3)%2)===0
    ];
    function applyMask(mi){
      const m2 = matrix.map((row,r)=>row.map((v,c)=> reserved[r][c]? v : (v !== maskFns[mi](r,c))));
      return m2;
    }
    function penalty(m2){
      let p=0;
      // rule1 rows+cols
      for(let r=0;r<size;r++){
        let run=1;
        for(let c=1;c<size;c++){
          if(m2[r][c]===m2[r][c-1]) run++; else { if(run>=5) p+=3+(run-5); run=1; }
        }
        if(run>=5) p+=3+(run-5);
      }
      for(let c=0;c<size;c++){
        let run=1;
        for(let r=1;r<size;r++){
          if(m2[r][c]===m2[r-1][c]) run++; else { if(run>=5) p+=3+(run-5); run=1; }
        }
        if(run>=5) p+=3+(run-5);
      }
      // rule2 2x2 blocks
      for(let r=0;r<size-1;r++) for(let c=0;c<size-1;c++){
        const v=m2[r][c];
        if(v===m2[r][c+1] && v===m2[r+1][c] && v===m2[r+1][c+1]) p+=3;
      }
      // rule3 finder-like pattern
      const pat1=[true,false,true,true,true,false,true,false,false,false,false];
      const pat2=[false,false,false,false,true,false,true,true,true,false,true];
      function matchAt(arr,i,pat){ for(let k=0;k<pat.length;k++) if(arr[i+k]!==pat[k]) return false; return true; }
      for(let r=0;r<size;r++){
        for(let c=0;c<=size-11;c++){
          const row=m2[r].slice(c,c+11);
          if(matchAt(row,0,pat1)||matchAt(row,0,pat2)) p+=40;
        }
      }
      for(let c=0;c<size;c++){
        const colArr = m2.map(row=>row[c]);
        for(let r=0;r<=size-11;r++){
          const seg = colArr.slice(r,r+11);
          if(matchAt(seg,0,pat1)||matchAt(seg,0,pat2)) p+=40;
        }
      }
      // rule4 dark ratio
      let dark=0;
      m2.forEach(row=>row.forEach(v=>{ if(v) dark++; }));
      const pct = dark*100/(size*size);
      const prevMult = Math.floor(Math.abs(pct-50)/5);
      p += prevMult*10;
      return p;
    }
    let best=null, bestScore=Infinity, bestMask=0;
    for(let mi=0;mi<8;mi++){
      const m2 = applyMask(mi);
      const sc = penalty(m2);
      if(sc<bestScore){ bestScore=sc; best=m2; bestMask=mi; }
    }
    // write format info
    const fmtVal = bchFormat((EC_BITS[level]<<3)|bestMask);
    function fmtBit(i){ return ((fmtVal>>i)&1)===1; }
    // 15 bits, i=14..0
    const fmtOrderA = [ [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8] ];
    for(let i=0;i<15;i++){ const [r,c]=fmtOrderA[i]; best[r][c]=fmtBit(14-i); }
    const fmtOrderB = [ [size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],[8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1] ];
    for(let i=0;i<15;i++){ const [r,c]=fmtOrderB[i]; best[r][c]=fmtBit(14-i); }
    // version info
    if(version>=7){
      const verVal = bchVersion(version);
      function vBit(i){ return ((verVal>>i)&1)===1; }
      let bit=0;
      for(let r=0;r<6;r++) for(let c=0;c<3;c++){ best[r][size-11+c]=vBit(bit); best[size-11+c][r]=vBit(bit); bit++; }
    }
    return { version, size, matrix: best };
  }

  return { encode };
})();

if(typeof module!=='undefined') module.exports = QR;

TOOLS.generator = TOOLS.generator || [];   // idempotent: a part that sorts earlier may have registered already
let GEN_N = 0;
function gen(id, name, render){ register({cat:'generator', id, name, render}); }

gen('qrcode','QR Code', root => {
  root.innerHTML = `
    <div class="field"><label>Content (text, URL, etc.)</label><textarea id="qrText" placeholder="https://example.com"></textarea></div>
    <div class="row">
      <div class="field"><label>Error correction</label><select id="qrEc">
        <option value="L">L — low (7%)</option>
        <option value="M" selected>M — medium (15%)</option>
        <option value="Q">Q — quartile (25%)</option>
        <option value="H">H — high (30%)</option>
      </select></div>
      <div class="field"><label>Module size (px)</label><input type="number" id="qrScale" value="6" min="2" max="20"></div>
    </div>
    <div id="qrOutWrap" style="text-align:center;padding:10px 0"></div>
    <div class="hint" id="qrInfo">Generates entirely in-browser — nothing is sent anywhere. Supports up to ~2900 characters depending on error correction level.</div>
    <div class="segrow" id="qrActions" style="display:none">
      <button class="btn primary" id="qrDownload">Download PNG</button>
    </div>
  `;
  const txt = root.querySelector('#qrText');
  const ecSel = root.querySelector('#qrEc');
  const scaleInp = root.querySelector('#qrScale');
  const wrap = root.querySelector('#qrOutWrap');
  const info = root.querySelector('#qrInfo');
  const actions = root.querySelector('#qrActions');
  let lastCanvas = null;
  function render(){
    const text = txt.value;
    actions.style.display = 'none';
    if(!text){ wrap.innerHTML=''; info.textContent='Generates entirely in-browser — nothing is sent anywhere. Supports up to ~2900 characters depending on error correction level.'; return; }
    try{
      const {version, size, matrix} = QR.encode(text, ecSel.value);
      const scale = parseInt(scaleInp.value)||6;
      const quiet = 4;
      const dim = (size + quiet*2) * scale;
      const canvas = document.createElement('canvas');
      canvas.width = dim; canvas.height = dim;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,dim,dim);
      ctx.fillStyle = '#000';
      for(let r=0;r<size;r++) for(let c=0;c<size;c++){
        if(matrix[r][c]) ctx.fillRect((c+quiet)*scale, (r+quiet)*scale, scale, scale);
      }
      canvas.style.maxWidth='100%'; canvas.style.border='1px solid var(--line)'; canvas.style.borderRadius='10px';
      wrap.innerHTML=''; wrap.appendChild(canvas);
      lastCanvas = canvas;
      info.textContent = `Version ${version} (${size}×${size} modules) · EC level ${ecSel.value} · ${new TextEncoder().encode(text).length} bytes encoded.`;
      actions.style.display='flex';
    }catch(e){
      wrap.innerHTML=''; info.textContent = e.message;
    }
  }
  root.querySelector('#qrDownload').addEventListener('click', ()=>{
    if(!lastCanvas) return;
    const a = document.createElement('a');
    a.download = 'qrcode.png';
    a.href = lastCanvas.toDataURL('image/png');
    a.click();
  });
  [txt,ecSel,scaleInp].forEach(el=>el.addEventListener('input', render));
});

gen('lorem','Lorem Ipsum', root => {
  const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Generate</label><select id="loType"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div>
      <div class="field"><label>Count</label><input type="number" id="loCount" value="3" min="1" max="50"></div>
    </div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="loStart" checked> Start with "Lorem ipsum dolor sit amet..."</label>
    <div class="segrow"><button class="btn primary" id="loGo">Generate</button></div>
    <div class="output" id="loOut">Result will appear here.</div>`;
  function randWord(){ return WORDS[Math.floor(Math.random()*WORDS.length)]; }
  function sentence(minW,maxW){
    const n = minW + Math.floor(Math.random()*(maxW-minW));
    const words = Array.from({length:n}, randWord);
    const s = words.join(' ');
    return s.charAt(0).toUpperCase()+s.slice(1)+'.';
  }
  function paragraph(){
    const n = 3 + Math.floor(Math.random()*4);
    return Array.from({length:n}, ()=>sentence(6,16)).join(' ');
  }
  root.querySelector('#loGo').addEventListener('click', ()=>{
    const type = root.querySelector('#loType').value;
    const count = parseInt(root.querySelector('#loCount').value)||1;
    const startClassic = root.querySelector('#loStart').checked;
    let out=[];
    if(type==='words'){ out=[Array.from({length:count}, randWord).join(' ')]; }
    else if(type==='sentences'){ out = Array.from({length:count}, ()=>sentence(6,16)); out=[out.join(' ')]; }
    else { out = Array.from({length:count}, paragraph); }
    if(startClassic && out.length){
      out[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + out[0];
    }
    root.querySelector('#loOut').textContent = out.join('\n\n');
  });
});

gen('numgen','Simple Number Generator', root => {
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Minimum</label><input type="number" id="ngMin" value="1"></div>
      <div class="field"><label>Maximum</label><input type="number" id="ngMax" value="100"></div>
    </div>
    <div class="counter-display" id="ngOut">—</div>
    <div class="segrow"><button class="btn primary" id="ngGo">Generate</button></div>`;
  root.querySelector('#ngGo').addEventListener('click', ()=>{
    const min = parseInt(root.querySelector('#ngMin').value)||0;
    const max = parseInt(root.querySelector('#ngMax').value)||0;
    const lo = Math.min(min,max), hi = Math.max(min,max);
    root.querySelector('#ngOut').textContent = Math.floor(Math.random()*(hi-lo+1))+lo;
  });
});

gen('multinumgen','Multiple Numbers Generator', root => {
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Minimum</label><input type="number" id="mgMin" value="1"></div>
      <div class="field"><label>Maximum</label><input type="number" id="mgMax" value="100"></div>
    </div>
    <div class="row">
      <div class="field"><label>How many numbers</label><input type="number" id="mgCount" value="10" min="1" max="10000"></div>
      <div class="field"><label>Options</label>
        <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-top:10px"><input type="checkbox" id="mgUnique"> No duplicates</label>
      </div>
    </div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="mgSort"> Sort ascending</label>
    <div class="segrow"><button class="btn primary" id="mgGo">Generate</button></div>
    <div class="output" id="mgOut">Result will appear here.</div>`;
  root.querySelector('#mgGo').addEventListener('click', ()=>{
    const min = parseInt(root.querySelector('#mgMin').value)||0;
    const max = parseInt(root.querySelector('#mgMax').value)||0;
    const lo = Math.min(min,max), hi = Math.max(min,max);
    const count = parseInt(root.querySelector('#mgCount').value)||1;
    const unique = root.querySelector('#mgUnique').checked;
    const sort = root.querySelector('#mgSort').checked;
    const out = root.querySelector('#mgOut');
    if(unique && (hi-lo+1) < count){ out.textContent = `Range only has ${hi-lo+1} possible values — can't generate ${count} unique numbers.`; return; }
    let nums=[];
    if(unique){
      const pool = []; for(let i=lo;i<=hi;i++) pool.push(i);
      for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
      nums = pool.slice(0,count);
    } else {
      for(let i=0;i<count;i++) nums.push(Math.floor(Math.random()*(hi-lo+1))+lo);
    }
    if(sort) nums.sort((a,b)=>a-b);
    out.textContent = nums.join(', ');
  });
});

gen('scanner','Barcode/QR code Scanner', root => {
  root.innerHTML = `
    <div style="text-align:center">
      <video id="scanVideo" style="width:100%;max-width:400px;border-radius:12px;border:1px solid var(--line);background:#000" muted playsinline></video>
      <div><button class="btn primary" id="scanBtn" style="margin-top:14px">Start camera</button> <button class="btn" id="scanStop" style="margin-top:14px;display:none">Stop</button></div>
      <div class="output" id="scanOut" style="text-align:left;margin-top:16px">No result yet.</div>
      <div class="hint">Uses your browser's built-in barcode detector — no server, no external library. Available in Chrome/Edge on Android and desktop; not yet supported in all browsers.</div>
    </div>`;
  const video = root.querySelector('#scanVideo');
  const out = root.querySelector('#scanOut');
  const startBtn = root.querySelector('#scanBtn');
  const stopBtn = root.querySelector('#scanStop');
  let stream=null, raf=null, detector=null;
  async function start(){
    if(!('BarcodeDetector' in window)){ out.textContent='This browser does not support the built-in BarcodeDetector API. Try Chrome or Edge on Android/desktop.'; return; }
    try{
      detector = new window.BarcodeDetector({formats:['qr_code','ean_13','ean_8','code_128','upc_a','upc_e','code_39']});
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      video.srcObject = stream; await video.play();
      startBtn.style.display='none'; stopBtn.style.display='inline-block';
      scanLoop();
    }catch(e){ out.textContent = 'Camera access failed: '+e.message; }
  }
  async function scanLoop(){
    if(!stream) return;
    try{
      const codes = await detector.detect(video);
      if(codes.length){ out.textContent = codes.map(c=>`[${c.format}] ${c.rawValue}`).join('\n'); }
    }catch(e){}
    raf = requestAnimationFrame(scanLoop);
  }
  function stop(){
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
    if(raf) cancelAnimationFrame(raf);
    video.srcObject = null;
    startBtn.style.display='inline-block'; stopBtn.style.display='none';
  }
  setCleanup(stop);
  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', stop);
});

