package it.unical.demacs.informatica.viajarhubbackend.controller.user;


import it.unical.demacs.informatica.viajarhubbackend.exception.UserNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.service.IEmailService;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1")
public class AdminController {
    private final IUserService userService;
    private final IEmailService emailService;

    public AdminController(IUserService userService, IEmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @RequestMapping(value = "/emails", method = RequestMethod.GET)
    public ResponseEntity<List<String>> getAllUsersEmails() {
        try {
            return ResponseEntity.ok().body(this.userService.getAllUsersEmails());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/make-admin", method = RequestMethod.POST)
    public ResponseEntity<Void> makeAdmin(@RequestParam("email") String email) {
        try {
            User updatedUser = this.userService.makeAdmin(email);
            if (updatedUser == null) {
                return ResponseEntity.badRequest().build();
            }
            this.emailService.sendAdminConfirmationEmail(email, updatedUser.getFirstName(), updatedUser.getLastName());
            return ResponseEntity.ok().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
