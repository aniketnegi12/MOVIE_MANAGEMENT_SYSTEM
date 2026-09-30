// ═══ CardPayment.cpp ═════════════════════════════════════════════════════════
// ONE responsibility: pay by card — 16 digits, Luhn checksum, expiry, CVV.
// OOP — Compile-time polymorphism: overloaded luhn() helpers.
#include <string>
#include <cctype>

class CardPayment : public Payment {
public:
    CardPayment(std::string number, std::string expiry, std::string cvv, bool simulateFailure = false)
        : Payment("CARD"), number(std::move(number)), expiry(std::move(expiry)),
          cvv(std::move(cvv)), simulateFailure(simulateFailure) {
        // normalise: strip spaces
        std::string clean;
        for (char c : this->number) if (c != ' ') clean += c;
        this->number = clean;
    }

    bool pay(int amount) override {
        (void)amount;
        if (this->simulateFailure) {
            this->lastReason = "Card declined by issuer";
            return false;
        }
        if (this->number.size() != 16) { this->lastReason = "Card number must be 16 digits"; return false; }
        for (char c : this->number)
            if (!std::isdigit(static_cast<unsigned char>(c))) { this->lastReason = "Card number must be digits"; return false; }
        if (!luhn(this->number))            { this->lastReason = "Card failed the Luhn checksum"; return false; }
        if (!validExpiry(this->expiry))     { this->lastReason = "Expiry must be MM/YY"; return false; }
        if (this->cvv.size() != 3)          { this->lastReason = "CVV must be 3 digits"; return false; }
        return true;
    }

private:
    // Compile-time polymorphism: overloads of luhn().
    static bool luhn(const std::string& num) {
        int sum = 0; bool dbl = false;
        for (int i = static_cast<int>(num.size()) - 1; i >= 0; --i) {
            int d = num[i] - '0';
            if (dbl) { d *= 2; if (d > 9) d -= 9; }
            sum += d; dbl = !dbl;
        }
        return sum % 10 == 0;
    }
    static bool luhn(const char* num) { return luhn(std::string(num)); }   // overload

    static bool validExpiry(const std::string& e) {
        if (e.size() != 5 || e[2] != '/') return false;
        for (int i : {0, 1, 3, 4})
            if (!std::isdigit(static_cast<unsigned char>(e[i]))) return false;
        int month = (e[0] - '0') * 10 + (e[1] - '0');
        return month >= 1 && month <= 12;              // semantic check, not just format
    }

    std::string number, expiry, cvv;
    bool simulateFailure;
};
