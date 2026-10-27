import React from 'react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import TestRenderer, {act} from 'react-test-renderer';
import {TextInput, TouchableOpacity, Text} from 'react-native';
import {gameReducer, setPlayerCount} from '../../redux/reducers/gameSlice';
import SettingsModal from '../SettingsModal';

jest.mock('react-native-modal', () => {
  const {View: MockView} = require('react-native');
  return {
    __esModule: true,
    default: ({isVisible, children}: any) =>
      isVisible ? <MockView>{children}</MockView> : null,
  };
});

const make = () => configureStore({reducer: {game: gameReducer}});

const texts = (root: TestRenderer.ReactTestInstance) =>
  root.findAllByType(Text).map(t => [t.props.children].flat().join(''));

const pressByText = (root: TestRenderer.ReactTestInstance, label: string) => {
  const node = root
    .findAllByType(TouchableOpacity)
    .find(t =>
      t
        .findAllByType(Text)
        .some(x => [x.props.children].flat().join('') === label),
    );
  expect(node).toBeDefined();
  act(() => node!.props.onPress());
};

describe('SettingsModal winner series', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('validates the two numbers and starts a series', () => {
    const store = make();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <Provider store={store as any}>
          <SettingsModal visible onClose={() => undefined} />
        </Provider>,
      );
    });
    pressByText(tree.root, 'Winner');
    expect(texts(tree.root).some(t => t.includes('Games to play today'))).toBe(
      true,
    );

    // empty -> error
    pressByText(tree.root, 'START SERIES');
    expect(store.getState().game.winnerSession.active).toBe(false);
    expect(texts(tree.root).some(t => t.includes('how many games'))).toBe(true);

    const [games, losses] = tree.root.findAllByType(TextInput);
    expect(games.props.keyboardType).toBe('number-pad');
    expect(games.props.maxLength).toBe(2);
    act(() => games.props.onChangeText('3x'));
    expect(games.props.value).toBe('3');
    act(() => losses.props.onChangeText('4'));
    pressByText(tree.root, 'START SERIES');
    expect(store.getState().game.winnerSession.active).toBe(false);
    expect(texts(tree.root).some(t => t.includes('cannot be more'))).toBe(true);

    act(() => losses.props.onChangeText('1'));
    pressByText(tree.root, 'START SERIES');
    const g = store.getState().game;
    expect(g.winnerSession.active).toBe(true);
    expect(g.winnerSession.gamesPlanned).toBe(3);
    expect(g.winnerSession.lossesPlanned).toBe(1);
    expect(g.cheatMode.enabled).toBe(true);
    expect(texts(tree.root).some(t => t.includes('Game 1'))).toBe(true);
  });

  it('resumes a paused series when switching back from Assist or Normal', () => {
    const store = make();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <Provider store={store as any}>
          <SettingsModal visible onClose={() => undefined} />
        </Provider>,
      );
    });

    pressByText(tree.root, 'Winner');
    const [games, losses] = tree.root.findAllByType(TextInput);
    act(() => games.props.onChangeText('4'));
    act(() => losses.props.onChangeText('1'));
    pressByText(tree.root, 'START SERIES');
    expect(store.getState().game.cheatMode.guaranteed).toBe(true);

    pressByText(tree.root, 'Assist');
    expect(store.getState().game.cheatMode.enabled).toBe(true);
    expect(store.getState().game.cheatMode.guaranteed).toBe(false);
    expect(store.getState().game.winnerSession.active).toBe(true);

    pressByText(tree.root, 'Normal');
    expect(store.getState().game.cheatMode.enabled).toBe(false);
    expect(store.getState().game.winnerSession.gamesPlanned).toBe(4);

    pressByText(tree.root, 'Assist');
    pressByText(tree.root, 'Winner');
    expect(store.getState().game.cheatMode.enabled).toBe(true);
    expect(store.getState().game.cheatMode.guaranteed).toBe(true);
    expect(store.getState().game.winnerSession.gamesPlayed).toBe(0);
    expect(texts(tree.root).some(t => t.includes('Game 1 of 4'))).toBe(true);
  });

  it.each([2, 3])(
    'keeps Winner and Assist colors valid when the player count changes to %i',
    playerCount => {
      const store = make();
      let tree!: TestRenderer.ReactTestRenderer;
      act(() => {
        store.dispatch(setPlayerCount(4));
        tree = TestRenderer.create(
          <Provider store={store as any}>
            <SettingsModal visible onClose={() => undefined} />
          </Provider>,
        );
      });

      pressByText(tree.root, 'Winner');
      pressByText(tree.root, 'Blue');
      const [games, losses] = tree.root.findAllByType(TextInput);
      act(() => games.props.onChangeText('2'));
      act(() => losses.props.onChangeText('0'));
      pressByText(tree.root, 'START SERIES');
      expect(store.getState().game.winnerSession.colour).toBe(4);

      pressByText(tree.root, 'Assist');
      pressByText(tree.root, 'Red');
      expect(store.getState().game.cheatMode.favoredPlayer).toBe(1);
      expect(store.getState().game.winnerSession.colour).toBe(4);

      pressByText(tree.root, 'Blue');
      expect(store.getState().game.cheatMode.favoredPlayer).toBe(4);
      expect(store.getState().game.winnerSession.colour).toBe(4);

      act(() => {
        store.dispatch(setPlayerCount(playerCount));
      });
      const game = store.getState().game;
      expect(game.winnerSession.colour).toBe(playerCount);
      expect(game.cheatMode.favoredPlayer).toBe(playerCount);

      pressByText(tree.root, 'Winner');
      expect(store.getState().game.cheatMode.guaranteed).toBe(true);
      expect(
        tree.root.findByProps({
          accessibilityLabel: `${
            playerCount === 2 ? 'Green' : 'Yellow'
          } colour`,
        }).props.accessibilityState.selected,
      ).toBe(true);
      expect(
        tree.root.findAllByProps({accessibilityLabel: 'Blue colour'}),
      ).toHaveLength(0);
    },
  );
});
