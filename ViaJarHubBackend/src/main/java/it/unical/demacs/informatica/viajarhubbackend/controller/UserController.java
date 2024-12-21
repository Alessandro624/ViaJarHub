package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth/v1")
public class UserController {
    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/update-user", method = RequestMethod.POST)
    public ResponseEntity<Void> updateUser(@RequestBody User user, @RequestParam(required = false) MultipartFile profileImage, HttpSession session) {
        try {
            User updatedUser = this.userService.updateUser(user.getEmail(), user, profileImage);
            if (updatedUser == null) {
                return ResponseEntity.badRequest().build();
            }
            SecurityUtility.updateCurrentUser(updatedUser, updatedUser.getPassword(), session);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
