import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '$hooks/useAppStore';
import { setCheatMode } from '$redux/reducers/gameSlice';
import { selectCheatMode } from '$redux/reducers/gameSelectors';
import { IMAGES } from '$assets/images';
import { RFValue } from 'react-native-responsive-fontsize';

// Human-readable color names shown in the picker
const COLOR_NAMES = ['Red', 'Green', 'Yellow', 'Blue'];

// Must match board pocket order: P1=Red  P2=Green  P3=Yellow  P4=Blue
const PLAYER_COLORS = ['#d5151d', '#00a049', '#ffde17', '#28aeff'];
const PILE_IMGS = [IMAGES.RedPile, IMAGES.GreenPile, IMAGES.YellowPile, IMAGES.BluePile];

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const cheat = useAppSelector(selectCheatMode);

  const enableNormal = () => {
    dispatch(setCheatMode({ enabled: false, favoredPlayer: 0 }));
  };

  const enableDemo = () => {
    dispatch(setCheatMode({ enabled: true, favoredPlayer: cheat.favoredPlayer || 1 }));
  };

  const selectPlayer = (p: number) => {
    dispatch(setCheatMode({ enabled: true, favoredPlayer: p }));
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropColor="black"
      backdropOpacity={0.88}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>

        {/* ── Title ──────────────────────────────────── */}
        <Text style={styles.title}>⚙️  SETTINGS</Text>
        <View style={styles.divider} />

        {/* ── Mode label ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>SELECT GAME MODE</Text>

        {/* ── Two mode cards ─────────────────────────── */}
        <View style={styles.modeRow}>

          {/* Normal Mode */}
          <TouchableOpacity onPress={enableNormal} activeOpacity={0.8} style={styles.modeCard}>
            <LinearGradient
              colors={!cheat.enabled ? ['#c8860a', '#e8a520', '#f5c842'] : ['#0d1520', '#162030']}
              style={styles.modeCardInner}
            >
              {!cheat.enabled && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
              <Text style={styles.modeIcon}>🎲</Text>
              <Text style={[styles.modeName, !cheat.enabled && styles.modeNameActive]}>
                Normal
              </Text>
              <Text style={[styles.modeSub, !cheat.enabled && styles.modeSubActive]}>
                Fair play
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Demo / Rigged Mode */}
          <TouchableOpacity onPress={enableDemo} activeOpacity={0.8} style={styles.modeCard}>
            <LinearGradient
              colors={cheat.enabled ? ['#c8860a', '#e8a520', '#f5c842'] : ['#0d1520', '#162030']}
              style={styles.modeCardInner}
            >
              {cheat.enabled && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
              <Text style={styles.modeIcon}>🏆</Text>
              <Text style={[styles.modeName, cheat.enabled && styles.modeNameActive]}>
                Demo
              </Text>
              <Text style={[styles.modeSub, cheat.enabled && styles.modeSubActive]}>
                Pick winner
              </Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>

        {/* ── Winner color picker (Demo mode only) ────── */}
        {cheat.enabled && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>SELECT WINNER COLOR</Text>

            <View style={styles.colorRow}>
              {[1, 2, 3, 4].map((p) => {
                const selected = cheat.favoredPlayer === p;
                const bg = PLAYER_COLORS[p - 1];
                return (
                  <TouchableOpacity key={p} onPress={() => selectPlayer(p)} activeOpacity={0.75} style={styles.colorItem}>
                    {/* Outer ring glows gold when selected */}
                    <View style={[
                      styles.colorCircleOuter,
                      { borderColor: selected ? '#FFD700' : 'transparent' },
                    ]}>
                      {/* Solid colour fill */}
                      <View style={[styles.colorCircle, { backgroundColor: bg }]}>
                        <Image source={PILE_IMGS[p - 1]} style={styles.pileImg} resizeMode="contain" />
                        {selected && (
                          <View style={styles.selectedOverlay}>
                            <Text style={styles.selectedTick}>✓</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {/* Colour name — always the standard colour label */}
                    <Text style={[
                      styles.colorLabel,
                      { color: selected ? bg : '#6688aa' },
                      selected && styles.colorLabelSelected,
                    ]}>
                      {COLOR_NAMES[p - 1]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Secret hint */}
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>🤫  Only you can see this setting</Text>
            </View>
          </>
        )}

        <View style={styles.divider} />

        {/* ── Done button ─────────────────────────────── */}
        <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
          <LinearGradient
            colors={['#2a6fd4', '#1a57b0', '#0f3d8a']}
            style={styles.doneBtn}
          >
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
    textShadowOffset: { width: 1, height: 1 },
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
    shadowOffset: { width: 0, height: 2 },
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
    textShadowOffset: { width: 0, height: 1 },
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
    top: 0, left: 0, right: 0, bottom: 0,
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
  colorLabelSelected: {
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
