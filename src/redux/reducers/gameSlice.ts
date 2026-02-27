import { initialState } from '$redux/initialState';
import { createSlice } from '@reduxjs/toolkit';

const gameSlice = createSlice({
    name: 'game',
    initialState: initialState,
    reducers: {
        resetGame: (state) => ({
            ...initialState,
            // ── Preserved across restarts ──────────────
            cheatMode: state.cheatMode,      // demo/normal mode + favoured colour
            playerNames: state.playerNames,   // chosen player names
            playerCount: state.playerCount,   // 2 / 3 / 4 players
        }),
        updateDiceNumber: (state, action) => {
            state.diceNo = action.payload.diceNo;
            state.isDiceRolled = false;
        },
        enablePileSelection: (state, action) => {
            state.touchDiceBlock = true;
            state.pileSelectionPlayer = action.payload.playerNo;
        },
        enableCellSelection: (state, action) => {
            state.touchDiceBlock = true;
            state.cellSelectionPlayer = action.payload.playerNo;
        },
        disableTouch: (state) => {
            state.touchDiceBlock = true;
            state.pileSelectionPlayer = -1;
            state.cellSelectionPlayer = -1;
        },
        unfreezeDice: (state) => {
            state.touchDiceBlock = false;
            state.isDiceRolled = false;
        },
        updateFireworks: (state, action) => {
            state.fireworks = action.payload;
        },
        announceWinner: (state, action) => {
            state.winner = action.payload;
        },
        updatePlayerChance: (state, action) => {
            state.chancePlayer = action.payload.chancePlayer;
            state.touchDiceBlock = false;
            state.isDiceRolled = false;
        },
        setPlayerNames: (state, action) => {
            state.playerNames = action.payload;
        },
        setPlayerCount: (state, action) => {
            state.playerCount = action.payload;
        },
        setCheatMode: (state, action) => {
            state.cheatMode = action.payload;
        },
        updatePlayerPieceValue: (state, action) => {
            const { playerNo, pieceId, pos, travelCount } = action.payload;
            const playerPieces : any[] = state[playerNo];
            const piece = playerPieces.find((p) => p.id === pieceId)
            state.pileSelectionPlayer = -1;

            if(piece){
                piece.pos = pos;
                piece.travelCount = travelCount;
                const currentPositionIdx = state.currentPosition.findIndex((p : any) => p.id === pieceId);

                if(pos === 0){
                    if(currentPositionIdx !== -1){
                        state.currentPosition.splice(currentPositionIdx,1);
                    }
                } else {
                    if(currentPositionIdx !== -1){
                        state.currentPosition[currentPositionIdx] = { id: pieceId, pos };
                    } else {
                        state.currentPosition.push({ id : pieceId, pos });
                    }
                }
            }
        }
    }
})

export const {
    resetGame,
    updateDiceNumber,
    enablePileSelection,
    enableCellSelection,
    disableTouch,
    unfreezeDice,
    updateFireworks,
    announceWinner,
    updatePlayerChance,
    updatePlayerPieceValue,
    setPlayerNames,
    setPlayerCount,
    setCheatMode
} = gameSlice.actions;
export const gameReducer = gameSlice.reducer;