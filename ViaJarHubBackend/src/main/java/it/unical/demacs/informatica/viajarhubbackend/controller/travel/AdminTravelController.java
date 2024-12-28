package it.unical.demacs.informatica.viajarhubbackend.controller.travel;


import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelRequest;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/v1")
public class AdminTravelController extends TravelController {

    public AdminTravelController(ITravelService travelService) {
        super(travelService);
    }

    @Override
    public boolean isAdmin() {
        return true;
    }

    @RequestMapping(value = "/travels", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getAllTravels() {
        return super.getAllTravels();
    }

    @RequestMapping(value = "/travels-paginated", method = RequestMethod.POST)
    public ResponseEntity<List<Travel>> getAllTravelsPaginated(@RequestBody TravelRequest travelRequest) {
        return super.getAllTravelsPaginated(travelRequest);
    }

    @RequestMapping(value = "/travel", method = RequestMethod.GET)
    public ResponseEntity<Travel> getTravel(@RequestParam("id") Long id) {
        return super.getTravel(id);
    }

    @RequestMapping(value = "/suggestions", method = RequestMethod.POST)
    public ResponseEntity<List<String>> getSuggestions(@RequestBody TravelFilter filters) {
        return super.getSuggestions(filters);
    }

    @RequestMapping(value = "/travels-count", method = RequestMethod.POST)
    public ResponseEntity<Integer> getTravelCount(@RequestBody TravelRequest travelRequest) {
        return super.getTravelCount(travelRequest);
    }

    @RequestMapping(value = "/travel-images", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<byte[]>> getTravelImages(@RequestParam("id") Long id) {
        return super.getTravelImages(id);
    }

    @RequestMapping(value = "/create-travel", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createTravel(@RequestPart Travel travel, @RequestParam List<MultipartFile> travelImages) {
        return super.createTravel(travel, travelImages);
    }

    @RequestMapping(value = "/update-travel", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateTravel(@RequestParam("id") Long id, @RequestPart Travel travel, @RequestParam(required = false) List<MultipartFile> travelImages) {
        return super.updateTravel(id, travel, travelImages);
    }

    @RequestMapping(value = "/delete-travel", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteTravel(@RequestParam("id") Long id) {
        return super.deleteTravel(id);
    }
}
