declare module '*.jpg';
declare module '*.png';
declare module '*.mp3';

declare module '*.svg' {
  import React from 'react';
  import {SvgProps} from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}

declare type SOUND_NAME =
  | 'dice_roll'
  | 'cheer'
  | 'collide'
  | 'game_start'
  | 'sound_girl1'
  | 'sound_girl2'
  | 'sound_girl3'
  | 'sound_girl0'
  | 'home'
  | 'home_win'
  | 'pile_move'
  | 'safe_spot'
  | 'ui';
declare type PLAYER_PIECE = {id: string; pos: number; travelCount: number};

declare type CHEAT_MODE = {
  enabled: boolean;
  favoredPlayer: number; // 1-4, 0 = none
  /** true = openly labelled Winner Mode; false/undefined = Assist handicap. */
  guaranteed?: boolean;
  /** Planned result of the CURRENT game for the favoured seat (Winner Mode only). */
  result?: 'win' | 'lose';
};

declare type INITIAL_STATE = {
  player1: PLAYER_PIECE[];
  player2: PLAYER_PIECE[];
  player3: PLAYER_PIECE[];
  player4: PLAYER_PIECE[];
  playerNames: string[];
  playerCount: number;
  cheatMode: CHEAT_MODE;
  /** Seats (1-4) controlled by the computer. */
  aiPlayers: number[];
  aiDifficulty: 'easy' | 'normal' | 'hard';
  /** Consecutive sixes rolled by the Winner Mode seat (keeps rolls natural-looking). */
  sixStreak: number;
  /** Winner Mode session: games to play, games to lose, 10-hour lock. */
  winnerSession: import('./src/engine/session').WinnerSession;
  /** Per-game dice seed and number of rolls made in this game. */
  diceSeed: number;
  rollCount: number;
  chancePlayer: number;
  diceNo: number;
  isDiceRolled: boolean;
  pileSelectionPlayer: number;
  cellSelectionPlayer: number;
  touchDiceBlock: boolean;
  currentPosition: {id: string; pos: number}[];
  fireworks: boolean;
  winner: any;
};
