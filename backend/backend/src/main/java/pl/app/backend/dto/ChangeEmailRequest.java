package pl.app.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangeEmailRequest {

    @NotBlank(message = "Nowy adres e-mail jest wymagany")
    @Email(message = "Niepoprawny format adresu e-mail")
    private String newEmail;
}