/**
 * Drives complete games through the REAL reducers and thunks (no UI), the same
 * way taps and timers do in the app. Verifies every seat gets its dice, no input
 * lock sticks, and Winner Mode ends with the selected colour winning.
 */
import {configureStore} from '@reduxjs/toolkit';
import {
  gameReducer,
  resetGame,
  setAiPlayers,
  setCheatMode,
  setPlayerCount,
} from '../gameSlice';
import {handleForwardThunk} from '../gameActions';
import {playTurnThunk} from '../turnThunk';
import {chooseMove} from '../../../engine/ai';
import {toModel} from '../turnThunk';
import {seatRole} from '../../../helpers/seatRole';
import {seededRandom} from '../../../engine/simulator';

const makeStore = () => configureStore({reducer: {game: gameReducer}});

type Setup = {
  players: number;
  ai?: number[];
  cheat?: {enabled: boolean; favoredPlayer: number; guaranteed?: boolean};
  seed: number;
};

async function playFullGame({players, ai = [], cheat, seed}: Setup) {
  const store = makeStore();
  const random = seededRandom(seed);
  store.dispatch(setPlayerCount(players));
  store.dispatch(setAiPlayers(ai));
  if (cheat) {
    store.dispatch(setCheatMode(cheat));
  }
  store.dispatch(resetGame());

  const turnsBySeat: Record<number, number> = {};
  const noDelay = async () => undefined;
  let guard = 0;

  while (store.getState().game.winner === null) {
    guard += 1;
    if (guard > 30000) {
      throw new Error('game did not finish');
    }
    const game = store.getState().game;
    const seat = game.chancePlayer;
    expect(seat).toBeGreaterThanOrEqual(1);
    expect(seat).toBeLessThanOrEqual(players);

    if (game.touchDiceBlock) {
      // A human seat is waiting for a piece tap. A selection must be open, otherwise input is stuck.
      const waitingSeat = Math.max(
        game.pileSelectionPlayer,
        game.cellSelectionPlayer,
      );
      expect(waitingSeat).toBe(seat);
      const pick = chooseMove(
        toModel(game),
        seat,
        game.diceNo,
        random,
        'normal',
      );
      expect(pick).not.toBeNull();
      await store.dispatch(
        handleForwardThunk(seat, pick!.id, pick!.pos) as any,
      );
    } else {
      turnsBySeat[seat] = (turnsBySeat[seat] ?? 0) + 1;
      const rolled = await store.dispatch(
        playTurnThunk(seat, {random, delayFn: noDelay}) as any,
      );
      expect(rolled).toBe(true);
    }
  }
  return {winner: store.getState().game.winner as number, turnsBySeat, store};
}

beforeAll(() => {
  // Run the move animation delays instantly.
  jest.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
    fn();
    return 0 as unknown as NodeJS.Timeout;
  }) as typeof setTimeout);
});
afterAll(() => jest.restoreAllMocks());

describe('real-store full games', () => {
  it.each([2, 3, 4])(
    '%i human seats: every seat gets its dice and the game finishes',
    async n => {
      const {winner, turnsBySeat} = await playFullGame({
        players: n,
        seed: 100 + n,
      });
      expect(winner).toBeGreaterThanOrEqual(1);
      for (let seat = 1; seat <= n; seat += 1) {
        expect(turnsBySeat[seat]).toBeGreaterThan(5);
      }
    },
  );

  it('computer seats roll and play on their own alongside humans', async () => {
    const {turnsBySeat} = await playFullGame({players: 4, ai: [2, 4], seed: 7});
    [1, 2, 3, 4].forEach(seat => expect(turnsBySeat[seat]).toBeGreaterThan(5));
  });

  it.each([
    [2, 1],
    [2, 2],
    [3, 1],
    [3, 3],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ])(
    'Winner Mode, %i players, colour %i wins and other seats still roll',
    async (n, favored) => {
      for (let seed = 1; seed <= 3; seed += 1) {
        const {winner, turnsBySeat} = await playFullGame({
          players: n,
          cheat: {enabled: true, favoredPlayer: favored, guaranteed: true},
          seed: seed * 31 + n * 7 + favored,
        });
        expect(winner).toBe(favored);
        for (let seat = 1; seat <= n; seat += 1) {
          expect(turnsBySeat[seat]).toBeGreaterThan(3);
        }
      }
    },
  );

  it('classifies seats: winner is steered, opponents are home-gated, nobody else is touched', () => {
    const base = {playerCount: 4, aiPlayers: [] as number[]};
    const cheat = {enabled: true, favoredPlayer: 3, guaranteed: true};
    expect(seatRole({...base, cheatMode: cheat}, 3)).toMatchObject({
      winner: true,
      gated: false,
      auto: false,
    });
    [1, 2, 4].forEach(seat =>
      expect(seatRole({...base, cheatMode: cheat}, seat)).toMatchObject({
        winner: false,
        gated: true,
        auto: false,
      }),
    );
    expect(
      seatRole({...base, cheatMode: {enabled: false, favoredPlayer: 0}}, 1)
        .gated,
    ).toBe(false);
    expect(
      seatRole(
        {
          ...base,
          cheatMode: {enabled: true, favoredPlayer: 3, guaranteed: false},
        },
        1,
      ).gated,
    ).toBe(false);
  });

  it('in Winner Mode no opponent ever has more pieces home than the winner', async () => {
    const store = makeStore();
    const random = seededRandom(5);
    store.dispatch(setPlayerCount(4));
    store.dispatch(
      setCheatMode({enabled: true, favoredPlayer: 2, guaranteed: true}),
    );
    store.dispatch(resetGame());
    const homes = (key: 'player1' | 'player2' | 'player3' | 'player4') =>
      store.getState().game[key].filter(p => p.travelCount === 57).length;
    let guard = 0;
    while (store.getState().game.winner === null && guard < 30000) {
      guard += 1;
      const g = store.getState().game;
      if (g.touchDiceBlock) {
        const pick = chooseMove(
          toModel(g),
          g.chancePlayer,
          g.diceNo,
          random,
          'easy',
        );
        await store.dispatch(
          handleForwardThunk(g.chancePlayer, pick!.id, pick!.pos) as any,
        );
      } else {
        await store.dispatch(
          playTurnThunk(g.chancePlayer, {
            random,
            delayFn: async () => undefined,
          }) as any,
        );
      }
      const winnerHome = homes('player2');
      expect(homes('player1')).toBeLessThanOrEqual(winnerHome);
      expect(homes('player3')).toBeLessThanOrEqual(winnerHome);
      expect(homes('player4')).toBeLessThanOrEqual(winnerHome);
    }
    expect(store.getState().game.winner).toBe(2);
  });
});
