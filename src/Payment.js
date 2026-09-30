// ─── Payment (abstract base) ─────────────────────────────────────────────────
// One responsibility: THE payment contract — pay(amount) → bool.
// Knows: nothing concrete.   Does: nothing concrete (abstract).
// Must NOT do: know about bookings, seats, or the console/UI.
//
// OOP note — Abstraction: pay() is abstract; subclasses decide HOW to pay.
// SOLID note — O + D: adding NetBanking = one new subclass, zero edits to
// BookingService or any existing class. BookingService depends on this
// abstraction, never on a concrete payment.

class Payment {
  constructor(methodName) {
    if (new.target === Payment) {
      throw new Error('Payment is abstract — instantiate UpiPayment, CardPayment or CashPayment');
    }
    this.methodName = methodName;
  }

  // Abstract — every subclass MUST implement pay(amount) → boolean.
  pay(amount) {
    throw new Error('pay() is abstract — implement in the subclass');
  }

  label() {
    return this.methodName;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Payment };
if (typeof window !== 'undefined') window.Payment = Payment;
