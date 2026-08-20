# NovaSocial Games Contract

**Repository:** `gameonxr/novasocial`  
**Branch:** `Branch2` only  
**Date:** 2026-08-20  
**Purpose:** Record the extracted Games feature invariants before any further structural change.

## Contract

`showGames()` opens the Games modal and renders the six static mini-game cards with title, description, icon, gradient, and player-count labels. `startGame(title)` dispatches Tic-Tac-Toe to the board surface and keeps other games on the existing loading-toast/close-modal path.

`showTicTacToe()` creates a fresh nine-cell board, status surface, and reset control, then initializes `_tttBoard` to nine empty cells and `_tttTurn` to `X`. `tttMove(i)` ignores occupied cells, invalid state, or non-player turns; it writes the player move, detects player wins/draws, and otherwise schedules an AI move after the existing delay. AI moves use an available cell, detect AI wins/draws, and return control to the player. `tttReset()` recreates the board through `showTicTacToe()`. `checkTTTWin(p)` retains the eight winning lines.

## Harness coverage

`docs/games-contract-harness.js` validates the following behavior:

| Scenario | Expected behavior | Result |
|---|---|---|
| Game surface | Preserve six cards and metadata | PASS |
| Dispatch | Route Tic-Tac-Toe separately from other games | PASS |
| Board setup | Create nine cells, status, reset, and initial state | PASS |
| Move guards | Ignore occupied cells, invalid state, and wrong turns | PASS |
| Player result | Detect win and draw states | PASS |
| AI result | Schedule delayed move, detect win/draw, restore turn | PASS |
| Win lines | Preserve all eight Tic-Tac-Toe lines | PASS |
| Reset | Recreate a fresh board | PASS |
| Scope | Keep game state local/UI-only with no persistence | PASS |

The harness is deterministic and static. It does not open modals, schedule AI moves, mutate the real DOM, or persist game results.

## Safe boundary

The extracted `src/features/games.js` module remains unchanged in this checkpoint. The later inline Nova Universe update surface remains unchanged.

## Validation

The standalone harness must pass with all JavaScript syntax checks, every current contract harness, `/tmp/validate_*.py` validators, inline-script validation, whitespace checks, and explicit Branch2/main reference checks.

## References

1. [`games.js`](../src/features/games.js)
2. [`contract-artifact-pairing-contract.md`](./contract-artifact-pairing-contract.md)
3. [`MIGRATION_MAP.md`](../MIGRATION_MAP.md)

