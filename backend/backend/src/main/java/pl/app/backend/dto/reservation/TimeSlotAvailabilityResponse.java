package pl.app.backend.dto.reservation;

import java.util.List;

public record TimeSlotAvailabilityResponse(
        String time,
        boolean available,
        List<AvailableTable> tables
) {
    public record AvailableTable(Long id, String name, int capacity) {}
}
