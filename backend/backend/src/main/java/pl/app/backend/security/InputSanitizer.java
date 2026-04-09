package pl.app.backend.security;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    /**
     * Strips all HTML tags from input, leaving plain text.
     * Protects against Stored XSS by ensuring no markup reaches the database.
     * Returns null if input is null.
     */
    public String sanitize(String input) {
        if (input == null) return null;
        return Jsoup.clean(input, Safelist.none());
    }
}
