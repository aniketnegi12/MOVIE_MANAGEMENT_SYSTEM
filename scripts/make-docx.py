#!/usr/bin/env python3
# ─── make-docx.py ────────────────────────────────────────────────────────────
# Generates minimal, valid .docx files (openable in Pages/Word/Google Docs)
# without any external library — a .docx is just a zip of OOXML parts.
# Run: python3 scripts/make-docx.py
import zipfile, os, sys

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs')

CT = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>'''

RELS = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

DOC_HEAD = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'''

DOC_TAIL = '''</w:body></w:document>'''

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def para(text, style=None, mono=False):
    rpr = '<w:rPr><w:rFonts w:ascii="Menlo" w:hAnsi="Menlo"/></w:rPr>' if mono else ''
    ppr = f'<w:pPr><w:pStyle w:val="{style}"/></w:pPr>' if style else ''
    lines = esc(text).split('\n')
    out = ''
    for ln in lines:
        out += f'<w:p>{ppr}<w:r>{rpr}<w:t xml:space="preserve">{ln}</w:t></w:r></w:p>'
    return out

def heading(text, level=1):
    return para(text, style=f'Heading{level}')

def write_docx(path, body_xml):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', CT)
        z.writestr('_rels/.rels', RELS)
        z.writestr('word/document.xml', DOC_HEAD + body_xml + DOC_TAIL)
    print(f'  wrote {path} ({os.path.getsize(path)} bytes)')

# ═════════════════════════════ PART D ═══════════════════════════════════════
partD = []
partD.append(heading('PART D — Relationship Table (with justification)', 1))
partD.append(para('Lifetime test: "If the whole is destroyed, does the part die?" '
                  'YES → composition. NO (but owned identity) → aggregation. '
                  'Independent lifecycles → association. IS-A → inheritance.'))
partD.append(heading('Answered pairs', 2))
rows = [
    ('Cinema → Screen', 'Composition',
     'Screens exist only inside their cinema — demolish the cinema and the screens cease to exist as screens of that theatre. Created in/owned by the cinema. Lifetime: dies with whole.'),
    ('Screen → Seat', 'Composition',
     'Seats are manufactured as part of the auditorium; a seat without its screen is meaningless. Screen builds its seat inventory in its constructor. Lifetime: dies with whole.'),
    ('Show → Movie', 'Association',
     'A movie exists before and after any particular screening; shows merely reference a movie from the catalog. Lifetime: independent.'),
    ('Show → Screen', 'Association',
     'A screening uses an existing auditorium; screen outlives the schedule entry. Lifetime: independent.'),
    ('Show → ShowSeat', 'Composition',
     'A ShowSeat is "seat X for THIS show" — its very identity depends on the show. Cancel the show, and that status record is meaningless. Created inside Show\'s constructor. Lifetime: dies with whole.'),
    ('Booking → Customer', 'Association',
     'The customer exists before the booking and survives its cancellation. Lifetime: independent.'),
    ('Booking → ShowSeat', 'Association',
     'Booking references seat-status objects owned by the Show; when a booking is deleted (or cancelled), the ShowSeats persist — they merely return to AVAILABLE. Lifetime: independent.'),
    ('Booking → Payment', 'Association',
     'A payment records a transaction with its own lifecycle (receipt/refund); it does not die when a booking is later cancelled. Lifetime: independent.'),
    ('Payment → UpiPayment', 'Inheritance',
     'UpiPayment IS-A Payment: same contract (pay(amount)), specialised behaviour. Classic IS-A test.'),
    ('BookingService → Booking', 'Association (uses)',
     'The service creates and references bookings but does not own their lifecycle within the domain — bookings can exist in a store/repository. Lifetime: independent.'),
]
for name, choice, just in rows:
    partD.append(heading(f'{name} → {choice}', 3))
    partD.append(para(f'Justification: {just}'))
partD.append(heading('Rejected relationships (design decisions)', 2))
partD.append(para('Cinema → Show is composition in the code (shows die with the cinema) but is '
                  'conceptually an aggregate if shows could be migrated between cinemas; for this '
                  'single-cinema scope composition is chosen and justified by the lifetime test.'))
partD.append(para('Booking → Show: association, not composition — the show outlives individual bookings; '
                  'the booking only references it.'))
write_docx(os.path.join(OUT_DIR, 'PART-D-Relationships.docx'), ''.join(partD))

# ═════════════════════════════ PART E ═══════════════════════════════════════
partE = []
partE.append(heading('PART E — Class Diagram', 1))
partE.append(para('Notation used below: - private, # protected, + public. '
                  'Filled diamond = composition, hollow diamond = aggregation, '
                  'open arrow = association, hollow triangle = inheritance.'))
partE.append(heading('Classes with three compartments (name / attributes / methods)', 2))
classes = [
    ('Cinema',
     '- name: String\n- screens: List<Screen>\n- shows: List<Show>\n- showSeq: int',
     '+ listMovies(): List<Movie>\n+ showsOf(movie): List<Show>\n+ findShow(id): Show\n+ addShow(m, s, t): Show*'),
    ('Screen',
     '- screenNo: int\n- seats: List<Seat>',
     '+ seatByNumber(no): Seat*\n+ getSeats(): List<Seat>'),
    ('Seat',
     '- number: String\n- type: SeatType',
     '+ getNumber(): String\n+ getType(): SeatType'),
    ('SeatType',
     '- idStr: String\n- labelStr: String\n- price: int',
     '+ priceOf(): int\n+ SILVER(): SeatType$\n+ GOLD(): SeatType$\n+ PLATINUM(): SeatType$'),
    ('Movie',
     '- title: String\n- language: String\n- durationMin: int',
     '+ getTitle(): String\n+ getLanguage(): String\n+ getDuration(): int'),
    ('Show',
     '- id: String\n- movie: Movie*\n- screen: Screen*\n- startTime: String\n- showSeats: Map<String, ShowSeat>',
     '+ findSeat(no): ShowSeat*\n+ availableCount(): int\n+ totalSeats(): int'),
    ('ShowSeat',
     '- seat: Seat&\n- status: SeatStatus\n- bookingId: String',
     '+ isAvailable(): bool\n+ isBooked(): bool\n+ lock(id): bool\n+ bookSeat(id): bool\n+ cancelSeat(): bool'),
    ('Customer',
     '- name: String\n- phone: String',
     '+ getName(): String\n+ getPhone(): String'),
    ('Booking',
     '- id: String\n- show: Show*\n- showSeats: List<ShowSeat*>\n- totalAmount: int\n- status: BookingStatus\n- paymentMethod: String\n- nextId: int$',
     '+ getId(): String\n+ getTotalAmount(): int\n+ seatList(): String\n+ confirm(method)\n+ cancel(): bool'),
    ('Payment {abstract}',
     '# methodName: String\n# lastReason: String',
     '+ pay(amount): bool {abstract}\n+ failureReason(): String\n+ label(): String'),
    ('UpiPayment',
     '- upiId: String\n- simulateFailure: bool',
     '+ pay(amount): bool'),
    ('CardPayment',
     '- number: String\n- expiry: String\n- cvv: String\n- simulateFailure: bool',
     '+ pay(amount): bool\n- luhn(num)$: bool\n- validExpiry(e)$: bool'),
    ('CashPayment',
     '- tendered: int',
     '+ pay(amount): bool'),
    ('PriceCalculator',
     '',
     '+ totalFor(seats)$: int'),
    ('TicketPrinter',
     '',
     '+ print(booking)$: void'),
    ('BookingService',
     '- cinema: Cinema&\n- bookings: List<Booking*>',
     '+ seatLayout(showId): void\n+ holdSeats(c, showId, seats): Booking*\n+ payFor(b, p): bool\n+ cancelBooking(id): bool\n+ findBooking(id): Booking*\n+ printMyBookings(): void'),
]
for name, attrs, methods in classes:
    partE.append(heading(name, 3))
    if attrs: partE.append(para(attrs, mono=True))
    if methods: partE.append(para(methods, mono=True))
partE.append(heading('Relationship notation for the drawn diagram', 2))
partE.append(para('Cinema ◆— Screen (composition, 1 → 1..*)\n'
                  'Screen ◆— Seat (composition, 1 → 1..*)\n'
                  'Show ◆— ShowSeat (composition, 1 → 1..*)\n'
                  'Show —— Movie (association, 1 → 1)\n'
                  'Show —— Screen (association, 1 → 1)\n'
                  'Seat —— SeatType (association, 1 → 1)\n'
                  'Booking —— ShowSeat (association, 1 → 1..*)\n'
                  'Booking —— Customer (association, 1 → 1)\n'
                  'Payment ◁— UpiPayment / CardPayment / CashPayment (inheritance)\n'
                  'BookingService ..> Booking (dependency/uses)\n'
                  'BookingService ..> Payment (depends on abstraction — D)', mono=True))
partE.append(heading('Mermaid source (paste into mermaid.live to render/export PNG)', 2))
MERMAID_CLASS = '''classDiagram
    direction LR
    Cinema *-- Screen
    Screen *-- Seat
    Show *-- ShowSeat
    Show --> Movie
    Show --> Screen
    Seat --> SeatType
    ShowSeat --> Seat
    Booking "1" --> "1..*" ShowSeat
    Booking --> Customer
    Booking --> Show
    Payment <|-- UpiPayment
    Payment <|-- CardPayment
    Payment <|-- CashPayment
    BookingService ..> Booking
    BookingService ..> Payment
'''
partE.append(para(MERMAID_CLASS.strip(), mono=True))
write_docx(os.path.join(OUT_DIR, 'PART-E-ClassDiagram.docx'), ''.join(partE))

# ═════════════════════════════ PART F ═══════════════════════════════════════
partF = []
partF.append(heading('PART F — Sequence Diagram: "customer books 1 seat and pays by UPI"', 1))
partF.append(para('Lifelines: Customer, BookingService, Show, ShowSeat, PriceCalculator, '
                  'UpiPayment, Booking, TicketPrinter.'))
partF.append(para('Activation bars shown as → object is busy. «create» messages marked.'))
partF.append(heading('Message sequence (numbered, synchronous)', 2))
msgs = [
    'Customer → BookingService: holdSeats(customer, "S1", ["A1"])',
    'BookingService → Show: findSeat("A1")   [activate Show]',
    'Show → ShowSeat: (returns reference)   [«returns»]',
    'BookingService → ShowSeat: isAvailable()   [activate ShowSeat]',
    'ShowSeat → BookingService: true   [return]',
    'BookingService → Booking: «create» new Booking(customer, show, [A1])',
    'Booking → BookingService: booking (PENDING)   [return]',
    'BookingService → ShowSeat: lock(bookingId)   [seat → LOCKED]',
    'ShowSeat → BookingService: held   [return]',
    'BookingService → Customer: {ok, booking}   [return]',
    'Customer → BookingService: payFor(booking, upiPayment)',
    'BookingService → PriceCalculator: totalFor([A1])   [activate PriceCalculator]',
    'PriceCalculator → BookingService: Rs.150   [return]',
    'BookingService → UpiPayment: pay(150)   [activate UpiPayment — runtime polymorphism]',
    'UpiPayment → BookingService: {ok, reference}   [return]',
    'BookingService → ShowSeat: bookSeat(bookingId)   [LOCKED → BOOKED]',
    'ShowSeat → BookingService: BOOKED   [return]',
    'BookingService → Booking: confirm("UPI")   [PENDING → CONFIRMED]',
    'Booking → BookingService: CONFIRMED   [return]',
    'BookingService → Customer: {ok, booking}   [return]',
    'Customer → TicketPrinter: print(booking)   [activate TicketPrinter]',
    'TicketPrinter → Customer: ticket (id, movie, screen, time, seats, total)   [return]',
]
partF.append(para('\n'.join(f'{i}. {m}' for i, m in enumerate(msgs, 1)), mono=True))
partF.append(heading('Edge-case branches (shown as alt fragments in the drawn diagram)', 2))
partF.append(para('alt payment fails: UpiPayment → BookingService: {ok:false, reason} → '
                  'BookingService → ShowSeat: cancelSeat() (release) → Customer: {ok:false} — '
                  'booking NEVER confirmed.'))
partF.append(heading('Mermaid source (paste into mermaid.live to render/export PNG)', 2))
MERMAID_SEQ = '''sequenceDiagram
    actor C as Customer
    participant BS as BookingService
    participant SH as Show
    participant SS as ShowSeat
    participant PC as PriceCalculator
    participant P as UpiPayment
    participant B as Booking
    participant TP as TicketPrinter
    C->>BS: holdSeats("S1", ["A1"])
    BS->>SH: findSeat("A1")
    SH-->>BS: showSeat
    BS->>SS: isAvailable()
    SS-->>BS: true
    BS->>B: <<create>> Booking
    B-->>BS: PENDING
    BS->>SS: lock(id)
    BS-->>C: ok, booking
    C->>BS: payFor(booking, upi)
    BS->>PC: totalFor([A1])
    PC-->>BS: 150
    BS->>P: pay(150)
    P-->>BS: ok
    BS->>SS: bookSeat(id)
    BS->>B: confirm("UPI")
    BS-->>C: ok
    C->>TP: print(booking)
    TP-->>C: ticket
'''
partF.append(para(MERMAID_SEQ.strip(), mono=True))
write_docx(os.path.join(OUT_DIR, 'PART-F-SequenceDiagram.docx'), ''.join(partF))

# ═════════════════════════════ PART G ═══════════════════════════════════════
partG = []
partG.append(heading('PART G — Modular Working Code + Demo Run', 1))
partG.append(heading('Course rules compliance', 2))
partG.append(para('One class per file: YES — 17 class files in cpp/.\n'
                  'No header files: YES — classes are composed by including the .cpp files in '
                  'dependency order inside main.cpp (the only translation unit).\n'
                  'Build: make  →  ./cinema', mono=True))
partG.append(heading('File structure', 2))
partG.append(para('cpp/\n'
                  '├── SeatType.cpp      (value object, price constants)\n'
                  '├── SeatStatus.cpp    (SeatStatus + BookingStatus enums)\n'
                  '├── Movie.cpp  Seat.cpp  Screen.cpp  Cinema.cpp  Show.cpp  ShowSeat.cpp\n'
                  '├── Customer.cpp  Booking.cpp\n'
                  '├── Payment.cpp  UpiPayment.cpp  CardPayment.cpp  CashPayment.cpp\n'
                  '├── PriceCalculator.cpp  TicketPrinter.cpp\n'
                  '├── BookingService.cpp\n'
                  '├── main.cpp   (includes all — the single translation unit)\n'
                  '└── Makefile', mono=True))
partG.append(heading('OOP concepts — where they appear (with pointers)', 2))
oop = [
    ('Encapsulation', 'ShowSeat: status is private; changes only via bookSeat()/lock()/cancelSeat(). Booking: totalAmount/status private with confirm()/cancel() guards.'),
    ('Abstraction', 'Payment: pure virtual pay(amount) = 0 — cannot be instantiated.'),
    ('Inheritance', 'UpiPayment, CardPayment, CashPayment extend Payment.'),
    ('Runtime polymorphism', 'service.payFor(b, p) calls p.pay(total) — dispatches to UPI/Card/Cash at runtime through Payment*.'),
    ('Compile-time polymorphism', 'Overloaded constructors in Movie/Customer; overloaded luhn() helpers in CardPayment.'),
    ('Static members', 'Booking::nextId — shared counter generating unique booking ids (BKG-1, BKG-2, ...).'),
    ('this keyword', 'Used throughout accessors: return this->title; distinguishes member from parameter.'),
    ('Composition', 'Cinema owns Screens; Screen owns Seats; Show owns ShowSeats (created in constructors).'),
    ('Aggregation', 'Show references Movie/Screen created elsewhere (they outlive the show).'),
    ('Association', 'Booking references Customer/ShowSeat; BookingService uses Booking.'),
]
for k, v in oop:
    partG.append(heading(k, 3)); partG.append(para(v))
partG.append(heading('Demo run (actual output)', 2))
demo = os.path.join(os.path.dirname(__file__), '..', 'cpp', 'demo-output.txt')
if os.path.exists(demo):
    partG.append(para(open(demo).read(), mono=True))
else:
    partG.append(para('Run: make && ./cinema — output captured in cpp/demo-output.txt', mono=True))
write_docx(os.path.join(OUT_DIR, 'PART-G-Code+Demo.docx'), ''.join(partG))

# ═════════════════════════════ PART H ═══════════════════════════════════════
partH = []
partH.append(heading('PART H — SOLID Mapping + What We Deliberately Did NOT Do', 1))
partH.append(heading('SOLID — where each principle lives', 2))
solid = [
    ('S — Single Responsibility',
     'Booking never prints (TicketPrinter does); pricing lives only in PriceCalculator; '
     'whoever asks for a price change edits exactly one file. ShowSeat owns only seat-status transitions.'),
    ('O — Open/Closed',
     'Adding NetBankingPayment: create one new class extending Payment — BookingService, '
     'the menu and every existing class stay untouched. The system is open for extension, closed for modification.'),
    ('L — Liskov Substitution',
     'Every Payment child honours the same contract — pay(amount) → bool with failureReason() — '
     'and works through Payment* with no extra setup calls or type checks.'),
    ('I — Interface Segregation',
     'Payment does NOT force refund() on all children. Refunds are a capability only some methods '
     'have (cash has no refund trail); the service checks the payment method instead of forcing an empty method.'),
    ('D — Dependency Inversion',
     'BookingService.payFor(b, Payment&) receives the abstraction — it never constructs a '
     'CardPayment itself. High-level policy depends on the Payment abstraction, not concrete payments.'),
]
for k, v in solid:
    partH.append(heading(k, 3)); partH.append(para(v))
partH.append(heading('One thing we deliberately did NOT do', 2))
partH.append(para('We did NOT implement concurrent booking across processes with database persistence. '
                  'Reason: the assignment scope is a single cinema, single user console program; '
                  'adding a transactional backend would move the design away from the LLD being graded. '
                  'The LOCKED seat state demonstrates the hold-then-confirm PATTERN that a real '
                  'distributed system would enforce transactionally.'))
partH.append(heading('Edge cases demonstrated', 2))
partH.append(para('1. Booking an already-BOOKED seat → rejected, nothing changes.\n'
                  '2. Failed payment → booking NOT confirmed, seats released.\n'
                  '3. Cancelling → seats become AVAILABLE again (+ refund note for digital methods).\n'
                  '4. Invalid seat number / menu choice → clear message, no crash.'))
write_docx(os.path.join(OUT_DIR, 'PART-H-SOLID.docx'), ''.join(partH))

print('done')
