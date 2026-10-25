/**
 * Pure, immutable Ludo engine.
 *
 * This is the single source of truth for movement, capture and win rules that
 * the AI and the simulator share. The Redux thunk uses `stepPosition` and the
 * same predicates from ludoRules so the UI and the simulator cannot diverge.
 */
import {
  safeSpots,
  starSpots,
  startingPoints,
  turningPoints,
  victoryStart,
} from '../helpers/PlotData';
import {
  HOME_TRAVEL_COUNT,
  canPieceLeavePocket,
  canPieceMove,
  getNextPlayer,
} from '../helpers/ludoRules';

export type Piece = {id: string; pos: number; travelCount: number};

export type GameModel = {
  /** players[0] is player 1 (Red) ... players[3] is player 4 (Blue). */
  players: Piece[][];
  playerCount: number;
};

export type MoveResult = {
  model: GameModel;
  captured: string | null;
  reachedHome: boolean;
  won: boolean;
  /** True for a six, a capture, or reaching home. */
  extraTurn: boolean;
};

const LETTERS = ['A', 'B', 'C', 'D'];

export const playerOfPiece = (pieceId: string): number =>
  pieceId.charCodeAt(0) - 64;

export function createModel(playerCount: number): GameModel {
  if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 4) {
    throw new RangeError('Player count must be 2, 3, or 4.');
  }
  return {
    playerCount,
    players: LETTERS.map(letter =>
      [1, 2, 3, 4].map(n => ({id: `${letter}${n}`, pos: 0, travelCount: 0})),
    ),
  };
}

/** One step along the board for the given player. Mirrors the thunk exactly. */
export function stepPosition(playerNo: number, pos: number): number {
  let path = pos + 1;
  if (turningPoints[playerNo - 1] === path) {
    path = victoryStart[playerNo - 1];
  }
  if (path === 53) {
    path = 1;
  }
  return path;
}

export const isSafeSquare = (pos: number): boolean =>
  safeSpots.includes(pos) || starSpots.includes(pos);

/** Legal moves for a dice value. Only one pocket piece is listed (they are equivalent). */
export function legalMoves(
  model: GameModel,
  playerNo: number,
  dice: number,
): Piece[] {
  const pieces = model.players[playerNo - 1];
  const moves = pieces.filter(p => canPieceMove(p, dice));
  const pocket = pieces.find(p => canPieceLeavePocket(p, dice));
  return pocket ? [pocket, ...moves] : moves;
}

const clone = (model: GameModel): GameModel => ({
  playerCount: model.playerCount,
  players: model.players.map(list => list.map(p => ({...p}))),
});

export function applyMove(
  model: GameModel,
  playerNo: number,
  pieceId: string,
  dice: number,
): MoveResult {
  const next = clone(model);
  const piece = next.players[playerNo - 1].find(p => p.id === pieceId);
  if (!piece) {
    throw new Error(`Unknown piece ${pieceId} for player ${playerNo}`);
  }

  let captured: string | null = null;

  if (piece.pos === 0) {
    if (!canPieceLeavePocket(piece, dice)) {
      throw new Error('Illegal move: pocket piece needs a six');
    }
    piece.pos = startingPoints[playerNo - 1];
    piece.travelCount = 1;
    return {
      model: next,
      captured: null,
      reachedHome: false,
      won: false,
      extraTurn: true,
    };
  }

  if (!canPieceMove(piece, dice)) {
    throw new Error('Illegal move: piece cannot move that far');
  }

  for (let i = 0; i < dice; i += 1) {
    piece.pos = stepPosition(playerNo, piece.pos);
    piece.travelCount += 1;
  }

  const enemiesHere = next.players
    .flat()
    .filter(
      p =>
        p.pos === piece.pos && playerOfPiece(p.id) !== playerNo && p.pos !== 0,
    );
  if (enemiesHere.length === 1 && !isSafeSquare(piece.pos)) {
    enemiesHere[0].pos = 0;
    enemiesHere[0].travelCount = 0;
    captured = enemiesHere[0].id;
  }

  const reachedHome = piece.travelCount === HOME_TRAVEL_COUNT;
  const won =
    reachedHome &&
    next.players[playerNo - 1].every(p => p.travelCount === HOME_TRAVEL_COUNT);

  return {
    model: next,
    captured,
    reachedHome,
    won,
    extraTurn: dice === 6 || captured !== null || reachedHome,
  };
}

/** Who rolls next after a turn. A win ends the game and keeps the same player. */
export function nextTurnPlayer(
  model: GameModel,
  playerNo: number,
  extraTurn: boolean,
): number {
  return extraTurn ? playerNo : getNextPlayer(playerNo, model.playerCount);
}

/** Opponent pieces that could hit `pos` with a single roll of 1-6 (shared track only). */
export function threatsAt(
  model: GameModel,
  playerNo: number,
  pos: number,
): number {
  if (pos < 1 || pos > 52 || isSafeSquare(pos)) {
    return 0;
  }
  let count = 0;
  for (let p = 1; p <= model.playerCount; p += 1) {
    if (p === playerNo) {
      continue;
    }
    for (const enemy of model.players[p - 1]) {
      if (enemy.pos < 1 || enemy.pos > 52) {
        continue;
      }
      const distance = (pos - enemy.pos + 52) % 52;
      if (distance >= 1 && distance <= 6) {
        count += 1;
      }
    }
  }
  return count;
}
