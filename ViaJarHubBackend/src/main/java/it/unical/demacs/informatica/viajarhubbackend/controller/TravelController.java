package it.unical.demacs.informatica.viajarhubbackend.controller;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/travels-paginated", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getAllTravelsPaginated(@RequestParam("offset") int offset, @RequestParam("limit") int limit) {
        try {
            List<Travel> travels = travelService.findAllPaginated(offset, limit);
            return ResponseEntity.ok().body(travels);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/travel", method = RequestMethod.GET)
    public ResponseEntity<Travel> getTravel(@RequestParam("id") Long id) {
        try {
            Optional<Travel> travel = travelService.findById(id);
            return travel.map(value -> ResponseEntity.ok().body(value)).orElseGet(() -> ResponseEntity.badRequest().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @RequestMapping(value = "/create-travel", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createTravel(@RequestPart Travel travel, @RequestParam List<MultipartFile> travelImages) {
        try {
            Travel createdTravel = travelService.createTravel(travel, travelImages);
            if (createdTravel == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
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
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
