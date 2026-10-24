import { initialState } from '../src/redux/initialState';
import {
  enableCellSelection,
  enablePileSelection,
  gameReducer,
  unfreezeDice,
  updatePlayerChance,
  updatePlayerPieceValue,
} from '../src/redux/reducers/gameSlice';

describe('game selection lifecycle', () => {
  it('clears both piece-selection states when the dice is unfrozen', () => {
    const selected = gameReducer(
      gameReducer(initialState, enablePileSelection({ playerNo: 1 })),
      enableCellSelection({ playerNo: 1 }),
    );
    const result = gameReducer(selected, unfreezeDice());
    expect(result.pileSelectionPlayer).toBe(-1);
    expect(result.cellSelectionPlayer).toBe(-1);
    expect(result.touchDiceBlock).toBe(false);
  });

  it('clears both piece-selection states when the turn changes', () => {
    const selected = gameReducer(
      gameReducer(initialState, enablePileSelection({ playerNo: 1 })),
      enableCellSelection({ playerNo: 1 }),
    );
    const result = gameReducer(selected, updatePlayerChance({ chancePlayer: 2 }));
    expect(result.pileSelectionPlayer).toBe(-1);
    expect(result.cellSelectionPlayer).toBe(-1);
    expect(result.chancePlayer).toBe(2);
  });
});


  it('clears both piece-selection states after a piece update', () => {
    const selected = gameReducer(
      gameReducer(initialState, enablePileSelection({ playerNo: 1 })),
      enableCellSelection({ playerNo: 1 }),
    );
    const result = gameReducer(
      selected,
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
