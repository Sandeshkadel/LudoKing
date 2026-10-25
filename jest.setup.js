/* eslint-env jest */
jest.mock('react-native-mmkv', () => {
  const store = {};
  return {
    MMKV: class {
      set(k, v) {
        store[k] = v;
      }
      getString(k) {
        return store[k];
      }
      delete(k) {
        delete store[k];
      }
    },
  };
});
jest.mock('react-native-sound-player', () => ({
  playAsset: jest.fn(),
  playSoundFile: jest.fn(),
  addEventListener: jest.fn(),
}));
jest.mock('lottie-react-native', () => 'LottieView');
jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: 'LinearGradient',
  LinearGradient: 'LinearGradient',
}));
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
