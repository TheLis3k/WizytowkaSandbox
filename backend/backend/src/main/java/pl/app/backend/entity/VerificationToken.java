package pl.app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import pl.app.backend.enums.VerificationTokenType;

import java.time.Instant;

@Entity
@Table(name = "verification_tokens")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationTokenType type;

    @Column(nullable = false)
    private Instant expiryDate;

    private String newEmailPayload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}