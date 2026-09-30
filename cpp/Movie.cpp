// ═══ Movie.cpp ═══════════════════════════════════════════════════════════════
// ONE responsibility: hold one movie's catalog data (F1's "what is playing").
// Must NOT: know about shows, screens or seats.
#include <string>

class Movie {
public:
    Movie() : title(""), language(""), durationMin(0) {}
    // Compile-time polymorphism: overloaded constructors.
    Movie(std::string t, std::string lang, int dur)
        : title(std::move(t)), language(std::move(lang)), durationMin(dur) {}

    const std::string& getTitle()    const { return this->title; }
    const std::string& getLanguage() const { return this->language; }
    int  getDuration()               const { return this->durationMin; }

private:
    std::string title;
    std::string language;
    int durationMin;
};
