// ─── TicketPrinter ───────────────────────────────────────────────────────────
// One responsibility: format and print a ticket (F7) — printing ONLY.
// Knows: how to format.   Does: render a Booking as lines/HTML.
// Must NOT do: confirm bookings, move seats, or compute totals.
//
// SOLID note — S: Booking never prints; this class owns presentation.

class TicketPrinter {
  static print(booking) {
    const s = booking.summary();
    const line = '═'.repeat(34);
    return [
      line,
      '         🎬  MOVIE TICKET',
      line,
      `  Booking ID : ${s.id}`,
      `  Movie      : ${s.movie}`,
      `  Screen     : ${s.screen}`,
      `  Time       : ${TicketPrinter.fmt(s.time)}`,
      `  Seats      : ${s.seats.join(', ')}`,
      `  Customer   : ${s.customer}`,
      `  Paid via   : ${s.paymentMethod}`,
      `  Status     : ${s.status}`,
      line,
      `  TOTAL      : ₹${s.total}`,
      line,
    ].join('\n');
  }

  static fmt(t) {
    if (typeof t === 'string') return t;
    return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { TicketPrinter };
if (typeof window !== 'undefined') window.TicketPrinter = TicketPrinter;
