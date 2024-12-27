package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.*;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.TravelDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TravelService implements ITravelService {
    private final TravelDAO travelDAO;
    private static final String TRAVEL_IMAGES_DIR = "travelImages/";

    public TravelService() {
        this.travelDAO = DBManager.getInstance().getTravelDAO();
    }

    @Override
    public List<Travel> findAll(boolean isAdmin) {
        return travelDAO.findAll(!isAdmin ? LocalDate.now() : null);
    }

    @Override
    public List<Travel> findAllPaginated(int offset, int limit, TravelFilter filters, boolean isAdmin) {
        checkFilterValidity(filters, isAdmin);
        if (!isAdmin && filters.getStartDate() == null) {
            filters.setStartDate(LocalDate.now());
        }
        return travelDAO.findAllPaginated(offset, limit, filters);
    }

    @Override
    public Optional<Travel> findById(Long id, boolean isAdmin) {
        Travel travel = travelDAO.findById(id, !isAdmin ? LocalDate.now() : null);
        if (travel == null) {
            return Optional.empty();
        }
        return Optional.of(travel);
    }

    @Override
    public Travel createTravel(Travel travel, List<MultipartFile> travelImages) throws Exception {
        checkNotNullFields(travel);
        checkDateValidity(travel.getStartDate(), travel.getEndDate());
        checkPriceValidity(travel.getPrice(), travel.getOldPrice());
        checkParticipantValidity(travel.getMaxParticipantsNumber());
        if (travelImages == null || travelImages.isEmpty()) {
            throw new InvalidInputException("Images cannot be null");
        }
        checkNotDuplicate(travel.getId());
        travelDAO.save(travel);
        Optional<Travel> savedTravel = findById(travel.getId(), true);
        if (savedTravel.isPresent()) {
            saveTravelImages(savedTravel.get(), travelImages);
            travelDAO.save(savedTravel.get());
        }
        return savedTravel.orElse(null);
    }


    @Override
    public Travel updateTravel(Long id, Travel travel, List<MultipartFile> travelImages) throws Exception {
        if (travel == null) {
            throw new InvalidInputException("Travel cannot be null");
        }
        travel.setId(id);
        checkNotNullFields(travel);
        checkDateValidity(travel.getStartDate(), travel.getEndDate());
        checkPriceValidity(travel.getPrice(), travel.getOldPrice());
        checkParticipantValidity(travel.getMaxParticipantsNumber());
        if (travelImages != null && !travelImages.isEmpty()) {
            saveTravelImages(travel, travelImages);
        }
        Travel existingTravel = checkTravelExistence(id, true);
        if (travel.getPrice() != existingTravel.getPrice()) {
            travel.setOldPrice(existingTravel.getPrice());
        }
        travelDAO.save(travel);
        return travelDAO.findById(id, null);
    }

    @Override
    public List<byte[]> getTravelImages(Long id, boolean isAdmin) throws Exception {
        Travel travel = checkTravelExistence(id, isAdmin);
        List<String> travelImagesPaths = travel.getImagesPaths();
        if (travelImagesPaths == null || travelImagesPaths.isEmpty()) {
            throw new InvalidInputException("Travel images paths cannot be null or empty");
        }
        List<byte[]> travelImages = new ArrayList<>();
        for (String imagePath : travelImagesPaths) {
            Path path = Path.of(TRAVEL_IMAGES_DIR + id + '/' + imagePath);
            travelImages.add(Files.readAllBytes(path));
        }
        return travelImages;
    }

    @Override
    public void deleteTravel(Long id) throws Exception {
        Travel travel = checkTravelExistence(id, true);
        Long travelDirectory = travel.getId();
        File directory = new File(TRAVEL_IMAGES_DIR + travelDirectory);
        if (directory.exists()) {
            deleteExistingFiles(directory.listFiles());
        }
        this.travelDAO.delete(id);
    }

    @Override
    public int getTravelCount(TravelFilter filters, boolean isAdmin) {
        checkFilterValidity(filters, isAdmin);
        if (!isAdmin && filters.getStartDate() == null) {
            filters.setStartDate(LocalDate.now());
        }
        return travelDAO.countTravels(filters);
    }

    private void checkNotNullFields(Travel travel) {
        if (travel.getDestination() == null || travel.getDestination().isBlank()) {
            throw new InvalidInputException("Destination cannot be null");
        }
        if (travel.getStartDate() == null) {
            throw new InvalidInputException("Start date cannot be null");
        }
        if (travel.getEndDate() == null) {
            throw new InvalidInputException("End date cannot be null");
        }
        if (travel.getDescription() == null || travel.getDescription().isBlank()) {
            throw new InvalidInputException("Description cannot be null");
        }
        if (travel.getTravelType() == null) {
            throw new InvalidInputException("Type cannot be null");
        }
    }

    private void checkDateValidity(LocalDate startDate, LocalDate endDate) {
        if (startDate.isBefore(LocalDate.now())) {
            throw new InvalidInputException("Start date cannot be before today");
        }
        if (endDate.isBefore(LocalDate.now())) {
            throw new InvalidInputException("End date cannot be before today");
        }
        if (endDate.isBefore(startDate)) {
            throw new InvalidInputException("End date cannot be before start date");
        }
    }

    private void checkPriceValidity(double price, double oldPrice) {
        if (price <= 0) {
            throw new InvalidInputException("Price cannot be less than 0");
        }
        if (oldPrice < 0) {
            throw new InvalidInputException("Old price cannot be less than 0");
        }
    }

    private void checkParticipantValidity(int maxParticipantsNumber) {
        if (maxParticipantsNumber <= 0) {
            throw new InvalidInputException("Max number of participants cannot be less than 0");
        }
    }

    private void checkFilterValidity(TravelFilter filters, boolean isAdmin) {
        if (filters == null) {
            throw new InvalidInputException("Filters cannot be null");
        }
        if (!isAdmin && filters.getStartDate() != null && filters.getStartDate().isBefore(LocalDate.now())) {
            throw new InvalidInputException("Start date cannot be before today");
        }
        if (filters.getEndDate() != null && filters.getEndDate().isBefore(LocalDate.now())) {
            throw new InvalidInputException("End date cannot be before today");
        }
        if (filters.getStartDate() != null && filters.getEndDate() != null && filters.getEndDate().isBefore(filters.getStartDate())) {
            throw new InvalidInputException("End date cannot be before start date");
        }
        if (filters.getMinPrice() < 0) {
            throw new InvalidInputException("Min price cannot be less than 0");
        }
        if (filters.getMaxPrice() < 0) {
            throw new InvalidInputException("Max price cannot be less than 0");
        }
    }

    private void checkNotDuplicate(Long id) {
        if (id != null) {
            throw new TravelAlreadyExistsException("Travel already exists");
        }
    }

    private Travel checkTravelExistence(Long id, boolean isAdmin) {
        Travel existingTravel = travelDAO.findById(id, !isAdmin ? LocalDate.now() : null);
        if (existingTravel == null) {
            throw new TravelNotFoundException("Travel not found");
        }
        return existingTravel;
    }

    private void saveTravelImages(Travel travel, List<MultipartFile> travelImages) throws Exception {
        Long travelDirectory = travel.getId();
        File directory = new File(TRAVEL_IMAGES_DIR + travelDirectory);
        if (!directory.exists() && !directory.mkdirs()) {
            throw new Exception("Could not create directory");
        }
        deleteExistingFiles(directory.listFiles());
        List<String> imagesPaths = new ArrayList<>();
        for (MultipartFile travelImage : travelImages) {
            String fileName = travel.getId() + '-' + travelImage.getOriginalFilename();
            Path path = Path.of(TRAVEL_IMAGES_DIR + travelDirectory, fileName);
            Files.copy(travelImage.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            imagesPaths.add(fileName);
        }
        travel.setImagesPaths(imagesPaths);
    }

    private void deleteExistingFiles(File[] existingFiles) throws Exception {
        if (existingFiles != null) {
            for (File existingFile : existingFiles) {
                if (!existingFile.delete()) {
                    throw new Exception("Could not delete existing file: " + existingFile.getName());
                }
            }
        }
    }
}
