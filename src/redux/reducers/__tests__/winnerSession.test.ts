/**
 * Plays whole Winner Mode sessions through the REAL reducers and thunks.
 */
import {configureStore} from '@reduxjs/toolkit';
import {
  gameReducer,
  announceWinner,
  resetGame,
  resumeWinnerMode,
  setCheatMode,
  setPlayerCount,
  setWinnerColour,
  startWinnerSession,
} from '../gameSlice';
import {handleForwardThunk} from '../gameActions';
import {playTurnThunk, toModel} from '../turnThunk';
import {chooseMove} from '../../../engine/ai';
import {seededRandom} from '../../../engine/simulator';
import {LOCK_MS} from '../../../engine/session';

const makeStore = () => configureStore({reducer: {game: gameReducer}});
type Store = ReturnType<typeof makeStore>;

async function playOneGame(store: Store, random: () => number) {
  let guard = 0;
  while (store.getState().game.winner === null) {
    guard += 1;
    if (guard > 40000) {
      throw new Error('game did not finish');
    }
    const g = store.getState().game;
    if (g.touchDiceBlock) {
      const pick = chooseMove(
        toModel(g),
        g.chancePlayer,
        g.diceNo,
        random,
        'hard',
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
  }
  return store.getState().game.winner as number;
}

const nextGame = (store: Store) => {
  store.dispatch(resetGame());
  store.dispatch(announceWinner(null));
};

describe('Winner Mode session (real store)', () => {
  // Run the move animation delays instantly.
  beforeAll(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void) => {
      fn();
      return 0;
    }) as unknown as typeof setTimeout);
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('7 games / 3 losses: colour loses exactly 3, wins 4, then locks; colour can change between games', async () => {
    const store = makeStore();
    const random = seededRandom(77);
    store.dispatch(setPlayerCount(4));
    store.dispatch(resetGame());
    store.dispatch(startWinnerSession({colour: 1, games: 7, losses: 3}));
    const schedule = [...store.getState().game.winnerSession.schedule];
    expect(schedule.filter(Boolean)).toHaveLength(3);

    let won = 0;
    let lost = 0;
    for (let i = 0; i < 7; i += 1) {
      const s = store.getState().game;
      expect(s.cheatMode.enabled).toBe(true);
      expect(s.cheatMode.result).toBe(schedule[i] ? 'lose' : 'win');
      // switch colour before the game starts (between games), including game 1
      const colour = (i % 4) + 1;
      store.dispatch(setWinnerColour(colour));
      expect(store.getState().game.cheatMode.favoredPlayer).toBe(colour);

      const winner = await playOneGame(store, random);
      if (schedule[i]) {
        expect(winner).not.toBe(colour);
        lost += 1;
      } else {
        expect(winner).toBe(colour);
        won += 1;
      }
      expect(store.getState().game.winnerSession.gamesPlayed).toBe(i + 1);
      nextGame(store);
    }
    expect(won).toBe(4);
    expect(lost).toBe(3);

    const end = store.getState().game;
    expect(end.winnerSession.active).toBe(false);
    expect(end.cheatMode.enabled).toBe(false);
    // locked: cannot start or resume
    store.dispatch(startWinnerSession({colour: 1, games: 2, losses: 0}));
    expect(store.getState().game.cheatMode.enabled).toBe(false);
    store.dispatch(
      setCheatMode({enabled: true, favoredPlayer: 1, guaranteed: true}),
    );
    expect(store.getState().game.cheatMode.enabled).toBe(false);
    expect(end.winnerSession.lockedUntil - end.winnerSession.lockedAt).toBe(
      LOCK_MS,
    );
  }, 120000);

  it('refuses to switch colour or start while a game is under way', async () => {
    const store = makeStore();
    store.dispatch(setPlayerCount(4));
    store.dispatch(resetGame());
    store.dispatch(startWinnerSession({colour: 1, games: 3, losses: 1}));
    // roll until a piece has left a pocket
    const random = seededRandom(5);
    let guard = 0;
    const out = () =>
      (['player1', 'player2', 'player3', 'player4'] as const).some(k =>
        store.getState().game[k].some(p => p.pos !== 0),
      );
    while (!out() && guard < 500) {
      guard += 1;
      const g = store.getState().game;
      if (g.touchDiceBlock) {
        const pick = chooseMove(
          toModel(g),
          g.chancePlayer,
          g.diceNo,
          random,
          'hard',
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
    }
    expect(out()).toBe(true);
    store.dispatch(setWinnerColour(3));
    expect(store.getState().game.cheatMode.favoredPlayer).toBe(1);
    expect(store.getState().game.winnerSession.colour).toBe(1);
  });

  it('rejects invalid numbers and Winner Mode without a session', () => {
    const store = makeStore();
    store.dispatch(setPlayerCount(4));
    store.dispatch(startWinnerSession({colour: 1, games: 3, losses: 4}));
    expect(store.getState().game.winnerSession.active).toBe(false);
    store.dispatch(
      setCheatMode({enabled: true, favoredPlayer: 1, guaranteed: true}),
    );
    expect(store.getState().game.cheatMode.enabled).toBe(false);
  });

  it('pausing (Normal) does not count games; resuming continues the same session', async () => {
    const store = makeStore();
    const random = seededRandom(9);
    store.dispatch(setPlayerCount(2));
    store.dispatch(resetGame());
    store.dispatch(startWinnerSession({colour: 1, games: 2, losses: 0}));
    store.dispatch(setCheatMode({enabled: false, favoredPlayer: 0}));
    await playOneGame(store, random);
    expect(store.getState().game.winnerSession.gamesPlayed).toBe(0);
    nextGame(store);
    store.dispatch(resumeWinnerMode());
    expect(store.getState().game.cheatMode.enabled).toBe(true);
    expect(await playOneGame(store, random)).toBe(1);
    expect(store.getState().game.winnerSession.gamesPlayed).toBe(1);
  }, 60000);

  it('different games get different dice seeds', () => {
    const store = makeStore();
    const seeds = new Set<number>();
    for (let i = 0; i < 20; i += 1) {
      store.dispatch(resetGame());
      seeds.add(store.getState().game.diceSeed);
    }
    expect(seeds.size).toBeGreaterThan(18);
  });
});
