/**
 * Winner Mode session.
 *
 * A session is created from Settings with two required whole numbers:
 *   - games:  how many games the selected colour plays under Winner Mode today
 *   - losses: how many of those games the selected colour must LOSE
 * The losing games are placed at random positions in the schedule when the
 * session starts. When the last scheduled game is finished the session ends and
 * Winner Mode is locked for LOCK_MS (10 hours).
 *
 * Everything here is pure (the clock and the random source are injected) so it
 * is fully unit-testable and safe to use inside Redux reducers.
 */
export const LOCK_MS = 10 * 60 * 60 * 1000;
export const MAX_SESSION_GAMES = 99;

export type WinnerSession = {
  /** A session is running (Winner Mode may be switched on / paused). */
  active: boolean;
  /** Selected colour, seat 1-4. */
  colour: number;
  gamesPlanned: number;
  lossesPlanned: number;
  /** schedule[i] === true means the selected colour loses game i. */
  schedule: boolean[];
  /** Games finished under this session (a finished game has a winner). */
  gamesPlayed: number;
  /** Epoch ms until which a new session cannot start. 0 = not locked. */
  lockedUntil: number;
  /** Epoch ms when the lock began (used to detect a clock set backwards). */
  lockedAt: number;
};

export const emptySession = (): WinnerSession => ({
  active: false,
  colour: 0,
  gamesPlanned: 0,
  lossesPlanned: 0,
  schedule: [],
  gamesPlayed: 0,
  lockedUntil: 0,
  lockedAt: 0,
});

export type Validation = {ok: true} | {ok: false; error: string};

const isWhole = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n);

export function validateSessionInput(
  games: unknown,
  losses: unknown,
  playerCount = 4,
  colour = 1,
): Validation {
  if (!isWhole(games) || games < 1) {
    return {
      ok: false,
      error: 'Enter how many games you will play (1 or more).',
    };
  }
  if (games > MAX_SESSION_GAMES) {
    return {ok: false, error: `Games must be ${MAX_SESSION_GAMES} or fewer.`};
  }
  if (!isWhole(losses) || losses < 0) {
    return {ok: false, error: 'Enter how many games to lose (0 or more).'};
  }
  if (losses > games) {
    return {
      ok: false,
      error: 'Games to lose cannot be more than games to play.',
    };
  }
  if (!isWhole(colour) || colour < 1 || colour > playerCount) {
    return {ok: false, error: 'Pick a colour that is playing.'};
  }
  return {ok: true};
}

/** Fisher-Yates: exactly `losses` true values at random positions. */
export function buildSchedule(
  games: number,
  losses: number,
  random: () => number = Math.random,
): boolean[] {
  const schedule = Array.from({length: games}, (_, i) => i < losses);
  for (let i = schedule.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [schedule[i], schedule[j]] = [schedule[j], schedule[i]];
  }
  return schedule;
}

export const lockRemainingMs = (s: WinnerSession, now: number): number => {
  if (s.lockedUntil <= 0) {
    return 0;
  }
  // Clock moved backwards since the lock began: treat the lock as full length.
  if (now < s.lockedAt) {
    return LOCK_MS;
  }
  return Math.max(0, s.lockedUntil - now);
};

export const isLocked = (s: WinnerSession, now: number): boolean =>
  lockRemainingMs(s, now) > 0;

export function startSession(
  prev: WinnerSession,
  colour: number,
  games: number,
  losses: number,
  now: number,
  random: () => number = Math.random,
  playerCount = 4,
): WinnerSession {
  const check = validateSessionInput(games, losses, playerCount, colour);
  if (!check.ok) {
    throw new RangeError(check.error);
  }
  if (isLocked(prev, now)) {
    throw new Error('Winner Mode is locked.');
  }
  return {
    active: true,
    colour,
    gamesPlanned: games,
    lossesPlanned: losses,
    schedule: buildSchedule(games, losses, random),
    gamesPlayed: 0,
    lockedUntil: 0,
    lockedAt: 0,
  };
}

export const gamesRemaining = (s: WinnerSession): number =>
  Math.max(0, s.gamesPlanned - s.gamesPlayed);

/** Outcome planned for the game being played now, or null when no session is running. */
export function currentOutcome(s: WinnerSession): 'win' | 'lose' | null {
  if (!s.active || s.gamesPlayed >= s.gamesPlanned) {
    return null;
  }
  return s.schedule[s.gamesPlayed] ? 'lose' : 'win';
}

/** Count one finished game. Ends the session and starts the lock after the last one. */
export function recordGameFinished(
  s: WinnerSession,
  now: number,
): WinnerSession {
  if (!s.active || s.gamesPlayed >= s.gamesPlanned) {
    return s;
  }
  const gamesPlayed = s.gamesPlayed + 1;
  if (gamesPlayed >= s.gamesPlanned) {
    return {
      ...s,
      gamesPlayed,
      active: false,
      lockedUntil: now + LOCK_MS,
      lockedAt: now,
    };
  }
  return {...s, gamesPlayed};
}

export function formatRemaining(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
