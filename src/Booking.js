if (typeof module !== 'undefined' && module.exports && typeof BookingStatus === 'undefined') {
  Object.assign(globalThis, require('./BookingStatus.js'));
}

// ─── Booking ─────────────────────────────────────────────────────────────────
// One responsibility: record ONE booking — which show, which seats, amount, status.
// Knows: id, show, seat labels, total, status, customer.   Does: transitions.
// Must NOT do: print tickets (TicketPrinter's job) or charge anyone.
//
// OOP note — Static members: nextId is static; every Booking gets a unique id.
// OOP note — Encapsulation: amount/status are private, changed only via
// confirm()/cancel() so an illegal state is unrepresentable.

class Booking {
  static _nextId = 1; // static counter — unique booking ids (assignment requirement)

  constructor(customer, show, showSeats) {
    this._id = `BKG-${String(Booking._nextId++).padStart(4, '0')}`;
    this.customer = customer;
    this.show = show;
    this.showSeats = showSeats;
    this._totalAmount = showSeats.reduce((sum, ss) => sum + ss.type().priceOf(), 0);
    this._status = BookingStatus.PENDING;
    this.paymentMethod = null;
  }

  get id() {
    return this._id;
  }

  totalAmount() {
    return this._totalAmount;
  }

  status() {
    return this._status;
  }

  seatNumbers() {
    return this.showSeats.map((ss) => ss.seat.number);
  }

  // Edge case 2 — a booking only becomes CONFIRMED after a successful payment.
  confirm(paymentMethod) {
    this._status = BookingStatus.CONFIRMED;
    this.paymentMethod = paymentMethod;
    return this;
  }

  // F8 / edge case 3 — cancellation is a legal transition, not a delete.
  cancel() {
    if (this._status !== BookingStatus.CONFIRMED) return false;
    this._status = BookingStatus.CANCELLED;
    return true;
  }

  isConfirmed() {
    return this._status === BookingStatus.CONFIRMED;
  }

  summary() {
    return {
      id: this._id,
      movie: this.show.movie.title,
      screen: this.show.screen.screenNo,
      time: this.show.startTime,
      seats: this.seatNumbers(),
      total: this._totalAmount,
      status: this._status,
      paymentMethod: this.paymentMethod,
      customer: this.customer.name,
    };
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Booking };
if (typeof window !== 'undefined') window.Booking = Booking;
