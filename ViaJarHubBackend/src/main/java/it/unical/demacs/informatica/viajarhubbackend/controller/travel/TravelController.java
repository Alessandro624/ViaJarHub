package it.unical.demacs.informatica.viajarhubbackend.controller.travel;

import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelAlreadyExistsException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelRequest;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import lombok.Getter;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Getter
@RestController
public abstract class TravelController {
    private final ITravelService travelService;

    public TravelController(ITravelService travelService) {
        this.travelService = travelService;
    }

    public abstract boolean isAdmin();

    public ResponseEntity<List<Travel>> getAllTravels() {
        try {
            List<Travel> travels = travelService.findAll(isAdmin());
            return ResponseEntity.ok().body(travels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<List<Travel>> getAllTravelsPaginated(TravelRequest travelRequest) {
        try {
            List<Travel> travels = travelService.findAllPaginated(travelRequest.getOffset(), travelRequest.getLimit(), travelRequest.getFilters(), isAdmin());
            return ResponseEntity.ok().body(travels);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Travel> getTravel(Long id) {
        try {
            Optional<Travel> travel = travelService.findById(id, isAdmin());
            return travel.map(value -> ResponseEntity.ok().body(value)).orElseGet(() -> ResponseEntity.badRequest().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<List<String>> getSuggestions(TravelFilter filters) {
        try {
            List<String> suggestions = travelService.getSuggestions(filters, isAdmin());
            return ResponseEntity.ok(suggestions);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Double> getStars(Long id) {
        try {
            return ResponseEntity.ok(travelService.getAvgStars(id, isAdmin()));
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (TravelNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Integer> getTravelCount(TravelRequest travelRequest) {
        try {
            int travelCount = travelService.getTravelCount(travelRequest.getFilters(), isAdmin());
            return ResponseEntity.ok().body(travelCount);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Integer> getAvailableSeats(Travel travel) {
        try {
            int availableSeats = travelService.getAvailableSeats(travel.getId(), travel.getStartDate(), travel.getEndDate());
            return ResponseEntity.ok().body(availableSeats);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<List<byte[]>> getTravelImages(Long id) {
        try {

            List<byte[]> imagesBytes = this.travelService.getTravelImages(id, isAdmin());
            return ResponseEntity.ok()
                    .body(imagesBytes);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (TravelNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Void> createTravel(Travel travel, List<MultipartFile> travelImages) {
        try {
            if (!isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            travel.setId(null);
            travel.setImagesPaths(new ArrayList<>());
            Travel createdTravel = travelService.createTravel(travel, travelImages);
            if (createdTravel == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (TravelAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Void> updateTravel(Long id, Travel travel, List<MultipartFile> travelImages) {
        try {
            if (!isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Travel updatedTravel = this.travelService.updateTravel(id, travel, travelImages);
            if (updatedTravel == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok().build();
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (TravelNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Void> deleteTravel(Long id) {
        try {
            if (!isAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            travelService.deleteTravel(id);
            return ResponseEntity.ok().build();
        } catch (TravelNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    public ResponseEntity<List<String>> getName(Long id) {
        try {
            List<String > nome=new ArrayList<>();

            nome.add(travelService.getName(id));
            return ResponseEntity.ok(nome);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    protected ResponseEntity<List<Long>> getMaxPrice() {
        try {
            List<Long> prezzo=new ArrayList<>();

            prezzo.add(travelService.getMaxPrice(isAdmin()));
            return ResponseEntity.ok(prezzo);
        } catch (InvalidInputException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
