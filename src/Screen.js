// Node-only shim: browser gets these as window globals; CJS needs explicit load.
if (typeof module !== 'undefined' && module.exports && typeof SeatType === 'undefined') {
  Object.assign(globalThis, require('./SeatType.js'), require('./Seat.js'));
}

// ─── Screen ──────────────────────────────────────────────────────────────────
// One responsibility: ONE auditorium — a screen number and its seat inventory.
// Knows: screen number, its Seat objects.   Does: hand out seats, report layout.
// Must NOT do: know about shows or bookings (Show owns ShowSeats instead).

class Screen {
  // Layout: rows A-D SILVER (10 seats), E-H GOLD (10), I-J PLATINUM (6)
  constructor(screenNo, layout) {
    this.screenNo = screenNo;
    this._layout = layout || Screen.defaultLayout();
    this.seats = this._layout.flatMap((row) =>
      Array.from({ length: row.count }, (_, i) => new Seat(`${row.row}${i + 1}`, row.type))
    );
  }

  static defaultLayout() {
    const L = [];
    const push = (prefix, count, type) => L.push({ row: prefix, count, type });
    ['A', 'B', 'C', 'D'].forEach((r) => push(r, 10, SeatType.SILVER));
    ['E', 'F', 'G', 'H'].wrap = false;
    ['E', 'F', 'G', 'H'].forEach((r) => push(r, 10, SeatType.GOLD));
    ['I', 'J'].forEach((r) => push(r, 6, SeatType.PLATINUM));
    return L;
  }

  seatByNumber(no) {
    return this.seats.find((s) => s.number === no) || null;
  }

  seatCount() {
    return this.seats.length;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Screen };
if (typeof window !== 'undefined') window.Screen = Screen;
