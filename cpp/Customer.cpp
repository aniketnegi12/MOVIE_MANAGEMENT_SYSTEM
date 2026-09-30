// ═══ Customer.cpp ════════════════════════════════════════════════════════════
// ONE responsibility: identify the person booking — name and phone.
#include <string>

class Customer {
public:
    Customer() : name(""), phone("") {}
    Customer(std::string n, std::string p) : name(std::move(n)), phone(std::move(p)) {}

    const std::string& getName()  const { return this->name; }
    const std::string& getPhone() const { return this->phone; }

private:
    std::string name;
    std::string phone;
};
