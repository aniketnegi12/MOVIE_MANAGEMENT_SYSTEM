// ─── Test runner note ────────────────────────────────────────────────────────
// Dependency-free: `node test/booking.test.js` runs it. No packages, no config.
const assert = require('assert');

const order = [
  'SeatStatus', 'BookingStatus', 'SeatType', 'Movie', 'Seat', 'Screen',
  'ShowSeat', 'Show', 'Customer', 'Booking', 'Payment', 'UpiPayment',
  'CardPayment', 'CashPayment', 'PriceCalculator', 'TicketPrinter',
  'Cinema', 'BookingService', 'demo-data',
];
const M = {};
for (const f of order) Object.assign(M, require(`../src/${f}.js`));

const { SeatStatus, BookingStatus, SeatType, Screen, Cinema, Customer, Booking,
        UpiPayment, CardPayment, CashPayment, PriceCalculator, TicketPrinter,
        BookingService, buildDemoCinema } = M;

let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.error(`  ✗ ${name}\n    ${e.message}`); }
}

const { cinema, movies } = buildDemoCinema();
const svc = new BookingService(cinema);
const me = new Customer('Aniket', '9999999999');

// ── F1 — list movies ──
test('F1: lists movies currently playing', () => {
  const list = cinema.listMovies();
  assert.strictEqual(list.length, 4);
  assert.ok(list.some((m) => m.title === 'Inception'));
});

// ── F2 — shows of a movie ──
test('F2: lists shows (screen + time) for a movie', () => {
  const shows = cinema.showsOf(movies[0]);
  assert.strictEqual(shows.length, 2);
  assert.deepStrictEqual(shows.map((s) => s.startTime).sort(), ['18:30', '21:00']);
});

// ── F3 — seat layout ──
test('F3: seat layout shows AVAILABLE for all seats of a fresh show', () => {
  const layout = svc.seatLayout(cinema.showsOf(movies[0])[0].id);
  assert.ok(layout.ok);
  assert.strictEqual(layout.seats.size, Screen.defaultLayout().reduce((n, r) => n + r.count, 0));
  for (const ss of layout.seats.values()) assert.strictEqual(ss.status, SeatStatus.AVAILABLE);
});

test('F3: unknown show id → clear error, no crash', () => {
  const r = svc.seatLayout('NOPE');
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('NOPE'));
});

// ── F4 + edge case 1 ──
test('F4: booking one seat creates PENDING booking and holds seat', () => {
  const show = cinema.showsOf(movies[1])[0];
  const r = svc.holdSeats(me, show.id, ['A1']);
  assert.ok(r.ok);
  assert.strictEqual(r.booking.status(), BookingStatus.PENDING);
  assert.strictEqual(show.seatStatus('A1'), SeatStatus.LOCKED);
});

test('edge 1: booking an already-taken seat is rejected, nothing changes', () => {
  const show = cinema.showsOf(movies[1])[0];
  const before = show.seatStatus('A1');
  const r = svc.holdSeats(me, show.id, ['A1']);
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('already BOOKED'));
  assert.strictEqual(show.seatStatus('A1'), before); // unchanged
});

test('edge 4: invalid seat number → clear message, no crash', () => {
  const show = cinema.showsOf(movies[1])[0];
  const r = svc.holdSeats(me, show.id, ['Z99']);
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('does not exist'));
});

test('edge 4: empty seat list rejected', () => {
  const show = cinema.showsOf(movies[1])[0];
  const r = svc.holdSeats(me, show.id, []);
  assert.strictEqual(r.ok, false);
});

// ── F5 — pricing ──
test('F5: SILVER 150, GOLD 250, PLATINUM 450', () => {
  assert.strictEqual(SeatType.SILVER.priceOf(), 150);
  assert.strictEqual(SeatType.GOLD.priceOf(), 250);
  assert.strictEqual(SeatType.PLATINUM.priceOf(), 450);
  assert.strictEqual(PriceCalculator.totalFor([
    { type: () => SeatType.SILVER },
    { type: () => SeatType.GOLD },
    { type: () => SeatType.PLATINUM },
  ]), 850);
});

// ── F6 + edge case 2 ──
test('F6: successful UPI payment confirms booking (LOCKED → BOOKED)', () => {
  const show = cinema.showsOf(movies[2])[0];
  const held = svc.holdSeats(me, show.id, ['G5']);
  const r = svc.payFor(held.booking, new UpiPayment('aniket@okaxis'));
  assert.ok(r.ok);
  assert.strictEqual(r.booking.status(), BookingStatus.CONFIRMED);
  assert.strictEqual(show.seatStatus('G5'), SeatStatus.BOOKED);
});

test('edge 2: failed payment → NOT confirmed, seats released', () => {
  const show = cinema.showsOf(movies[2])[0];
  const held = svc.holdSeats(me, show.id, ['A9']);
  const r = svc.payFor(held.booking, new UpiPayment('bad@upi', true)); // simulated decline
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.booking.status(), BookingStatus.PENDING); // never confirmed
  assert.strictEqual(show.seatStatus('A9'), SeatStatus.AVAILABLE); // released
});

test('F6: invalid UPI id rejected by validation', () => {
  const p = new UpiPayment('not-an-upi');
  const r = p.pay(100);
  assert.strictEqual(r.ok, false);
  assert.ok(r.reason.includes('UPI'));
});

test('F6: card must pass Luhn; 4242424242424242 works', () => {
  assert.strictEqual(new CardPayment('4242424242424242', '12/29', '123').pay(100).ok, true);
  assert.strictEqual(new CardPayment('4242424242424241', '12/29', '123').pay(100).ok, false);
  assert.strictEqual(new CardPayment('1234', '12/29', '123').pay(100).ok, false);
});

test('F6: cash with insufficient tender fails; sufficient succeeds', () => {
  assert.strictEqual(new CashPayment(100).pay(150).ok, false);
  assert.strictEqual(new CashPayment(500).pay(150).ok, true);
});

// ── F7 — ticket ──
test('F7: ticket contains booking id, movie, screen, time, seats, total', () => {
  const show = cinema.showsOf(movies[3])[1]; // the 22:00 show
  const held = svc.holdSeats(me, show.id, ['I1', 'I2']);
  const paid = svc.payFor(held.booking, new CashPayment());
  const ticket = TicketPrinter.print(paid.booking);
  for (const needle of ['BKG-', 'Interstellar', 'Screen', '22:00', 'I1', 'I2', '₹900']) {
    assert.ok(ticket.includes(needle), `ticket missing ${needle}`);
  }
});

// ── F8 + edge case 3 ──
test('edge 3: cancelling a confirmed booking frees the seats', () => {
  const show = cinema.showsOf(movies[0])[1];
  const held = svc.holdSeats(me, show.id, ['I3']);
  svc.payFor(held.booking, new UpiPayment('aniket@okaxis'));
  assert.strictEqual(show.seatStatus('I3'), SeatStatus.BOOKED);
  const r = svc.cancelBooking(held.booking.id);
  assert.ok(r.ok);
  assert.strictEqual(r.booking.status(), BookingStatus.CANCELLED);
  assert.strictEqual(show.seatStatus('I3'), SeatStatus.AVAILABLE);
});

test('F8: cannot cancel a pending/cancelled booking', () => {
  const show = cinema.showsOf(movies[0])[1];
  const held = svc.holdSeats(me, show.id, ['I4']);
  assert.strictEqual(svc.cancelBooking(held.booking.id).ok, false); // PENDING
  const again = svc.cancelBooking('BKG-9999');
  assert.strictEqual(again.ok, false);
});

// ── OOP invariants ──
test('Payment is abstract — cannot instantiate the base', () => {
  assert.throws(() => new Payment());
});

test('Booking ids are unique (static counter)', () => {
  const ids = new Set();
  for (let i = 0; i < 3; i++) {
    const show = cinema.showsOf(movies[1])[1];
    const b = svc.holdSeats(me, show.id, [`C${i + 2}`]).booking;
    ids.add(b.id);
  }
  assert.strictEqual(ids.size, 3);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
