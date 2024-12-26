package it.unical.demacs.informatica.viajarhubbackend.exception;

public class EmailNotSentException extends RuntimeException {
    public EmailNotSentException(String message) {
        super(message);
    }
}
