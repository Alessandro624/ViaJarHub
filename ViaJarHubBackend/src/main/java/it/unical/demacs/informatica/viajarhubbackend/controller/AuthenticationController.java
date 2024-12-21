package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/v1")
public class AuthenticationController {
    @RequestMapping(value = "/check-user", method = RequestMethod.GET)
    public ResponseEntity<UserDetails> getCurrentUser() {
        UserDetails currentUser = SecurityUtility.getCurrentUser();
        return ResponseEntity.ok(currentUser);
    }
}
