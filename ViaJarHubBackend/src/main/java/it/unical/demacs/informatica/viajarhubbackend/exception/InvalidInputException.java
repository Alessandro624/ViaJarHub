package it.unical.demacs.informatica.viajarhubbackend.exception;

public class InvalidInputException extends IllegalArgumentException {
    public InvalidInputException(String message) {
        super(message);
    }
}
