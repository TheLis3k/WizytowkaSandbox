package pl.app.backend.controller.open;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.contact.ContactMessageRequest;
import pl.app.backend.service.interfaces.IContactMessageService;

@RestController
@RequestMapping("/api/public/contact")
@RequiredArgsConstructor
public class ContactPublicController {

    private final IContactMessageService contactMessageService;

    @PostMapping
    public ResponseEntity<Void> submit(@Valid @RequestBody ContactMessageRequest request) {
        contactMessageService.submit(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verify(@RequestParam String token) {
        contactMessageService.verify(token);
        return ResponseEntity.ok().build();
    }
}
