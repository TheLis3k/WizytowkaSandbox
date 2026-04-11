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
import pl.app.backend.service.interfaces.IOnboardingService;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnboardingServiceImpl implements IOnboardingService {

    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final TokenHasher tokenHasher;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void completeOnboarding(String plainToken, String newPassword) {
        String hashedToken = tokenHasher.hash(plainToken);

        VerificationToken verificationToken = tokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy lub wygasły token zaproszenia."));

        if (verificationToken.getType() != VerificationTokenType.INVITATION) {
            throw new IllegalArgumentException("Nieprawidłowy typ tokena.");
        }

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Token zaproszenia wygasł. Poproś administratora o nowe zaproszenie.");
        }

        User user = verificationToken.getUser();

        if (user.isActive()) {
            throw new IllegalStateException("To konto zostało już aktywowane.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setActive(true);
        user.setEmailVerified(true);

        userRepository.save(user);

        tokenRepository.delete(verificationToken);

        log.info("Użytkownik {} pomyślnie ukończył onboarding i aktywował konto.", user.getEmail());
    }

    @Override
    @Transactional
    public void verifyNewEmail(String plainToken) {
        String hashedToken = tokenHasher.hash(plainToken);

        VerificationToken verificationToken = tokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy lub wygasły token."));

        if (verificationToken.getType() != VerificationTokenType.EMAIL_CHANGE) {
            throw new IllegalArgumentException("Nieprawidłowy typ tokena.");
        }

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("Token weryfikacyjny wygasł. Złóż wniosek o zmianę adresu ponownie.");
        }

        User user = verificationToken.getUser();

        String newEmail = verificationToken.getNewEmailPayload();
        user.setEmail(newEmail);
        userRepository.save(user);

        tokenRepository.delete(verificationToken);

        log.info("Użytkownik pomyślnie zmienił adres e-mail na: {}", newEmail);
    }
}