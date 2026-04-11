package pl.app.backend.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.entity.User;
import pl.app.backend.enums.Role;
import pl.app.backend.repository.UserRepository;
import pl.app.backend.service.interfaces.IUserManagementService;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.setup.seed-database", havingValue = "true", matchIfMissing = true)
public class DatabaseSeeder {

    private final UserRepository userRepository;
    private final IUserManagementService userManagementService; // Korzystamy z serwisu

    @Value("${app.setup.admin.email}")
    private String adminEmail;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDatabase() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .role(Role.MASTER_USER)
                    .isActive(false)
                    .emailVerified(true)
                    .build();

            User savedAdmin = userRepository.save(admin);

            userManagementService.generateAndSendInvitation(savedAdmin);

            log.info("Utworzono początkowe konto administratora (MASTER_USER). E-mail aktywacyjny wysłano na: {}", adminEmail);
        } else {
            log.info("Konto głównego administratora już istnieje w bazie.");
        }
    }
}