if (typeof module !== 'undefined' && module.exports) {
  Object.assign(globalThis, require('./Movie.js'), require('./Cinema.js'), require('./Screen.js'));
}

// ─── Demo data ───────────────────────────────────────────────────────────────
// One responsibility: assemble the single-cinema demo world used by tests/UI.

function buildDemoCinema() {
  const movies = [
    new Movie('Inception', 'English', 148),
    new Movie('3 Idiots', 'Hindi', 170),
    new Movie('Kantara', 'Kannada', 161),
    new Movie('Interstellar', 'English', 169),
  ];

  const cinema = new Cinema('PVR.imagined — Dehradun');
  const s1 = cinema.addScreen(new Screen(1));
  const s2 = cinema.addScreen(new Screen(2));

  cinema.addShow(movies[0], s1, '18:30');
  cinema.addShow(movies[0], s2, '21:00');
  cinema.addShow(movies[1], s1, '09:30');
  cinema.addShow(movies[1], s2, '14:45');
  cinema.addShow(movies[2], s1, '11:00');
  cinema.addShow(movies[2], s2, '18:45');
  cinema.addShow(movies[3], s2, '12:15');
  cinema.addShow(movies[3], s1, '22:00');

  return { cinema, movies };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { buildDemoCinema };
if (typeof window !== 'undefined') window.buildDemoCinema = buildDemoCinema;
