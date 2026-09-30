// ═══ SeatStatus.cpp ══════════════════════════════════════════════════════════
// ONE responsibility: enumerate the states ONE seat can be in FOR ONE show.
enum class SeatStatus { AVAILABLE, LOCKED, BOOKED };

// ═══ BookingStatus.cpp ═══════════════════════════════════════════════════════
// ONE responsibility: enumerate the booking lifecycle.
enum class BookingStatus { PENDING, CONFIRMED, CANCELLED };
