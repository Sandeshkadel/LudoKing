import {
  LOCK_MS,
  buildSchedule,
  currentOutcome,
  emptySession,
  isLocked,
  lockRemainingMs,
  recordGameFinished,
  startSession,
  validateSessionInput,
} from '../session';
import {seededRandom} from '../simulator';

describe('validateSessionInput', () => {
  it.each([
    [0, 0, false],
    [-1, 0, false],
    [1.5, 0, false],
    [NaN, 0, false],
    [5, -1, false],
    [5, 6, false],
    [5, 2.5, false],
    [100, 0, false],
    [1, 0, true],
    [7, 3, true],
    [9, 9, true],
  ])('games=%p losses=%p -> ok=%p', (g, l, ok) => {
    expect(validateSessionInput(g, l).ok).toBe(ok);
  });
  it('rejects a colour that is not playing', () => {
    expect(validateSessionInput(5, 1, 2, 3).ok).toBe(false);
    expect(validateSessionInput(5, 1, 2, 2).ok).toBe(true);
  });
});

describe('buildSchedule', () => {
  it('has exactly `losses` losses, in random places', () => {
    const positions = new Set<number>();
    for (let seed = 1; seed <= 200; seed += 1) {
      const s = buildSchedule(9, 4, seededRandom(seed));
      expect(s).toHaveLength(9);
      expect(s.filter(Boolean)).toHaveLength(4);
      s.forEach((v, i) => v && positions.add(i));
    }
    expect(positions.size).toBe(9); // every slot can be a loss
  });
});

describe('session lifecycle', () => {
  const t0 = 1_000_000;
  it('runs N games, loses exactly L, then locks for 10 hours', () => {
    let s = startSession(emptySession(), 2, 9, 4, t0, seededRandom(3));
    let losses = 0;
    for (let g = 0; g < 9; g += 1) {
      expect(s.active).toBe(true);
      if (currentOutcome(s) === 'lose') {
        losses += 1;
      }
      s = recordGameFinished(s, t0 + g);
    }
    expect(losses).toBe(4);
    expect(s.active).toBe(false);
    expect(currentOutcome(s)).toBeNull();
    expect(isLocked(s, t0 + 8 + LOCK_MS - 1)).toBe(true);
    expect(isLocked(s, t0 + 8 + LOCK_MS)).toBe(false);
  });
  it('cannot start while locked, can after 10h', () => {
    let s = startSession(emptySession(), 1, 1, 0, t0);
    s = recordGameFinished(s, t0);
    expect(() => startSession(s, 1, 1, 0, t0 + 1000)).toThrow();
    expect(() => startSession(s, 1, 1, 0, t0 + LOCK_MS)).not.toThrow();
  });
  it('a clock set backwards does not unlock', () => {
    let s = startSession(emptySession(), 1, 1, 0, t0);
    s = recordGameFinished(s, t0);
    expect(lockRemainingMs(s, t0 - 5 * 3600000)).toBe(LOCK_MS);
  });
  it('ignores extra finished games after the session ended', () => {
    let s = startSession(emptySession(), 1, 1, 0, t0);
    s = recordGameFinished(s, t0);
    expect(recordGameFinished(s, t0 + 5)).toBe(s);
  });
});
