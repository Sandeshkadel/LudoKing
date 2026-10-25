import {DEVICE_HEIGHT, DEVICE_WIDTH} from '$constants/dimensions';
import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  assistBanner: {
    position: 'absolute',
    top: 62,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  winnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: '#d5151d',
    zIndex: 5,
  },
  winnerBanner: {
    backgroundColor: '#d5151d',
    borderColor: '#ffffff',
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  winnerTxt: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  assistTxt: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 12,
  },
  iconContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  startImage: {
    width: DEVICE_WIDTH * 0.5,
    height: DEVICE_WIDTH * 0.2,
    position: 'absolute',
  },
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: DEVICE_HEIGHT * 0.5,
    width: DEVICE_WIDTH,
  },
  flexRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 30,
  },
  ludoBoardContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  plotContainer: {
    width: '100%',
    height: '40%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ccc',
  },
  pathContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '20%',
    backgroundColor: '#1E5162',
  },
  playerDiceGroup: {
    alignItems: 'center',
    gap: 4,
  },
  nameBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: 110,
  },
  nameTxt: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});
