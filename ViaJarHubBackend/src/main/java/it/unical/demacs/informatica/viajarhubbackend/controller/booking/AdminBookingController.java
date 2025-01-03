package it.unical.demacs.informatica.viajarhubbackend.controller.booking;


import it.unical.demacs.informatica.viajarhubbackend.config.security.SecurityUtility;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1")
public class AdminBookingController {
    private final ITravelService travelService;

    public AdminBookingController(ITravelService travelService) {
        this.travelService = travelService;
    }


    @RequestMapping(value = "/daily-income", method = RequestMethod.GET)
    public ResponseEntity<Double[]> getDailyIncome() {
        try {
            return ResponseEntity.ok(travelService.getDailyIncome());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @RequestMapping(value = "/monthly-income", method = RequestMethod.GET)
    public ResponseEntity<Double[]> getMonthlyIncome() {
        try {
            return ResponseEntity.ok(travelService.getMonthlyIncome());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @RequestMapping(value = "/annual-income", method = RequestMethod.GET)
    public ResponseEntity<Double[]> getAnnualIncome() {
        try {
            return ResponseEntity.ok(travelService.getAnnualIncome());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @RequestMapping(value = "/all-income", method = RequestMethod.GET)
    public ResponseEntity<Double[]> getAllIncome() {
        try {
            return ResponseEntity.ok(travelService.getAllIncome());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/get-monthly-booking", method = RequestMethod.GET)
    public ResponseEntity<Integer[]> getMonthlyBooking(@RequestParam("month") int mese) {
        try {
            return ResponseEntity.ok(travelService.getMonthlyBooking(mese));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }    }

}
