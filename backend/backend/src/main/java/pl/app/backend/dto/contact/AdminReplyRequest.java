package pl.app.backend.dto.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminReplyRequest(
        @NotBlank @Size(max = 2000) String reply
) {}
