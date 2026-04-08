package pl.app.backend.service;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.entity.RefreshToken;
import pl.app.backend.entity.User;
import pl.app.backend.repository.RefreshTokenRepository;
import pl.app.backend.security.TokenHasher;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHasher tokenHasher;

    @Value("${security.jwt.refresh-expiration-time}")
    private long refreshTokenExpirationMs;

    public record RotationResult(User user, String newToken) {}

    @Transactional
    public String createFor(User user) {
        String plainToken = UUID.randomUUID() + "-" + UUID.randomUUID();
        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHasher.hash(plainToken))
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();
        refreshTokenRepository.save(entity);
        return plainToken;
    }

    @Transactional
    public RotationResult rotate(String plainToken) {
        RefreshToken entity = findValid(plainToken);
        User user = entity.getUser();
        refreshTokenRepository.delete(entity);
        return new RotationResult(user, createFor(user));
    }

    @Transactional
    public void delete(String plainToken) {
        refreshTokenRepository.findByTokenHash(tokenHasher.hash(plainToken))
                .ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    public void deleteAllForUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    private RefreshToken findValid(String plainToken) {
        RefreshToken entity = refreshTokenRepository.findByTokenHash(tokenHasher.hash(plainToken))
                .orElseThrow(() -> new JwtException("Nieprawidłowy Refresh Token"));

        if (entity.isRevoked() || entity.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(entity);
            throw new JwtException("Sesja wygasła lub została wylogowana");
        }

        return entity;
    }
}
