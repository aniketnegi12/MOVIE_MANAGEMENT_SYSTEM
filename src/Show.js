if (typeof module !== 'undefined' && module.exports && typeof ShowSeat === 'undefined') {
  Object.assign(globalThis, require('./ShowSeat.js'), require('./SeatStatus.js'));
}

// ─── Show ────────────────────────────────────────────────────────────────────
// One responsibility: ONE screening — a Movie on a Screen at a time.
// Knows: its movie, screen, start time, id.   Does: own and expose ShowSeats.
// Must NOT do: book seats itself (BookingService orchestrates); price anything.

class Show {
  constructor(movie, screen, startTime, id) {
    this.id = id;
    this.movie = movie;
    this.screen = screen;
    this.startTime = startTime; // { hour, minute } or "18:30" — display only
    // Composition: Show owns its ShowSeats — they live and die with the show.
    this.showSeats = new Map(
      screen.seats.map((seat) => [seat.number, new ShowSeat(seat, SeatStatus.AVAILABLE)])
    );
  }

  seatStatus(no) {
    const ss = this.showSeats.get(no);
    return ss ? ss.status : null;
  }

  availableSeats() {
    return [...this.showSeats.values()].filter((ss) => ss.isAvailable());
  }

  availableCount() {
    return this.availableSeats().length;
  }

  layoutRows() {
    // F3 support — group seat numbers by row for the UI seat map
    const rows = new Map();
    for (const seat of this.screen.seats) {
      if (!rows.has(seat.number[0])) rows.set(seat.number[0], []);
      rows.get(seat.number[0]).push(seat);
    }
    return [...rows.entries()].map(([row, seats]) => ({ row, seats }));
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Show };
if (typeof window !== 'undefined') window.Show = Show;
