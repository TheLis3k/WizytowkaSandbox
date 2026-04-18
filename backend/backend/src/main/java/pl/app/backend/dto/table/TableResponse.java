package pl.app.backend.dto.table;

public record TableResponse(
        Long id,
        String name,
        int capacity,
        boolean active
) {}
