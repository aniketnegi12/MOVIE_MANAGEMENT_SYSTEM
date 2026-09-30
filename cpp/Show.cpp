// ═══ Show.cpp ════════════════════════════════════════════════════════════════
// ONE responsibility: ONE screening — a Movie on a Screen at a time.
// OOP — Aggregation: Movie/Screen are created elsewhere; Show references them.
// OOP — Composition: ShowSeats are created INSIDE the show and die with it.
// Must NOT: book seats itself or price anything.
#include <string>
#include <vector>
#include <map>

class Show {
public:
    Show() : id(""), movie(nullptr), screen(nullptr), startTime("") {}
    Show(std::string id, const Movie* m, const Screen* s, std::string t)
        : id(std::move(id)), movie(m), screen(s), startTime(std::move(t)) {
        for (const Seat& seat : s->getSeats()) {           // composition
            showSeats.emplace(seat.getNumber(), ShowSeat(seat));
        }
    }

    const std::string& getId()        const { return this->id; }
    const Movie&       getMovie()     const { return *this->movie; }
    const Screen&      getScreen()    const { return *this->screen; }
    const std::string& getStartTime() const { return this->startTime; }

    std::map<std::string, ShowSeat>& seats()             { return this->showSeats; }
    const std::map<std::string, ShowSeat>& seats() const { return this->showSeats; }

    ShowSeat* findSeat(const std::string& no) {
        auto it = this->showSeats.find(no);
        return it == this->showSeats.end() ? nullptr : &it->second;
    }

    int availableCount() const {
        int n = 0;
        for (const auto& [no, ss] : this->showSeats)      // structured binding
            if (ss.isAvailable()) ++n;
        return n;
    }

    int totalSeats() const { return static_cast<int>(this->showSeats.size()); }

private:
    std::string id;
    const Movie*  movie;    // aggregation
    const Screen* screen;   // aggregation
    std::string   startTime;
    std::map<std::string, ShowSeat> showSeats;   // composition
};
