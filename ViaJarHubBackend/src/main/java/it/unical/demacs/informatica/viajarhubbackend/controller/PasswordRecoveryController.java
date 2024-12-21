package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/open/v1")
public class PasswordRecoveryController {
    private final IUserService userService;

    public PasswordRecoveryController(IUserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/forgot-password", method = RequestMethod.POST)
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        try {
            userService.forgotPassword(email);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/reset-password", method = RequestMethod.POST)
    public ResponseEntity<Void> resetPassword(@RequestParam("token") String token, @RequestParam String newPassword, HttpSession session) {
        try {
            User user = userService.resetPassword(token, newPassword);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }
            SecurityUtility.updateCurrentUser(user, user.getPassword(), session);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/check-reset-token", method = RequestMethod.GET)
    public ResponseEntity<Void> checkPasswordResetToken(@RequestParam("token") String token) {
        boolean result = userService.validateResetPasswordToken(token);
        if (result) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
