import {
  canPieceLeavePocket,
  canPieceMove,
  getNextPlayer,
  reachesHomeExactly,
  rollFairDice,
  rollWeightedDice,
} from '../ludoRules';

describe('fair dice', () => {
  it.each([1, 2, 3, 4, 5, 6])('can produce face %i', (face) => {
    expect(rollFairDice(() => (face - 0.5) / 6)).toBe(face);
  });

  it('rejects invalid random values rather than producing an invalid face', () => {
    expect(() => rollFairDice(() => 1)).toThrow(RangeError);
    expect(() => rollFairDice(() => -0.01)).toThrow(RangeError);
  });
});

describe('weighted Assist-mode dice', () => {
  const weights = [8, 10, 14, 18, 22, 28];

  it.each([
    [0, 1],
    [0.079, 1],
    [0.08, 2],
    [0.18, 3],
    [0.32, 4],
    [0.5, 5],
    [0.72, 6],
    [0.999, 6],
  ])('maps random sample %f to face %i', (sample, expected) => {
    expect(rollWeightedDice(weights, () => sample)).toBe(expected);
  });

  it('rejects invalid weights', () => {
    expect(() => rollWeightedDice([1, 2], () => 0.5)).toThrow(RangeError);
    expect(() => rollWeightedDice([1, 1, 1, 1, 1, -1], () => 0.5)).toThrow(RangeError);
    expect(() => rollWeightedDice([0, 0, 0, 0, 0, 0], () => 0.5)).toThrow(RangeError);
  });
});

describe('turn order', () => {
  it.each([
    [1, 2, 2], [2, 2, 1],
    [1, 3, 2], [2, 3, 3], [3, 3, 1],
    [1, 4, 2], [2, 4, 3], [3, 4, 4], [4, 4, 1],
  ])('moves player %i to next player for %i players -> %i', (current, count, next) => {
    expect(getNextPlayer(current, count)).toBe(next);
  });

  it('rejects invalid player counts and turn indices', () => {
    expect(() => getNextPlayer(1, 1)).toThrow(RangeError);
    expect(() => getNextPlayer(5, 4)).toThrow(RangeError);
  });
});

describe('piece movement constraints', () => {
  const pocketPiece = { id: 'A1', pos: 0, travelCount: 0 };
  const boardPiece = { id: 'A2', pos: 12, travelCount: 20 };
  const oneStepFromHome = { id: 'A3', pos: 116, travelCount: 56 };
  const homePiece = { id: 'A4', pos: 57, travelCount: 57 };

  it('only lets a pocket piece leave on a six', () => {
    expect(canPieceLeavePocket(pocketPiece, 5)).toBe(false);
    expect(canPieceLeavePocket(pocketPiece, 6)).toBe(true);
  });

  it('rejects pocket and already-home pieces as normal moves', () => {
    expect(canPieceMove(pocketPiece, 6)).toBe(false);
    expect(canPieceMove(homePiece, 1)).toBe(false);
  });

  it('allows a legal move but prevents overshooting home', () => {
    expect(canPieceMove(boardPiece, 6)).toBe(true);
    expect(canPieceMove(oneStepFromHome, 1)).toBe(true);
    expect(canPieceMove(oneStepFromHome, 2)).toBe(false);
  });

  it('identifies exact home arrivals', () => {
    expect(reachesHomeExactly(oneStepFromHome, 1)).toBe(true);
    expect(reachesHomeExactly(oneStepFromHome, 2)).toBe(false);
    expect(reachesHomeExactly(boardPiece, 6)).toBe(false);
  });
});
