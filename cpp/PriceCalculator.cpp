// ═══ PriceCalculator.cpp ═════════════════════════════════════════════════════
// ONE responsibility: turn a list of seats into a total amount (F5).
// SOLID — S: who asks for a pricing change edits THIS file, never BookingService.
#include <vector>

class PriceCalculator {
public:
    static int totalFor(const std::vector<ShowSeat*>& seats) {
        int total = 0;
        for (const ShowSeat* ss : seats) total += ss->getSeat().getType().priceOf();
        return total;
    }
};
