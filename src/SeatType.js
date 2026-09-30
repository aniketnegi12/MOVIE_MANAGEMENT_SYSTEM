// ─── SeatType ────────────────────────────────────────────────────────────────
// One responsibility: be the single source of truth for seat categories.
// Knows: its id, label, price.   Does: expose price() and equality.
// Must NOT do: anything about seats' availability, shows, or bookings.
//
// OOP note — Encapsulation: price lives here, private, behind price().
// Clean-code note — Constants: prices are defined ONCE here. Change ₹450
// (the PDF's PLATINUM price was cut off in the original document) in exactly
// one place if your instructor expects a different figure.

class SeatType {
  static SILVER = new SeatType('SILVER', 'Silver', 150);
  static GOLD = new SeatType('GOLD', 'Gold', 250);
  static PLATINUM = new SeatType('PLATINUM', 'Platinum', 450); // price missing in the assignment PDF; 450 chosen as SILVER+300
  static ALL = [SeatType.SILVER, SeatType.GOLD, SeatType.PLATINUM];

  constructor(id, label, price) {
    this.id = id;
    this.label = label;
    this.price = price;
    Object.freeze(this);
  }

  priceOf() {
    return this.price;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { SeatType };
if (typeof window !== 'undefined') window.SeatType = SeatType;
