package pl.app.backend.controller.open;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.app.backend.dto.OnboardingRequest;
import pl.app.backend.dto.VerifyEmailRequest;
import pl.app.backend.service.interfaces.IOnboardingService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final IOnboardingService onboardingService;

    @PostMapping
    public ResponseEntity<?> completeOnboarding(@Valid @RequestBody OnboardingRequest request) {
        onboardingService.completeOnboarding(request.getToken(), request.getPassword());

        return ResponseEntity.ok(Map.of(
                "message", "Konto zostało pomyślnie aktywowane. Możesz się teraz zalogować."
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        onboardingService.verifyNewEmail(request.getToken());

        return ResponseEntity.ok(Map.of(
                "message", "Adres e-mail został pomyślnie zmieniony."
        ));
    }
}