// ═══ Booking.cpp ═════════════════════════════════════════════════════════════
// ONE responsibility: record ONE booking — show, seats, amount, status.
// OOP — Static members: nextId generates unique booking ids (assignment rule).
// OOP — Encapsulation: amount/status private; changed only via confirm()/cancel().
// Must NOT: print tickets (TicketPrinter's job) or charge anyone.
#include <string>
#include <vector>

class Booking {
public:
    Booking(const Customer& c, const Show* s, std::vector<ShowSeat*> seats)
        : customer(c), show(s), showSeats(std::move(seats)) {
        this->totalAmount = 0;
        for (const ShowSeat* ss : this->showSeats)
            this->totalAmount += ss->getSeat().getType().priceOf();
        this->id = "BKG-" + std::to_string(nextId++);
        this->status = BookingStatus::PENDING;
        this->paymentMethod = "";
    }

    const std::string& getId() const          { return this->id; }
    const Show& getShow() const               { return *this->show; }
    const std::vector<ShowSeat*>& getSeats() const { return this->showSeats; }
    int  getTotalAmount() const               { return this->totalAmount; }
    BookingStatus getStatus() const           { return this->status; }
    const Customer& getCustomer() const       { return this->customer; }
    const std::string& getPaymentMethod() const { return this->paymentMethod; }

    std::string seatList() const {
        std::string out;
        for (size_t i = 0; i < this->showSeats.size(); ++i) {
            if (i) out += ", ";
            out += this->showSeats[i]->getSeat().getNumber();
        }
        return out;
    }

    // Edge case 2 — only a successful payment leads here.
    void confirm(const std::string& method) {
        this->status = BookingStatus::CONFIRMED;
        this->paymentMethod = method;
    }

    // F8 — legal transition only from CONFIRMED.
    bool cancel() {
        if (this->status != BookingStatus::CONFIRMED) return false;
        this->status = BookingStatus::CANCELLED;
        return true;
    }

    static int nextId;   // static — shared across ALL bookings

private:
    std::string id;
    Customer customer;
    const Show* show;
    std::vector<ShowSeat*> showSeats;   // non-owning — ShowSeat lives in Show
    int totalAmount;
    BookingStatus status;
    std::string paymentMethod;
};

int Booking::nextId = 1;     // static member definition
