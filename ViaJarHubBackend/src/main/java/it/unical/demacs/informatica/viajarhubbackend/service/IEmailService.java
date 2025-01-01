package it.unical.demacs.informatica.viajarhubbackend.service;

public interface IEmailService {
    void sendEmail(String to, String subject, String body);

    void sendVerificationEmail(String email, String confirmationURL);

    void sendPasswordResetEmail(String email, String resetURL);

    void sendPaymentConfirmationEmail(String email, String destination, String participantsNumber, String startDate, String endDate, String total);

    void sendContactEmail(String from, String subject, String body);
}
