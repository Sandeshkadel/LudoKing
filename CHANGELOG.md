# Changelog

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
