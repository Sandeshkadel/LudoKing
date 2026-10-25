/**
 * Winner Mode dice.
 *
 * Winner Mode is an openly labelled, host-selected result: the app shows a red
 * "WINNER MODE ON" label for the whole match. Only the selected colour's dice are
 * steered; every other seat keeps rolling uniform dice. The steering is shaped to
 * look like normal play (varied faces, no long runs of sixes).
 */
import {scoreMove} from './ai';
import {GameModel, legalMoves} from './gameEngine';
import {HOME_TRAVEL_COUNT, rollWeightedDice} from '../helpers/ludoRules';

const BASE_WEIGHTS = [8, 10, 14, 18, 22, 28];
export const MAX_SIX_STREAK = 2;

const remaining = (model: GameModel, seat: number): number =>
  model.players[seat - 1].reduce(
    (sum, p) => sum + (HOME_TRAVEL_COUNT - p.travelCount),
    0,
  );

/** How far the winner seat trails the best opponent, in board steps (negative = ahead). */
export function raceGap(model: GameModel, seat: number): number {
  let best = Infinity;
  for (let p = 1; p <= model.playerCount; p += 1) {
    if (p !== seat) {
      best = Math.min(best, remaining(model, p));
    }
  }
  return remaining(model, seat) - best;
}

/** Value of rolling `face` for the winner seat right now. */
function faceValue(model: GameModel, seat: number, face: number): number {
  const moves = legalMoves(model, seat, face);
  if (moves.length === 0) {
    return face === 6 ? 5 : 0;
  }
  return Math.max(...moves.map(m => scoreMove(model, seat, m, face)));
}

export function rollWinnerDice(
  model: GameModel,
  seat: number,
  random: () => number = Math.random,
  sixStreak = 0,
): number {
  const gap = raceGap(model, seat);
  // More steering the more the winner seat is behind (or an opponent is close to finishing).
  let pressure = Math.min(1, Math.max(0.55, 0.7 + gap / 80));
  const opponentClose = Math.min(
    ...Array.from({length: model.playerCount}, (_, i) => i + 1)
      .filter(p => p !== seat)
      .map(p => remaining(model, p)),
  );
  if (opponentClose <= 40) {
    pressure = 1;
  }

  const allowSix = sixStreak < MAX_SIX_STREAK;
  const faces = [1, 2, 3, 4, 5, 6].filter(f => allowSix || f !== 6);

  let face: number;
  if (random() < pressure) {
    const ranked = faces
      .map(f => ({f, v: faceValue(model, seat, f)}))
      .sort((a, b) => b.v - a.v);
    // Mostly the best face, sometimes the runner-up, so sequences look natural.
    face = ranked.length > 1 && random() < 0.25 ? ranked[1].f : ranked[0].f;
  } else {
    face = rollWeightedDice(BASE_WEIGHTS, random);
    if (!allowSix && face === 6) {
      face = 1 + Math.floor(random() * 5);
    }
  }
  return face;
}

// ───────────────────────── Winner Mode: home gate ─────────────────────────

/** Number of pieces a seat already has home. */
export const homeCount = (model: GameModel, seat: number): number =>
  model.players[seat - 1].filter(p => p.travelCount === HOME_TRAVEL_COUNT)
    .length;

/**
 * Faces an opponent may not roll in Winner Mode: a face that would bring one of
 * its pieces home while that would put it ahead of the winner seat's home count.
 * With 0 pieces home the winner seat blocks every finishing face; each piece the
 * winner brings home lets opponents finish one.
 */
export function blockedFaces(
  model: GameModel,
  seat: number,
  winnerSeat: number,
): number[] {
  if (seat === winnerSeat) {
    return [];
  }
  if (homeCount(model, seat) + 1 <= homeCount(model, winnerSeat)) {
    return [];
  }
  const blocked = new Set<number>();
  for (const piece of model.players[seat - 1]) {
    const need = HOME_TRAVEL_COUNT - piece.travelCount;
    if (piece.pos !== 0 && need >= 1 && need <= 6) {
      blocked.add(need);
    }
  }
  return [...blocked];
}

/** Uniform dice for an opponent, excluding the blocked finishing faces. */
export function rollGatedDice(
  model: GameModel,
  seat: number,
  winnerSeat: number,
  random: () => number = Math.random,
): number {
  const blocked = blockedFaces(model, seat, winnerSeat);
  const allowed = [1, 2, 3, 4, 5, 6].filter(f => !blocked.includes(f));
  const pool = allowed.length > 0 ? allowed : [1, 2, 3, 4, 5, 6];
  return pool[Math.floor(random() * pool.length)];
}
