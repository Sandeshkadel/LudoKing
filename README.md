<div align="center">

<img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-brightgreen?style=for-the-badge&logo=android" />
<img src="https://img.shields.io/badge/React%20Native-0.73.9-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Redux%20Toolkit-2.2-764ABC?style=for-the-badge&logo=redux" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

# 🎲 Ludo King

### *The Classic Board Game — Reimagined for Mobile*

> A full-featured, polished Ludo game built with React Native and TypeScript, packed with smooth animations, sound effects, an explicitly disclosed optional Assist mode, and a Ludo King-inspired UI.

<br/>

[📥 Download APK](#-download--installation) · [✨ Features](#-features) · [🚀 Getting Started](#-getting-started) · [🧪 QA & Test Plan](docs/QA-TEST-PLAN.md) · [🧩 Tech Stack](#-tech-stack) · [📸 Screenshots](#-screenshots)

</div>

---

## 📥 Download & Installation

### Android APK (Direct Install)

> **Release status:** No verified APK is currently attached to this branch. Use the Actions workflow to build and verify an APK before publishing a release.

1. Go to the [**Releases**](https://github.com/Sandeshkadel/LudoKing/releases) section of this repository
2. Download the APK attached to a published release only after a successful build has been verified
3. On your Android phone, go to **Settings → Security → Enable "Install from unknown sources"**
4. Open the downloaded APK and tap **Install**
5. Launch **Ludo King** 🎲

> _Requires Android 6.0 (API 23) or higher_

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎮 Core Gameplay
- ✅ Full Ludo board — authentic rules
- ✅ 2, 3, or 4 player support
- ✅ Dice roll with real animations
- ✅ Capture enemy pieces mechanic
- ✅ Safe spots & star squares respected
- ✅ Extra turn on rolling a 6
- ✅ Victory home-stretch lane per player
- ✅ Win detection when all 4 pieces reach home

</td>
<td width="50%">

### 🏆 Ludo King UI
- ✅ Ludo King-style player setup screen
- ✅ 2P / 3P / 4P selector
- ✅ Custom player name input per colour
- ✅ Animated dice roll (Lottie)
- ✅ Fireworks on piece reaching home
- ✅ Trophy & confetti on game win
- ✅ Winner celebration modal with name & colour badge
- ✅ Restart Game keeps your settings

</td>
</tr>
<tr>
<td width="50%">

### 🎵 Sounds & Animations
- ✅ Dice roll sound effect
- ✅ Piece move sound on every step
- ✅ Capture / collision sound
- ✅ Safe spot chime
- ✅ Home victory cheer
- ✅ Background music on home screen
- ✅ Lottie firework & trophy animations

</td>
<td width="50%">

### 🧩 Assist / Practice Mode
- ✅ Optional mode disclosed in Settings
- ✅ Select a favored color for weighted dice
- ✅ Favored color automatically selects its best legal move
- ✅ Other colors keep fair dice and manual move selection
- ⚠️ Unbalanced practice/showcase feature; not intended for competitive play

</td>
</tr>
</table>

---

## 🎮 How to Play

```
1.  Launch the app → tap NEW GAME
2.  Choose 2 / 3 / 4 players and enter player names
3.  Tap PLAY to start
4.  Tap the dice to roll — your pieces light up when movable
5.  Tap a highlighted piece to move it
6.  Roll a 6 to bring a piece out of the pocket
7.  Land on an enemy piece to send them back to their pocket!
8.  Safe squares (stars ★) protect pieces from capture
9.  First player to bring all 4 pieces home wins 🏆
```

### 🧩 Using Assist Mode

```
During a game → tap MENU (⏸) → tap ⚙️ Settings
→ Enable Assist → choose the favored color → tap DONE
```

Assist mode is intentionally unbalanced: the favored color receives weighted dice and automatic best-move selection. Other colors retain fair dice and manual moves. Use it for solo practice or a showcase, not competitive play.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.73.9 |
| **Language** | TypeScript 5.0 |
| **State Management** | Redux Toolkit 2.2 + Async Thunks |
| **Navigation** | React Navigation 6 (Stack) |
| **Animations** | Lottie React Native 6.7 |
| **UI / Styling** | StyleSheet + Linear Gradient |
| **Modals** | react-native-modal 13 |
| **Sounds** | react-native-sound |
| **Fonts** | react-native-responsive-fontsize |
| **Persistent Storage** | redux-persist + AsyncStorage |

---

## 📁 Project Structure

```
Ludo King/
├── src/
│   ├── assets/          # Lottie animations, images, sounds, fonts
│   ├── components/      # Reusable UI: Cell, Dice, Pile, Modals…
│   ├── constants/       # Colours, dimensions
│   ├── helpers/         # Icon lookup, navigation utils, board data, audio
│   ├── hooks/           # Typed Redux hooks
│   ├── navigation/      # RootNavigator (Stack)
│   ├── redux/
│   │   ├── reducers/    # gameSlice, gameActions (thunks), gameSelectors
│   │   ├── initialState.ts
│   │   ├── store.ts
│   │   └── storage.ts   # redux-persist config
│   └── screens/
│       ├── SplashScreen/
│       ├── HomeScreen/
│       ├── PlayerSetupScreen/   # Ludo King-style name/colour picker
│       └── LudoBoardScreen/     # Main game board
├── android/             # Android native project
├── ios/                 # iOS native project
├── App.tsx              # Root component
└── index.js             # Entry point
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| React Native CLI | Latest |
| Android Studio | Hedgehog+ (for Android) |
| JDK | 17 or 21 |
| Xcode | 14+ (for iOS — macOS only) |

### 1 — Clone the repo

```bash
git clone https://github.com/Sandeshkadel/LudoKing.git
cd LudoKing
```

### 2 — Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3 — Android

```bash
# Start Metro
npx react-native start

# In a new terminal, build & run on device/emulator
npx react-native run-android
```

### 4 — iOS (macOS only)

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 🔨 Building a Release APK

A release should be published only after the Android build and gameplay tests pass. The GitHub Actions workflow produces an APK artifact when its runner starts and completes successfully. If Actions reports an account/billing lock, the job has not run and no APK artifact has been produced.

```bash
cd android
# Windows
.\gradlew assembleRelease

# macOS / Linux
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🗺️ Game Board Logic

```
Board positions  : 1 – 52  (shared path)
Victory lane     : 111–116 (Red) · 221–226 (Green) · 331–336 (Yellow) · 441–446 (Blue)
Home (won)       : travelCount = 57
Starting squares : 1 (Red) · 14 (Green) · 27 (Yellow) · 40 (Blue)
Safe squares     : [1, 9, 14, 22, 27, 35, 40, 48]  + star squares
Turning points   : [52, 13, 26, 39]
```

Each piece tracks two values:
- **`pos`** — current board cell (0 = in pocket)
- **`travelCount`** — steps taken from start (0–57; 57 = home)

---

## 🧩 Assist Mode — How It Works

Assist mode is an explicitly disclosed, unbalanced practice feature. The favored color receives weighted dice and automatic best-legal-move selection; all other colors retain fair dice and manual move selection. It does not guarantee a win. Use it only for solo practice or a showcase, not competitive play.

---

## 🧪 QA, Tests & Release Readiness

See the [full QA and test plan](docs/QA-TEST-PLAN.md) for automated dice tests, turn-order and movement scenarios, capture/home rules, full-game simulation requirements, device smoke tests, accessibility checks, and release acceptance criteria. Run the current Jest suite with `npm test -- --runInBand`.

The existing Assist mode is a disclosed favored-color practice feature, not a general-purpose AI opponent. Full AI opponents and complete end-to-end game simulation remain separate work items and must pass the documented acceptance criteria before being advertised as complete.

---

## 📸 Screenshots

> _Add screenshots here by replacing these placeholders_

| Home Screen | Player Setup | Game Board | Winner |
|:-----------:|:------------:|:----------:|:------:|
| ![Home](screenshots/home.png) | ![Setup](screenshots/setup.png) | ![Board](screenshots/board.png) | ![Winner](screenshots/winner.png) |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature
git commit -m "feat: add awesome feature"
git push origin feature/your-feature
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using React Native**

⭐ If you like this project, please give it a star!

[![GitHub stars](https://img.shields.io/github/stars/Sandeshkadel/LudoKing?style=social)](https://github.com/Sandeshkadel/LudoKing/stargazers)

</div>
