package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.dto.UserResponse;
import pl.app.backend.entity.User;
import pl.app.backend.entity.VerificationToken;
import pl.app.backend.enums.Role;
import pl.app.backend.enums.VerificationTokenType;
import pl.app.backend.repository.UserRepository;
import pl.app.backend.repository.VerificationTokenRepository;
import pl.app.backend.security.TokenHasher;
import pl.app.backend.service.interfaces.IEmailService;
import pl.app.backend.service.interfaces.IUserManagementService;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementServiceImpl implements IUserManagementService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final TokenHasher tokenHasher;
    private final IEmailService emailService;

    @Override
    public List<UserResponse> getAllUsers(int page, int size) {
        return userRepository.findAllByIsDeletedFalse(PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void generateAndSendInvitation(User user) {
        String plainToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hashedToken = tokenHasher.hash(plainToken);

        VerificationToken verificationToken = VerificationToken.builder()
                .user(user)
                .tokenHash(hashedToken)
                .type(VerificationTokenType.INVITATION)
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();

        verificationTokenRepository.save(verificationToken);
        emailService.sendInvitationEmail(user.getEmail(), plainToken);
    }

    @Override
    @Transactional
    public void inviteSuperUser(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            log.warn("Próba wysłania zaproszenia na adres e-mail, który jest już w bazie: {}", email);
            return;
        }

        User newUser = User.builder()
                .email(email)
                .role(Role.SUPER_USER)
                .isActive(false)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(newUser);

        generateAndSendInvitation(savedUser);

        log.info("Wysłano zaproszenie (SUPER_USER) na adres: {}", email);
    }

    @Override
    @Transactional
    public void deleteSuperUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Użytkownik nie istnieje."));

        if (user.getRole() == Role.MASTER_USER) {
            throw new IllegalStateException("Nie można usunąć konta głównego administratora (MASTER_USER).");
        }

        if (user.isDeleted()) {
            throw new IllegalArgumentException("Użytkownik został już usunięty.");
        }

        verificationTokenRepository.deleteByUserIdAndType(user.getId(), VerificationTokenType.INVITATION);

        user.setDeleted(true);
        user.setActive(false);
        userRepository.save(user);

        log.info("Konto użytkownika ID: {} zostało miękko usunięte (soft delete).", id);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.isActive())
                .emailVerified(user.isEmailVerified())
                .build();
    }
}