/* ================================================================
   B22 — three games.

   They belong here for the same reason as everything else: they are small,
   they are offline, and they are the reason somebody opens the app on a day
   when they do not need a calculator. Each one keeps its score locally and
   none of them needs the network.
   ================================================================ */

game('game2048','2048', root=>{
  root.innerHTML = `
    <div class="row" style="align-items:center">
      <div class="output" id="g4Score" style="margin:0;flex:1">Score 0 · best 0</div>
      <button class="btn" id="g4New">New game</button>
    </div>
    <div id="g4Board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:var(--line);padding:8px;border-radius:8px;margin-top:12px;touch-action:none"></div>
    <div class="hint">Arrow keys or WASD, or swipe on a touch screen. Tiles of equal value merge once per move; the game is over when no move changes the board.</div>`;
  const N = 4;
  let grid, score = 0, best = store.get('g2048-best', 0), over = false;
  const COLORS = { 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179', 16:'#f59563', 32:'#f67c5f', 64:'#f65e3b',
    128:'#edcf72', 256:'#edcc61', 512:'#edc850', 1024:'#edc53f', 2048:'#edc22e' };
  function reset(){
    grid = Array.from({length:N}, ()=>new Array(N).fill(0));
    score = 0; over = false;
    add(); add(); draw();
  }
  function add(){
    const empty = [];
    for(let r=0;r<N;r++) for(let c=0;c<N;c++) if(!grid[r][c]) empty.push([r,c]);
    if(!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  function draw(){
    const board = root.querySelector('#g4Board');
    board.innerHTML = grid.flat().map(v=>{
      const bg = v ? (COLORS[v] || '#3c3a32') : 'rgba(0,0,0,0.06)';
      const fg = v > 4 ? '#f9f6f2' : '#776e65';
      return `<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:6px;background:${bg};color:${fg};font-weight:700;font-size:${v > 999 ? 20 : v > 99 ? 24 : 28}px">${v || ''}</div>`;
    }).join('');
    root.querySelector('#g4Score').textContent = 'Score ' + score + ' · best ' + best + (over ? ' · no moves left' : '');
  }
  function move(dir){
    if(over) return;
    const before = JSON.stringify(grid);
    const rot = dir === 'up' ? 3 : dir === 'down' ? 1 : dir === 'left' ? 0 : 2;
    const turn = g => { let m = g; for(let i=0;i<rot;i++) m = m[0].map((_, c)=>m.map(row=>row[c]).reverse()); return m; };
    const unturn = g => { let m = g; for(let i=0;i<(4-rot)%4;i++) m = m[0].map((_, c)=>m.map(row=>row[c]).reverse()); return m; };
    let g = turn(grid);
    g = g.map(row=>{
      const vals = row.filter(Boolean);
      const out = [];
      for(let i=0;i<vals.length;i++){
        if(vals[i] === vals[i+1]){ out.push(vals[i] * 2); score += vals[i] * 2; i++; }
        else out.push(vals[i]);
      }
      while(out.length < N) out.push(0);
      return out;
    });
    grid = unturn(g);
    if(JSON.stringify(grid) !== before){ add(); }
    if(score > best){ best = score; store.set('g2048-best', best); }
    over = !canMove();
    draw();
  }
  function canMove(){
    for(let r=0;r<N;r++) for(let c=0;c<N;c++){
      if(!grid[r][c]) return true;
      if(c < N-1 && grid[r][c] === grid[r][c+1]) return true;
      if(r < N-1 && grid[r][c] === grid[r+1][c]) return true;
    }
    return false;
  }
  const onKey = e => {
    const k = e.key.toLowerCase();
    const dir = (k === 'arrowup' || k === 'w') ? 'up' : (k === 'arrowdown' || k === 's') ? 'down'
      : (k === 'arrowleft' || k === 'a') ? 'left' : (k === 'arrowright' || k === 'd') ? 'right' : null;
    if(dir){ e.preventDefault(); move(dir); }
  };
  root.addEventListener('keydown', onKey);
  root.tabIndex = 0;
  let touch = null;
  const board = root.querySelector('#g4Board');
  board.addEventListener('pointerdown', e=>{ touch = [e.clientX, e.clientY]; });
  board.addEventListener('pointerup', e=>{
    if(!touch) return;
    const dx = e.clientX - touch[0], dy = e.clientY - touch[1];
    if(Math.abs(dx) > 24 || Math.abs(dy) > 24) move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    touch = null;
  });
  root.querySelector('#g4New').addEventListener('click', reset);
  reset();
});

game('minesweeper','Minesweeper', root=>{
  root.innerHTML = `
    <div class="row" style="align-items:center">
      <div class="field" style="margin:0"><label>Size</label><select id="msSize"><option value="9">9 × 9</option><option value="12">12 × 12</option><option value="16">16 × 16</option></select></div>
      <div class="field" style="margin:0"><label>Mines</label><input type="number" id="msMines" value="10" min="1" max="80" style="width:80px"></div>
      <button class="btn" id="msNew">New game</button>
    </div>
    <div class="output" id="msState" style="margin:12px 0 0">Left click to open, right click to flag.</div>
    <div id="msBoard" style="display:grid;gap:2px;margin-top:10px;user-select:none"></div>
    <div class="hint">The first click is always safe — the mines are placed after it, so the opening move never ends the game. That is the only mercy this game has.</div>`;
  let size = 9, mineCount = 10, cells = [], started = false, dead = false, won = false, flags = 0;
  function reset(){
    size = Number(root.querySelector('#msSize').value);
    mineCount = Math.min(size*size - 9, Math.max(1, Number(root.querySelector('#msMines').value) || 10));
    cells = Array.from({length:size*size}, ()=>({ mine:false, open:false, flag:false, near:0 }));
    started = dead = won = false; flags = 0;
    draw();
  }
  function place(safeIndex){
    const forbidden = new Set([safeIndex]);
    const r = Math.floor(safeIndex / size), c = safeIndex % size;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      const nr = r+dr, nc = c+dc;
      if(nr>=0 && nr<size && nc>=0 && nc<size) forbidden.add(nr*size+nc);
    }
    let placed = 0, guard = 0;
    while(placed < mineCount && guard++ < 10000){
      const i = Math.floor(Math.random() * size * size);
      if(forbidden.has(i) || cells[i].mine) continue;
      cells[i].mine = true; placed++;
    }
    for(let i=0;i<size*size;i++){
      if(cells[i].mine) continue;
      const r2 = Math.floor(i / size), c2 = i % size;
      let n = 0;
      for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
        const nr = r2+dr, nc = c2+dc;
        if(nr>=0 && nr<size && nc>=0 && nc<size && cells[nr*size+nc].mine) n++;
      }
      cells[i].near = n;
    }
    started = true;
  }
  function open(i){
    const cell = cells[i];
    if(cell.open || cell.flag || dead || won) return;
    if(!started) place(i);
    if(cell.mine){ cell.open = true; dead = true; draw(); return; }
    const stack = [i];
    while(stack.length){
      const j = stack.pop();
      const cj = cells[j];
      if(cj.open || cj.flag) continue;
      cj.open = true;
      if(cj.near === 0){
        const r = Math.floor(j / size), c = j % size;
        for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
          const nr = r+dr, nc = c+dc;
          if(nr>=0 && nr<size && nc>=0 && nc<size){
            const k = nr*size+nc;
            if(!cells[k].open && !cells[k].mine) stack.push(k);
          }
        }
      }
    }
    won = cells.every(c=>c.open || c.mine);
    draw();
  }
  function draw(){
    const board = root.querySelector('#msBoard');
    board.style.gridTemplateColumns = 'repeat(' + size + ', minmax(0, 1fr))';
    board.innerHTML = cells.map((c, i)=>{
      let label = '', bg = 'var(--panel)', color = 'var(--text)';
      if(c.open && c.mine){ label = '✳'; bg = '#c0392b'; }
      else if(c.open){ label = c.near ? String(c.near) : ''; bg = 'rgba(0,0,0,0.06)'; color = ['','#1976d2','#388e3c','#d32f2f','#7b1fa2','#b8860b','#0097a7','#424242','#000'][c.near] || 'var(--text)'; }
      else if(c.flag){ label = '⚑'; bg = '#f2c94c'; }
      return `<button data-ms="${i}" style="aspect-ratio:1;border:1px solid var(--line);border-radius:3px;background:${bg};color:${color};font-weight:700;font-size:${Math.max(10, 26 - size)}px;cursor:pointer">${label}</button>`;
    }).join('');
    board.querySelectorAll('[data-ms]').forEach(b=>{
      const i = Number(b.dataset.ms);
      b.addEventListener('click', ()=>open(i));
      b.addEventListener('contextmenu', e=>{
        e.preventDefault();
        const c = cells[i];
        if(c.open || dead || won) return;
        c.flag = !c.flag;
        flags += c.flag ? 1 : -1;
        draw();
      });
    });
    root.querySelector('#msState').textContent = dead ? 'Mine — press New game.'
      : won ? 'Cleared. ' + mineCount + ' mines flagged or avoided.'
      : 'Mines ' + mineCount + ' · flags ' + flags + ' · ' + (started ? 'in play' : 'first click is safe');
  }
  root.querySelector('#msNew').addEventListener('click', reset);
  root.querySelector('#msSize').addEventListener('change', reset);
  root.querySelector('#msMines').addEventListener('change', reset);
  reset();
});

game('snake','Snake', root=>{
  root.innerHTML = `
    <div class="row" style="align-items:center">
      <div class="output" id="snState" style="margin:0;flex:1">Score 0 · best 0</div>
      <button class="btn primary" id="snGo">Start</button>
    </div>
    <canvas id="snCanvas" width="420" height="420" style="width:100%;max-width:420px;background:#0b0e14;border:1px solid var(--line);border-radius:8px;margin-top:12px;display:block;touch-action:none"></canvas>
    <div class="hint">Arrow keys or WASD, or swipe. The wall is solid — there is no wrapping, which is the harder and better game.</div>`;
  const canvas = root.querySelector('#snCanvas'), ctx = canvas.getContext('2d');
  const CELL = 21, COLS = 20;
  let snake, dir, food, timer = null, score = 0, best = store.get('snake-best', 0), running = false;
  function reset(){
    snake = [{x:9, y:10}, {x:8, y:10}, {x:7, y:10}];
    dir = {x:1, y:0};
    score = 0;
    dropFood();
    draw();
    root.querySelector('#snState').textContent = 'Score 0 · best ' + best;
  }
  function dropFood(){
    do{ food = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*COLS) }; }
    while(snake.some(s=>s.x === food.x && s.y === food.y));
  }
  function draw(){
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e31c7d';
    ctx.fillRect(food.x*CELL + 2, food.y*CELL + 2, CELL - 4, CELL - 4);
    snake.forEach((s, i)=>{
      ctx.fillStyle = i === 0 ? '#2f86eb' : '#1b5fae';
      ctx.fillRect(s.x*CELL + 1, s.y*CELL + 1, CELL - 2, CELL - 2);
    });
  }
  function step(){
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if(head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= COLS || snake.some(s=>s.x === head.x && s.y === head.y)){
      running = false;
      clearInterval(timer); timer = null;
      root.querySelector('#snGo').textContent = 'Start';
      root.querySelector('#snState').textContent = 'Dead at ' + score + ' · best ' + best;
      return;
    }
    snake.unshift(head);
    if(head.x === food.x && head.y === food.y){
      score++;
      if(score > best){ best = score; store.set('snake-best', best); }
      dropFood();
    } else snake.pop();
    root.querySelector('#snState').textContent = 'Score ' + score + ' · best ' + best;
    draw();
  }
  function toggle(){
    if(running){ running = false; clearInterval(timer); timer = null; root.querySelector('#snGo').textContent = 'Resume'; return; }
    if(!snake) reset();
    running = true;
    root.querySelector('#snGo').textContent = 'Pause';
    timer = setInterval(step, 110);
  }
  setCleanup(()=>{ if(timer) clearInterval(timer); });
  const onKey = e => {
    const k = e.key.toLowerCase();
    const map = { arrowup:{x:0,y:-1}, w:{x:0,y:-1}, arrowdown:{x:0,y:1}, s:{x:0,y:1},
                  arrowleft:{x:-1,y:0}, a:{x:-1,y:0}, arrowright:{x:1,y:0}, d:{x:1,y:0} };
    const nd = map[k];
    if(!nd) return;
    e.preventDefault();
    if(nd.x === -dir.x && nd.y === -dir.y) return;   // no reversing into yourself
    dir = nd;
  };
  root.addEventListener('keydown', onKey);
  root.tabIndex = 0;
  let touch = null;
  canvas.addEventListener('pointerdown', e=>{ touch = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e=>{
    if(!touch) return;
    const dx = e.clientX - touch[0], dy = e.clientY - touch[1];
    if(Math.abs(dx) > 20 || Math.abs(dy) > 20){
      const nd = Math.abs(dx) > Math.abs(dy) ? {x: dx > 0 ? 1 : -1, y:0} : {x:0, y: dy > 0 ? 1 : -1};
      if(!(nd.x === -dir.x && nd.y === -dir.y)) dir = nd;
    }
    touch = null;
  });
  root.querySelector('#snGo').addEventListener('click', toggle);
  reset();
});
