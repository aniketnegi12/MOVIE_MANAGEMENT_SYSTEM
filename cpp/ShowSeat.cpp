// ═══ ShowSeat.cpp ════════════════════════════════════════════════════════════
// ONE responsibility: the status of ONE seat FOR ONE show.
// OOP — Encapsulation: status is private and can change ONLY through
// bookSeat()/lock()/cancelSeat() — the assignment's NFR "validation methods".
#include <string>

class ShowSeat {
public:
    explicit ShowSeat(const Seat& s) : seat(s), status(SeatStatus::AVAILABLE), bookingId("") {}

    bool isAvailable() const { return this->status == SeatStatus::AVAILABLE; }
    bool isBooked()    const { return this->status == SeatStatus::BOOKED; }

    const Seat& getSeat() const { return this->seat; }
    SeatStatus  getStatus() const { return this->status; }
    const std::string& getBookingId() const { return this->bookingId; }

    // F4 — returns false (and changes nothing) if not AVAILABLE.
    bool lock(const std::string& bid) {
        if (!this->isAvailable()) return false;
        this->status = SeatStatus::LOCKED;
        this->bookingId = bid;
        return true;
    }

    // Legal entries: AVAILABLE (direct) or LOCKED (hold → confirm).
    bool bookSeat(const std::string& bid) {
        if (this->status == SeatStatus::BOOKED) return false;
        this->status = SeatStatus::BOOKED;
        this->bookingId = bid;
        return true;
    }

    // F8 / edge case 2 — release back to AVAILABLE.
    bool cancelSeat() {
        this->status = SeatStatus::AVAILABLE;
        this->bookingId = "";
        return true;
    }

private:
    Seat        seat;       // aggregation — references a seat owned by Screen
    SeatStatus  status;
    std::string bookingId;
};
