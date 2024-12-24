package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface ITravelService {
    List<Travel> findAll();

    List<Travel> findAllPaginated(int offset, int limit);

    Optional<Travel> findById(Long id);

    Travel createTravel(Travel travel, List<MultipartFile> travelImages) throws Exception;

    Travel updateTravel(Long id, Travel travel, List<MultipartFile> travelImages) throws Exception;

    List<byte[]> getTravelImages(Long id) throws Exception;

    void deleteTravel(Long id) throws Exception;

    int getTravelCount();
}
