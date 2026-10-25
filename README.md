<div align="center">

# Ludo King

**Classic Ludo for Android and iOS — fair dice, a smart computer opponent, and openly labelled Assist and Winner modes.**

Ludo King is also used by a commercial game, so use a different name before any Play Store/App Store release.

React Native 0.73 · TypeScript · Redux Toolkit

</div>

---

## Features

- Classic Ludo rules for **2, 3 or 4 players** with custom player names
- **Computer opponents** on any seat (Easy / Normal / Hard) — see [How the AI works](#how-the-ai-works)
- **Fair dice by default**: every player rolls a uniform 1–6
- **Assist mode** (optional, always disclosed): a visible *"Assist: Red"* banner tells every player that one colour has an open handicap
- **Winner Mode** (optional, always disclosed): pick a colour in Settings and it is set to win; a red border and a **"WINNER MODE ON — Red will win"** label stay on the board for the whole match
- Animated dice, captures, safe/star squares, victory lanes, fireworks and a winner screen
- Sound effects, restart that keeps your setup, accessible labels on interactive controls

Note: the name "Ludo King" is also used by a commercial game, so use a different name before any Play Store/App Store release.

## Game modes and fairness policy

| Mode | Dice | Who knows |
|------|------|-----------|
| **Normal** (default) | Uniform for all players | — |
| **Assist** | Favoured colour rolls weighted dice (8/10/14/18/22/28 % for faces 1–6) and its moves are chosen automatically; every other colour is uniform | A banner on the board names the assisted colour for the whole match |
| **Winner Mode** | The game controls the dice. The selected colour's dice are steered toward faces it needs (varied faces, never three sixes in a row) and it moves its own pieces like any seat. Other colours roll uniform dice **minus any face that would bring one of their pieces home** until the winner colour has at least as many pieces home, so they can never finish ahead of it | A red border and a red **WINNER MODE ON — Red will win** label name the winning colour for the whole match |

There is no hidden mode: whenever a colour is favoured or set to win, the label is on screen. The computer opponent **never touches the dice** — it only chooses which piece to move, and it rolls the same uniform dice as a human.

## How the AI works

`src/engine/ai.ts` scores every legal move (finish a piece, capture, leave the pocket, enter the home lane, land on a safe square, escape or avoid danger) and plays the best one. Randomness is injectable, so decisions are reproducible under a seed.

Measured over 1,000 seeded games per scenario (`npm run simulate`):

| Scenario | AI (seat 1) win rate |
|----------|---------------------|
| 2P, Hard vs random | 88.6 % |
| 3P, Hard vs 2 random | 82.1 % |
| 4P, Hard vs 3 random | 76.6 % |
| 4P ladder Hard / Normal / Easy / random | 53 / 32 / 10 / 5 % |
| 4P, all random, fair dice (control) | 24.5 / 25.8 / 25.1 / 24.6 % |

Hard is strong but not "perfect" — Ludo is a dice game, so without steered dice no AI can win every game. In **Winner Mode** the selected colour won every simulated game, including when it played random moves (2, 3 and 4 players). 11,000+ simulated games finished with **0 deadlocks and 0 invariant failures**.

## Getting started

```bash
npm install --legacy-peer-deps
npm run android        # or: npm run ios
```

Requirements: Node ≥ 18, JDK 17, Android SDK (Android) or Xcode (iOS).

## Quality gates

```bash
npm run verify         # tsc + eslint + jest
npm run simulate       # full-game simulation report (default 1000 games/scenario)
```

See [`docs/QA-TEST-PLAN.md`](docs/QA-TEST-PLAN.md) for the full test plan and the exact verified status.

## Project layout

```
src/engine/      Pure rules engine, AI, seeded simulator (shared by tests and app)
src/helpers/     Dice, rules predicates, board data (PlotData.ts is the board source of truth)
src/redux/       Game state, reducers, move thunk
src/components/  Board, dice, modals
src/screens/     Splash, Home, Player setup, Board
scripts/         Simulation CLI
docs/            QA plan, release guide
```

## Releasing

See [`docs/RELEASING.md`](docs/RELEASING.md). Release APKs must be signed with a real keystore supplied through CI secrets — never commit keystores or passwords.

## License

MIT — see [LICENSE](LICENSE).
