/* ================================================================
   GAMES
   ================================================================ */
TOOLS.games = [];
let GAM_N = 0;
function game(id, name, render){ register({cat:'games', id, name, render}); }

game('tictactoe','Tic-Tac-Toe', root=>{
  root.innerHTML = `<div id="tttBoard" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:280px;margin:10px auto"></div>
    <div class="output" id="tttOut" style="text-align:center">X's turn</div>
    <div class="segrow"><button class="btn" id="tttReset">Reset</button></div>`;
  let board = Array(9).fill(null), turn='X', over=false;
  const boardEl = root.querySelector('#tttBoard');
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function draw(){
    boardEl.innerHTML = board.map((v,i)=>`<button class="btn" data-i="${i}" aria-label="Row ${Math.floor(i/3)+1}, column ${i%3+1}${v ? ' — ' + (v === 'X' ? 'X' : 'O') : ' — empty'}" style="height:70px;font-size:28px;font-weight:700">${v||''}</button>`).join('');
    boardEl.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click', ()=>{
      const i=+b.dataset.i;
      if(over || board[i]) return;
      board[i]=turn;
      const win = LINES.find(l=>l.every(x=>board[x]===turn));
      if(win){ root.querySelector('#tttOut').textContent = turn+' wins!'; over=true; }
      else if(board.every(Boolean)){ root.querySelector('#tttOut').textContent = "It's a draw."; over=true; }
      else { turn = turn==='X'?'O':'X'; root.querySelector('#tttOut').textContent = turn+"'s turn"; }
      draw();
    }));
  }
  root.querySelector('#tttReset').addEventListener('click', ()=>{ board=Array(9).fill(null); turn='X'; over=false; root.querySelector('#tttOut').textContent="X's turn"; draw(); });
  draw();
});

game('numberguess','Number Guessing Game', root=>{
  root.innerHTML = `
    <div class="hint">I'm thinking of a number between 1 and 100.</div>
    <div class="row"><input type="number" id="ngGuess" min="1" max="100"><button class="btn primary" id="ngSubmit">Guess</button></div>
    <div class="output" id="ngOut" style="text-align:center">Make a guess!</div>
    <div class="segrow"><button class="btn" id="ngReset">New game</button></div>`;
  let target = 1+Math.floor(Math.random()*100), tries=0;
  root.querySelector('#ngSubmit').addEventListener('click', ()=>{
    const g = +root.querySelector('#ngGuess').value;
    if(!g) return;
    tries++;
    const out = root.querySelector('#ngOut');
    if(g===target) out.innerHTML = `<span class="big">Correct!</span> ${target} in ${tries} tries.`;
    else out.textContent = g<target ? 'Higher ⬆️' : 'Lower ⬇️';
  });
  root.querySelector('#ngReset').addEventListener('click', ()=>{ target=1+Math.floor(Math.random()*100); tries=0; root.querySelector('#ngOut').textContent='Make a guess!'; root.querySelector('#ngGuess').value=''; });
});

game('memorymatch','Memory Match', root=>{
  root.innerHTML = `<div id="mmBoard" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:340px;margin:10px auto"></div>
    <div class="output" id="mmOut2" style="text-align:center">Find all the pairs!</div>
    <div class="segrow"><button class="btn" id="mmReset">New game</button></div>`;
  const EMOJIS = ['🍎','🍌','🍇','🍒','🍉','🍋','🥝','🍑'];
  let cards, flipped, matched, lock, round=0;
  function setup(){
    round++;
    cards = [...EMOJIS,...EMOJIS].sort(()=>Math.random()-0.5);
    flipped=[]; matched=new Set(); lock=false;
    root.querySelector('#mmOut2').textContent = 'Find all the pairs!';
    draw();
  }
  function draw(){
    root.querySelector('#mmBoard').innerHTML = cards.map((c,i)=>{
      const shown = matched.has(i) || flipped.includes(i);
      return `<button class="btn" data-i="${i}" style="height:60px;font-size:24px">${shown?c:'❓'}</button>`;
    }).join('');
    root.querySelectorAll('[data-i]').forEach(b=>b.addEventListener('click', ()=>{
      const i=+b.dataset.i;
      if(lock || flipped.includes(i) || matched.has(i)) return;
      flipped.push(i); draw();
      if(flipped.length===2){
        lock=true;
        const myRound = round;
        setTimeout(()=>{
          if(myRound!==round) return; // a reset happened while this was pending — ignore stale result
          const [a,b2]=flipped;
          if(cards[a]===cards[b2]){ matched.add(a); matched.add(b2); }
          flipped=[]; lock=false; draw();
          if(matched.size===cards.length) root.querySelector('#mmOut2').textContent='You found them all! 🎉';
        }, 700);
      }
    }));
  }
  root.querySelector('#mmReset').addEventListener('click', setup);
  setup();
});

const SCRAMBLE_WORDS = ['JAVASCRIPT','MEDICINE','HOSPITAL','PHYSICIAN','CHEMISTRY','ELEPHANT','MOUNTAIN','KEYBOARD','SANDWICH','UMBRELLA','TRIANGLE','ALPHABET','BUTTERFLY','ADVENTURE','CALENDAR'];
game('wordscramble','Word Scramble', root=>{
  root.innerHTML = `
    <div class="counter-display" id="wsScrambled" style="font-size:34px"></div>
    <div class="row"><input type="text" id="wsGuess"><button class="btn primary" id="wsCheck">Check</button></div>
    <div class="output" id="wsOut" style="text-align:center">Unscramble the word!</div>
    <div class="segrow"><button class="btn" id="wsNew">New word</button></div>`;
  let word;
  function scramble(w){ let s; do{ s=w.split('').sort(()=>Math.random()-0.5).join(''); }while(s===w); return s; }
  function next(){
    word = SCRAMBLE_WORDS[Math.floor(Math.random()*SCRAMBLE_WORDS.length)];
    root.querySelector('#wsScrambled').textContent = scramble(word);
    root.querySelector('#wsOut').textContent = `${word.length} letters`;
    root.querySelector('#wsGuess').value='';
  }
  root.querySelector('#wsCheck').addEventListener('click', ()=>{
    const g = root.querySelector('#wsGuess').value.toUpperCase().trim();
    root.querySelector('#wsOut').textContent = g===word ? 'Correct! 🎉' : 'Not quite — try again.';
  });
  root.querySelector('#wsNew').addEventListener('click', next);
  next();
});

const HANGMAN_WORDS = ['PYTHON','GUITAR','OXYGEN','GALAXY','WIZARD','PUZZLE','JUNGLE','VOLCANO','CRYSTAL','FESTIVAL'];
game('hangman','Hangman', root=>{
  root.innerHTML = `
    <div class="output" id="hmWord" style="text-align:center;font-size:28px;letter-spacing:6px">—</div>
    <div class="output" id="hmStatus" style="text-align:center">6 lives left</div>
    <div id="hmKeys" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:14px 0"></div>
    <div class="segrow"><button class="btn" id="hmNew">New word</button></div>`;
  let word, guessed, lives;
  function next(){
    word = HANGMAN_WORDS[Math.floor(Math.random()*HANGMAN_WORDS.length)];
    guessed = new Set(); lives = 6;
    drawKeys(); render();
  }
  function render(){
    root.querySelector('#hmWord').textContent = word.split('').map(c=>guessed.has(c)?c:'_').join(' ');
    const lost = lives<=0, won = word.split('').every(c=>guessed.has(c));
    root.querySelector('#hmStatus').textContent = lost ? `Out of lives — the word was ${word}` : won ? 'You got it! 🎉' : `${lives} lives left`;
    if(lost||won) root.querySelectorAll('#hmKeys button').forEach(b=>b.disabled=true);
    return lost||won;
  }
  function drawKeys(){
    root.querySelector('#hmKeys').innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c=>`<button class="btn" data-c="${c}" style="min-width:34px;padding:8px">${c}</button>`).join('');
    root.querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click', ()=>{
      const c = b.dataset.c;
      if(guessed.has(c) || lives<=0) return;
      guessed.add(c);
      if(!word.includes(c)) lives--;
      b.disabled = true;
      render();
    }));
  }
  root.querySelector('#hmNew').addEventListener('click', next);
  next();
});

game('simonsays','Simon Says', root=>{
  root.innerHTML = `
    <div id="ssGrid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-width:240px;margin:10px auto"></div>
    <div class="output" id="ssOut" style="text-align:center">Press Start</div>
    <div class="segrow"><button class="btn primary" id="ssStart">Start</button></div>`;
  const COLORS = ['#E31C7D','#2F86EB','#3FCB6B','#F2871A'];
  let sequence=[], playerIdx=0, playing=false;
  const grid = root.querySelector('#ssGrid');
  grid.innerHTML = COLORS.map((c,i)=>`<button class="tag" data-i="${i}" style="height:90px;background:${c};border:none"></button>`).join('');
  const btns = [...grid.querySelectorAll('[data-i]')];
  function flash(i){
    return new Promise(res=>{
      btns[i].style.opacity='0.4';
      setTimeout(()=>{ btns[i].style.opacity='1'; res(); }, 350);
    });
  }
  async function playSequence(){
    playing=false;
    root.querySelector('#ssStart').disabled = true;
    root.querySelector('#ssOut').textContent = 'Watch...';
    for(const i of sequence){ await flash(i); await new Promise(r=>setTimeout(r,150)); }
    playing=true; playerIdx=0;
    root.querySelector('#ssOut').textContent = 'Your turn — repeat the sequence';
  }
  btns.forEach((b,i)=>b.addEventListener('click', ()=>{
    if(!playing) return;
    flash(i);
    if(sequence[playerIdx]===i){
      playerIdx++;
      if(playerIdx===sequence.length){
        root.querySelector('#ssOut').textContent = `Level ${sequence.length} complete!`;
        playing=false;
        setTimeout(()=>{ sequence.push(Math.floor(Math.random()*4)); playSequence(); }, 800);
      }
    } else {
      playing=false;
      root.querySelector('#ssStart').disabled = false;
      root.querySelector('#ssOut').textContent = `Game over — reached level ${sequence.length}. Press Start to retry.`;
      sequence=[];
    }
  }));
  root.querySelector('#ssStart').addEventListener('click', ()=>{
    if(root.querySelector('#ssStart').disabled) return;
    sequence=[Math.floor(Math.random()*4)];
    playSequence();
  });
});

const WORDLE_WORDS = ['ABOUT','ABOVE','ACTOR','ADULT','AFTER','AGAIN','AGENT','AGREE','AHEAD','ALARM','ALBUM','ALERT','ALIKE','ALIVE','ALLOW','ALONE','ALONG','ALTER','AMONG','ANGEL','ANGER','ANGLE','ANGRY','APPLE','APPLY','ARENA','ARGUE','ARISE','ARRAY','ASIDE','ASSET','AVOID','AWARD','AWARE','BADLY','BAKER','BASIC','BEACH','BEGAN','BEGIN','BEING','BELOW','BENCH','BIRTH','BLACK','BLAME','BLANK','BLAST','BLIND','BLOCK','BLOOD','BOARD','BOOST','BOUND','BRAIN','BRAND','BREAD','BREAK','BRIEF','BRING','BROAD','BROWN','BUILD','BUILT','CABLE','CANDY','CARGO','CARRY','CATCH','CAUSE','CHAIN','CHAIR','CHARM','CHART','CHASE','CHEAP','CHECK','CHEST','CHIEF','CHILD','CHINA','CHOSE','CIVIL','CLAIM','CLASS','CLEAN','CLEAR','CLICK','CLIMB','CLOCK','CLOSE','CLOUD','COACH','COAST','COULD','COUNT','COURT','COVER','CRAFT','CRASH','CRAZY','CREAM','CRIME','CROSS','CROWD','CROWN','CURVE','CYCLE','DAILY','DANCE','DEATH','DELAY','DEPTH','DOUBT','DOZEN','DRAFT','DRAMA','DREAM','DRESS','DRINK','DRIVE','EARLY','EARTH','EIGHT','EMPTY','ENEMY','ENJOY','ENTER','ENTRY','EQUAL','ERROR','EVENT','EVERY','EXACT','EXIST','EXTRA','FAITH','FALSE','FAULT','FENCE','FIELD','FIFTH','FIGHT','FINAL','FIRST','FLAME','FLASH','FLOOR','FOCUS','FORCE','FOREST','FORTH','FRAME','FRESH','FRONT','FROST','FRUIT','FUNNY','GHOST','GIANT','GIVEN','GLASS','GLOBE','GRACE','GRADE','GRAIN','GRAND','GRANT','GRASS','GREAT','GREEN','GROUP','GUARD','GUESS','GUEST','GUIDE','HAPPY','HEART','HEAVY','HONOR','HORSE','HOTEL','HOUSE','HUMAN','IMAGE','INDEX','INNER','INPUT','ISSUE','JOINT','JUDGE','JUICE','KNOWN','LABEL','LARGE','LASER','LATER','LAUGH','LAYER','LEARN','LEAST','LEAVE','LEGAL','LEVEL','LIGHT','LIMIT','LOGIC','LOOSE','LOWER','LUCKY','LUNCH','MAGIC','MAJOR','MARCH','MATCH','MAYBE','MEDAL','MEDIA','MERIT','METAL','MIGHT','MINOR','MODEL','MONEY','MONTH','MORAL','MOTOR','MOUNT','MOUSE','MOUTH','MOVIE','MUSIC','NIGHT','NOISE','NORTH','NOVEL','NURSE','OCEAN','OFFER','OFTEN','ORDER','OTHER','OUTER','OWNER','PAINT','PANEL','PANIC','PAPER','PARTY','PATCH','PAUSE','PEACE','PHASE','PHONE','PHOTO','PIECE','PILOT','PLACE','PLAIN','PLANE','PLANT','PLATE','POINT','POUND','POWER','PRESS','PRICE','PRIDE','PRIME','PRINT','PRIOR','PRIZE','PROOF','PROUD','PROVE','QUEEN','QUICK','QUIET','QUITE','RADIO','RAISE','RANGE','RAPID','REACH','READY','REBEL','REFER','RELAX','REPLY','RIGHT','RIVAL','RIVER','ROBOT','ROUGH','ROUND','ROUTE','ROYAL','RURAL','SALAD','SAUCE','SCALE','SCENE','SCOPE','SCORE','SENSE','SERVE','SEVEN','SHAPE','SHARE','SHARP','SHEET','SHELF','SHELL','SHIFT','SHIRT','SHOCK','SHOOT','SHORT','SIGHT','SINCE','SKILL','SLEEP','SLICE','SMALL','SMART','SMILE','SMOKE','SOLID','SOLVE','SORRY','SOUND','SOUTH','SPACE','SPARE','SPEAK','SPEED','SPEND','SPLIT','SPORT','STAFF','STAGE','STAIR','STAND','START','STATE','STEAM','STEEL','STICK','STILL','STOCK','STONE','STORE','STORM','STORY','STUDY','STUFF','STYLE','SUGAR','SUPER','SWEET','TABLE','TASTE','TEACH','THANK','THEME','THICK','THING','THINK','THIRD','THREE','THROW','TIGHT','TIRED','TITLE','TODAY','TOTAL','TOUCH','TOUGH','TOWER','TRACK','TRADE','TRAIN','TREAT','TREND','TRIAL','TRUCK','TRULY','TRUST','TRUTH','TWICE','UNDER','UNTIL','UPPER','URBAN','USAGE','USUAL','VALID','VALUE','VIDEO','VIRUS','VISIT','VITAL','VOICE','WASTE','WATCH','WATER','WHEEL','WHITE','WHOLE','WOMAN','WORLD','WORRY','WORSE','WORTH','WOULD','WOUND','WRITE','WRONG','YOUNG'].filter(w=>w.length===5);
game('wordle','Wordle', root=>{
  root.innerHTML = `
    <div id="wdGrid" style="display:flex;flex-direction:column;gap:6px;max-width:320px;margin:10px auto"></div>
    <div class="output" id="wdOut" style="text-align:center">Guess the 5-letter word.</div>
    <div id="wdKeyboard" style="margin:14px 0"></div>
    <div class="segrow"><button class="btn" id="wdNew">New game</button></div>
    <div class="hint">Any 5-letter guess is accepted (not checked against a dictionary) — green = right spot, yellow = wrong spot, gray = not in the word.</div>`;
  const ROWS=6;
  let answer, guesses, current, over;
  const KEY_ROWS = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
  let keyState = {};
  function next(){
    answer = WORDLE_WORDS[Math.floor(Math.random()*WORDLE_WORDS.length)];
    guesses = []; current=''; over=false; keyState={};
    drawGrid(); drawKeyboard();
    root.querySelector('#wdOut').textContent = 'Guess the 5-letter word.';
  }
  function evaluate(guess){
    const res = new Array(5).fill('gray');
    const counts = {};
    for(const c of answer) counts[c]=(counts[c]||0)+1;
    for(let i=0;i<5;i++) if(guess[i]===answer[i]){ res[i]='green'; counts[guess[i]]--; }
    for(let i=0;i<5;i++) if(res[i]!=='green' && counts[guess[i]]>0){ res[i]='yellow'; counts[guess[i]]--; }
    return res;
  }
  function drawGrid(){
    const rows = [];
    for(let r=0;r<ROWS;r++){
      const guess = guesses[r];
      const letters = r<guesses.length ? guess.letters : (r===guesses.length ? current.padEnd(5) : '     ');
      const colors = r<guesses.length ? guess.colors : null;
      rows.push(`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px">${
        letters.split('').map((ch,i)=>{
          const bg = colors ? ({green:'#3fcb6b',yellow:'#f2b705',gray:'var(--line-strong)'})[colors[i]] : 'transparent';
          const color = colors ? '#fff' : 'var(--ink)';
          return `<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;border:2px solid var(--line);border-radius:8px;background:${bg};color:${color}">${ch.trim()}</div>`;
        }).join('')
      }</div>`);
    }
    root.querySelector('#wdGrid').innerHTML = rows.join('');
  }
  function drawKeyboard(){
    root.querySelector('#wdKeyboard').innerHTML = KEY_ROWS.map(row=>`
      <div class="segrow" style="margin-bottom:6px">${row.split('').map(k=>{
        const st = keyState[k];
        const bg = st==='green'?'#3fcb6b':st==='yellow'?'#f2b705':st==='gray'?'var(--line-strong)':'#fff';
        const color = st ? '#fff' : 'var(--ink)';
        return `<button class="btn wdKey" data-k="${k}" style="min-width:28px;padding:8px 6px;background:${bg};color:${color}">${k}</button>`;
      }).join('')}</div>`).join('') +
      `<div class="segrow"><button class="btn" id="wdBack">⌫ Back</button><button class="btn primary" id="wdEnter">Enter</button></div>`;
    root.querySelectorAll('.wdKey').forEach(b=>b.addEventListener('click', ()=>{
      if(over || current.length>=5) return;
      current += b.dataset.k; drawGrid();
    }));
    root.querySelector('#wdBack').addEventListener('click', ()=>{ current=current.slice(0,-1); drawGrid(); });
    root.querySelector('#wdEnter').addEventListener('click', submit);
  }
  function submit(){
    if(over || current.length!==5) return;
    const colors = evaluate(current);
    guesses.push({letters:current, colors});
    current.split('').forEach((ch,i)=>{
      const rank = {gray:0,yellow:1,green:2};
      if(!keyState[ch] || rank[colors[i]]>rank[keyState[ch]]) keyState[ch]=colors[i];
    });
    const won = guesses[guesses.length-1].letters===answer;
    current='';
    drawGrid(); drawKeyboard();
    if(won){ over=true; root.querySelector('#wdOut').textContent = `You got it — ${answer}! 🎉`; }
    else if(guesses.length>=ROWS){ over=true; root.querySelector('#wdOut').textContent = `Out of guesses — the word was ${answer}.`; }
  }
  root.querySelector('#wdNew').addEventListener('click', next);
  next();
});

game('triviacreator','Trivia Creator', root=>{
  let decks = store.get('trivia-decks', []);
  root.innerHTML = `<div id="tcRoot"></div>`;
  const view = root.querySelector('#tcRoot');
  function persist(){ store.set('trivia-decks', decks); }

  function showList(){
    view.innerHTML = `
      <div class="row"><input type="text" id="tcNewDeck" placeholder="New quiz name..."><button class="btn primary" id="tcAddDeck">+ Create</button></div>
      <div class="segrow" style="margin-top:10px"><label class="btn" style="cursor:pointer">⬆ Import quiz<input type="file" accept="application/json" id="tcImportDeck" style="display:none"></label></div>
      <div id="tcDecks" style="margin-top:14px"></div>
      <div class="divider"></div>
      <div class="section-label" style="margin:0 0 10px">All trivia data</div>
      <div id="tcExportAll"></div>`;
    exportImportRow(view.querySelector('#tcExportAll'), 'trivia-decks', 'kitbox-trivia-all.json', data=>{ decks = data||[]; draw(); });
    view.querySelector('#tcImportDeck').addEventListener('change', async e=>{
      const file = e.target.files[0]; if(!file) return;
      try{
        const deck = await readJSONFile(file);
        if(!deck || !deck.name || !Array.isArray(deck.questions)) throw new Error('bad shape');
        deck.id = 'q'+Date.now();
        decks.push(deck); persist(); draw();
      }catch(err){ alert('That file doesn\'t look like a valid quiz export.'); }
    });
    function draw(){
      view.querySelector('#tcDecks').innerHTML = decks.length ? decks.map(d=>`
        <div class="score-card" style="text-align:left;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
          <div><b>${escapeHtml(d.name)}</b><div class="hint" style="margin:2px 0 0">${d.questions.length} questions</div></div>
          <span class="segrow" style="margin:0">
            <button class="btn" data-edit="${d.id}">Edit</button>
            <button class="btn primary" data-play="${d.id}" ${d.questions.length<2?'disabled':''}>Play</button>
            <button class="btn ghost" data-del="${d.id}" aria-label="Remove">✕</button>
          </span>
        </div>`).join('') : '<div class="hint">No quizzes yet — create one above.</div>';
      view.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click', ()=>showEditor(b.dataset.edit)));
      view.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click', ()=>showPlay(b.dataset.play)));
      view.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', ()=>{ decks=decks.filter(d=>d.id!==b.dataset.del); persist(); draw(); }));
    }
    view.querySelector('#tcAddDeck').addEventListener('click', ()=>{
      const name = view.querySelector('#tcNewDeck').value.trim();
      if(!name) return;
      decks.push({id:'q'+Date.now(), name, questions:[]});
      persist(); showEditor(decks[decks.length-1].id);
    });
    draw();
  }

  function showEditor(deckId){
    const deck = decks.find(d=>d.id===deckId);
    view.innerHTML = `
      <button class="btn ghost" id="tcBack">← All quizzes</button>
      <h3 style="margin:12px 0 4px">${escapeHtml(deck.name)}</h3>
      <div class="field"><label>Question</label><input type="text" id="tcQ"></div>
      <div class="field"><label>Option A (correct answer)</label><input type="text" id="tcA"></div>
      <div class="field"><label>Option B</label><input type="text" id="tcB"></div>
      <div class="field"><label>Option C</label><input type="text" id="tcC"></div>
      <div class="field"><label>Option D</label><input type="text" id="tcD"></div>
      <div class="segrow"><button class="btn primary" id="tcAddQ">+ Add question</button><button class="btn ghost" id="tcExportDeck">⬇ Export this quiz</button></div>
      <div id="tcQList" style="margin-top:16px"></div>`;
    view.querySelector('#tcBack').addEventListener('click', showList);
    view.querySelector('#tcExportDeck').addEventListener('click', ()=>{
      downloadJSON(deck, `kitbox-quiz-${deck.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}.json`);
    });
    function drawQs(){
      view.querySelector('#tcQList').innerHTML = deck.questions.map((q,i)=>`
        <div class="row" style="border-bottom:1px solid var(--line);padding:8px 0;align-items:center">
          <div style="flex:1">${i+1}. ${escapeHtml(q.q)}</div>
          <button class="btn ghost" data-delq="${i}" style="flex:none;padding:4px 8px" aria-label="Remove">✕</button>
        </div>`).join('');
      view.querySelectorAll('[data-delq]').forEach(b=>b.addEventListener('click', ()=>{ deck.questions.splice(+b.dataset.delq,1); persist(); drawQs(); }));
    }
    view.querySelector('#tcAddQ').addEventListener('click', ()=>{
      const q = view.querySelector('#tcQ').value.trim();
      const a = view.querySelector('#tcA').value.trim(), b2 = view.querySelector('#tcB').value.trim();
      const c = view.querySelector('#tcC').value.trim(), d2 = view.querySelector('#tcD').value.trim();
      if(!q||!a||!b2||!c||!d2) return;
      deck.questions.push({q, options:[a,b2,c,d2], correct:a});
      persist();
      ['tcQ','tcA','tcB','tcC','tcD'].forEach(id=>view.querySelector('#'+id).value='');
      drawQs();
    });
    drawQs();
  }

  function showPlay(deckId){
    const deck = decks.find(d=>d.id===deckId);
    let order = [...deck.questions].sort(()=>Math.random()-0.5);
    let idx=0, score=0;
    function render(){
      if(idx>=order.length){
        view.innerHTML = `<div class="empty">Quiz complete — ${score}/${order.length} correct.</div><button class="btn primary" id="tcPlayDone">← Back</button>`;
        view.querySelector('#tcPlayDone').addEventListener('click', showList);
        return;
      }
      const q = order[idx];
      const opts = [...q.options].sort(()=>Math.random()-0.5);
      view.innerHTML = `
        <div class="hint">Question ${idx+1} of ${order.length} · Score: ${score}</div>
        <div class="panel"><div style="font-size:18px;font-weight:600;margin-bottom:14px">${escapeHtml(q.q)}</div>
        <div class="grid" style="grid-template-columns:1fr" id="tcOpts">${opts.map(o=>`<button class="tag" data-opt="${encodeURIComponent(o)}"><div class="name">${escapeHtml(o)}</div></button>`).join('')}</div></div>`;
      view.querySelectorAll('[data-opt]').forEach(b=>b.addEventListener('click', ()=>{
        if(decodeURIComponent(b.dataset.opt)===q.correct) score++;
        idx++; render();
      }));
    }
    render();
  }

  showList();
});

/* ================================================================
   TRAVEL TOOLS
   ================================================================ */
TOOLS.travel = [];
let TRV_N = 0;
function trv(id, name, render){ register({cat:'travel', id, name, render}); }

trv('packinglist','Packing List', root=>{
  const DEFAULTS = {
    Beach:['Swimsuit','Sunscreen','Sunglasses','Flip-flops','Beach towel','Hat'],
    Business:['Laptop + charger','Formal wear','Dress shoes','Business cards','Notebook'],
    Hiking:['Hiking boots','Backpack','Water bottle','First-aid kit','Rain jacket','Map/compass'],
    Winter:['Heavy coat','Gloves','Thermal layers','Boots','Scarf'],
  };
  root.innerHTML = `
    <div class="field"><label>Trip type</label><select id="plType">${Object.keys(DEFAULTS).map(k=>`<option>${k}</option>`).join('')}<option>Custom</option></select></div>
    <div id="plList"></div>
    <div class="row"><input type="text" id="plNew" placeholder="Add an item..."><button class="btn" id="plAdd">Add</button></div>`;
  let items = [];
  function load(type){
    items = (DEFAULTS[type]||[]).map(name=>({name, done:false}));
    draw();
  }
  function draw(){
    root.querySelector('#plList').innerHTML = items.map((it,i)=>`
      <label style="display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)">
        <input type="checkbox" data-i="${i}" ${it.done?'checked':''}> <span style="${it.done?'text-decoration:line-through;color:var(--muted)':''}">${escapeHtml(it.name)}</span>
      </label>`).join('');
    root.querySelectorAll('[data-i]').forEach(cb=>cb.addEventListener('change', ()=>{ items[+cb.dataset.i].done = cb.checked; draw(); }));
  }
  root.querySelector('#plType').addEventListener('change', e=>load(e.target.value));
  root.querySelector('#plAdd').addEventListener('click', ()=>{
    const v = root.querySelector('#plNew').value.trim();
    if(v){ items.push({name:v, done:false}); root.querySelector('#plNew').value=''; draw(); }
  });
  load('Beach');
});

trv('flightduration','Flight Duration', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Departure (local date & time)</label><input type="datetime-local" id="fdDep"></div>
      <div class="field"><label>Departure UTC offset (hours)</label><input type="number" id="fdDepOff" value="0" step="0.5"></div>
    </div>
    <div class="row">
      <div class="field"><label>Arrival (local date & time)</label><input type="datetime-local" id="fdArr"></div>
      <div class="field"><label>Arrival UTC offset (hours)</label><input type="number" id="fdArrOff" value="0" step="0.5"></div>
    </div>
    <div class="output" id="fdOut">—</div>`;
  function update(){
    const dep = root.querySelector('#fdDep').value, arr = root.querySelector('#fdArr').value;
    const depOff = +root.querySelector('#fdDepOff').value, arrOff = +root.querySelector('#fdArrOff').value;
    const out = root.querySelector('#fdOut');
    if(!dep || !arr){ out.textContent='—'; return; }
    const depUTC = new Date(dep).getTime() - depOff*3600000;
    const arrUTC = new Date(arr).getTime() - arrOff*3600000;
    const diffMin = Math.round((arrUTC-depUTC)/60000);
    if(diffMin<0){ out.textContent='Arrival is before departure — check the offsets/times.'; return; }
    out.innerHTML = `<span class="big">${Math.floor(diffMin/60)}h ${diffMin%60}m</span> flight duration`;
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
});

trv('baggagesize','Baggage Size Checker', root=>{
  root.innerHTML = `
    <div class="row">
      <div class="field"><label>Length (cm)</label><input type="number" id="bgL" value="55"></div>
      <div class="field"><label>Width (cm)</label><input type="number" id="bgW" value="40"></div>
      <div class="field"><label>Height (cm)</label><input type="number" id="bgH" value="20"></div>
    </div>
    <table class="mono" id="bgOut"></table>
    <div class="hint">Reference limits only — always check with your specific airline before flying.</div>`;
  const LIMITS = { 'IATA cabin guideline':[55,40,20], 'US domestic (typical)':[56,36,23], 'EU budget carrier (typical, strict)':[55,40,20], 'Generous carrier (typical)':[56,45,25] };
  function update(){
    const l=+root.querySelector('#bgL').value, w=+root.querySelector('#bgW').value, h=+root.querySelector('#bgH').value;
    const dims = [l,w,h].sort((a,b)=>b-a);
    root.querySelector('#bgOut').innerHTML = Object.entries(LIMITS).map(([name,lim])=>{
      const limSorted = [...lim].sort((a,b)=>b-a);
      const fits = dims.every((d,i)=>d<=limSorted[i]);
      return `<tr><td>${name}</td><td>${lim.join('×')}cm — ${fits?'✓ Fits':'✗ Too big'}</td></tr>`;
    }).join('');
  }
  root.querySelectorAll('input').forEach(el=>el.addEventListener('input', update));
  update();
});

trv('plugguide','Plug Type Guide', root=>{
  const DATA = {
    'United States':['A / B','120V'],'Canada':['A / B','120V'],'United Kingdom':['G','230V'],'Ireland':['G','230V'],
    'Germany':['C / F','230V'],'France':['C / E','230V'],'Italy':['C / F / L','230V'],'Spain':['C / F','230V'],
    'India':['C / D / M','230V'],'China':['A / C / I','220V'],'Japan':['A / B','100V'],'Australia':['I','230V'],
    'Brazil':['C / N','127V/220V'],'Mexico':['A / B','127V'],'South Africa':['M / N','230V'],'UAE':['G','230V'],
    'Thailand':['A / B / C','220V'],'Singapore':['G','230V'],'South Korea':['C / F','220V'],'Russia':['C / F','220V']
  };
  root.innerHTML = `
    <div class="field"><label>Country</label><input type="text" id="pgSearch" placeholder="Search country..."></div>
    <table class="mono" id="pgOut"></table>`;
  function draw(filter){
    const f=(filter||'').toLowerCase();
    root.querySelector('#pgOut').innerHTML = Object.entries(DATA).filter(([c])=>c.toLowerCase().includes(f))
      .map(([c,[plug,volt]])=>`<tr><td>${c}</td><td>Type ${plug} · ${volt}</td></tr>`).join('');
  }
  root.querySelector('#pgSearch').addEventListener('input', e=>draw(e.target.value));
  draw('');
});

/* ================================================================
   NATURE TOOLS
   ================================================================ */
TOOLS.nature = [];
let NAT_N = 0;
function nat(id, name, render){ register({cat:'nature', id, name, render}); }

nat('moonphase','Moon Phase', root=>{
  root.innerHTML = `<div style="font-size:64px;text-align:center" id="mpEmoji"></div><div class="output" id="mpInfo" style="text-align:center"></div>`;
  function getMoonPhase(date){
    const lp = 2551443;
    const newMoon = new Date(2000,0,6,18,14).getTime()/1000;
    const diff = date.getTime()/1000 - newMoon;
    const age = ((diff%lp)+lp)%lp;
    const phase = age/lp;
    const illumination = (1-Math.cos(2*Math.PI*phase))/2;
    let emoji,name;
    if(phase<0.125||phase>=0.875){emoji='🌑';name='New Moon';}
    else if(phase<0.25){emoji='🌒';name='Waxing Crescent';}
    else if(phase<0.375){emoji='🌓';name='First Quarter';}
    else if(phase<0.5){emoji='🌔';name='Waxing Gibbous';}
    else if(phase<0.625){emoji='🌕';name='Full Moon';}
    else if(phase<0.75){emoji='🌖';name='Waning Gibbous';}
    else {emoji='🌗';name='Last Quarter';}
    return {emoji,name,illumination:Math.round(illumination*100)};
  }
  const now = new Date();
  const moon = getMoonPhase(now);
  root.querySelector('#mpEmoji').textContent = moon.emoji;
  root.querySelector('#mpInfo').textContent = `${moon.name}\nIllumination: ${moon.illumination}%\n${now.toDateString()}`;
});

nat('solsticeequinox','Solstice/Equinox Dates', root=>{
  root.innerHTML = `<div class="field"><label>Year</label><input type="number" id="seYear" value="${new Date().getFullYear()}"></div>
    <table class="mono" id="seOut"></table>
    <div class="hint">Approximate (within about a day) using a standard astronomical approximation formula.</div>`;
  function calc(y, type){
    const Y = (y-2000)/1000;
    const base = {marEq:2451623.80984, junSol:2451716.56767, sepEq:2451810.21715, decSol:2451900.05952}[type];
    const rate = {marEq:365242.37404, junSol:365241.62603, sepEq:365242.01767, decSol:365242.74049}[type];
    const jd = base + rate*Y + 0.05169*Y*Y - 0.00411*Y*Y*Y - 0.00057*Y*Y*Y*Y;
    const date = new Date((jd-2440587.5)*86400000);
    return date;
  }
  function update(){
    const y = +root.querySelector('#seYear').value;
    const rows = [['March Equinox','marEq'],['June Solstice','junSol'],['September Equinox','sepEq'],['December Solstice','decSol']];
    root.querySelector('#seOut').innerHTML = rows.map(([label,key])=>`<tr><td>${label}</td><td>${calc(y,key).toUTCString().slice(0,22)} UTC</td></tr>`).join('');
  }
  root.querySelector('#seYear').addEventListener('input', update);
  update();
});

nat('sunexposure','Sun Exposure / Vitamin D Timer', root=>{
  root.innerHTML = `
    ${HEALTH_DISCLAIMER}
    <div class="field"><label>Skin type</label><select id="seSkin">
      <option value="1">Type I — always burns, never tans</option>
      <option value="2">Type II — usually burns, tans minimally</option>
      <option value="3" selected>Type III — sometimes burns, tans gradually</option>
      <option value="4">Type IV — burns minimally, tans well</option>
      <option value="5">Type V — rarely burns, tans easily</option>
      <option value="6">Type VI — never burns, deeply pigmented</option>
    </select></div>
    <div class="field"><label>UV Index</label><input type="number" id="seUv" value="6" min="0" max="15"></div>
    <div class="output" id="seOut2">—</div>`;
  const BASE_MINUTES = {1:10,2:15,3:20,4:30,5:45,6:60}; // baseline minutes to burn at UV index 1
  function update(){
    const skin = +root.querySelector('#seSkin').value, uv = +root.querySelector('#seUv').value;
    const out = root.querySelector('#seOut2');
    if(uv<=0){ out.textContent = 'UV index too low to estimate meaningfully.'; return; }
    const minutesToBurn = BASE_MINUTES[skin]/uv;
    out.innerHTML = `Estimated time before burn risk: <span class="big">${fmtNum(minutesToBurn,0)} min</span>\nVitamin D synthesis typically needs far less time (~half this) on exposed skin. Beyond the burn-risk time, sun protection is recommended.`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
});

nat('nightsky','Night Sky Brightness', root=>{
  root.innerHTML = `
    <div class="field"><label>Moon phase illumination (%)</label><input type="range" id="nsMoon" min="0" max="100" value="50"></div>
    <div class="field"><label>Local light pollution</label><select id="nsPollution">
      <option value="1">Excellent — remote/rural, no artificial light</option>
      <option value="4" selected>Suburban</option>
      <option value="7">Urban</option>
      <option value="9">City center</option>
    </select></div>
    <div class="output" id="nsOut">—</div>
    <div class="hint">A simplified estimate inspired by the Bortle scale — not a substitute for a real sky quality meter.</div>`;
  function update(){
    const moon = +root.querySelector('#nsMoon').value;
    const pollution = +root.querySelector('#nsPollution').value;
    const score = Math.min(9, Math.round(pollution + moon/100*3));
    const labels = {1:'Pristine dark sky',2:'Typical dark sky',3:'Rural sky',4:'Rural/suburban transition',5:'Suburban sky',6:'Bright suburban',7:'Suburban/urban transition',8:'City sky',9:'Inner-city sky'};
    root.querySelector('#nsOut').innerHTML = `Estimated Bortle-like class: <span class="big">${score}</span>\n${labels[score]||''}`;
  }
  root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input', update));
  update();
});

