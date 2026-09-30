if (typeof module !== 'undefined' && module.exports && typeof Payment === 'undefined') {
  Object.assign(globalThis, require('./Payment.js'));
}

// ─── UpiPayment ──────────────────────────────────────────────────────────────
// One responsibility: pay by UPI (upi-id validation + success/failure).
// Knows: UPI id, simulated success flag.   Does: validate + pay.
// Must NOT do: know about Booking or BookingService.

class UpiPayment extends Payment {
  constructor(upiId, simulateFailure = false) {
    super('UPI');
    this.upiId = upiId;
    this.simulateFailure = simulateFailure;
  }

  // Overloaded-style entry: pay() without args runs the demo simulation.
  pay(amount) {
    if (this.simulateFailure) {
      return { ok: false, reason: 'UPI collect request declined', reference: null };
    }
    if (amount === undefined) {
      return { ok: true, reference: `UPI-${Date.now() % 100000}` };
    }
    const valid = /^[a-z0-9.\-_]{2,}@[a-z]{2,}$/i.test(this.upiId || '');
    if (!valid) {
      return { ok: false, reason: 'Invalid UPI id (expected name@bank)' };
    }
    return { ok: true, reference: `UPI-${Date.now() % 100000}` };
  }

  simulatePayment() {
    const ok = !this.simulateFailure;
    return {
      ok,
      reason: ok ? null : 'UPI collect request declined',
      reference: ok ? `UPI-${Date.now() % 100000}` : null,
    };
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { UpiPayment };
if (typeof window !== 'undefined') window.UpiPayment = UpiPayment;
