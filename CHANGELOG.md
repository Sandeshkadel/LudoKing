# Changelog

## 1.1.1

### Added
- **Winner Mode game series** (Settings → Winner): two required whole numbers, *games to play today* and *games to lose*. Losing games are placed at random among the series; the selected colour can be changed between games (never mid-game). After the last game Winner Mode switches off and is locked for 10 hours (persisted; a clock set backwards does not unlock it). Normal mode pauses the series without counting games.
- Per-game dice seed: every game (and every roll) draws from its own stream, so no two games replay the same dice sequence.

### Changed
- Assist and Winner mode banners are removed from the board; Winner Mode no longer draws a red border.

### Fixed
- Green's last home-lane square (225) was missing and 224 was drawn twice, so a Green piece one step from home vanished from the board.
- Switching the Winner colour mid-game left the game in an inconsistent state (hidden / stuck pieces). The colour can now only be changed before a game starts.
- Winner Mode can no longer be switched on outside a running series (reducer-level guard).
- Switching back to Winner Mode from Assist now resumes the paused series when the board is ready.
- Winner and Assist color pickers now update independently, and saved colors remain valid when starting 2- or 3-player games.
- Winner Mode number fields scroll into view and the settings modal moves above the keyboard while entering a series.
- Home pieces in the centre triangle are spaced so all four stay visible.

### Tests
- Board coverage, session lifecycle, real-store 7-game / 3-loss series, Settings form, and planned-loss simulation are covered by automated tests.


## 1.1.0

### Added
- **Winner Mode**: the selected colour is set to win. A red border and label ("WINNER MODE ON — Red will win") are shown for the whole match. The winner's dice are steered and other colours cannot roll a home-finishing number until the winner has as many pieces home; the winner moves its own pieces
- `playTurnThunk`: the whole dice turn now lives in one testable thunk, with real-store full-game tests
- Computer opponents for any seat with Easy / Normal / Hard difficulty (`src/engine/ai.ts`)
- Pure, immutable rules engine and deterministic seeded simulator (`src/engine`)
- `npm run simulate` simulation report; `npm run verify` quality gate
- Visible **Assist** banner so every player can see when a colour has a handicap
- Human / Computer toggle per seat on the player setup screen
- Release signing via environment variables / CI secrets
- Ludo King branding: name, launcher icon, logo

### Fixed
- Seats could be left without a dice turn when an automatic move was invalid; the new move chooser only returns legal moves and full-game tests confirm every seat gets its dice
- Jest configuration (ESM dependencies, asset stubs) — all suites now run
- TypeScript configuration and 14 type errors
- `redux-persist` serializable-check option (`ignoredActions`)
- Home screen animation cleanup (`stopAnimation`)
- Centre-triangle pieces received an array instead of a player number
- Repeated dice taps can no longer start overlapping turns
- 2,000+ lint/format errors; lint now reports 0 errors

### Changed
- Assist mode copy now states plainly that it is an open handicap
- Android release builds use the real keystore when provided
