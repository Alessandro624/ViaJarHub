package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ITravelService {
    List<Travel> findAll(boolean isAdmin);

    List<Travel> findAllPaginated(int offset, int limit, TravelFilter filters, boolean isAdmin);

    Optional<Travel> findById(Long id, boolean isAdmin);

    List<String> getSuggestions(TravelFilter filters, boolean isAdmin);

    double getAvgStars(Long id, boolean isAdmin);

    Travel createTravel(Travel travel, List<MultipartFile> travelImages) throws Exception;

    Travel updateTravel(Long id, Travel travel, List<MultipartFile> travelImages) throws Exception;

    List<byte[]> getTravelImages(Long id, boolean isAdmin) throws Exception;

    void deleteTravel(Long id) throws Exception;

    int getTravelCount(TravelFilter filters, boolean isAdmin);

    int getAvailableSeats(Long id, LocalDate startDate, LocalDate endDate);
}
