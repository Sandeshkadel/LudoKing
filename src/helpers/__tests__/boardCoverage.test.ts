import {
  plot1data,
  plot2data,
  plot3data,
  plot4data,
  startingPoints,
  victoryStart,
} from '../PlotData';
import {stepPosition} from '../../engine/gameEngine';
import {HOME_TRAVEL_COUNT} from '../ludoRules';

const cells = [...plot1data, ...plot2data, ...plot3data, ...plot4data];

describe('board coverage', () => {
  it('has no duplicate cell ids', () => {
    expect(cells.filter((c, i) => cells.indexOf(c) !== i)).toEqual([]);
  });

  it('draws every square a piece can stand on before reaching home', () => {
    const missing: Record<number, number[]> = {};
    for (let p = 1; p <= 4; p += 1) {
      let pos = startingPoints[p - 1];
      for (let travel = 1; travel < HOME_TRAVEL_COUNT; travel += 1) {
        if (!cells.includes(pos)) {
          (missing[p] = missing[p] || []).push(pos);
        }
        pos = stepPosition(p, pos);
      }
      // travel 57 is the centre triangle: it must NOT be a path cell.
      expect(pos).toBe(victoryStart[p - 1] + 5);
      expect(cells.includes(pos)).toBe(false);
    }
    expect(missing).toEqual({});
  });
});
