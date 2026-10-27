import {initialState} from '$redux/initialState';
import {createSlice} from '@reduxjs/toolkit';
import type {PlayerKey} from '$helpers/playerKeys';
import {newDiceSeed, mulberry32} from '$helpers/diceRng';
import {
  WinnerSession,
  currentOutcome,
  emptySession,
  isLocked,
  recordGameFinished,
  startSession,
  validateSessionInput,
} from '../../engine/session';

/** A game is under way as soon as any piece has left its pocket. */
export const isGameInProgress = (state: {
  player1: PLAYER_PIECE[];
  player2: PLAYER_PIECE[];
  player3: PLAYER_PIECE[];
  player4: PLAYER_PIECE[];
}): boolean =>
  [state.player1, state.player2, state.player3, state.player4].some(list =>
    list.some(p => p.pos !== 0),
  );

/** Cheat-mode value for the game that is about to be played under `session`. */
const cheatFor = (
  cheat: CHEAT_MODE,
  session: WinnerSession,
  now: number,
): CHEAT_MODE => {
  if (!cheat.enabled || cheat.guaranteed !== true) {
    return cheat;
  }
  const outcome = currentOutcome(session);
  if (!outcome || isLocked(session, now)) {
    return {enabled: false, favoredPlayer: 0};
  }
  return {
    enabled: true,
    favoredPlayer: session.colour,
    guaranteed: true,
    result: outcome,
  };
};

const gameSlice = createSlice({
  name: 'game',
  initialState: initialState,
  reducers: {
    resetGame: state => ({
      ...initialState,
      // ── Preserved across restarts ──────────────
      cheatMode: state.cheatMode, // demo/normal mode + favoured colour
      winnerSession: state.winnerSession ?? emptySession(), // games / losses / 10h lock
      diceSeed: newDiceSeed(), // a different dice sequence every game
      playerNames: state.playerNames, // chosen player names
      playerCount: state.playerCount, // 2 / 3 / 4 players
      aiPlayers: state.aiPlayers ?? [], // computer-controlled seats
      aiDifficulty: state.aiDifficulty ?? 'hard',
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
    disableTouch: state => {
      state.touchDiceBlock = true;
      state.pileSelectionPlayer = -1;
      state.cellSelectionPlayer = -1;
    },
    unfreezeDice: state => {
      state.touchDiceBlock = false;
      state.isDiceRolled = false;
      state.pileSelectionPlayer = -1;
      state.cellSelectionPlayer = -1;
    },
    updateFireworks: (state, action) => {
      state.fireworks = action.payload;
    },
    announceWinner: {
      reducer: (state, action: {payload: any; meta?: {now: number}}) => {
        const alreadyOver = state.winner !== null && state.winner !== undefined;
        state.winner = action.payload;
        // Count a finished game once, and only while Winner Mode is on.
        if (
          typeof action.payload === 'number' &&
          !alreadyOver &&
          state.cheatMode.enabled &&
          state.cheatMode.guaranteed === true &&
          state.winnerSession?.active
        ) {
          const now = action.meta?.now ?? Date.now();
          state.winnerSession = recordGameFinished(state.winnerSession, now);
          state.cheatMode = cheatFor(state.cheatMode, state.winnerSession, now);
          if (!state.winnerSession.active) {
            // Session finished: Winner Mode switches off and locks for 10 hours.
            state.cheatMode = {enabled: false, favoredPlayer: 0};
          }
        }
      },
      prepare: (winner: any) => ({
        payload: winner,
        meta: {now: Date.now()},
      }),
    },
    startWinnerSession: {
      reducer: (
        state,
        action: {
          payload: {colour: number; games: number; losses: number};
          meta: {now: number; seed: number};
        },
      ) => {
        const {colour, games, losses} = action.payload;
        const session = state.winnerSession ?? emptySession();
        const valid = validateSessionInput(
          games,
          losses,
          state.playerCount,
          colour,
        );
        if (
          !valid.ok ||
          isLocked(session, action.meta.now) ||
          isGameInProgress(state)
        ) {
          return;
        }
        state.winnerSession = startSession(
          session,
          colour,
          games,
          losses,
          action.meta.now,
          mulberry32(action.meta.seed),
          state.playerCount,
        );
        state.cheatMode = cheatFor(
          {enabled: true, favoredPlayer: colour, guaranteed: true},
          state.winnerSession,
          action.meta.now,
        );
      },
      prepare: (payload: {colour: number; games: number; losses: number}) => ({
        payload,
        meta: {now: Date.now(), seed: newDiceSeed()},
      }),
    },
    /** Switch the Winner Mode colour. Only allowed before a game has started. */
    setWinnerColour: (state, action) => {
      const colour = Number(action.payload);
      const session = state.winnerSession;
      if (
        !session?.active ||
        isGameInProgress(state) ||
        !Number.isInteger(colour) ||
        colour < 1 ||
        colour > state.playerCount
      ) {
        return;
      }
      state.winnerSession = {...session, colour};
      if (state.cheatMode.enabled && state.cheatMode.guaranteed) {
        state.cheatMode.favoredPlayer = colour;
      }
    },
    /** Turn Winner Mode back on inside a running session (never while locked). */
    resumeWinnerMode: {
      reducer: (state, action: {payload: undefined; meta: {now: number}}) => {
        const session = state.winnerSession;
        if (
          !session?.active ||
          isLocked(session, action.meta.now) ||
          isGameInProgress(state)
        ) {
          return;
        }
        state.cheatMode = cheatFor(
          {enabled: true, favoredPlayer: session.colour, guaranteed: true},
          session,
          action.meta.now,
        );
      },
      prepare: () => ({payload: undefined, meta: {now: Date.now()}}),
    },
    advanceRoll: state => {
      state.rollCount = (state.rollCount ?? 0) + 1;
    },
    updatePlayerChance: (state, action) => {
      state.chancePlayer = action.payload.chancePlayer;
      state.touchDiceBlock = false;
      state.isDiceRolled = false;
      state.pileSelectionPlayer = -1;
      state.cellSelectionPlayer = -1;
    },
    setPlayerNames: (state, action) => {
      state.playerNames = action.payload;
    },
    setPlayerCount: (state, action) => {
      const playerCount = action.payload;
      if (![2, 3, 4].includes(playerCount)) {
        return;
      }
      state.playerCount = playerCount;

      const session = state.winnerSession;
      if (session?.active && session.colour < 1) {
        session.colour = 1;
      }
      if (session && session.colour > playerCount) {
        session.colour = playerCount;
      }

      if (state.cheatMode.enabled && state.cheatMode.guaranteed === true) {
        if (!session?.active) {
          state.cheatMode = {enabled: false, favoredPlayer: 0};
        } else {
          state.cheatMode.favoredPlayer = session.colour;
        }
      } else if (state.cheatMode.enabled) {
        state.cheatMode.favoredPlayer = Math.max(
          1,
          Math.min(state.cheatMode.favoredPlayer || 1, playerCount),
        );
      }
    },
    setCheatMode: (state, action) => {
      const next: CHEAT_MODE = action.payload;
      // Winner Mode can only be on inside a running Winner Mode session.
      if (next.enabled && next.guaranteed === true) {
        const session = state.winnerSession;
        if (!session?.active) {
          return;
        }
        state.cheatMode = cheatFor(
          {...next, favoredPlayer: session.colour},
          session,
          Date.now(),
        );
        return;
      }
      state.cheatMode = {...next, result: undefined};
    },
    setAiPlayers: (state, action) => {
      // Keep only valid, unique seat numbers 1-4.
      const seats: number[] = Array.isArray(action.payload)
        ? action.payload
        : [];
      state.aiPlayers = Array.from(
        new Set(seats.filter(n => Number.isInteger(n) && n >= 1 && n <= 4)),
      );
    },
    setSixStreak: (state, action) => {
      state.sixStreak = Math.max(0, Math.floor(Number(action.payload) || 0));
    },
    setAiDifficulty: (state, action) => {
      if (['easy', 'normal', 'hard'].includes(action.payload)) {
        state.aiDifficulty = action.payload;
      }
    },
    updatePlayerPieceValue: (state, action) => {
      const {playerNo, pieceId, pos, travelCount} = action.payload;
      const playerPieces: PLAYER_PIECE[] = state[playerNo as PlayerKey];
      const piece = playerPieces.find(p => p.id === pieceId);
      state.pileSelectionPlayer = -1;
      state.cellSelectionPlayer = -1;

      if (piece) {
        piece.pos = pos;
        piece.travelCount = travelCount;
        const currentPositionIdx = state.currentPosition.findIndex(
          (p: any) => p.id === pieceId,
        );

        if (pos === 0) {
          if (currentPositionIdx !== -1) {
            state.currentPosition.splice(currentPositionIdx, 1);
          }
        } else {
          if (currentPositionIdx !== -1) {
            state.currentPosition[currentPositionIdx] = {id: pieceId, pos};
          } else {
            state.currentPosition.push({id: pieceId, pos});
          }
        }
      }
    },
  },
});

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
  setCheatMode,
  setAiPlayers,
  setAiDifficulty,
  setSixStreak,
  startWinnerSession,
  setWinnerColour,
  resumeWinnerMode,
  advanceRoll,
} = gameSlice.actions;
export const gameReducer = gameSlice.reducer;
