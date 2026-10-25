/* Run: npm run simulate [-- games] — prints a documented simulation corpus report. */
import {Policy, runBatch} from '../src/engine/simulator';

const games = Number(process.argv[2] ?? 1000);
const seed = 1;

type Scenario = {
  name: string;
  playerCount: number;
  policies: Policy[];
  assistSeat?: number;
  winnerSeat?: number;
  winnerPolicy?: Policy;
};
const scenarios: Scenario[] = [
  {name: '2P fair, all random', playerCount: 2, policies: ['random', 'random']},
  {
    name: '3P fair, all random',
    playerCount: 3,
    policies: ['random', 'random', 'random'],
  },
  {
    name: '4P fair, all random',
    playerCount: 4,
    policies: ['random', 'random', 'random', 'random'],
  },
  {
    name: '2P AI hard (seat 1) vs random',
    playerCount: 2,
    policies: ['hard', 'random'],
  },
  {
    name: '3P AI hard (seat 1) vs 2 random',
    playerCount: 3,
    policies: ['hard', 'random', 'random'],
  },
  {
    name: '4P AI hard (seat 1) vs 3 random',
    playerCount: 4,
    policies: ['hard', 'random', 'random', 'random'],
  },
  {
    name: '4P AI difficulty ladder (hard/normal/easy/random)',
    playerCount: 4,
    policies: ['hard', 'normal', 'easy', 'random'],
  },
  {
    name: '4P Assist seat 1 (disclosed), others random',
    playerCount: 4,
    policies: ['random', 'random', 'random', 'random'],
    assistSeat: 1,
  },
  {
    name: '2P Winner Mode seat 2 vs Hard',
    playerCount: 2,
    policies: ['hard', 'hard'],
    winnerSeat: 2,
  },
  {
    name: '3P Winner Mode seat 3 vs 2 Hard',
    playerCount: 3,
    policies: ['hard', 'hard', 'hard'],
    winnerSeat: 3,
  },
  {
    name: '4P Winner Mode seat 4, winner plays random moves',
    playerCount: 4,
    policies: ['hard', 'hard', 'hard', 'hard'],
    winnerSeat: 4,
    winnerPolicy: 'random',
  },
  {
    name: '4P Winner Mode seat 4 vs 3 Hard',
    playerCount: 4,
    policies: ['hard', 'hard', 'hard', 'hard'],
    winnerSeat: 4,
  },
];

console.log(
  `Ludo King simulation: ${games} games per scenario, base seed ${seed}\n`,
);
for (const s of scenarios) {
  const r = runBatch(s, games, seed);
  const wins = r.winsBySeat
    .slice(0, s.playerCount)
    .map(w => `${((100 * w) / r.completed).toFixed(1)}%`);
  console.log(`${s.name}`);
  console.log(
    `  completed ${r.completed}/${r.games}  deadlocks ${r.deadlocks}  invariant failures ${r.invariantFailures}`,
  );
  console.log(`  win rate by seat: ${wins.join('  ')}`);
  console.log(
    `  avg turns ${r.avgTurns.toFixed(0)}  captures ${r.avgCaptures.toFixed(
      1,
    )}  sixes ${r.avgSixes.toFixed(1)}\n`,
  );
}
