import {
  applyMove,
  createModel,
  legalMoves,
  nextTurnPlayer,
  stepPosition,
  threatsAt,
} from '../gameEngine';

const setPiece = (
  model: ReturnType<typeof createModel>,
  id: string,
  pos: number,
  travelCount: number,
) => {
  model.players.flat().find(p => p.id === id)!.pos = pos;
  model.players.flat().find(p => p.id === id)!.travelCount = travelCount;
};

describe('board paths', () => {
  it.each([1, 2, 3, 4])(
    'player %i walks exactly 57 steps from start to home',
    playerNo => {
      const model = createModel(4);
      let pos = [1, 14, 27, 40][playerNo - 1];
      const seen = new Set<number>([pos]);
      for (let travel = 1; travel < 57; travel += 1) {
        pos = stepPosition(playerNo, pos);
        expect(seen.has(pos)).toBe(false);
        seen.add(pos);
      }
      expect(model.playerCount).toBe(4);
      expect(seen.size).toBe(57);
    },
  );

  it('wraps from 52 to 1 without losing travel count', () => {
    const model = createModel(2);
    setPiece(model, 'B1', 52, 39);
    const {model: next} = applyMove(model, 2, 'B1', 2);
    const piece = next.players[1].find(p => p.id === 'B1')!;
    expect(piece.pos).toBe(2);
    expect(piece.travelCount).toBe(41);
  });

  it('enters the player victory lane at the turning point', () => {
    const model = createModel(2);
    setPiece(model, 'A1', 50, 50);
    const {model: next} = applyMove(model, 1, 'A1', 3);
    expect(next.players[0][0].pos).toBe(111 + 1);
  });
});

describe('pocket and legality', () => {
  it('only lets a pocket piece out on a six, onto its own start square', () => {
    const model = createModel(4);
    expect(legalMoves(model, 3, 5)).toHaveLength(0);
    const moves = legalMoves(model, 3, 6);
    expect(moves).toHaveLength(1);
    const {model: next, extraTurn} = applyMove(model, 3, moves[0].id, 6);
    expect(next.players[2][0]).toMatchObject({pos: 27, travelCount: 1});
    expect(extraTurn).toBe(true);
  });

  it('rejects overshoot with no state mutation', () => {
    const model = createModel(2);
    setPiece(model, 'A1', 116, 57);
    setPiece(model, 'A2', 115, 56);
    const snapshot = JSON.stringify(model);
    expect(() => applyMove(model, 1, 'A2', 2)).toThrow();
    expect(JSON.stringify(model)).toBe(snapshot);
    expect(legalMoves(model, 1, 1).map(p => p.id)).toContain('A2');
    expect(legalMoves(model, 1, 2).map(p => p.id)).not.toContain('A2');
  });

  it('throws for unknown piece ids', () => {
    expect(() => applyMove(createModel(2), 1, 'Z9', 3)).toThrow();
  });
});

describe('captures and safe squares', () => {
  it('captures exactly one enemy on an unsafe square', () => {
    const model = createModel(2);
    setPiece(model, 'A1', 3, 3);
    setPiece(model, 'B1', 6, 20);
    const result = applyMove(model, 1, 'A1', 3);
    expect(result.captured).toBe('B1');
    expect(result.model.players[1][0]).toMatchObject({pos: 0, travelCount: 0});
    expect(result.extraTurn).toBe(true);
  });

  it('does not capture on a star square', () => {
    const model = createModel(2);
    setPiece(model, 'A1', 6, 6);
    setPiece(model, 'B1', 9, 20);
    const result = applyMove(model, 1, 'A1', 3);
    expect(result.captured).toBeNull();
    expect(result.model.players[1][0].pos).toBe(9);
  });

  it('does not capture when two enemy pieces share the square', () => {
    const model = createModel(2);
    setPiece(model, 'A1', 3, 3);
    setPiece(model, 'B1', 6, 20);
    setPiece(model, 'B2', 6, 20);
    expect(applyMove(model, 1, 'A1', 3).captured).toBeNull();
  });

  it('reports threats only on unsafe shared-track squares', () => {
    const model = createModel(2);
    setPiece(model, 'B1', 5, 10);
    expect(threatsAt(model, 1, 8)).toBe(1);
    expect(threatsAt(model, 1, 9)).toBe(0); // star square
    expect(threatsAt(model, 1, 20)).toBe(0); // too far
  });
});

describe('turn flow and winning', () => {
  it('grants extra turns on six, capture and home; otherwise rotates', () => {
    const model = createModel(3);
    expect(nextTurnPlayer(model, 3, false)).toBe(1);
    expect(nextTurnPlayer(model, 2, true)).toBe(2);
  });

  it('announces a win only when all four pieces are home', () => {
    const model = createModel(2);
    ['A1', 'A2', 'A3'].forEach(id => setPiece(model, id, 116, 57));
    setPiece(model, 'A4', 115, 56);
    const partial = applyMove(model, 1, 'A4', 1);
    expect(partial.reachedHome).toBe(true);
    expect(partial.won).toBe(true);

    const notYet = createModel(2);
    setPiece(notYet, 'A1', 115, 56);
    const r = applyMove(notYet, 1, 'A1', 1);
    expect(r.reachedHome).toBe(true);
    expect(r.won).toBe(false);
  });
});
