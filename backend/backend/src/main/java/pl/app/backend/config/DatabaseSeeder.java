package pl.app.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.enums.Role;
import pl.app.backend.entity.User;
import pl.app.backend.repository.UserRepository;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.setup.seed-database", havingValue = "true", matchIfMissing = true)
public class DatabaseSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.setup.admin.email}")
    private String adminEmail;

    @Value("${app.setup.admin.password}")
    private String adminPassword;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDatabase() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            log.info("Utworzono początkowe konto administratora: {}", adminEmail);
        } else {
            log.info("Konto administratora już istnieje w bazie.");
        }
    }
}
