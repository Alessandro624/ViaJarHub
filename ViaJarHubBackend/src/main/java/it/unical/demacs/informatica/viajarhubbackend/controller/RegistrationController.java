package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.exception.EmailNotSentException;
import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserAlreadyExistsException;
import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/open/v1")
public class RegistrationController {
    private final IUserService userService;

    public RegistrationController(IUserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST)
    public ResponseEntity<Void> register(@RequestBody User user) {
        try {
            User createduser = userService.createUser(user.getFirstName(), user.getLastName(), user.getBirthDate(), user.getEmail(), user.getPassword(), UserRole.ROLE_USER, AuthProvider.LOCAL);
            if (createduser == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (EmailNotSentException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/verify-email", method = RequestMethod.GET)
    public ResponseEntity<Void> verifyEmail(@RequestParam("token") String token) {
        boolean result = userService.validateVerificationToken(token);
        if (result) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
