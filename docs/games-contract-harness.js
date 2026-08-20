const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'games.js'), 'utf8');
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');

const requiredMarkers = [
  'function showGames()',
  "modal('🎮 Games')",
  'Trivia Quiz',
  'Word Puzzle',
  'Memory Game',
  'Tic Tac Toe',
  'Snake',
  '2048',
  'function startGame(title)',
  "title === 'Tic Tac Toe'",
  'showTicTacToe()',
  'function showTicTacToe()',
  'Array.from({length:9',
  'id="ttt-board"',
  'id="ttt-status"',
  'window._tttBoard = Array(9).fill(\'\')',
  "window._tttTurn = 'X'",
  'function tttMove(i)',
  "window._tttTurn !== 'X'",
  "window._tttBoard[i] = 'X'",
  "checkTTTWin('X')",
  'window._tttBoard.every(c => c)',
  'setTimeout(() => {',
  "window._tttBoard[aiMove] = 'O'",
  "checkTTTWin('O')",
  "window._tttTurn = 'X'",
  'function checkTTTWin(p)',
  'const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]',
  'function tttReset()',
  'showTicTacToe()'
];
for (const marker of requiredMarkers) {
  assert(source.includes(marker), `Games marker missing: ${marker}`);
}
assert(html.includes('src/features/games.js'), 'Games module must remain linked from HTML');
assert(!source.includes('localStorage'), 'Games module must remain non-persistent');
assert(!source.includes('db.from('), 'Games module must not own database writes');
assert.strictEqual((source.match(/function showGames\(/g) || []).length, 1, 'Games renderer must have one module owner');
assert.strictEqual((source.match(/function tttMove\(/g) || []).length, 1, 'Tic-Tac-Toe move handler must have one module owner');
assert.strictEqual((source.match(/function checkTTTWin\(/g) || []).length, 1, 'Tic-Tac-Toe win checker must have one module owner');

console.log('GAMES_CONTRACT_HARNESS=PASS');
console.log('CARDS_DISPATCH_BOARD_GUARDS_OUTCOMES_AI_LINES_RESET_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/games.js');
console.log('PRODUCTION_CHANGE=0');
