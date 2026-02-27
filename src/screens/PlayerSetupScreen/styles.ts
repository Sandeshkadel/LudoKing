import { StyleSheet, Platform } from 'react-native';
import { DEVICE_WIDTH } from '$constants/dimensions';
import { RFValue } from 'react-native-responsive-fontsize';

export const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    alignItems: 'center',
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: {
    width: 50,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFD700',
    fontSize: RFValue(13),
    fontWeight: '900',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a2236',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2a5f8f',
    minWidth: 50,
  },
  badgeDice: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  countText: {
    color: '#fff',
    fontSize: RFValue(11),
    fontWeight: '700',
  },

  // ── Divider ─────────────────────────────────────────────────
  divider: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#FFD700',
    opacity: 0.35,
    marginVertical: 4,
  },

  // ── Scroll / player list ────────────────────────────────────
  scroll: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },

  // ── Player row ──────────────────────────────────────────────
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 30, 60, 0.55)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(100,160,220,0.2)',
    gap: 8,
  },
  pinWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pinImg: {
    width: 30,
    height: 30,
  },

  // Name input
  nameInput: {
    flex: 1,
    height: 42,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingHorizontal: 10,
    color: '#fff',
    fontSize: RFValue(13),
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  // Dice button
  diceBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceImg: {
    width: 34,
    height: 34,
  },

  // Robot badge
  robotBadge: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2a5f8f',
  },
  robotGrad: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  robotEmoji: {
    fontSize: 20,
  },

  // ── Player count selector ───────────────────────────────────
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  countBtn: {
    width: 60,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a3a58',
  },
  countBtnSelected: {
    borderColor: '#f5b942',
    elevation: 6,
    shadowColor: '#f5b942',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  countBtnTxt: {
    color: '#6688aa',
    fontSize: RFValue(14),
    fontWeight: '800',
  },
  countBtnTxtSelected: {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // ── Play button ─────────────────────────────────────────────
  playBtnOuter: {
    width: DEVICE_WIDTH * 0.72,
    marginTop: 6,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#f5b942',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  playBtnBorder: {
    width: '100%',
    borderRadius: 30,
    padding: 3,
  },
  playBtn: {
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnTxt: {
    color: '#fff',
    fontSize: RFValue(18),
    fontWeight: '900',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  bottomSpacer: {
    height: 20,
  },
});
