if (typeof module !== 'undefined' && module.exports && typeof SeatStatus === 'undefined') {
  Object.assign(globalThis, require('./SeatStatus.js'));
}

// ─── ShowSeat ────────────────────────────────────────────────────────────────
// One responsibility: the status of ONE seat FOR ONE show.
// Knows: its Seat, its SeatStatus.   Does: guarded state transitions.
// Must NOT do: know which Booking owns it, price anything, or touch the UI.
//
// OOP note — Encapsulation: `status` is private (underscore) and can only
// change through bookSeat()/cancelSeat(), which enforce the legal transitions.
// This is the assignment's NFR "modify state only through validation methods".

class ShowSeat {
  constructor(seat, initialStatus) {
    this.seat = seat;
    this._status = initialStatus;
    this._bookingId = null;
  }

  isAvailable() {
    return this._status === SeatStatus.AVAILABLE;
  }

  // Read-only accessor — encapsulation: outside code can SEE the status but
  // can never assign it; transitions only happen through bookSeat/cancelSeat.
  get status() {
    return this._status;
  }

  isBooked() {
    return this._status === SeatStatus.BOOKED;
  }

  label() {
    return `${this.seat.number}`;
  }

  type() {
    return this.seat.seatType;
  }

  // F4 — returns false (and changes nothing) if the seat is not free.
  // Legal entries: AVAILABLE (direct booking) or LOCKED (hold → confirm).
  bookSeat(bookingId) {
    if (this._status === SeatStatus.BOOKED) return false;
    this._status = SeatStatus.BOOKED;
    this._bookingId = bookingId;
    return true;
  }

  // Hold a seat while payment is attempted.
  lock(bookingId) {
    if (!this.isAvailable()) return false;
    this._status = SeatStatus.LOCKED;
    this._bookingId = bookingId;
    return true;
  }

  // F8 + edge case 2 — release back to AVAILABLE (payment failed or cancel).
  cancelSeat() {
    this._status = SeatStatus.AVAILABLE;
    this._bookingId = null;
    return true;
  }

  bookingId() {
    return this._bookingId;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { ShowSeat };
if (typeof window !== 'undefined') window.ShowSeat = ShowSeat;
