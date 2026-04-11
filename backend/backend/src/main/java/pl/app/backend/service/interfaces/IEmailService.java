package pl.app.backend.service.interfaces;

public interface IEmailService {
    void sendInvitationEmail(String to, String plainToken);
    void sendEmailChangeVerification(String to, String plainToken);
    void sendPasswordResetEmail(String to, String plainToken);
}