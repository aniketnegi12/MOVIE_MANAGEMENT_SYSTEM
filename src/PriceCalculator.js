// ─── PriceCalculator ─────────────────────────────────────────────────────────
// One responsibility: turn a list of seats into a total amount (F5).
// Knows: nothing.   Does: sum SeatType prices.   Must NOT do: anything else.
//
// SOLID note — S: who asks for a pricing change asks HERE, never BookingService.

class PriceCalculator {
  static totalFor(showSeats) {
    return showSeats.reduce((sum, ss) => sum + ss.type().priceOf(), 0);
  }

  static breakdown(showSeats) {
    const byType = new Map();
    for (const ss of showSeats) {
      const t = ss.type();
      byType.set(t, (byType.get(t) || 0) + 1);
    }
    return [...byType.entries()].map(([type, count]) => ({
      type: type.label,
      count,
      unit: type.priceOf(),
      subtotal: count * type.priceOf(),
    }));
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { PriceCalculator };
if (typeof window !== 'undefined') window.PriceCalculator = PriceCalculator;
