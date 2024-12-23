package it.unical.demacs.informatica.viajarhubbackend.exception;

public class TravelNotFoundException extends RuntimeException {
    public TravelNotFoundException(String message) {
        super(message);
    }
}
