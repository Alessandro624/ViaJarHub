package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.EmailNotSentException;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class EmailService implements IEmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            ClassPathResource logo = new ClassPathResource("static/images/ViaJar-Hub.png");
            helper.addInline("logo", logo);
            mailSender.send(message);
        } catch (Exception e) {
            throw new EmailNotSentException("Errore durante l'invio dell'email: " + e.getMessage());
        }
    }

    @Override
    public void sendVerificationEmail(String email, String confirmationURL) {
        String templatePath = "templates/verification-email.html";
        Map<String, String> placeholders = Map.of(
                "confirmationURL", confirmationURL,
                "logoCid", "logo"
        );
        sendTemplateEmail(email, "Verifica la tua email", templatePath, placeholders);
    }

    @Override
    public void sendPasswordResetEmail(String email, String resetURL) {
        String templatePath = "templates/password-reset-email.html";
        Map<String, String> placeholders = Map.of(
                "resetURL", resetURL,
                "logoCid", "logo"
        );
        sendTemplateEmail(email, "Reimposta la tua password", templatePath, placeholders);
    }

    @Override
    public void sendPaymentConfirmationEmail(String email, String destination, String participantsNumber, String startDate, String endDate, String total) {
        String templatePath = "templates/payment-confirmation-email.html";
        Map<String, String> placeholders = Map.of(
                "destination", destination,
                "participantsNumber", participantsNumber,
                "startDate", startDate,
                "endDate", endDate,
                "total", total,
                "logoCid", "logo"
        );
        sendTemplateEmail(email, "Dettagli Pagamento", templatePath, placeholders);
    }

    @Override
    public void sendContactEmail(String from, String subject, String body) {
        List<User> admins = DBManager.getInstance().getUserDAO().findAllAdminUsers();
        if (admins == null || admins.isEmpty()) {
            throw new EmailNotSentException("Nessun amministratore trovato per ricevere l'email di contatto.");
        }
        String templatePath = "templates/contact-email.html";
        Map<String, String> placeholders = Map.of(
                "body", body,
                "from", from,
                "logoCid", "logo"
        );
        for (User admin : admins) {
            sendTemplateEmail(admin.getEmail(), subject, templatePath, placeholders);
        }
    }

    @Override
    public void sendAdminConfirmationEmail(String email, String firstName, String lastName) {
        String templatePath = "templates/admin-confirmation-email.html";
        Map<String, String> placeholders = Map.of(
                "lastName", lastName,
                "firstName", firstName,
                "logoCid", "logo"
        );
        sendTemplateEmail(email, "Il tuo ruolo è stato aggiornato a Amministratore", templatePath, placeholders);
    }

    private void sendTemplateEmail(String to, String subject, String templatePath, Map<String, String> placeholders) {
        try {
            String template = new String(Objects.requireNonNull(getClass().getClassLoader().getResourceAsStream(templatePath)).readAllBytes());
            for (Map.Entry<String, String> placeholder : placeholders.entrySet()) {
                template = template.replace("{{" + placeholder.getKey() + "}}", placeholder.getValue());
            }
            sendEmail(to, subject, template);
        } catch (Exception e) {
            throw new EmailNotSentException("Errore durante l'invio dell'email con template: " + e.getMessage());
        }
    }
}
