package pl.app.backend.service.interfaces;

import pl.app.backend.dto.AuthResponse;
import pl.app.backend.dto.LoginRequest;

public interface IAuthService {
    AuthResponse authenticate(LoginRequest request);
    AuthResponse refreshToken(String plainRefreshToken);
    void logout(String plainRefreshToken);
    void requestPasswordReset(String email);
    void resetPassword(String plainToken, String newPassword);
}