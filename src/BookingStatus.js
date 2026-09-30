// ─── BookingStatus ───────────────────────────────────────────────────────────
// One responsibility: enumerate booking lifecycle states.

const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};

if (typeof module !== 'undefined' && module.exports) module.exports = { BookingStatus };
if (typeof window !== 'undefined') window.BookingStatus = BookingStatus;
