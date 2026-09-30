// ═══ TicketPrinter.cpp ═══════════════════════════════════════════════════════
// ONE responsibility: format and print a ticket (F7) — printing ONLY.
// SOLID — S: Booking never prints; this class owns presentation.
#include <iostream>
#include <string>

class TicketPrinter {
public:
    static void print(const Booking& b) {
        const std::string line(34, '=');
        std::cout << "\n" << line << "\n";
        std::cout << "          MOVIE TICKET\n";
        std::cout << line << "\n";
        std::cout << "  Booking ID : " << b.getId() << "\n";
        std::cout << "  Movie      : " << b.getShow().getMovie().getTitle() << "\n";
        std::cout << "  Screen     : " << b.getShow().getScreen().getNumber() << "\n";
        std::cout << "  Time       : " << b.getShow().getStartTime() << "\n";
        std::cout << "  Seats      : " << b.seatList() << "\n";
        std::cout << "  Customer   : " << b.getCustomer().getName() << "\n";
        std::cout << "  Paid via   : " << b.getPaymentMethod() << "\n";
        std::cout << "  Status     : CONFIRMED\n";
        std::cout << line << "\n";
        std::cout << "  TOTAL      : Rs." << b.getTotalAmount() << "\n";
        std::cout << line << "\n";
    }
};
