package pl.app.backend.controller.profile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.ChangeEmailRequest;
import pl.app.backend.dto.ChangePasswordRequest;
import pl.app.backend.security.UserPrincipal;
import pl.app.backend.service.interfaces.IUserProfileService;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final IUserProfileService userProfileService;

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {

        userProfileService.changePassword(
                principal.getUser().getId(),
                request.getOldPassword(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Hasło zostało pomyślnie zmienione. Zostałeś wylogowany z innych urządzeń."
        ));
    }

    @PostMapping("/email/request-change")
    public ResponseEntity<?> requestEmailChange(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangeEmailRequest request) {

        userProfileService.requestEmailChange(
                principal.getUser().getId(),
                request.getNewEmail()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Wysłano link potwierdzający na nowy adres e-mail."
        ));
    }
}