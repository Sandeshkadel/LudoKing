import React, {memo, useRef, useState} from 'react';
import {
  Keyboard,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import {useAppDispatch, useAppSelector} from '$hooks/useAppStore';
import {
  setCheatMode,
  setAiDifficulty,
  startWinnerSession,
  setWinnerColour,
  resumeWinnerMode,
} from '$redux/reducers/gameSlice';
import {
  selectCheatMode,
  selectAiDifficulty,
  selectWinnerSession,
  selectGameInProgress,
  selectPlayerCount,
} from '$redux/reducers/gameSelectors';
import {
  MAX_SESSION_GAMES,
  formatRemaining,
  isLocked,
  lockRemainingMs,
  validateSessionInput,
} from '../engine/session';
import {IMAGES} from '$assets/images';
import {RFValue} from 'react-native-responsive-fontsize';

// Human-readable color names shown in the picker
const COLOR_NAMES = ['Red', 'Green', 'Yellow', 'Blue'];

// Must match board pocket order: P1=Red  P2=Green  P3=Yellow  P4=Blue
const PLAYER_COLORS = ['#d5151d', '#00a049', '#ffde17', '#28aeff'];
const PILE_IMGS = [
  IMAGES.RedPile,
  IMAGES.GreenPile,
  IMAGES.YellowPile,
  IMAGES.BluePile,
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({visible, onClose}) => {
  const dispatch = useAppDispatch();
  const cheat = useAppSelector(selectCheatMode);
  const difficulty = useAppSelector(selectAiDifficulty);

  const session = useAppSelector(selectWinnerSession);
  const inProgress = useAppSelector(selectGameInProgress);
  const playerCount = useAppSelector(selectPlayerCount);
  const [panelOpen, setPanelOpen] = useState(false);
  const [gamesText, setGamesText] = useState('');
  const [lossesText, setLossesText] = useState('');
  const [formColour, setFormColour] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const lossesInputRef = useRef<TextInput | null>(null);

  const now = Date.now();
  const locked = isLocked(session, now);
  const selectedFormColour = Math.min(formColour, playerCount);

  const enableNormal = () => {
    setPanelOpen(false);
    dispatch(setCheatMode({enabled: false, favoredPlayer: 0}));
  };

  const digitsOnly = (text: string) => text.replace(/[^0-9]/g, '').slice(0, 2);

  const startSession = () => {
    Keyboard.dismiss();
    const games = gamesText === '' ? NaN : Number(gamesText);
    const losses = lossesText === '' ? NaN : Number(lossesText);
    const check = validateSessionInput(
      games,
      losses,
      playerCount,
      selectedFormColour,
    );
    if (!check.ok) {
      setError(check.error);
      return;
    }
    if (inProgress) {
      setError('Finish or restart the current game first.');
      return;
    }
    setError(null);
    dispatch(startWinnerSession({colour: selectedFormColour, games, losses}));
  };

  const isWinnerMode = cheat.enabled && cheat.guaranteed === true;
  const isAssistMode = cheat.enabled && !isWinnerMode;

  const enableAssist = () => {
    setPanelOpen(false);
    dispatch(
      setCheatMode({
        enabled: true,
        favoredPlayer: cheat.favoredPlayer || 1,
        guaranteed: false,
      }),
    );
  };

  const selectAssistColour = (p: number) => {
    dispatch(
      setCheatMode({
        enabled: true,
        favoredPlayer: p,
        guaranteed: false,
      }),
    );
  };

  const selectWinnerColour = (p: number) => {
    dispatch(setWinnerColour(p));
  };

  const tapWinnerCard = () => {
    setPanelOpen(true);
    setError(null);
    if (session.active && !locked && !isWinnerMode && !inProgress) {
      dispatch(resumeWinnerMode());
    }
  };

  const closeSettings = () => {
    Keyboard.dismiss();
    onClose();
  };

  const renderColours = (
    selectedColour: number,
    onSelect: (p: number) => void,
    disabled: boolean,
  ) => (
    <View style={[styles.colorRow, disabled && styles.disabledRow]}>
      {[1, 2, 3, 4]
        .filter(p => p <= playerCount)
        .map(p => {
          const selected = selectedColour === p;
          const bg = PLAYER_COLORS[p - 1];
          return (
            <TouchableOpacity
              key={p}
              disabled={disabled}
              onPress={() => onSelect(p)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${COLOR_NAMES[p - 1]} colour`}
              accessibilityState={{selected, disabled}}
              style={styles.colorItem}>
              <View
                style={[
                  styles.colorCircleOuter,
                  selected
                    ? styles.colorCircleOuterSelected
                    : styles.colorCircleOuterUnselected,
                ]}>
                <View style={[styles.colorCircle, {backgroundColor: bg}]}>
                  <Image
                    source={PILE_IMGS[p - 1]}
                    style={styles.pileImg}
                    resizeMode="contain"
                  />
                  {selected && (
                    <View style={styles.selectedOverlay}>
                      <Text style={styles.selectedTick}>✓</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text
                style={[
                  styles.colorLabel,
                  selected ? {color: bg} : styles.colorLabelMuted,
                  selected && styles.colorLabelSelected,
                ]}>
                {COLOR_NAMES[p - 1]}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropColor="black"
      backdropOpacity={0.88}
      onBackdropPress={closeSettings}
      onBackButtonPress={closeSettings}
      avoidKeyboard
      style={styles.modal}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.container}>
        {/* ── Title ──────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>⚙️ SETTINGS</Text>
          <View style={styles.divider} />

          {/* ── Mode label ─────────────────────────────── */}
          <Text style={styles.sectionLabel}>SELECT GAME MODE</Text>

          {/* ── Two mode cards ─────────────────────────── */}
          <View style={styles.modeRow}>
            {/* Normal Mode */}
            <TouchableOpacity
              onPress={enableNormal}
              activeOpacity={0.8}
              style={styles.modeCard}>
              <LinearGradient
                colors={
                  !cheat.enabled
                    ? ['#c8860a', '#e8a520', '#f5c842']
                    : ['#0d1520', '#162030']
                }
                style={styles.modeCardInner}>
                {!cheat.enabled && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
                <Text style={styles.modeIcon}>🎲</Text>
                <Text
                  style={[
                    styles.modeName,
                    !cheat.enabled ? styles.modeNameActive : null,
                  ]}>
                  Normal
                </Text>
                <Text
                  style={[
                    styles.modeSub,
                    !cheat.enabled ? styles.modeSubActive : null,
                  ]}>
                  Fair play (default)
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Assisted showcase mode: intentionally not fair play */}
            <TouchableOpacity
              onPress={enableAssist}
              activeOpacity={0.8}
              style={styles.modeCard}>
              <LinearGradient
                colors={
                  isAssistMode
                    ? ['#c8860a', '#e8a520', '#f5c842']
                    : ['#0d1520', '#162030']
                }
                style={styles.modeCardInner}>
                {isAssistMode && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
                <Text style={styles.modeIcon}>🏆</Text>
                <Text
                  style={[
                    styles.modeName,
                    isAssistMode ? styles.modeNameActive : null,
                  ]}>
                  Assist
                </Text>
                <Text
                  style={[
                    styles.modeSub,
                    isAssistMode ? styles.modeSubActive : null,
                  ]}>
                  Open handicap
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Winner Mode: selected colour is set to win, labelled on screen */}
            <TouchableOpacity
              onPress={tapWinnerCard}
              activeOpacity={0.8}
              style={styles.modeCard}>
              <LinearGradient
                colors={
                  isWinnerMode
                    ? ['#c8860a', '#e8a520', '#f5c842']
                    : ['#0d1520', '#162030']
                }
                style={styles.modeCardInner}>
                {isWinnerMode && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
                <Text style={styles.modeIcon}>👑</Text>
                <Text
                  style={[
                    styles.modeName,
                    isWinnerMode ? styles.modeNameActive : null,
                  ]}>
                  Winner
                </Text>
                <Text
                  style={[
                    styles.modeSub,
                    isWinnerMode ? styles.modeSubActive : null,
                  ]}>
                  {locked ? 'Locked' : 'Game series'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ── Computer difficulty ─────────────────────── */}
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>COMPUTER DIFFICULTY</Text>
          <View style={styles.colorRow}>
            {(['easy', 'normal', 'hard'] as const).map(level => (
              <TouchableOpacity
                key={level}
                onPress={() => dispatch(setAiDifficulty(level))}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Computer difficulty ${level}`}
                accessibilityState={{selected: difficulty === level}}
                style={styles.colorItem}>
                <Text
                  style={[
                    styles.colorLabel,
                    difficulty === level && styles.colorLabelSelected,
                    difficulty === level
                      ? styles.colorLabelActive
                      : styles.colorLabelMuted,
                  ]}>
                  {level.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Assist colour picker (open handicap) ───── */}
          {cheat.enabled && !isWinnerMode && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>FAVORED COLOR</Text>
              {renderColours(cheat.favoredPlayer, selectAssistColour, false)}
              <View style={styles.hintBox}>
                <Text style={styles.hintText}>
                  ⚠️ Assist is an open handicap, not fair play: the favored
                  color rolls weighted dice and its moves are chosen
                  automatically. The mode and color are configured in Settings
                  and are not displayed during play. All other colors roll fair
                  dice.
                </Text>
              </View>
            </>
          )}

          {/* ── Winner Mode game series ───────────────── */}
          {(panelOpen || isWinnerMode) && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>WINNER MODE · GAME SERIES</Text>

              {locked ? (
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>
                    🔒 Winner Mode is locked for{' '}
                    {formatRemaining(lockRemainingMs(session, now))}. Your last
                    series is finished, so games are normal until then.
                  </Text>
                </View>
              ) : !session.active ? (
                <>
                  <View style={styles.inputRow}>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Games to play today</Text>
                      <TextInput
                        style={styles.input}
                        value={gamesText}
                        onChangeText={t => setGamesText(digitsOnly(t))}
                        keyboardType="number-pad"
                        returnKeyType="next"
                        onSubmitEditing={() => lossesInputRef.current?.focus()}
                        onFocus={() =>
                          scrollRef.current?.scrollToEnd({animated: true})
                        }
                        placeholder="e.g. 7"
                        placeholderTextColor="#55657a"
                        maxLength={2}
                        accessibilityLabel="Number of games to play today"
                      />
                    </View>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Games to lose</Text>
                      <TextInput
                        ref={lossesInputRef}
                        style={styles.input}
                        value={lossesText}
                        onChangeText={t => setLossesText(digitsOnly(t))}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        onFocus={() =>
                          scrollRef.current?.scrollToEnd({animated: true})
                        }
                        placeholder="e.g. 3"
                        placeholderTextColor="#55657a"
                        maxLength={2}
                        accessibilityLabel="Number of games to lose"
                      />
                    </View>
                  </View>
                  <Text style={styles.sectionLabel}>WINNER COLOR</Text>
                  {renderColours(selectedFormColour, setFormColour, false)}
                  {error && <Text style={styles.errorText}>{error}</Text>}
                  <TouchableOpacity onPress={startSession} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#c8860a', '#e8a520', '#f5c842']}
                      style={styles.startBtn}>
                      <Text style={styles.startBtnTxt}>START SERIES</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <View style={styles.hintBox}>
                    <Text style={styles.hintText}>
                      Both numbers are required (1–{MAX_SESSION_GAMES} games;
                      losses cannot exceed games). The losing games are placed
                      at random among your games. After the last game Winner
                      Mode switches off and locks for 10 hours.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.statusText}>
                    Game{' '}
                    {Math.min(session.gamesPlayed + 1, session.gamesPlanned)} of{' '}
                    {session.gamesPlanned} · {session.gamesPlayed} finished
                  </Text>
                  <Text style={styles.sectionLabel}>
                    WINNER COLOR {inProgress ? '(CHANGE BETWEEN GAMES)' : ''}
                  </Text>
                  {renderColours(
                    session.colour,
                    selectWinnerColour,
                    inProgress,
                  )}
                  {!cheat.enabled && (
                    <Text style={styles.errorText}>
                      Paused: games are normal and not counted. Tap Winner to
                      resume.
                    </Text>
                  )}
                  <View style={styles.hintBox}>
                    <Text style={styles.hintText}>
                      👑 Winner Mode and its selected color are configured in
                      Settings. No mode banner or border is shown on the board
                      during play. The color can be changed only before a game
                      starts.
                    </Text>
                  </View>
                </>
              )}
            </>
          )}

          <View style={styles.divider} />
        </ScrollView>

        {/* ── Done button ─────────────────────────────── */}
        <TouchableOpacity onPress={closeSettings} activeOpacity={0.8}>
          <LinearGradient
            colors={['#2a6fd4', '#1a57b0', '#0f3d8a']}
            style={styles.doneBtn}>
            <Text style={styles.doneBtnTxt}>DONE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Modal>
  );
};

export default memo(SettingsModal);

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    width: '92%',
    alignSelf: 'center',
  },
  container: {
    borderRadius: 20,
    padding: 22,
    paddingVertical: 28,
    borderWidth: 2,
    borderColor: 'gold',
    alignItems: 'center',
  },

  // Title
  title: {
    color: '#FFD700',
    fontSize: RFValue(16),
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,215,0,0.3)',
    marginVertical: 14,
  },
  sectionLabel: {
    color: '#FFD700',
    fontSize: RFValue(11),
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.9,
  },

  // Mode cards
  modeRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    justifyContent: 'center',
  },
  modeCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  modeCardInner: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.2)',
    minHeight: 110,
    justifyContent: 'center',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#e07308',
    fontSize: 12,
    fontWeight: '900',
  },
  modeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  modeName: {
    color: '#6688aa',
    fontSize: RFValue(13),
    fontWeight: '800',
  },
  modeNameActive: {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  modeSub: {
    color: '#445566',
    fontSize: RFValue(10),
    marginTop: 3,
  },
  modeSubActive: {
    color: 'rgba(255,255,255,0.8)',
  },

  // Color picker
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 4,
  },
  colorItem: {
    alignItems: 'center',
  },
  colorCircleOuter: {
    borderRadius: 34,
    borderWidth: 3,
    padding: 3,
    marginBottom: 6,
  },
  colorCircleOuterSelected: {
    borderColor: '#FFD700',
  },
  colorCircleOuterUnselected: {
    borderColor: 'transparent',
  },
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTick: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  pileImg: {
    width: 36,
    height: 36,
  },
  colorLabel: {
    fontSize: RFValue(10),
    textAlign: 'center',
    fontWeight: '800',
  },
  colorLabelActive: {
    color: '#FFD700',
  },
  colorLabelMuted: {
    color: '#6688aa',
  },
  colorLabelSelected: {
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },

  scroll: {width: '100%', maxHeight: '88%'},
  scrollContent: {alignItems: 'center', paddingBottom: 4},
  disabledRow: {opacity: 0.4},
  inputRow: {flexDirection: 'row', gap: 12, width: '100%', marginBottom: 10},
  inputCol: {flex: 1},
  inputLabel: {
    color: '#b8c4d8',
    fontSize: RFValue(10),
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.45)',
    borderRadius: 10,
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 8,
    minHeight: 48,
  },
  errorText: {
    color: '#ff8a80',
    fontSize: RFValue(10),
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '800',
    marginBottom: 10,
  },
  startBtn: {
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 36,
    marginTop: 6,
    marginBottom: 6,
  },
  startBtnTxt: {
    color: '#fff',
    fontSize: RFValue(13),
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  // Hint
  hintBox: {
    backgroundColor: 'rgba(255,100,0,0.12)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,140,0,0.3)',
    marginTop: 6,
  },
  hintText: {
    color: '#ffaa44',
    fontSize: RFValue(10),
    fontWeight: '600',
  },

  // Done button
  doneBtn: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  doneBtnTxt: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});
