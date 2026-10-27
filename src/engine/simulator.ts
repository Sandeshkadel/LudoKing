/**
 * Deterministic full-game simulator built on the production rules.
 * Each seat has a policy; dice are uniform unless a seat is the disclosed
 * Assist seat (weighted dice from rollWeightedDice).
 */
import {Difficulty, chooseMove} from './ai';
import {rollGatedDice, rollLosingDice, rollWinnerDice} from './scripted';
import {
  GameModel,
  applyMove,
  createModel,
  legalMoves,
  nextTurnPlayer,
} from './gameEngine';
import {
  rollFairDice,
  rollWeightedDice,
  HOME_TRAVEL_COUNT,
} from '../helpers/ludoRules';

export type Policy = 'random' | Difficulty;

export type SimConfig = {
  playerCount: number;
  /** Policy for seat 1..4. */
  policies: Policy[];
  /** Disclosed Assist seat (1-4) that receives weighted dice; 0 = fair game. */
  assistSeat?: number;
  /** Openly labelled Winner Mode seat (1-4); its dice are steered and its moves use the Hard AI. */
  winnerSeat?: number;
  /** Winner Mode seat scheduled to LOSE this game (cannot roll the game-winning face). */
  loseSeat?: number;
  /** How the Winner Mode seat picks moves: 'hard' (default) or 'random' (careless human play). */
  winnerPolicy?: Policy;
  maxTurns?: number;
};

export type GameStats = {
  winner: number | null;
  turns: number;
  captures: number;
  sixes: number;
  homeArrivals: number;
  deadlock: boolean;
  invariantFailures: string[];
};

export const ASSIST_WEIGHTS = [8, 10, 14, 18, 22, 28];

/** Simple seedable PRNG using arithmetic only so the simulator stays lint-clean. */
export function seededRandom(seed: number): () => number {
  let state = ((seed % 4294967296) + 4294967296) % 4294967296;
  return () => {
    state = (1664525 * state + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function checkInvariants(model: GameModel): string[] {
  const failures: string[] = [];
  const ids = new Set<string>();
  model.players.slice(0, model.playerCount).forEach(list => {
    list.forEach(p => {
      if (ids.has(p.id)) {
        failures.push(`duplicate id ${p.id}`);
      }
      ids.add(p.id);
      if (p.travelCount < 0 || p.travelCount > HOME_TRAVEL_COUNT) {
        failures.push(`travelCount out of range for ${p.id}`);
      }
      if (p.pos === 0 && p.travelCount !== 0) {
        failures.push(`pocket piece ${p.id} has travelCount ${p.travelCount}`);
      }
      if (p.pos !== 0 && p.travelCount === 0) {
        failures.push(`board piece ${p.id} has travelCount 0`);
      }
    });
  });
  return failures;
}

export function runGame(config: SimConfig, seed: number): GameStats {
  const random = seededRandom(seed);
  const maxTurns = config.maxTurns ?? 5000;
  let model = createModel(config.playerCount);
  let player = 1;
  let sixStreak = 0;
  const stats: GameStats = {
    winner: null,
    turns: 0,
    captures: 0,
    sixes: 0,
    homeArrivals: 0,
    deadlock: false,
    invariantFailures: [],
  };

  while (stats.turns < maxTurns) {
    stats.turns += 1;
    let dice: number;
    if (config.winnerSeat === player) {
      dice = rollWinnerDice(model, player, random, sixStreak);
      sixStreak = dice === 6 ? sixStreak + 1 : 0;
    } else if (config.loseSeat === player) {
      dice = rollLosingDice(model, player, random);
    } else if (config.winnerSeat) {
      // Opponents roll uniform dice minus faces that would bring a piece home ahead of the winner.
      dice = rollGatedDice(model, player, config.winnerSeat, random);
    } else if (config.assistSeat === player) {
      dice = rollWeightedDice(ASSIST_WEIGHTS, random);
    } else {
      dice = rollFairDice(random);
    }
    if (dice === 6) {
      stats.sixes += 1;
    }

    const policy: Policy =
      config.winnerSeat === player
        ? config.winnerPolicy ?? 'hard'
        : config.policies[player - 1] ?? 'hard';
    const moves = legalMoves(model, player, dice);
    let extra = dice === 6;

    if (moves.length > 0) {
      const choice =
        policy === 'random'
          ? moves[Math.floor(random() * moves.length)]
          : chooseMove(model, player, dice, random, policy);
      if (!choice) {
        stats.invariantFailures.push('AI returned null with legal moves');
        break;
      }
      const result = applyMove(model, player, choice.id, dice);
      model = result.model;
      if (result.captured) {
        stats.captures += 1;
      }
      if (result.reachedHome) {
        stats.homeArrivals += 1;
      }
      extra = result.extraTurn;
      stats.invariantFailures.push(...checkInvariants(model));
      if (result.won) {
        stats.winner = player;
        return stats;
      }
    }
    player = nextTurnPlayer(model, player, extra);
  }
  stats.deadlock = true;
  return stats;
}

export type BatchSummary = {
  games: number;
  completed: number;
  winsBySeat: number[];
  avgTurns: number;
  avgCaptures: number;
  avgSixes: number;
  deadlocks: number;
  invariantFailures: number;
};

export function runBatch(
  config: SimConfig,
  games: number,
  baseSeed = 1,
): BatchSummary {
  const summary: BatchSummary = {
    games,
    completed: 0,
    winsBySeat: [0, 0, 0, 0],
    avgTurns: 0,
    avgCaptures: 0,
    avgSixes: 0,
    deadlocks: 0,
    invariantFailures: 0,
  };
  let turns = 0;
  let captures = 0;
  let sixes = 0;
  for (let i = 0; i < games; i += 1) {
    const g = runGame(config, baseSeed + i);
    turns += g.turns;
    captures += g.captures;
    sixes += g.sixes;
    if (g.deadlock) {
      summary.deadlocks += 1;
    }
    summary.invariantFailures += g.invariantFailures.length;
    if (g.winner) {
      summary.completed += 1;
      summary.winsBySeat[g.winner - 1] += 1;
    }
  }
  summary.avgTurns = turns / games;
  summary.avgCaptures = captures / games;
  summary.avgSixes = sixes / games;
  return summary;
}
