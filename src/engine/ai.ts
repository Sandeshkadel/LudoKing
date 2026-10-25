/**
 * Fair AI opponent.
 *
 * The AI only chooses WHICH piece to move. It never touches the dice, so it
 * cannot cheat; its dice are rolled by the same uniform roller as any human.
 * All randomness comes from an injectable RNG so decisions are reproducible.
 */
import {
  GameModel,
  Piece,
  applyMove,
  isSafeSquare,
  legalMoves,
  threatsAt,
} from './gameEngine';
import {victoryStart} from '../helpers/PlotData';

export type Difficulty = 'easy' | 'normal' | 'hard';

const isVictoryLane = (pos: number) =>
  victoryStart.some(s => pos >= s && pos < s + 6);

export function scoreMove(
  model: GameModel,
  playerNo: number,
  piece: Piece,
  dice: number,
): number {
  const result = applyMove(model, playerNo, piece.id, dice);
  const moved = result.model.players[playerNo - 1].find(
    p => p.id === piece.id,
  )!;
  let score = 0;

  if (result.won) {
    score += 100000;
  }
  if (result.reachedHome) {
    score += 600;
  }

  if (result.captured) {
    const victim = model.players.flat().find(p => p.id === result.captured)!;
    score += 350 + victim.travelCount * 4;
  }

  if (piece.pos === 0) {
    const onBoard = model.players[playerNo - 1].filter(
      p => p.pos !== 0 && p.travelCount < 57,
    ).length;
    score += onBoard === 0 ? 260 : 140;
  } else {
    score += dice * 3 + moved.travelCount * 0.6;
  }

  if (isVictoryLane(moved.pos) && !isVictoryLane(piece.pos)) {
    score += 90;
  }
  if (isSafeSquare(moved.pos) && !isSafeSquare(piece.pos)) {
    score += 45;
  }

  // Rescue a threatened piece; avoid walking into danger.
  const before = threatsAt(model, playerNo, piece.pos);
  const after = threatsAt(result.model, playerNo, moved.pos);
  if (before > 0 && after === 0) {
    score += 120 + piece.travelCount * 2;
  }
  if (after > 0) {
    score -= 150 * after + moved.travelCount * 2;
  }

  return score;
}

export function chooseMove(
  model: GameModel,
  playerNo: number,
  dice: number,
  random: () => number = Math.random,
  difficulty: Difficulty = 'hard',
): Piece | null {
  const moves = legalMoves(model, playerNo, dice);
  if (moves.length === 0) {
    return null;
  }
  if (moves.length === 1) {
    return moves[0];
  }

  const randomPick = () => moves[Math.floor(random() * moves.length)];
  if (difficulty === 'easy' && random() < 0.6) {
    return randomPick();
  }
  if (difficulty === 'normal' && random() < 0.15) {
    return randomPick();
  }

  let best = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    // A tiny seeded jitter breaks ties reproducibly.
    const score = scoreMove(model, playerNo, move, dice) + random() * 0.01;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}
