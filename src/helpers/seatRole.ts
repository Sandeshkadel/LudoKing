/** Who controls a seat and how its dice are produced. Pure, shared by the UI thunk and tests. */
export type SeatRole = {
  /** Computer-controlled seat (fair dice, AI picks moves). */
  ai: boolean;
  /** Openly labelled Winner Mode seat (steered dice, auto moves). */
  winner: boolean;
  /** Openly labelled Assist seat (weighted dice, auto moves). */
  assist: boolean;
  /** Opponent in Winner Mode: may not roll faces that bring a piece home ahead of the winner seat. */
  gated: boolean;
  /** Winner Mode seat scheduled to LOSE this game: fair dice, but it cannot roll the game-winning face. */
  losing: boolean;
  /** Moves are chosen automatically. */
  auto: boolean;
};

type RoleInput = {
  playerCount: number;
  aiPlayers?: number[];
  cheatMode: {
    enabled: boolean;
    favoredPlayer: number;
    guaranteed?: boolean;
    result?: 'win' | 'lose';
  };
};

export function seatRole(game: RoleInput, player: number): SeatRole {
  const inGame = player >= 1 && player <= game.playerCount;
  const ai = inGame && (game.aiPlayers ?? []).includes(player);
  const favored =
    inGame && game.cheatMode.enabled && game.cheatMode.favoredPlayer === player;
  const isWinnerMode = favored && game.cheatMode.guaranteed === true;
  const loses = isWinnerMode && game.cheatMode.result === 'lose';
  const winner = isWinnerMode && !loses;
  const losing = loses;
  const assist = favored && !isWinnerMode;
  const gated =
    inGame &&
    game.cheatMode.enabled &&
    game.cheatMode.guaranteed === true &&
    game.cheatMode.result !== 'lose' &&
    game.cheatMode.favoredPlayer >= 1 &&
    game.cheatMode.favoredPlayer <= game.playerCount &&
    !favored;
  // The Winner Mode seat plays its own moves like any other seat (unless it is a Computer seat).
  return {ai, winner, assist, gated, losing, auto: ai || assist};
}
