// Pure scoring functions for the kitespot forecast page (no DOM access).
// Loaded by index.html as a classic script and by test_scoring.js under Node.
(function (root) {
  // ---- Tunable constants --------------------------------------------------
  const DEFAULT_IDEAL = { lo: 16, hi: 25 };           // wind range (kn) that scores 100%
  const RAMP_UP_KN = 6, RAMP_DOWN_KN = 10;           // fade to 0 below lo / above hi
  const GUST_SPREAD_KN = { steady: 5, rough: 15 };   // gust - mean
  const DIR_SECTOR_HALF_WIDTH = 22.5;                // each compass sector is +-22.5 deg
  const DIR_FADE_DEG = 30;                           // fade to 0 over 30 deg outside a sector
  const WINDOW_MIN_SCORE = 3;                        // below this an hour is not rideable
  const WINDOW_REL_SCORE = 0.6;                      // window hours must reach 60% of the peak
  const DISAGREE_SCORE_DIFF = 4;                     // model scores this far apart = disagree
  const KITE_K = 2.2;                                // size(m2) = weight(kg) * K / wind(kn)
  const SKILL_FACTOR = { beginner: 0.85, intermediate: 1.0, advanced: 1.1 };
  const KITE_SIZES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17];

  const SECTOR_DEG = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };

  function speedScore(kn, ideal) {
    const lo = ideal ? ideal.lo : DEFAULT_IDEAL.lo, hi = ideal ? ideal.hi : DEFAULT_IDEAL.hi;
    if (kn >= lo && kn <= hi) return 1;
    if (kn < lo) return Math.max(0, 1 - (lo - kn) / RAMP_UP_KN);
    return Math.max(0, 1 - (kn - hi) / RAMP_DOWN_KN);
  }

  function gustScore(meanKn, gustKn) {
    const spread = Math.max(0, gustKn - meanKn);
    const g = GUST_SPREAD_KN;
    if (spread <= g.steady) return 1;
    if (spread >= g.rough) return 0;
    return (g.rough - spread) / (g.rough - g.steady);
  }

  function angDiff(a, b) {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  // 1 inside any safe sector, fading linearly to 0 DIR_FADE_DEG outside its edge.
  function dirScore(deg, safeSectors) {
    let best = 0;
    for (const name of safeSectors) {
      const d = angDiff(deg, SECTOR_DEG[name]);
      let s;
      if (d <= DIR_SECTOR_HALF_WIDTH) s = 1;
      else if (d >= DIR_SECTOR_HALF_WIDTH + DIR_FADE_DEG) s = 0;
      else s = (DIR_SECTOR_HALF_WIDTH + DIR_FADE_DEG - d) / DIR_FADE_DEG;
      if (s > best) best = s;
    }
    return best;
  }

  // 0-10 rating for one model at one hour.
  function hourScore(m, spot, month, ideal) {
    if (spot.months && !spot.months.includes(month)) return 0;
    return 10 * speedScore(m.speed, ideal) * dirScore(m.dir, spot.safe) * gustScore(m.speed, m.gust);
  }

  function circularMean(degs) {
    let x = 0, y = 0;
    for (const d of degs) { x += Math.sin(d * Math.PI / 180); y += Math.cos(d * Math.PI / 180); }
    return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
  }

  // models: array of {speed, dir, gust} (nulls already removed). Returns null if empty.
  function combineHour(models, spot, month, ideal) {
    if (!models.length) return null;
    const scores = models.map(m => hourScore(m, spot, month, ideal));
    const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
    return {
      score: avg(scores),
      speed: avg(models.map(m => m.speed)),
      gust: avg(models.map(m => m.gust)),
      dir: circularMean(models.map(m => m.dir)),
      modelCount: models.length,
      disagree: models.length > 1 && Math.max(...scores) - Math.min(...scores) >= DISAGREE_SCORE_DIFF,
    };
  }

  // hours: array of {score, ...} or null for unusable hours (night, past, no data).
  // Returns {start, end, peak, rating} (end inclusive) or null.
  function bestWindow(hours) {
    let peak = -1, pi = -1;
    hours.forEach((h, i) => { if (h && h.score > peak) { peak = h.score; pi = i; } });
    if (pi < 0 || peak < WINDOW_MIN_SCORE) return null;
    const floor = Math.max(WINDOW_MIN_SCORE, WINDOW_REL_SCORE * peak);
    const ok = i => hours[i] && hours[i].score >= floor;
    let start = pi, end = pi;
    while (start > 0 && ok(start - 1)) start--;
    while (end < hours.length - 1 && ok(end + 1)) end++;
    let sum = 0;
    for (let i = start; i <= end; i++) sum += hours[i].score;
    return { start, end, peak, rating: sum / (end - start + 1) };
  }

  function effectiveWind(h) { return h.speed + 0.5 * (h.gust - h.speed); }

  function nearestKite(m2) {
    return KITE_SIZES.reduce((a, b) => (Math.abs(b - m2) < Math.abs(a - m2) ? b : a));
  }

  // Kite size in m2 for one hour, or null without weight / usable wind.
  function kiteSize(h, weightKg, skill) {
    if (!weightKg || weightKg <= 0) return null;
    const w = effectiveWind(h);
    if (w < 5) return null;
    return Math.round(weightKg * KITE_K / w * (SKILL_FACTOR[skill] || 1) * 10) / 10;
  }

  const api = {
    speedScore, gustScore, dirScore, hourScore, combineHour, bestWindow,
    effectiveWind, kiteSize, DEFAULT_IDEAL, nearestKite, circularMean, SECTOR_DEG,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Scoring = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
