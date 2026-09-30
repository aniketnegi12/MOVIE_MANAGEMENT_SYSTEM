# 🎬 CineServe — Movie Ticket Booking System

**TCS-504 System Design · Assignment 1** — a single-cinema booking system in **C++ (LLD core)**
with a **bookable website** and a **19-test suite**, all zero-dependency.

▶ **Website:** open `index.html` in any browser (or the single-file build `dist/standalone.html`).
▶ **C++ console program:** `cd cpp && make && ./cinema`
🧪 **Tests:** `node test/booking.test.js` — **19 passing**.

## Features (F1–F8)

| # | Feature | Where |
|---|---------|-------|
| F1 | List all movies currently playing | `Cinema.listMovies()` |
| F2 | For a chosen movie, list its shows (screen + start time) | `Cinema.showsOf()` |
| F3 | Seat layout with AVAILABLE / BOOKED status | `BookingService.seatLayout()` |
| F4 | Book one or more seats (reject already-booked) | `BookingService.holdSeats()` |
| F5 | Pricing: SILVER 150 · GOLD 250 · PLATINUM 450 | `PriceCalculator` |
| F6 | Pay by UPI / Card / Cash — failed payment never confirms | `Payment` hierarchy |
| F7 | Print a ticket (id, movie, screen, time, seats, total) | `TicketPrinter` |
| F8 | Cancel a booking — seats become AVAILABLE again | `BookingService.cancelBooking()` |

## Project layout

```
cpp/                     ← Step F deliverable: modular C++ (one class per file, no headers)
  ├── SeatType.cpp … BookingService.cpp   (17 class files)
  ├── main.cpp            ← single translation unit; includes all in dependency order
  ├── Makefile            ← `make` builds ./cinema
  └── demo-output.txt     ← captured demo run
src/                     ← same LLD in JavaScript, powering the website (one class per file)
index.html               ← the website (red→purple themed)
dist/standalone.html     ← single-file build (node scripts/build-standalone.mjs)
test/booking.test.js     ← 19 assertions covering F1–F8 + all edge cases
docs/                    ← PART D–H documents (.docx, openable in Pages/Word)
  PART-D-Relationships.docx · PART-E-ClassDiagram.docx · PART-F-SequenceDiagram.docx
  PART-G-Code+Demo.docx · PART-H-SOLID.docx
scripts/                 ← generators (build-standalone.mjs, make-docx.py)
```

## Demo run (C++)

```
$ cd cpp && make && ./cinema
==== MOVIE TICKET BOOKING ==================
  PVR.imagined - Dehradun

-- F1 · movies currently playing --
  1. Inception (English, 148 min) ...
-- F4 + F6 + F7 · book A1, A2 (UPI) --
  Payment accepted via UPI
==================================
          MOVIE TICKET
==================================
  Booking ID : BKG-1
  ...
  TOTAL      : Rs.300
==================================
```

Full captured run: `cpp/demo-output.txt`.

## The docs (PART A–H)

- **PART A, B, C** — provided/uploaded by you (`PART A.pages`, `PART-B.pages`, `PARTC.pages`).
- **PART D–H** — generated in `docs/` as `.docx`: relationships with lifetime-test justifications,
  class diagram (3 compartments + visibility markers + Mermaid source), sequence diagram
  (lifelines, activations, «create», returns), modular code + demo run, SOLID mapping +
  deliberate non-goals.

---

*Built for TCS-504 System Design, Assignment 1 · Aniket Negi · [github.com/aniketnegi12](https://github.com/aniketnegi12)*
