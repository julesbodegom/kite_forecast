// Kitespots. Directions from kitesurfvereniging.nl; forecast points are nudged offshore of the launch.
const SPOTS = [
  {
    "id": "zandmotor",
    "name": "Kijkduin – Zandmotor",
    "launch": { "lat": 52.055203, "lon": 4.186521 },
    "forecast": { "lat": 52.055, "lon": 4.165 },
    "safe": ["NW", "W", "SW", "NE"],
    "months": null,
    "url": "https://kitesurfvereniging.nl/kitespot/zandmotor/",
    "note": "Forecast point ~1.4 km west of the launch, over the North Sea."
  },
  {
    "id": "brouwersdam",
    "name": "Brouwersdam",
    "launch": { "lat": 51.760532, "lon": 3.842414 },
    "forecast": { "lat": 51.768, "lon": 3.842 },
    "safe": ["N", "NW", "W", "SW"],
    "months": null,
    "url": "https://kitesurfvereniging.nl/kitespot/brouwersdam/",
    "note": "Safe winds N-SW imply the water is on the Grevelingenmeer side, so the forecast point is ~800 m north of the launch. Check on a map."
  },
  {
    "id": "rockanje",
    "name": "Rockanje Badstrand",
    "launch": { "lat": 51.865685, "lon": 4.051347 },
    "forecast": { "lat": 51.865, "lon": 4.035 },
    "safe": ["NW", "W", "SW", "S"],
    "months": [10, 11, 12, 1, 2, 3, 4],
    "url": "https://kitesurfvereniging.nl/kitespot/rockanje/",
    "note": "Kiting allowed October to April only. Forecast point ~1.1 km west of the launch."
  },
  {
    "id": "oostvoorne-noordzee",
    "name": "Oostvoorne Noordzee",
    "launch": { "lat": 51.915137, "lon": 4.060598 },
    "forecast": { "lat": 51.915, "lon": 4.045 },
    "safe": ["N", "NW", "W", "SW"],
    "months": null,
    "url": "https://kitesurfvereniging.nl/kitespot/oostvoorne-noordzee/",
    "note": "Forecast point ~1.1 km west of the launch."
  },
  {
    "id": "slufter",
    "name": "Maasvlakte 2 – Slufter",
    "launch": { "lat": 51.919079, "lon": 3.988189 },
    "forecast": { "lat": 51.919, "lon": 3.962 },
    "safe": ["W", "SW", "S"],
    "months": null,
    "url": "https://kitesurfvereniging.nl/kitespot/slufter/",
    "note": "Forecast point ~1.8 km west of the launch. Check on a map that it is over water."
  }
];
