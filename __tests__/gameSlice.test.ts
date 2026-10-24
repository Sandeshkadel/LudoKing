import { initialState } from '../src/redux/initialState';
import {
  enableCellSelection,
  enablePileSelection,
  gameReducer,
  unfreezeDice,
  updatePlayerChance,
  updatePlayerPieceValue,
  resetGame,
  setCheatMode,
  setPlayerCount,
  setPlayerNames,
} from '../src/redux/reducers/gameSlice';

describe('game selection lifecycle', () => {
  const selectedState = () =>
    gameReducer(
      gameReducer(initialState, enablePileSelection({ playerNo: 1 })),
      enableCellSelection({ playerNo: 1 }),
    );

  it('clears both piece-selection states when the dice is unfrozen', () => {
    const result = gameReducer(selectedState(), unfreezeDice());
    expect(result.pileSelectionPlayer).toBe(-1);
    expect(result.cellSelectionPlayer).toBe(-1);
    expect(result.touchDiceBlock).toBe(false);
  });

  it('clears both piece-selection states when the turn changes', () => {
    const result = gameReducer(selectedState(), updatePlayerChance({ chancePlayer: 2 }));
    expect(result.pileSelectionPlayer).toBe(-1);
    expect(result.cellSelectionPlayer).toBe(-1);
    expect(result.chancePlayer).toBe(2);
  });

  it('clears both piece-selection states after a piece update', () => {
    const result = gameReducer(
      selectedState(),
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'A1',
        pos: 1,
        travelCount: 1,
      }),
    );
    expect(result.pileSelectionPlayer).toBe(-1);
    expect(result.cellSelectionPlayer).toBe(-1);
    expect(result.player1[0]).toMatchObject({ id: 'A1', pos: 1, travelCount: 1 });
  });

  it('resets the board while preserving player setup and Assist preferences', () => {
    let state = gameReducer(initialState, setPlayerNames(['Red', 'Blue', 'Green', 'Yellow']));
    state = gameReducer(state, setPlayerCount(2));
    state = gameReducer(state, setCheatMode({ enabled: true, favoredPlayer: 2 }));
    state = gameReducer(state, updatePlayerChance({ chancePlayer: 3 }));
    state = gameReducer(state, updatePlayerPieceValue({
      playerNo: 'player1',
      pieceId: 'A1',
      pos: 1,
      travelCount: 1,
    }));

    const result = gameReducer(state, resetGame());

    expect(result.playerNames).toEqual(['Red', 'Blue', 'Green', 'Yellow']);
    expect(result.playerCount).toBe(2);
    expect(result.cheatMode).toEqual({ enabled: true, favoredPlayer: 2 });
    expect(result.chancePlayer).toBe(initialState.chancePlayer);
    expect(result.player1).toEqual(initialState.player1);
    expect(result.currentPosition).toEqual([]);
    expect(result.pileSelectionPlayer).toBe(-1);
    expect(result.cellSelectionPlayer).toBe(-1);
  });

});
