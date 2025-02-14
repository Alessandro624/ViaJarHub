package it.unical.demacs.informatica.viajarhubbackend.controller.user;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.exception.EmailNotSentException;
import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.ContactMessage;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.service.IEmailService;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@RestController
@RequestMapping("/api/auth/v1")
public class UserController {
    private final IUserService userService;
    private final IEmailService emailService;

    public UserController(IUserService userService, IEmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @RequestMapping(value = "/update-user", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateUser(@RequestPart User user, @RequestParam(required = false) MultipartFile profileImage, HttpSession session) {
        try {
            User updatedUser = this.userService.updateUser(Objects.requireNonNull(SecurityUtility.getCurrentUser()).getUsername(), user, profileImage);
            if (updatedUser == null) {
                return ResponseEntity.badRequest().build();
            }
            SecurityUtility.updateCurrentUser(updatedUser, updatedUser.getPassword(), session);
            return ResponseEntity.ok().build();
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/profile-image", method = RequestMethod.GET, produces = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> getProfileImage() {
        try {
            byte[] imageBytes = this.userService.getProfileImage(Objects.requireNonNull(SecurityUtility.getCurrentUser()).getUsername());
            return ResponseEntity.ok()
                    .body(imageBytes);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/contact-admins", method = RequestMethod.POST)
    public ResponseEntity<Void> contactAdmins(@RequestBody ContactMessage message) {
        try {
            emailService.sendContactEmail(SecurityUtility.getCurrentUser().getUsername(), message.getSubject(), message.getBody());
            return ResponseEntity.ok().build();
        } catch (EmailNotSentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
