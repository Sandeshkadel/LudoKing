# Releasing Ludo King

## One-time: create a release keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore ludo-king-release.keystore \
  -alias ludo-king -keyalg RSA -keysize 2048 -validity 10000
```

Keep the file and passwords private (password manager). **Never commit them.**

Add these GitHub repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
|--------|-------|
| `LUDO_KEYSTORE_BASE64` | `base64 -w0 ludo-king-release.keystore` |
| `LUDO_KEYSTORE_PASSWORD` | keystore password |
| `LUDO_KEY_ALIAS` | `ludo-king` |
| `LUDO_KEY_PASSWORD` | key password |

Without these secrets the workflow still builds, but the APK is signed with the **debug** key and is published only as a *pre-release for testing*.

## Cutting a release

1. Bump `version` in `package.json` and `versionCode` / `versionName` in `android/app/build.gradle`.
2. Update `CHANGELOG.md`.
3. Run locally: `npm run verify` and `npm run simulate`.
4. Tag and push:
   ```bash
   git tag v1.1.0
   git push origin main --tags
   ```
5. The **Build Ludo King APK** workflow runs tests, builds the APK, computes its SHA-256 and publishes a GitHub Release with the APK and checksum.

## Before you call a release "ready"

Follow the acceptance criteria in `docs/QA-TEST-PLAN.md`, including the manual device smoke test (cold launch, 2/3/4-player games, a complete game, background/resume, restart). A green CI run does not replace testing on a physical phone.
