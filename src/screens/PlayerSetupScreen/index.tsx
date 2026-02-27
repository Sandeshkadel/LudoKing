import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch } from '$hooks/useAppStore';
import { resetGame, setPlayerNames, setPlayerCount } from '$redux/reducers/gameSlice';
import { navigate } from '$helpers/navigationUtils';
import { playSound } from '$helpers/SoundUtils';
import { IMAGES } from '$assets/images';
import { styles } from './styles';

// Ludo King colour palette per player slot — must match board pocket order
// Board: P1=Red  P2=Green  P3=Yellow  P4=Blue
const PLAYER_COLORS = ['#d5151d', '#00a049', '#ffde17', '#28aeff'];
const PILE_IMAGES = [IMAGES.RedPile, IMAGES.GreenPile, IMAGES.YellowPile, IMAGES.BluePile];
const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];

// Dice images array for rolling animation
const DICE_IMAGES = [
  IMAGES.Dice1, IMAGES.Dice2, IMAGES.Dice3,
  IMAGES.Dice4, IMAGES.Dice5, IMAGES.Dice6,
];

const PlayerSetupScreen = () => {
  const dispatch = useAppDispatch();
  const [names, setNames] = useState<string[]>([...DEFAULT_NAMES]);
  const [count, setCount] = useState<number>(4);
  const [diceValues, setDiceValues] = useState<number[]>([0, 1, 2, 3]);

  const handleNameChange = useCallback((idx: number, val: string) => {
    setNames(prev => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  }, []);

  const handleDiceRoll = useCallback((idx: number) => {
    playSound('dice_roll');
    setDiceValues(prev => {
      const updated = [...prev];
      updated[idx] = Math.floor(Math.random() * 6);
      return updated;
    });
  }, []);

  const handleCountChange = useCallback((n: number) => {
    playSound('ui');
    setCount(n);
  }, []);

  const handlePlay = useCallback(() => {
    const trimmedNames = names.map((n, i) =>
      n.trim().length > 0 ? n.trim() : `Player ${i + 1}`
    );
    dispatch(resetGame());
    dispatch(setPlayerNames(trimmedNames));
    dispatch(setPlayerCount(count));
    playSound('game_start');
    navigate('LudoBoardScreen', {});
  }, [names, count, dispatch]);

  return (
    <ImageBackground
      source={IMAGES.Background}
      resizeMode="cover"
      style={styles.bg}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe}>
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>CHOOSE COLOR AND NAME</Text>
          <View style={styles.countBadge}>
            <Image source={IMAGES.Dice1} style={styles.badgeDice} resizeMode="contain" />
            <Text style={styles.countText}>0/{count}</Text>
          </View>
        </View>

        {/* ── Divider ─────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Player rows ─────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={styles.playerRow}>

              {/* Coloured pile / pin icon */}
              <View style={[styles.pinWrapper, { borderColor: PLAYER_COLORS[i] }]}>
                <Image
                  source={PILE_IMAGES[i]}
                  style={styles.pinImg}
                  resizeMode="contain"
                />
              </View>

              {/* Name input */}
              <TextInput
                style={[styles.nameInput, { borderColor: PLAYER_COLORS[i] }]}
                value={names[i]}
                onChangeText={v => handleNameChange(i, v)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor="#8899aa"
                maxLength={14}
                selectionColor={PLAYER_COLORS[i]}
              />

              {/* Dice icon – tap to re-roll cosmetic dice */}
              <TouchableOpacity
                onPress={() => handleDiceRoll(i)}
                activeOpacity={0.7}
                style={styles.diceBtn}
              >
                <Image
                  source={DICE_IMAGES[diceValues[i]]}
                  style={styles.diceImg}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Robot / CPU badge */}
              <View style={styles.robotBadge}>
                <LinearGradient
                  colors={['#1e3a58', '#0a2236']}
                  style={styles.robotGrad}
                >
                  <Text style={styles.robotEmoji}>🤖</Text>
                </LinearGradient>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Player count selector ────────────────────── */}
        <View style={styles.countRow}>
          {[2, 3, 4].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => handleCountChange(n)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  count === n
                    ? ['#f5a623', '#e07b08']
                    : ['#1a3a58', '#0d2236']
                }
                style={[
                  styles.countBtn,
                  count === n && styles.countBtnSelected,
                ]}
              >
                <Text style={[styles.countBtnTxt, count === n && styles.countBtnTxtSelected]}>
                  {n}P
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Divider ─────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Play button ─────────────────────────────── */}
        <TouchableOpacity
          onPress={handlePlay}
          activeOpacity={0.85}
          style={styles.playBtnOuter}
        >
          <LinearGradient
            colors={['#f5b942', '#e07308']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.playBtnBorder}
          >
            <LinearGradient
              colors={['#2a6fd4', '#1a57b0', '#0f3d8a']}
              style={styles.playBtn}
            >
              <Text style={styles.playBtnTxt}>Play</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default PlayerSetupScreen;
