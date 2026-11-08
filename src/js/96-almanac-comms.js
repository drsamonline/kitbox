/* ================================================================
   ALMANAC, from drsamonline/astro-kit and app-panchang
   Meeus solar/lunar longitude, Lahiri ayanamsa, sunrise equation.
   Timings are approximate (see the note in each tool).
   ================================================================ */
TOOLS.almanac = TOOLS.almanac || [];   // idempotent: a part that sorts earlier may have registered already
let ALM_N = 0;
function alm(id, name, render){ register({cat:'almanac', id, name, render}); }

const ASTRO = (()=>{
  const D2R = Math.PI/180, R2D = 180/Math.PI;
  const sin = d=>Math.sin(d*D2R), cos = d=>Math.cos(d*D2R);
  const norm360 = x=>{ x = x%360; return x<0?x+360:x; };
  const frac = x=>x-Math.floor(x);
  const A = {};
  A.jd = when=>{
    let y,m,d,h;
    if(when && typeof when.getUTCFullYear === 'function'){ y=when.getUTCFullYear(); m=when.getUTCMonth()+1; d=when.getUTCDate(); h=when.getUTCHours()+when.getUTCMinutes()/60; }
    else { y=when.y; m=when.m; d=when.d; h=when.h||0; }
    let yy=y, mm=m;
    if(mm<=2){ yy-=1; mm+=12; }
    const a=Math.floor(yy/100), b=2-a+Math.floor(a/4);
    return Math.floor(365.25*(yy+4716)) + Math.floor(30.6001*(mm+1)) + d + b - 1524.5 + h/24;
  };
  A.sunLongitude = jde=>{
    const T=(jde-2451545.0)/36525;
    const L0=280.46646+36000.76983*T+0.0003032*T*T;
    const M=357.52911+35999.05029*T-0.0001537*T*T;
    const C=(1.914602-0.004817*T-0.000014*T*T)*sin(M)+(0.019993-0.000101*T)*sin(2*M)+0.000289*sin(3*M);
    const omega=125.04-1934.136*T;
    return norm360(L0+C-0.00569-0.00478*sin(omega));
  };
  const MT = [[6288774,0,0,1,0],[1274027,2,0,-1,0],[658314,2,0,0,0],[213618,0,0,2,0],[-185116,0,1,0,0],
    [-114332,0,0,0,2],[58793,2,0,-2,0],[57066,2,-1,-1,0],[53322,2,0,1,0],[45758,2,-1,0,0],
    [-40923,0,1,-1,0],[-34720,1,0,0,0],[-30383,0,1,1,0],[15327,2,0,0,-2],[-12528,0,0,1,2],
    [10980,0,0,1,-2],[10675,4,0,-1,0],[10034,0,0,3,0],[8548,4,0,-2,0],[-7888,2,1,-1,0],
    [-6766,2,1,0,0],[-5163,1,0,-1,0],[4987,1,1,0,0],[4036,2,-1,1,0],[3994,2,0,2,0],[3861,4,0,0,0],[3665,2,0,-3,0]];
  A.moonLongitude = jde=>{
    const T=(jde-2451545.0)/36525;
    const Lp=218.3164477+481267.88123421*T-0.0015786*T*T+T*T*T/538841;
    const D=297.8501921+445267.1114034*T-0.0018819*T*T+T*T*T/545868;
    const M=357.5291092+35999.0502909*T-0.0001536*T*T;
    const Mp=134.9633964+477198.8675055*T+0.0087414*T*T;
    const F=93.2720950+483202.0175233*T-0.0036539*T*T;
    let sum=0;
    for(const t of MT) sum += t[0]*sin(t[1]*D+t[2]*M+t[3]*Mp+t[4]*F);
    return norm360(Lp+sum/1000000);
  };
  A.ayanamsa = jde=> 23.853 + 0.013969*((jde-2451545.0)/365.25);
  A.sunriseSunset = (dateUTC, lat, lon)=>{
    const Jdate=A.jd(dateUTC);
    const jd0=Math.floor(Jdate+0.5)-0.5;
    const n=Math.ceil(Jdate-2451545.0+0.0008);
    const Jstar=n-lon/360;
    const M=norm360(357.5291+0.98560028*Jstar);
    const C=1.9148*sin(M)+0.02*sin(2*M)+0.0003*sin(3*M);
    const lambda=norm360(M+C+180+102.9372);
    const Jtransit=2451545.0+Jstar+0.0053*sin(M)-0.0069*sin(2*lambda);
    const delta=Math.asin(sin(lambda)*sin(23.44))*R2D;
    const cosOmega=(sin(-0.833)-sin(lat)*sin(delta))/(cos(lat)*cos(delta));
    if(cosOmega>1) return {polar:'night'};
    if(cosOmega<-1) return {polar:'day'};
    const omega=Math.acos(cosOmega)*R2D;
    return {
      transit:(Jtransit-jd0)*24,
      sunrise:(Jtransit-omega/360-jd0)*24,
      sunset:(Jtransit+omega/360-jd0)*24
    };
  };
  const TITHI=['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
    'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'];
  const NAK=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const YOGA=['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarman','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti'];
  const KAR=['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];
  A.elongation = jde=> norm360(A.moonLongitude(jde)-A.sunLongitude(jde));
  A.panchang = jde=>{
    const e=A.elongation(jde);
    const ti=Math.floor(e/12);
    const sid=norm360(A.moonLongitude(jde)-A.ayanamsa(jde));
    const ni=Math.floor(sid/(360/27));
    const ysum=norm360((A.sunLongitude(jde)-A.ayanamsa(jde))+(A.moonLongitude(jde)-A.ayanamsa(jde)));
    const yi=Math.floor(ysum/(360/27));
    const ki=Math.floor(e/6);
    const kname = ki===0 ? 'Kimstughna' : ki>=57 ? ['Shakuni','Chatushpada','Naga'][ki-57] : KAR[(ki-1)%7];
    const f=e/360;
    const phase = f<0.03||f>0.97 ? 'New moon' : f<0.22 ? 'Waxing crescent' : f<0.28 ? 'First quarter' : f<0.47 ? 'Waxing gibbous' : f<0.53 ? 'Full moon' : f<0.72 ? 'Waning gibbous' : f<0.78 ? 'Last quarter' : 'Waning crescent';
    return {
      tithi: {name:TITHI[ti], num:(ti%15)+1, paksha: ti<15?'Shukla':'Krishna'},
      nakshatra: {name:NAK[ni], pada: Math.floor(frac(sid/(360/27))*4)+1},
      yoga: YOGA[yi],
      karana: kname,
      phase, illumination:(1-cos(e))/2
    };
  };
  A.toJdFromLocal = d=>{
    // Convert a local Date to a JD treating its wall-clock time as UTC, so the
    // panchang is computed for the moment the user actually means.
    return A.jd({y:d.getFullYear(), m:d.getMonth()+1, d:d.getDate(), h:d.getHours()+d.getMinutes()/60});
  };
  return A;
})();

function fmtHM(h){
  if(h==null || isNaN(h)) return '—';
  let t = h; if(t<0) t+=24;
  const hh = Math.floor(t)%24, mm = Math.round((t-Math.floor(t))*60);
  return String(hh).padStart(2,'0')+':'+String(mm%60).padStart(2,'0');
}

/* 11. Panchang */
alm('panchang','Panchang', root=>{
  const saved = store.get('panchang-place', {lat:22.3072, lon:73.1812, place:'Vadodara'});
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="pnDate"></div>
      <div class="field"><label>Time</label><input type="time" id="pnTime" value="07:00"></div>
    </div>
    <div class="row">
      <div class="field"><label>Place</label><input type="text" id="pnPlace" value="${escapeHtml(saved.place||'')}"></div>
      <div class="field"><label>Latitude</label><input type="number" id="pnLat" step="0.0001" value="${saved.lat}"></div>
      <div class="field"><label>Longitude</label><input type="number" id="pnLon" step="0.0001" value="${saved.lon}"></div>
    </div>
    <div class="output" id="pnOut">—</div>
    <div class="hint">Tithi, nakshatra, yoga and karana from the Meeus solar and lunar series with the Lahiri ayanamsa. Boundaries can be a minute or so off, and local tradition may differ — treat this as a good approximation, not a ritual almanac.</div>`;
  const dateEl = root.querySelector('#pnDate');
  const today = new Date();
  dateEl.value = localDateStr(today);
  function update(){
    const lat = parseFloat(root.querySelector('#pnLat').value);
    const lon = parseFloat(root.querySelector('#pnLon').value);
    const place = root.querySelector('#pnPlace').value;
    store.set('panchang-place', {lat, lon, place});
    const [y,m,d] = (dateEl.value||localDateStr(today)).split('-').map(Number);
    const [hh,mm] = (root.querySelector('#pnTime').value||'07:00').split(':').map(Number);
    const jd = ASTRO.jd({y, m, d, h: hh + mm/60});
    const p = ASTRO.panchang(jd);
    const ss = ASTRO.sunriseSunset(new Date(Date.UTC(y, m-1, d, 12)), lat, lon);
    const out = root.querySelector('#pnOut');
    if(ss.polar){
      out.innerHTML = `<div class="hint">At this latitude the sun ${ss.polar==='day'?'does not set':'does not rise'} on this date, so sunrise-based timings do not apply.</div>`;
    }
    const tz = -(new Date().getTimezoneOffset())/60;
    const localRise = ss.polar ? null : ss.sunrise + tz;
    const localSet = ss.polar ? null : ss.sunset + tz;
    const rows = [
      ['Tithi', `${p.tithi.paksha} ${p.tithi.name} (${p.tithi.num})`],
      ['Nakshatra', `${p.nakshatra.name} · pada ${p.nakshatra.pada}`],
      ['Yoga', p.yoga],
      ['Karana', p.karana],
      ['Moon phase', `${p.phase} · ${(p.illumination*100).toFixed(0)}% lit`],
      ['Sunrise', fmtHM(localRise)],
      ['Sunset', fmtHM(localSet)],
      ['Day length', ss.polar ? '—' : fmtHM(ss.sunset - ss.sunrise)],
      ['Ayanamsa', ASTRO.ayanamsa(jd).toFixed(3)+'°']
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  root.querySelectorAll('input').forEach(el=>el.addEventListener('change', update));
  update();
});

/* 12. Rahu Kaal & Muhurat */
alm('rahukaal','Rahu Kaal & Muhurat', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="rkDate"></div>
      <div class="field"><label>Latitude</label><input type="number" id="rkLat" step="0.0001" value="22.3072"></div>
      <div class="field"><label>Longitude</label><input type="number" id="rkLon" step="0.0001" value="73.1812"></div>
    </div>
    <div class="output" id="rkOut">—</div>
    <div class="hint">Rahu Kaal is the eighth of the eight unequal daylight segments, counted from sunrise. Abhijit is the eighth of fifteen equal muhurtas, centred on solar noon. Both are computed from the sunrise and sunset for the coordinates above.</div>`;
  const dateEl = root.querySelector('#rkDate');
  dateEl.value = localDateStr(new Date());
  function update(){
    const [y,m,d] = (dateEl.value||localDateStr(new Date())).split('-').map(Number);
    const lat = parseFloat(root.querySelector('#rkLat').value);
    const lon = parseFloat(root.querySelector('#rkLon').value);
    const ss = ASTRO.sunriseSunset(new Date(Date.UTC(y, m-1, d, 12)), lat, lon);
    const out = root.querySelector('#rkOut');
    if(ss.polar){ out.textContent = 'No sunrise or sunset at this latitude on this date.'; return; }
    const tz = -(new Date().getTimezoneOffset())/60;
    const rise = ss.sunrise + tz, set = ss.sunset + tz;
    const dayLen = set - rise;
    // weekday index of the chosen date (0 = Sunday), used for the Rahu segment
    const wd = new Date(y, m-1, d).getDay();
    const RAHU_SEG = [8,2,7,5,6,4,3]; // Sunday..Saturday, 1-based segment of 8
    const seg = RAHU_SEG[wd];
    const rahuStart = rise + dayLen*(seg-1)/8, rahuEnd = rise + dayLen*seg/8;
    const noon = rise + dayLen/2;
    const abhijitStart = noon - dayLen/30, abhijitEnd = noon + dayLen/30;
    const rows = [
      ['Sunrise', fmtHM(rise)], ['Sunset', fmtHM(set)],
      ['Rahu Kaal', fmtHM(rahuStart)+' – '+fmtHM(rahuEnd)],
      ['Abhijit Muhurat', fmtHM(abhijitStart)+' – '+fmtHM(abhijitEnd)],
      ['Solar noon', fmtHM(noon)]
    ];
    out.innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      <div class="hint">Times are local to this device's timezone (${escapeHtml(Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown')}).</div>`;
  }
  root.querySelectorAll('input').forEach(el=>{ el.addEventListener('input', update); el.addEventListener('change', update); });
  update();
});

/* 13. Sun & Moon Times */
alm('sunmoon','Sun & Moon Times', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Date</label><input type="date" id="smDate"></div>
      <div class="field"><label>Latitude</label><input type="number" id="smLat" step="0.0001" value="22.3072"></div>
      <div class="field"><label>Longitude</label><input type="number" id="smLon" step="0.0001" value="73.1812"></div>
    </div>
    <div class="output" id="smOut">—</div>
    <div class="hint">Civil sunrise/sunset (sun centre 0.833° below the horizon, which allows for refraction and the solar radius). The moon block gives the phase, illumination and the moon's sidereal position.</div>`;
  const dateEl = root.querySelector('#smDate');
  dateEl.value = localDateStr(new Date());
  function update(){
    const [y,m,d] = (dateEl.value||localDateStr(new Date())).split('-').map(Number);
    const lat = parseFloat(root.querySelector('#smLat').value);
    const lon = parseFloat(root.querySelector('#smLon').value);
    const tz = -(new Date().getTimezoneOffset())/60;
    const ss = ASTRO.sunriseSunset(new Date(Date.UTC(y, m-1, d, 12)), lat, lon);
    const jdNoon = ASTRO.jd({y, m, d, h:12});
    const p = ASTRO.panchang(jdNoon);
    const sid = ((ASTRO.moonLongitude(jdNoon) - ASTRO.ayanamsa(jdNoon)) % 360 + 360) % 360;
    const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const sign = signs[Math.floor(sid/30)];
    const rows = [];
    if(ss.polar){ rows.push(['Sun', ss.polar==='day' ? 'Above the horizon all day' : 'Below the horizon all day']); }
    else {
      rows.push(['Sunrise', fmtHM(ss.sunrise+tz)]);
      rows.push(['Solar noon', fmtHM(ss.transit+tz)]);
      rows.push(['Sunset', fmtHM(ss.sunset+tz)]);
      rows.push(['Day length', fmtHM(ss.sunset-ss.sunrise)]);
    }
    rows.push(['Moon phase', `${p.phase} · ${(p.illumination*100).toFixed(0)}% lit`]);
    rows.push(['Moon nakshatra', `${p.nakshatra.name} · pada ${p.nakshatra.pada}`]);
    rows.push(['Moon sidereal', `${sid.toFixed(2)}° · ${sign}`]);
    root.querySelector('#smOut').innerHTML = `<table class="mono">${rows.map(([k,v])=>`<tr><td>${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join('')}</table>`;
  }
  root.querySelectorAll('input').forEach(el=>{ el.addEventListener('input', update); el.addEventListener('change', update); });
  update();
});

/* ================================================================
   COMMUNICATION, from drsamonline/TTB
   ================================================================ */
TOOLS.comms = TOOLS.comms || [];   // idempotent: a part that sorts earlier may have registered already
let COM_N = 0;
function com(id, name, render){ register({cat:'comms', id, name, render}); }

/* 14. vCard Generator */
com('vcard','vCard Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>First name</label><input type="text" id="vcFirst"></div>
      <div class="field"><label>Last name</label><input type="text" id="vcLast"></div>
    </div>
    <div class="row">
      <div class="field"><label>Phone</label><input type="text" id="vcPhone" placeholder="+91 98250 00000"></div>
      <div class="field"><label>Email</label><input type="text" id="vcEmail"></div>
    </div>
    <div class="row">
      <div class="field"><label>Organisation</label><input type="text" id="vcOrg"></div>
      <div class="field"><label>Job title</label><input type="text" id="vcTitle"></div>
    </div>
    <div class="field"><label>Website</label><input type="text" id="vcUrl" placeholder="https://"></div>
    <div class="field"><label>Address</label><input type="text" id="vcAddr"></div>
    <div class="row">
      <button class="btn primary" id="vcGo">Build vCard</button>
      <button class="btn" id="vcDl">Download .vcf</button>
    </div>
    <div class="field"><label>vCard</label><textarea id="vcOut" style="min-height:150px" readonly></textarea></div>`;
  function build(){
    const g = id=>root.querySelector(id).value.trim();
    const esc = s=>String(s||'').replace(/([,;\\])/g,'\\$1').replace(/\n/g,'\\n');
    const lines = ['BEGIN:VCARD','VERSION:3.0'];
    lines.push(`N:${esc(g('#vcLast'))};${esc(g('#vcFirst'))};;;`);
    lines.push(`FN:${esc((g('#vcFirst')+' '+g('#vcLast')).trim())}`);
    if(g('#vcOrg')) lines.push(`ORG:${esc(g('#vcOrg'))}`);
    if(g('#vcTitle')) lines.push(`TITLE:${esc(g('#vcTitle'))}`);
    if(g('#vcPhone')) lines.push(`TEL;TYPE=CELL:${esc(g('#vcPhone'))}`);
    if(g('#vcEmail')) lines.push(`EMAIL;TYPE=INTERNET:${esc(g('#vcEmail'))}`);
    if(g('#vcUrl')) lines.push(`URL:${esc(g('#vcUrl'))}`);
    if(g('#vcAddr')) lines.push(`ADR;TYPE=HOME:;;${esc(g('#vcAddr'))};;;;`);
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }
  root.querySelector('#vcGo').addEventListener('click', ()=>{ root.querySelector('#vcOut').value = build(); });
  root.querySelector('#vcDl').addEventListener('click', ()=>{
    const text = build();
    root.querySelector('#vcOut').value = text;
    saveBlob(new Blob([text], {type:'text/vcard'}), 'contact.vcf');
  });
});

/* 15. Calendar Invite (.ics) */
com('icsinvite','Calendar Invite', root=>{
  root.innerHTML = `
    <div class="field"><label>Event title</label><input type="text" id="icTitle" placeholder="Case review"></div>
    <div class="row">
      <div class="field"><label>Start</label><input type="datetime-local" id="icStart"></div>
      <div class="field"><label>End</label><input type="datetime-local" id="icEnd"></div>
    </div>
    <div class="field"><label>Location</label><input type="text" id="icLoc"></div>
    <div class="field"><label>Description</label><textarea id="icDesc"></textarea></div>
    <div class="row">
      <button class="btn primary" id="icGo">Build .ics</button>
      <button class="btn" id="icDl">Download</button>
    </div>
    <div class="field"><label>ICS</label><textarea id="icOut" style="min-height:170px" readonly></textarea></div>`;
  function stamp(v){
    const d = new Date(v);
    if(isNaN(d)) return null;
    const pad = n=>String(n).padStart(2,'0');
    return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+'00Z';
  }
  function build(){
    const title = root.querySelector('#icTitle').value.trim() || 'Event';
    const start = stamp(root.querySelector('#icStart').value);
    const end = stamp(root.querySelector('#icEnd').value) || start;
    if(!start) return 'Set a start time first.';
    const uid = 'kitbox-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'@local';
    const esc = s=>String(s||'').replace(/([,;\\])/g,'\\$1').replace(/\n/g,'\\n');
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kitbox//Offline Toolbox//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
      'UID:'+uid, 'DTSTAMP:'+stamp(new Date()), 'DTSTART:'+start, 'DTEND:'+end,
      'SUMMARY:'+esc(title),
      root.querySelector('#icLoc').value.trim() ? 'LOCATION:'+esc(root.querySelector('#icLoc').value.trim()) : null,
      root.querySelector('#icDesc').value.trim() ? 'DESCRIPTION:'+esc(root.querySelector('#icDesc').value.trim()) : null,
      'END:VEVENT','END:VCALENDAR'].filter(Boolean).join('\r\n');
  }
  root.querySelector('#icGo').addEventListener('click', ()=>{ root.querySelector('#icOut').value = build(); });
  root.querySelector('#icDl').addEventListener('click', ()=>{
    const text = build();
    root.querySelector('#icOut').value = text;
    if(text.startsWith('Set a start')) return;
    saveBlob(new Blob([text], {type:'text/calendar'}), 'event.ics');
  });
});

/* 16. Message Link Builder */
com('linkbuilder','Message Link Builder', root=>{
  root.innerHTML = `
    <div class="field"><label>Message</label><textarea id="lbText" placeholder="Hello — sharing the case notes we discussed."></textarea></div>
    <div class="row">
      <div class="field"><label>Phone (with country code)</label><input type="text" id="lbPhone" placeholder="+919825000000"></div>
      <div class="field"><label>Email</label><input type="text" id="lbEmail"></div>
    </div>
    <div class="field"><label>Subject (email only)</label><input type="text" id="lbSubject"></div>
    <div class="output" id="lbOut">—</div>
    <div class="hint">Links open the app that owns them. Nothing is sent from here — Kitbox only builds the link.</div>`;
  function update(){
    const text = root.querySelector('#lbText').value;
    const phone = root.querySelector('#lbPhone').value.replace(/[^\d+]/g,'');
    const email = root.querySelector('#lbEmail').value.trim();
    const subject = root.querySelector('#lbSubject').value.trim();
    const e = encodeURIComponent;
    const rows = [];
    if(phone) rows.push(['WhatsApp', `https://wa.me/${phone.replace(/^\+/,'')}?text=${e(text)}`]);
    if(phone) rows.push(['SMS', `sms:${phone}?body=${e(text)}`]);
    if(phone) rows.push(['Telegram', `https://t.me/${phone.replace(/^\+/,'')}`]);
    if(email) rows.push(['Email', `mailto:${e(email)}?subject=${e(subject)}&body=${e(text)}`]);
    rows.push(['Share text', text]);
    root.querySelector('#lbOut').innerHTML = `<table class="mono">${rows.map(([k,v])=>
      k==='Share text'
        ? `<tr><td>${k}</td><td style="word-break:break-word">${escapeHtml(v)}</td></tr>`
        : `<tr><td>${k}</td><td style="word-break:break-all"><a href="${escapeHtml(v)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">${escapeHtml(v.length>64?v.slice(0,64)+'…':v)}</a></td></tr>`
    ).join('')}</table>`;
  }
  root.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input', update));
  update();
});

