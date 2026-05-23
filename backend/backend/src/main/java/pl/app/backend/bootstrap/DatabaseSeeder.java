package pl.app.backend.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.entity.Category;
import pl.app.backend.entity.MenuItem;
import pl.app.backend.entity.User;
import pl.app.backend.enums.Role;
import pl.app.backend.repository.CategoryRepository;
import pl.app.backend.repository.MenuItemRepository;
import pl.app.backend.repository.UserRepository;
import pl.app.backend.service.interfaces.IUserManagementService;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.setup.seed-database", havingValue = "true", matchIfMissing = true)
public class DatabaseSeeder {

    private final UserRepository userRepository;
    private final IUserManagementService userManagementService;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

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

        seedMenuItems();
    }

    private void seedMenuItems() {
        if (menuItemRepository.count() > 0) {
            return;
        }

        Category starters = categoryRepository.save(Category.builder().name("Przystawki").sortOrder(1).build());
        Category mains    = categoryRepository.save(Category.builder().name("Dania główne").sortOrder(2).build());
        Category desserts = categoryRepository.save(Category.builder().name("Desery").sortOrder(3).build());
        Category drinks   = categoryRepository.save(Category.builder().name("Napoje").sortOrder(4).build());

        menuItemRepository.saveAll(List.of(
            MenuItem.builder().name("Zupa pomidorowa").description("Klasyczna zupa pomidorowa z makaronem").price(new BigDecimal("12.00")).category(starters.getName()).imageUrl("https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80").build(),
            MenuItem.builder().name("Żurek").description("Żurek z jajkiem i kiełbasą").price(new BigDecimal("14.00")).category(starters.getName()).imageUrl("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&q=80").build(),
            MenuItem.builder().name("Schabowy z ziemniakami").description("Kotlet schabowy z ziemniakami i surówką").price(new BigDecimal("32.00")).category(mains.getName()).imageUrl("https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80").build(),
            MenuItem.builder().name("Pierogi ruskie").description("Pierogi z farszem ziemniaczano-serowym").price(new BigDecimal("26.00")).category(mains.getName()).imageUrl("https://images.unsplash.com/photo-1635321593217-40050ad13c74?w=600&q=80").build(),
            MenuItem.builder().name("Grillowany łosoś").description("Filet z łososia z warzywami sezonowymi").price(new BigDecimal("42.00")).category(mains.getName()).imageUrl("https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80").build(),
            MenuItem.builder().name("Szarlotka").description("Domowa szarlotka z lodami waniliowymi").price(new BigDecimal("16.00")).category(desserts.getName()).imageUrl("https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80").build(),
            MenuItem.builder().name("Sernik").description("Kremowy sernik na zimno z owocami").price(new BigDecimal("14.00")).category(desserts.getName()).imageUrl("https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80").build(),
            MenuItem.builder().name("Woda mineralna").description("Woda gazowana lub niegazowana 0.5l").price(new BigDecimal("6.00")).category(drinks.getName()).imageUrl("https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80").build(),
            MenuItem.builder().name("Sok pomarańczowy").description("Świeżo wyciskany sok pomarańczowy").price(new BigDecimal("10.00")).category(drinks.getName()).imageUrl("https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80").build(),
            MenuItem.builder().name("Kawa").description("Kawa espresso lub americano").price(new BigDecimal("8.00")).category(drinks.getName()).imageUrl("https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80").build()
        ));

        log.info("Zasilono bazę danych przykładowymi kategoriami i pozycjami menu.");
    }
}