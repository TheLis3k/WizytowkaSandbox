package pl.app.backend.dto.contact;

import jakarta.validation.constraints.*;

public record ContactMessageRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 200) String subject,
        @NotBlank @Size(min = 10, max = 2000) String message
) {}
