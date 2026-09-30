// ═══ Seat.cpp ════════════════════════════════════════════════════════════════
// ONE responsibility: ONE physical seat — its number and type.
// Must NOT: track availability (ShowSeat's job).
#include <string>

class Seat {
public:
    Seat() : number("A1"), type(SeatType::SILVER()) {}
    Seat(std::string no, const SeatType& t) : number(std::move(no)), type(t) {}

    const std::string& getNumber()        const { return this->number; }
    const SeatType&    getType()          const { return this->type; }

private:
    std::string number;   // e.g. "A1", "G4", "I2"
    SeatType    type;     // value object copy — cheap, immutable
};
