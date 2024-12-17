package it.unical.demacs.informatica.viajarhubbackend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import it.unical.demacs.informatica.viajarhubbackend.model.AuthProvider;
import it.unical.demacs.informatica.viajarhubbackend.model.GoogleTokenRequest;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/open/v1")
public class GoogleAuthenticationController {
    // TODO check real key of payload and existence of telephone number
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
            if (token != null) {
                GoogleIdToken.Payload payload = token.getPayload();
                String email = payload.getEmail();
                User user = userService.findByEmail(email, AuthProvider.GOOGLE).orElseGet(() -> {
                    String firstName = (String) payload.get("first_name");
                    String lastName = (String) payload.get("last_name");
                    String telephoneNumber = (String) payload.get("telephone_number");
                    return userService.createUser(firstName, lastName, telephoneNumber, email, UUID.randomUUID().toString(), UserRole.ROLE_USER, AuthProvider.GOOGLE);
                });
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(user.getEmail(), null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(401).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
