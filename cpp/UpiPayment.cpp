// ═══ UpiPayment.cpp ══════════════════════════════════════════════════════════
// ONE responsibility: pay by UPI — validate id, then succeed or decline.
// OOP — Inheritance: IS-A Payment. Runtime polymorphism via pay().
#include <string>
#include <cctype>

class UpiPayment : public Payment {
public:
    UpiPayment(std::string upiId, bool simulateFailure = false)
        : Payment("UPI"), upiId(std::move(upiId)), simulateFailure(simulateFailure) {}

    bool pay(int amount) override {
        (void)amount;   // UPI charge is electronic; amount validated upstream
        if (this->simulateFailure) {
            this->lastReason = "UPI collect request declined";
            return false;
        }
        // name@bank — at least one '@', non-empty parts, letters after '@'
        size_t at = this->upiId.find('@');
        bool ok = at != std::string::npos && at >= 2 && this->upiId.size() - at - 1 >= 3
                  && std::isalpha(static_cast<unsigned char>(this->upiId[at + 1]));
        if (!ok) this->lastReason = "Invalid UPI id (expected name@bank)";
        return ok;
    }

private:
    std::string upiId;
    bool simulateFailure;
};
