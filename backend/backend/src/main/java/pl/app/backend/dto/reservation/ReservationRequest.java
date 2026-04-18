package pl.app.backend.dto.reservation;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record ReservationRequest(
        @NotNull Long tableId,
        @NotBlank String guestName,
        @NotBlank @Email String guestEmail,
        String guestPhone,
        @Min(1) @Max(20) int partySize,
        @NotNull @Future LocalDateTime startTime,
        @Size(max = 1000) String comments
) {}
