package pl.app.backend.dto.reservation;

import pl.app.backend.enums.ReservationStatus;

public record AdminReservationUpdateRequest(
        ReservationStatus status,
        String comments
) {}
