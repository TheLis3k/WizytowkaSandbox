package pl.app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import pl.app.backend.enums.ReservationStatus;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable table;

    @Column(nullable = false)
    private String guestName;

    @Column(nullable = false)
    private String guestEmail;

    private String guestPhone;

    @Column(nullable = false)
    private int partySize;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private int durationMinutes = 90;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(length = 1000)
    private String comments;

    @Column(nullable = false)
    private String confirmationTokenHash;

    private Instant confirmationExpiresAt;

    @Column(nullable = false)
    private String cancellationTokenHash;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
