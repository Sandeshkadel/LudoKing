<div align="center">

<img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-brightgreen?style=for-the-badge&logo=android" />
<img src="https://img.shields.io/badge/React%20Native-0.73.9-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Redux%20Toolkit-2.2-764ABC?style=for-the-badge&logo=redux" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

# 🎲 Ludo King

### *The Classic Board Game — Reimagined for Mobile*

> A full-featured, polished Ludo game built with React Native and TypeScript, packed with smooth animations, sound effects, a secret Demo Mode, and a stunning Ludo King-inspired UI.

<br/>

[📥 Download APK](#-download--installation) · [✨ Features](#-features) · [🚀 Getting Started](#-getting-started) · [🧩 Tech Stack](#-tech-stack) · [📸 Screenshots](#-screenshots)

</div>

---

## 📥 Download & Installation

### Android APK (Direct Install)

> **Download the latest release APK and install directly on your Android phone.**

1. Go to the [**Releases**](https://github.com/Sandeshkadel/LudoKing/releases) section of this repository
2. Download `ludo-king-v1.0.apk`
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

### 🤫 Secret Demo Mode
- ✅ Hidden in Settings (in-game pause menu)
- ✅ Pick any colour to secretly guarantee their win
- ✅ Weighted dice — selected colour gets lucky rolls, opponents get unlucky rolls
- ✅ Looks 100% natural — no obvious AI tells
- ✅ Auto-move engine picks the best piece every turn
- ✅ Opponents auto-move their worst piece
- ✅ Setting persists across Restart Game

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

### 🤫 Activating Demo Mode (Secret)

```
During a game → tap MENU (⏸) → tap ⚙️ Settings
→ Switch to "Demo" mode → pick a colour
→ tap DONE — that colour now wins every time!
```

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

## 🤫 Demo Mode — How It Works

The Demo mode is designed to look **completely natural** to any observer:

| What you see | What's really happening |
|---|---|
| Favoured player rolls high numbers | Weighted RNG: 28% chance of 6, vs fair 16.7% |
| Opponents roll low numbers | Weighted RNG: 32% chance of 1, 5% chance of 6 |
| Favoured player picks pieces quickly | Random 700–1,500ms delay simulates human thinking |
| Opponents seem to make bad choices | Auto-picks least-progressed piece after 500–1,400ms |
| Game feels natural and competitive | Opponents can still roll 4–6 occasionally |

**Priority engine for the favoured player:**
1. Move a piece that reaches home exactly this turn
2. Move the furthest piece on the board
3. Bring a pocket piece out (on a 6)

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
