/* ================================================================
   B32 — six generators that write a config file you were about to write by
   hand, and two small network tools.

   Every one of these exists because the answer is a fixed shape with three
   variables in it, and the reference is always open in another tab.
   ================================================================ */

/* ---------------- Development (8) ---------------- */

dev('editorconfig','.editorconfig Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Indent style</label><select id="ecStyle"><option value="space">spaces</option><option value="tab">tabs</option></select></div>
      <div class="field"><label>Indent size</label><input type="number" id="ecSize" value="2" min="1" max="8"></div>
      <div class="field"><label>Line endings</label><select id="ecEnd"><option value="lf">LF (Unix)</option><option value="crlf">CRLF (Windows)</option></select></div>
    </div>
    <div class="row">
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="ecFinal" checked> final newline</label>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="ecTrim" checked> trim trailing whitespace</label>
    </div>
    <div class="output" id="ecOut" style="white-space:pre;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">The root block plus the per-language overrides that actually differ — Markdown keeps its trailing spaces, Python needs four, Go wants tabs. Double-click the result to copy it.</div>`;
  function draw(){
    const style = root.querySelector('#ecStyle').value;
    const size = Number(root.querySelector('#ecSize').value) || 2;
    const lines = [
      'root = true', '',
      '[*]',
      'charset = utf-8',
      'end_of_line = ' + root.querySelector('#ecEnd').value,
      'insert_final_newline = ' + (root.querySelector('#ecFinal').checked),
      'trim_trailing_whitespace = ' + (root.querySelector('#ecTrim').checked),
      'indent_style = ' + style,
      'indent_size = ' + size,
      '',
      '[*.md]',
      'trim_trailing_whitespace = false',
      '',
      '[*.{yml,yaml}]',
      'indent_size = 2',
      '',
      '[Makefile]',
      'indent_style = tab',
      '',
      '[*.py]',
      'indent_size = 4'
    ];
    if(style === 'tab') lines[6] = 'indent_size = tab';
    root.querySelector('#ecOut').textContent = lines.join('\n');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('makefile','Makefile Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Project name</label><input type="text" id="mkName" value="app"></div>
      <div class="field"><label>Language</label><select id="mkLang"><option value="node">Node</option><option value="python">Python</option><option value="go">Go</option></select></div>
    </div>
    <div class="output" id="mkOut" style="white-space:pre;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">Tabs, not spaces — a Makefile with spaces fails with "missing separator", which is the single most common way a Makefile is born broken. The copy button keeps them.</div>`;
  function draw(){
    const name = root.querySelector('#mkName').value.replace(/[^A-Za-z0-9_-]/g, '') || 'app';
    const lang = root.querySelector('#mkLang').value;
    const run = { node: 'node index.js', python: 'python3 main.py', go: './bin/' + name }[lang];
    const test = { node: 'npm test', python: 'pytest', go: 'go test ./...' }[lang];
    const build = { node: 'npm ci', python: 'pip install -r requirements.txt', go: 'go build -o bin/' + name + ' ./...' }[lang];
    const lines = [
      '.PHONY: all build test run clean', '',
      'all: build', '',
      'build:',
      '\t' + build, '',
      'test: build',
      '\t' + test, '',
      'run: build',
      '\t' + run, '',
      'clean:',
      lang === 'node' ? '\trm -rf node_modules' : lang === 'python' ? '\tfind . -name __pycache__ -prune -exec rm -rf {} +' : '\trm -rf bin',
      ''
    ];
    root.querySelector('#mkOut').textContent = lines.join('\n');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('systemd','systemd Unit Generator', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Description</label><input type="text" id="sdDesc" value="Kitbox server"></div>
      <div class="field"><label>User</label><input type="text" id="sdUser" value="kitbox"></div>
    </div>
    <div class="row">
      <div class="field"><label>ExecStart</label><input type="text" id="sdExec" value="/usr/local/bin/kitbox --port 8080"></div>
      <div class="field"><label>Restart</label><select id="sdRestart"><option>on-failure</option><option>always</option><option>no</option></select></div>
    </div>
    <div class="row">
      <div class="field"><label>Working directory</label><input type="text" id="sdDir" value="/var/lib/kitbox"></div>
      <div class="field"><label>After</label><input type="text" id="sdAfter" value="network-online.target"></div>
    </div>
    <div class="output" id="sdOut" style="white-space:pre;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">A service unit with the hardening lines that cost nothing to add and are almost never added: no new privileges, a private /tmp, and a filesystem you have to open deliberately.</div>`;
  function draw(){
    const lines = [
      '[Unit]',
      'Description=' + root.querySelector('#sdDesc').value,
      'After=' + root.querySelector('#sdAfter').value,
      'Wants=' + root.querySelector('#sdAfter').value,
      '',
      '[Service]',
      'Type=simple',
      'User=' + root.querySelector('#sdUser').value,
      'WorkingDirectory=' + root.querySelector('#sdDir').value,
      'ExecStart=' + root.querySelector('#sdExec').value,
      'Restart=' + root.querySelector('#sdRestart').value,
      'RestartSec=5',
      '',
      '# hardening that costs nothing',
      'NoNewPrivileges=yes',
      'PrivateTmp=yes',
      'ProtectSystem=strict',
      'ProtectHome=yes',
      'ReadWritePaths=' + root.querySelector('#sdDir').value,
      '',
      '[Install]',
      'WantedBy=multi-user.target'
    ];
    root.querySelector('#sdOut').textContent = lines.join('\n');
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('semver','SemVer Comparer', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Version A</label><input type="text" id="svA" value="1.2.3-beta.2" style="font-family:var(--mono)"></div>
      <div class="field"><label>Version B</label><input type="text" id="svB" value="1.2.3" style="font-family:var(--mono)"></div>
    </div>
    <div class="output" id="svOut">—</div>
    <div class="hint">SemVer precedence, which surprises people in one place: <span class="mono">1.2.3-beta</span> is <b>lower</b> than <span class="mono">1.2.3</span>, so a prerelease sorts before the release it precedes. Numeric identifiers compare as numbers, so beta.2 &lt; beta.10.</div>`;
  const parse = v => {
    const m = v.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
    if(!m) return null;
    return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] ? m[4].split('.') : [], build: m[5] || '' };
  };
  function compare(a, b){
    for(const k of ['major', 'minor', 'patch']) if(a[k] !== b[k]) return a[k] < b[k] ? -1 : 1;
    if(!a.pre.length && !b.pre.length) return 0;
    if(!a.pre.length) return 1;          // a release outranks its prereleases
    if(!b.pre.length) return -1;
    for(let i=0;i<Math.max(a.pre.length, b.pre.length);i++){
      const x = a.pre[i], y = b.pre[i];
      if(x === undefined) return -1;
      if(y === undefined) return 1;
      const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
      if(xn && yn){ if(+x !== +y) return +x < +y ? -1 : 1; }
      else if(xn) return -1;             // numeric identifiers sort below alphanumeric
      else if(yn) return 1;
      else if(x !== y) return x < y ? -1 : 1;
    }
    return 0;
  }
  function draw(){
    const out = root.querySelector('#svOut');
    const a = parse(root.querySelector('#svA').value), b = parse(root.querySelector('#svB').value);
    if(!a || !b){ out.textContent = 'A version is MAJOR.MINOR.PATCH with optional -prerelease and +build, like 1.2.3-beta.2.'; return; }
    const c = compare(a, b);
    out.innerHTML = `<table class="mono">
      <tr><td>Result</td><td><b>${c === 0 ? 'equal' : (c < 0 ? 'A < B' : 'A > B')}</b></td></tr>
      <tr><td>A is</td><td>${a.major}.${a.minor}.${a.patch}${a.pre.length ? '-' + a.pre.join('.') : ''}${a.build ? '+' + a.build : ''}</td></tr>
      <tr><td>B is</td><td>${b.major}.${b.minor}.${b.patch}${b.pre.length ? '-' + b.pre.join('.') : ''}${b.build ? '+' + b.build : ''}</td></tr>
      <tr><td>Precedence</td><td>major → minor → patch → prerelease</td></tr>
      <tr><td>Build metadata</td><td>ignored by precedence — ${a.build || b.build ? 'one side has it, and it does not change the order' : 'neither side has it'}</td></tr>
    </table>`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', draw));
  draw();
});

dev('conventional','Conventional Commit', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Type</label><select id="cvType">
        <option>feat</option><option>fix</option><option>docs</option><option>style</option><option>refactor</option>
        <option>perf</option><option>test</option><option>build</option><option>ci</option><option>chore</option><option>revert</option>
      </select></div>
      <div class="field"><label>Scope (optional)</label><input type="text" id="cvScope" placeholder="parser"></div>
    </div>
    <div class="field"><label>Description</label><input type="text" id="cvDesc" value="reject a length that runs past its parent"></div>
    <div class="field"><label>Body (optional)</label><textarea id="cvBody" style="min-height:60px"></textarea></div>
    <label style="display:flex;gap:8px;align-items:center;padding:6px 0"><input type="checkbox" id="cvBreak"> breaking change</label>
    <div class="field" id="cvBreakRow" style="display:none"><label>What breaks</label><input type="text" id="cvBreakMsg"></div>
    <div class="output" id="cvOut" style="white-space:pre-wrap;font-family:var(--mono);font-size:12px">—</div>
    <div class="hint">The subject is the part that ends up in a changelog, so it is written in the imperative and without a full stop. The footer is what a tool reads to decide a major version — which is why "BREAKING CHANGE" has to be spelled exactly.</div>`;
  function draw(){
    const type = root.querySelector('#cvType').value;
    const scope = root.querySelector('#cvScope').value.trim();
    const desc = root.querySelector('#cvDesc').value.trim().replace(/\.$/, '');
    const body = root.querySelector('#cvBody').value.trim();
    const breaking = root.querySelector('#cvBreak').checked;
    const breakingMsg = root.querySelector('#cvBreakMsg').value.trim();
    root.querySelector('#cvBreakRow').style.display = breaking ? 'block' : 'none';
    const head = type + (scope ? '(' + scope + ')' : '') + (breaking ? '!' : '') + ': ' + (desc || '…');
    const lines = [head];
    if(body) lines.push('', body);
    if(breaking) lines.push('', 'BREAKING CHANGE: ' + (breakingMsg || 'describe what breaks'));
    root.querySelector('#cvOut').textContent = lines.join('\n');
  }
  root.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input', draw));
  root.querySelector('#cvBreak').addEventListener('change', draw);
  draw();
});

dev('randomport','Random Port', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>How many</label><input type="number" id="rpN" value="5" min="1" max="50"></div>
      <button class="btn primary" id="rpGo">Generate</button>
    </div>
    <div class="output" id="rpOut">—</div>
    <div class="hint">Ports from the ephemeral range (49152–65535) are the ones an operating system hands out for outgoing connections, so a service bound there is unlikely to collide with something you installed. That is a probability, not a guarantee.</div>`;
  const REGISTERED = new Set([5000, 5432, 6379, 8080, 8000, 3000, 3306, 27017, 9200, 11211, 5672, 9092]);
  function draw(){
    const n = Math.min(50, Math.max(1, Number(root.querySelector('#rpN').value) || 1));
    const picks = [];
    while(picks.length < n){
      const p = 49152 + Math.floor(Math.random() * (65535 - 49152));
      if(!picks.includes(p) && !REGISTERED.has(p)) picks.push(p);
    }
    root.querySelector('#rpOut').innerHTML = `<table class="mono">
      ${picks.map(p=>`<tr><td>${p}</td><td style="color:var(--muted)">${p < 50100 ? 'just inside the ephemeral range' : 'ephemeral'}</td></tr>`).join('')}
    </table>`;
  }
  root.querySelector('#rpGo').addEventListener('click', draw);
  draw();
});

dev('ipv6ula','IPv6 ULA Generator', root=>{
  root.innerHTML = `
    <div class="segrow"><button class="btn primary" id="ulGo">Generate a /48</button></div>
    <div class="output" id="ulOut">—</div>
    <div class="hint">A unique local address: <span class="mono">fd00::/8</span> with 40 random bits, which gives a private range with a vanishing chance of colliding with another network. It is the IPv6 equivalent of 10.0.0.0/8, and it is never routed to the internet.</div>`;
  root.querySelector('#ulGo').addEventListener('click', ()=>{
    const b = crypto.getRandomValues(new Uint8Array(5));
    const groups = [];
    groups.push('fd' + b[0].toString(16).padStart(2, '0'));
    groups.push(((b[1] << 8) | b[2]).toString(16));
    groups.push(((b[3] << 8) | b[4]).toString(16));
    const prefix = groups.join(':') + '::/48';
    root.querySelector('#ulOut').innerHTML = `<table class="mono">
      <tr><td>Prefix</td><td>${prefix}</td></tr>
      <tr><td>First subnet</td><td>${groups.join(':')}:0::/64</td></tr>
      <tr><td>Typical host</td><td>${groups.join(':')}:1::1</td></tr>
      <tr><td>Scope</td><td>unique local — never routed beyond your network</td></tr>
    </table>`;
  });
  root.querySelector('#ulGo').click();
});

dev('emailnormalise','Email Normaliser', root=>{
  root.innerHTML = `
    <div class="field"><label>Address</label><input type="text" id="enIn" value="Dr.Sohil.Momin+newsletter@Gmail.com" style="font-family:var(--mono)"></div>
    <div class="output" id="enOut">—</div>
    <div class="hint">Lowercases the domain (which is case-insensitive) and shows the forms a mail provider may or may not treat as the same mailbox. Gmail ignores dots and +tags; most other providers do not, and a normaliser that assumes they do will lose people's accounts.</div>`;
  function draw(){
    const raw = root.querySelector('#enIn').value.trim();
    const at = raw.lastIndexOf('@');
    const out = root.querySelector('#enOut');
    if(at < 1){ out.textContent = 'That is not an address with a local part and a domain.'; return; }
    const local = raw.slice(0, at), domain = raw.slice(at + 1).toLowerCase();
    const plus = local.split('+')[0];
    const dots = plus.replace(/\./g, '');
    const gmailish = /^(gmail|googlemail)\.com$/.test(domain);
    out.innerHTML = `<table class="mono">
      <tr><td>As given</td><td>${escapeHtml(raw)}</td></tr>
      <tr><td>Canonical</td><td>${escapeHtml(local + '@' + domain)}</td></tr>
      <tr><td>Without +tag</td><td>${escapeHtml(plus + '@' + domain)}</td></tr>
      <tr><td>Without dots</td><td>${escapeHtml(dots + '@' + domain)}</td></tr>
      <tr><td>Provider ignores dots and tags?</td><td>${gmailish ? 'yes — this is Gmail, which does both' : 'probably not — only Gmail and a few others do; assume not'}</td></tr>
      <tr><td>Safe to deduplicate on</td><td>${escapeHtml(local.toLowerCase() + '@' + domain)} — lowercase only</td></tr>
    </table>`;
  }
  root.querySelector('#enIn').addEventListener('input', draw);
  draw();
});
