if (typeof module !== 'undefined' && module.exports && typeof Booking === 'undefined') {
  Object.assign(globalThis, require('./Booking.js'), require('./BookingStatus.js'));
}

// ─── BookingService (the orchestrator) ───────────────────────────────────────
// One responsibility: run the booking flow end-to-end (F4–F8).
// Knows: Cinema, PriceCalculator, TicketPrinter.   Does: orchestrate.
// Must NOT do: create a CardPayment itself (D — it receives a Payment), print.
//
// Edge cases (assignment §10):
//  1. booking an already-BOOKED seat → rejected, nothing changes
//  2. failed payment → booking NOT confirmed, seats released
//  3. cancelling → seats become AVAILABLE again
//  4. invalid seat/menu input → clear message, no crash

class BookingService {
  constructor(cinema) {
    this.cinema = cinema;
    this.bookings = []; // in-memory store (single cinema scope)
  }

  // F3 — the seat layout with status for a show (a VIEW, never mutates).
  seatLayout(showId) {
    const show = this.cinema.findShow(showId);
    if (!show) return { ok: false, reason: `No show ${showId}` };
    return { ok: true, show, rows: show.layoutRows(), seats: show.showSeats };
  }

  // F4 — validate + hold seats; returns a Booking in PENDING or { ok:false }.
  holdSeats(customer, showId, seatNumbers) {
    const show = this.cinema.findShow(showId);
    if (!show) return { ok: false, reason: `No show with id ${showId}` };
    if (!seatNumbers || seatNumbers.length === 0) {
      return { ok: false, reason: 'Pick at least one seat' };
    }

    const showSeats = [];
    for (const no of seatNumbers) {
      const ss = show.showSeats.get(no);
      if (!ss) return { ok: false, reason: `Seat ${no} does not exist — pick a valid seat` };
      if (!ss.isAvailable()) {
        return { ok: false, reason: `Seat ${no} is already BOOKED — pick another` };
      }
      showSeats.push(ss);
    }

    const booking = new Booking(customer, show, showSeats);
    for (const ss of showSeats) ss.lock(booking.id); // hold during payment
    this.bookings.push(booking);
    return { ok: true, booking };
  }

  // F6 — pay for a PENDING booking; on failure, release the held seats.
  payFor(booking, payment) {
    if (!booking || booking.status() !== BookingStatus.PENDING) {
      return { ok: false, reason: 'Booking is not awaiting payment' };
    }
    const result = payment.pay(booking.totalAmount());
    if (!result.ok) {
      for (const ss of booking.showSeats) ss.cancelSeat(); // edge case 2
      return { ok: false, booking, reason: result.reason || 'Payment failed — seats released' };
    }
    for (const ss of booking.showSeats) ss.bookSeat(booking.id); // LOCKED → BOOKED
    booking.confirm(payment.label());
    return { ok: true, booking, reference: result.reference };
  }

  // F8 — cancel a CONFIRMED booking; seats become AVAILABLE again.
  cancelBooking(bookingId) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { ok: false, reason: `No booking ${bookingId}` };
    if (!booking.cancel()) {
      return { ok: false, reason: `Booking ${bookingId} is ${booking.status()} — cannot cancel` };
    }
    for (const ss of booking.showSeats) ss.cancelSeat();
    return { ok: true, booking, refund: this._refundIfPossible(booking) };
  }

  _refundIfPossible(booking) {
    // SOLID note — I: refund is optional capability, probed via instanceof —
    // Payment does NOT force refund() on all children.
    if (booking.paymentMethod === 'CASH') return null;
    const amount = booking.totalAmount();
    return { amount, to: booking.paymentMethod, eta: '3–5 working days' };
  }

  myBookings() {
    return this.bookings.filter((b) => b.status() !== BookingStatus.CANCELLED);
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { BookingService };
if (typeof window !== 'undefined') window.BookingService = BookingService;
