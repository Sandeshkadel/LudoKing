import {
  MAX_SIX_STREAK,
  blockedFaces,
  homeCount,
  raceGap,
  rollGatedDice,
  rollWinnerDice,
} from '../scripted';
import {createModel} from '../gameEngine';
import {runBatch, seededRandom} from '../simulator';

describe('Winner Mode dice', () => {
  it('always returns a face from 1 to 6', () => {
    const model = createModel(4);
    const rng = seededRandom(3);
    for (let i = 0; i < 500; i += 1) {
      const face = rollWinnerDice(model, 1, rng, i % 3);
      expect(face).toBeGreaterThanOrEqual(1);
      expect(face).toBeLessThanOrEqual(6);
    }
  });

  it('never rolls a third six in a row', () => {
    const model = createModel(4);
    const rng = seededRandom(11);
    for (let i = 0; i < 500; i += 1) {
      expect(rollWinnerDice(model, 2, rng, MAX_SIX_STREAK)).not.toBe(6);
    }
  });

  it('steers harder when the winner seat is behind', () => {
    const model = createModel(2);
    // Opponent nearly home; winner seat still in the pocket.
    model.players[1].forEach(p => {
      p.pos = 116;
      p.travelCount = 57;
    });
    model.players[1][0].pos = 20;
    model.players[1][0].travelCount = 20;
    expect(raceGap(model, 1)).toBeGreaterThan(0);
    // With nothing on the board, the best face is a six (pocket exit).
    const rng = seededRandom(5);
    const sixes = Array.from({length: 200}, () =>
      rollWinnerDice(model, 1, rng, 0),
    ).filter(f => f === 6).length;
    expect(sixes).toBeGreaterThan(120);
  });

  it('is reproducible under the same seed', () => {
    const model = createModel(3);
    expect(rollWinnerDice(model, 1, seededRandom(9), 0)).toBe(
      rollWinnerDice(model, 1, seededRandom(9), 0),
    );
  });

  it.each([2, 3, 4])(
    'the selected colour wins every simulated %i-player game',
    n => {
      for (let seat = 1; seat <= n; seat += 1) {
        const r = runBatch(
          {playerCount: n, policies: Array(n).fill('hard'), winnerSeat: seat},
          150,
          400 + seat,
        );
        expect(r.completed).toBe(150);
        expect(r.winsBySeat[seat - 1]).toBe(150);
        expect(r.deadlocks).toBe(0);
        expect(r.invariantFailures).toBe(0);
      }
    },
  );

  describe('home gate', () => {
    const setup = () => {
      const model = createModel(3);
      // Opponent seat 2 needs 2, 4 and 5 to bring three pieces home.
      model.players[1][0] = {id: 'B1', pos: 20, travelCount: 55};
      model.players[1][1] = {id: 'B2', pos: 21, travelCount: 53};
      model.players[1][2] = {id: 'B3', pos: 22, travelCount: 52};
      return model;
    };

    it('blocks every finishing face while the winner has no piece home', () => {
      const model = setup();
      expect(blockedFaces(model, 2, 1).sort()).toEqual([2, 4, 5]);
      const rng = seededRandom(1);
      for (let i = 0; i < 500; i += 1) {
        expect([2, 4, 5]).not.toContain(rollGatedDice(model, 2, 1, rng));
      }
    });

    it('opens one finish per piece the winner brings home', () => {
      const model = setup();
      model.players[0][0] = {id: 'A1', pos: 116, travelCount: 57};
      expect(homeCount(model, 1)).toBe(1);
      expect(blockedFaces(model, 2, 1)).toEqual([]);
      // After that opponent finishes one, a second finish is blocked again.
      model.players[1][0] = {id: 'B1', pos: 226, travelCount: 57};
      expect(blockedFaces(model, 2, 1).sort()).toEqual([4, 5]);
    });

    it('never blocks the winner seat and still allows non-finishing faces', () => {
      const model = setup();
      expect(blockedFaces(model, 1, 1)).toEqual([]);
      const seen = new Set<number>();
      const rng = seededRandom(2);
      for (let i = 0; i < 500; i += 1) {
        seen.add(rollGatedDice(model, 2, 1, rng));
      }
      expect([...seen].sort()).toEqual([1, 3, 6]);
    });
  });

  it('the winner still wins every game when it plays careless random moves', () => {
    [2, 4].forEach(n => {
      const r = runBatch(
        {
          playerCount: n,
          policies: Array(n).fill('hard'),
          winnerSeat: n,
          winnerPolicy: 'random',
        },
        100,
        900,
      );
      expect(r.winsBySeat[n - 1]).toBe(100);
      expect(r.deadlocks).toBe(0);
    });
  });
});
