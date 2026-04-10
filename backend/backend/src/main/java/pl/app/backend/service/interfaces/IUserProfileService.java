package pl.app.backend.service.interfaces;

public interface IUserProfileService {
    void changePassword(Long userId, String oldPassword, String newPassword);
    void requestEmailChange(Long userId, String newEmail);
}