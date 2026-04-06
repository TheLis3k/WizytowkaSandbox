package pl.app.backend.service;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.dto.AuthResponse;
import pl.app.backend.dto.LoginRequest;
import pl.app.backend.entity.RefreshToken;
import pl.app.backend.entity.User;
import pl.app.backend.repository.RefreshTokenRepository;
import pl.app.backend.security.UserPrincipal;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${security.jwt.refresh-expiration-time}")
    private long refreshTokenExpirationMs;

    @Transactional
    public AuthResponse authenticate(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = principal.getUser();

        refreshTokenRepository.deleteByUser(user);

        String accessToken = jwtService.generateToken(principal);
        String plainRefreshToken = createAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(plainRefreshToken)
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String plainRefreshToken) {
        String hashedToken = hashToken(plainRefreshToken);

        RefreshToken refreshTokenEntity = refreshTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new JwtException("Nieprawidłowy Refresh Token"));

        if (refreshTokenEntity.isRevoked() || refreshTokenEntity.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new JwtException("Sesja wygasła lub została wylogowana");
        }

        User user = refreshTokenEntity.getUser();

        // Refresh token rotation: stary token usuwamy, wystawiamy nowy
        refreshTokenRepository.delete(refreshTokenEntity);
        String newPlainRefreshToken = createAndSaveRefreshToken(user);
        String newAccessToken = jwtService.generateToken(new UserPrincipal(user));

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newPlainRefreshToken)
                .build();
    }

    @Transactional
    public void logout(String plainRefreshToken) {
        String hashedToken = hashToken(plainRefreshToken);
        refreshTokenRepository.findByTokenHash(hashedToken).ifPresent(refreshTokenRepository::delete);
    }

    private String createAndSaveRefreshToken(User user) {
        String plainToken = UUID.randomUUID() + "-" + UUID.randomUUID();
        String hashedToken = hashToken(plainToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashedToken)
                .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return plainToken;
    }

    private String hashToken(String plainToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Błąd konfiguracji SHA-256 na serwerze", e);
        }
    }
}
