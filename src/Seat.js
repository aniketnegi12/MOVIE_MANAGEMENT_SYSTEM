// ─── Seat ────────────────────────────────────────────────────────────────────
// One responsibility: ONE physical seat in a screen — its number and type.
// Knows: seat number, SeatType.   Does: identify itself, expose its type.
// Must NOT do: track availability (that is ShowSeat's job — per the
// assignment's noun-verb table, "seat layout" is a view of a Show's seats).

class Seat {
  constructor(number, seatType) {
    this.number = number; // e.g. "A1", "G4", "P2"
    this.seatType = seatType; // SeatType.SILVER / GOLD / PLATINUM
  }

  label() {
    return `${this.number} (${this.seatType.label})`;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Seat };
if (typeof window !== 'undefined') window.Seat = Seat;
