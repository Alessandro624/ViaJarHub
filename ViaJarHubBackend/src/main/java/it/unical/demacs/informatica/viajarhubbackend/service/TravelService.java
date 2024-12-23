package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.exception.*;
import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DAO.TravelDAO;
import it.unical.demacs.informatica.viajarhubbackend.persistence.DBManager;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TravelService implements ITravelService {
    // TODO gestione messaggi di errore da usare nel FRONTEND
    private final TravelDAO travelDAO;
    private static final String TRAVEL_IMAGES_DIR = "travelImages/";

    public TravelService() {
        this.travelDAO = DBManager.getInstance().getTravelDAO();
    }

    @Override
    public Optional<Travel> findById(Long id) {
        Travel travel = travelDAO.findById(id);
        if (travel == null) {
            return Optional.empty();
        }
        return Optional.of(travel);
    }

    @Override
    public Travel createTravel(Travel travel) {
        checkNotNullFields(travel);
        checkNotDuplicate(travel.getId());
        travelDAO.save(travel);
        Optional<Travel> savedTravel = findById(travel.getId());
        return savedTravel.orElse(null);
    }

    @Override
    public Travel updateTravel(Long id, Travel travel, List<MultipartFile> travelImages) throws Exception {
        if (travel == null) {
            throw new InvalidInputException("Travel cannot be null");
        }
        travel.setId(id);
        checkNotNullFields(travel);
        if (travelImages != null && !travelImages.isEmpty()) {
            saveTravelImages(travel, travelImages);
        }
        travelDAO.save(travel);
        return travelDAO.findById(id);
    }

    @Override
    public List<byte[]> getTravelImages(Long id) throws Exception {
        Travel travel = checkTravelExistence(id);
        List<String> travelImagesPaths = travel.getImagesPaths();
        if (travelImagesPaths == null || travelImagesPaths.isEmpty()) {
            throw new IllegalArgumentException("Travel images paths cannot be null or empty");
        }
        List<byte[]> travelImages = new ArrayList<>();
        for (String imagePath : travelImagesPaths) {
            Path path = Path.of(TRAVEL_IMAGES_DIR + imagePath);
            travelImages.add(Files.readAllBytes(path));
        }
        return travelImages;
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
        if (travel.getImagesPaths() == null || travel.getImagesPaths().isEmpty()) {
            throw new InvalidInputException("Images cannot be null");
        }
    }

    private void checkNotDuplicate(Long id) {
        if (travelDAO.findById(id) != null) {
            throw new TravelAlreadyExistsException("Travel already exists");
        }
    }

    private Travel checkTravelExistence(Long id) {
        Travel existingTravel = travelDAO.findById(id);
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
