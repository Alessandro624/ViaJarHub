package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.UserNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC.proxy.UserProxy;
import it.unical.demacs.informatica.viajarhubbackend.service.IUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/auth/v1")
public class UserController {
    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
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

    @RequestMapping(value = "/wishlist", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getWishlist() {
        try {
            return ResponseEntity.ok(SecurityUtility.getCurrentUserProxy().getWishlist());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/add-to-wishlist", method = RequestMethod.POST)
    public ResponseEntity<Void> addToWishlist(@RequestParam Long travelId) {
        try {
            UserProxy userProxy = SecurityUtility.getCurrentUserProxy();
            userProxy.addToWishlist(travelId, userProxy.getUser().getRole() != UserRole.ROLE_ADMIN ? LocalDate.now() : null);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/remove-from-wishlist", method = RequestMethod.DELETE)
    public ResponseEntity<Void> removeFromWishlist(@RequestParam Long travelId) {
        try {
            UserProxy userProxy = SecurityUtility.getCurrentUserProxy();
            userProxy.removeFromWishlist(travelId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
