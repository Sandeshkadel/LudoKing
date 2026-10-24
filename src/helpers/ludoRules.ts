/**
 * Pure Ludo rules helpers.
 *
 * Keeping dice and movement eligibility calculations free of UI/Redux side
 * effects makes the rules deterministic and testable.
 */
export type PiecePosition = {
  id: string;
  pos: number;
  travelCount: number;
};

export const DICE_FACES = [1, 2, 3, 4, 5, 6] as const;
export const HOME_TRAVEL_COUNT = 57;

export function rollFairDice(random: () => number = Math.random): number {
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('Random source must return a number in [0, 1).');
  }
  return Math.floor(sample * 6) + 1;
}

/** Return a 1-indexed weighted face. Every weight must be finite and non-negative. */
export function rollWeightedDice(
  weights: number[],
  random: () => number = Math.random,
): number {
  if (weights.length !== 6 || weights.some((weight) => !Number.isFinite(weight) || weight < 0)) {
    throw new RangeError('Weighted dice requires exactly six finite, non-negative weights.');
  }
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    throw new RangeError('At least one dice weight must be greater than zero.');
  }
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('Random source must return a number in [0, 1).');
  }
  let threshold = sample * total;
  for (let index = 0; index < weights.length; index += 1) {
    threshold -= weights[index];
    if (threshold < 0) return index + 1;
  }
  // Floating-point safety; random() is strictly less than 1.
  return 6;
}

export function getNextPlayer(currentPlayer: number, playerCount: number): number {
  if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 4) {
    throw new RangeError('Player count must be 2, 3, or 4.');
  }
  if (!Number.isInteger(currentPlayer) || currentPlayer < 1 || currentPlayer > playerCount) {
    throw new RangeError('Current player must be within the configured player count.');
  }
  return currentPlayer === playerCount ? 1 : currentPlayer + 1;
}

export function canPieceMove(piece: PiecePosition, dice: number): boolean {
  if (!DICE_FACES.includes(dice as (typeof DICE_FACES)[number])) return false;
  if (piece.pos === 0 || piece.travelCount < 1 || piece.travelCount >= HOME_TRAVEL_COUNT) return false;
  return piece.travelCount + dice <= HOME_TRAVEL_COUNT;
}

export function canPieceLeavePocket(piece: PiecePosition, dice: number): boolean {
  return piece.pos === 0 && piece.travelCount === 0 && dice === 6;
}

export function reachesHomeExactly(piece: PiecePosition, dice: number): boolean {
  return canPieceMove(piece, dice) && piece.travelCount + dice === HOME_TRAVEL_COUNT;
}
