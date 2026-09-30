// ─── SeatStatus ──────────────────────────────────────────────────────────────
// One responsibility: enumerate the states a ShowSeat can be in.
// Knows: the three legal states.   Does: nothing else.

const SeatStatus = {
  AVAILABLE: 'AVAILABLE',
  LOCKED: 'LOCKED', // held mid-booking (F4: reject double-booking attempts)
  BOOKED: 'BOOKED',
};

if (typeof module !== 'undefined' && module.exports) module.exports = { SeatStatus };
if (typeof window !== 'undefined') window.SeatStatus = SeatStatus;
