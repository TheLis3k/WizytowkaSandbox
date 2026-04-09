package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.dto.AuthResponse;
import pl.app.backend.dto.LoginRequest;
import pl.app.backend.security.UserPrincipal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse authenticate(LoginRequest request) {
        var principal = (UserPrincipal) authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        ).getPrincipal();

        refreshTokenService.deleteAllForUser(principal.getUser());

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(principal))
                .refreshToken(refreshTokenService.createFor(principal.getUser()))
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String plainRefreshToken) {
        var result = refreshTokenService.rotate(plainRefreshToken);

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(new UserPrincipal(result.user())))
                .refreshToken(result.newToken())
                .build();
    }

    @Transactional
    public void logout(String plainRefreshToken) {
        refreshTokenService.delete(plainRefreshToken);
    }
}
