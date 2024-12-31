package it.unical.demacs.informatica.viajarhubbackend.controller.authentication;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/v1")
public class AuthenticationController {
    @RequestMapping(value = "/check-user", method = RequestMethod.GET)
    public ResponseEntity<UserDetails> getCurrentUser() {
        try {
            UserDetails currentUser = SecurityUtility.getCurrentUser();
            return ResponseEntity.ok(currentUser);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
