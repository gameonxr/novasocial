/**
 * NovaSocial Functional Games feature.
 *
 * Extracted as a classic script so Games and Tic-Tac-Toe handlers remain
 * window-global while the Nova Universe update code stays inline.
 */
// ── FUNCTIONAL GAMES ──────────────────────────────────────
function showGames(){
  const m = modal('🎮 Games');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px">
      <div style="font-weight:700;font-size:15px;margin-bottom:14px">🎮 Mini Games</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          {title:'Trivia Quiz', desc:'Test your knowledge', icon:'🧠', color:'linear-gradient(135deg,#a855f7,#ec4899)', players:'1.2k playing'},
          {title:'Word Puzzle', desc:'Guess the word', icon:'📝', color:'linear-gradient(135deg,#0095f6,#00d4ff)', players:'856 playing'},
          {title:'Memory Game', desc:'Match the cards', icon:'🃏', color:'linear-gradient(135deg,#3db83d,#00ddff)', players:'432 playing'},
          {title:'Tic Tac Toe', desc:'Play vs AI', icon:'#️⃣', color:'linear-gradient(135deg,#f7931e,#ffcc00)', players:'1.5k playing'},
          {title:'Snake', desc:'Classic arcade', icon:'🐍', color:'linear-gradient(135deg,#3db83d,#00ff88)', players:'2.1k playing'},
          {title:'2048', desc:'Merge numbers', icon:'🔢', color:'linear-gradient(135deg,#E1306C,#833AB4)', players:'980 playing'},
        ].map(g => `
          <div onclick="startGame('${g.title}')" style="background:#0f0f0f;border-radius:14px;overflow:hidden;cursor:pointer;border:1px solid #1a1a1a">
            <div style="aspect-ratio:1;background:${g.color};display:flex;align-items:center;justify-content:center;font-size:48px">${g.icon}</div>
            <div style="padding:10px">
              <div style="font-weight:600;font-size:12px;color:#fff">${g.title}</div>
              <div style="font-size:10px;color:#666;margin-top:2px">${g.desc}</div>
              <div style="font-size:9px;color:#3db83d;margin-top:4px">● ${g.players}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function startGame(title){
  if(title === 'Tic Tac Toe'){
    showTicTacToe();
  } else {
    toast(`🎮 ${title} loading...`);
    closeModal();
  }
}

function showTicTacToe(){
  const m = modal('🎮 Tic Tac Toe');
  const body = m.querySelector('#mbody');
  body.innerHTML = `
    <div style="padding:16px;text-align:center">
      <div style="font-weight:700;font-size:14px;margin-bottom:14px">You (❌) vs AI (⭕)</div>
      <div id="ttt-board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:240px;margin:0 auto 14px">
        ${Array.from({length:9}, (_,i) => `<div onclick="tttMove(${i})" id="ttt-${i}" style="aspect-ratio:1;background:#1a1a1a;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;color:#fff"></div>`).join('')}
      </div>
      <div id="ttt-status" style="font-weight:600;color:#fff;margin-bottom:14px">Your turn!</div>
      <button onclick="tttReset()" class="bgrd" style="padding:10px 24px">🔄 New Game</button>
    </div>
  `;
  window._tttBoard = Array(9).fill('');
  window._tttTurn = 'X';
}

function tttMove(i){
  if(!window._tttBoard || window._tttBoard[i] || window._tttTurn !== 'X') return;
  window._tttBoard[i] = 'X';
  document.getElementById('ttt-' + i).textContent = '❌';

  if(checkTTTWin('X')){
    document.getElementById('ttt-status').textContent = '🎉 You won!';
    document.getElementById('ttt-status').style.color = '#3db83d';
    window._tttTurn = null;
    return;
  }

  if(window._tttBoard.every(c => c)){
    document.getElementById('ttt-status').textContent = "It's a draw!";
    window._tttTurn = null;
    return;
  }

  // AI move
  window._tttTurn = 'O';
  document.getElementById('ttt-status').textContent = 'AI thinking...';
  setTimeout(() => {
    const empty = window._tttBoard.map((c,i) => c ? null : i).filter(i => i !== null);
    if(empty.length){
      const aiMove = empty[Math.floor(Math.random() * empty.length)];
      window._tttBoard[aiMove] = 'O';
      document.getElementById('ttt-' + aiMove).textContent = '⭕';

      if(checkTTTWin('O')){
        document.getElementById('ttt-status').textContent = '😔 AI won!';
        document.getElementById('ttt-status').style.color = '#E1306C';
        window._tttTurn = null;
        return;
      }

      if(window._tttBoard.every(c => c)){
        document.getElementById('ttt-status').textContent = "It's a draw!";
        window._tttTurn = null;
        return;
      }
    }
    window._tttTurn = 'X';
    document.getElementById('ttt-status').textContent = 'Your turn!';
  }, 600);
}

function checkTTTWin(p){
  const b = window._tttBoard;
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return lines.some(l => l.every(i => b[i] === p));
}

function tttReset(){
  showTicTacToe();
}
