import { Animated, Easing, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { memo, useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'react-native-linear-gradient';
import { BackgroundImage } from '$helpers/GetIcon';
import LottieView from 'lottie-react-native';
import { ANIMATATIONS } from '$assets/animation';
import { IMAGES } from '$assets/images';
import { useAppDispatch, useAppSelector } from '$hooks/useAppStore';
import { selectCurrentPlayerChance, selectDiceNo, selectDiceRolled, selectPlayerCount, selectCheatMode } from '$redux/reducers/gameSelectors';
import { disableTouch, enableCellSelection, enablePileSelection, updateDiceNumber, updatePlayerChance } from '$redux/reducers/gameSlice';
import { handleForwardThunk } from '$redux/reducers/gameActions';
import { playSound } from '$helpers/SoundUtils';
import { getNextPlayer as getNextPlayerForCount, rollFairDice, rollWeightedDice } from '$helpers/ludoRules';

interface DiceProps {
    color: string;
    rotate?: boolean;
    player: number;
    data: PLAYER_PIECE[];
}

const Dice: React.FC<DiceProps> = ({ color, rotate, player, data }) => {

    const dispatch = useAppDispatch();

    const currentPlayerChance = useAppSelector(selectCurrentPlayerChance);
    const isDiceRolled = useAppSelector(selectDiceRolled);
    const diceNo = useAppSelector(selectDiceNo);
    const playerCount = useAppSelector(selectPlayerCount);
    const cheatMode = useAppSelector(selectCheatMode);
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
                        useNativeDriver: true
                    }),
                    Animated.timing(arrowAnimation, {
                        toValue: -10,
                        duration: 600,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true
                    })
                ])
            ).start()
        }

        animateArrow()
    }, [currentPlayerChance, isDiceRolled])

    const delay = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

    // ── Piece selector for Assist mode ─────────────────────────────────────────
    // Favored player: pick the piece closest to home (100% win path).
    const getBestPieceForAssistMode = (diceNum: number, pieces: PLAYER_PIECE[]): { id: string; pos: number } | null => {
        // Priority 1 — piece that reaches home EXACTLY this turn
        const homeRun = pieces.find(
            p => p.pos !== 0 && p.travelCount < 57 && p.travelCount + diceNum === 57
        );
        if (homeRun) return { id: homeRun.id, pos: homeRun.pos };

        // Priority 2 — furthest piece on board that can still advance
        const movable = pieces
            .filter(p => p.pos !== 0 && p.travelCount < 57 && p.travelCount + diceNum <= 57)
            .sort((a, b) => b.travelCount - a.travelCount);
        if (movable.length > 0) return { id: movable[0].id, pos: movable[0].pos };

        // Priority 3 — bring a pocket piece out (only when dice = 6)
        if (diceNum === 6) {
            const pocketed = pieces.find(p => p.pos === 0);
            if (pocketed) return { id: pocketed.id, pos: 0 };
        }

        return null;
    };

    // ── Assist-mode dice weighting ────────────────────────────────────────────────────
    // Only the selected Assist-mode color uses weighted dice; all other colors
    // continue to use a uniform random roll.
    const computeAssistDice = (): number => {
        // Explicitly disclosed practice weighting: 8%, 10%, 14%, 18%, 22%, 28%.
        return rollWeightedDice([8, 10, 14, 18, 22, 28]);
    };


    const handleDicePress = async (predice: number) => {

        const isFavoredPlayer =
            cheatMode.enabled && cheatMode.favoredPlayer !== 0 && player === cheatMode.favoredPlayer;

        // Determine dice value
        let diceNumber: number;
        if (predice) {
            diceNumber = predice;
        } else if (cheatMode.enabled && cheatMode.favoredPlayer !== 0 && isFavoredPlayer) {
            // The selected color receives a disclosed practice-mode advantage.
            // Other players keep fair, uniform dice rolls.
            diceNumber = computeAssistDice();
        } else {
            diceNumber = rollFairDice();
        }

        playSound('dice_roll');
        setDiceRolling(true);
        await delay(800);
        dispatch(updateDiceNumber({ diceNo: diceNumber }));
        setDiceRolling(false);

        const hasMovablePieceOnBoard = data.some((piece) => (
            piece.pos !== 0 && piece.pos !== 57 && (piece.travelCount + diceNumber) <= 57
        ));
        const hasPieceInPocket = data.some((piece) => piece.pos === 0);

        // ── Assist mode: auto-select & move the best piece for the favored color ──
        // Brief delay keeps the move animation readable.
        if (isFavoredPlayer) {
            const bestPiece = getBestPieceForAssistMode(diceNumber, data);
            if (bestPiece) {
                dispatch(disableTouch());
                // Allow the dice animation to settle before moving.
                const thinkTime = 700 + Math.floor(Math.random() * 800);
                await delay(thinkTime);
                dispatch(handleForwardThunk(player, bestPiece.id, bestPiece.pos) as any);
                return;
            }
            // A six with no legal move still grants another roll.
            await delay(700);
            dispatch(updatePlayerChance({ chancePlayer: diceNumber === 6 ? player : getNextPlayerForCount(player, playerCount) }));
            return;
        }

        if (diceNumber === 6) {
            if (hasPieceInPocket) {
                dispatch(enablePileSelection({ playerNo: player }));
            }

            if (hasMovablePieceOnBoard) {
                dispatch(enableCellSelection({ playerNo: player }));
                return;
            }

            if (hasPieceInPocket) {
                return;
            }

            // A six grants another roll even when no piece can legally move.
            await delay(600);
            dispatch(updatePlayerChance({ chancePlayer: player }));
            return;
        }

        if (hasMovablePieceOnBoard) {
            dispatch(enableCellSelection({ playerNo: player }));
            return;
        }

        await delay(600);
        dispatch(updatePlayerChance({ chancePlayer: getNextPlayerForCount(player, playerCount) }));
    }


    return (
        <View style={[styles.flexRow, { transform: [{ scaleX: rotate ? -1 : 1 }] }]}>
            <View style={styles.border1}>
                <LinearGradient
                    style={styles.linearGradient}
                    colors={['#0052BE', '#5F9FCB', '#97C6C9']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.pileContainer}>
                        <Image
                            source={pileIcon}
                            style={styles.pileIcon}
                        />
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.border2}>
                <LinearGradient
                    style={styles.diceGradient}
                    colors={['#aac8ab', '#aac8ab', '#aac8ab']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                >
                    <View style={styles.diceContainer}>
                        {((currentPlayerChance === player) && !diceRolling) && (
                            <TouchableOpacity
                                disabled={isDiceRolled}
                                activeOpacity={0.5}
                                onPress={() => handleDicePress(0)}
                            >
                                <Image
                                    source={diceIcon}
                                    style={styles.diceIcon}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>
            </View>

            {
                (diceRolling) &&
                <LottieView
                    source={ANIMATATIONS['Diceroll']}
                    loop={false}
                    autoPlay={true}
                    style={styles.rollingDice}
                    cacheComposition={true}
                    hardwareAccelerationAndroid={true}
                />
            }

            {((currentPlayerChance === player) && !isDiceRolled) &&
                <Animated.View style={{ transform: [{ translateX: arrowAnimation }] }}>
                    <Image
                        source={IMAGES.Arrow}
                        style={{ width: 50, height: 30 }}
                    />
                </Animated.View>
            }
        </View>
    )
}

export default memo(Dice)

const styles = StyleSheet.create({
    flexRow: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    border1: {
        borderWidth: 3,
        borderRightWidth: 0,
        borderColor: '#f0ce2c'
    },
    border2: {
        borderWidth: 3,
        padding: 1,
        backgroundColor: '#aac8ab',
        borderRadius: 10,
        borderLeftWidth: 3,
        borderColor: '#aac8ab'
    },
    linearGradient: {

    },
    pileIcon: {
        width: 30,
        height: 30,
    },
    pileContainer: {
        paddingHorizontal: 3,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center'
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
        alignItems: 'center'
    },
    diceGradient: {
        borderWidth: 3,
        borderLeftWidth: 3,
        borderColor: '#f0ce2c',
        justifyContent: 'center',
        alignItems: 'center'
    },
    diceIcon: {
        height: 45,
        width: 45
    },
    rollingDice: {
        height: 80,
        width: 80,
        zIndex: 99,
        top: -19,
        left: 38,
        position: 'absolute'
    }
})