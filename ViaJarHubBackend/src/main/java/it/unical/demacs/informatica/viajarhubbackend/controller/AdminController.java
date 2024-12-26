package it.unical.demacs.informatica.viajarhubbackend.controller;


import it.unical.demacs.informatica.viajarhubbackend.exception.InvalidInputException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelAlreadyExistsException;
import it.unical.demacs.informatica.viajarhubbackend.exception.TravelNotFoundException;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.service.ITravelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/v1")
public class AdminController {
    private final ITravelService travelService;

    public AdminController(ITravelService travelService) {
        this.travelService = travelService;
    }

    @RequestMapping(value = "/create-travel", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createTravel(@RequestPart Travel travel, @RequestParam List<MultipartFile> travelImages) {
        try {
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

    @RequestMapping(value = "/update-travel", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateTravel(@RequestParam("id") Long id, @RequestPart Travel travel, @RequestParam(required = false) List<MultipartFile> travelImages) {
        try {
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

    @RequestMapping(value = "/delete-travel", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteTravel(@RequestParam("id") Long id) {
        try {
            travelService.deleteTravel(id);
            return ResponseEntity.ok().build();
        } catch (TravelNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
