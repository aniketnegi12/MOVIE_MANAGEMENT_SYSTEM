if (typeof module !== 'undefined' && module.exports && typeof Payment === 'undefined') {
  Object.assign(globalThis, require('./Payment.js'));
}

// ─── CardPayment ─────────────────────────────────────────────────────────────
// One responsibility: pay by card (Luhn check + expiry validation).
// Knows: card number, expiry, cvv.   Does: validate + pay.
// Must NOT do: know about Booking or BookingService.

class CardPayment extends Payment {
  constructor(cardNumber, expiry, cvv, simulateFailure = false) {
    super('CARD');
    this.cardNumber = (cardNumber || '').replace(/\s+/g, '');
    this.expiry = expiry || '';
    this.cvv = (cvv || '').trim();
    this.simulateFailure = simulateFailure;
  }

  pay(amount) {
    if (amount === undefined) {
      const ok = !this.simulateFailure;
      return {
        ok,
        reason: ok ? null : 'Card declined by issuer',
        reference: ok ? `CARD-${Date.now() % 100000}` : null,
      };
    }
    if (!/^\d{16}$/.test(this.cardNumber)) {
      return { ok: false, reason: 'Card number must be 16 digits' };
    }
    if (!CardPayment.luhn(this.cardNumber)) {
      return { ok: false, reason: 'Card number failed the Luhn checksum' };
    }
    if (!/^\d{2}\/\d{2}$/.test(this.expiry)) {
      return { ok: false, reason: 'Expiry must be MM/YY' };
    }
    if (!/^\d{3}$/.test(this.cvv)) {
      return { ok: false, reason: 'CVV must be 3 digits' };
    }
    return { ok: true, reference: `CARD-${Date.now() % 100000}` };
  }

  // Compile-time polymorphism hint: overloaded validation entry points.
  static luhn(numStr) {
    let sum = 0;
    let dbl = false;
    for (let i = numStr.length - 1; i >= 0; i--) {
      let d = numStr.charCodeAt(i) - 48;
      if (dbl) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { CardPayment };
if (typeof window !== 'undefined') window.CardPayment = CardPayment;
