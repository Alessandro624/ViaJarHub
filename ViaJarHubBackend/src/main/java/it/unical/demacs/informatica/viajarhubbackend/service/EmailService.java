package it.unical.demacs.informatica.viajarhubbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Objects;

@Service
public class EmailService implements IEmailService {
    // TODO gestione errori da delegare ai controller, try catch da eliminare e mettere throws nella firma del metodo

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            // System.out.println("prova");
            // Creazione del MimeMessage
            MimeMessage message = mailSender.createMimeMessage();

            // Configurazione del MimeMessageHelper
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            // Imposta il corpo HTML
            helper.setText(body, true); // Il secondo parametro indica che il contenuto è HTML
            ClassPathResource logo = new ClassPathResource("static/images/ViaJar-Hub.png");
            helper.addInline("logo", logo);           // Invio dell'email
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Errore durante l'invio dell'email: " + e.getMessage(), e);
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

    private void sendTemplateEmail(String to, String subject, String templatePath, Map<String, String> placeholders) {
        try {
            String template = new String(Objects.requireNonNull(getClass().getClassLoader().getResourceAsStream(templatePath)).readAllBytes());
            for (Map.Entry<String, String> placeholder : placeholders.entrySet()) {
                template = template.replace("{{" + placeholder.getKey() + "}}", placeholder.getValue());
            }
            sendEmail(to, subject, template);
        } catch (Exception e) {
            throw new RuntimeException("Errore durante l'invio dell'email con template: " + e.getMessage(), e);
        }
    }
}
