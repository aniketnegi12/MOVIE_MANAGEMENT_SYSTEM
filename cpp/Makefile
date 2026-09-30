# Course rule: one class per file, no header files — main.cpp includes every
# class file in dependency order, so we compile that single translation unit.
CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra
TARGET   = cinema

all: $(TARGET)

$(TARGET): main.cpp SeatType.cpp SeatStatus.cpp Movie.cpp Seat.cpp Screen.cpp \
           Customer.cpp ShowSeat.cpp Show.cpp Booking.cpp Payment.cpp UpiPayment.cpp \
           CardPayment.cpp CashPayment.cpp PriceCalculator.cpp TicketPrinter.cpp \
           Cinema.cpp BookingService.cpp
	$(CXX) $(CXXFLAGS) main.cpp -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)

.PHONY: all run clean
