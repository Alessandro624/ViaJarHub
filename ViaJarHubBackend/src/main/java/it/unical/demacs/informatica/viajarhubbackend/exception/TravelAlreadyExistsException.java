package it.unical.demacs.informatica.viajarhubbackend.exception;

public class TravelAlreadyExistsException extends RuntimeException {
    public TravelAlreadyExistsException(String message) {
        super(message);
    }
}
