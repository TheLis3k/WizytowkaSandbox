package pl.app.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Token jest wymagany")
    private String token;

    @NotBlank(message = "Nowe hasło jest wymagane")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Hasło musi mieć min. 8 znaków, zawierać cyfrę, małą i dużą literę oraz znak specjalny")
    private String newPassword;
}
