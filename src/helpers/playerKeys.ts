export type PlayerKey = 'player1' | 'player2' | 'player3' | 'player4';

/** Convert a 1-4 player number into its typed state key. */
export const playerKey = (playerNo: number): PlayerKey =>
  `player${playerNo}` as PlayerKey;
