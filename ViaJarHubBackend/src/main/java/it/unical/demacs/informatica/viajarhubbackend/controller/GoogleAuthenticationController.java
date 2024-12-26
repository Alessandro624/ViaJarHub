package it.unical.demacs.informatica.viajarhubbackend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.exception.EmailNotSentException;
import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserAlreadyExistsException;
import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.GoogleTokenRequest;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/open/v1")
public class GoogleAuthenticationController {
    private final IUserService userService;

    public GoogleAuthenticationController(IUserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/google-login", method = RequestMethod.POST)
    public ResponseEntity<Void> verifyGoogleToken(@RequestBody GoogleTokenRequest googleTokenRequest, HttpSession session) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(System.getenv("GOOGLE_CLIENT_ID_VIAJARHUB")))
                    .build();
            GoogleIdToken token = verifier.verify(googleTokenRequest.getToken());
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            GoogleIdToken.Payload payload = token.getPayload();
            String email = payload.getEmail();
            User user = fetchOrCreateUser(payload, email);
            SecurityUtility.updateCurrentUser(user, null, session);
            return ResponseEntity.ok().build();
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (EmailNotSentException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private User fetchOrCreateUser(GoogleIdToken.Payload payload, String email) {
        Optional<User> user = userService.findByEmail(email, AuthProvider.GOOGLE);
        return user.orElseGet(() -> {
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.getOrDefault("family_name", "NA");
            LocalDate birthDate = (LocalDate) payload.getOrDefault("birth_date", LocalDate.parse("1999-01-01"));
            return userService.createUser(firstName, lastName, birthDate, email, UUID.randomUUID().toString(), UserRole.ROLE_USER, AuthProvider.GOOGLE);
        });
    }
}
