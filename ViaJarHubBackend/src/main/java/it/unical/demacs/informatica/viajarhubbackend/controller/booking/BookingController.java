package it.unical.demacs.informatica.viajarhubbackend.controller.booking;

import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/v1")
public class BookingController {
    private final ITravelService travelService;

    public BookingController(ITravelService travelService) {
        this.travelService = travelService;
    }

    @RequestMapping(value = "/booking", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getBooking() {
        try {
            return ResponseEntity.ok(SecurityUtility.getCurrentUserProxy().getBookedTravels());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/reviewable-booking", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getReviewableBooking() {
        try {
            return ResponseEntity.ok(travelService.getReviewableBooking(SecurityUtility.getCurrentUser().getUsername()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
