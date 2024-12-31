package it.unical.demacs.informatica.viajarhubbackend.controller.travel;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelRequest;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/open/v1")
public class OpenTravelController extends TravelController {

    public OpenTravelController(ITravelService travelService) {
        super(travelService);
    }

    @Override
    public boolean isAdmin() {
        return false;
    }

    @Override
    @RequestMapping(value = "/travels", method = RequestMethod.GET)
    public ResponseEntity<List<Travel>> getAllTravels() {
        return super.getAllTravels();
    }

    @Override
    @RequestMapping(value = "/travels-paginated", method = RequestMethod.POST)
    public ResponseEntity<List<Travel>> getAllTravelsPaginated(@RequestBody TravelRequest travelRequest) {
        return super.getAllTravelsPaginated(travelRequest);
    }

    @Override
    @RequestMapping(value = "/travel", method = RequestMethod.GET)
    public ResponseEntity<Travel> getTravel(@RequestParam("id") Long id) {
        return super.getTravel(id);
    }

    @Override
    @RequestMapping(value = "/suggestions", method = RequestMethod.POST)
    public ResponseEntity<List<String>> getSuggestions(@RequestBody TravelFilter filters) {
        return super.getSuggestions(filters);
    }

    @Override
    @RequestMapping(value = "/stars", method = RequestMethod.GET)
    public ResponseEntity<Double> getStars(@RequestParam("id") Long id) {
        return super.getStars(id);
    }

    @Override
    @RequestMapping(value = "/travels-count", method = RequestMethod.POST)
    public ResponseEntity<Integer> getTravelCount(@RequestBody TravelRequest travelRequest) {
        return super.getTravelCount(travelRequest);
    }

    @Override
    @RequestMapping(value = "/travel-images", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<byte[]>> getTravelImages(@RequestParam("id") Long id) {
        return super.getTravelImages(id);
    }
    @Override
    @RequestMapping(value = "/name", method = RequestMethod.GET)
    public ResponseEntity<List<String>> getName(@RequestParam("id") Long id) {
        return super.getName(id);
    }
}
