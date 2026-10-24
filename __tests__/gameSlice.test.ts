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
});
