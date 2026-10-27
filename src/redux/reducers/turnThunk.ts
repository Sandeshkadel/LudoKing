/**
 * One full dice turn: roll, resolve, and (for computer / Winner Mode / Assist seats)
 * choose and play the move. Lives outside the Dice component so it can be tested
 * against the real store.
 */
import {playSound} from '$helpers/SoundUtils';
import {
  canPieceMove,
  getNextPlayer,
  rollFairDice,
  rollWeightedDice,
} from '$helpers/ludoRules';
import {seatRole} from '$helpers/seatRole';
import {playerKey} from '$helpers/playerKeys';
import {ApplicationDispatch, RootState} from '$redux/store';
import {chooseMove} from '../../engine/ai';
import {GameModel} from '../../engine/gameEngine';
import {
  rollGatedDice,
  rollLosingDice,
  rollWinnerDice,
} from '../../engine/scripted';
import {rollRandom} from '$helpers/diceRng';
import {handleForwardThunk} from './gameActions';
import {
  disableTouch,
  enableCellSelection,
  enablePileSelection,
  advanceRoll,
  setSixStreak,
  updateDiceNumber,
  updatePlayerChance,
} from './gameSlice';

export type TurnOptions = {
  /** Force a dice value (tests / replays). */
  predice?: number;
  random?: () => number;
  delayFn?: (ms: number) => Promise<unknown>;
  onRolling?: (rolling: boolean) => void;
};

const ASSIST_WEIGHTS = [8, 10, 14, 18, 22, 28];
const defaultDelay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const toModel = (game: RootState['game']): GameModel => ({
  playerCount: game.playerCount,
  players: [game.player1, game.player2, game.player3, game.player4],
});

export const playTurnThunk =
  (player: number, options: TurnOptions = {}) =>
  async (dispatch: ApplicationDispatch, getState: () => RootState) => {
    const wait = options.delayFn ?? defaultDelay;
    const start = getState().game;
    // Every game has its own seed; every roll its own stream (no repeated sequences).
    const random =
      options.random ?? rollRandom(start.diceSeed, start.rollCount ?? 0);

    // Only the seat whose turn it is can roll, and never once the game is over.
    if (
      start.winner !== null ||
      start.chancePlayer !== player ||
      start.touchDiceBlock
    ) {
      return false;
    }

    const role = seatRole(start, player);
    let dice: number;
    if (options.predice) {
      dice = options.predice;
    } else if (role.winner) {
      const streak = start.sixStreak ?? 0;
      dice = rollWinnerDice(toModel(start), player, random, streak);
      dispatch(setSixStreak(dice === 6 ? streak + 1 : 0));
    } else if (role.losing) {
      dice = rollLosingDice(toModel(start), player, random);
    } else if (role.gated) {
      dice = rollGatedDice(
        toModel(start),
        player,
        start.cheatMode.favoredPlayer,
        random,
      );
    } else if (role.assist) {
      dice = rollWeightedDice(ASSIST_WEIGHTS, random);
    } else {
      dice = rollFairDice(random);
    }

    dispatch(advanceRoll());
    playSound('dice_roll');
    options.onRolling?.(true);
    await wait(800);
    dispatch(updateDiceNumber({diceNo: dice}));
    options.onRolling?.(false);

    // Always read the live pieces so a stale render can never be used.
    const game = getState().game;
    const pieces: PLAYER_PIECE[] = game[playerKey(player)];
    const hasBoardMove = pieces.some(p => canPieceMove(p, dice));
    const hasPocketPiece = pieces.some(p => p.pos === 0);
    const passTurn = () =>
      dispatch(
        updatePlayerChance({
          chancePlayer:
            dice === 6 ? player : getNextPlayer(player, game.playerCount),
        }),
      );

    if (role.auto) {
      const move = chooseMove(
        toModel(game),
        player,
        dice,
        random,
        role.ai ? game.aiDifficulty ?? 'hard' : 'hard',
      );
      if (move) {
        dispatch(disableTouch());
        await wait(700 + Math.floor(random() * 800));
        await dispatch(handleForwardThunk(player, move.id, move.pos));
        return true;
      }
      await wait(700);
      passTurn();
      return true;
    }

    // ── Human seat ──
    if (dice === 6) {
      if (hasPocketPiece) {
        dispatch(enablePileSelection({playerNo: player}));
      }
      if (hasBoardMove) {
        dispatch(enableCellSelection({playerNo: player}));
        return true;
      }
      if (hasPocketPiece) {
        return true;
      }
      await wait(600);
      passTurn();
      return true;
    }

    if (hasBoardMove) {
      dispatch(enableCellSelection({playerNo: player}));
      return true;
    }
    await wait(600);
    passTurn();
    return true;
  };
