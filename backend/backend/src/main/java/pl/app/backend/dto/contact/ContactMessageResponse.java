package pl.app.backend.dto.contact;

import pl.app.backend.enums.ContactMessageStatus;

import java.time.Instant;

public record ContactMessageResponse(
        Long id,
        String name,
        String email,
        String subject,
        String message,
        ContactMessageStatus status,
        String adminReply,
        Instant repliedAt,
        Instant createdAt
) {}
