// ═══ BookingService.cpp ══════════════════════════════════════════════════════
// ONE responsibility: orchestrate the booking flow end-to-end (F4–F8).
// SOLID — D: receives a Payment&, never constructs a CardPayment itself.
// Edge cases: 1) double-book rejected  2) failed pay releases seats
//             3) cancel frees seats    4) invalid input → clear message
#include <string>
#include <vector>
#include <iostream>

class BookingService {
public:
    explicit BookingService(Cinema& c) : cinema(c) {}

    // F3 — seat layout view (never mutates).
    void seatLayout(const std::string& showId) const {
        Show* show = this->cinema.findShow(showId);
        if (!show) { std::cout << "  No show " << showId << "\n"; return; }
        std::cout << "  Screen " << show->getScreen().getNumber()
                  << " · " << show->getStartTime() << "\n";
        char lastRow = 0;
        for (const auto& [no, ss] : show->seats()) {
            char row = no[0];
            if (row != lastRow) { std::cout << "\n  " << row << "  "; lastRow = row; }
            std::cout << (ss.isBooked() ? "[X] " : ss.getStatus() == SeatStatus::LOCKED
                          ? "[~] " : "[ ] ");
        }
        std::cout << "\n";
    }

    // F4 — validate + hold seats; returns PENDING booking or nullptr (message printed).
    Booking* holdSeats(const Customer& c, const std::string& showId,
                       const std::vector<std::string>& seatNos) {
        Show* show = this->cinema.findShow(showId);
        if (!show) { std::cout << "  No show with id " << showId << "\n"; return nullptr; }
        if (seatNos.empty()) { std::cout << "  Pick at least one seat\n"; return nullptr; }

        std::vector<ShowSeat*> picked;
        for (const std::string& no : seatNos) {
            ShowSeat* ss = show->findSeat(no);
            if (!ss) { std::cout << "  Seat " << no << " does not exist\n"; return nullptr; }
            if (!ss->isAvailable()) {
                std::cout << "  Seat " << no << " is already BOOKED — pick another\n";
                return nullptr;
            }
            picked.push_back(ss);
        }

        Booking* b = new Booking(c, show, picked);
        for (ShowSeat* ss : picked) ss->lock(b->getId());
        this->bookings.push_back(b);
        return b;
    }

    // F6 — pay a PENDING booking; on failure release everything (edge case 2).
    bool payFor(Booking* b, Payment& p) {
        if (!b || b->getStatus() != BookingStatus::PENDING) {
            std::cout << "  Booking is not awaiting payment\n";
            return false;
        }
        bool ok = p.pay(b->getTotalAmount());          // runtime polymorphism
        if (!ok) {
            std::cout << "  Payment failed: " << p.failureReason() << " — seats released\n";
            for (ShowSeat* ss : b->getSeats()) ss->cancelSeat();
            return false;
        }
        for (ShowSeat* ss : b->getSeats()) ss->bookSeat(b->getId());
        b->confirm(p.label());
        std::cout << "  Payment accepted via " << p.label() << "\n";
        return true;
    }

    // F8 — cancel a CONFIRMED booking; seats become AVAILABLE (edge case 3).
    bool cancelBooking(const std::string& id) {
        Booking* b = this->findBooking(id);
        if (!b) { std::cout << "  No booking " << id << "\n"; return false; }
        if (!b->cancel()) {
            std::cout << "  Booking " << id << " is not CONFIRMED — cannot cancel\n";
            return false;
        }
        for (ShowSeat* ss : b->getSeats()) ss->cancelSeat();
        if (b->getPaymentMethod() == "CASH") {
            std::cout << "  Booking " << id << " cancelled (cash: no refund trail)\n";
        } else {
            std::cout << "  Booking " << id << " cancelled — refund of Rs."
                      << b->getTotalAmount() << " to " << b->getPaymentMethod()
                      << " in 3-5 working days\n";
        }
        return true;
    }

    // Public lookup so the menu can pay a specific pending booking.
    Booking* findBooking(const std::string& id) {
        for (Booking* b : this->bookings)
            if (b->getId() == id) return b;
        return nullptr;
    }

    void printMyBookings() const {
        std::cout << "  My bookings:\n";
        bool any = false;
        for (const Booking* b : this->bookings) {
            if (b->getStatus() == BookingStatus::CANCELLED) continue;
            any = true;
            std::cout << "   " << b->getId() << "  " << b->getShow().getMovie().getTitle()
                      << "  seats " << b->seatList() << "  Rs." << b->getTotalAmount()
                      << "  (" << b->getPaymentMethod() << ")\n";
        }
        if (!any) std::cout << "   (none)\n";
    }

private:
    Cinema& cinema;
    std::vector<Booking*> bookings;   // aggregation of owned records
};
