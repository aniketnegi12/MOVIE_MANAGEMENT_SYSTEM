// ═══ Cinema.cpp ══════════════════════════════════════════════════════════════
// ONE responsibility: THE theatre — name + screens + shows.
// OOP — Composition: owns Screens. Aggregation: references Movies.
// F1/F2 live here. Must NOT: book seats or take payments.
#include <string>
#include <vector>
#include <map>

class Cinema {
public:
    explicit Cinema(std::string n) : name(std::move(n)), showSeq(0) {}

    void addScreen(Screen* s)             { screens.push_back(s); }

    Show* addShow(const Movie* m, Screen* s, std::string time) {
        ++showSeq;
        std::string id = "S" + std::to_string(showSeq);
        shows.push_back(new Show(id, m, s, std::move(time)));
        return shows.back();
    }

    // F1 — distinct movies that currently have shows.
    std::vector<const Movie*> listMovies() const {
        std::vector<const Movie*> out;
        std::map<std::string, bool> seen;
        for (const Show* sh : shows) {
            const std::string& t = sh->getMovie().getTitle();
            if (!seen[t]) { seen[t] = true; out.push_back(&sh->getMovie()); }
        }
        return out;
    }

    // F2 — shows (screen + start time) for a chosen movie.
    std::vector<Show*> showsOf(const Movie* m) {
        std::vector<Show*> out;
        for (Show* sh : shows)
            if (&sh->getMovie() == m) out.push_back(sh);
        return out;
    }

    Show* findShow(const std::string& id) {
        for (Show* sh : shows)
            if (sh->getId() == id) return sh;
        return nullptr;
    }

    const std::string& getName() const { return this->name; }
    const std::vector<Show*>& allShows() const { return this->shows; }

private:
    std::string name;
    std::vector<Screen*> screens;   // composition (owns)
    std::vector<Show*>   shows;     // composition (owns)
    int showSeq;
};
