if (typeof module !== 'undefined' && module.exports && typeof Payment === 'undefined') {
  Object.assign(globalThis, require('./Payment.js'));
}

// ─── CashPayment ─────────────────────────────────────────────────────────────
// One responsibility: pay by cash at the counter.
// Knows: amount tendered.   Does: confirm if tendered ≥ due.
// Must NOT do: know about Booking or BookingService.

class CashPayment extends Payment {
  constructor(tendered = Infinity) {
    super('CASH');
    this.tendered = tendered;
  }

  pay(amount) {
    if (amount === undefined) {
      return { ok: true, reference: `CASH-${Date.now() % 100000}` };
    }
    if (this.tendered < amount) {
      return { ok: false, reason: `Tendered ₹${this.tendered} is less than due ₹${amount}` };
    }
    return { ok: true, reference: `CASH-${Date.now() % 100000}` };
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { CashPayment };
if (typeof window !== 'undefined') window.CashPayment = CashPayment;
