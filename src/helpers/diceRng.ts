/* eslint-disable no-bitwise -- 32-bit PRNG arithmetic needs bitwise operators */
/**
 * Per-game dice randomness.
 *
 * Every new game gets a fresh seed (mixed from Math.random and the clock) and
 * every roll derives its own stream from (seed, rollCount). Two games therefore
 * never replay the same dice sequence, while a single game stays reproducible
 * for debugging.
 */
export const newDiceSeed = (): number =>
  (Math.floor(Math.random() * 4294967296) ^ Date.now() % 4294967296) >>> 0;

/** mulberry32: small, fast, well-distributed 32-bit PRNG returning [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random stream for roll number `rollCount` of the game seeded with `seed`. */
export function rollRandom(
  seed: number | undefined,
  rollCount = 0,
): () => number {
  if (!Number.isFinite(seed)) {
    return Math.random;
  }
  const mix = ((seed as number) ^ Math.imul(rollCount + 1, 0x9e3779b1)) >>> 0;
  const rng = mulberry32(mix);
  rng(); // discard the first draw: neighbouring seeds correlate there
  return rng;
}
