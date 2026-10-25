/**
 * @format
 */
import 'react-native';
import React from 'react';
import {it, expect} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';
import App from '../App';

it('renders the app shell without crashing', async () => {
  jest.useFakeTimers();
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(<App />);
  });
  expect(tree).toBeDefined();
  await act(async () => {
    tree?.unmount();
  });
  jest.useRealTimers();
});
