package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.app.backend.dto.contact.AdminReplyRequest;
import pl.app.backend.dto.contact.ContactMessageRequest;
import pl.app.backend.dto.contact.ContactMessageResponse;
import pl.app.backend.entity.ContactMessage;
import pl.app.backend.enums.ContactMessageStatus;
import pl.app.backend.repository.ContactMessageRepository;
import pl.app.backend.security.InputSanitizer;
import pl.app.backend.security.TokenHasher;
import pl.app.backend.service.interfaces.IContactMessageService;
import pl.app.backend.service.interfaces.IEmailService;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactMessageServiceImpl implements IContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final IEmailService emailService;
    private final TokenHasher tokenHasher;
    private final InputSanitizer inputSanitizer;

    @Override
    @Transactional
    public void submit(ContactMessageRequest request) {
        String plainToken = UUID.randomUUID().toString();

        ContactMessage msg = ContactMessage.builder()
                .name(inputSanitizer.sanitize(request.name()))
                .email(request.email().trim().toLowerCase())
                .subject(inputSanitizer.sanitize(request.subject()))
                .message(inputSanitizer.sanitize(request.message()))
                .status(ContactMessageStatus.PENDING_VERIFICATION)
                .verificationTokenHash(tokenHasher.hash(plainToken))
                .verificationExpiresAt(Instant.now().plusSeconds(24 * 60 * 60))
                .build();

        contactMessageRepository.save(msg);
        emailService.sendContactVerificationEmail(msg.getEmail(), msg.getName(), plainToken);
        log.info("Contact form submitted from {} — awaiting email verification", msg.getEmail());
    }

    @Override
    @Transactional
    public void verify(String token) {
        String tokenHash = tokenHasher.hash(token);
        ContactMessage msg = contactMessageRepository.findByVerificationTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nieprawidłowy token weryfikacyjny"));

        if (msg.getStatus() != ContactMessageStatus.PENDING_VERIFICATION) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Wiadomość jest już zweryfikowana");
        }
        if (msg.getVerificationExpiresAt() == null || Instant.now().isAfter(msg.getVerificationExpiresAt())) {
            contactMessageRepository.delete(msg);
            throw new ResponseStatusException(HttpStatus.GONE, "Link weryfikacyjny wygasł. Wyślij formularz ponownie.");
        }

        msg.setStatus(ContactMessageStatus.UNREAD);
        msg.setVerificationTokenHash(null);
        msg.setVerificationExpiresAt(null);
        contactMessageRepository.save(msg);
        log.info("Contact message {} verified by {}", msg.getId(), msg.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContactMessageResponse> getAll(ContactMessageStatus statusFilter, Pageable pageable) {
        if (statusFilter != null && statusFilter != ContactMessageStatus.PENDING_VERIFICATION) {
            return contactMessageRepository.findByStatus(statusFilter, pageable).map(this::toResponse);
        }
        return contactMessageRepository.findByStatusNot(ContactMessageStatus.PENDING_VERIFICATION, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public ContactMessageResponse getById(Long id) {
        ContactMessage msg = findVerified(id);
        if (msg.getStatus() == ContactMessageStatus.UNREAD) {
            msg.setStatus(ContactMessageStatus.READ);
            contactMessageRepository.save(msg);
        }
        return toResponse(msg);
    }

    @Override
    @Transactional
    public ContactMessageResponse reply(Long id, AdminReplyRequest request) {
        ContactMessage msg = findVerified(id);
        if (msg.getStatus() == ContactMessageStatus.REPLIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Na tę wiadomość już udzielono odpowiedzi");
        }

        String sanitizedReply = inputSanitizer.sanitize(request.reply());
        msg.setAdminReply(sanitizedReply);
        msg.setRepliedAt(Instant.now());
        msg.setStatus(ContactMessageStatus.REPLIED);
        contactMessageRepository.save(msg);

        emailService.sendContactReplyEmail(msg.getEmail(), msg.getName(), msg.getSubject(), msg.getMessage(), sanitizedReply);
        log.info("Admin replied to contact message {} from {}", msg.getId(), msg.getEmail());
        return toResponse(msg);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!contactMessageRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Wiadomość nie została znaleziona");
        }
        contactMessageRepository.deleteById(id);
        log.info("Contact message {} deleted by admin", id);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread() {
        return contactMessageRepository.countByStatus(ContactMessageStatus.UNREAD);
    }

    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void cleanupExpiredPending() {
        int count = contactMessageRepository.deleteExpiredPending(ContactMessageStatus.PENDING_VERIFICATION, Instant.now());
        if (count > 0) {
            log.info("Usunięto {} wygasłych niezweryfikowanych wiadomości kontaktowych", count);
        }
    }

    private ContactMessage findVerified(Long id) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wiadomość nie została znaleziona"));
        if (msg.getStatus() == ContactMessageStatus.PENDING_VERIFICATION) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Wiadomość nie została znaleziona");
        }
        return msg;
    }

    private ContactMessageResponse toResponse(ContactMessage msg) {
        return new ContactMessageResponse(
                msg.getId(),
                msg.getName(),
                msg.getEmail(),
                msg.getSubject(),
                msg.getMessage(),
                msg.getStatus(),
                msg.getAdminReply(),
                msg.getRepliedAt(),
                msg.getCreatedAt()
        );
    }
}
