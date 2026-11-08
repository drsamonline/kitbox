/* ================================================================
   IMAGE TOOLS (all processing happens locally in-browser)
   ================================================================ */
TOOLS.image = [];
let IMG_N = 0;
function imgtool(id, name, render){ register({cat:'image', id, name, render}); }
function readImageFile(file){ return new Promise((resolve,reject)=>{ const im=new Image(); const url=URL.createObjectURL(file); im.onload=()=>{ URL.revokeObjectURL(url); resolve(im); }; im.onerror=reject; im.src=url; }); }
function downloadCanvas(canvas, filename, type, quality){ const a=document.createElement('a'); a.download=filename; a.href=canvas.toDataURL(type||'image/png', quality); a.click(); }
const IMG_HINT = `<div class="hint">Processing happens entirely on your device — the image is never uploaded anywhere.</div>`;

imgtool('resize','Resize Image', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="rzFile" accept="image/*"></div>
    <div class="row">
      <div class="field"><label>Width (px)</label><input type="number" id="rzW"></div>
      <div class="field"><label>Height (px)</label><input type="number" id="rzH"></div>
    </div>
    <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--ink-soft);margin-bottom:10px"><input type="checkbox" id="rzLock" checked> Lock aspect ratio</label>
    <canvas id="rzCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:10px auto"></canvas>
    <div class="segrow" id="rzActions" style="display:none"><button class="btn primary" id="rzDownload">Download PNG</button></div>`;
  let pic=null, ratio=1;
  const canvas = root.querySelector('#rzCanvas'), ctx = canvas.getContext('2d');
  root.querySelector('#rzFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic = await readImageFile(file);
    ratio = pic.width/pic.height;
    root.querySelector('#rzW').value = pic.width;
    root.querySelector('#rzH').value = pic.height;
    draw();
  });
  function draw(){
    if(!pic) return;
    const w = +root.querySelector('#rzW').value||pic.width, h=+root.querySelector('#rzH').value||pic.height;
    canvas.width=w; canvas.height=h;
    ctx.drawImage(pic,0,0,w,h);
    canvas.style.display='block'; root.querySelector('#rzActions').style.display='flex';
  }
  root.querySelector('#rzW').addEventListener('input', ()=>{ if(root.querySelector('#rzLock').checked && pic) root.querySelector('#rzH').value = Math.round(root.querySelector('#rzW').value/ratio); draw(); });
  root.querySelector('#rzH').addEventListener('input', ()=>{ if(root.querySelector('#rzLock').checked && pic) root.querySelector('#rzW').value = Math.round(root.querySelector('#rzH').value*ratio); draw(); });
  root.querySelector('#rzDownload').addEventListener('click', ()=>downloadCanvas(canvas,'resized.png'));
});

imgtool('crop','Crop Image', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="cpFile" accept="image/*"></div>
    <div id="cpStage" style="position:relative;display:none;max-width:100%;margin:14px 0;touch-action:none">
      <img id="cpImg" style="max-width:100%;display:block;border-radius:10px">
      <div id="cpBox" style="position:absolute;border:2px solid var(--accent);background:rgba(255,255,255,0.15);cursor:move"></div>
    </div>
    <div class="field" id="cpAspectField" style="display:none"><label>Aspect ratio</label>
      <div class="segrow" id="cpAspectRow">
        ${[['Free',0],['1:1',1],['4:5',0.8],['5:4',1.25],['16:9',16/9],['9:16',9/16],['3:2',1.5]].map(([label,r])=>`<button class="btn cpAspect" data-r="${r}">${label}</button>`).join('')}
      </div>
    </div>
    <div class="field" id="cpSizeField" style="display:none"><label>Crop box size</label><input type="range" id="cpSize" min="10" max="90" value="60"></div>
    <div class="segrow" id="cpActions" style="display:none"><button class="btn primary" id="cpGo">Crop</button></div>
    <canvas id="cpOutCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="cpDlRow" style="display:none"><button class="btn primary" id="cpDownload">Download PNG</button></div>`;
  const stage=root.querySelector('#cpStage'), imgEl=root.querySelector('#cpImg'), box=root.querySelector('#cpBox');
  let natW=0, natH=0, aspect=0;
  function sizeBox(){
    const rect = imgEl.getBoundingClientRect();
    const pct = +root.querySelector('#cpSize').value/100;
    let w=rect.width*pct, h=rect.height*pct;
    if(aspect>0){
      if(w/h>aspect) w = h*aspect; else h = w/aspect;
    }
    box.style.left=Math.max(0,(rect.width-w)/2)+'px'; box.style.top=Math.max(0,(rect.height-h)/2)+'px';
    box.style.width=w+'px'; box.style.height=h+'px';
  }
  root.querySelector('#cpFile').addEventListener('change', e=>{
    const file=e.target.files[0]; if(!file) return;
    imgEl.onload = ()=>{
      natW=imgEl.naturalWidth; natH=imgEl.naturalHeight;
      stage.style.display='block'; root.querySelector('#cpActions').style.display='flex';
      root.querySelector('#cpSizeField').style.display='block'; root.querySelector('#cpAspectField').style.display='block';
      sizeBox();
    };
    imgEl.src = URL.createObjectURL(file);
  });
  root.querySelector('#cpSize').addEventListener('input', sizeBox);
  root.querySelectorAll('.cpAspect').forEach(b=>b.addEventListener('click', ()=>{
    aspect = +b.dataset.r;
    root.querySelectorAll('.cpAspect').forEach(x=>x.classList.remove('primary'));
    b.classList.add('primary');
    sizeBox();
  }));
  let dragging=false, startX,startY,startLeft,startTop;
  box.addEventListener('pointerdown', e=>{ dragging=true; startX=e.clientX; startY=e.clientY; startLeft=box.offsetLeft; startTop=box.offsetTop; box.setPointerCapture && box.setPointerCapture(e.pointerId); });
  box.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dx=e.clientX-startX, dy=e.clientY-startY;
    const rect = imgEl.getBoundingClientRect();
    let nl = Math.max(0, Math.min(startLeft+dx, rect.width-box.offsetWidth));
    let nt = Math.max(0, Math.min(startTop+dy, rect.height-box.offsetHeight));
    box.style.left=nl+'px'; box.style.top=nt+'px';
  });
  box.addEventListener('pointerup', ()=>dragging=false);
  root.querySelector('#cpGo').addEventListener('click', ()=>{
    const rect = imgEl.getBoundingClientRect();
    const scaleX = natW/rect.width, scaleY = natH/rect.height;
    const sx=box.offsetLeft*scaleX, sy=box.offsetTop*scaleY, sw=box.offsetWidth*scaleX, sh=box.offsetHeight*scaleY;
    const out = root.querySelector('#cpOutCanvas');
    out.width=Math.max(1,Math.round(sw)); out.height=Math.max(1,Math.round(sh));
    out.getContext('2d').drawImage(imgEl, sx,sy,sw,sh, 0,0,out.width,out.height);
    out.style.display='block'; root.querySelector('#cpDlRow').style.display='flex';
  });
  root.querySelector('#cpDownload').addEventListener('click', ()=>downloadCanvas(root.querySelector('#cpOutCanvas'),'cropped.png'));
});

imgtool('rounded','Rounded Image', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="rdFile" accept="image/*"></div>
    <div class="field"><label>Corner radius (px)</label><input type="range" id="rdRadius" min="0" max="200" value="30"></div>
    <canvas id="rdCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="rdActions" style="display:none"><button class="btn primary" id="rdDownload">Download PNG</button></div>`;
  let pic=null;
  const canvas=root.querySelector('#rdCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#rdFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic = await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    draw();
    canvas.style.display='block'; root.querySelector('#rdActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    const r = Math.min(+root.querySelector('#rdRadius').value, canvas.width/2, canvas.height/2);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.beginPath();
    const w=canvas.width,h=canvas.height;
    ctx.moveTo(r,0); ctx.arcTo(w,0,w,h,r); ctx.arcTo(w,h,0,h,r); ctx.arcTo(0,h,0,0,r); ctx.arcTo(0,0,w,0,r); ctx.closePath();
    ctx.clip();
    ctx.drawImage(pic,0,0);
    ctx.restore();
  }
  root.querySelector('#rdRadius').addEventListener('input', draw);
  root.querySelector('#rdDownload').addEventListener('click', ()=>downloadCanvas(canvas,'rounded.png'));
});

imgtool('gradientwallpaper','Gradient Wallpaper Maker', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Width</label><input type="number" id="gwW" value="1920"></div>
      <div class="field"><label>Height</label><input type="number" id="gwH" value="1080"></div>
    </div>
    <div class="row">
      <div class="field"><label>Color A</label><input type="color" id="gwA" value="#3fcb6b" style="width:100%;height:44px;border:none;border-radius:8px"></div>
      <div class="field"><label>Color B</label><input type="color" id="gwB" value="#2f86eb" style="width:100%;height:44px;border:none;border-radius:8px"></div>
    </div>
    <div class="field"><label>Angle (degrees)</label><input type="range" id="gwAngle" min="0" max="360" value="45"></div>
    <canvas id="gwCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;margin:14px auto;display:block"></canvas>
    <div class="segrow"><button class="btn primary" id="gwDownload">Download PNG</button></div>`;
  const canvas = root.querySelector('#gwCanvas'), ctx = canvas.getContext('2d');
  function draw(){
    const w=+root.querySelector('#gwW').value||1920, h=+root.querySelector('#gwH').value||1080;
    canvas.width=w; canvas.height=h;
    canvas.style.width='100%'; canvas.style.height='auto';
    const angle = (+root.querySelector('#gwAngle').value)*Math.PI/180;
    const x1 = w/2 - Math.cos(angle)*w/2, y1 = h/2 - Math.sin(angle)*h/2;
    const x2 = w/2 + Math.cos(angle)*w/2, y2 = h/2 + Math.sin(angle)*h/2;
    const grad = ctx.createLinearGradient(x1,y1,x2,y2);
    grad.addColorStop(0, root.querySelector('#gwA').value);
    grad.addColorStop(1, root.querySelector('#gwB').value);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#gwDownload').addEventListener('click', ()=>downloadCanvas(canvas,'gradient.png'));
  draw();
});

imgtool('trimtransparency','Trim Transparency', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload transparent PNG</label><input type="file" id="ttFile" accept="image/png"></div>
    <canvas id="ttCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto;background-image:repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%);background-size:16px 16px"></canvas>
    <div class="output" id="ttOut" style="display:none"></div>
    <div class="segrow" id="ttActions" style="display:none"><button class="btn primary" id="ttDownload">Download PNG</button></div>`;
  const canvas = root.querySelector('#ttCanvas'), ctx = canvas.getContext('2d');
  root.querySelector('#ttFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    const pic = await readImageFile(file);
    const tmp = document.createElement('canvas'); tmp.width=pic.width; tmp.height=pic.height;
    const tctx = tmp.getContext('2d'); tctx.drawImage(pic,0,0);
    const data = tctx.getImageData(0,0,tmp.width,tmp.height).data;
    let minX=tmp.width,minY=tmp.height,maxX=-1,maxY=-1;
    for(let y=0;y<tmp.height;y++) for(let x=0;x<tmp.width;x++){
      if(data[(y*tmp.width+x)*4+3] > 0){ if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
    }
    const out = root.querySelector('#ttOut'); out.style.display='block';
    if(maxX<0){ out.textContent='Image appears fully transparent — nothing to trim.'; return; }
    const w=maxX-minX+1, h=maxY-minY+1;
    canvas.width=w; canvas.height=h;
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(tmp, minX,minY,w,h, 0,0,w,h);
    canvas.style.display='block'; root.querySelector('#ttActions').style.display='flex';
    out.textContent = `Trimmed from ${tmp.width}×${tmp.height} to ${w}×${h}.`;
  });
  root.querySelector('#ttDownload').addEventListener('click', ()=>downloadCanvas(canvas,'trimmed.png'));
});

imgtool('flip','Flip Image', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="flFile" accept="image/*"></div>
    <div class="segrow"><button class="btn" id="flH">Flip horizontal</button><button class="btn" id="flV">Flip vertical</button></div>
    <canvas id="flCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="flActions" style="display:none"><button class="btn primary" id="flDownload">Download PNG</button></div>`;
  let pic=null, flipH=false, flipV=false;
  const canvas = root.querySelector('#flCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#flFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic = await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    flipH=false; flipV=false;
    draw();
    canvas.style.display='block'; root.querySelector('#flActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    ctx.save();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.translate(flipH?canvas.width:0, flipV?canvas.height:0);
    ctx.scale(flipH?-1:1, flipV?-1:1);
    ctx.drawImage(pic,0,0);
    ctx.restore();
  }
  root.querySelector('#flH').addEventListener('click', ()=>{ flipH=!flipH; draw(); });
  root.querySelector('#flV').addEventListener('click', ()=>{ flipV=!flipV; draw(); });
  root.querySelector('#flDownload').addEventListener('click', ()=>downloadCanvas(canvas,'flipped.png'));
});

imgtool('addtext','Add Text to Image', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="atFile" accept="image/*"></div>
    <div class="field"><label>Text</label><input type="text" id="atText" value="Your text here"></div>
    <div class="row">
      <div class="field"><label>Font size (px)</label><input type="number" id="atSize" value="48"></div>
      <div class="field"><label>Color</label><input type="color" id="atColor" value="#ffffff" style="width:100%;height:44px;border:none;border-radius:8px"></div>
    </div>
    <div class="field"><label>Position</label><select id="atPos"><option value="center">Center</option><option value="top">Top</option><option value="bottom" selected>Bottom</option></select></div>
    <canvas id="atCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="atActions" style="display:none"><button class="btn primary" id="atDownload">Download PNG</button></div>`;
  let pic=null;
  const canvas=root.querySelector('#atCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#atFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    draw();
    canvas.style.display='block'; root.querySelector('#atActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(pic,0,0);
    const text = root.querySelector('#atText').value;
    const size = +root.querySelector('#atSize').value||48;
    const color = root.querySelector('#atColor').value;
    const pos = root.querySelector('#atPos').value;
    ctx.font = `bold ${size}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign='center';
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=Math.max(1,size*0.05);
    const x = canvas.width/2;
    const y = pos==='top'? size*1.2 : pos==='bottom'? canvas.height-size*0.6 : canvas.height/2;
    ctx.textBaseline = pos==='top'?'top':pos==='bottom'?'bottom':'middle';
    ctx.strokeText(text,x,y);
    ctx.fillText(text,x,y);
  }
  root.querySelectorAll('#atText,#atSize,#atColor,#atPos').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#atDownload').addEventListener('click', ()=>downloadCanvas(canvas,'text-image.png'));
});

imgtool('blur','Blur Tool', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="blFile" accept="image/*"></div>
    <div class="field"><label>Blur amount (px)</label><input type="range" id="blAmt" min="0" max="30" value="5"></div>
    <canvas id="blCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="blActions" style="display:none"><button class="btn primary" id="blDownload">Download PNG</button></div>`;
  let pic=null;
  const canvas=root.querySelector('#blCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#blFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    draw();
    canvas.style.display='block'; root.querySelector('#blActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    const amt = +root.querySelector('#blAmt').value;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.filter = `blur(${amt}px)`;
    ctx.drawImage(pic,0,0);
    ctx.filter='none';
  }
  root.querySelector('#blAmt').addEventListener('input', draw);
  root.querySelector('#blDownload').addEventListener('click', ()=>downloadCanvas(canvas,'blurred.png'));
});

imgtool('compressor','Image Compressor', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="icFile" accept="image/*"></div>
    <div class="field"><label>Quality</label><input type="range" id="icQ" min="1" max="100" value="80"></div>
    <canvas id="icCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <table class="mono" id="icOut"></table>
    <div class="segrow" id="icActions" style="display:none"><button class="btn primary" id="icDownload">Download JPEG</button></div>`;
  let pic=null, origSize=0;
  const canvas=root.querySelector('#icCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#icFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    origSize = file.size;
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    ctx.drawImage(pic,0,0);
    canvas.style.display='block'; root.querySelector('#icActions').style.display='flex';
    update();
  });
  function update(){
    if(!pic) return;
    const q = +root.querySelector('#icQ').value/100;
    const dataUrl = canvas.toDataURL('image/jpeg', q);
    const approxBytes = Math.round((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3/4);
    root.querySelector('#icOut').innerHTML = [
      ['Original size', (origSize/1024).toFixed(1)+' KB'],
      ['Estimated compressed size', (approxBytes/1024).toFixed(1)+' KB'],
      ['Reduction', origSize? (100*(1-approxBytes/origSize)).toFixed(1)+'%' : '—']
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelector('#icQ').addEventListener('input', update);
  root.querySelector('#icDownload').addEventListener('click', ()=>{
    const q = +root.querySelector('#icQ').value/100;
    downloadCanvas(canvas,'compressed.jpg','image/jpeg',q);
  });
});

imgtool('formatconverter','Image Format Converter', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="fcFile" accept="image/*"></div>
    <div class="field"><label>Output format</label><select id="fcFormat"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div>
    <canvas id="fcCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto;background-image:repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%);background-size:16px 16px"></canvas>
    <div class="segrow" id="fcActions" style="display:none"><button class="btn primary" id="fcDownload">Download</button></div>
    <div class="hint">JPEG doesn't support transparency — converting to JPEG fills transparent areas with white. PNG and WebP keep transparency intact.</div>`;
  let pic=null;
  const canvas=root.querySelector('#fcCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#fcFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(pic,0,0);
    canvas.style.display='block'; root.querySelector('#fcActions').style.display='flex';
  });
  root.querySelector('#fcDownload').addEventListener('click', ()=>{
    const fmt = root.querySelector('#fcFormat').value;
    const ext = fmt==='image/png'?'png':fmt==='image/webp'?'webp':'jpg';
    if(fmt==='image/jpeg'){
      const out = document.createElement('canvas');
      out.width=canvas.width; out.height=canvas.height;
      const octx = out.getContext('2d');
      octx.fillStyle='#fff'; octx.fillRect(0,0,out.width,out.height);
      octx.drawImage(canvas,0,0);
      downloadCanvas(out,'converted.'+ext,fmt,0.92);
    } else {
      downloadCanvas(canvas,'converted.'+ext,fmt,0.92);
    }
  });
});

imgtool('mosaic','Mosaic Effect', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="mzFile" accept="image/*"></div>
    <div class="field"><label>Block size (px)</label><input type="range" id="mzBlock" min="2" max="50" value="10"></div>
    <canvas id="mzCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="mzActions" style="display:none"><button class="btn primary" id="mzDownload">Download PNG</button></div>`;
  let pic=null;
  const canvas=root.querySelector('#mzCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#mzFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    draw();
    canvas.style.display='block'; root.querySelector('#mzActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    const block = +root.querySelector('#mzBlock').value;
    const w=canvas.width, h=canvas.height;
    const smallW = Math.max(1,Math.round(w/block)), smallH = Math.max(1,Math.round(h/block));
    const tmp = document.createElement('canvas'); tmp.width=smallW; tmp.height=smallH;
    tmp.getContext('2d').drawImage(pic,0,0,smallW,smallH);
    ctx.imageSmoothingEnabled=false;
    ctx.clearRect(0,0,w,h);
    ctx.drawImage(tmp,0,0,smallW,smallH,0,0,w,h);
  }
  root.querySelector('#mzBlock').addEventListener('input', draw);
  root.querySelector('#mzDownload').addEventListener('click', ()=>downloadCanvas(canvas,'mosaic.png'));
});

imgtool('collage','Collage Maker', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload images (2–9)</label><input type="file" id="clFiles" accept="image/*" multiple></div>
    <div class="field"><label>Max images to use</label><select id="clLayout"><option value="2">2 (side by side)</option><option value="3">3</option><option value="4" selected>4 (2×2)</option><option value="6">6 (2×3)</option><option value="9">9 (3×3)</option></select></div>
    <div class="field"><label>Gap (px)</label><input type="range" id="clGap" min="0" max="30" value="8"></div>
    <canvas id="clCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="clActions" style="display:none"><button class="btn primary" id="clDownload">Download PNG</button></div>`;
  let images=[];
  const canvas=root.querySelector('#clCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#clFiles').addEventListener('change', async e=>{
    const files = [...e.target.files].slice(0,9);
    e.target.value='';
    images = await Promise.all(files.map(readImageFile));
    draw();
  });
  function draw(){
    if(!images.length) return;
    const n = Math.min(images.length, +root.querySelector('#clLayout').value);
    const cols = n<=2? n : n===3?3 : n<=4?2 : 3;
    const rows = Math.ceil(n/cols);
    const cellW=400, cellH=400;
    const gap = +root.querySelector('#clGap').value;
    canvas.width = cols*cellW + (cols+1)*gap;
    canvas.height = rows*cellH + (rows+1)*gap;
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<n;i++){
      const col=i%cols, row=Math.floor(i/cols);
      const x = gap+col*(cellW+gap), y=gap+row*(cellH+gap);
      const pic=images[i];
      const scale = Math.max(cellW/pic.width, cellH/pic.height);
      const sw=cellW/scale, sh=cellH/scale;
      const sx=(pic.width-sw)/2, sy=(pic.height-sh)/2;
      ctx.drawImage(pic, sx,sy,sw,sh, x,y,cellW,cellH);
    }
    canvas.style.display='block'; root.querySelector('#clActions').style.display='flex';
  }
  root.querySelectorAll('#clLayout,#clGap').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#clDownload').addEventListener('click', ()=>downloadCanvas(canvas,'collage.png'));
});

imgtool('enhancer','Image Enhancer', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="enFile" accept="image/*"></div>
    <div class="field"><label>Brightness (%)</label><input type="range" id="enB" min="50" max="150" value="100"></div>
    <div class="field"><label>Contrast (%)</label><input type="range" id="enC" min="50" max="150" value="100"></div>
    <div class="field"><label>Saturation (%)</label><input type="range" id="enS" min="0" max="200" value="100"></div>
    <canvas id="enCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="enActions" style="display:none"><button class="btn primary" id="enDownload">Download PNG</button><button class="btn ghost" id="enReset">Reset</button></div>`;
  let pic=null;
  const canvas=root.querySelector('#enCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#enFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    draw();
    canvas.style.display='block'; root.querySelector('#enActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    const b=+root.querySelector('#enB').value, c=+root.querySelector('#enC').value, s=+root.querySelector('#enS').value;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
    ctx.drawImage(pic,0,0);
    ctx.filter='none';
  }
  root.querySelectorAll('#enB,#enC,#enS').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#enReset').addEventListener('click', ()=>{ root.querySelector('#enB').value=100; root.querySelector('#enC').value=100; root.querySelector('#enS').value=100; draw(); });
  root.querySelector('#enDownload').addEventListener('click', ()=>downloadCanvas(canvas,'enhanced.png'));
});

imgtool('filters','Filters', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="ftFile" accept="image/*"></div>
    <div class="grid" id="ftPresets" style="grid-template-columns:repeat(3,1fr);margin:10px 0"></div>
    <canvas id="ftCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="ftActions" style="display:none"><button class="btn primary" id="ftDownload">Download PNG</button></div>`;
  const PRESETS = {
    'None':'none', 'Grayscale':'grayscale(100%)', 'Sepia':'sepia(100%)', 'Invert':'invert(100%)',
    'Vintage warm':'sepia(40%) saturate(140%) brightness(105%)', 'Cool blue':'hue-rotate(180deg) saturate(120%)', 'High contrast':'contrast(150%)'
  };
  let pic=null, current='none';
  const canvas=root.querySelector('#ftCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#ftPresets').innerHTML = Object.entries(PRESETS).map(([name,f])=>`<button class="tag" data-f="${f}"><div class="hole"></div><div class="name">${name}</div></button>`).join('');
  root.querySelector('#ftFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    draw();
    canvas.style.display='block'; root.querySelector('#ftActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.filter = current;
    ctx.drawImage(pic,0,0);
    ctx.filter='none';
  }
  root.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click', ()=>{ current=b.dataset.f; draw(); }));
  root.querySelector('#ftDownload').addEventListener('click', ()=>downloadCanvas(canvas,'filtered.png'));
});

imgtool('rotate','Rotate Image', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="rtFile2" accept="image/*"></div>
    <div class="segrow"><button class="btn" id="rtCCW">↺ Rotate 90° left</button><button class="btn" id="rtCW">↻ Rotate 90° right</button></div>
    <div class="field"><label>Fine angle</label><input type="range" id="rtAngle" min="0" max="359" value="0"></div>
    <canvas id="rtCanvas2" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="rtActions2" style="display:none"><button class="btn primary" id="rtDownload2">Download PNG</button></div>`;
  let pic=null, baseRotation=0;
  const canvas=root.querySelector('#rtCanvas2'), ctx=canvas.getContext('2d');
  root.querySelector('#rtFile2').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file); baseRotation=0; root.querySelector('#rtAngle').value=0;
    draw();
    canvas.style.display='block'; root.querySelector('#rtActions2').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    const fine = +root.querySelector('#rtAngle').value;
    const total = (baseRotation+fine)*Math.PI/180;
    const w=pic.width, h=pic.height;
    const cos=Math.abs(Math.cos(total)), sin=Math.abs(Math.sin(total));
    const newW = Math.ceil(w*cos+h*sin), newH = Math.ceil(w*sin+h*cos);
    canvas.width=newW; canvas.height=newH;
    ctx.clearRect(0,0,newW,newH);
    ctx.save();
    ctx.translate(newW/2,newH/2);
    ctx.rotate(total);
    ctx.drawImage(pic,-w/2,-h/2);
    ctx.restore();
  }
  root.querySelector('#rtCCW').addEventListener('click', ()=>{ baseRotation=(baseRotation-90+360)%360; draw(); });
  root.querySelector('#rtCW').addEventListener('click', ()=>{ baseRotation=(baseRotation+90)%360; draw(); });
  root.querySelector('#rtAngle').addEventListener('input', draw);
  root.querySelector('#rtDownload2').addEventListener('click', ()=>downloadCanvas(canvas,'rotated.png'));
});

imgtool('imageinfo','Image Info', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="iiFile" accept="image/*"></div>
    <table class="mono" id="iiOut"></table>`;
  root.querySelector('#iiFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    const pic = await readImageFile(file);
    const g = gcd(pic.width,pic.height);
    root.querySelector('#iiOut').innerHTML = [
      ['File name', file.name||'—'], ['File size', (file.size/1024).toFixed(1)+' KB'], ['Type', file.type||'—'],
      ['Dimensions', `${pic.width} × ${pic.height} px`], ['Megapixels', fmtNum(pic.width*pic.height/1e6,2)+' MP'],
      ['Aspect ratio', `${pic.width/g} : ${pic.height/g}`]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  });
});

imgtool('memegenerator','Meme Generator', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="mgFile" accept="image/*"></div>
    <div class="row">
      <div class="field"><label>Top text</label><input type="text" id="mgTop" value="TOP TEXT"></div>
      <div class="field"><label>Bottom text</label><input type="text" id="mgBottom" value="BOTTOM TEXT"></div>
    </div>
    <canvas id="mgCanvas" style="max-width:100%;border:1px solid var(--line);border-radius:10px;display:none;margin:14px auto"></canvas>
    <div class="segrow" id="mgActions" style="display:none"><button class="btn primary" id="mgDownload">Download PNG</button></div>`;
  let pic=null;
  const canvas=root.querySelector('#mgCanvas'), ctx=canvas.getContext('2d');
  root.querySelector('#mgFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic=await readImageFile(file);
    canvas.width=pic.width; canvas.height=pic.height;
    draw();
    canvas.style.display='block'; root.querySelector('#mgActions').style.display='flex';
  });
  function drawCaption(text, y){
    const size = Math.round(canvas.width/12);
    ctx.font = `bold ${size}px Impact, sans-serif`;
    ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.strokeStyle='#000'; ctx.lineWidth=size*0.08;
    ctx.textBaseline = y<canvas.height/2 ? 'top':'bottom';
    ctx.strokeText(text.toUpperCase(), canvas.width/2, y);
    ctx.fillText(text.toUpperCase(), canvas.width/2, y);
  }
  function draw(){
    if(!pic) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(pic,0,0);
    drawCaption(root.querySelector('#mgTop').value, canvas.height*0.03);
    drawCaption(root.querySelector('#mgBottom').value, canvas.height*0.97);
  }
  root.querySelectorAll('#mgTop,#mgBottom').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#mgDownload').addEventListener('click', ()=>downloadCanvas(canvas,'meme.png'));
});

imgtool('asciiart','ASCII Art from Image', root=>{
  root.innerHTML = `
    ${IMG_HINT}
    <div class="field"><label>Upload image</label><input type="file" id="aaFile" accept="image/*"></div>
    <div class="field"><label>Width (characters)</label><input type="range" id="aaWidth" min="30" max="160" value="80"></div>
    <div class="output" id="aaOut" style="font-family:var(--mono);font-size:5px;line-height:5px;white-space:pre;overflow-x:auto">Upload an image to begin.</div>
    <div class="segrow" id="aaActions" style="display:none"><button class="btn" id="aaCopy">Copy text</button></div>`;
  const RAMP = '@%#*+=-:. ';
  let pic=null;
  root.querySelector('#aaFile').addEventListener('change', async e=>{
    const file=e.target.files[0]; if(!file) return;
    e.target.value='';
    pic = await readImageFile(file);
    draw();
    root.querySelector('#aaActions').style.display='flex';
  });
  function draw(){
    if(!pic) return;
    const cols = +root.querySelector('#aaWidth').value;
    const rows = Math.round(cols * (pic.height/pic.width) * 0.5);
    const tmp = document.createElement('canvas'); tmp.width=cols; tmp.height=rows;
    tmp.getContext('2d').drawImage(pic,0,0,cols,rows);
    const data = tmp.getContext('2d').getImageData(0,0,cols,rows).data;
    let out='';
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const i=(y*cols+x)*4;
        const brightness = (data[i]*0.299+data[i+1]*0.587+data[i+2]*0.114)/255;
        out += RAMP[Math.floor((1-brightness)*(RAMP.length-1))];
      }
      out+='\n';
    }
    root.querySelector('#aaOut').textContent = out;
  }
  root.querySelector('#aaWidth').addEventListener('input', draw);
  root.querySelector('#aaCopy').addEventListener('click', ()=>{
    navigator.clipboard && navigator.clipboard.writeText(root.querySelector('#aaOut').textContent).catch(()=>{});
  });
});

/* ================================================================
   SCIENCE TOOLS
   ================================================================ */
TOOLS.science = [];
let SCI_N = 0;
function sci(id, name, render){ register({cat:'science', id, name, render}); }

sci('ohmslaw','Ohm\'s Law', root=>{
  root.innerHTML = `
    <div class="hint">Enter any two values to solve for the rest (V = I × R, P = V × I).</div>
    <div class="row">
      <div class="field"><label>Voltage (V)</label><input type="number" id="ohV"></div>
      <div class="field"><label>Current (A)</label><input type="number" id="ohI"></div>
    </div>
    <div class="field"><label>Resistance (Ω)</label><input type="number" id="ohR"></div>
    <div class="output" id="ohOut">—</div>`;
  function update(){
    const V=root.querySelector('#ohV').value, I=root.querySelector('#ohI').value, R=root.querySelector('#ohR').value;
    const out = root.querySelector('#ohOut');
    const filled = [V,I,R].filter(x=>x!=='').length;
    if(filled<2){ out.textContent='Enter any two values.'; return; }
    let v=+V,i=+I,r=+R;
    if(V===''){ v=i*r; } else if(I===''){ i=r?v/r:NaN; } else if(R===''){ r=i?v/i:NaN; }
    out.innerHTML = `V = ${fmtNum(v,4)} V\nI = ${fmtNum(i,4)} A\nR = ${fmtNum(r,4)} Ω\nP = ${fmtNum(v*i,4)} W`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
});

sci('forceaccel','Force & Acceleration', root=>{
  root.innerHTML = `
    <div class="hint">Newton's second law: F = m × a. Enter any two values.</div>
    <div class="row">
      <div class="field"><label>Force (N)</label><input type="number" id="faF"></div>
      <div class="field"><label>Mass (kg)</label><input type="number" id="faM"></div>
    </div>
    <div class="field"><label>Acceleration (m/s²)</label><input type="number" id="faA"></div>
    <div class="output" id="faOut">—</div>`;
  function update(){
    const F=root.querySelector('#faF').value, M=root.querySelector('#faM').value, A=root.querySelector('#faA').value;
    const out = root.querySelector('#faOut');
    const filled=[F,M,A].filter(x=>x!=='').length;
    if(filled<2){ out.textContent='Enter any two values.'; return; }
    let f=+F,m=+M,a=+A;
    if(F===''){ f=m*a; } else if(M===''){ m=a?f/a:NaN; } else if(A===''){ a=m?f/m:NaN; }
    out.textContent = `F = ${fmtNum(f,4)} N\nm = ${fmtNum(m,4)} kg\na = ${fmtNum(a,4)} m/s²`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
});

const ATOMIC_WEIGHTS = {H:1.008,He:4.0026,Li:6.94,Be:9.0122,B:10.81,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.180,
Na:22.990,Mg:24.305,Al:26.982,Si:28.085,P:30.974,S:32.06,Cl:35.45,Ar:39.948,K:39.098,Ca:40.078,
Sc:44.956,Ti:47.867,V:50.942,Cr:51.996,Mn:54.938,Fe:55.845,Co:58.933,Ni:58.693,Cu:63.546,Zn:65.38,
Ga:69.723,Ge:72.630,As:74.922,Se:78.971,Br:79.904,Kr:83.798,Rb:85.468,Sr:87.62,Y:88.906,Zr:91.224,
Nb:92.906,Mo:95.95,Tc:98,Ru:101.07,Rh:102.91,Pd:106.42,Ag:107.87,Cd:112.41,In:114.82,Sn:118.71,
Sb:121.76,Te:127.60,I:126.90,Xe:131.29,Cs:132.91,Ba:137.33,La:138.91,Ce:140.12,Hf:178.49,Ta:180.95,
W:183.84,Re:186.21,Os:190.23,Ir:192.22,Pt:195.08,Au:196.97,Hg:200.59,Tl:204.38,Pb:207.2,Bi:208.98,
Th:232.04,U:238.03};
function molarMass(formula){
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m, total=0, breakdown=[], remaining=formula.replace(/\s/g,'');
  const matched = remaining.match(re) ? remaining.match(re).join('') : '';
  if(matched !== remaining) return null;
  while((m = re.exec(formula.replace(/\s/g,'')))){
    if(!m[0]) continue;
    const el = m[1], count = m[2]?parseInt(m[2]):1;
    if(!ATOMIC_WEIGHTS[el]) return null;
    total += ATOMIC_WEIGHTS[el]*count;
    breakdown.push(`${el}${count>1?count:''}: ${fmtNum(ATOMIC_WEIGHTS[el]*count,3)}`);
  }
  return {total, breakdown};
}
sci('molarmass','Molar Mass Calculator', root=>{
  root.innerHTML = `<div class="field"><label>Chemical formula</label><input type="text" id="mmIn" value="H2O" placeholder="e.g. C6H12O6, NaCl, CaCO3"></div>
    <div class="output" id="mmOut">—</div>
    <div class="hint">Supports common elements (H–U) with standard integer subscripts. Doesn't yet support parentheses/hydrates like Ca(OH)2 or CuSO4·5H2O.</div>`;
  root.querySelector('#mmIn').addEventListener('input', e=>{
    const out = root.querySelector('#mmOut');
    const result = molarMass(e.target.value);
    if(!result){ out.textContent='Could not parse — check element symbols and formula format.'; return; }
    out.innerHTML = `<span class="big">${fmtNum(result.total,3)} g/mol</span>\n\n${result.breakdown.join('\n')}`;
  });
  root.querySelector('#mmIn').dispatchEvent(new Event('input'));
});

sci('phestimator','pH Estimator', root=>{
  root.innerHTML = `
    <div class="field"><label>[H⁺] concentration (mol/L)</label><input type="text" id="phH" placeholder="e.g. 1e-7 or 0.0000001"></div>
    <div class="output" id="phOut1">—</div>
    <div class="divider"></div>
    <div class="field"><label>pH value</label><input type="number" id="phVal" min="0" max="14" step="0.1"></div>
    <div class="output" id="phOut2">—</div>`;
  root.querySelector('#phH').addEventListener('input', e=>{
    const h = parseFloat(e.target.value);
    const out = root.querySelector('#phOut1');
    if(!h || h<=0){ out.textContent='—'; return; }
    const ph = -Math.log10(h);
    out.innerHTML = `pH = <span class="big">${fmtNum(ph,2)}</span> (${ph<7?'acidic':ph>7?'basic':'neutral'})`;
  });
  root.querySelector('#phVal').addEventListener('input', e=>{
    const ph = +e.target.value;
    const out = root.querySelector('#phOut2');
    if(e.target.value===''){ out.textContent='—'; return; }
    out.textContent = `[H⁺] = ${(Math.pow(10,-ph)).toExponential(3)} mol/L`;
  });
});

sci('halflife','Half-Life Calculator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Initial amount</label><input type="number" id="hlN0" value="100"></div>
      <div class="field"><label>Half-life</label><input type="number" id="hlHalf" value="6"></div>
    </div>
    <div class="field"><label>Elapsed time (same units as half-life)</label><input type="number" id="hlT" value="12"></div>
    <div class="output" id="hlOut">—</div>`;
  function update(){
    const N0=+root.querySelector('#hlN0').value, half=+root.querySelector('#hlHalf').value, t=+root.querySelector('#hlT').value;
    const out = root.querySelector('#hlOut');
    if(!half){ out.textContent='Enter a non-zero half-life.'; return; }
    const remaining = N0*Math.pow(0.5, t/half);
    out.innerHTML = `Remaining: <span class="big">${fmtNum(remaining,4)}</span>\nDecayed: ${fmtNum(N0-remaining,4)}\nHalf-lives elapsed: ${fmtNum(t/half,3)}`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

sci('speedofsound','Speed of Sound', root=>{
  root.innerHTML = `<div class="field"><label>Air temperature (°C)</label><input type="number" id="ssT" value="20"></div>
    <div class="output" id="ssOut">—</div>`;
  root.querySelector('#ssT').addEventListener('input', e=>{
    const t = +e.target.value;
    const v = 331.3 + 0.606*t;
    root.querySelector('#ssOut').innerHTML = `<span class="big">${fmtNum(v,2)} m/s</span>\n${fmtNum(v*3.6,1)} km/h · ${fmtNum(v*2.237,1)} mph`;
  });
  root.querySelector('#ssT').dispatchEvent(new Event('input'));
});

sci('density','Density Calculator', root=>{
  root.innerHTML = `
    <div class="hint">ρ = m / V — enter any two values.</div>
    <div class="row">
      <div class="field"><label>Mass (kg)</label><input type="number" id="dnM"></div>
      <div class="field"><label>Volume (m³)</label><input type="number" id="dnV"></div>
    </div>
    <div class="field"><label>Density (kg/m³)</label><input type="number" id="dnD"></div>
    <div class="output" id="dnOut">—</div>`;
  function update(){
    const M=root.querySelector('#dnM').value, V=root.querySelector('#dnV').value, D=root.querySelector('#dnD').value;
    const out = root.querySelector('#dnOut');
    const filled=[M,V,D].filter(x=>x!=='').length;
    if(filled<2){ out.textContent='Enter any two values.'; return; }
    let m=+M,v=+V,d=+D;
    if(M===''){ m=d*v; } else if(V===''){ v=d?m/d:NaN; } else if(D===''){ d=v?m/v:NaN; }
    out.textContent = `Mass = ${fmtNum(m,4)} kg\nVolume = ${fmtNum(v,6)} m³\nDensity = ${fmtNum(d,4)} kg/m³ (${fmtNum(d/1000,4)} g/cm³)`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
});

sci('wavelengthfreq','Wavelength ↔ Frequency', root=>{
  root.innerHTML = `
    <div class="hint">c = f × λ (speed of light ≈ 3×10⁸ m/s)</div>
    <div class="field"><label>Wavelength (nm)</label><input type="number" id="wfLambda" value="500"></div>
    <div class="output" id="wfOut1">—</div>
    <div class="divider"></div>
    <div class="field"><label>Frequency (THz)</label><input type="number" id="wfFreq"></div>
    <div class="output" id="wfOut2">—</div>`;
  const c = 299792458;
  root.querySelector('#wfLambda').addEventListener('input', e=>{
    const nm = +e.target.value;
    const out = root.querySelector('#wfOut1');
    if(!nm){ out.textContent='—'; return; }
    const freq = c/(nm*1e-9);
    out.textContent = `Frequency: ${fmtNum(freq/1e12,4)} THz`;
  });
  root.querySelector('#wfFreq').addEventListener('input', e=>{
    const thz = +e.target.value;
    const out = root.querySelector('#wfOut2');
    if(!thz){ out.textContent='—'; return; }
    const lambda = c/(thz*1e12);
    out.textContent = `Wavelength: ${fmtNum(lambda*1e9,4)} nm`;
  });
  root.querySelector('#wfLambda').dispatchEvent(new Event('input'));
});

const ELEMENT_NAMES = {H:'Hydrogen',He:'Helium',Li:'Lithium',Be:'Beryllium',B:'Boron',C:'Carbon',N:'Nitrogen',O:'Oxygen',F:'Fluorine',Ne:'Neon',
Na:'Sodium',Mg:'Magnesium',Al:'Aluminium',Si:'Silicon',P:'Phosphorus',S:'Sulfur',Cl:'Chlorine',Ar:'Argon',K:'Potassium',Ca:'Calcium',
Sc:'Scandium',Ti:'Titanium',V:'Vanadium',Cr:'Chromium',Mn:'Manganese',Fe:'Iron',Co:'Cobalt',Ni:'Nickel',Cu:'Copper',Zn:'Zinc',
Ga:'Gallium',Ge:'Germanium',As:'Arsenic',Se:'Selenium',Br:'Bromine',Kr:'Krypton',Rb:'Rubidium',Sr:'Strontium',Y:'Yttrium',Zr:'Zirconium',
Nb:'Niobium',Mo:'Molybdenum',Tc:'Technetium',Ru:'Ruthenium',Rh:'Rhodium',Pd:'Palladium',Ag:'Silver',Cd:'Cadmium',In:'Indium',Sn:'Tin',
Sb:'Antimony',Te:'Tellurium',I:'Iodine',Xe:'Xenon',Cs:'Caesium',Ba:'Barium',La:'Lanthanum',Ce:'Cerium',Hf:'Hafnium',Ta:'Tantalum',
W:'Tungsten',Re:'Rhenium',Os:'Osmium',Ir:'Iridium',Pt:'Platinum',Au:'Gold',Hg:'Mercury',Tl:'Thallium',Pb:'Lead',Bi:'Bismuth',
Th:'Thorium',U:'Uranium'};
sci('periodictable','Periodic Table', root=>{
  root.innerHTML = `
    <div class="field"><label>Search by symbol or name</label><input type="text" id="ptSearch" placeholder="e.g. Fe or Iron"></div>
    <table class="mono" id="ptOut"></table>`;
  function draw(filter){
    const f = (filter||'').toLowerCase();
    const rows = Object.entries(ATOMIC_WEIGHTS).filter(([sym])=>{
      const name = ELEMENT_NAMES[sym]||'';
      return !f || sym.toLowerCase().includes(f) || name.toLowerCase().includes(f);
    });
    root.querySelector('#ptOut').innerHTML = rows.length
      ? `<tr><th>Symbol</th><th>Name</th><th>Atomic weight</th></tr>` + rows.map(([sym,w])=>`<tr><td>${sym}</td><td>${ELEMENT_NAMES[sym]||'—'}</td><td>${w}</td></tr>`).join('')
      : '<tr><td>No matching element.</td></tr>';
  }
  root.querySelector('#ptSearch').addEventListener('input', e=>draw(e.target.value));
  draw('');
});

