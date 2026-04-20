package pl.app.backend.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.contact.AdminReplyRequest;
import pl.app.backend.dto.contact.ContactMessageResponse;
import pl.app.backend.enums.ContactMessageStatus;
import pl.app.backend.service.interfaces.IContactMessageService;

@RestController
@RequestMapping("/api/admin/contact")
@RequiredArgsConstructor
public class ContactAdminController {

    private final IContactMessageService contactMessageService;

    @GetMapping
    public ResponseEntity<Page<ContactMessageResponse>> getAll(
            @RequestParam(required = false) ContactMessageStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(contactMessageService.getAll(status, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount() {
        return ResponseEntity.ok(contactMessageService.countUnread());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactMessageResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactMessageService.getById(id));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<ContactMessageResponse> reply(
            @PathVariable Long id,
            @Valid @RequestBody AdminReplyRequest request) {
        return ResponseEntity.ok(contactMessageService.reply(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactMessageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
