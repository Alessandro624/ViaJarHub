package it.unical.demacs.informatica.viajarhubbackend.persistence.DAO;

import it.unical.demacs.informatica.viajarhubbackend.model.Travel;
import it.unical.demacs.informatica.viajarhubbackend.model.TravelFilter;

import java.util.List;

public interface TravelDAO {
    List<Travel> findAll();

    List<Travel> findAllPaginated(int offset, int limit, TravelFilter filters);

    Travel findById(Long id);

    void save(Travel travel);

    void delete(Long id);

    int countTravels(TravelFilter filters);
}
