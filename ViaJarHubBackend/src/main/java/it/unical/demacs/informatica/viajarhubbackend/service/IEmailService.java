package it.unical.demacs.informatica.viajarhubbackend.service;

public interface IEmailService {
    void sendEmail(String to, String subject, String body);

    void sendVerificationEmail(String email, String confirmationURL);

    void sendPasswordResetEmail(String email, String resetURL);
}
