package pl.app.backend.service.interfaces;

public interface IEmailService {
    void sendInvitationEmail(String to, String plainToken);
    void sendEmailChangeVerification(String to, String plainToken);
    void sendPasswordResetEmail(String to, String plainToken);
    void sendReservationConfirmationEmail(String to, String guestName, String plainConfirmToken, String plainCancelToken);
    void sendContactVerificationEmail(String to, String name, String plainToken);
    void sendContactReplyEmail(String to, String name, String subject, String originalMessage, String reply);
}