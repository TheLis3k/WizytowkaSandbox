package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.entity.User;
import pl.app.backend.entity.VerificationToken;
import pl.app.backend.enums.VerificationTokenType;
import pl.app.backend.repository.UserRepository;
import pl.app.backend.repository.VerificationTokenRepository;
import pl.app.backend.security.TokenHasher;
import pl.app.backend.service.interfaces.IEmailService;
import pl.app.backend.service.interfaces.IRefreshTokenService;
import pl.app.backend.service.interfaces.IUserProfileService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements IUserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IRefreshTokenService refreshTokenService;
    private final VerificationTokenRepository tokenRepository;
    private final TokenHasher tokenHasher;
    private final IEmailService emailService;

    @Override
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Użytkownik nie istnieje."));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Obecne hasło jest nieprawidłowe.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        refreshTokenService.deleteAllForUser(user);

        log.info("Użytkownik {} pomyślnie zmienił hasło. Wszystkie poprzednie sesje zostały zamknięte.", user.getEmail());
    }

    @Override
    @Transactional
    public void requestEmailChange(Long userId, String newEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Użytkownik nie istnieje."));

        if (userRepository.findByEmail(newEmail).isPresent()) {
            log.warn("Użytkownik ID: {} próbował zmienić e-mail na już zajęty: {}", userId, newEmail);
            return;
        }

        tokenRepository.deleteByUserIdAndType(user.getId(), VerificationTokenType.EMAIL_CHANGE);

        String plainToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hashedToken = tokenHasher.hash(plainToken);

        VerificationToken token = VerificationToken.builder()
                .user(user)
                .tokenHash(hashedToken)
                .type(VerificationTokenType.EMAIL_CHANGE)
                .expiryDate(Instant.now().plus(2, ChronoUnit.HOURS))
                .newEmailPayload(newEmail)
                .build();

        tokenRepository.save(token);

        emailService.sendEmailChangeVerification(newEmail, plainToken);

        log.info("Rozpoczęto proces zmiany e-maila dla użytkownika ID: {}. Link wysłano na: {}", userId, newEmail);
    }
}