// Run: node test_scoring.js
const assert = require('assert');
const S = require('./scoring.js');

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

// speed trapezoid
near(S.speedScore(9), 0); near(S.speedScore(13), 0.5); near(S.speedScore(20), 1);
near(S.speedScore(30), 0.5); near(S.speedScore(36), 0);

// gust spread
near(S.gustScore(20, 24), 1); near(S.gustScore(20, 30), 0.8); near(S.gustScore(20, 40), 0.4); near(S.gustScore(20, 50), 0);

// direction: Zandmotor-like non-contiguous set
const safe = ['NW', 'W', 'SW', 'NE'];
near(S.dirScore(270, safe), 1);          // W, centre of a sector
near(S.dirScore(337.4, safe), 1);        // just inside the NW edge
near(S.dirScore(352.5, safe), 0.5);      // 37.5 deg from NW centre -> halfway through the fade
near(S.dirScore(367.5 % 360, safe), 0.0 + S.dirScore(7.5, safe)); // wraps past north
near(S.dirScore(180, safe), 0.25);       // S is 45 deg from SW centre
near(S.dirScore(135, safe), 0);          // SE is far from every listed sector
near(S.dirScore(60, safe), 1);           // inside NE sector (22.5..67.5)

// full hour score: perfect wind, wrong direction, closed season
const spot = { safe: ['W'], months: [10, 11, 12, 1, 2, 3, 4] };
near(S.hourScore({ speed: 20, dir: 270, gust: 24 }, spot, 10), 10);
near(S.hourScore({ speed: 20, dir: 90, gust: 24 }, spot, 10), 0);
near(S.hourScore({ speed: 20, dir: 270, gust: 24 }, spot, 7), 0);

// combining models
const both = S.combineHour(
  [{ speed: 20, dir: 270, gust: 24 }, { speed: 20, dir: 90, gust: 24 }], spot, 10);
near(both.score, 5); assert.ok(both.disagree);
const one = S.combineHour([{ speed: 20, dir: 270, gust: 24 }], spot, 10);
near(one.score, 10); assert.ok(!one.disagree);
assert.strictEqual(S.combineHour([], spot, 10), null);
near(S.circularMean([350, 10]), 0, 1e-6);

// best window
const mk = scores => scores.map(s => (s === null ? null : { score: s }));
assert.strictEqual(S.bestWindow(mk([null, 1, 2, null])), null);        // never rideable
let w = S.bestWindow(mk([2, 5, 8, 7, 4, 9.5, 2]));
assert.deepStrictEqual([w.start, w.end], [5, 5]);                       // peak 9.5, floor 5.7
w = S.bestWindow(mk([2, 5, 8, 9, 7, 4, 2]));
assert.deepStrictEqual([w.start, w.end], [2, 4]);                       // floor 5.4
near(w.rating, 8);

// kite size: 80 kg, 20 kn mean / 20 kn gust -> 8.8 -> 9 m
assert.strictEqual(S.kiteSize({ speed: 20, gust: 20 }, 80, 'intermediate'), 8.8);
assert.strictEqual(S.kiteSize({ speed: 20, gust: 20 }, 80, 'beginner'), 7.5);
assert.strictEqual(S.kiteSize({ speed: 20, gust: 20 }, 80, 'advanced'), 9.7);
assert.strictEqual(S.kiteSize({ speed: 20, gust: 30 }, 80, 'intermediate'), 7);
assert.strictEqual(S.kiteSize({ speed: 20, gust: 20 }, 0, 'intermediate'), null);

console.log('all scoring tests passed');

// custom ideal range
near(S.speedScore(30, { lo: 28, hi: 35 }), 1);
near(S.speedScore(25, { lo: 28, hi: 35 }), 0.5);
near(S.speedScore(20, { lo: 28, hi: 35 }), 0);
