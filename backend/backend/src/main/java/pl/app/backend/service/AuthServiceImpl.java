package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.dto.AuthResponse;
import pl.app.backend.dto.LoginRequest;
import pl.app.backend.entity.User;
import pl.app.backend.entity.VerificationToken;
import pl.app.backend.enums.VerificationTokenType;
import pl.app.backend.repository.UserRepository;
import pl.app.backend.repository.VerificationTokenRepository;
import pl.app.backend.security.TokenHasher;
import pl.app.backend.security.UserPrincipal;
import pl.app.backend.service.interfaces.IAuthService;
import pl.app.backend.service.interfaces.IEmailService;
import pl.app.backend.service.interfaces.IJwtService;
import pl.app.backend.service.interfaces.IRefreshTokenService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final IJwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final IRefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final TokenHasher tokenHasher;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${security.auth.max-failed-attempts}")
    private int maxFailedAttempts;
    @Value("${security.auth.lock-time-minutes}")
    private int lockTimeDurationMinutes;

    @Override
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

    @Override
    @Transactional
    public AuthResponse refreshToken(String plainRefreshToken) {
        var result = refreshTokenService.rotate(plainRefreshToken);

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(new UserPrincipal(result.user())))
                .refreshToken(result.newToken())
                .build();
    }

    @Override
    @Transactional
    public void logout(String plainRefreshToken) {
        refreshTokenService.delete(plainRefreshToken);
    }

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        userRepository.findByEmailAndIsDeletedFalse(email).ifPresent(user -> {

            verificationTokenRepository.deleteByUserIdAndType(user.getId(), VerificationTokenType.PASSWORD_RESET);

            String plainToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();

            VerificationToken token = VerificationToken.builder()
                    .user(user)
                    .tokenHash(tokenHasher.hash(plainToken))
                    .type(VerificationTokenType.PASSWORD_RESET)
                    .expiryDate(Instant.now().plus(1, ChronoUnit.HOURS))
                    .build();

            verificationTokenRepository.save(token);
            emailService.sendPasswordResetEmail(user.getEmail(), plainToken);
            log.info("Wysłano link z opcją resetu hasła dla użytkownika: {}", email);
        });
    }

    @Override
    @Transactional
    public void resetPassword(String plainToken, String newPassword) {
        String hashedToken = tokenHasher.hash(plainToken);

        VerificationToken token = verificationTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy lub wygasły token."));

        if (token.getType() != VerificationTokenType.PASSWORD_RESET) {
            throw new IllegalArgumentException("Nieprawidłowy typ tokena.");
        }

        if (token.getExpiryDate().isBefore(Instant.now())) {
            verificationTokenRepository.delete(token);
            throw new IllegalArgumentException("Token wygasł. Poproś o nowe przypomnienie hasła.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFailedLoginAttempts(0);
        user.setLockoutTime(null);
        userRepository.save(user);
        verificationTokenRepository.delete(token);
        refreshTokenService.deleteAllForUser(user);

        log.info("Hasło zostało zmienione z poziomu resetu hasła dla użytkownika: {}", user.getEmail());
    }
}