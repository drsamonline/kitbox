/* ================================================================
   UNIT CONVERTER — ~31 unit types
   ================================================================ */
TOOLS.unit = [];
let UNIT_N = 0;
function uconv(group, id, name, units){
  UNIT_N++;
  TOOLS.unit.push({id, code:'UNI-'+String(UNIT_N).padStart(2,'0'), name, group, render(root){
    const opts = units.map(u=>`<option value="${u.key}">${u.label}</option>`).join('');
    root.innerHTML = `
      <div class="field"><label>Value</label><input type="number" id="ucVal" value="1"></div>
      <div class="row">
        <div class="field"><label>From</label><select id="ucFrom">${opts}</select></div>
        <div class="field"><label>To</label><select id="ucTo">${opts}</select></div>
      </div>
      <div class="output" id="ucOut">—</div>
      <div class="divider"></div>
      <div class="section-label" style="margin:0 0 10px">All units</div>
      <table class="mono" id="ucTable"></table>
    `;
    const val = root.querySelector('#ucVal'), from = root.querySelector('#ucFrom'), to = root.querySelector('#ucTo');
    if(units[1]) to.value = units[1].key;
    // With the imperial preference set, a converter opens on the unit that
    // preference implies rather than on whatever happened to be second.
    const IMPERIAL_DEFAULT = { length: ['ft', 'mi'], mass: ['lb'], volume: ['gal'], temperature: ['F'], speed: ['mph'] };
    const preferred = IMPERIAL_DEFAULT[id];
    if(prefUnits() === 'imperial' && preferred){
      const pick = preferred.find(k=>units.some(u=>u.key === k));
      if(pick) to.value = pick;
    }
    const memKey = 'unit-last-'+id;
    const mem = store.get(memKey, null);
    if(mem){
      if(units.some(u=>u.key===mem.from)) from.value = mem.from;
      if(units.some(u=>u.key===mem.to)) to.value = mem.to;
    }
    function update(){
      const v = parseFloat(val.value); 
      const out = root.querySelector('#ucOut'), table = root.querySelector('#ucTable');
      if(isNaN(v)){ out.textContent='—'; table.innerHTML=''; return; }
      const fu = units.find(u=>u.key===from.value), tu = units.find(u=>u.key===to.value);
      const base = v*fu.factor;
      const result = base/tu.factor;
      store.set('unit-last-'+id, {from: from.value, to: to.value});
      out.innerHTML = `<span class="big">${fmtNum(result,6)}</span> ${tu.label}`;
      table.innerHTML = units.map(u=>`<tr><td>${u.label}</td><td>${fmtNum(base/u.factor,6)}</td></tr>`).join('');
    }
    [val,from,to].forEach(el=>el.addEventListener('input', update));
    update();
  }});
}

/* -- Common -- */
uconv('Common','energy','Energy', [
  {key:'j',label:'Joule (J)',factor:1},{key:'kj',label:'Kilojoule (kJ)',factor:1000},
  {key:'cal',label:'Calorie (cal)',factor:4.184},{key:'kcal',label:'Kilocalorie (kcal)',factor:4184},
  {key:'wh',label:'Watt-hour (Wh)',factor:3600},{key:'kwh',label:'Kilowatt-hour (kWh)',factor:3.6e6},
  {key:'ev',label:'Electronvolt (eV)',factor:1.602176634e-19},{key:'btu',label:'BTU',factor:1055.06},{key:'ftlb',label:'Foot-pound',factor:1.35582}
]);
uconv('Common','angle','Angle', [
  {key:'deg',label:'Degree (°)',factor:1},{key:'rad',label:'Radian',factor:180/Math.PI},
  {key:'grad',label:'Gradian',factor:0.9},{key:'arcmin',label:'Arcminute',factor:1/60},
  {key:'arcsec',label:'Arcsecond',factor:1/3600},{key:'turn',label:'Turn / revolution',factor:360}
]);
TOOLS.unit.push({id:'temperature', code:'UNI-'+String(++UNIT_N).padStart(2,'0'), name:'Temperature', group:'Common', render(root){
  root.innerHTML = `
    <div class="field"><label>Value</label><input type="number" id="tVal" value="0"></div>
    <div class="row">
      <div class="field"><label>From</label><select id="tFrom"><option value="C">Celsius (°C)</option><option value="F">Fahrenheit (°F)</option><option value="K">Kelvin (K)</option><option value="R">Rankine (°R)</option><option value="Re">Réaumur (°Ré)</option></select></div>
      <div class="field"><label>To</label><select id="tTo"><option value="C">Celsius (°C)</option><option value="F" selected>Fahrenheit (°F)</option><option value="K">Kelvin (K)</option><option value="R">Rankine (°R)</option><option value="Re">Réaumur (°Ré)</option></select></div>
    </div>
    <div class="output" id="tOut">—</div>
    <table class="mono" id="tTable" style="margin-top:14px"></table>`;
  function toC(v,u){ return u==='C'?v : u==='F'?(v-32)*5/9 : u==='K'?v-273.15 : u==='R'?(v-491.67)*5/9 : v*5/4; }
  function fromC(c,u){ return u==='C'?c : u==='F'?c*9/5+32 : u==='K'?c+273.15 : u==='R'?(c+273.15)*9/5 : c*4/5; }
  const labels={C:'Celsius (°C)',F:'Fahrenheit (°F)',K:'Kelvin (K)',R:'Rankine (°R)',Re:'Réaumur (°Ré)'};
  function update(){
    const v=parseFloat(root.querySelector('#tVal').value);
    const from=root.querySelector('#tFrom').value, to=root.querySelector('#tTo').value;
    const out=root.querySelector('#tOut'), table=root.querySelector('#tTable');
    if(isNaN(v)){ out.textContent='—'; table.innerHTML=''; return; }
    const c = toC(v,from);
    out.innerHTML = `<span class="big">${fmtNum(fromC(c,to),4)}</span> ${labels[to]}`;
    table.innerHTML = Object.keys(labels).map(k=>`<tr><td>${labels[k]}</td><td>${fmtNum(fromC(c,k),4)}</td></tr>`).join('');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
}});
uconv('Common','cooking','Cooking', [
  {key:'ml',label:'Milliliter (ml)',factor:1},{key:'l',label:'Liter (l)',factor:1000},
  {key:'tsp',label:'Teaspoon (US)',factor:4.92892},{key:'tbsp',label:'Tablespoon (US)',factor:14.7868},
  {key:'floz',label:'Fluid ounce (US)',factor:29.5735},{key:'cup',label:'Cup (US)',factor:236.588},
  {key:'pint',label:'Pint (US)',factor:473.176},{key:'quart',label:'Quart (US)',factor:946.353},{key:'gal',label:'Gallon (US)',factor:3785.41}
]);
uconv('Common','time','Time', [
  {key:'ms',label:'Millisecond',factor:0.001},{key:'s',label:'Second',factor:1},{key:'min',label:'Minute',factor:60},
  {key:'h',label:'Hour',factor:3600},{key:'day',label:'Day',factor:86400},{key:'week',label:'Week',factor:604800},
  {key:'month',label:'Month (avg)',factor:2629746},{key:'year',label:'Year',factor:31557600}
]);
uconv('Common','prefix','Prefix', [
  {key:'yotta',label:'Yotta (Y) ×10²⁴',factor:1e24},{key:'zetta',label:'Zetta (Z) ×10²¹',factor:1e21},
  {key:'exa',label:'Exa (E) ×10¹⁸',factor:1e18},{key:'peta',label:'Peta (P) ×10¹⁵',factor:1e15},
  {key:'tera',label:'Tera (T) ×10¹²',factor:1e12},{key:'giga',label:'Giga (G) ×10⁹',factor:1e9},
  {key:'mega',label:'Mega (M) ×10⁶',factor:1e6},{key:'kilo',label:'Kilo (k) ×10³',factor:1e3},
  {key:'hecto',label:'Hecto (h) ×10²',factor:100},{key:'deca',label:'Deca (da) ×10¹',factor:10},
  {key:'unit',label:'(base unit)',factor:1},
  {key:'deci',label:'Deci (d) ×10⁻¹',factor:0.1},{key:'centi',label:'Centi (c) ×10⁻²',factor:0.01},
  {key:'milli',label:'Milli (m) ×10⁻³',factor:0.001},{key:'micro',label:'Micro (µ) ×10⁻⁶',factor:1e-6},
  {key:'nano',label:'Nano (n) ×10⁻⁹',factor:1e-9},{key:'pico',label:'Pico (p) ×10⁻¹²',factor:1e-12},
  {key:'femto',label:'Femto (f) ×10⁻¹⁵',factor:1e-15},{key:'atto',label:'Atto (a) ×10⁻¹⁸',factor:1e-18},
  {key:'zepto',label:'Zepto (z) ×10⁻²¹',factor:1e-21},{key:'yocto',label:'Yocto (y) ×10⁻²⁴',factor:1e-24}
]);

/* -- Dimension -- */
uconv('Dimension','area','Area', [
  {key:'mm2',label:'mm²',factor:1e-6},{key:'cm2',label:'cm²',factor:1e-4},{key:'m2',label:'m²',factor:1},
  {key:'ha',label:'Hectare',factor:10000},{key:'km2',label:'km²',factor:1e6},
  {key:'in2',label:'in²',factor:0.00064516},{key:'ft2',label:'ft²',factor:0.092903},
  {key:'yd2',label:'yd²',factor:0.836127},{key:'acre',label:'Acre',factor:4046.86},{key:'mi2',label:'mi²',factor:2.59e6}
]);
uconv('Dimension','length','Length', [
  {key:'nm',label:'Nanometer',factor:1e-9},{key:'um',label:'Micrometer',factor:1e-6},{key:'mm',label:'Millimeter',factor:0.001},
  {key:'cm',label:'Centimeter',factor:0.01},{key:'m',label:'Meter',factor:1},{key:'km',label:'Kilometer',factor:1000},
  {key:'in',label:'Inch',factor:0.0254},{key:'ft',label:'Foot',factor:0.3048},{key:'yd',label:'Yard',factor:0.9144},
  {key:'mi',label:'Mile',factor:1609.34},{key:'nmi',label:'Nautical mile',factor:1852}
]);
uconv('Dimension','volume','Volume', [
  {key:'ml',label:'Milliliter',factor:0.001},{key:'l',label:'Liter',factor:1},{key:'m3',label:'Cubic meter',factor:1000},
  {key:'cm3',label:'Cubic centimeter',factor:0.001},{key:'in3',label:'Cubic inch',factor:0.0163871},{key:'ft3',label:'Cubic foot',factor:28.3168},
  {key:'gal',label:'Gallon (US)',factor:3.78541},{key:'qt',label:'Quart (US)',factor:0.946353},
  {key:'pt',label:'Pint (US)',factor:0.473176},{key:'cup',label:'Cup (US)',factor:0.236588},{key:'floz',label:'Fl. ounce (US)',factor:0.0295735}
]);

/* -- Mechanics & Electricity -- */
uconv('Mechanics & Electricity','mass','Mass', [
  {key:'mg',label:'Milligram',factor:1e-6},{key:'g',label:'Gram',factor:0.001},{key:'kg',label:'Kilogram',factor:1},
  {key:'t',label:'Tonne',factor:1000},{key:'oz',label:'Ounce',factor:0.0283495},{key:'lb',label:'Pound',factor:0.453592},
  {key:'st',label:'Stone',factor:6.35029},{key:'ust',label:'US ton',factor:907.185},{key:'ukt',label:'UK ton',factor:1016.05}
]);
uconv('Mechanics & Electricity','current','Current', [
  {key:'ua',label:'Microampere (µA)',factor:1e-6},{key:'ma',label:'Milliampere (mA)',factor:0.001},
  {key:'a',label:'Ampere (A)',factor:1},{key:'ka',label:'Kiloampere (kA)',factor:1000}
]);
uconv('Mechanics & Electricity','pressure','Pressure', [
  {key:'pa',label:'Pascal (Pa)',factor:1},{key:'kpa',label:'Kilopascal (kPa)',factor:1000},{key:'mpa',label:'Megapascal (MPa)',factor:1e6},
  {key:'bar',label:'Bar',factor:1e5},{key:'atm',label:'Atmosphere (atm)',factor:101325},
  {key:'psi',label:'PSI',factor:6894.76},{key:'mmhg',label:'mmHg',factor:133.322},{key:'torr',label:'Torr',factor:133.322}
]);
uconv('Mechanics & Electricity','voltage','Voltage', [
  {key:'uv',label:'Microvolt (µV)',factor:1e-6},{key:'mv',label:'Millivolt (mV)',factor:0.001},
  {key:'v',label:'Volt (V)',factor:1},{key:'kv',label:'Kilovolt (kV)',factor:1000}
]);
uconv('Mechanics & Electricity','charge','Electric Charge', [
  {key:'mc',label:'Microcoulomb (µC)',factor:1e-6},{key:'mmc',label:'Millicoulomb (mC)',factor:0.001},
  {key:'c',label:'Coulomb (C)',factor:1},{key:'mah',label:'Milliamp-hour (mAh)',factor:3.6},{key:'ah',label:'Amp-hour (Ah)',factor:3600}
]);
uconv('Mechanics & Electricity','force','Force', [
  {key:'dyn',label:'Dyne',factor:1e-5},{key:'n',label:'Newton (N)',factor:1},{key:'kn',label:'Kilonewton (kN)',factor:1000},
  {key:'kgf',label:'Kilogram-force (kgf)',factor:9.80665},{key:'lbf',label:'Pound-force (lbf)',factor:4.44822}
]);
uconv('Mechanics & Electricity','work','Work', [
  {key:'j',label:'Joule (J)',factor:1},{key:'kj',label:'Kilojoule (kJ)',factor:1000},
  {key:'cal',label:'Calorie (cal)',factor:4.184},{key:'kcal',label:'Kilocalorie (kcal)',factor:4184},
  {key:'kwh',label:'Kilowatt-hour (kWh)',factor:3.6e6},{key:'ftlb',label:'Foot-pound',factor:1.35582},{key:'btu',label:'BTU',factor:1055.06}
]);
uconv('Mechanics & Electricity','resistance','Resistance', [
  {key:'mo',label:'Milliohm (mΩ)',factor:0.001},{key:'o',label:'Ohm (Ω)',factor:1},
  {key:'ko',label:'Kiloohm (kΩ)',factor:1000},{key:'mego',label:'Megaohm (MΩ)',factor:1e6}
]);
uconv('Mechanics & Electricity','capacitance','Capacitance', [
  {key:'pf',label:'Picofarad (pF)',factor:1e-12},{key:'nf',label:'Nanofarad (nF)',factor:1e-9},
  {key:'uf',label:'Microfarad (µF)',factor:1e-6},{key:'mf',label:'Millifarad (mF)',factor:0.001},{key:'f',label:'Farad (F)',factor:1}
]);

/* -- Motion -- */
uconv('Motion','speed','Speed', [
  {key:'ms',label:'Meter/second (m/s)',factor:1},{key:'kmh',label:'Kilometer/hour (km/h)',factor:0.277778},
  {key:'mph',label:'Mile/hour (mph)',factor:0.44704},{key:'kn',label:'Knot',factor:0.514444},{key:'fts',label:'Foot/second (ft/s)',factor:0.3048}
]);
uconv('Motion','acceleration','Acceleration', [
  {key:'ms2',label:'m/s²',factor:1},{key:'fts2',label:'ft/s²',factor:0.3048},
  {key:'g',label:'Standard gravity (g)',factor:9.80665},{key:'kmhs',label:'km/h per second',factor:0.277778}
]);
uconv('Motion','torque','Torque', [
  {key:'nm',label:'Newton-meter (N·m)',factor:1},{key:'knm',label:'Kilonewton-meter (kN·m)',factor:1000},
  {key:'lbft',label:'Pound-foot (lb·ft)',factor:1.35582},{key:'lbin',label:'Pound-inch (lb·in)',factor:0.112985},{key:'kgfm',label:'kgf·m',factor:9.80665}
]);
uconv('Motion','data','Data', [
  {key:'bit',label:'Bit',factor:0.125},{key:'byte',label:'Byte',factor:1},
  {key:'kb',label:'Kilobyte (KB)',factor:1024},{key:'mb',label:'Megabyte (MB)',factor:1048576},
  {key:'gb',label:'Gigabyte (GB)',factor:1073741824},{key:'tb',label:'Terabyte (TB)',factor:1099511627776},{key:'pb',label:'Petabyte (PB)',factor:1125899906842624}
]);
uconv('Motion','cssunits','CSS Units', [
  {key:'px',label:'Pixel (px)',factor:1},{key:'pt',label:'Point (pt)',factor:1.33333},{key:'pc',label:'Pica (pc)',factor:16},
  {key:'in',label:'Inch (in)',factor:96},{key:'cm',label:'Centimeter (cm)',factor:37.7953},{key:'mm',label:'Millimeter (mm)',factor:3.77953},
  {key:'em',label:'em (16px root)',factor:16},{key:'rem',label:'rem (16px root)',factor:16}
]);
uconv('Motion','datatransfer','Data Transfer', [
  {key:'bps',label:'bit/s (bps)',factor:1},{key:'kbps',label:'Kbit/s (Kbps)',factor:1000},
  {key:'mbps',label:'Mbit/s (Mbps)',factor:1e6},{key:'gbps',label:'Gbit/s (Gbps)',factor:1e9},
  {key:'Bps',label:'Byte/s (Bps)',factor:8},{key:'KBps',label:'Kilobyte/s (KBps)',factor:8000},
  {key:'MBps',label:'Megabyte/s (MBps)',factor:8e6},{key:'GBps',label:'Gigabyte/s (GBps)',factor:8e9}
]);
uconv('Motion','pixeldensity','Pixel Density', [
  {key:'ppi',label:'Pixels per inch (PPI)',factor:1},{key:'ppcm',label:'Pixels per cm',factor:2.54},{key:'ppmm',label:'Pixels per mm',factor:25.4}
]);
TOOLS.unit.push({id:'imageresolution', code:'UNI-'+String(++UNIT_N).padStart(2,'0'), name:'Image Resolution', group:'Motion', render(root){
  root.innerHTML = `
    <div class="row"><div class="field"><label>Width (px)</label><input type="number" id="irW" value="1920"></div><div class="field"><label>Height (px)</label><input type="number" id="irH" value="1080"></div></div>
    <table class="mono" id="irOut"></table>`;
  const presets = {'640x480':'VGA','1280x720':'HD (720p)','1920x1080':'Full HD (1080p)','2560x1440':'QHD (1440p)','3840x2160':'4K UHD','7680x4320':'8K UHD','1080x1920':'Full HD portrait'};
  function update(){
    const w=+root.querySelector('#irW').value, h=+root.querySelector('#irH').value;
    const out = root.querySelector('#irOut');
    if(!w||!h){ out.innerHTML=''; return; }
    const g = gcd(w,h);
    const total = w*h;
    const preset = presets[w+'x'+h];
    out.innerHTML = [
      ['Total pixels', total.toLocaleString()],
      ['Megapixels', fmtNum(total/1e6,2)+' MP'],
      ['Aspect ratio', `${w/g} : ${h/g}`],
      ['Known preset', preset || '—']
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
}});
uconv('Motion','typography','Typography', [
  {key:'px',label:'Pixel (px)',factor:1},{key:'pt',label:'Point (pt)',factor:1.33333},
  {key:'em',label:'em (16px root)',factor:16},{key:'rem',label:'rem (16px root)',factor:16},{key:'pct',label:'Percent (%)',factor:0.16}
]);

/* -- Other -- */
uconv('Other','sound','Sound', [
  {key:'db',label:'Decibel (dB)',factor:1},{key:'bel',label:'Bel (B)',factor:10},{key:'np',label:'Neper (Np)',factor:8.68589}
]);
uconv('Other','luminance','Luminance', [
  {key:'cdm2',label:'Candela/m² (nit)',factor:1},{key:'kcdm2',label:'kcd/m²',factor:1000},
  {key:'sb',label:'Stilb',factor:10000},{key:'fl',label:'Foot-lambert',factor:3.42626}
]);
uconv('Other','luminousflux','Luminous Flux', [
  {key:'mlm',label:'Millilumen',factor:0.001},{key:'lm',label:'Lumen',factor:1},{key:'klm',label:'Kilolumen',factor:1000}
]);
uconv('Other','tempgradient','Temperature Gradient', [
  {key:'cm',label:'°C / m',factor:1000},{key:'c100m',label:'°C / 100m',factor:10},{key:'ckm',label:'°C / km',factor:1},
  {key:'kkm',label:'K / km',factor:1},{key:'f1000ft',label:'°F / 1000ft',factor:1.8226},{key:'fmi',label:'°F / mile',factor:0.34512}
]);

