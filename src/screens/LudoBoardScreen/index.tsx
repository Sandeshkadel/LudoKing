import {Animated, Image, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Wrapper from '$components/Wrapper';
import {styles} from './styles';
import {IMAGES} from '$assets/images';
import Dice from '$components/Dice';
import {COLORS} from '$constants/colors';
import Pocket from '$components/Pocket';
import VerticalPath from '$components/VerticalPath';
import {plot1data, plot2data, plot3data, plot4data} from '$helpers/PlotData';
import HorizontalPath from '$components/HorizontalPath';
import FourTriangle from '$components/FourTriangle';
import {useAppSelector} from '$hooks/useAppStore';
import {
  selectDiceTouch,
  selectPlayer1,
  selectPlayer2,
  selectPlayer3,
  selectPlayer4,
  selectWinner,
  selectPlayerNames,
  selectPlayerCount,
  selectCheatMode,
} from '$redux/reducers/gameSelectors';
import {useIsFocused} from '@react-navigation/native';
import MenuModal from '$components/MenuModal';
import WinnerModal from '$components/WinnerModal';

const LudoBoardScreen = () => {
  const player1 = useAppSelector(selectPlayer1);
  const player2 = useAppSelector(selectPlayer2);
  const player3 = useAppSelector(selectPlayer3);
  const player4 = useAppSelector(selectPlayer4);
  const isDiceTouched = useAppSelector(selectDiceTouch);
  const winner = useAppSelector(selectWinner);
  const playerNames = useAppSelector(selectPlayerNames);
  const playerCount = useAppSelector(selectPlayerCount);
  const assist = useAppSelector(selectCheatMode);
  const COLOR_NAMES = ['Red', 'Green', 'Yellow', 'Blue'];
  const favoredName =
    assist.favoredPlayer >= 1 && assist.favoredPlayer <= playerCount
      ? `${COLOR_NAMES[assist.favoredPlayer - 1]} (${
          playerNames[assist.favoredPlayer - 1] ?? ''
        })`
      : null;
  const isWinnerMode = assist.enabled && assist.guaranteed === true;
  const assistLabel =
    assist.enabled && favoredName
      ? isWinnerMode
        ? `WINNER MODE ON — ${favoredName} will win`
        : `Assist: ${favoredName}`
      : null;

  // Colour palette aligned with board pocket mapping
  // P1=Red  P2=Green  P3=Yellow  P4=Blue
  const PLAYER_COLORS_HEX = ['#d5151d', '#00a049', '#ffde17', '#28aeff'];

  const isFocused = useIsFocused();

  const [showStartIMG, setShowStartIMG] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused) {
      setShowStartIMG(true);
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );

      blinkAnimation.start();

      const timeout = setTimeout(() => {
        blinkAnimation.stop();
        setShowStartIMG(false);
      }, 2500);

      return () => {
        blinkAnimation.stop();
        clearTimeout(timeout);
      };
    }
  }, [isFocused, opacity]);

  return (
    <Wrapper>
      {isWinnerMode && (
        <View
          pointerEvents="none"
          style={styles.winnerBorder}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      )}
      {assistLabel && (
        <View
          style={[styles.assistBanner, isWinnerMode && styles.winnerBanner]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={
            isWinnerMode
              ? `${assistLabel}. The result of this match is set in advance.`
              : `${assistLabel}. This color has an open handicap.`
          }>
          <Text style={[styles.assistTxt, isWinnerMode && styles.winnerTxt]}>
            {assistLabel}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.iconContainer}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        activeOpacity={0.6}
        onPress={() => setMenuVisible(!menuVisible)}>
        <Image
          source={IMAGES.Menu}
          style={styles.menuIcon}
          resizeMode={'contain'}
        />
      </TouchableOpacity>

      <View style={styles.container}>
        {/* ── Top row: Player 2 (Green) + Player 3 (Yellow) ── */}
        <View
          style={styles.flexRow}
          pointerEvents={isDiceTouched ? 'none' : 'auto'}>
          <View style={styles.playerDiceGroup}>
            <View
              style={[
                styles.nameBadge,
                {backgroundColor: PLAYER_COLORS_HEX[1]},
              ]}>
              <Text style={styles.nameTxt} numberOfLines={1}>
                {playerNames[1] ?? 'Player 2'}
              </Text>
            </View>
            <Dice color={COLORS.green} player={2} data={player2} />
          </View>
          <View style={styles.playerDiceGroup}>
            <View
              style={[
                styles.nameBadge,
                {backgroundColor: PLAYER_COLORS_HEX[2]},
              ]}>
              <Text style={styles.nameTxt} numberOfLines={1}>
                {playerNames[2] ?? 'Player 3'}
              </Text>
            </View>
            <Dice color={COLORS.yellow} rotate player={3} data={player3} />
          </View>
        </View>

        <View style={styles.ludoBoardContainer}>
          <View style={styles.plotContainer}>
            <Pocket color={COLORS.green} player={2} data={player2} />
            <VerticalPath cells={plot2data} color={COLORS.yellow} player={2} />
            <Pocket color={COLORS.yellow} player={3} data={player3} />
          </View>

          <View style={styles.pathContainer}>
            <HorizontalPath cells={plot1data} color={COLORS.green} player={1} />
            <FourTriangle
              player1={player1}
              player2={player2}
              player3={player3}
              player4={player4}
            />
            <HorizontalPath cells={plot3data} color={COLORS.blue} player={3} />
          </View>

          <View style={styles.plotContainer}>
            <Pocket color={COLORS.red} player={1} data={player1} />
            <VerticalPath cells={plot4data} color={COLORS.red} player={4} />
            <Pocket color={COLORS.blue} player={4} data={player4} />
          </View>
        </View>

        {/* ── Bottom row: Player 1 (Red) + Player 4 (Blue) ── */}
        <View
          style={styles.flexRow}
          pointerEvents={isDiceTouched ? 'none' : 'auto'}>
          <View style={styles.playerDiceGroup}>
            <Dice color={COLORS.red} player={1} data={player1} />
            <View
              style={[
                styles.nameBadge,
                {backgroundColor: PLAYER_COLORS_HEX[0]},
              ]}>
              <Text style={styles.nameTxt} numberOfLines={1}>
                {playerNames[0] ?? 'Player 1'}
              </Text>
            </View>
          </View>
          <View style={styles.playerDiceGroup}>
            <Dice color={COLORS.blue} rotate player={4} data={player4} />
            <View
              style={[
                styles.nameBadge,
                {backgroundColor: PLAYER_COLORS_HEX[3]},
              ]}>
              <Text style={styles.nameTxt} numberOfLines={1}>
                {playerNames[3] ?? 'Player 4'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {showStartIMG && (
        <Animated.Image
          source={IMAGES.Start}
          style={[styles.startImage, {opacity}]}
        />
      )}

      {menuVisible && (
        <MenuModal
          visible={menuVisible}
          onPressHide={() => setMenuVisible(false)}
        />
      )}

      {winner !== null && <WinnerModal winner={winner} />}
    </Wrapper>
  );
};

export default LudoBoardScreen;
