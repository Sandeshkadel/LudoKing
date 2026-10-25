# Ludo King v1.1.0

Classic Ludo for Android with a computer opponent and an open Assist handicap mode.

## What's new
- Play against the computer on any seat (Easy / Normal / Hard)
- Fair dice for everyone by default
- Optional **Assist** mode with a visible banner naming the assisted colour
- Optional **Winner Mode**: pick a colour in Settings and it is set to win; a red border and a "WINNER MODE ON" label naming the winner stay on the board so everyone can see it. In this mode the game controls the dice for every colour
- New Ludo King name, icon and logo
- Many stability, type-safety and test fixes (see CHANGELOG.md)

## Install (Android)
1. Download `ludo-king-v1.1.0.apk`
2. Allow "Install unknown apps" for your browser/file manager
3. Open the APK and tap Install (Android 5.0 / API 21 or newer)

Verify the download with `sha256sum ludo-king-v1.1.0.apk` against `SHA256SUMS.txt`.

## Verified
- TypeScript: 0 errors · ESLint: 0 errors · Jest: 101 tests passing (including full games driven through the real Redux store)
- 11,000 simulated games (2/3/4 players; fair, Assist and Winner Mode): 0 deadlocks, 0 invariant failures; Winner Mode colour won every game
- Production JS bundle builds

## Not yet verified
- Real-device play-through of full games (run the smoke checklist in `docs/QA-TEST-PLAN.md`)
- iOS build
