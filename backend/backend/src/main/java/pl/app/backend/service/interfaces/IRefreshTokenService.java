package pl.app.backend.service.interfaces;

import pl.app.backend.entity.User;

public interface IRefreshTokenService {

    record RotationResult(User user, String newToken) {}

    String createFor(User user);
    RotationResult rotate(String plainToken);
    void delete(String plainToken);
    void deleteAllForUser(User user);
}