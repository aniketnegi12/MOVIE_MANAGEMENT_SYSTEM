if (typeof module !== 'undefined' && module.exports && typeof Show === 'undefined') {
  Object.assign(globalThis, require('./Show.js'));
}

// ─── Cinema ──────────────────────────────────────────────────────────────────
// One responsibility: THE theatre — name and its screens.
// Knows: name, Screen objects.   Does: register shows, list movies (F1).
// Must NOT do: book seats or take payments (that is BookingService's job).

class Cinema {
  constructor(name) {
    this.name = name;
    this.screens = [];
    this.shows = [];
    this._showSeq = 0;
  }

  addScreen(screen) {
    this.screens.push(screen);
    return screen;
  }

  addShow(movie, screen, startTime) {
    this._showSeq += 1;
    const show = new Show(movie, screen, startTime, `S${this._showSeq}`);
    this.shows.push(show);
    return show;
  }

  listMovies() {
    // F1 — distinct movies that currently have shows
    const seen = new Map();
    for (const show of this.shows) {
      if (!seen.has(show.movie.title)) seen.set(show.movie.title, show.movie);
    }
    return [...seen.values()];
  }

  showsOf(movie) {
    // F2 — shows (screen + start time) for a chosen movie
    return this.shows.filter((s) => s.movie === movie);
  }

  findShow(showId) {
    return this.shows.find((s) => s.id === showId) || null;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Cinema };
if (typeof window !== 'undefined') window.Cinema = Cinema;
