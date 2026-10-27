# Ludo King v1.1.1

Classic Ludo for Android with a computer opponent and an open Assist handicap mode.

## What's new
- Play against the computer on any seat (Easy / Normal / Hard)
- Fair dice for everyone by default
- Optional **Assist** mode configured in Settings; no mode indicator is shown on the board during play
- Optional **Winner Mode**: select a colour and series in Settings; no mode banner or red border is shown on the board during play. In this mode the game controls the dice for every colour
- Winner and Assist color selection remains valid in 2-, 3-, and 4-player games; switching modes resumes the existing Winner series correctly
- Winner Mode series setup supports keyboard-accessible game and loss counts
- Corrected Green home-lane board coverage and centre-triangle piece visibility
- New Ludo King name, icon and logo
- Many stability, type-safety and test fixes (see CHANGELOG.md)

## Install (Android)
1. Download `ludo-king-v1.1.1.apk`
2. Allow "Install unknown apps" for your browser/file manager
3. Open the APK and tap Install (Android 5.0 / API 21 or newer)

Verify the download with `sha256sum ludo-king-v1.1.1.apk` against `SHA256SUMS.txt`.

## Verified
- TypeScript and ESLint pass; Jest: 134 tests passing (including full games driven through the real Redux store)
- Winner Mode, Assist, color switching, and series flows have reducer/UI regression coverage
- Android emulator build and launch verified

## Not yet verified
- Published APK is debug-signed when release keystore secrets are unavailable; use for testing only, not public distribution
- Real-device play-through of full games (run the smoke checklist in `docs/QA-TEST-PLAN.md`)
- iOS build
