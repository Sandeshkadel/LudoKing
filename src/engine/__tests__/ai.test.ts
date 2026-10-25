import {chooseMove, scoreMove} from '../ai';
import {createModel, legalMoves} from '../gameEngine';
import {seededRandom} from '../simulator';

const place = (
  model: ReturnType<typeof createModel>,
  id: string,
  pos: number,
  travel: number,
) => {
  const p = model.players.flat().find(x => x.id === id)!;
  p.pos = pos;
  p.travelCount = travel;
};

describe('fair AI', () => {
  it('returns null with no legal move', () => {
    expect(chooseMove(createModel(2), 1, 3, seededRandom(1))).toBeNull();
  });

  it('always returns a legal move', () => {
    const rng = seededRandom(7);
    const model = createModel(4);
    place(model, 'A1', 10, 10);
    place(model, 'A2', 30, 30);
    for (let dice = 1; dice <= 6; dice += 1) {
      const legal = legalMoves(model, 1, dice).map(p => p.id);
      const pick = chooseMove(model, 1, dice, rng, 'hard');
      expect(pick && legal.includes(pick.id)).toBe(true);
    }
  });

  it('prefers reaching home exactly', () => {
    const model = createModel(2);
    place(model, 'A1', 115, 56);
    place(model, 'A2', 20, 20);
    expect(chooseMove(model, 1, 1, seededRandom(3), 'hard')!.id).toBe('A1');
  });

  it('prefers a capture over a plain advance', () => {
    const model = createModel(2);
    place(model, 'A1', 3, 3);
    place(model, 'A2', 20, 20);
    place(model, 'B1', 6, 20);
    expect(chooseMove(model, 1, 3, seededRandom(3), 'hard')!.id).toBe('A1');
  });

  it('brings a piece out of the pocket on a six when nothing else is on the board', () => {
    const model = createModel(2);
    expect(chooseMove(model, 1, 6, seededRandom(3), 'hard')!.travelCount).toBe(
      0,
    );
  });

  it('is reproducible under the same seed', () => {
    const model = createModel(4);
    place(model, 'A1', 10, 10);
    place(model, 'A2', 30, 30);
    place(model, 'B1', 12, 25);
    const a = chooseMove(model, 1, 4, seededRandom(99), 'normal');
    const b = chooseMove(model, 1, 4, seededRandom(99), 'normal');
    expect(a).toEqual(b);
  });

  it('avoids landing within reach of an enemy when a safer move exists', () => {
    const model = createModel(2);
    place(model, 'A1', 10, 10); // 10 -> 12 stays 4 ahead of B1 (exposed)
    place(model, 'A2', 30, 30); // 30 -> 32 is out of B1's reach
    place(model, 'B1', 8, 30);
    expect(scoreMove(model, 1, model.players[0][1], 2)).toBeGreaterThan(
      scoreMove(model, 1, model.players[0][0], 2),
    );
    expect(chooseMove(model, 1, 2, seededRandom(1), 'hard')!.id).toBe('A2');
  });
});
