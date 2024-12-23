package it.unical.demacs.informatica.viajarhubbackend.service;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface ITravelService {
    Optional<Travel> findById(Long id);

    Travel createTravel(Travel travel);

    Travel updateTravel(Long id, Travel travel, List<MultipartFile> travelImages) throws Exception;

    List<byte[]> getTravelImages(Long id) throws Exception;
}
