// ═══ Screen.cpp ══════════════════════════════════════════════════════════════
// ONE responsibility: ONE auditorium — number + seat inventory.
// OOP — Composition: seats are created INSIDE the screen and die with it.
// Must NOT: know about shows or bookings.
#include <string>
#include <vector>

class Screen {
public:
    explicit Screen(int no) : screenNo(no) {
        auto addRow = [this](char r, int count, const SeatType& t) {   // 'this' capture
            for (int i = 1; i <= count; ++i)
                seats.push_back(Seat(std::string(1, r) + std::to_string(i), t));
        };
        for (char r = 'A'; r <= 'D'; ++r) addRow(r, 10, SeatType::SILVER());
        for (char r = 'E'; r <= 'H'; ++r) addRow(r, 10, SeatType::GOLD());
        for (char r = 'I'; r <= 'J'; ++r) addRow(r, 6,  SeatType::PLATINUM());
    }

    int  getNumber()   const { return this->screenNo; }
    const std::vector<Seat>& getSeats() const { return this->seats; }

    const Seat* seatByNumber(const std::string& no) const {
        for (const Seat& s : this->seats)
            if (s.getNumber() == no) return &s;
        return nullptr;                                   // edge case 4-safe
    }

private:
    int screenNo;
    std::vector<Seat> seats;    // composition — owned
};
