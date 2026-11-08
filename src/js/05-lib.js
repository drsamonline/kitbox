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

/* ---------- ASN.1 / DER ----------
   Every byte of a certificate or a key file is one of these structures, so the
   parser is shared by the ASN.1 tool and the certificate reader rather than
   written twice. It returns rows so a tool can render them; a caller that needs
   the tree can walk `kids`. */
const ASN1_TYPES = { 0x01:'BOOLEAN', 0x02:'INTEGER', 0x03:'BIT STRING', 0x04:'OCTET STRING',
  0x05:'NULL', 0x06:'OID', 0x0c:'UTF8String', 0x13:'PrintableString', 0x16:'IA5String',
  0x17:'UTCTime', 0x18:'GeneralizedTime', 0x30:'SEQUENCE', 0x31:'SET', 0xa0:'[0]', 0xa1:'[1]', 0xa3:'[3]' };

function asn1Oid(bytes){
  const parts = [Math.floor(bytes[0] / 40), bytes[0] % 40];
  let v = 0;
  for(let i=1;i<bytes.length;i++){
    v = (v << 7) | (bytes[i] & 0x7f);
    if(!(bytes[i] & 0x80)){ parts.push(v); v = 0; }
  }
  return parts.join('.');
}

function parseASN1(bytes, offset, end, depth){
  const nodes = [];
  while(offset < end){
    const tag = bytes[offset++];
    let len = bytes[offset++];
    if(len & 0x80){
      const n = len & 0x7f;
      len = 0;
      for(let i=0;i<n;i++) len = (len << 8) | bytes[offset++];
    }
    const start = offset, stop = offset + len;
    if(stop > end) throw new Error('a length runs past the end of its parent at offset ' + start);
    const raw = bytes.slice(start, stop);
    const node = { tag, type: ASN1_TYPES[tag] || ('tag 0x' + tag.toString(16)), raw, depth, kids: [] };
    if(tag === 0x06) node.text = asn1Oid(raw);
    else if(tag === 0x01) node.text = raw[0] ? 'true' : 'false';
    else if(tag === 0x05) node.text = 'null';
    else if(tag === 0x17 || tag === 0x18 || tag === 0x0c || tag === 0x13 || tag === 0x16) node.text = textFromBytes(raw);
    else if(tag === 0x02) node.text = '0x' + Array.from(raw).map(b=>b.toString(16).padStart(2,'0')).join('');
    else if(tag === 0x03) node.text = (raw[0] === 0 ? '0 unused bits, ' : raw[0] + ' unused bits, ') + (raw.length - 1) + ' bytes';
    else if(tag === 0x04) node.text = raw.length + ' bytes';
    if((tag & 0x20) || tag === 0x30 || tag === 0x31 || (tag >= 0xa0 && tag <= 0xbf)){
      if(depth < 20) node.kids = parseASN1(bytes, start, stop, depth + 1);
    }
    nodes.push(node);
    offset = stop;
  }
  return nodes;
}

function asn1Rows(nodes, rows){
  for(const n of nodes){
    rows.push([n.type, n.raw.length, n.text === undefined ? '' : n.text, n.depth]);
    if(n.kids.length) asn1Rows(n.kids, rows);
  }
  return rows;
}
