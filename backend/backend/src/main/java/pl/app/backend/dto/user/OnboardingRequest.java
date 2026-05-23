package pl.app.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OnboardingRequest {

    @NotBlank(message = "Token jest wymagany")
    private String token;

    @NotBlank(message = "Hasło jest wymagane")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Hasło musi mieć min. 8 znaków, zawierać cyfrę, małą i dużą literę oraz znak specjalny")
    private String password;
}
