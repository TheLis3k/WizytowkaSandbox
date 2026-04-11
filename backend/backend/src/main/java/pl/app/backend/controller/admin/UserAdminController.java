package pl.app.backend.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.InviteUserRequest;
import pl.app.backend.service.interfaces.IUserManagementService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final IUserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userManagementService.getAllUsers(page, size));
    }

    @PostMapping("/invite")
    public ResponseEntity<?> inviteUser(@Valid @RequestBody InviteUserRequest request) {
        userManagementService.inviteSuperUser(request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Prośba została przetworzona. Jeśli użytkownik nie istniał, wysłano zaproszenie na adres: " + request.getEmail()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userManagementService.deleteSuperUser(id);
        return ResponseEntity.noContent().build();
    }
}