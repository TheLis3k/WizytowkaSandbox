package pl.app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import pl.app.backend.enums.ContactMessageStatus;

import java.time.Instant;

@Entity
@Table(name = "contact_messages")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactMessageStatus status;

    @Column(unique = true)
    private String verificationTokenHash;

    private Instant verificationExpiresAt;

    @Column(length = 2000)
    private String adminReply;

    private Instant repliedAt;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
