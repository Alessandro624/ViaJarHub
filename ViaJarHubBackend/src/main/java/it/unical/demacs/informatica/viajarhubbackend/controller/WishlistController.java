package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.UserRole;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.implJDBC.proxy.UserProxy;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/auth/v1")
public class WishlistController {

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
