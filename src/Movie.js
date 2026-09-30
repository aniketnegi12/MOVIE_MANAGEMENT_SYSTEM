// ─── Movie ───────────────────────────────────────────────────────────────────
// One responsibility: hold one movie's catalog data (F1's "what is playing").
// Knows: title, language, duration.   Does: describe itself.
// Must NOT do: know about shows, screens, or seats.

class Movie {
  constructor(title, language, durationMin) {
    this.title = title;
    this.language = language;
    this.durationMin = durationMin;
  }

  describe() {
    return `${this.title} · ${this.language} · ${this.durationMin} min`;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Movie };
if (typeof window !== 'undefined') window.Movie = Movie;
