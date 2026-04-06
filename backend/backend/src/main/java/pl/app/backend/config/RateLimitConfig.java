package pl.app.backend.config;

import io.github.bucket4j.Bandwidth;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class RateLimitConfig {

    private final Map<String, Bandwidth> endpointLimits = new LinkedHashMap<>();
    private final Bandwidth defaultLimit;

    public RateLimitConfig() {
        endpointLimits.put("/api/auth/login",   perMinute(5));
        endpointLimits.put("/api/auth/refresh", perMinute(10));
        endpointLimits.put("/api/auth",         perMinute(20));
        endpointLimits.put("/api/public",       perMinute(60));
        endpointLimits.put("/api/admin",        perMinute(100));
        defaultLimit = perMinute(30);
    }

    public Map<String, Bandwidth> getEndpointLimits() {
        return endpointLimits;
    }

    public Bandwidth getDefaultLimit() {
        return defaultLimit;
    }

    private Bandwidth perMinute(int requests) {
        return Bandwidth.builder()
                .capacity(requests)
                .refillIntervally(requests, Duration.ofMinutes(1))
                .build();
    }
}
