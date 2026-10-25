import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {memo, useEffect, useRef, useState} from 'react';
import {LinearGradient} from 'react-native-linear-gradient';
import {BackgroundImage} from '$helpers/GetIcon';
import LottieView from 'lottie-react-native';
import {ANIMATATIONS} from '$assets/animation';
import {IMAGES} from '$assets/images';
import {useAppDispatch, useAppSelector} from '$hooks/useAppStore';
import {
  selectCurrentPlayerChance,
  selectDiceNo,
  selectDiceRolled,
  selectPlayerCount,
  selectAiPlayers,
  selectDiceTouch,
  selectWinner,
} from '$redux/reducers/gameSelectors';
import {seatRole} from '$helpers/seatRole';
import {playTurnThunk} from '$redux/reducers/turnThunk';
interface DiceProps {
  color: string;
  rotate?: boolean;
  player: number;
  data: PLAYER_PIECE[];
}

const Dice: React.FC<DiceProps> = ({color, rotate, player}) => {
  const dispatch = useAppDispatch();

  const currentPlayerChance = useAppSelector(selectCurrentPlayerChance);
  const isDiceRolled = useAppSelector(selectDiceRolled);
  const diceNo = useAppSelector(selectDiceNo);
  const playerCount = useAppSelector(selectPlayerCount);
  const aiPlayers = useAppSelector(selectAiPlayers);
  const touchBlocked = useAppSelector(selectDiceTouch);
  const winner = useAppSelector(selectWinner);
  const busyRef = useRef(false);
  const [autoTick, setAutoTick] = useState(0);
  const isAiSeat = seatRole(
    {playerCount, aiPlayers, cheatMode: {enabled: false, favoredPlayer: 0}},
    player,
  ).ai;
  const pileIcon = BackgroundImage.getImage(color);
  const diceIcon = BackgroundImage.getImage(diceNo);

  const arrowAnimation = useRef(new Animated.Value(0)).current;

  const [diceRolling, setDiceRolling] = useState<boolean>(false);

  useEffect(() => {
    function animateArrow() {
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnimation, {
            toValue: 10,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnimation, {
            toValue: -10,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }

    animateArrow();
  }, [currentPlayerChance, isDiceRolled, arrowAnimation]);

  // Single entry point: ignores repeated taps while a turn is being resolved.
  const handleDicePress = async (predice: number) => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    try {
      await dispatch(
        playTurnThunk(player, {predice, onRolling: setDiceRolling}),
      );
    } finally {
      busyRef.current = false;
      setAutoTick(t => t + 1);
    }
  };

  // Computer seats roll on their own once it is their turn and input is unlocked.
  useEffect(() => {
    if (
      !isAiSeat ||
      winner !== null ||
      currentPlayerChance !== player ||
      touchBlocked ||
      diceRolling ||
      busyRef.current
    ) {
      return;
    }
    const timer = setTimeout(() => {
      handleDicePress(0);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAiSeat,
    winner,
    currentPlayerChance,
    touchBlocked,
    diceRolling,
    autoTick,
    isDiceRolled,
  ]);

  return (
    <View style={[styles.flexRow, {transform: [{scaleX: rotate ? -1 : 1}]}]}>
      <View style={styles.border1}>
        <LinearGradient
          style={styles.linearGradient}
          colors={['#0052BE', '#5F9FCB', '#97C6C9']}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}>
          <View style={styles.pileContainer}>
            <Image source={pileIcon} style={styles.pileIcon} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.border2}>
        <LinearGradient
          style={styles.diceGradient}
          colors={['#aac8ab', '#aac8ab', '#aac8ab']}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}>
          <View style={styles.diceContainer}>
            {currentPlayerChance === player && !diceRolling && (
              <TouchableOpacity
                disabled={isDiceRolled || isAiSeat}
                accessibilityRole="button"
                accessibilityLabel={`Roll dice for player ${player}`}
                activeOpacity={0.5}
                onPress={() => handleDicePress(0)}>
                <Image source={diceIcon} style={styles.diceIcon} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {diceRolling && (
        <LottieView
          source={ANIMATATIONS.Diceroll}
          loop={false}
          autoPlay={true}
          style={styles.rollingDice}
          cacheComposition={true}
          hardwareAccelerationAndroid={true}
        />
      )}

      {currentPlayerChance === player && !isDiceRolled && (
        <Animated.View style={{transform: [{translateX: arrowAnimation}]}}>
          <Image source={IMAGES.Arrow} style={styles.arrowIcon} />
        </Animated.View>
      )}
    </View>
  );
};

export default memo(Dice);

const styles = StyleSheet.create({
  flexRow: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  border1: {
    borderWidth: 3,
    borderRightWidth: 0,
    borderColor: '#f0ce2c',
  },
  border2: {
    borderWidth: 3,
    padding: 1,
    backgroundColor: '#aac8ab',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderColor: '#aac8ab',
  },
  linearGradient: {},
  pileIcon: {
    width: 30,
    height: 30,
  },
  pileContainer: {
    paddingHorizontal: 3,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 50,
    height: 30,
  },
  diceContainer: {
    backgroundColor: '#e8c0c1',
    borderWidth: 1,
    borderRadius: 5,
    width: 55,
    height: 55,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceGradient: {
    borderWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#f0ce2c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceIcon: {
    height: 45,
    width: 45,
  },
  rollingDice: {
    height: 80,
    width: 80,
    zIndex: 99,
    top: -19,
    left: 38,
    position: 'absolute',
  },
});
