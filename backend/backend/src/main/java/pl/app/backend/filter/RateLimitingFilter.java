package pl.app.backend.filter;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import pl.app.backend.dto.common.ErrorResponse;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        if (uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-ui")
                || uri.startsWith("/swagger-resources")
                || uri.startsWith("/webjars")
                || uri.equals("/swagger-ui.html")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = extractClientIp(request);
        String pattern = resolvePattern(request.getRequestURI());
        String bucketKey = ip + ":" + pattern;

        Bucket bucket = bucketCache.computeIfAbsent(bucketKey, key ->
                Bucket.builder()
                        .addLimit(rateLimitConfig.getEndpointLimits().getOrDefault(pattern, rateLimitConfig.getDefaultLimit()))
                        .build()
        );

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long retryAfterSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            log.warn("Rate limit exceeded for IP: {} on pattern: {}", ip, pattern);
            sendTooManyRequestsResponse(response, retryAfterSeconds);
        }
    }

    private String resolvePattern(String uri) {
        for (String pattern : rateLimitConfig.getEndpointLimits().keySet()) {
            if (uri.startsWith(pattern)) {
                return pattern;
            }
        }
        return "default";
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendTooManyRequestsResponse(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        ErrorResponse body = ErrorResponse.builder()
                .status(429)
                .error("Too Many Requests")
                .message(String.format("Przekroczono limit zapytań. Spróbuj za %d sekund.", retryAfterSeconds))
                .timestamp(LocalDateTime.now())
                .build();
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setHeader("X-RateLimit-Remaining", "0");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
