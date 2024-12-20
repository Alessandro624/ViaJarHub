package it.unical.demacs.informatica.viajarhubbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService implements IEmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            System.out.println("prova");
            // Creazione del MimeMessage
            MimeMessage message = mailSender.createMimeMessage();

            // Configurazione del MimeMessageHelper
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);

            // Imposta il corpo HTML
            helper.setText(body, true); // Il secondo parametro indica che il contenuto è HTML
            ClassPathResource logo = new ClassPathResource("static/images/ViaJar-Hub.png");
            helper.addInline("logo",logo);           // Invio dell'email
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Errore durante l'invio dell'email: " + e.getMessage(), e);


        }
    }
}