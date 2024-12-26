package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/open/v1")
public class TravelController {
    private final ITravelService travelService;

    public TravelController(ITravelService travelService) {
        this.travelService = travelService;
    }

    @RequestMapping(value = "/travels", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getAllTravels() {
        try {
            List<Travel> travels = travelService.findAll();
            return ResponseEntity.ok().body(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequestMapping(value = "/travels-paginated", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getAllTravelsPaginated(@RequestParam("offset") int offset, @RequestParam("limit") int limit) {
        try {
            List<Travel> travels = travelService.findAllPaginated(offset, limit);
            return ResponseEntity.ok().body(travels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/travel", method = RequestMethod.GET)
    public ResponseEntity<Travel> getTravel(@RequestParam("id") Long id) {
        try {
            Optional<Travel> travel = travelService.findById(id);
            return travel.map(value -> ResponseEntity.ok().body(value)).orElseGet(() -> ResponseEntity.badRequest().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/travels-count", method = RequestMethod.GET)
    public ResponseEntity<Integer> getTravelCount() {
        try {
            int travelCount = travelService.getTravelCount();
            return ResponseEntity.ok().body(travelCount);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/travel-images", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<byte[]>> getTravelImages(@RequestParam("id") Long id) {
        try {
            List<byte[]> imagesBytes = this.travelService.getTravelImages(id);
            return ResponseEntity.ok()
                    .body(imagesBytes);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (TravelNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
