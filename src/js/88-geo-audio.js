/* ================================================================
   GEO TOOLS
   ================================================================ */
TOOLS.geo = [];
let GEO_N = 0;
function geo(id, name, render){ register({cat:'geo', id, name, render}); }
function toRad(d){ return d*Math.PI/180; }
function toDeg(r){ return r*180/Math.PI; }

geo('distance','Distance', root=>{
  root.innerHTML = `
    <div class="row"><div class="field"><label>Lat 1</label><input type="number" id="dsLat1" value="28.6139"></div><div class="field"><label>Lng 1</label><input type="number" id="dsLng1" value="77.2090"></div></div>
    <div class="row"><div class="field"><label>Lat 2</label><input type="number" id="dsLat2" value="19.0760"></div><div class="field"><label>Lng 2</label><input type="number" id="dsLng2" value="72.8777"></div></div>
    <div class="output" id="dsOut">—</div>`;
  function update(){
    const lat1=+root.querySelector('#dsLat1').value, lng1=+root.querySelector('#dsLng1').value;
    const lat2=+root.querySelector('#dsLat2').value, lng2=+root.querySelector('#dsLng2').value;
    const R=6371;
    const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
    const km = R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    root.querySelector('#dsOut').innerHTML = `<span class="big">${fmtNum(km,2)} km</span>\n${fmtNum(km*0.621371,2)} miles`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

geo('bearing','Bearing', root=>{
  root.innerHTML = `
    <div class="row"><div class="field"><label>Lat 1</label><input type="number" id="brLat1" value="28.6139"></div><div class="field"><label>Lng 1</label><input type="number" id="brLng1" value="77.2090"></div></div>
    <div class="row"><div class="field"><label>Lat 2</label><input type="number" id="brLat2" value="19.0760"></div><div class="field"><label>Lng 2</label><input type="number" id="brLng2" value="72.8777"></div></div>
    <div class="output" id="brOut">—</div>`;
  function update(){
    const lat1=toRad(+root.querySelector('#brLat1').value), lng1=toRad(+root.querySelector('#brLng1').value);
    const lat2=toRad(+root.querySelector('#brLat2').value), lng2=toRad(+root.querySelector('#brLng2').value);
    const y = Math.sin(lng2-lng1)*Math.cos(lat2);
    const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1);
    const bearing = (toDeg(Math.atan2(y,x))+360)%360;
    const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const dir = dirs[Math.round(bearing/22.5)%16];
    root.querySelector('#brOut').innerHTML = `<span class="big">${fmtNum(bearing,1)}°</span> (${dir})`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

geo('midpoint','Midpoint', root=>{
  root.innerHTML = `
    <div class="row"><div class="field"><label>Lat 1</label><input type="number" id="mpLat1" value="28.6139"></div><div class="field"><label>Lng 1</label><input type="number" id="mpLng1" value="77.2090"></div></div>
    <div class="row"><div class="field"><label>Lat 2</label><input type="number" id="mpLat2" value="19.0760"></div><div class="field"><label>Lng 2</label><input type="number" id="mpLng2" value="72.8777"></div></div>
    <div class="output" id="mpOut">—</div>`;
  function update(){
    const lat1=toRad(+root.querySelector('#mpLat1').value), lng1=toRad(+root.querySelector('#mpLng1').value);
    const lat2=toRad(+root.querySelector('#mpLat2').value), lng2=toRad(+root.querySelector('#mpLng2').value);
    const bx=Math.cos(lat2)*Math.cos(lng2-lng1), by=Math.cos(lat2)*Math.sin(lng2-lng1);
    const latM = Math.atan2(Math.sin(lat1)+Math.sin(lat2), Math.sqrt((Math.cos(lat1)+bx)**2+by**2));
    const lngM = lng1 + Math.atan2(by, Math.cos(lat1)+bx);
    root.querySelector('#mpOut').innerHTML = `<span class="big">${fmtNum(toDeg(latM),5)}, ${fmtNum(toDeg(lngM),5)}</span>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

geo('dmsconv','Coordinate Converter', root=>{
  root.innerHTML = `
    <div class="field"><label>Decimal degrees</label><input type="number" id="dcIn" value="28.6139" step="any"></div>
    <div class="output" id="dcOut">—</div>
    <div class="divider"></div>
    <div class="row">
      <div class="field"><label>Degrees</label><input type="number" id="dmD" value="28"></div>
      <div class="field"><label>Minutes</label><input type="number" id="dmM" value="36"></div>
      <div class="field"><label>Seconds</label><input type="number" id="dmS" value="50"></div>
    </div>
    <div class="output" id="dmOut">—</div>`;
  root.querySelector('#dcIn').addEventListener('input', e=>{
    const dec = +e.target.value;
    const sign = dec<0?-1:1; const abs=Math.abs(dec);
    const d = Math.floor(abs); const mFull=(abs-d)*60; const m=Math.floor(mFull); const s=(mFull-m)*60;
    root.querySelector('#dcOut').textContent = `${sign*d}° ${m}' ${fmtNum(s,2)}"`;
  });
  function updateDMS(){
    const d=+root.querySelector('#dmD').value, m=+root.querySelector('#dmM').value, s=+root.querySelector('#dmS').value;
    const sign = d<0?-1:1;
    const dec = sign*(Math.abs(d)+m/60+s/3600);
    root.querySelector('#dmOut').textContent = fmtNum(dec,6)+'°';
  }
  root.querySelectorAll('#dmD,#dmM,#dmS').forEach(el=>el.addEventListener('input', updateDMS));
  root.querySelector('#dcIn').dispatchEvent(new Event('input'));
  updateDMS();
});

geo('sunrise','Sunrise/Sunset', root=>{
  root.innerHTML = `
    <div class="row"><div class="field"><label>Latitude</label><input type="number" id="srLat" value="28.6139"></div><div class="field"><label>Longitude</label><input type="number" id="srLng" value="77.2090"></div></div>
    <div class="field"><label>Date</label><input type="date" id="srDate"></div>
    <div class="output" id="srOut">—</div>
    <div class="hint">Approximate — doesn't account for elevation or atmospheric refraction precisely.</div>`;
  function update(){
    const lat=+root.querySelector('#srLat').value, lon=+root.querySelector('#srLng').value;
    const dateStr = root.querySelector('#srDate').value;
    const out = root.querySelector('#srOut');
    if(!dateStr){ out.textContent='Pick a date.'; return; }
    const date = new Date(dateStr+'T00:00:00Z');
    const start = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    const dayOfYear = Math.floor((date-start)/86400000)+1;
    const gamma = 2*Math.PI/365*(dayOfYear-1);
    const decl = 0.006918 - 0.399912*Math.cos(gamma) + 0.070257*Math.sin(gamma) - 0.006758*Math.cos(2*gamma) + 0.000907*Math.sin(2*gamma) - 0.002697*Math.cos(3*gamma) + 0.00148*Math.sin(3*gamma);
    const latR = toRad(lat);
    const cosH = (Math.sin(toRad(-0.83)) - Math.sin(latR)*Math.sin(decl)) / (Math.cos(latR)*Math.cos(decl));
    if(cosH>1){ out.textContent='Sun never rises on this date at this latitude (polar night).'; return; }
    if(cosH<-1){ out.textContent='Sun never sets on this date at this latitude (midnight sun).'; return; }
    const ha = toDeg(Math.acos(cosH));
    const sunriseUT = 12 - ha/15 - lon/15, sunsetUT = 12 + ha/15 - lon/15;
    function fmtUT(h){ h=((h%24)+24)%24; const hh=Math.floor(h), mm=Math.round((h-hh)*60); return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' UTC'; }
    out.textContent = `Sunrise: ${fmtUT(sunriseUT)}\nSunset: ${fmtUT(sunsetUT)}`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  root.querySelector('#srDate').value = new Date().toISOString().slice(0,10);
  update();
});

geo('gpsspeed','GPS Speed', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <div class="counter-display" id="gsSpeed">—</div>
      <button class="btn primary" id="gsStart">Start tracking</button>
      <button class="btn" id="gsStop" style="display:none">Stop</button>
    </div>
    <div class="hint">Requires location permission and a device with GPS. Works best outdoors, moving.</div>`;
  let watchId=null;
  setCleanup(()=>{ if(watchId!=null) navigator.geolocation.clearWatch(watchId); });
  root.querySelector('#gsStart').addEventListener('click', ()=>{
    if(!navigator.geolocation){ root.querySelector('#gsSpeed').textContent='Not supported'; return; }
    watchId = navigator.geolocation.watchPosition(pos=>{
      const speed = pos.coords.speed;
      root.querySelector('#gsSpeed').textContent = speed==null ? '—' : fmtNum(speed*3.6,1)+' km/h';
    }, err=>{ root.querySelector('#gsSpeed').textContent = 'Error: '+err.message; }, {enableHighAccuracy:true});
    root.querySelector('#gsStart').style.display='none'; root.querySelector('#gsStop').style.display='inline-block';
  });
  root.querySelector('#gsStop').addEventListener('click', ()=>{
    if(watchId!=null) navigator.geolocation.clearWatch(watchId);
    root.querySelector('#gsStart').style.display='inline-block'; root.querySelector('#gsStop').style.display='none';
  });
});

geo('polygonarea','Polygon Area', root=>{
  root.innerHTML = `
    <div class="field"><label>Coordinates (one "lat,lng" per line, in order)</label><textarea id="paIn">28.6139,77.2090
28.7041,77.1025
28.5355,77.3910</textarea></div>
    <div class="output" id="paOut">—</div>`;
  function update(){
    const lines = root.querySelector('#paIn').value.trim().split('\n').map(l=>l.split(',').map(Number)).filter(p=>p.length===2 && !p.some(isNaN));
    const out = root.querySelector('#paOut');
    if(lines.length<3){ out.textContent='Enter at least 3 points.'; return; }
    const latAvg = lines.reduce((s,p)=>s+p[0],0)/lines.length;
    const R = 6371000;
    const pts = lines.map(([lat,lng])=>[ toRad(lng)*Math.cos(toRad(latAvg))*R, toRad(lat)*R ]);
    let area=0;
    for(let i=0;i<pts.length;i++){
      const [x1,y1]=pts[i], [x2,y2]=pts[(i+1)%pts.length];
      area += x1*y2 - x2*y1;
    }
    area = Math.abs(area)/2;
    out.innerHTML = `<span class="big">${fmtNum(area,1)} m²</span>\n${fmtNum(area/1e6,4)} km²  ·  ${fmtNum(area/4046.86,3)} acres  ·  ${fmtNum(area/10000,3)} hectares`;
  }
  root.querySelector('#paIn').addEventListener('input', update);
  update();
});

/* ================================================================
   AUDIO TOOLS (uses Web Audio API — no files, no dependencies)
   ================================================================ */
TOOLS.audio = [];
let AUD_N = 0;
function aud(id, name, render){ register({cat:'audio', id, name, render}); }
let sharedAudioCtx = null;
function getAudioCtx(){
  if(!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if(sharedAudioCtx.state==='suspended') sharedAudioCtx.resume().catch(()=>{});
  return sharedAudioCtx;
}

aud('tonegen','Tone Generator', root=>{
  root.innerHTML = `
    <div class="field"><label>Frequency (Hz)</label><input type="range" id="tgFreq" min="20" max="8000" value="440"></div>
    <div class="output" id="tgFreqOut" style="text-align:center">440 Hz (A4)</div>
    <div class="field"><label>Waveform</label><select id="tgWave"><option value="sine">Sine</option><option value="square">Square</option><option value="sawtooth">Sawtooth</option><option value="triangle">Triangle</option></select></div>
    <div class="segrow"><button class="btn primary" id="tgPlay">Play</button><button class="btn" id="tgStop">Stop</button></div>`;
  let osc=null, gain=null;
  function freqToNote(f){
    const A4=440; const semis = Math.round(12*Math.log2(f/A4));
    const names=['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
    const name = names[((semis%12)+12)%12];
    const octave = 4+Math.floor((semis+9)/12);
    return name+octave;
  }
  function stopTone(){
    if(!osc) return;
    try{
      const ctx = getAudioCtx(), t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0.0001, t+0.03);
      osc.stop(t+0.04);
    }catch(e){}
    osc=null; gain=null;
  }
  setCleanup(stopTone);
  root.querySelector('#tgFreq').addEventListener('input', e=>{
    root.querySelector('#tgFreqOut').textContent = `${e.target.value} Hz (${freqToNote(+e.target.value)})`;
    if(osc) osc.frequency.value = +e.target.value;
  });
  root.querySelector('#tgWave').addEventListener('change', e=>{ if(osc) osc.type = e.target.value; });
  root.querySelector('#tgPlay').addEventListener('click', ()=>{
    const ctx = getAudioCtx();
    if(osc) return;
    osc = ctx.createOscillator(); gain = ctx.createGain();
    osc.type = root.querySelector('#tgWave').value;
    osc.frequency.value = +root.querySelector('#tgFreq').value;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
  });
  root.querySelector('#tgStop').addEventListener('click', stopTone);
});

aud('metronome','Metronome', root=>{
  root.innerHTML = `
    <div class="field"><label>BPM</label><input type="range" id="mtBpm" min="30" max="240" value="100"></div>
    <div class="output" id="mtBpmOut" style="text-align:center">100 BPM</div>
    <div id="mtDot" style="width:24px;height:24px;border-radius:50%;background:var(--line);margin:14px auto"></div>
    <div class="segrow"><button class="btn primary" id="mtStart">Start</button><button class="btn" id="mtStop">Stop</button></div>`;
  let timer=null;
  function stopMetro(){ if(timer){ clearInterval(timer); timer=null; } }
  setCleanup(stopMetro);
  function click(){
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.frequency.value = 1000; gain.gain.value = 0.3;
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+0.05);
    const dot = root.querySelector('#mtDot');
    dot.style.background='var(--accent)'; setTimeout(()=>{ dot.style.background='var(--line)'; },100);
  }
  root.querySelector('#mtBpm').addEventListener('input', e=>{
    root.querySelector('#mtBpmOut').textContent = e.target.value+' BPM';
    if(timer){ clearInterval(timer); timer = setInterval(click, 60000/(+e.target.value)); }
  });
  root.querySelector('#mtStart').addEventListener('click', ()=>{
    if(timer) return;
    const bpm = +root.querySelector('#mtBpm').value;
    click();
    timer = setInterval(click, 60000/bpm);
  });
  root.querySelector('#mtStop').addEventListener('click', stopMetro);
});

aud('noise','White/Pink Noise', root=>{
  root.innerHTML = `
    <div class="field"><label>Type</label><select id="nsType"><option value="white">White noise</option><option value="pink">Pink noise</option></select></div>
    <div class="segrow"><button class="btn primary" id="nsPlay">Play</button><button class="btn" id="nsStop">Stop</button></div>`;
  let node=null, gain=null;
  function makeBuffer(ctx, type){
    const bufferSize = 2*ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    if(type==='white'){
      for(let i=0;i<bufferSize;i++) data[i]=Math.random()*2-1;
    } else {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for(let i=0;i<bufferSize;i++){
        const white=Math.random()*2-1;
        b0=0.99886*b0+white*0.0555179; b1=0.99332*b1+white*0.0750759; b2=0.96900*b2+white*0.1538520;
        b3=0.86650*b3+white*0.3104856; b4=0.55000*b4+white*0.5329522; b5=-0.7616*b5-white*0.0168980;
        data[i]=(b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.11; b6=white*0.115926;
      }
    }
    return buffer;
  }
  function startNoise(type){
    const ctx = getAudioCtx();
    node = ctx.createBufferSource(); node.buffer=makeBuffer(ctx, type); node.loop=true;
    gain = ctx.createGain(); gain.gain.value=0.25;
    node.connect(gain).connect(ctx.destination); node.start();
  }
  function stopNoise(){
    if(!node) return;
    try{
      const ctx = getAudioCtx(), t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0.0001, t+0.03);
      node.stop(t+0.04);
    }catch(e){}
    node=null; gain=null;
  }
  setCleanup(stopNoise);
  root.querySelector('#nsPlay').addEventListener('click', ()=>{
    if(node) return;
    startNoise(root.querySelector('#nsType').value);
  });
  root.querySelector('#nsType').addEventListener('change', e=>{
    if(node){ stopNoise(); startNoise(e.target.value); }
  });
  root.querySelector('#nsStop').addEventListener('click', stopNoise);
});

aud('binaural','Binaural Beats', root=>{
  root.innerHTML = `
    <div class="field"><label>Base frequency (Hz)</label><input type="number" id="bbBase" value="200"></div>
    <div class="field"><label>Beat frequency (Hz)</label><input type="number" id="bbBeat" value="10" step="0.5"></div>
    <div class="segrow"><button class="btn primary" id="bbPlay">Play</button><button class="btn" id="bbStop">Stop</button></div>
    <div class="hint">Requires stereo headphones — one ear hears the base frequency, the other hears base + beat frequency.</div>`;
  let oscL=null, oscR=null, gainL=null, gainR=null;
  function stopBin(){
    if(!oscL) return;
    try{
      const ctx = getAudioCtx(), t = ctx.currentTime;
      [gainL,gainR].forEach(g=>{ g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0.0001, t+0.03); });
      oscL.stop(t+0.04); oscR.stop(t+0.04);
    }catch(e){}
    oscL=null; oscR=null; gainL=null; gainR=null;
  }
  setCleanup(stopBin);
  root.querySelector('#bbPlay').addEventListener('click', ()=>{
    if(oscL) return;
    const ctx = getAudioCtx();
    const base = +root.querySelector('#bbBase').value, beat = +root.querySelector('#bbBeat').value;
    const merger = ctx.createChannelMerger(2);
    oscL = ctx.createOscillator(); oscL.frequency.value = base;
    oscR = ctx.createOscillator(); oscR.frequency.value = base+beat;
    gainL = ctx.createGain(); gainR = ctx.createGain(); gainL.gain.value=0.15; gainR.gain.value=0.15;
    oscL.connect(gainL).connect(merger,0,0);
    oscR.connect(gainR).connect(merger,0,1);
    merger.connect(ctx.destination);
    oscL.start(); oscR.start();
  });
  root.querySelectorAll('#bbBase,#bbBeat').forEach(el=>el.addEventListener('input', ()=>{
    if(oscL){ oscL.frequency.value = +root.querySelector('#bbBase').value; oscR.frequency.value = +root.querySelector('#bbBase').value + +root.querySelector('#bbBeat').value; }
  }));
  root.querySelector('#bbStop').addEventListener('click', stopBin);
});

aud('decibelmeter','Decibel Meter', root=>{
  root.innerHTML = `
    <div class="counter-display" id="dbOut">—</div>
    <div class="segrow"><button class="btn primary" id="dbStart">Start</button><button class="btn" id="dbStop">Stop</button></div>
    <div class="hint">Uses your microphone. Not a calibrated instrument — treat as a rough relative indicator only, not a certified sound level meter.</div>`;
  let stream=null, raf=null, starting=false;
  function stopDb(){
    if(raf) cancelAnimationFrame(raf); raf=null;
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
    root.querySelector('#dbOut').textContent='—';
  }
  setCleanup(stopDb);
  root.querySelector('#dbStart').addEventListener('click', async ()=>{
    if(stream || starting) return;
    starting = true;
    try{
      stream = await navigator.mediaDevices.getUserMedia({audio:true});
      starting = false;
      const ctx = getAudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser(); analyser.fftSize=2048;
      source.connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      function loop(){
        analyser.getFloatTimeDomainData(data);
        let sum=0; for(let i=0;i<data.length;i++) sum+=data[i]*data[i];
        const rms = Math.sqrt(sum/data.length);
        const db = 20*Math.log10(rms||0.00001) + 100;
        root.querySelector('#dbOut').textContent = Math.max(0,Math.round(db))+' dB';
        raf = requestAnimationFrame(loop);
      }
      loop();
    }catch(e){ starting=false; root.querySelector('#dbOut').textContent = 'Mic access denied'; }
  });
  root.querySelector('#dbStop').addEventListener('click', stopDb);
});

aud('visualizer','Audio Visualizer', root=>{
  root.innerHTML = `
    <canvas id="avCanvas" width="600" height="200" style="max-width:100%;border:1px solid var(--line);border-radius:10px;background:#111"></canvas>
    <div class="segrow" style="margin-top:14px"><button class="btn primary" id="avStart">Start (mic)</button><button class="btn" id="avStop">Stop</button></div>`;
  const canvas = root.querySelector('#avCanvas'), ctx2d = canvas.getContext('2d');
  let stream=null, raf=null, starting=false;
  function stopViz(){
    if(raf) cancelAnimationFrame(raf); raf=null;
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
    ctx2d.fillStyle='#111'; ctx2d.fillRect(0,0,canvas.width,canvas.height);
  }
  setCleanup(stopViz);
  root.querySelector('#avStart').addEventListener('click', async ()=>{
    if(stream || starting) return;
    starting = true;
    try{
      stream = await navigator.mediaDevices.getUserMedia({audio:true});
      starting = false;
      const ctx = getAudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser(); analyser.fftSize=256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      function loop(){
        analyser.getByteFrequencyData(data);
        ctx2d.fillStyle='#111'; ctx2d.fillRect(0,0,canvas.width,canvas.height);
        const barW = canvas.width/data.length;
        data.forEach((v,i)=>{ ctx2d.fillStyle='#3fcb6b'; ctx2d.fillRect(i*barW, canvas.height-v, barW-1, v); });
        raf = requestAnimationFrame(loop);
      }
      loop();
    }catch(e){ starting=false; }
  });
  root.querySelector('#avStop').addEventListener('click', stopViz);
});

aud('soundrecorder','Sound Recorder', root=>{
  root.innerHTML = `
    <div style="text-align:center">
      <button class="btn primary" id="srStart">● Record</button>
      <button class="btn" id="srStop" style="display:none">■ Stop</button>
    </div>
    <div id="srPlayback" style="margin-top:16px"></div>`;
  let recorder=null, chunks=[], stream=null, objectUrl=null;
  const REC_TYPES = ['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'];
  function pickMimeType(){
    for(const t of REC_TYPES){ if(window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t; }
    return '';
  }
  function stopRec(){
    if(recorder && recorder.state!=='inactive'){ try{ recorder.stop(); }catch(e){} }
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  }
  setCleanup(stopRec);
  root.querySelector('#srStart').addEventListener('click', async ()=>{
    try{
      stream = await navigator.mediaDevices.getUserMedia({audio:true});
      const mimeType = pickMimeType();
      recorder = mimeType ? new MediaRecorder(stream, {mimeType}) : new MediaRecorder(stream);
      chunks = [];
      recorder.ondataavailable = e=>chunks.push(e.data);
      recorder.onstop = ()=>{
        if(objectUrl) URL.revokeObjectURL(objectUrl);
        const type = recorder.mimeType || 'audio/webm';
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
        const blob = new Blob(chunks, {type});
        objectUrl = URL.createObjectURL(blob);
        root.querySelector('#srPlayback').innerHTML = `<audio controls src="${objectUrl}" style="width:100%"></audio><div class="segrow" style="margin-top:10px"><a class="btn" href="${objectUrl}" download="recording.${ext}">Download</a></div>`;
        if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
      };
      recorder.start();
      root.querySelector('#srStart').style.display='none'; root.querySelector('#srStop').style.display='inline-block';
    }catch(e){ root.querySelector('#srPlayback').textContent = 'Microphone access denied.'; }
  });
  root.querySelector('#srStop').addEventListener('click', ()=>{
    if(recorder && recorder.state!=='inactive') recorder.stop();
    root.querySelector('#srStart').style.display='inline-block'; root.querySelector('#srStop').style.display='none';
  });
});

