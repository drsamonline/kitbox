/* ================================================================
   FINANCE TOOLS
   ================================================================ */
TOOLS.finance = [];
let FIN_N = 0;
function fin(id, name, render){ register({cat:'finance', id, name, render}); }

fin('currency','Currency', root=>{
  const DEFAULT_RATES = { USD:1, EUR:0.92, GBP:0.79, INR:83.5, JPY:156.5, AUD:1.52, CAD:1.37, CHF:0.88, CNY:7.24, SGD:1.35, AED:3.67, SAR:3.75, ZAR:18.4, BRL:5.4, MXN:18.1, RUB:88, KRW:1370, NZD:1.65, HKD:7.82, SEK:10.4, NOK:10.6, TRY:32.5, THB:36.2, IDR:15900, PKR:278 };
  let rates = store.get('currency-rates', DEFAULT_RATES);
  root.innerHTML = `
    <div class="hint">Rates are an offline snapshot (fixed at build time), not live market data — this app never calls the internet. Edit them below if you want current figures; your edits are saved on this device.</div>
    <div class="field"><label>Amount</label><input type="number" id="cvVal" value="100"></div>
    <div class="row">
      <div class="field"><label>From</label><select id="cvFrom"></select></div>
      <div class="field"><label>To</label><select id="cvTo"></select></div>
    </div>
    <div class="output" id="cvOut">—</div>
    <div class="divider"></div>
    <div class="section-label" style="margin:0 0 10px">Edit rates (units per 1 USD)</div>
    <div class="grid" id="cvRatesGrid" style="grid-template-columns:repeat(2,1fr)"></div>
    <div class="segrow" style="margin-top:14px"><button class="btn ghost" id="cvReset">Reset to default snapshot</button></div>
    <div class="divider"></div>
    <div id="cvExport"></div>
  `;
  exportImportRow(root.querySelector('#cvExport'), 'currency-rates', 'kitbox-currency-rates.json', data=>{
    if(data && typeof data==='object'){ rates = data; refreshSelectors(); drawRates(); update(); }
  });
  const val = root.querySelector('#cvVal'), from = root.querySelector('#cvFrom'), to = root.querySelector('#cvTo');
  function refreshSelectors(){
    const opts = Object.keys(rates).map(c=>`<option value="${c}">${c}</option>`).join('');
    from.innerHTML = opts; to.innerHTML = opts;
    to.value = 'INR' in rates ? 'INR' : Object.keys(rates)[1];
  }
  refreshSelectors();
  function update(){
    const v = parseFloat(val.value);
    const out = root.querySelector('#cvOut');
    if(isNaN(v)){ out.textContent='—'; return; }
    const usd = v/rates[from.value];
    const result = usd*rates[to.value];
    out.innerHTML = `<span class="big">${fmtNum(result,2)}</span> ${to.value}`;
  }
  const ratesGrid = root.querySelector('#cvRatesGrid');
  function drawRates(){
    ratesGrid.innerHTML = Object.keys(rates).map(c=>`
      <div class="field" style="margin:6px 0"><label>${c}</label><input type="number" step="any" data-ccy="${c}" value="${rates[c]}"></div>
    `).join('');
    ratesGrid.querySelectorAll('input').forEach(inp=>inp.addEventListener('input', ()=>{
      const parsed = parseFloat(inp.value);
      rates[inp.dataset.ccy] = (parsed>0) ? parsed : rates[inp.dataset.ccy];
      store.set('currency-rates', rates);
      update();
    }));
  }
  root.querySelector('#cvReset').addEventListener('click', ()=>{ rates = {...DEFAULT_RATES}; store.set('currency-rates', rates); drawRates(); update(); });
  [val,from,to].forEach(el=>el.addEventListener('input', update));
  drawRates(); update();
});

fin('loanemi','Loan EMI Calculator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Loan amount</label><input type="number" id="emiP" value="500000"></div>
      <div class="field"><label>Annual interest rate (%)</label><input type="number" id="emiR" value="8.5" step="0.01"></div>
    </div>
    <div class="field"><label>Tenure (years)</label><input type="number" id="emiY" value="5" step="0.5"></div>
    <table class="mono" id="emiOut"></table>`;
  function update(){
    const P=+root.querySelector('#emiP').value, annualR=+root.querySelector('#emiR').value, years=+root.querySelector('#emiY').value;
    const out = root.querySelector('#emiOut');
    const n = Math.round(years*12);
    const r = annualR/1200;
    if(!P||!n){ out.innerHTML=''; return; }
    let emi;
    if(r===0) emi = P/n;
    else emi = P*r*Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
    const total = emi*n;
    const interest = total-P;
    out.innerHTML = [
      ['Monthly EMI', fmtNum(emi,2)],
      ['Total payment', fmtNum(total,2)],
      ['Total interest', fmtNum(interest,2)],
      ['Number of payments', n]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('investment','Investment Calculator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Initial investment</label><input type="number" id="ivP" value="10000"></div>
      <div class="field"><label>Monthly contribution</label><input type="number" id="ivM" value="200"></div>
    </div>
    <div class="row">
      <div class="field"><label>Annual return rate (%)</label><input type="number" id="ivR" value="7" step="0.1"></div>
      <div class="field"><label>Years</label><input type="number" id="ivY" value="10"></div>
    </div>
    <div class="field"><label>Compounding</label><select id="ivC"><option value="12">Monthly</option><option value="4">Quarterly</option><option value="1">Annually</option></select></div>
    <table class="mono" id="ivOut"></table>`;
  function update(){
    const P=+root.querySelector('#ivP').value, monthly=+root.querySelector('#ivM').value;
    const annualR=+root.querySelector('#ivR').value/100, years=+root.querySelector('#ivY').value;
    const compN=+root.querySelector('#ivC').value;
    const out = root.querySelector('#ivOut');
    if(years<=0){ out.innerHTML=''; return; }
    const totalMonths = Math.round(years*12);
    const monthlyRate = Math.pow(1+annualR/compN, compN/12) - 1;
    let balance = P;
    let contributed = P;
    for(let m=0;m<totalMonths;m++){
      balance *= (1+monthlyRate);
      balance += monthly;
      contributed += monthly;
    }
    const gain = balance-contributed;
    out.innerHTML = [
      ['Future value', fmtNum(balance,2)],
      ['Total contributed', fmtNum(contributed,2)],
      ['Total growth', fmtNum(gain,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('taxcalc','Tax Calculator', root=>{
  root.innerHTML = `
    <div class="field"><label>Income</label><input type="number" id="txIncome" value="60000"></div>
    <div class="hint">Enter your own tax brackets below (this varies by country/year, so nothing is pre-filled with authority). Each row: taxable amount up to this threshold is taxed at this rate; leave the last threshold blank for "and above".</div>
    <div id="txBrackets"></div>
    <div class="segrow"><button class="btn" id="txAdd">+ Add bracket</button></div>
    <div class="output" id="txOut" style="margin-top:16px">—</div>`;
  let brackets = [ {upto:10000, rate:10}, {upto:40000, rate:20}, {upto:'', rate:30} ];
  const box = root.querySelector('#txBrackets');
  function drawBrackets(){
    box.innerHTML = brackets.map((b,i)=>`
      <div class="row" data-i="${i}">
        <div class="field"><label>Up to</label><input type="number" class="bUpto" value="${b.upto}" placeholder="(and above)"></div>
        <div class="field"><label>Rate %</label><input type="number" class="bRate" value="${b.rate}"></div>
        <button class="btn ghost bRemove" style="flex:none;align-self:flex-end;margin-bottom:14px" aria-label="Remove">✕</button>
      </div>`).join('');
    box.querySelectorAll('[data-i]').forEach(row=>{
      const i = +row.dataset.i;
      row.querySelector('.bUpto').addEventListener('input', e=>{ brackets[i].upto = e.target.value===''?'':+e.target.value; update(); });
      row.querySelector('.bRate').addEventListener('input', e=>{ brackets[i].rate = +e.target.value; update(); });
      row.querySelector('.bRemove').addEventListener('click', ()=>{ brackets.splice(i,1); drawBrackets(); update(); });
    });
  }
  root.querySelector('#txAdd').addEventListener('click', ()=>{ brackets.push({upto:'',rate:0}); drawBrackets(); update(); });
  function update(){
    const income = +root.querySelector('#txIncome').value;
    const out = root.querySelector('#txOut');
    if(!income){ out.textContent='—'; return; }
    let remaining = income, prevThreshold = 0, tax = 0, breakdown=[];
    for(const b of brackets){
      const upto = b.upto===''? Infinity : b.upto;
      const bandSize = Math.max(0, Math.min(remaining, upto-prevThreshold));
      const bandTax = bandSize*b.rate/100;
      if(bandSize>0) breakdown.push(`${fmtNum(bandSize,2)} @ ${b.rate}% = ${fmtNum(bandTax,2)}`);
      tax += bandTax;
      remaining -= bandSize;
      prevThreshold = upto;
      if(remaining<=0) break;
    }
    out.innerHTML = `<span class="big">${fmtNum(tax,2)}</span> total tax\n\nEffective rate: ${fmtNum(tax/income*100,2)}%\nNet income: ${fmtNum(income-tax,2)}\n\n${breakdown.join('\n')}`;
  }
  root.querySelector('#txIncome').addEventListener('input', update);
  drawBrackets(); update();
});

fin('billsplit','Bill Splitter', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Bill total</label><input type="number" id="bsTotal" value="120"></div>
      <div class="field"><label>Number of people</label><input type="number" id="bsPeople" value="4" min="1"></div>
    </div>
    <div class="field"><label>Tip (%)</label><input type="number" id="bsTip" value="15"></div>
    <table class="mono" id="bsOut"></table>`;
  function update(){
    const total=+root.querySelector('#bsTotal').value, people=Math.max(1,+root.querySelector('#bsPeople').value), tip=+root.querySelector('#bsTip').value;
    const out = root.querySelector('#bsOut');
    const tipAmt = total*tip/100;
    const grand = total+tipAmt;
    out.innerHTML = [
      ['Tip amount', fmtNum(tipAmt,2)],
      ['Grand total', fmtNum(grand,2)],
      ['Per person', fmtNum(grand/people,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('discount','Discount Of Product', root=>{
  root.innerHTML = `
    <div class="field"><label>Original price</label><input type="number" id="dcPrice" value="1000"></div>
    <div class="field"><label>Discount (%)</label><input type="number" id="dcPct" value="20"></div>
    <table class="mono" id="dcOut"></table>
    <div class="divider"></div>
    <div class="hint">Or work backwards from the final price:</div>
    <div class="row">
      <div class="field"><label>Final price</label><input type="number" id="dcFinal"></div>
      <div class="field"><label>Discount (%)</label><input type="number" id="dcPct2" value="20"></div>
    </div>
    <div class="output" id="dcOut2">—</div>`;
  function update(){
    const p=+root.querySelector('#dcPrice').value, pct=+root.querySelector('#dcPct').value;
    const saved = p*pct/100, final = p-saved;
    root.querySelector('#dcOut').innerHTML = [
      ['You save', fmtNum(saved,2)], ['Final price', fmtNum(final,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  function update2(){
    const f=+root.querySelector('#dcFinal').value, pct=+root.querySelector('#dcPct2').value;
    const out = root.querySelector('#dcOut2');
    if(!f || pct>=100){ out.textContent='—'; return; }
    const original = f/(1-pct/100);
    out.innerHTML = `Original price was <span class="big">${fmtNum(original,2)}</span>`;
  }
  root.querySelectorAll('#dcPrice,#dcPct').forEach(el=>el.addEventListener('input', update));
  root.querySelectorAll('#dcFinal,#dcPct2').forEach(el=>el.addEventListener('input', update2));
  update(); update2();
});

fin('commission','Commission Calculator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Sale amount</label><input type="number" id="cmSale" value="5000"></div>
      <div class="field"><label>Commission rate (%)</label><input type="number" id="cmRate" value="7.5" step="0.1"></div>
    </div>
    <table class="mono" id="cmOut"></table>`;
  function update(){
    const sale=+root.querySelector('#cmSale').value, rate=+root.querySelector('#cmRate').value;
    const commission = sale*rate/100;
    root.querySelector('#cmOut').innerHTML = [
      ['Commission earned', fmtNum(commission,2)],
      ['Net to seller', fmtNum(sale-commission,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('retirement','Retirement Planner', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Current age</label><input type="number" id="rpAge" value="30"></div>
      <div class="field"><label>Retirement age</label><input type="number" id="rpRetAge" value="60"></div>
    </div>
    <div class="row">
      <div class="field"><label>Current savings</label><input type="number" id="rpSavings" value="20000"></div>
      <div class="field"><label>Monthly contribution</label><input type="number" id="rpContrib" value="500"></div>
    </div>
    <div class="field"><label>Expected annual return (%)</label><input type="number" id="rpReturn" value="7" step="0.1"></div>
    <table class="mono" id="rpOut"></table>`;
  function update(){
    const age=+root.querySelector('#rpAge').value, retAge=+root.querySelector('#rpRetAge').value;
    const savings=+root.querySelector('#rpSavings').value, contrib=+root.querySelector('#rpContrib').value;
    const rate=+root.querySelector('#rpReturn').value/100;
    const out = root.querySelector('#rpOut');
    const years = retAge-age;
    if(years<=0){ out.innerHTML='<tr><td colspan="2">Retirement age must be after current age.</td></tr>'; return; }
    const months = years*12, monthlyRate = rate/12;
    let balance = savings, contributed = savings;
    for(let m=0;m<months;m++){ balance*=(1+monthlyRate); balance+=contrib; contributed+=contrib; }
    out.innerHTML = [
      ['Years to retirement', years],
      ['Total contributed', fmtNum(contributed,2)],
      ['Projected balance at retirement', fmtNum(balance,2)],
      ['Growth from returns', fmtNum(balance-contributed,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('amortization','Amortization Table', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Loan amount</label><input type="number" id="amP" value="200000"></div>
      <div class="field"><label>Annual rate (%)</label><input type="number" id="amR" value="6.5" step="0.01"></div>
    </div>
    <div class="field"><label>Term (years)</label><input type="number" id="amY" value="15"></div>
    <div class="output" id="amSummary"></div>
    <div class="segrow"><button class="btn" id="amToggle">Show full schedule</button></div>
    <table class="mono" id="amOut" style="margin-top:10px"></table>`;
  let showAll = false;
  function update(){
    const P=+root.querySelector('#amP').value, annualR=+root.querySelector('#amR').value, years=+root.querySelector('#amY').value;
    const n = Math.round(years*12), r = annualR/1200;
    const summary = root.querySelector('#amSummary'), out = root.querySelector('#amOut');
    if(!P||!n){ summary.textContent=''; out.innerHTML=''; return; }
    const emi = r===0 ? P/n : P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    let balance = P; const rows=[];
    for(let m=1;m<=n;m++){
      const interest = balance*r;
      const principal = emi-interest;
      balance = Math.max(0, balance-principal);
      rows.push([m, fmtNum(principal,2), fmtNum(interest,2), fmtNum(balance,2)]);
    }
    summary.innerHTML = `Monthly payment: <b>${fmtNum(emi,2)}</b> · Total interest over life of loan: <b>${fmtNum(emi*n-P,2)}</b>`;
    const shown = showAll ? rows : [...rows.slice(0,6), ['…','…','…','…'], ...rows.slice(-6)];
    out.innerHTML = `<tr><th>#</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>` + shown.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
  }
  root.querySelector('#amToggle').addEventListener('click', ()=>{ showAll=!showAll; root.querySelector('#amToggle').textContent = showAll?'Show summary only':'Show full schedule'; update(); });
  root.querySelectorAll('#amP,#amR,#amY').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('inflation','Inflation Calculator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Amount</label><input type="number" id="infAmt" value="1000"></div>
      <div class="field"><label>Annual inflation rate (%)</label><input type="number" id="infRate" value="4" step="0.1"></div>
    </div>
    <div class="field"><label>Years</label><input type="number" id="infYears" value="10"></div>
    <table class="mono" id="infOut"></table>`;
  function update(){
    const amt=+root.querySelector('#infAmt').value, rate=+root.querySelector('#infRate').value/100, years=+root.querySelector('#infYears').value;
    const future = amt*Math.pow(1+rate,years);
    const pastEquivalent = amt/Math.pow(1+rate,years);
    root.querySelector('#infOut').innerHTML = [
      [`Future value in ${years} years`, fmtNum(future,2)+' (same buying power as today\'s '+fmtNum(amt,2)+')'],
      [`What today's amount was worth ${years} years ago`, fmtNum(pastEquivalent,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('mortgageafford','Mortgage Affordability', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Annual income</label><input type="number" id="maIncome" value="80000"></div>
      <div class="field"><label>Monthly debts (loans, cards)</label><input type="number" id="maDebt" value="300"></div>
    </div>
    <div class="row">
      <div class="field"><label>Down payment</label><input type="number" id="maDown" value="40000"></div>
      <div class="field"><label>Interest rate (%)</label><input type="number" id="maRate" value="6.5" step="0.01"></div>
    </div>
    <div class="field"><label>Loan term (years)</label><input type="number" id="maYears" value="30"></div>
    <table class="mono" id="maOut"></table>
    <div class="hint">Uses the common 28/36 rule of thumb: housing payment ≤28% of gross monthly income, total debts ≤36%. Actual lender criteria vary.</div>`;
  function update(){
    const income=+root.querySelector('#maIncome').value/12, debt=+root.querySelector('#maDebt').value;
    const down=+root.querySelector('#maDown').value, rate=+root.querySelector('#maRate').value/1200, years=+root.querySelector('#maYears').value;
    const n = years*12;
    const maxByFrontEnd = income*0.28;
    const maxByBackEnd = income*0.36-debt;
    const maxPayment = Math.max(0, Math.min(maxByFrontEnd, maxByBackEnd));
    const maxLoan = rate===0 ? maxPayment*n : maxPayment*(Math.pow(1+rate,n)-1)/(rate*Math.pow(1+rate,n));
    root.querySelector('#maOut').innerHTML = [
      ['Max monthly housing payment', fmtNum(maxPayment,2)],
      ['Max loan amount', fmtNum(maxLoan,2)],
      ['Estimated affordable home price', fmtNum(maxLoan+down,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('tiptable','Tip Table Generator', root=>{
  root.innerHTML = `<div class="field"><label>Bill amount</label><input type="number" id="ttAmt" value="60"></div>
    <table class="mono" id="ttOut2"></table>`;
  function update(){
    const amt = +root.querySelector('#ttAmt').value;
    const pcts = [10,15,18,20,25];
    root.querySelector('#ttOut2').innerHTML = `<tr><th>Tip %</th><th>Tip</th><th>Total</th></tr>` +
      pcts.map(p=>`<tr><td>${p}%</td><td>${fmtNum(amt*p/100,2)}</td><td>${fmtNum(amt*(1+p/100),2)}</td></tr>`).join('');
  }
  root.querySelector('#ttAmt').addEventListener('input', update);
  update();
});

fin('budgetsplit','Budget Splitter', root=>{
  root.innerHTML = `
    <div class="field"><label>Monthly income (after tax)</label><input type="number" id="bsIncome" value="4000"></div>
    <div class="row">
      <div class="field"><label>Needs %</label><input type="number" id="bsNeeds" value="50"></div>
      <div class="field"><label>Wants %</label><input type="number" id="bsWants" value="30"></div>
      <div class="field"><label>Savings %</label><input type="number" id="bsSavings" value="20"></div>
    </div>
    <table class="mono" id="bsOut2"></table>
    <div class="hint">Defaults to the popular 50/30/20 rule — adjust the percentages to fit your own budget.</div>`;
  function update(){
    const income=+root.querySelector('#bsIncome').value;
    const needs=+root.querySelector('#bsNeeds').value, wants=+root.querySelector('#bsWants').value, savings=+root.querySelector('#bsSavings').value;
    const total = needs+wants+savings;
    const out = root.querySelector('#bsOut2');
    out.innerHTML = [
      ['Needs', fmtNum(income*needs/100,2)],
      ['Wants', fmtNum(income*wants/100,2)],
      ['Savings', fmtNum(income*savings/100,2)],
      ['Percentages total', total+'%'+(total!==100?' (doesn\'t add to 100%)':'')]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

fin('wageconverter','Wage Converter', root=>{
  root.innerHTML = `
    <div class="field"><label>Hourly wage</label><input type="number" id="wcHourly" value="25"></div>
    <div class="row">
      <div class="field"><label>Hours/week</label><input type="number" id="wcHours" value="40"></div>
      <div class="field"><label>Weeks/year</label><input type="number" id="wcWeeks" value="52"></div>
    </div>
    <table class="mono" id="wcOut"></table>`;
  function update(){
    const hourly=+root.querySelector('#wcHourly').value, hours=+root.querySelector('#wcHours').value, weeks=+root.querySelector('#wcWeeks').value;
    const annual = hourly*hours*weeks;
    root.querySelector('#wcOut').innerHTML = [
      ['Weekly', fmtNum(hourly*hours,2)],
      ['Monthly (annual/12)', fmtNum(annual/12,2)],
      ['Annual', fmtNum(annual,2)]
    ].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

