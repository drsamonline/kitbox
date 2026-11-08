/* ================================================================
   B25 — a QR payload builder, UTM, and a month of sun.

   The QR *encoder* has been in the app since 1.0.0; what was missing is the
   thing you actually scan — a WiFi join string, a contact card, an otpauth
   URI. The encoder is reused here rather than reimplemented.
   ================================================================ */

/* ---------------- Generator (1) ---------------- */

gen('qrpayload','QR Payload Builder', root=>{
  root.innerHTML = `
    <div class="field"><label>What should the code do?</label><select id="qpType">
      <option value="wifi">Join a WiFi network</option>
      <option value="vcard">Save a contact</option>
      <option value="email">Send an email</option>
      <option value="sms">Send an SMS</option>
      <option value="geo">Open a location</option>
      <option value="otp">Set up a TOTP account</option>
      <option value="url">Open a link</option>
    </select></div>
    <div id="qpFields"></div>
    <div id="qpPreview" style="margin:14px 0;text-align:center"></div>
    <div class="output" id="qpOut" style="word-break:break-all;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">The string inside the code, built to the format each reader expects. WiFi codes with a hidden network or a WPA3 password still use <span class="mono">T:WPA</span> — the type field is coarser than the network.</div>`;
  const FIELDS = {
    wifi: [['Network name (SSID)','qpSsid','text',''],['Password','qpPass','text',''],['Security','qpSec','select','WPA|WEP|nopass'],['Hidden network','qpHidden','check','']],
    vcard: [['Full name','qpName','text',''],['Phone','qpPhone','text',''],['Email','qpEmail','text',''],['Organisation','qpOrg','text',''],['Title','qpTitle','text','']],
    email: [['To','qpTo','text',''],['Subject','qpSub','text',''],['Body','qpBody','text','']],
    sms: [['Number','qpSms','text',''],['Message','qpMsg','text','']],
    geo: [['Latitude','qpLat','text',''],['Longitude','qpLon','text',''],['Label','qpLabel','text','']],
    otp: [['Issuer','qpIssuer','text',''],['Account','qpAcct','text',''],['Base32 secret','qpSecret','text',''],['Digits','qpDigits','select','6|8']],
    url: [['URL','qpUrl','text','https://']]
  };
  const esc = s => String(s).replace(/([\\;,:"])/g, '\\$1');
  function payload(){
    const v = id => (root.querySelector('#' + id) ? root.querySelector('#' + id).value : '');
    const type = root.querySelector('#qpType').value;
    if(type === 'wifi'){
      const hidden = root.querySelector('#qpHidden').checked;
      return 'WIFI:T:' + v('qpSec') + ';S:' + esc(v('qpSsid')) + ';P:' + esc(v('qpPass')) + ';' + (hidden ? 'H:true;' : '') + ';';
    }
    if(type === 'vcard'){
      const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
      if(v('qpName')) lines.push('FN:' + v('qpName'), 'N:' + v('qpName'));
      if(v('qpOrg')) lines.push('ORG:' + v('qpOrg'));
      if(v('qpTitle')) lines.push('TITLE:' + v('qpTitle'));
      if(v('qpPhone')) lines.push('TEL;TYPE=CELL:' + v('qpPhone'));
      if(v('qpEmail')) lines.push('EMAIL:' + v('qpEmail'));
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    if(type === 'email'){
      const q = [];
      if(v('qpSub')) q.push('subject=' + encodeURIComponent(v('qpSub')));
      if(v('qpBody')) q.push('body=' + encodeURIComponent(v('qpBody')));
      return 'mailto:' + v('qpTo') + (q.length ? '?' + q.join('&') : '');
    }
    if(type === 'sms') return 'SMSTO:' + v('qpSms') + ':' + v('qpMsg');
    if(type === 'geo') return 'geo:' + v('qpLat') + ',' + v('qpLon') + (v('qpLabel') ? '?q=' + v('qpLat') + ',' + v('qpLon') + '(' + encodeURIComponent(v('qpLabel')) + ')' : '');
    if(type === 'otp') return 'otpauth://totp/' + encodeURIComponent(v('qpIssuer')) + ':' + encodeURIComponent(v('qpAcct')) +
      '?secret=' + v('qpSecret').toUpperCase().replace(/[^A-Z2-7]/g, '') + '&issuer=' + encodeURIComponent(v('qpIssuer')) +
      '&digits=' + v('qpDigits') + '&period=30';
    return v('qpUrl');
  }
  function renderFields(){
    const type = root.querySelector('#qpType').value;
    root.querySelector('#qpFields').innerHTML = FIELDS[type].map(([label, id, kind, options])=>{
      if(kind === 'select') return `<div class="field"><label>${label}</label><select id="${id}">${options.split('|').map(o=>`<option>${o}</option>`).join('')}</select></div>`;
      if(kind === 'check') return `<label style="display:flex;gap:8px;align-items:center;padding:6px 0"><input type="checkbox" id="${id}"> ${label}</label>`;
      return `<div class="field"><label>${label}</label><input type="text" id="${id}" value="${options}"></div>`;
    }).join('');
    root.querySelectorAll('#qpFields input, #qpFields select').forEach(el=>el.addEventListener('input', draw));
    draw();
  }
  function draw(){
    const text = payload();
    root.querySelector('#qpOut').textContent = text;
    const wrap = root.querySelector('#qpPreview');
    if(!text){ wrap.innerHTML = ''; return; }
    try{
      const { size, matrix } = QR.encode(text, 'M');
      const scale = 5, quiet = 4, dim = (size + quiet*2) * scale;
      const canvas = document.createElement('canvas');
      canvas.width = dim; canvas.height = dim;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, dim, dim);
      ctx.fillStyle = '#000';
      for(let r=0;r<size;r++) for(let c=0;c<size;c++) if(matrix[r][c]) ctx.fillRect((c+quiet)*scale, (r+quiet)*scale, scale, scale);
      canvas.style.border = '1px solid var(--line)';
      canvas.style.borderRadius = '8px';
      canvas.style.background = '#fff';
      wrap.innerHTML = '';
      wrap.appendChild(canvas);
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Download PNG';
      btn.style.marginTop = '10px';
      btn.addEventListener('click', ()=> canvas.toBlob(b=>saveBlob(b, 'qr-' + root.querySelector('#qpType').value + '.png')));
      wrap.appendChild(btn);
    }catch(e){
      wrap.innerHTML = '<div class="hint">' + escapeHtml(e.message) + '</div>';
    }
  }
  root.querySelector('#qpType').addEventListener('change', renderFields);
  renderFields();
});

/* ---------------- Geo (1) ---------------- */

geo('utm','UTM Converter', root=>{
  root.innerHTML = `
    <div class="segrow" id="utMode">
      <button class="btn" data-ut="toUtm">Latitude / longitude → UTM</button>
      <button class="btn" data-ut="toLatLon">UTM → latitude / longitude</button>
    </div>
    <div id="utFields"></div>
    <div class="output" id="utOut">—</div>
    <div class="hint">WGS84, the projection a GPS receiver and a survey sheet both use. The zone is 1–60 east from the antimeridian; the letter runs C to X, skipping I and O. Norway and Svalbard have wider zones, and this does not model those exceptions.</div>`;
  let mode = 'toUtm';
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function fields(){
    root.querySelector('#utFields').innerHTML = mode === 'toUtm'
      ? `<div class="row"><div class="field"><label>Latitude</label><input type="number" id="utLat" value="22.3072" step="0.0001"></div>
         <div class="field"><label>Longitude</label><input type="number" id="utLon" value="73.1812" step="0.0001"></div></div>`
      : `<div class="row"><div class="field"><label>Zone</label><input type="number" id="utZone" value="43" min="1" max="60"></div>
         <div class="field"><label>Band letter</label><input type="text" id="utBand" value="Q" maxlength="1"></div></div>
         <div class="row"><div class="field"><label>Easting (m)</label><input type="number" id="utE" value="313000"></div>
         <div class="field"><label>Northing (m)</label><input type="number" id="utN" value="2468000"></div></div>`;
    root.querySelectorAll('#utFields input').forEach(el=>el.addEventListener('input', draw));
    draw();
  }
  function toUtm(lat, lon){
    const a = 6378137.0, f = 1 / 298.257223563;
    const e2 = f * (2 - f), k0 = 0.9996;
    let zone = Math.floor((lon + 180) / 6) + 1;
    let lon0 = (zone - 1) * 6 - 180 + 3;
    if(lat >= 56 && lat < 64 && lon >= 3 && lon < 12) { zone = 32; lon0 = 9; }
    const BANDS = 'CDEFGHJKLMNPQRSTUVWX';
    const band = lat < -80 || lat > 84 ? '?' : BANDS[Math.floor((lat + 80) / 8)];
    const phi = lat * D2R, lam = lon * D2R, lam0 = lon0 * D2R;
    const ep2 = e2 / (1 - e2);
    const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
    const T = Math.tan(phi) ** 2;
    const C = ep2 * Math.cos(phi) ** 2;
    const A = Math.cos(phi) * (lam - lam0);
    const M = a * ((1 - e2/4 - 3*e2*e2/64 - 5*e2**3/256) * phi
      - (3*e2/8 + 3*e2*e2/32 + 45*e2**3/1024) * Math.sin(2*phi)
      + (15*e2*e2/256 + 45*e2**3/1024) * Math.sin(4*phi)
      - (35*e2**3/3072) * Math.sin(6*phi));
    const easting = k0 * N * (A + (1-T+C)*A**3/6 + (5-18*T+T*T+72*C-58*ep2)*A**5/120) + 500000;
    let northing = k0 * (M + N * Math.tan(phi) * (A*A/2 + (5-T+9*C+4*C*C)*A**4/24 + (61-58*T+T*T+600*C-330*ep2)*A**6/720));
    if(lat < 0) northing += 10000000;
    return { zone, band, easting, northing };
  }
  function toLatLon(zone, band, easting, northing){
    const a = 6378137.0, f = 1 / 298.257223563;
    const e2 = f * (2 - f), k0 = 0.9996, e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const BANDS = 'CDEFGHJKLMNPQRSTUVWX';
    const south = band && BANDS.indexOf(band.toUpperCase()) < BANDS.indexOf('N');
    const x = easting - 500000, y = south ? northing - 10000000 : northing;
    const M = y / k0;
    const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2**3/256));
    const phi1 = mu + (3*e1/2 - 27*e1**3/32) * Math.sin(2*mu)
      + (21*e1*e1/16 - 55*e1**4/32) * Math.sin(4*mu)
      + (151*e1**3/96) * Math.sin(6*mu);
    const ep2 = e2 / (1 - e2);
    const C1 = ep2 * Math.cos(phi1) ** 2, T1 = Math.tan(phi1) ** 2;
    const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
    const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1) ** 2, 1.5);
    const D = x / (N1 * k0);
    const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D*D/2
      - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*ep2) * D**4/24
      + (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*ep2 - 3*C1*C1) * D**6/720);
    const lon0 = (zone - 1) * 6 - 180 + 3;
    const lon = (D - (1 + 2*T1 + C1) * D**3/6
      + (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*ep2 + 24*T1*T1) * D**5/120) / Math.cos(phi1);
    return { lat: lat * R2D, lon: lon0 + lon * R2D };
  }
  function draw(){
    const out = root.querySelector('#utOut');
    try{
      if(mode === 'toUtm'){
        const lat = Number(root.querySelector('#utLat').value), lon = Number(root.querySelector('#utLon').value);
        if(Math.abs(lat) > 84){ out.textContent = 'UTM covers 80°S to 84°N. Outside that, use a polar stereographic projection.'; return; }
        const r = toUtm(lat, lon);
        out.innerHTML = `<table class="mono">
          <tr><td>Zone</td><td>${r.zone}${r.band}</td></tr>
          <tr><td>Easting</td><td>${r.easting.toFixed(2)} m</td></tr>
          <tr><td>Northing</td><td>${r.northing.toFixed(2)} m</td></tr>
          <tr><td>Written</td><td>${r.zone}${r.band} ${r.easting.toFixed(0)}E ${r.northing.toFixed(0)}N</td></tr>
        </table>`;
      } else {
        const zone = Math.min(60, Math.max(1, Number(root.querySelector('#utZone').value) || 1));
        const band = root.querySelector('#utBand').value || 'N';
        const r = toLatLon(zone, band, Number(root.querySelector('#utE').value) || 0, Number(root.querySelector('#utN').value) || 0);
        out.innerHTML = `<table class="mono">
          <tr><td>Latitude</td><td>${r.lat.toFixed(6)}°</td></tr>
          <tr><td>Longitude</td><td>${r.lon.toFixed(6)}°</td></tr>
          <tr><td>Decimal pair</td><td>${r.lat.toFixed(6)}, ${r.lon.toFixed(6)}</td></tr>
        </table>`;
      }
    }catch(e){ out.textContent = 'Could not convert: ' + (e.message || e); }
  }
  root.querySelectorAll('[data-ut]').forEach(b=>b.addEventListener('click', ()=>{ mode = b.dataset.ut; fields(); }));
  fields();
});

/* ---------------- Almanac (1) ---------------- */

alm('suntable','Sun Table for a Month', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Year</label><input type="number" id="stYear" value="2026" min="1900" max="2100"></div>
      <div class="field"><label>Month</label><select id="stMonth">${['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i)=>`<option value="${i+1}"${i===10?' selected':''}>${m}</option>`).join('')}</select></div>
    </div>
    <div class="row">
      <div class="field"><label>Latitude</label><input type="number" id="stLat" value="22.3072" step="0.0001"></div>
      <div class="field"><label>Longitude</label><input type="number" id="stLon" value="73.1812" step="0.0001"></div>
    </div>
    <div class="output" id="stOut">—</div>
    <div class="hint">Sunrise, sunset and day length for each day of the month, in local time. A whole month at once is what you want when planning around light — the single-day tools answer a different question.</div>`;
  function draw(){
    const year = Number(root.querySelector('#stYear').value) || 2026;
    const month = Number(root.querySelector('#stMonth').value);
    const lat = Number(root.querySelector('#stLat').value) || 0;
    const lon = Number(root.querySelector('#stLon').value) || 0;
    const tz = -(new Date().getTimezoneOffset()) / 60;
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const fmt = h => {
      const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.round((h - Math.floor(h)) * 60);
      return String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    };
    const rows = [];
    for(let d=1; d<=days; d++){
      const ss = ASTRO.sunriseSunset(new Date(Date.UTC(year, month - 1, d, 12)), lat, lon);
      if(ss.polar){ rows.push([d, ss.polar === 'day' ? 'midnight sun' : 'polar night', '—', '—']); continue; }
      const rise = ss.sunrise + tz, set = ss.sunset + tz;
      const length = set - rise;
      rows.push([d, fmt(rise), fmt(set), Math.floor(length) + 'h ' + Math.round((length % 1) * 60) + 'm']);
    }
    root.querySelector('#stOut').innerHTML = `<table class="mono">
      <tr><th style="text-align:left">Day</th><th>Sunrise</th><th>Sunset</th><th>Daylight</th></tr>
      ${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
    </table>`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});
