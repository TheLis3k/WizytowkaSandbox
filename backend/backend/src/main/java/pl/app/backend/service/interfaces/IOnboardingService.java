package pl.app.backend.service.interfaces;

public interface IOnboardingService {
    void completeOnboarding(String plainToken, String newPassword);
    void verifyNewEmail(String plainToken);
}