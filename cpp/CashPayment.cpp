// ═══ CashPayment.cpp ═════════════════════════════════════════════════════════
// ONE responsibility: pay by cash at the counter — succeeds if tendered ≥ due.
#include <string>

class CashPayment : public Payment {
public:
    explicit CashPayment(int tendered = -1)
        : Payment("CASH"), tendered(tendered) {}   // -1 = counter mode, always ok

    bool pay(int amount) override {
        if (this->tendered >= 0 && this->tendered < amount) {
            this->lastReason = "Tendered less than due";
            return false;
        }
        return true;
    }

private:
    int tendered;
};
