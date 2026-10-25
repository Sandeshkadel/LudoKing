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
  /** Moves are chosen automatically. */
  auto: boolean;
};

type RoleInput = {
  playerCount: number;
  aiPlayers?: number[];
  cheatMode: {enabled: boolean; favoredPlayer: number; guaranteed?: boolean};
};

export function seatRole(game: RoleInput, player: number): SeatRole {
  const inGame = player >= 1 && player <= game.playerCount;
  const ai = inGame && (game.aiPlayers ?? []).includes(player);
  const favored =
    inGame && game.cheatMode.enabled && game.cheatMode.favoredPlayer === player;
  const winner = favored && game.cheatMode.guaranteed === true;
  const assist = favored && !winner;
  const gated =
    inGame &&
    game.cheatMode.enabled &&
    game.cheatMode.guaranteed === true &&
    game.cheatMode.favoredPlayer >= 1 &&
    game.cheatMode.favoredPlayer <= game.playerCount &&
    !favored;
  // The Winner Mode seat plays its own moves like any other seat (unless it is a Computer seat).
  return {ai, winner, assist, gated, auto: ai || assist};
}
