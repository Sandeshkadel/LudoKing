
import React, { memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Modal from 'react-native-modal';
import { useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import GradientButton from './GradientButton';
import Pile from './Pile';
import { announceWinner, resetGame } from '../redux/reducers/gameSlice';
import { playSound } from '$helpers/SoundUtils';
import { resetAndNavigate } from '$helpers/navigationUtils';
import { ANIMATATIONS } from '$assets/animation';
import { COLORS } from '$constants/colors';
import { useAppSelector } from '$hooks/useAppStore';
import { selectPlayerNames } from '$redux/reducers/gameSelectors';
import { IMAGES } from '$assets/images';

// Colour palette: P1=Red  P2=Green  P3=Yellow  P4=Blue
const WINNER_COLORS = ['#d5151d', '#00a049', '#ffde17', '#28aeff'];
const WINNER_PILE_IMGS = [IMAGES.RedPile, IMAGES.GreenPile, IMAGES.YellowPile, IMAGES.BluePile];
const WINNER_COLORS_DARK = ['#8b0000', '#005a00', '#a08000', '#0055aa'];

const WinnerModal: React.FC<{ winner: any }> = ({ winner }) => {

    const dispatch = useDispatch();
    const playerNames = useAppSelector(selectPlayerNames);
    const [visible, setVisible] = useState(!!winner);

    const winnerIdx = typeof winner === 'number' ? winner - 1 : 0;
    const winnerName = playerNames?.[winnerIdx] ?? `Player ${winner}`;
    const winnerColor = WINNER_COLORS[winnerIdx] ?? COLORS.borderColor;
    const winnerPileImg = WINNER_PILE_IMGS[winnerIdx] ?? IMAGES.BluePile;

    useEffect(() => {
        setVisible(!!winner);
    }, [winner]);

    // Restart: reset pieces only, cheatMode is preserved by the reducer
    const handleRestart = () => {
        dispatch(resetGame());
        dispatch(announceWinner(null));
        playSound('game_start');
    };

    const handleHome = () => {
        dispatch(resetGame());
        dispatch(announceWinner(null));
        resetAndNavigate('HomeScreen');
    };

    return (
        <Modal
            style={styles.modal}
            isVisible={visible}
            backdropColor="black"
            backdropOpacity={0.8}
            onBackdropPress={() => { }}
            animationIn="zoomIn"
            animationOut="zoomOut"
            onBackButtonPress={() => { }}
        >
            <LinearGradient
                colors={['#0f0c29', '#302b63', '#24243e']}
                style={styles.gradientContainer}
            >
                <View style={styles.content}>
                    {/* Winner colour badge */}
                    <View style={[styles.winnerBadge, { backgroundColor: winnerColor }]}>
                        <Image source={winnerPileImg} style={styles.winnerPile} resizeMode="contain" />
                    </View>

                    <Text style={styles.congratsText}>🎉 Congratulations!</Text>
                    <Text style={[styles.winnerNameText, { color: winnerColor }]}>{winnerName}</Text>
                    <Text style={styles.wonText}>has won the match!</Text>

                    <LottieView
                        autoPlay
                        hardwareAccelerationAndroid
                        loop={false}
                        source={ANIMATATIONS.Tropy}
                        style={styles.trophyAnimation}
                    />
                    <LottieView
                        autoPlay
                        hardwareAccelerationAndroid
                        loop={false}
                        source={ANIMATATIONS.Firework}
                        style={styles.fireworkAnimation}
                    />

                    {/* RESTART keeps cheatMode; HOME resets everything */}
                    <GradientButton title='RESTART GAME' onPress={handleRestart} />
                    <GradientButton title='HOME' onPress={handleHome} />
                </View>
            </LinearGradient>
            <LottieView
                autoPlay
                hardwareAccelerationAndroid
                loop={false}
                source={ANIMATATIONS.Girl}
                style={styles.girlAnimation}
            />
        </Modal>
    )
}

export default memo(WinnerModal);

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    gradientContainer: {
        borderRadius: 20,
        padding: 20,
        width: '96%',
        borderWidth: 2,
        borderColor: 'gold',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        width: '96%',
        alignItems: 'center'
    },
    winnerBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 3,
        borderColor: 'gold',
        elevation: 6,
        shadowColor: 'gold',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    winnerPile: {
        width: 46,
        height: 46,
    },
    congratsText: {
        fontSize: 20,
        color: '#FFD700',
        fontWeight: '900',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    winnerNameText: {
        fontSize: 28,
        fontWeight: '900',
        marginTop: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    wonText: {
        color: '#cccccc',
        fontSize: 14,
        marginBottom: 4,
    },
    trophyAnimation: {
        height: 180,
        width: 180,
        marginTop: 10,
    },
    fireworkAnimation: {
        width: 200,
        height: 500,
        marginTop: 20,
        position: 'absolute',
        zIndex: -1
    },
    pileContainer: {
        marginBottom: 10
    },
    girlAnimation: {
        height: 200,
        width: 200,
        position: 'absolute',
        bottom: -50,
        right: -30,
    }
})