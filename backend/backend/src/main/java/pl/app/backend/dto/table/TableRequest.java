package pl.app.backend.dto.table;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record TableRequest(
        @NotBlank String name,
        @Min(1) int capacity
) {}
