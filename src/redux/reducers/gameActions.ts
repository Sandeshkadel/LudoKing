import { safeSpots, starSpots, startingPoints, turningPoints, victoryStart } from "$helpers/PlotData";
import { playSound } from "$helpers/SoundUtils";
import { ApplicationDispatch, RootState } from "$redux/store"
import { selectCurrentPosition, selectDiceNo } from "./gameSelectors";
import { announceWinner, disableTouch, unfreezeDice, updateFireworks, updatePlayerChance, updatePlayerPieceValue } from "./gameSlice";

const delay = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

const getNextPlayer = (currentPlayer: number, playerCount: number) => {
    const nextPlayer = currentPlayer + 1;
    return nextPlayer > playerCount ? 1 : nextPlayer;
}

const checkWinningCriteria = (pieces : any[]) => {
    for(let piece of pieces) {
        if(piece.travelCount < 57) {
            return false;
        }
    }
    return true;
}

export const handleForwardThunk = (playerNo: number, id: string, pos: number) => {
    return async (dispatch: ApplicationDispatch, getState: () => RootState) => {

        const state = getState();
        const diceNo = selectDiceNo(state);
        const piece = state.game[`player${playerNo}`].find((item) => item.id === id);

        // Basic validity: piece must match, must not already be home
        if (!piece || piece.pos !== pos || piece.pos === 57) {
            dispatch(unfreezeDice());
            return;
        }

        // ── Pocket piece (pos === 0): bring it onto the board ──────────────
        if (piece.pos === 0) {
            if (diceNo !== 6) {
                dispatch(unfreezeDice());
                return;
            }
            dispatch(disableTouch());
            const startPos = startingPoints[playerNo - 1];
            playSound('pile_move');
            dispatch(updatePlayerPieceValue({
                playerNo: `player${playerNo}`,
                pieceId: id,
                pos: startPos,
                travelCount: 1,
            }));
            await delay(200);
            // dice was 6 → same player gets another turn
            dispatch(updatePlayerChance({ chancePlayer: playerNo }));
            return;
        }

        // Overshoot guard for board pieces
        if ((piece.travelCount + diceNo) > 57) {
            dispatch(unfreezeDice());
            return;
        }

        dispatch(disableTouch())

        let finalPath = piece.pos;
        let travelCount = piece.travelCount;

        for (let i = 0; i < diceNo; i++) {
            const updatedPosition = getState();
            const playerPiece = updatedPosition.game[`player${playerNo}`].find((e) => e.id === id);
            let path = playerPiece?.pos! + 1;
            if (turningPoints.includes(path) && turningPoints[playerNo - 1] == path) {
                path = victoryStart[playerNo - 1];
            }

            if (path == 53) {
                path = 1;
            }

            finalPath = path;
            travelCount += 1;

            dispatch(updatePlayerPieceValue({
                playerNo: `player${playerNo}`,
                pieceId: playerPiece?.id,
                pos: path,
                travelCount: travelCount
            }))
            playSound('pile_move')
            await delay(200);
        }

        const updatedState = getState();
        const updatedPlottedPieces: any[] = selectCurrentPosition(updatedState);
        const finalPlot = updatedPlottedPieces.filter((e) => e.pos === finalPath);
        const enemyPiecesAtFinalPos = finalPlot.filter((pieceAtPos) => pieceAtPos.id[0] !== id[0]);
        let captured = false;

        if (safeSpots.includes(finalPath) || starSpots.includes(finalPath)) {
            playSound('safe_spot');
        }

        if (
            enemyPiecesAtFinalPos.length === 1 &&
            !safeSpots.includes(finalPath) &&
            !starSpots.includes(finalPath)
        ) {
            const enemyPiece = enemyPiecesAtFinalPos[0];
            const enemyId = enemyPiece.id[0];
            const enemyPlayerNo = enemyId === 'A' ? 1 : enemyId === 'B' ? 2 : enemyId === 'C' ? 3 : 4;

            playSound('collide');

            dispatch(updatePlayerPieceValue({
                playerNo: `player${enemyPlayerNo}`,
                pieceId: enemyPiece.id,
                pos: 0,
                travelCount: 0
            }))

            captured = true;
        }

        const reachedHome = travelCount === 57;

        if (reachedHome) {
            playSound('home_win');
            const finalPlayerState = getState();
            const playerAllPieces = finalPlayerState.game[`player${playerNo}`];

            if (checkWinningCriteria(playerAllPieces)) {
                dispatch(announceWinner(playerNo))
                playSound('cheer');
                return;
            }

            dispatch(updateFireworks(true));
            dispatch(unfreezeDice());
        }

        if (diceNo === 6 || reachedHome || captured) {
            dispatch(updatePlayerChance({ chancePlayer: playerNo }))
        } else {
            dispatch(updatePlayerChance({ chancePlayer: getNextPlayer(playerNo, state.game.playerCount) }))
        }
    }
}