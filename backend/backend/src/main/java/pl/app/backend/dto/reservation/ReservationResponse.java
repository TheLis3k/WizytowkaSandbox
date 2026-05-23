package pl.app.backend.dto.reservation;

import pl.app.backend.enums.ReservationStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        Long tableId,
        String tableName,
        String guestName,
        String guestEmail,
        String guestPhone,
        int partySize,
        LocalDateTime startTime,
        int durationMinutes,
        ReservationStatus status,
        String comments,
        Instant createdAt
) {}
