import {initialState} from '$redux/initialState';
import {
  announceWinner,
  gameReducer,
  resetGame,
  setPlayerCount,
  setPlayerNames,
  updatePlayerPieceValue,
  updatePlayerChance,
  unfreezeDice,
} from '../gameSlice';

describe('game reducer invariants', () => {
  it('starts with four pieces per player in their pockets', () => {
    const state = gameReducer(undefined, {type: '@@test/init'});
    expect(state.player1).toHaveLength(4);
    expect(state.player2).toHaveLength(4);
    expect(state.player3).toHaveLength(4);
    expect(state.player4).toHaveLength(4);
    expect(
      [
        ...state.player1,
        ...state.player2,
        ...state.player3,
        ...state.player4,
      ].every(piece => piece.pos === 0 && piece.travelCount === 0),
    ).toBe(true);
  });

  it('updates a piece and keeps currentPosition synchronized', () => {
    let state = gameReducer(
      initialState,
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'A1',
        pos: 1,
        travelCount: 1,
      }),
    );
    expect(state.player1[0]).toMatchObject({id: 'A1', pos: 1, travelCount: 1});
    expect(state.currentPosition).toContainEqual({id: 'A1', pos: 1});

    state = gameReducer(
      state,
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'A1',
        pos: 2,
        travelCount: 2,
      }),
    );
    expect(state.currentPosition.filter(piece => piece.id === 'A1')).toEqual([
      {id: 'A1', pos: 2},
    ]);

    state = gameReducer(
      state,
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'A1',
        pos: 0,
        travelCount: 0,
      }),
    );
    expect(state.currentPosition.some(piece => piece.id === 'A1')).toBe(false);
  });

  it('does not mutate state for an unknown piece id', () => {
    const state = gameReducer(
      initialState,
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'missing',
        pos: 12,
        travelCount: 12,
      }),
    );
    expect(state.player1).toEqual(initialState.player1);
    expect(state.currentPosition).toEqual(initialState.currentPosition);
  });

  it('rotates the active player and clears stale touch selections', () => {
    const selected = {
      ...initialState,
      chancePlayer: 1,
      touchDiceBlock: true,
      pileSelectionPlayer: 1,
      cellSelectionPlayer: 1,
      isDiceRolled: true,
    };
    const state = gameReducer(selected, updatePlayerChance({chancePlayer: 2}));
    expect(state.chancePlayer).toBe(2);
    expect(state.touchDiceBlock).toBe(false);
    expect(state.pileSelectionPlayer).toBe(-1);
    expect(state.cellSelectionPlayer).toBe(-1);
    expect(state.isDiceRolled).toBe(false);
  });

  it('unfreezes dice and clears selections', () => {
    const state = gameReducer(
      {
        ...initialState,
        touchDiceBlock: true,
        isDiceRolled: true,
        pileSelectionPlayer: 2,
        cellSelectionPlayer: 2,
      },
      unfreezeDice(),
    );
    expect(state.touchDiceBlock).toBe(false);
    expect(state.isDiceRolled).toBe(false);
    expect(state.pileSelectionPlayer).toBe(-1);
    expect(state.cellSelectionPlayer).toBe(-1);
  });

  it('announces a winner explicitly', () => {
    expect(gameReducer(initialState, announceWinner(3)).winner).toBe(3);
  });

  it('preserves configured player names/count and Assist settings on reset', () => {
    let state = gameReducer(
      initialState,
      setPlayerNames(['Red', 'Green', 'Yellow', 'Blue']),
    );
    state = gameReducer(state, setPlayerCount(3));
    state = gameReducer(state, {
      type: 'game/setCheatMode',
      payload: {enabled: true, favoredPlayer: 2},
    });
    state = gameReducer(
      state,
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'A1',
        pos: 1,
        travelCount: 1,
      }),
    );
    state = gameReducer(state, announceWinner(1));

    const reset = gameReducer(state, resetGame());
    expect(reset.playerNames).toEqual(['Red', 'Green', 'Yellow', 'Blue']);
    expect(reset.playerCount).toBe(3);
    expect(reset.cheatMode).toEqual({enabled: true, favoredPlayer: 2});
    expect(
      reset.player1.every(piece => piece.pos === 0 && piece.travelCount === 0),
    ).toBe(true);
    expect(reset.winner).toBeNull();
  });
});

describe('computer seats and assist settings', () => {
  it('stores only valid, unique computer seats', () => {
    const {setAiPlayers} = require('../gameSlice');
    const state = gameReducer(initialState, setAiPlayers([2, 2, 5, 0, 3, 'x']));
    expect(state.aiPlayers).toEqual([2, 3]);
  });

  it('ignores an invalid difficulty', () => {
    const {setAiDifficulty} = require('../gameSlice');
    let state = gameReducer(initialState, setAiDifficulty('normal'));
    expect(state.aiDifficulty).toBe('normal');
    state = gameReducer(state, setAiDifficulty('impossible'));
    expect(state.aiDifficulty).toBe('normal');
  });

  it('restart keeps names, count, assist, computer seats and difficulty but clears the board', () => {
    const {
      setAiPlayers,
      setAiDifficulty,
      setCheatMode: setAssist,
    } = require('../gameSlice');
    let state = gameReducer(
      initialState,
      setPlayerNames(['Ann', 'Bob', 'Cy', 'Di']),
    );
    state = gameReducer(state, setPlayerCount(3));
    state = gameReducer(state, setAssist({enabled: true, favoredPlayer: 2}));
    state = gameReducer(state, setAiPlayers([2, 3]));
    state = gameReducer(state, setAiDifficulty('easy'));
    state = gameReducer(
      state,
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'A1',
        pos: 5,
        travelCount: 5,
      }),
    );
    state = gameReducer(state, announceWinner(1));
    state = gameReducer(state, resetGame());
    expect(state.playerNames).toEqual(['Ann', 'Bob', 'Cy', 'Di']);
    expect(state.playerCount).toBe(3);
    expect(state.cheatMode).toEqual({enabled: true, favoredPlayer: 2});
    expect(state.aiPlayers).toEqual([2, 3]);
    expect(state.aiDifficulty).toBe('easy');
    expect(state.winner).toBeNull();
    expect(state.currentPosition).toEqual([]);
    expect(state.player1[0]).toMatchObject({pos: 0, travelCount: 0});
  });

  it('ignores unknown piece ids without corrupting state', () => {
    const before = gameReducer(initialState, {type: '@@noop'});
    const after = gameReducer(
      before,
      updatePlayerPieceValue({
        playerNo: 'player1',
        pieceId: 'Z9',
        pos: 5,
        travelCount: 5,
      }),
    );
    expect(after.player1).toEqual(before.player1);
    expect(after.currentPosition).toEqual([]);
  });
});
