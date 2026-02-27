import { RootState } from "$redux/store";

export const selectCurrentPosition = (state: RootState) => state.game.currentPosition;
export const selectCurrentPlayerChance = (state: RootState) => state.game.chancePlayer;
export const selectDiceRolled = (state: RootState) => state.game.isDiceRolled;
export const selectDiceNo = (state: RootState) => state.game.diceNo;
export const selectWinner = (state: RootState) => state.game.winner;

export const selectPlayer1 = (state: RootState): PLAYER_PIECE[] => state.game.player1;
export const selectPlayer2 = (state: RootState): PLAYER_PIECE[] => state.game.player2;
export const selectPlayer3 = (state: RootState): PLAYER_PIECE[] => state.game.player3;
export const selectPlayer4 = (state: RootState): PLAYER_PIECE[] => state.game.player4;

export const selectPocketPileSelection = (state: RootState) => state.game.pileSelectionPlayer;
export const selectCellSelection = (state: RootState) => state.game.cellSelectionPlayer;
export const selectDiceTouch = (state: RootState) => state.game.touchDiceBlock;
export const selectFireworks = (state: RootState) => state.game.fireworks;
export const selectPlayerNames = (state: RootState) => state.game.playerNames;
export const selectPlayerCount = (state: RootState) => state.game.playerCount;
export const selectCheatMode = (state: RootState) => state.game.cheatMode;