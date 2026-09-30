// ═══ main.cpp ════════════════════════════════════════════════════════════════
// Course rule: one class per file, NO header files — so this translation unit
// includes every class file in dependency order and is the ONLY thing the
// compiler sees. Build: make (see Makefile)  →  ./cinema
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <limits>

#include "SeatType.cpp"
#include "SeatStatus.cpp"
#include "Movie.cpp"
#include "Seat.cpp"
#include "Screen.cpp"
#include "Customer.cpp"
#include "ShowSeat.cpp"
#include "Show.cpp"
#include "Booking.cpp"
#include "Payment.cpp"
#include "UpiPayment.cpp"
#include "CardPayment.cpp"
#include "CashPayment.cpp"
#include "PriceCalculator.cpp"
#include "TicketPrinter.cpp"
#include "Cinema.cpp"
#include "BookingService.cpp"

// ── helpers for the console menu ─────────────────────────────────────────────
static int readInt(const std::string& prompt) {
    std::cout << prompt;
    int v;
    if (!(std::cin >> v)) {                     // edge case 4 — bad menu input
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        return -1;
    }
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    return v;
}

static std::string readLine(const std::string& prompt) {
    std::cout << prompt;
    std::string s;
    std::getline(std::cin, s);
    return s;
}

int main() {
    // ── demo world (same data as the website) ──
    std::vector<Movie> movies = {
        Movie("Inception",    "English", 148),
        Movie("3 Idiots",     "Hindi",   170),
        Movie("Kantara",      "Kannada", 161),
        Movie("Interstellar", "English", 169),
    };
    Cinema cinema("PVR.imagined - Dehradun");
    Screen screen1(1), screen2(2);
    cinema.addScreen(&screen1);
    cinema.addScreen(&screen2);

    cinema.addShow(&movies[0], &screen1, "18:30");
    cinema.addShow(&movies[0], &screen2, "21:00");
    cinema.addShow(&movies[1], &screen1, "09:30");
    cinema.addShow(&movies[1], &screen2, "14:45");
    cinema.addShow(&movies[2], &screen1, "11:00");
    cinema.addShow(&movies[2], &screen2, "18:45");
    cinema.addShow(&movies[3], &screen2, "12:15");
    cinema.addShow(&movies[3], &screen1, "22:00");

    Customer me("Aniket Negi", "9999999999");
    BookingService service(cinema);

    // ══ scripted demo: the assignment's expected run shape ══
    std::cout << "==== MOVIE TICKET BOOKING ==================\n";
    std::cout << "  " << cinema.getName() << "\n\n";

    std::cout << "-- F1 · movies currently playing --\n";
    int i = 1;
    for (const Movie* m : cinema.listMovies())
        std::cout << "  " << i++ << ". " << m->getTitle() << " (" << m->getLanguage()
                  << ", " << m->getDuration() << " min)\n";

    std::cout << "\n-- F2 · shows of Inception --\n";
    i = 1;
    for (Show* sh : cinema.showsOf(&movies[0]))
        std::cout << "  " << i++ << ". Screen " << sh->getScreen().getNumber()
                  << " at " << sh->getStartTime()
                  << "  (" << sh->availableCount() << "/" << sh->totalSeats() << " free)\n";

    std::cout << "\n-- F3 · seat layout of S1 --\n";
    service.seatLayout("S1");

    std::cout << "\n-- F4 + F6 + F7 · book A1, A2 (UPI) --\n";
    Booking* b1 = service.holdSeats(me, "S1", {"A1", "A2"});
    if (b1) {
        UpiPayment upi("aniket@okaxis");
        if (service.payFor(b1, upi)) TicketPrinter::print(*b1);
    }

    std::cout << "\n-- edge 2 · failed payment releases seats --\n";
    Booking* b2 = service.holdSeats(me, "S1", {"G5"});
    if (b2) {
        CardPayment bad("4242424242424241", "12/29", "123", /*simulateFailure*/true);
        service.payFor(b2, bad);
        std::cout << "  G5 now: " << (cinema.findShow("S1")->findSeat("G5")->isAvailable()
                     ? "AVAILABLE (released)" : "still held") << "\n";
    }

    std::cout << "\n-- F8 · cancel BKG-0001, seats freed --\n";
    service.cancelBooking(b1->getId());
    std::cout << "  A1 now: " << (cinema.findShow("S1")->findSeat("A1")->isAvailable()
                 ? "AVAILABLE (freed)" : "still booked") << "\n";

    std::cout << "\n-- final state --\n";
    service.printMyBookings();

    // ══ interactive menu (F1–F8) ══
    bool running = true;
    while (running) {
        std::cout << "\n========= MENU =========\n"
                  << " 1. List movies (F1)\n"
                  << " 2. List shows of a movie (F2)\n"
                  << " 3. Seat layout of a show (F3)\n"
                  << " 4. Book seats (F4/F5)\n"
                  << " 5. Pay for a pending booking (F6)\n"
                  << " 6. Print a ticket (F7)\n"
                  << " 7. Cancel a booking (F8)\n"
                  << " 8. My bookings\n"
                  << " 0. Exit\n";
        int choice = readInt("  choice> ");
        switch (choice) {
            case 1: {
                int n = 1;
                for (const Movie* m : cinema.listMovies())
                    std::cout << "  " << n++ << ". " << m->getTitle() << " ("
                              << m->getLanguage() << ", " << m->getDuration() << " min)\n";
                break;
            }
            case 2: {
                int n = 1;
                std::vector<const Movie*> list = cinema.listMovies();
                for (const Movie* m : list)
                    std::cout << "  " << n++ << ". " << m->getTitle() << "\n";
                int pick = readInt("  movie #> ");
                if (pick < 1 || pick > static_cast<int>(list.size())) {
                    std::cout << "  Invalid choice\n"; break;    // edge case 4
                }
                for (Show* sh : cinema.showsOf(list[pick - 1]))
                    std::cout << "   Screen " << sh->getScreen().getNumber() << " at "
                              << sh->getStartTime() << "  (show " << sh->getId() << ")\n";
                break;
            }
            case 3: {
                std::string sid = readLine("  show id (e.g. S1)> ");
                service.seatLayout(sid);
                break;
            }
            case 4: {
                std::string sid = readLine("  show id> ");
                std::string seats = readLine("  seats (e.g. A1 A2 I1)> ");
                std::vector<std::string> nos;
                size_t start = 0;
                while (start < seats.size()) {
                    size_t sp = seats.find(' ', start);
                    if (sp == std::string::npos) sp = seats.size();
                    if (sp > start) nos.push_back(seats.substr(start, sp - start));
                    start = sp + 1;
                }
                Booking* nb = service.holdSeats(me, sid, nos);
                if (nb) std::cout << "  Held " << nb->seatList() << " — total Rs."
                                  << nb->getTotalAmount()
                                  << " — pay from menu option 5 (" << nb->getId() << ")\n";
                break;
            }

            case 5: {
                std::string bid = readLine("  booking id> ");
                Booking* target = service.findBooking(bid);
                if (!target || target->getStatus() != BookingStatus::PENDING) {
                    std::cout << "  No pending booking " << bid << "\n";   // edge case 4
                    break;
                }
                int pm = readInt("  pay by  1=UPI 2=Card 3=Cash > ");
                Payment* p = nullptr;
                if (pm == 1) {
                    std::string upi = readLine("  upi id> ");
                    p = new UpiPayment(upi);
                } else if (pm == 2) {
                    std::string num = readLine("  card number> ");
                    std::string exp = readLine("  expiry MM/YY> ");
                    std::string cvv = readLine("  cvv> ");
                    p = new CardPayment(num, exp, cvv);
                } else if (pm == 3) {
                    p = new CashPayment();
                } else {
                    std::cout << "  Invalid choice\n";   // edge case 4
                    break;
                }
                bool paid = service.payFor(target, *p);   // runtime polymorphism
                if (paid) TicketPrinter::print(*target);  // F7
                delete p;
                break;
            }
            case 6: {
                std::string bid = readLine("  booking id> ");
                Booking* target = service.findBooking(bid);
                if (!target || target->getStatus() != BookingStatus::CONFIRMED) {
                    std::cout << "  No confirmed booking " << bid << "\n";
                    break;
                }
                TicketPrinter::print(*target);
                break;
            }
            case 7: {
                std::string bid = readLine("  booking id> ");
                service.cancelBooking(bid);
                break;
            }
            case 8:
                service.printMyBookings();
                break;
            case 0:
                running = false;
                break;
            default:
                std::cout << "  Invalid choice — enter 0-8\n";   // edge case 4
        }
    }
    std::cout << "  Goodbye!\n";
    return 0;
}
