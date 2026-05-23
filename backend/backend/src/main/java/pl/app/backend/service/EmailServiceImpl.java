package pl.app.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import pl.app.backend.service.interfaces.IEmailService;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String frontendUrl;

    @Async
    @Override
    public void sendInvitationEmail(String to, String plainToken) {
        String subject = "Zaproszenie do panelu administratora";
        String link = frontendUrl + "/setup?token=" + plainToken;

        String htmlContent = String.format(
                "<h3>Witaj!</h3>" +
                        "<p>Zostałeś zaproszony do zarządzania systemem jako Super Administrator.</p>" +
                        "<p>Kliknij w poniższy link, aby aktywować konto i ustawić swoje hasło:</p>" +
                        "<a href=\"%s\">%s</a>" +
                        "<p>Link jest ważny przez 24 godziny.</p>",
                link, link
        );

        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendEmailChangeVerification(String to, String plainToken) {
        String subject = "Potwierdzenie zmiany adresu e-mail";
        String link = frontendUrl + "/verify-email?token=" + plainToken;

        String htmlContent = String.format(
                "<h3>Witaj!</h3>" +
                        "<p>Otrzymaliśmy prośbę o zmianę adresu e-mail przypisanego do Twojego konta.</p>" +
                        "<p>Aby potwierdzić nowy adres e-mail, kliknij w poniższy link:</p>" +
                        "<a href=\"%s\">%s</a>" +
                        "<p>Jeśli to nie Ty prosiłeś o zmianę, zignoruj tę wiadomość.</p>",
                link, link
        );

        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String plainToken) {
        String subject = "Resetowanie hasła do panelu administratora";
        String link = frontendUrl + "/reset-password?token=" + plainToken;

        String htmlContent = String.format(
                "<h3>Witaj!</h3>" +
                        "<p>Otrzymaliśmy prośbę o reset hasła.</p>" +
                        "<p>Kliknij w poniższy link, aby ustawić nowe hasło:</p>" +
                        "<a href=\"%s\">%s</a>" +
                        "<p>Jeśli to nie Ty prosiłeś o reset, zignoruj tę wiadomość.</p>",
                link, link
        );

        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendReservationConfirmationEmail(String to, String guestName, String plainConfirmToken, String plainCancelToken) {
        String subject = "Potwierdź swoją rezerwację";
        String confirmLink = frontendUrl + "/confirm-reservation?token=" + plainConfirmToken;
        String cancelLink = frontendUrl + "/cancel-reservation?token=" + plainCancelToken;

        String htmlContent = String.format(
                "<h3>Witaj, %s!</h3>" +
                        "<p>Dziękujemy za złożenie rezerwacji. Aby ją potwierdzić, kliknij w poniższy link:</p>" +
                        "<p><a href=\"%s\">Potwierdź rezerwację</a></p>" +
                        "<p>Link potwierdzający jest ważny przez <strong>15 minut</strong>. Po tym czasie rezerwacja zostanie anulowana.</p>" +
                        "<hr/>" +
                        "<p>Jeśli chcesz anulować rezerwację, kliknij tutaj:</p>" +
                        "<p><a href=\"%s\">Anuluj rezerwację</a></p>" +
                        "<p>Jeśli to nie Ty składałeś rezerwację, zignoruj tę wiadomość.</p>",
                guestName, confirmLink, cancelLink
        );

        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendContactVerificationEmail(String to, String name, String plainToken) {
        String subject = "Potwierdź swoją wiadomość";
        String link = frontendUrl + "/contact/verify?token=" + plainToken;

        String htmlContent = String.format(
                "<h3>Witaj, %s!</h3>" +
                        "<p>Dziękujemy za kontakt. Aby Twoja wiadomość dotarła do nas, potwierdź swój adres e-mail:</p>" +
                        "<p><a href=\"%s\">Potwierdź wiadomość</a></p>" +
                        "<p>Link jest ważny przez <strong>24 godziny</strong>.</p>" +
                        "<p>Jeśli to nie Ty wysłałeś formularz, zignoruj tę wiadomość.</p>",
                name, link
        );

        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    @Override
    public void sendContactReplyEmail(String to, String name, String subject, String originalMessage, String reply) {
        String emailSubject = "Odpowiedź na Twoją wiadomość: " + subject;

        String htmlContent = String.format(
                "<h3>Witaj, %s!</h3>" +
                        "<p>Odpowiedzieliśmy na Twoją wiadomość:</p>" +
                        "<blockquote style=\"border-left: 3px solid #ccc; padding-left: 12px; color: #555;\">%s</blockquote>" +
                        "<hr/>" +
                        "<h4>Nasza odpowiedź:</h4>" +
                        "<p>%s</p>",
                name,
                originalMessage.replace("\n", "<br/>"),
                reply.replace("\n", "<br/>")
        );

        sendHtmlEmail(to, emailSubject, htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("E-mail '{}' został pomyślnie wysłany do {}", subject, to);

        } catch (MessagingException e) {
            log.error("Nie udało się wysłać e-maila '{}' do {}. Powód: {}", subject, to, e.getMessage());
        }
    }
}