// ═══ Payment.cpp ═════════════════════════════════════════════════════════════
// ONE responsibility: THE payment contract — pay(amount) → bool.
// OOP — Abstraction: pure virtual pay() = 0; this class cannot be instantiated.
// SOLID — O + D: adding NetBanking = one new subclass, zero edits elsewhere.
// Must NOT: know about bookings, seats, or the console.
#include <string>

class Payment {
public:
    explicit Payment(std::string method) : methodName(std::move(method)) {}
    virtual ~Payment() = default;

    virtual bool pay(int amount) = 0;              // ← pure virtual (abstract)
    virtual std::string failureReason() const { return lastReason; }

    const std::string& label() const { return this->methodName; }

protected:
    std::string methodName;
    std::string lastReason;                        // subclasses record why they failed
};
