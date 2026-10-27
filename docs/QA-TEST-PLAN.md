# Ludo King — QA, Test Plan & Release Readiness

This document defines the quality gates for the Android/iOS Ludo app. A feature is not considered complete merely because it renders: rules, state transitions, interaction, persistence, accessibility, and release packaging must all be checked.

## Current verified status
Verified in a local environment (not CI) on 2026-10-25:

- `npx tsc --noEmit`: 0 errors. `npm run lint`: 0 errors after the release-quality cleanup, with no remaining real warnings.
- `npm test -- --runInBand`: 101 tests passing across 9 suites (dice/rules, reducer, pure engine, AI, Winner Mode dice, simulator, full games through the real store, App render smoke).
- `npm run simulate`: 11 scenarios x 1,000 seeded games (2/3/4 players; fair, Assist and Winner Mode): 0 deadlocks, 0 invariant failures; the Winner Mode colour won every game.
- Production Android JS bundle builds with `react-native bundle`.

Not yet verified: Gradle `assembleRelease`, installation on an emulator/physical device, end-to-end full games on a device, iOS build, and a published APK. GitHub Actions may be blocked by account billing; a blocked workflow is not a code failure and no APK exists until a run succeeds.

Dice policy: Normal mode is uniform for every player. Assist and Winner Mode are configured in Settings and do not display a mode banner or border during gameplay. Make sure all players know which mode is selected before play. In Winner Mode the game controls all dice: the selected colour's dice are steered, and other colours cannot roll a face that brings a piece home until the winner colour has at least as many pieces home. The computer opponent only chooses moves and never alters dice.

## Commands

Run these from the repository root:

```bash
npm install --legacy-peer-deps
npm test -- --runInBand
npm run lint
npx tsc --noEmit
```

Build Android release APK:

```bash
cd android
./gradlew assembleRelease --no-daemon
```

Expected output: `android/app/build/outputs/apk/release/app-release.apk`.

## Automated test layers

### 1. Pure rules and dice unit tests

- Uniform dice can return every face from 1 through 6; no value 0 or 7 is possible.
- Assist weighting uses the documented weights `[8, 10, 14, 18, 22, 28]`, sums to 100, and maps random samples at boundaries to the correct face.
- Invalid random values and invalid weights fail clearly instead of silently returning an invalid result.
- Player turn rotation wraps correctly for 2, 3, and 4 players.
- A pocket piece leaves only on a six.
- A board piece cannot overshoot home; exact home arrival is accepted.
- A piece already home cannot move again.

### 2. Gameplay state and reducer tests — required expansion

Add reducer/action tests for:
- reset preserves player names, player count, and Assist configuration while resetting piece positions, winner, dice and turn state.
- piece updates synchronize player arrays and `currentPosition`, and captured pieces are removed from plotted positions.
- turn transitions after ordinary moves, sixes, captures, home arrival, no legal move, and a win.
- illegal selections, stale piece positions, unknown IDs, non-six pocket exits, and overshoot attempts do not corrupt state.
- winner is announced only when all four pieces for that player have `travelCount === 57`.
- fireworks and touch/dice locks are cleared on all terminal/error paths.

### 3. Dice and move-selection integration tests — required expansion

- Tap is ignored while dice animation/input is locked; repeated taps cannot dispatch multiple rolls.
- Normal mode uses uniform dice for every active player.
- Assist mode weights dice only for the configured favored player; all other players remain uniform.
- Each dice face 1–6 selects the expected legal-move behavior.
- Six with pocket pieces enables pocket selection; six with board pieces enables board selection; six with no legal move grants the extra roll according to the rules.
- Non-six with no legal move passes to the next active player.
- Assist mode chooses a legal move, prioritizes exact home when available, and safely handles no legal move.
- Switching player count and Assist settings cannot leave stale turn or selection state.

### 4. Rule regression scenarios — required expansion

Use deterministic dice injection in tests rather than waiting for random rolls.

| Scenario | Expected result |
|---|---|
| Roll 1, 2, 3, 4, 5, or 6 | Face is rendered correctly and is within 1–6 |
| Pocket piece rolls 1–5 | Piece stays in pocket |
| Pocket piece rolls 6 | Piece enters its own start square |
| Move across shared-path 52 → 1 | Position wraps without losing travel count |
| Player reaches its own turning point | Piece enters that player's victory lane |
| Move would exceed travel count 57 | Move rejected; no state mutation |
| Land on an enemy on an unsafe square | Exactly the eligible enemy piece returns to pocket |
| Land on a safe/star square | Enemy is not captured |
| Capture or arrive home | Extra turn is granted where specified by the game's rule set |
| Roll six with no legal piece | Extra turn is retained |
| Last piece reaches home exactly | Winner announced once |
| All pieces are home | Further movement is blocked |
| Restart after a completed game | Board resets and configured player names/count persist |

Review the actual board mapping before fixing expectations for safe squares, star squares, and victory lanes; the source of truth is `src/helpers/PlotData.ts`.

### 5. Full-game simulation — required expansion

Build a deterministic simulator around the same pure rules used by the app. It should run repeatable seeds for 2, 3, and 4 players and report:
- completed games, winners, turns per game, captures, sixes, home arrivals, and deadlocks;
- piece invariant failures (position/travel count disagreement, duplicate IDs, illegal transitions);
- game termination and maximum-turn guard failures;
- the same scenarios with Assist mode disabled and enabled.

A simulator is not a substitute for UI/device testing. It must not duplicate a second, divergent version of the rules; share the production rule functions wherever possible.

### 6. UI and device smoke tests — required expansion

For Android emulator and at least one real Android device:
- cold launch, splash, home screen, player setup, 2/3/4 player games;
- player-name entry, long names, keyboard behavior, orientation/responsive layout;
- dice animation, legal piece highlighting, touch blocking, sound effects and mute/system-volume behavior;
- safe-square/capture feedback, fireworks, winner modal, restart, settings, Assist disclosure;
- background/resume, app process restart, persistence restoration, back button;
- no crashes, clipped controls, stuck animations, inaccessible touch targets, or state loss.

For iOS, run the equivalent smoke suite on a supported simulator/device after the Android baseline is stable.

### 7. Accessibility and UX

- Every interactive control has a meaningful accessible label and role.
- Game status and winner are communicated without relying on color alone.
- Text remains legible at supported font scaling; touch targets are usable.
- Animation and sound do not block input indefinitely.
- Player colors remain distinguishable and player names are announced correctly.

### 8. Release/security checks

- Release APK builds from a clean checkout and installs successfully.
- Bundle contains the production JS bundle and required assets.
- Confirm application ID, version code/name, minimum SDK, and signing configuration.
- The repository currently uses the Android debug signing config for release builds. Replace it with a securely stored release keystore before public/production distribution; never commit keystore files or passwords.
- Publish only after all required checks pass. Attach the exact APK produced by that successful run, record its SHA-256 checksum, and provide install/release notes.
- If GitHub Actions is blocked by account/billing status, the workflow has not run; do not describe that as a code build failure and do not claim an APK exists.

## Acceptance criteria

A release is ready only when all of the following are true:

1. Unit, reducer, integration, and regression suites pass.
2. No TypeScript or lint errors remain, or each approved exception is documented.
3. Deterministic 2/3/4-player simulations finish without invariant violations or deadlocks.
4. Manual smoke testing passes on an Android emulator and a physical device.
5. Release APK builds, installs, launches, and completes a full game.
6. Release artifact and checksum are attached to a published release with accurate notes.
7. README and release notes describe only features that have actually been verified.

## AI opponent requirement

“AI plays the whole game perfectly” is not an objective testable guarantee for a stochastic, multi-player game. Define an AI acceptance target instead: valid legal moves every turn, no illegal state transitions, correct handling of sixes/captures/safe squares/home overshoot, reproducible decisions under seeded randomness, and measured win rate over a documented simulation corpus. The computer opponent (`src/engine/ai.ts`) meets this target: it returns only legal moves (covered by tests and by 8,000 simulated games with no invariant failures), is reproducible under a seed, and its measured win rates are documented in the README (Hard beats random opponents 77-89%). Assist mode remains a separate, disclosed handicap and is not the AI opponent.
