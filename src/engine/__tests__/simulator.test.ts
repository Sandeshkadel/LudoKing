import {runBatch, runGame, seededRandom} from '../simulator';

describe('deterministic full-game simulation', () => {
  it('is reproducible for a given seed', () => {
    const cfg = {
      playerCount: 4,
      policies: ['hard', 'hard', 'hard', 'hard'] as const,
    };
    expect(runGame({...cfg, policies: [...cfg.policies]}, 42)).toEqual(
      runGame({...cfg, policies: [...cfg.policies]}, 42),
    );
  });

  it.each([2, 3, 4])(
    '%i-player games finish with no deadlocks or invariant failures',
    n => {
      const summary = runBatch(
        {playerCount: n, policies: ['hard', 'normal', 'easy', 'random']},
        60,
        1000,
      );
      expect(summary.completed).toBe(60);
      expect(summary.deadlocks).toBe(0);
      expect(summary.invariantFailures).toBe(0);
      expect(summary.winsBySeat.slice(n).every(w => w === 0)).toBe(true);
    },
  );

  it('hard AI clearly beats random play in 2-player games', () => {
    const summary = runBatch(
      {playerCount: 2, policies: ['hard', 'random']},
      200,
      5000,
    );
    expect(summary.winsBySeat[0] / summary.completed).toBeGreaterThan(0.75);
  });

  it('with fair dice and equal policies no seat dominates', () => {
    const summary = runBatch(
      {playerCount: 4, policies: ['random', 'random', 'random', 'random']},
      400,
      9000,
    );
    summary.winsBySeat.forEach(wins => {
      expect(wins / summary.completed).toBeGreaterThan(0.15);
      expect(wins / summary.completed).toBeLessThan(0.35);
    });
  });

  it('the disclosed Assist seat gets a measurable, bounded advantage', () => {
    const fair = runBatch(
      {playerCount: 4, policies: ['random', 'random', 'random', 'random']},
      300,
      20000,
    );
    const assisted = runBatch(
      {
        playerCount: 4,
        policies: ['random', 'random', 'random', 'random'],
        assistSeat: 1,
      },
      300,
      20000,
    );
    expect(assisted.winsBySeat[0]).toBeGreaterThan(fair.winsBySeat[0]);
  });

  it('seededRandom stays in [0,1)', () => {
    const r = seededRandom(5);
    for (let i = 0; i < 1000; i += 1) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
