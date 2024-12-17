package it.unical.demacs.informatica.viajarhubbackend.service;

public interface IEmailService {
    void sendEmail(String to, String subject, String body);
}
