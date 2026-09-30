// ═══ SeatType.cpp ════════════════════════════════════════════════════════════
// ONE responsibility: be the single source of truth for seat categories/prices.
// Knows: id, label, price.   Must NOT: know about seats' availability or shows.
// OOP — Encapsulation: price is private, exposed only via priceOf().
#include <string>

class SeatType {
public:
    static const int SILVER_PRICE    = 150;   // constants, not magic numbers
    static const int GOLD_PRICE      = 250;
    static const int PLATINUM_PRICE  = 450;   // PDF's PLATINUM price was cut off

    static const SeatType& SILVER()   { static SeatType t("SILVER",   "Silver",   SILVER_PRICE);   return t; }
    static const SeatType& GOLD()     { static SeatType t("GOLD",     "Gold",     GOLD_PRICE);     return t; }
    static const SeatType& PLATINUM() { static SeatType t("PLATINUM", "Platinum", PLATINUM_PRICE); return t; }

    int priceOf() const { return this->price; }
    const std::string& label() const { return this->labelStr; }
    const std::string& id()    const { return this->idStr; }

private:
    // Compile-time polymorphism: overloaded constructors (default only for the
    // static catalogue above; the real one takes all fields).
    SeatType() : idStr(""), labelStr(""), price(0) {}
    SeatType(std::string id, std::string label, int price)
        : idStr(std::move(id)), labelStr(std::move(label)), price(price) {}

    std::string idStr;
    std::string labelStr;
    int price;
};
