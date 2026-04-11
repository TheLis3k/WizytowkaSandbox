package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.dto.AuthResponse;
import pl.app.backend.dto.LoginRequest;
import pl.app.backend.entity.User;
import pl.app.backend.repository.UserRepository;
import pl.app.backend.security.UserPrincipal;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @Value("${security.auth.max-failed-attempts}")
    private int maxFailedAttempts;
    @Value("${security.auth.lock-time-minutes}")
    private int lockTimeDurationMinutes;

    @Transactional
    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Błędne dane logowania"));

        if (user.getLockoutTime() != null) {
            if (user.getLockoutTime().isAfter(Instant.now())) {
                throw new LockedException("Konto jest zablokowane z powodu zbyt wielu nieudanych prób. Spróbuj ponownie później.");
            } else {
                user.setFailedLoginAttempts(0);
                user.setLockoutTime(null);
                userRepository.save(user);
            }
        }

        try {
            var principal = (UserPrincipal) authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            ).getPrincipal();

            if (user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                user.setLockoutTime(null);
                userRepository.save(user);
            }

            refreshTokenService.deleteAllForUser(principal.getUser());

            return AuthResponse.builder()
                    .accessToken(jwtService.generateToken(principal))
                    .refreshToken(refreshTokenService.createFor(principal.getUser()))
                    .build();

        } catch (BadCredentialsException ex) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= maxFailedAttempts) {
                user.setLockoutTime(Instant.now().plus(lockTimeDurationMinutes, ChronoUnit.MINUTES));
            }

            userRepository.save(user);
            throw new BadCredentialsException("Błędne dane logowania");
        }
    }

    @Transactional
    public AuthResponse refreshToken(String plainRefreshToken) {
        var result = refreshTokenService.rotate(plainRefreshToken);

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(new UserPrincipal(result.user())))
                .refreshToken(result.newToken())
                .build();
    }

    @Transactional
    public void logout(String plainRefreshToken) {
        refreshTokenService.delete(plainRefreshToken);
    }
}
