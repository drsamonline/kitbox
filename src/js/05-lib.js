/* ================================================================
   Pure algorithms — no DOM, no storage, no side effects.

   These live at the top of the build so that they can be lifted out and
   tested in Node (see tools/build-lib.js and test/lib.js). A function that
   touches the page cannot be tested without a page; a function that only
   maps bytes to bytes can be tested in a millisecond and trusted everywhere.
   ================================================================ */

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  function toBase32(bytes){
    let bits = 0, val = 0, out = '';
    for(const b of bytes){
      val = (val << 8) | b; bits += 8;
      while(bits >= 5){ out += B32[(val >>> (bits-5)) & 31]; bits -= 5; }
    }
    if(bits > 0) out += B32[(val << (5-bits)) & 31];
    while(out.length % 8) out += '=';
    return out;
  }

  function fromBase32(s){
    const clean = s.toUpperCase().replace(/=+$/,'').replace(/\s/g,'');
    let bits = 0, val = 0; const out = [];
    for(const c of clean){
      const idx = B32.indexOf(c);
      if(idx < 0) throw new Error('not a base32 character: '+c);
      val = (val << 5) | idx; bits += 5;
      if(bits >= 8){ out.push((val >>> (bits-8)) & 0xFF); bits -= 8; }
    }
    return new Uint8Array(out);
  }

  function toBase58(bytes){
    // An empty input encodes to an empty string. Without this, the leading-zero
    // loop leaves `digits = [0]` and the result is "1", which decodes to one
    // zero byte — a round trip that silently invents data.
    if(!bytes || !bytes.length) return '';
    let zeros = 0;
    while(zeros < bytes.length && bytes[zeros] === 0) zeros++;
    const digits = [0];
    for(let i=zeros;i<bytes.length;i++){
      let carry = bytes[i];
      for(let j=0;j<digits.length;j++){
        carry += digits[j] << 8;
        digits[j] = carry % 58;
        carry = (carry / 58) | 0;
      }
      while(carry){ digits.push(carry % 58); carry = (carry/58)|0; }
    }
    let out = '1'.repeat(zeros);
    for(let i=digits.length-1;i>=0;i--) out += B58[digits[i]];
    return out;
  }

  function fromBase58(s){
  let zeros = 0;
  while(zeros < s.length && s[zeros] === '1') zeros++;
  const bytes = [];
  for(const c of s.slice(zeros)){
    let carry = B58.indexOf(c);
    if(carry < 0) throw new Error('not a base58 character: ' + c);
    for(let j=0;j<bytes.length;j++){
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xFF;
      carry >>= 8;
    }
    while(carry){ bytes.push(carry & 0xFF); carry >>= 8; }
  }
  const out = new Uint8Array(zeros + bytes.length);
  for(let i2=0;i2<bytes.length;i2++) out[zeros + i2] = bytes[bytes.length - 1 - i2];
  return out;
}

  function md5(bytes){
    const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
      4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    const K = new Uint32Array(64);
    for(let i=0;i<64;i++) K[i] = Math.floor(Math.abs(Math.sin(i+1)) * 4294967296) >>> 0;
    const msgLen = bytes.length;
    const withPad = new Uint8Array((((msgLen + 8) >> 6) + 1) << 6);
    withPad.set(bytes);
    withPad[msgLen] = 0x80;
    const bitLen = msgLen * 8;
    const dv = new DataView(withPad.buffer);
    dv.setUint32(withPad.length - 8, bitLen >>> 0, true);
    dv.setUint32(withPad.length - 4, Math.floor(bitLen / 4294967296), true);
    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    const rotl = (x,c)=> (x << c) | (x >>> (32-c));
    for(let off=0; off<withPad.length; off+=64){
      const M = new Uint32Array(16);
      for(let i=0;i<16;i++) M[i] = dv.getUint32(off + i*4, true);
      let A=a0, B=b0, C=c0, D=d0;
      for(let i=0;i<64;i++){
        let F, g;
        if(i<16){ F = (B & C) | (~B & D); g = i; }
        else if(i<32){ F = (D & B) | (~D & C); g = (5*i + 1) % 16; }
        else if(i<48){ F = B ^ C ^ D; g = (3*i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7*i) % 16; }
        F = (F + A + K[i] + M[g]) >>> 0;
        A = D; D = C; C = B;
        B = (B + rotl(F, S[i])) >>> 0;
      }
      a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
    }
    const hex = v=>[0,1,2,3].map(i=>((v >>> (i*8)) & 0xFF).toString(16).padStart(2,'0')).join('');
    return hex(a0)+hex(b0)+hex(c0)+hex(d0);
  }

/* MD5 is here for legacy checksums, not for security. */
