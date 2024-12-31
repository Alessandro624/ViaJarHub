package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/v1")
public class BookingController {
    @RequestMapping(value = "/booking", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getBooking() {
        try {
            return ResponseEntity.ok(SecurityUtility.getCurrentUserProxy().getBookedTravels());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
