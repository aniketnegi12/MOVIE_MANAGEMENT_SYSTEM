// ─── Customer ────────────────────────────────────────────────────────────────
// One responsibility: identify the person booking — name and phone.
// Knows: name, phone.   Does: nothing (pure data).
// Must NOT do: create bookings or hold payment objects.

class Customer {
  constructor(name, phone) {
    this.name = name;
    this.phone = phone;
  }
}

if (typeof module !== 'undefined' && module.exports) module.exports = { Customer };
if (typeof window !== 'undefined') window.Customer = Customer;
